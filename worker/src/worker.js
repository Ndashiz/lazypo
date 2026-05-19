/* ═════════════════════════════════════════════════════════════════════
   LazyPO — Cloudflare Worker auth gate (ES256 / JWKS)
   ─────────────────────────────────────────────────────────────────────
   Sits in front of GitHub Pages on ndashiz.be/lazypo/*. Verifies that
   incoming requests carry a valid Supabase access_token in a cookie
   named `lazypo_jwt`. On failure, redirects to /lazypo/login.html.

   Supabase signs access_tokens with ES256 using asymmetric signing keys.
   This Worker fetches the project's public JWKS once, caches it for 1h,
   and verifies signatures locally — no round-trip to Supabase per
   request. JWT validity results are also cached 60s per token.

   Public paths bypass the gate:
     • /lazypo/login.html, /lazypo/email_confirm.html,
       /lazypo/spotify-callback.html
     • All static assets (.js, .css, .svg, .ico, fonts, images, maps)

   Configuration (set in wrangler.toml [vars], NOT as secrets — both are
   public values, already in client code):
     • SUPABASE_PROJECT_REF — e.g. "hrvxhnmtvzvrsmmmmtsv"

   Failure modes — all redirect to /lazypo/login.html with a 302:
     • missing cookie
     • cookie value is not a valid JWT shape
     • JWT alg not ES256
     • kid not found in JWKS
     • Signature invalid
     • JWT expired
     • Unexpected exception (fail-closed)
═════════════════════════════════════════════════════════════════════ */

const LOGIN_PATH = '/lazypo/login.html';
const APP_PREFIX = '/lazypo/';
const COOKIE_NAME = 'lazypo_jwt';

const PUBLIC_PAGES = new Set([
  '/lazypo/login.html',
  '/lazypo/email_confirm.html',
  '/lazypo/spotify-callback.html',
]);

const PUBLIC_EXTENSIONS = /\.(js|css|svg|ico|png|jpg|jpeg|gif|webp|woff2?|ttf|map)$/i;

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      if (!path.startsWith(APP_PREFIX)) return fetch(request);
      if (isPublicPath(path)) return fetch(request);

      const jwt = readCookie(request.headers.get('Cookie') || '', COOKIE_NAME);
      if (!jwt) return redirectToLogin(url);

      const valid = await verifyJwt(jwt, env, ctx);
      if (!valid) return redirectToLogin(url);

      return fetch(request);
    } catch (err) {
      // Fail closed. Never leak the underlying page.
      console.error('[lazypo-worker] error:', err && err.stack || err);
      return redirectToLogin(new URL(request.url));
    }
  },
};

/* ── Routing ─────────────────────────────────────────────────────── */

function isPublicPath(path) {
  if (PUBLIC_PAGES.has(path)) return true;
  if (PUBLIC_EXTENSIONS.test(path)) return true;
  return false;
}

function redirectToLogin(originalUrl) {
  const loc = new URL(LOGIN_PATH, originalUrl.origin);
  const target = originalUrl.pathname + originalUrl.search;
  if (target && target !== LOGIN_PATH) {
    loc.searchParams.set('return_to', target);
  }
  return new Response(null, {
    status: 302,
    headers: {
      'Location': loc.toString(),
      'Cache-Control': 'no-store',
      'X-LazyPO-Gate': 'redirect',
    },
  });
}

/* ── Cookie ──────────────────────────────────────────────────────── */

function readCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const prefix = name + '=';
  for (const part of cookieHeader.split(/;\s*/)) {
    if (part.startsWith(prefix)) {
      try { return decodeURIComponent(part.slice(prefix.length)); }
      catch { return null; }
    }
  }
  return null;
}

/* ── JWT verification (ES256 via JWKS) ──────────────────────────── */

async function verifyJwt(token, env, ctx) {
  if (!env.SUPABASE_PROJECT_REF) {
    console.error('[lazypo-worker] SUPABASE_PROJECT_REF is not configured');
    return false;
  }

  // Token-level cache: identical JWT seen in the last 60s → reuse result.
  const tokenCacheKey = new Request('https://lazypo-jwt-cache/' + token.slice(-24));
  const cache = caches.default;
  const cached = await cache.match(tokenCacheKey);
  if (cached) return cached.status === 200;

  let valid = false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [headerB64, payloadB64, sigB64] = parts;

    const header = JSON.parse(b64urlString(headerB64));
    if (header.alg !== 'ES256') return false;
    if (!header.kid) return false;

    const payload = JSON.parse(b64urlString(payloadB64));
    if (typeof payload.exp !== 'number') return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;
    if (!payload.sub) return false;

    // Fetch JWKS (1h cache). On a miss, refetch — handles key rotation.
    const jwks = await getJwks(env.SUPABASE_PROJECT_REF, ctx);
    const jwk = jwks.keys.find(k => k.kid === header.kid);
    if (!jwk) {
      // kid not in current JWKS — refresh once in case Supabase just rotated.
      const fresh = await getJwks(env.SUPABASE_PROJECT_REF, ctx, /*forceRefresh*/ true);
      const jwk2 = fresh.keys.find(k => k.kid === header.kid);
      if (!jwk2) return false;
      valid = await verifySignature(jwk2, headerB64, payloadB64, sigB64);
    } else {
      valid = await verifySignature(jwk, headerB64, payloadB64, sigB64);
    }
  } catch (err) {
    console.warn('[lazypo-worker] JWT verification error:', err && err.message);
    valid = false;
  }

  // Cache verdict (positive AND negative) for 60s.
  const verdict = new Response(valid ? 'ok' : 'bad', {
    status: valid ? 200 : 401,
    headers: { 'Cache-Control': 'max-age=60' },
  });
  ctx.waitUntil(cache.put(tokenCacheKey, verdict));
  return valid;
}

async function verifySignature(jwk, headerB64, payloadB64, sigB64) {
  const key = await crypto.subtle.importKey(
    'jwk',
    { ...jwk, alg: 'ES256', ext: true, key_ops: ['verify'] },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify'],
  );
  const data = new TextEncoder().encode(headerB64 + '.' + payloadB64);
  const sig = b64urlBytes(sigB64);
  // JWS ES256 signatures are r||s raw (64 bytes for P-256), which is what
  // Web Crypto's ECDSA verify expects directly — no DER reformatting.
  return crypto.subtle.verify(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    key,
    sig,
    data,
  );
}

async function getJwks(projectRef, ctx, forceRefresh) {
  const url = `https://${projectRef}.supabase.co/auth/v1/.well-known/jwks.json`;
  const cacheKey = new Request('https://lazypo-jwks-cache/' + projectRef);
  const cache = caches.default;

  if (!forceRefresh) {
    const cached = await cache.match(cacheKey);
    if (cached) return await cached.json();
  }

  const resp = await fetch(url, { cf: { cacheTtl: 3600, cacheEverything: true } });
  if (!resp.ok) throw new Error('JWKS fetch failed: HTTP ' + resp.status);
  const body = await resp.text();
  // Sanity check it's JSON with a keys array before caching.
  const parsed = JSON.parse(body);
  if (!parsed || !Array.isArray(parsed.keys)) {
    throw new Error('JWKS response missing `keys` array');
  }
  ctx.waitUntil(cache.put(cacheKey, new Response(body, {
    headers: { 'Cache-Control': 'max-age=3600', 'Content-Type': 'application/json' },
  })));
  return parsed;
}

/* ── base64url helpers ───────────────────────────────────────────── */

function b64urlString(b64url) {
  return new TextDecoder().decode(b64urlBytes(b64url));
}

function b64urlBytes(b64url) {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
