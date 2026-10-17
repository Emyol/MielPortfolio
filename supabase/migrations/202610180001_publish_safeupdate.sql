-- Publishing failed with "DELETE requires a WHERE clause": Supabase's API role preloads
-- safeupdate, which refuses a DELETE without WHERE even inside a function. Same function,
-- with the published asset list cleared by an explicit `where true`. Privileges carry over.
create or replace function public.publish_portfolio(expected_revision bigint) returns void
language plpgsql security definer set search_path = '' as $$
declare draft public.portfolio_draft; asset text;
begin
  if not public.is_portfolio_owner() then raise exception 'forbidden'; end if;
  perform pg_advisory_xact_lock(716253);
  select * into draft from public.portfolio_draft where id = 1 for update;
  if draft.id is null or draft.revision <> expected_revision then raise exception 'revision_conflict'; end if;
  draft.content := public.portfolio_without_archives(draft.content);
  delete from public.published_assets where true; -- every row: the list is rebuilt below
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
