create table if not exists public.identification_daily_usage (
  user_id uuid primary key references auth.users (id) on delete cascade,
  usage_date date not null,
  requests_used integer not null check (requests_used between 1 and 25),
  updated_at timestamptz not null default now()
);

alter table public.identification_daily_usage enable row level security;
revoke all on table public.identification_daily_usage from anon, authenticated;

create or replace function public.consume_animal_identification()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  current_usage integer;
begin
  if caller_id is null then
    return 0;
  end if;

  insert into public.identification_daily_usage (user_id, usage_date, requests_used)
  values (caller_id, pg_catalog.timezone('UTC', pg_catalog.now())::date, 1)
  on conflict (user_id) do update
    set usage_date = excluded.usage_date,
        requests_used = case
          when public.identification_daily_usage.usage_date = excluded.usage_date
            then public.identification_daily_usage.requests_used + 1
          else 1
        end,
        updated_at = pg_catalog.now()
    where public.identification_daily_usage.usage_date <> excluded.usage_date
       or public.identification_daily_usage.requests_used < 25
  returning requests_used into current_usage;

  return coalesce(current_usage, 0);
end;
$$;

revoke all on function public.consume_animal_identification() from public, anon;
grant execute on function public.consume_animal_identification() to authenticated;
