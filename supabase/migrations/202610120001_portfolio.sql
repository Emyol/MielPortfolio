-- Run once in the Supabase SQL editor. No service-role key is used by the app.
create table public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admin_users enable row level security;
create policy "Owners can see own membership" on public.admin_users for select to authenticated using (user_id = auth.uid());
create function public.is_portfolio_owner() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.is_portfolio_owner() from public;
grant execute on function public.is_portfolio_owner() to anon, authenticated;

create table public.portfolio_draft (
  id smallint primary key default 1 check (id = 1),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
create table public.portfolio_published (
  id smallint primary key default 1 check (id = 1),
  content jsonb not null,
  revision bigint not null,
  published_at timestamptz not null default now()
);
create table public.published_assets (name text primary key);
alter table public.portfolio_draft enable row level security;
alter table public.portfolio_published enable row level security;
alter table public.published_assets enable row level security;
create policy "Owner reads drafts" on public.portfolio_draft for select to authenticated using (public.is_portfolio_owner());
create policy "Visitors read publication" on public.portfolio_published for select to anon, authenticated using (true);
create policy "Visitors read published asset list" on public.published_assets for select to anon, authenticated using (true);
revoke all on public.admin_users, public.portfolio_draft, public.portfolio_published, public.published_assets from anon, authenticated;
grant select on public.admin_users, public.portfolio_draft to authenticated;
grant select on public.portfolio_published, public.published_assets to anon, authenticated;
revoke insert, update, delete on public.admin_users, public.portfolio_draft, public.portfolio_published, public.published_assets from anon, authenticated;

create function public.save_portfolio_draft(new_content jsonb, expected_revision bigint) returns bigint
language plpgsql security definer set search_path = '' as $$
declare current_revision bigint;
begin
  if not public.is_portfolio_owner() then raise exception 'forbidden'; end if;
  if jsonb_typeof(new_content) <> 'object' or octet_length(new_content::text) > 1000000 then raise exception 'invalid_content'; end if;
  perform pg_advisory_xact_lock(716253);
  select revision into current_revision from public.portfolio_draft where id = 1;
  if coalesce(current_revision, 0) <> expected_revision then raise exception 'revision_conflict'; end if;
  insert into public.portfolio_draft(id, content, revision) values (1, new_content, expected_revision + 1)
  on conflict (id) do update set content = excluded.content, revision = excluded.revision, updated_at = now();
  return expected_revision + 1;
end;
$$;

-- Archived list entries never reach the publicly readable snapshot or asset allowlist.
create function public.portfolio_without_archives(value jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare result jsonb;
begin
  if jsonb_typeof(value) = 'array' then
    select coalesce(jsonb_agg(public.portfolio_without_archives(item) order by ordinal), '[]'::jsonb)
    into result from jsonb_array_elements(value) with ordinality as entry(item, ordinal)
    where coalesce(item->>'archived', 'false') <> 'true';
    return result;
  elsif jsonb_typeof(value) = 'object' then
    select coalesce(jsonb_object_agg(key, public.portfolio_without_archives(val)), '{}'::jsonb)
    into result from jsonb_each(value) as entry(key, val);
    return result;
  end if;
  return value;
end;
$$;
revoke all on function public.portfolio_without_archives(jsonb) from public;

create function public.publish_portfolio(expected_revision bigint) returns void
language plpgsql security definer set search_path = '' as $$
declare draft public.portfolio_draft; asset text;
begin
  if not public.is_portfolio_owner() then raise exception 'forbidden'; end if;
  perform pg_advisory_xact_lock(716253);
  select * into draft from public.portfolio_draft where id = 1 for update;
  if draft.id is null or draft.revision <> expected_revision then raise exception 'revision_conflict'; end if;
  draft.content := public.portfolio_without_archives(draft.content);
  delete from public.published_assets;
  -- Extract only exact internal media URLs; arbitrary text cannot expose unrelated objects.
  for asset in select distinct substring(v #>> '{}' from '^/api/media/([a-f0-9-]{36}\.(jpg|png|webp|pdf))$')
    from jsonb_path_query(draft.content, '$.** ? (@.type() == "string")') v
    where (v #>> '{}') ~ '^/api/media/[a-f0-9-]{36}\.(jpg|png|webp|pdf)$'
  loop
    if not exists(select 1 from storage.objects where bucket_id = 'portfolio-assets' and name = asset) then raise exception 'missing_asset'; end if;
    insert into public.published_assets(name) values(asset) on conflict do nothing;
  end loop;
  insert into public.portfolio_published(id, content, revision) values(1, draft.content, draft.revision)
  on conflict(id) do update set content = excluded.content, revision = excluded.revision, published_at = now();
end;
$$;
revoke all on function public.save_portfolio_draft(jsonb, bigint), public.publish_portfolio(bigint) from public;
grant execute on function public.save_portfolio_draft(jsonb, bigint), public.publish_portfolio(bigint) to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-assets', 'portfolio-assets', false, 4194304, array['image/jpeg','image/png','image/webp','application/pdf']);
create policy "Owner uploads assets" on storage.objects for insert to authenticated
with check (bucket_id = 'portfolio-assets' and public.is_portfolio_owner());
create policy "Read owner or published assets" on storage.objects for select to anon, authenticated
using (bucket_id = 'portfolio-assets' and (public.is_portfolio_owner() or exists(select 1 from public.published_assets p where p.name = storage.objects.name)));
-- Immutable filenames preserve old publications. Storage cleanup is a deliberate dashboard operation.
