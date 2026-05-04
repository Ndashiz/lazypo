-- ═══════════════════════════════════════════════════════════════════
-- LazyPO — Feature access control
-- Politique : refus = bloqué définitivement jusqu'à ce qu'un admin
-- réoctroie (option B). La PK composite (user_id, feature_id) empêche
-- toute re-soumission après un refus — seul un admin peut UPDATE
-- pour repasser à granted.
-- ═══════════════════════════════════════════════════════════════════

-- Le helper public.is_admin(uid) doit déjà exister (créé par
-- feedback_schema.sql). S'il n'existe pas, on le recrée :
create or replace function public.is_admin(uid uuid)
returns boolean language sql security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

create table if not exists public.feature_access (
  user_id      uuid not null references auth.users(id) on delete cascade,
  feature_id   text not null,
  status       text not null check (status in ('pending','granted','rejected')),
  requested_at timestamptz not null default now(),
  reviewed_at  timestamptz,
  reviewed_by  uuid references auth.users(id) on delete set null,
  primary key (user_id, feature_id)
);

create index if not exists feature_access_status_idx on public.feature_access(status);
create index if not exists feature_access_user_idx   on public.feature_access(user_id);

alter table public.feature_access enable row level security;

-- SELECT : on voit ses propres lignes, l'admin voit tout
drop policy if exists feature_access_select on public.feature_access;
create policy feature_access_select on public.feature_access
  for select using (
    user_id = auth.uid() or public.is_admin(auth.uid())
  );

-- INSERT : un user crée seulement ses propres demandes en 'pending'
drop policy if exists feature_access_insert on public.feature_access;
create policy feature_access_insert on public.feature_access
  for insert with check (
    user_id = auth.uid() and status = 'pending'
  );

-- UPDATE : admin seulement (changement de statut)
drop policy if exists feature_access_update on public.feature_access;
create policy feature_access_update on public.feature_access
  for update using ( public.is_admin(auth.uid()) );

-- DELETE : admin seulement (cleanup)
drop policy if exists feature_access_delete on public.feature_access;
create policy feature_access_delete on public.feature_access
  for delete using ( public.is_admin(auth.uid()) );

-- Trigger : marque reviewed_at + reviewed_by quand l'admin update le statut
create or replace function public.feature_access_before_update()
returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status then
    new.reviewed_at := now();
    new.reviewed_by := auth.uid();
  end if;
  return new;
end; $$;

drop trigger if exists feature_access_before_update_trg on public.feature_access;
create trigger feature_access_before_update_trg
  before update on public.feature_access
  for each row execute function public.feature_access_before_update();

-- ───────────────────────────────────────────────────────────────────
-- Policy bonus : un admin peut lire TOUS les profils
-- (nécessaire pour afficher les usernames dans la page admin)
-- ───────────────────────────────────────────────────────────────────
drop policy if exists profiles_admin_select on public.profiles;
create policy profiles_admin_select on public.profiles
  for select using (public.is_admin(auth.uid()));
