-- ============================================================
-- WC26 Prediction Pool — Complete Schema
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums ───────────────────────────────────────────────────
create type match_stage as enum (
  'group',
  'round_of_32',
  'round_of_16',
  'quarter_final',
  'semi_final',
  'final'
);

create type match_status as enum (
  'scheduled',
  'live',
  'finished'
);

create type knockout_stage as enum (
  'round_of_32',
  'round_of_16',
  'quarter_final',
  'semi_final',
  'final'
);

-- ── teams ────────────────────────────────────────────────────
create table public.teams (
  id          serial      primary key,
  name        text        not null unique,
  code        char(3)     not null unique,
  flag_url    text,
  group_id    char(1),                      -- 'A'..'L'
  created_at  timestamptz default now()
);

-- ── profiles ─────────────────────────────────────────────────
create table public.profiles (
  id               uuid        primary key references auth.users(id) on delete cascade,
  username         text        not null unique,
  avatar_url       text,
  total_points     int         not null default 0,
  is_admin         boolean     not null default false,
  onboarding_done  boolean     not null default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── matches ──────────────────────────────────────────────────
create table public.matches (
  id              serial       primary key,
  home_team_id    int          references public.teams(id),
  away_team_id    int          references public.teams(id),
  home_team       text         not null,
  away_team       text         not null,
  score_home      int,
  score_away      int,
  stage           match_stage  not null default 'group',
  status          match_status not null default 'scheduled',
  group_id        text,
  scheduled_at    timestamptz  not null,
  venue           text,
  api_fixture_id  int          unique,
  created_at      timestamptz  default now(),

  constraint different_teams check (home_team_id <> away_team_id),
  constraint valid_scores check (
    (score_home is null and score_away is null)
    or (score_home >= 0 and score_away >= 0)
  )
);

-- ── pools ─────────────────────────────────────────────────────
create table public.pools (
  id               uuid        primary key default gen_random_uuid(),
  name             text        not null,
  description      text,
  owner_id         uuid        not null references public.profiles(id) on delete cascade,
  invite_code      text        unique not null
                               default upper(left(replace(gen_random_uuid()::text, '-', ''), 8)),
  entry_fee        numeric(10,2) not null default 0,
  expected_players integer,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── pool_members ───────────────────────────────────────────────
create table public.pool_members (
  id        uuid        primary key default gen_random_uuid(),
  pool_id   uuid        not null references public.pools(id)    on delete cascade,
  user_id   uuid        not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (pool_id, user_id)
);

-- ── invitations ───────────────────────────────────────────────
create table public.invitations (
  id          uuid        primary key default gen_random_uuid(),
  email       text        not null,
  invited_by  uuid        references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  expires_at  timestamptz not null default (now() + interval '7 days'),
  created_at  timestamptz not null default now()
);

-- ── predictions_groups ───────────────────────────────────────
create table public.predictions_groups (
  id             uuid        primary key default uuid_generate_v4(),
  user_id        uuid        not null references public.profiles(id) on delete cascade,
  pool_id        uuid        references public.pools(id) on delete cascade,
  match_id       int         not null references public.matches(id) on delete cascade,
  pred_home      int         not null check (pred_home >= 0),
  pred_away      int         not null check (pred_away >= 0),
  points_earned  int         not null default 0,
  scored_at      timestamptz,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),

  unique (user_id, match_id, pool_id)
);

-- ── bracket_picks ─────────────────────────────────────────────
create table public.bracket_picks (
  id               uuid           primary key default uuid_generate_v4(),
  user_id          uuid           not null references public.profiles(id) on delete cascade,
  pool_id          uuid           references public.pools(id) on delete cascade,
  team_id          int            not null references public.teams(id),
  stage            knockout_stage not null,
  position         int            not null check (position >= 1),
  is_legacy        boolean        not null default true,
  can_edit         boolean        not null default false,
  version          int            not null default 1,
  points_potential int            not null default 0,
  points_earned    int            not null default 0,
  created_at       timestamptz    default now(),
  updated_at       timestamptz    default now(),

  unique (user_id, stage, position, pool_id)
);

-- ── third_place_picks ─────────────────────────────────────────
create table public.third_place_picks (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  group_id    char(1)     not null check (group_id in ('A','B','C','D','E','F','G','H','I','J','K','L')),
  slot_rank   smallint    not null check (slot_rank between 1 and 8),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),

  unique (user_id, group_id),
  unique (user_id, slot_rank)
);

-- ── third_place_bracket_map ───────────────────────────────────
create table public.third_place_bracket_map (
  groups_key  char(8) primary key,
  slot_map    jsonb   not null
);

-- ── Indexes ──────────────────────────────────────────────────
create index idx_matches_status        on public.matches(status);
create index idx_matches_stage         on public.matches(stage);
create index idx_predictions_user      on public.predictions_groups(user_id);
create index idx_predictions_match     on public.predictions_groups(match_id);
create index idx_preds_pool            on public.predictions_groups(pool_id);
create index idx_bracket_user          on public.bracket_picks(user_id);
create index idx_bracket_stage_pos     on public.bracket_picks(stage, position);
create index idx_bracket_pool          on public.bracket_picks(pool_id);
create index idx_pools_owner           on public.pools(owner_id);
create index idx_pool_members_pool     on public.pool_members(pool_id);
create index idx_pool_members_user     on public.pool_members(user_id);
create index idx_invitations_email     on public.invitations(email);

-- ============================================================
-- Functions
-- ============================================================

-- ── set_updated_at ────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── handle_new_user ───────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- ── is_pool_member ────────────────────────────────────────────
-- SECURITY DEFINER so RLS policies can call it without recursion.
create or replace function public.is_pool_member(p_pool_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.pool_members
    where pool_id = p_pool_id
      and user_id = auth.uid()
  )
$$;

-- ── score_group_match ─────────────────────────────────────────
create or replace function public.score_group_match(
  p_match_id   int,
  p_score_home int,
  p_score_away int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pred          record;
  v_pts           int;
  v_pred_diff     int;
  v_actual_diff   int;
  v_pred_result   int;
  v_actual_result int;
begin
  update public.matches
  set score_home = p_score_home,
      score_away = p_score_away,
      status     = 'finished'
  where id = p_match_id;

  v_actual_diff   := p_score_home - p_score_away;
  v_actual_result := sign(v_actual_diff);

  for v_pred in
    select * from public.predictions_groups where match_id = p_match_id
  loop
    v_pred_diff   := v_pred.pred_home - v_pred.pred_away;
    v_pred_result := sign(v_pred_diff);

    v_pts := case
      when v_pred.pred_home = p_score_home
       and v_pred.pred_away = p_score_away then 5
      when v_pred_diff = v_actual_diff      then 3
      when v_pred_result = v_actual_result  then 1
      else 0
    end;

    update public.predictions_groups
    set points_earned = v_pts,
        scored_at     = now()
    where id = v_pred.id;

    if v_pts > 0 then
      update public.profiles
      set total_points = total_points + v_pts
      where id = v_pred.user_id;
    end if;
  end loop;
end;
$$;

-- ── score_bracket_pick ────────────────────────────────────────
create or replace function public.score_bracket_pick(
  p_pick_id       uuid,
  p_team_advanced boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pick      record;
  v_pts       int;
  legacy_pts  int[] := array[10, 20, 40, 80, 150];
  recov_pts   int[] := array[4,  8,  16, 32, 60];
  v_stage_idx int;
begin
  select * into v_pick from public.bracket_picks where id = p_pick_id;
  if not found then return; end if;

  v_stage_idx := case v_pick.stage
    when 'round_of_32'   then 1
    when 'round_of_16'   then 2
    when 'quarter_final' then 3
    when 'semi_final'    then 4
    when 'final'         then 5
  end;

  if not p_team_advanced then
    v_pts := 0;
  elsif v_pick.is_legacy then
    v_pts := legacy_pts[v_stage_idx];
  else
    v_pts := recov_pts[v_stage_idx];
  end if;

  update public.bracket_picks
  set points_earned = v_pts
  where id = p_pick_id;

  if v_pts > 0 then
    update public.profiles
    set total_points = total_points + v_pts
    where id = v_pick.user_id;
  end if;
end;
$$;

-- ── score_knockout_match ──────────────────────────────────────
create or replace function public.score_knockout_match(
  p_match_id       int,
  p_score_home     int,
  p_score_away     int,
  p_winner_team_id int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match     record;
  v_loser_id  int;
  v_pick      record;
  v_stages    text[] := array[
    'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'final'
  ];
  v_stage_idx int;
begin
  select * into v_match from public.matches where id = p_match_id;
  if not found then return; end if;

  update public.matches
  set score_home = p_score_home,
      score_away = p_score_away,
      status     = 'finished'
  where id = p_match_id;

  v_loser_id := case
    when v_match.home_team_id = p_winner_team_id then v_match.away_team_id
    else v_match.home_team_id
  end;

  for v_pick in
    select * from public.bracket_picks
    where stage   = v_match.stage
      and team_id = p_winner_team_id
  loop
    perform public.score_bracket_pick(v_pick.id, true);
  end loop;

  v_stage_idx := array_position(v_stages, v_match.stage::text);

  update public.bracket_picks
  set points_earned = 0,
      can_edit      = true
  where team_id = v_loser_id
    and stage   = any(v_stages[v_stage_idx:array_length(v_stages, 1)]);
end;
$$;

-- ── mark_match_live ───────────────────────────────────────────
create or replace function public.mark_match_live(p_match_id int)
returns void
language sql
security definer
set search_path = public
as $$
  update public.matches
  set status = 'live'
  where id = p_match_id
    and status = 'scheduled';
$$;

-- ── save_third_place_picks ────────────────────────────────────
create or replace function public.save_third_place_picks(
  p_user_id uuid,
  p_groups  char[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() <> p_user_id then
    raise exception 'Unauthorized';
  end if;

  if array_length(p_groups, 1) > 8 then
    raise exception 'Maximum 8 third-place picks allowed';
  end if;

  delete from public.third_place_picks where user_id = p_user_id;

  insert into public.third_place_picks (user_id, group_id, slot_rank)
  select p_user_id,
         p_groups[i],
         i
  from generate_series(1, array_length(p_groups, 1)) as i
  where p_groups[i] is not null;
end;
$$;

-- ── get_leaderboard ───────────────────────────────────────────
create or replace function public.get_leaderboard(p_limit int default 50)
returns table(
  id           uuid,
  username     text,
  avatar_url   text,
  total_points int,
  rank         bigint
)
language sql
security definer
set search_path = public
as $$
  select
    id,
    username,
    avatar_url,
    total_points,
    rank() over (order by total_points desc) as rank
  from public.profiles
  order by total_points desc
  limit p_limit;
$$;

-- ── Triggers ─────────────────────────────────────────────────
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_predictions_updated
  before update on public.predictions_groups
  for each row execute function public.set_updated_at();

create trigger trg_bracket_updated
  before update on public.bracket_picks
  for each row execute function public.set_updated_at();

create trigger trg_pools_updated
  before update on public.pools
  for each row execute function public.set_updated_at();

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Function grants ───────────────────────────────────────────
grant execute on function public.get_leaderboard(int)                        to authenticated;
grant execute on function public.save_third_place_picks(uuid, char[])        to authenticated;
grant execute on function public.score_group_match(int, int, int)            to service_role;
grant execute on function public.score_bracket_pick(uuid, boolean)           to service_role;
grant execute on function public.score_knockout_match(int, int, int, int)    to service_role;
grant execute on function public.mark_match_live(int)                        to service_role;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.teams                  enable row level security;
alter table public.profiles               enable row level security;
alter table public.matches                enable row level security;
alter table public.pools                  enable row level security;
alter table public.pool_members           enable row level security;
alter table public.invitations            enable row level security;
alter table public.predictions_groups     enable row level security;
alter table public.bracket_picks          enable row level security;
alter table public.third_place_picks      enable row level security;
alter table public.third_place_bracket_map enable row level security;

-- ── teams ─────────────────────────────────────────────────────
create policy "teams_select_all"
  on public.teams for select to authenticated
  using (true);

create policy "teams_admin_all"
  on public.teams for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ── profiles ──────────────────────────────────────────────────
create policy "profiles_select_all"
  on public.profiles for select to authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ── matches ───────────────────────────────────────────────────
create policy "matches_select_all"
  on public.matches for select to authenticated
  using (true);

create policy "matches_admin_all"
  on public.matches for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ── pools ─────────────────────────────────────────────────────
-- Open read to allow invite-code lookup before joining
create policy "pools_select_authenticated"
  on public.pools for select to authenticated
  using (true);

create policy "pools_insert_own"
  on public.pools for insert to authenticated
  with check (owner_id = auth.uid());

create policy "pools_update_owner"
  on public.pools for update to authenticated
  using (
    owner_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "pools_delete_owner"
  on public.pools for delete to authenticated
  using (
    owner_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ── pool_members ───────────────────────────────────────────────
-- Uses is_pool_member() SECURITY DEFINER to avoid RLS recursion
create policy "pool_members_select"
  on public.pool_members for select to authenticated
  using (
    public.is_pool_member(pool_id)
    or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.is_admin)
  );

create policy "pool_members_insert_self"
  on public.pool_members for insert to authenticated
  with check (user_id = auth.uid());

create policy "pool_members_delete_self_or_owner"
  on public.pool_members for delete to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.pools pl where pl.id = pool_id and pl.owner_id = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ── invitations ───────────────────────────────────────────────
create policy "invitations_admin"
  on public.invitations for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ── predictions_groups ────────────────────────────────────────
create policy "preds_select_all"
  on public.predictions_groups for select to authenticated
  using (true);

create policy "preds_insert_own"
  on public.predictions_groups for insert to authenticated
  with check (user_id = auth.uid());

create policy "preds_update_own_before_kickoff"
  on public.predictions_groups for update to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id and m.status = 'scheduled'
    )
  )
  with check (user_id = auth.uid());

-- ── bracket_picks ─────────────────────────────────────────────
create policy "bracket_select_all"
  on public.bracket_picks for select to authenticated
  using (true);

create policy "bracket_insert_own"
  on public.bracket_picks for insert to authenticated
  with check (user_id = auth.uid());

create policy "bracket_update_own"
  on public.bracket_picks for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── third_place_picks ─────────────────────────────────────────
create policy "third_place_select_own"
  on public.third_place_picks for select to authenticated
  using (auth.uid() = user_id);

create policy "third_place_insert_own"
  on public.third_place_picks for insert to authenticated
  with check (auth.uid() = user_id);

create policy "third_place_update_own"
  on public.third_place_picks for update to authenticated
  using (auth.uid() = user_id);

create policy "third_place_delete_own"
  on public.third_place_picks for delete to authenticated
  using (auth.uid() = user_id);

-- ── third_place_bracket_map ───────────────────────────────────
create policy "bracket_map_select_all"
  on public.third_place_bracket_map for select
  using (true);

create policy "bracket_map_admin_all"
  on public.third_place_bracket_map for all
  using (exists (
    select 1 from public.profiles where id = auth.uid() and is_admin = true
  ));
