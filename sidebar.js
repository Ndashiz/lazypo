/**
 * sidebar.js — Composant sidebar LazyPO
 *
 * Comportement :
 *  - Réduit (64px) par défaut → icônes seulement
 *  - Élargi (260px) au survol → icônes + labels visibles
 *  - Description de l'item visible au survol de l'item (sidebar déjà élargie)
 *  - Pas de badge de statut — tous les items ont le même style
 */
(function () {

  /* ═══════════════════════════════════════════════════
     CONFIG
  ═══════════════════════════════════════════════════ */
  const ITEMS = [
    {
      id: 'home',
      icon: '🏠',
      label: 'Home',
      url: 'index.html',
      desc: 'Back to the LazyPO main page.'
    },
    { divider: true },
    {
      id: 'scope',
      icon: '✉️',
      label: 'Scope of Work',
      url: 'lazypo_generator.html',
      locked: true,
      desc: 'Generate professional Scope of Work emails. Export as .eml ready for Outlook.'
    },
    {
      id: 'sprint',
      icon: '📋',
      label: 'Sprint Planning',
      url: 'sprintplanner.html',
      locked: true,
      desc: 'Plan your sprints and auto-generate your presentation slides.'
    },
    {
      id: 'jira',
      icon: '🎫',
      label: 'Jira',
      url: 'jirarepo.html',
      locked: true,
      desc: 'Create and manage your Jira queries without leaving your workflow.'
    },
    {
      id: 'livenote',
      icon: '📝',
      label: 'LiveNote',
      url: 'livenote.html',
      locked: true,
      desc: 'Éditeur collaboratif en temps réel — écrivez ensemble, instantanément.'
    },
    {
      id: 'minutehub',
      icon: '📝',
      label: 'Minute Hub',
      url: null,
      locked: true,
      desc: 'Centralise all your meeting notes in one click.'
    },
    {
      id: 'quiz',
      icon: '🧠',
      label: 'Knowledge Quiz',
      url: 'quiz.html',
      desc: 'Build your EN/NL vocabulary with spaced repetition quizzes.'
    },
    {
      id: 'focusfm',
      icon: '🎵',
      label: 'Focus FM',
      url: null,
      onClick: "window.FocusFM?.open()",
      locked: true,
      desc: 'Spotify integration — play your playlists without leaving the app.'
    },
    { divider: true },
    {
      id: 'feedback',
      icon: '💡',
      label: 'Feedback',
      url: 'feedback.html',
      desc: 'Suggest improvements, vote on ideas, follow what\'s coming next.'
    },
    { divider: true },
    {
      id: 'account',
      icon: '👤',
      label: 'My Account',
      url: 'account.html',
      desc: 'Manage your profile, avatar and password.'
    },
    {
      id: 'admin',
      icon: '🛡️',
      label: 'Admin',
      url: 'admin.html',
      adminOnly: true,
      desc: 'Gérer les demandes d\'accès aux features et les utilisateurs.'
    }
  ];

  /* ═══════════════════════════════════════════════════
     ACTIVE PAGE DETECTION
  ═══════════════════════════════════════════════════ */
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  function isActive(item) {
    if (!item.url) return false;
    return item.url === currentFile || (currentFile === '' && item.url === 'index.html');
  }

  /* ═══════════════════════════════════════════════════
     CSS
  ═══════════════════════════════════════════════════ */
  const css = `
    /* ── Shell ── */
    .sb {
      position: fixed; left: 0; top: 0; height: 100vh;
      width: 64px;
      background: #111111;
      border-right: 1px solid #222222;
      z-index: 200;
      overflow: hidden;
      display: flex; flex-direction: column;
      padding: 24px 0 20px;
      transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sb:hover { width: 260px; }

    /* Subtle blue line on right edge */
    .sb::after {
      content: '';
      position: absolute; top: 15%; right: -1px; bottom: 15%;
      width: 1px;
      background: linear-gradient(to bottom, transparent, rgba(59,130,246,0.35), transparent);
      pointer-events: none;
    }

    /* ── Logo ── */
    .sb-logo-wrap {
      display: flex; align-items: center;
      height: 44px; margin-bottom: 28px;
      padding: 0 16px;
      min-width: 260px; /* prevent shrinking inside overflow:hidden */
      text-decoration: none;
      flex-shrink: 0;
    }
    .sb-logo-star {
      font-family: 'Permanent Marker', cursive;
      font-size: 24px; color: #60a5fa;
      width: 32px; flex-shrink: 0; text-align: center; display: block;
      text-shadow: 0 0 12px rgba(96,165,250,0.4);
    }
    .sb-logo-name {
      font-family: 'Permanent Marker', cursive;
      font-size: 24px; color: #fff; letter-spacing: 1px;
      text-shadow: 2px 2px 0 rgba(59,130,246,0.4);
      margin-left: 10px;
      opacity: 0;
      transition: opacity 0.18s ease 0.06s;
      white-space: nowrap;
    }
    .sb:hover .sb-logo-name { opacity: 1; }

    /* ── Nav list ── */
    .sb-nav {
      display: flex; flex-direction: column;
      gap: 2px; padding: 0 8px;
    }

    /* ── Divider ── */
    .sb-divider {
      height: 1px; background: #1e1e1e;
      margin: 8px 8px;
      min-width: 244px;
      opacity: 0;
      transition: opacity 0.18s ease;
    }
    .sb:hover .sb-divider { opacity: 1; }

    /* ── Item wrapper ── */
    .sb-item { position: relative; min-width: 244px; }

    /* ── Link / Button row ── */
    .sb-item-link {
      display: flex; align-items: center;
      gap: 12px; padding: 8px 8px;
      color: #5a5a5a; font-size: 14px; font-weight: 500;
      text-decoration: none; border: none; background: none;
      border-radius: 8px; cursor: pointer;
      width: 100%; text-align: left;
      transition: color 0.15s, background 0.15s;
      position: relative;
      min-width: 244px;
      font-family: 'DM Sans', sans-serif;
    }
    .sb-item:hover .sb-item-link {
      color: #f0f0f0; background: #1a1a1a;
    }
    .sb-item.active .sb-item-link {
      color: #f0f0f0; background: #1c1c1c;
    }
    /* Active left bar */
    .sb-item.active .sb-item-link::before {
      content: '';
      position: absolute; left: -8px; top: 18%; bottom: 18%;
      width: 2px; background: #60a5fa; border-radius: 2px;
      box-shadow: 0 0 8px rgba(96,165,250,0.7);
    }

    /* ── Icon ── */
    .sb-icon {
      width: 32px; height: 32px; border-radius: 8px;
      background: #232323;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; flex-shrink: 0;
      transition: background 0.15s;
    }
    .sb-item.active .sb-icon { background: rgba(59,130,246,0.14); }
    .sb-item:hover   .sb-icon { background: #2a2a2a; }

    /* ── Label ── */
    .sb-label {
      opacity: 0;
      transition: opacity 0.18s ease 0.06s;
      white-space: nowrap; overflow: hidden;
      flex: 1;
    }
    .sb:hover .sb-label { opacity: 1; }

    /* ── Description (visible on item hover when sidebar is expanded) ── */
    .sb-desc {
      max-height: 0; overflow: hidden;
      padding: 0 8px 0 52px; /* aligned under label */
      font-size: 11.5px; color: #555; line-height: 1.5;
      transition: max-height 0.22s ease, padding-bottom 0.22s ease, color 0.22s;
      white-space: normal;
      min-width: 244px;
    }
    .sb:hover .sb-item:hover .sb-desc {
      max-height: 56px; padding-bottom: 8px; color: #777;
    }

    /* ── Spacer + Footer ── */
    .sb-spacer { flex: 1; }
    .sb-footer {
      display: flex; align-items: center;
      padding: 0 16px; gap: 10px;
      min-width: 244px;
    }
    .sb-footer-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #60a5fa; box-shadow: 0 0 6px rgba(96,165,250,0.6);
      animation: sb-pulse 2.5s ease infinite; flex-shrink: 0;
    }
    @keyframes sb-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.45; transform: scale(0.65); }
    }
    .sb-footer-text {
      font-size: 12px; color: #4a4a4a; white-space: nowrap;
      opacity: 0; transition: opacity 0.18s ease;
    }
    .sb-footer-text strong { color: #555; }
    .sb:hover .sb-footer-text { opacity: 1; }

    /* ── Mobile burger ── */
    .sb-burger {
      display: none;
      position: fixed; top: 16px; left: 16px; z-index: 300;
      width: 40px; height: 40px; border-radius: 10px;
      background: #1c1c1c; border: 1px solid #2a2a2a;
      cursor: pointer; align-items: center; justify-content: center;
      flex-direction: column; gap: 5px;
    }
    .sb-burger span {
      display: block; width: 18px; height: 2px;
      background: #f0f0f0; border-radius: 2px;
      transition: all 0.25s ease;
    }
    .sb-burger.open span:nth-child(1) { transform: rotate(45deg) translate(2.5px, 2.5px); }
    .sb-burger.open span:nth-child(2) { opacity: 0; }
    .sb-burger.open span:nth-child(3) { transform: rotate(-45deg) translate(2.5px, -2.5px); }

    .sb-overlay {
      display: none; position: fixed; inset: 0; z-index: 190;
      background: rgba(0,0,0,0.55); backdrop-filter: blur(3px);
    }
    .sb-overlay.open { display: block; }

    .sb-close-btn {
      display: none;
      position: absolute; top: 14px; right: 14px;
      width: 30px; height: 30px; border-radius: 7px;
      background: #1c1c1c; border: 1px solid #2a2a2a;
      cursor: pointer; align-items: center; justify-content: center;
      color: #666; font-size: 14px;
    }

    /* ── Body offset (desktop) — donne de la place à la sidebar fixe ── */
    @media (min-width: 769px) {
      body { padding-left: 64px !important; }
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .sb {
        transform: translateX(-100%);
        width: 260px !important; /* always full width on mobile */
        transition: transform 0.28s ease;
      }
      .sb.open { transform: translateX(0); }
      .sb-burger     { display: flex; }
      .sb-close-btn  { display: flex; }
      /* Labels and desc always visible on mobile */
      .sb-logo-name,
      .sb-label,
      .sb-footer-text,
      .sb-divider { opacity: 1 !important; }
      .sb.open .sb-item:hover .sb-desc { max-height: 56px; padding-bottom: 8px; color: #777; }
    }

    /* ── Slide-in animation ── */
    .sb-item { animation: sb-in 0.38s ease both; }
    .sb-item:nth-child(1) { animation-delay: 0.04s; }
    .sb-item:nth-child(2) { animation-delay: 0.08s; }
    .sb-item:nth-child(3) { animation-delay: 0.12s; }
    .sb-item:nth-child(4) { animation-delay: 0.16s; }
    .sb-item:nth-child(5) { animation-delay: 0.20s; }
    .sb-item:nth-child(6) { animation-delay: 0.24s; }
    @keyframes sb-in {
      from { opacity: 0; transform: translateX(-10px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.id = 'sb-styles';
  styleEl.textContent = css + `
    /* ── Admin-only items: hidden until profile confirms is_admin ── */
    .sb-admin-only { display: none; }
    .sb-admin-only.sb-admin-visible { display: block; }
    /* Subtle gold tint for admin item icon */
    .sb-admin-only.sb-admin-visible .sb-icon { background: rgba(251,191,36,.10); }
    .sb-admin-only.sb-admin-visible .sb-item-link { color: #6b6b4a; }
    .sb-admin-only.sb-admin-visible:hover .sb-item-link { color: #fef3c7; }
    .sb-admin-only.sb-admin-visible:hover .sb-icon { background: rgba(251,191,36,.18); }

    /* ── Locked feature : padlock icon + dimmed style ── */
    .sb-item .sb-lock {
      margin-left: auto; font-size: 12px; color: #5a5a5a; flex-shrink: 0;
      opacity: 0; transition: opacity 0.18s ease 0.06s;
    }
    .sb:hover .sb-item .sb-lock { opacity: 1; }
    .sb-item.sb-locked .sb-item-link { color: #4a4a4a; cursor: pointer; }
    .sb-item.sb-locked .sb-icon { background: #1a1a1a; opacity: 0.55; }
    .sb-item.sb-locked:hover .sb-item-link { color: #777; background: #181818; }
    .sb-item.sb-locked .sb-lock-pending { color: #fbbf24; }
    .sb-item.sb-locked .sb-lock-rejected { color: #f87171; }
    .sb-item.sb-unlocked .sb-lock { display: none; }

    /* ── Access request modal ── */
    .sb-ar-overlay {
      position: fixed; inset: 0; z-index: 9100;
      background: rgba(0,0,0,0.65); backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      opacity: 0; pointer-events: none;
      transition: opacity 0.2s ease;
      font-family: 'DM Sans', sans-serif;
    }
    .sb-ar-overlay.open { opacity: 1; pointer-events: all; }
    .sb-ar-modal {
      background: #161616; border: 1px solid #2a2a2a;
      border-radius: 16px; max-width: 420px; width: 100%;
      padding: 28px 28px 22px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.6);
      transform: translateY(12px) scale(0.98);
      transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
    }
    .sb-ar-overlay.open .sb-ar-modal { transform: translateY(0) scale(1); }
    .sb-ar-icon {
      width: 52px; height: 52px; border-radius: 14px;
      background: rgba(251,191,36,.12); border: 1px solid rgba(251,191,36,.22);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 18px; font-size: 22px;
    }
    .sb-ar-title {
      font-size: 17px; font-weight: 700; color: #f0f0f0;
      text-align: center; margin-bottom: 8px;
    }
    .sb-ar-msg {
      font-size: 13px; color: #6b6b6b; line-height: 1.6;
      text-align: center; margin-bottom: 22px;
    }
    .sb-ar-msg strong { color: #f0f0f0; font-weight: 600; }
    .sb-ar-actions { display: flex; gap: 10px; }
    .sb-ar-btn {
      flex: 1; padding: 11px 14px; border-radius: 10px;
      font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.15s; border: 1px solid transparent;
    }
    .sb-ar-btn.cancel {
      background: transparent; border-color: #2a2a2a; color: #f0f0f0;
    }
    .sb-ar-btn.cancel:hover { background: #1c1c1c; }
    .sb-ar-btn.primary {
      background: #3b82f6; color: #fff;
    }
    .sb-ar-btn.primary:hover { background: #2563eb; }
    .sb-ar-btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .sb-ar-status {
      font-size: 12px; padding: 10px 14px; border-radius: 8px;
      margin-bottom: 18px; line-height: 1.5;
    }
    .sb-ar-status.pending {
      background: rgba(251,191,36,.10); border: 1px solid rgba(251,191,36,.25);
      color: #fbbf24;
    }
    .sb-ar-status.rejected {
      background: rgba(239,68,68,.10); border: 1px solid rgba(239,68,68,.25);
      color: #f87171;
    }
  `;
  document.head.appendChild(styleEl);

  /* ─────────────────────────────────────────────────
     ACCESS STATE — populated by auth.js after profile
  ───────────────────────────────────────────────── */
  // Map<feature_id, 'pending' | 'granted' | 'rejected'>
  const featureAccess = new Map();
  let isAdminUser = false;

  function applyAccessToSidebar() {
    document.querySelectorAll('[data-sb-id]').forEach(el => {
      const id = el.dataset.sbId;
      const item = ITEMS.find(i => i.id === id);
      if (!item || !item.locked) return;

      const status = isAdminUser ? 'granted' : (featureAccess.get(id) || null);
      el.classList.toggle('sb-locked',   status !== 'granted');
      el.classList.toggle('sb-unlocked', status === 'granted');

      const lock = el.querySelector('.sb-lock');
      if (lock) {
        if (status === 'pending')      { lock.textContent = '⏳'; lock.className = 'sb-lock sb-lock-pending'; }
        else if (status === 'rejected'){ lock.textContent = '🚫'; lock.className = 'sb-lock sb-lock-rejected'; }
        else                           { lock.textContent = '🔒'; lock.className = 'sb-lock'; }
      }
    });
  }

  /* Show admin-only items + apply lock state once auth.js resolves the profile */
  document.addEventListener('lazypo:profile', function (e) {
    isAdminUser = !!e.detail?.isAdmin;
    if (isAdminUser) {
      document.querySelectorAll('.sb-admin-only').forEach(el => el.classList.add('sb-admin-visible'));
    }
    applyAccessToSidebar();
  });

  /* feature_access state from auth.js */
  document.addEventListener('lazypo:feature-access', function (e) {
    featureAccess.clear();
    (e.detail?.rows || []).forEach(r => featureAccess.set(r.feature_id, r.status));
    applyAccessToSidebar();
  });

  /* Initial pass — items default to locked until proven otherwise */
  setTimeout(applyAccessToSidebar, 0);

  /* ─────────────────────────────────────────────────
     ACCESS REQUEST MODAL
  ───────────────────────────────────────────────── */
  function showAccessRequestModal(item) {
    const status = featureAccess.get(item.id) || null;

    const overlay = document.createElement('div');
    overlay.className = 'sb-ar-overlay';
    const renderBody = () => {
      let bodyHTML;
      if (status === 'pending') {
        bodyHTML = `
          <div class="sb-ar-icon">⏳</div>
          <div class="sb-ar-title">Demande en attente</div>
          <div class="sb-ar-status pending">Votre demande d'accès à <strong>${escAttr(item.label)}</strong> a déjà été envoyée. Un admin va la traiter prochainement.</div>
          <div class="sb-ar-actions">
            <button class="sb-ar-btn primary" data-act="close">OK</button>
          </div>`;
      } else if (status === 'rejected') {
        bodyHTML = `
          <div class="sb-ar-icon" style="background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.25);">🚫</div>
          <div class="sb-ar-title">Demande refusée</div>
          <div class="sb-ar-status rejected">Votre demande d'accès à <strong>${escAttr(item.label)}</strong> a été refusée. Contactez un admin si vous pensez qu'il s'agit d'une erreur.</div>
          <div class="sb-ar-actions">
            <button class="sb-ar-btn cancel" data-act="close">Fermer</button>
          </div>`;
      } else {
        bodyHTML = `
          <div class="sb-ar-icon">🔒</div>
          <div class="sb-ar-title">Accès restreint — ${escAttr(item.label)}</div>
          <div class="sb-ar-msg">Vous n'avez pas encore accès à <strong>${escAttr(item.label)}</strong>.<br>Souhaitez-vous envoyer une demande à l'admin ?</div>
          <div class="sb-ar-actions">
            <button class="sb-ar-btn cancel"  data-act="close">Annuler</button>
            <button class="sb-ar-btn primary" data-act="request">Demander l'accès</button>
          </div>`;
      }
      overlay.innerHTML = `<div class="sb-ar-modal" role="dialog" aria-modal="true">${bodyHTML}</div>`;
    };
    renderBody();
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));

    function close() {
      overlay.classList.remove('open');
      setTimeout(() => overlay.remove(), 200);
    }

    overlay.addEventListener('click', async (e) => {
      const act = e.target?.dataset?.act;
      if (e.target === overlay || act === 'close') return close();
      if (act === 'request') {
        const btn = e.target;
        btn.disabled = true; btn.textContent = 'Envoi…';
        try {
          if (!window.sb || !window.LazyAuth) throw new Error('Auth not ready');
          let session = (await window.sb.auth.getSession()).data.session;
          if (!session && window.LazyAuth.devSession) session = window.LazyAuth.devSession;
          if (!session) throw new Error('Vous devez être connecté.');
          const { error } = await window.sb.from('feature_access').insert({
            user_id: session.user.id, feature_id: item.id, status: 'pending'
          });
          if (error) throw error;
          featureAccess.set(item.id, 'pending');
          applyAccessToSidebar();
          // Show confirmation
          overlay.querySelector('.sb-ar-modal').innerHTML = `
            <div class="sb-ar-icon" style="background:rgba(34,197,94,.12);border-color:rgba(34,197,94,.25);">✅</div>
            <div class="sb-ar-title">Demande envoyée</div>
            <div class="sb-ar-msg">Vous serez notifié quand l'admin l'aura traitée. Le cadenas restera affiché en attendant.</div>
            <div class="sb-ar-actions">
              <button class="sb-ar-btn primary" data-act="close">OK</button>
            </div>`;
        } catch (err) {
          console.error('[access-request]', err);
          btn.disabled = false; btn.textContent = 'Demander l\'accès';
          alert(err.message || 'Erreur lors de la demande.');
        }
      }
    });
  }

  function escAttr(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  /* Intercept clicks on locked items — must run BEFORE the SPA navigation
     handler defined below. stopImmediatePropagation prevents that handler
     from firing in the same capture-phase loop. */
  function onLockedClick(e) {
    const link = e.target.closest('.sb-item-link');
    if (!link) return;
    const itemEl = link.closest('[data-sb-id]');
    if (!itemEl) return;
    const id = itemEl.dataset.sbId;
    const item = ITEMS.find(i => i.id === id);
    if (!item || !item.locked) return;

    const status = isAdminUser ? 'granted' : (featureAccess.get(id) || null);
    if (status === 'granted') return; // allow normal nav

    e.preventDefault();
    e.stopImmediatePropagation();
    showAccessRequestModal(item);
  }
  document.addEventListener('click', onLockedClick, { capture: true });

  /* Public API for pages to gate themselves */
  window.LazySidebar = window.LazySidebar || {};
  window.LazySidebar.hasFeatureAccess = (featureId) => {
    if (isAdminUser) return true;
    return featureAccess.get(featureId) === 'granted';
  };

  /* ═══════════════════════════════════════════════════
     HTML BUILDER
  ═══════════════════════════════════════════════════ */
  function buildItem(item) {
    if (item.divider) return '<div class="sb-divider"></div>';

    const active      = isActive(item) ? ' active' : '';
    const adminClass  = item.adminOnly ? ' sb-admin-only' : '';
    const lockedClass = item.locked ? ' sb-locked' : '';
    const tag         = item.url ? 'a' : 'button';
    const hrefAttr    = item.url ? `href="${item.url}"` : 'type="button"';
    const targetAttr  = item.newTab ? 'target="_blank" rel="noopener"' : '';
    const clickAttr   = !item.url
      ? `onclick="${item.onClick || `window.showUnavailablePopup && window.showUnavailablePopup('${item.label}')`}"`
      : '';
    const lockHTML    = item.locked ? `<span class="sb-lock" aria-label="locked">🔒</span>` : '';

    return `
      <div class="sb-item${active}${adminClass}${lockedClass}" data-sb-id="${item.id}">
        <${tag} class="sb-item-link" ${hrefAttr} ${targetAttr} ${clickAttr}>
          <div class="sb-icon">${item.icon}</div>
          <span class="sb-label">${item.label}</span>
          ${lockHTML}
        </${tag}>
        <div class="sb-desc">${item.desc}</div>
      </div>`;
  }

  const html = `
    <button class="sb-burger" id="sb-burger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
    <div class="sb-overlay" id="sb-overlay"></div>

    <aside class="sb" id="sb-sidebar">
      <a href="index.html" class="sb-logo-wrap" aria-label="LazyPO — Home">
        <span class="sb-logo-star">✦</span>
        <span class="sb-logo-name">LazyPO</span>
      </a>
      <button class="sb-close-btn" id="sb-close" aria-label="Fermer">✕</button>

      <nav class="sb-nav" aria-label="Navigation principale">
        ${ITEMS.map(buildItem).join('\n')}
      </nav>

      <div class="sb-spacer"></div>
      <div class="sb-footer">
        <div class="sb-footer-dot"></div>
        <div class="sb-footer-text">v2.0 · <strong>100% local</strong></div>
      </div>
    </aside>`;

  /* ═══════════════════════════════════════════════════
     INJECT
  ═══════════════════════════════════════════════════ */
  document.body.insertAdjacentHTML('afterbegin', html);

  /* Lazy-load the global feedback submission modal so the
     "New request" sidebar entry works from any page. */
  if (!document.querySelector('script[data-lazy-feedback]') && !window.LazyFeedback) {
    const fbScript = document.createElement('script');
    fbScript.src = 'feedback_modal.js';
    fbScript.dataset.lazyFeedback = '1';
    fbScript.async = false;
    document.head.appendChild(fbScript);
  }

  /* ═══════════════════════════════════════════════════
     MOBILE LOGIC
  ═══════════════════════════════════════════════════ */
  const sidebar  = document.getElementById('sb-sidebar');
  const burger   = document.getElementById('sb-burger');
  const overlay  = document.getElementById('sb-overlay');
  const closeBtn = document.getElementById('sb-close');

  function openSidebar()  { sidebar.classList.add('open'); overlay.classList.add('open'); burger.classList.add('open'); }
  function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('open'); burger.classList.remove('open'); }

  burger.addEventListener('click',  () => sidebar.classList.contains('open') ? closeSidebar() : openSidebar());
  overlay.addEventListener('click', closeSidebar);
  closeBtn.addEventListener('click', closeSidebar);

  /* ═══════════════════════════════════════════════════
     SPA NAVIGATION — keeps Spotify playing across pages
  ═══════════════════════════════════════════════════ */

  // Scripts that must NOT be re-executed on navigation (already live in memory)
  const SPA_SKIP = [
    'sidebar.js','auth.js','focusfm.js','session.js',
    'countdown.js','popup.js','demo.js','apis.js','feedback_modal.js',
    'supabase-js','three.r134','vanta.net',
  ];

  // IDs of elements that must survive body replacement
  const SPA_PERSIST = [
    'sb-burger','sb-overlay','sb-sidebar',
    '_fm_mini','_fm_panel','_fm_track_toast','_fm_toast','_sess_warn',
    '_fm_css','sb-styles',
  ];

  function _updateActiveItem(url) {
    const curr = url.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-sb-id]').forEach(item => {
      const a = item.querySelector('a[href]');
      item.classList.toggle('active', !!a && a.getAttribute('href') === curr);
    });
  }

  async function _spaNavigate(url) {
    // Detach persisted elements before wiping body
    const saved = SPA_PERSIST
      .map(id => document.getElementById(id))
      .filter(Boolean)
      .map(el => { el.remove(); return el; });

    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error('fetch ' + r.status);
      const html = await r.text();
      const doc  = new DOMParser().parseFromString(html, 'text/html');

      // Update title
      document.title = doc.title;

      // Swap page-scoped <style> blocks in <head>
      document.querySelectorAll('head style[data-spapage]').forEach(s => s.remove());
      doc.querySelectorAll('head style').forEach(st => {
        const cl = st.cloneNode(true);
        cl.setAttribute('data-spapage', '1');
        document.head.appendChild(cl);
      });

      // Replace body content
      document.body.innerHTML = doc.body.innerHTML;

      // Restore persisted elements
      saved.forEach(el => document.body.appendChild(el));

      // Re-run page scripts in order (skip shared ones)
      const tasks = [];
      doc.body.querySelectorAll('script').forEach(s => {
        if (s.src) {
          if (SPA_SKIP.some(m => s.src.includes(m))) return;
          if (document.querySelector(`script[src="${s.src}"]`)) return;
          tasks.push({ type: 'ext', src: s.src });
        } else if (s.textContent.trim()) {
          tasks.push({ type: 'inline', code: s.textContent });
        }
      });

      for (const t of tasks) {
        await new Promise(res => {
          const el = document.createElement('script');
          if (t.type === 'ext') {
            el.src = t.src; el.onload = res; el.onerror = res;
          } else {
            el.textContent = t.code;
          }
          document.body.appendChild(el);
          if (t.type === 'inline') res();
        });
      }

      history.pushState({ spa: url }, document.title, url);
      window.scrollTo(0, 0);
      _updateActiveItem(url);
      closeSidebar();

    } catch (_) {
      // Fallback: restore elements + hard navigate
      saved.forEach(el => document.body.appendChild(el));
      location.href = url;
    }
  }

  // Intercept sidebar link clicks
  document.addEventListener('click', e => {
    const link = e.target.closest('.sb-item-link[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || /^https?:\/\//.test(href) || href.startsWith('#')) return;
    if (link.target === '_blank') return; // let browser handle new-tab links
    e.preventDefault();
    _spaNavigate(href);
  }, true);

  // Handle browser back/forward
  window.addEventListener('popstate', e => {
    _spaNavigate(e.state?.spa || location.href);
  });

  // Register current page so popstate works on first back
  history.replaceState({ spa: location.href }, document.title, location.href);

})();
