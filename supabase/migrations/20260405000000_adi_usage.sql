create table if not exists public.adi_usage (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,  -- uuid for real users, 'GLOBAL' for the global cap row
  date date not null default current_date,
  call_count integer not null default 0,
  estimated_cost_cents numeric(10,4) not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint adi_usage_user_date_unique unique (user_id, date)
);

-- RLS: users can only read their own row
alter table public.adi_usage enable row level security;

create policy "Users can read own usage" on public.adi_usage
  for select using (auth.uid()::text = user_id);

-- Service role can do anything (for server-side increments)
create policy "Service role full access" on public.adi_usage
  for all using (true) with check (true);

-- Atomic increment for global usage row
create or replace function increment_global_adi_usage(p_date date, p_cost_cents numeric)
returns void language plpgsql security definer as $$
begin
  insert into public.adi_usage (user_id, date, call_count, estimated_cost_cents)
  values ('GLOBAL', p_date, 1, p_cost_cents)
  on conflict (user_id, date)
  do update set
    call_count = adi_usage.call_count + 1,
    estimated_cost_cents = adi_usage.estimated_cost_cents + p_cost_cents,
    updated_at = now();
end;
$$;
