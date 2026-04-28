-- Split per-user limits into separate Adi and FRQ buckets so heavy FRQ users
-- still have Adi capacity. The existing call_count column continues to track
-- Adi messages; frq_count is the new FRQ-grade bucket.

alter table public.adi_usage
  add column if not exists frq_count integer not null default 0;

create or replace function check_and_increment_frq_usage(
  p_user_id text,
  p_date date,
  p_cost_cents numeric,
  p_limit integer
)
returns integer language plpgsql security definer as $$
declare
  v_count integer;
begin
  insert into public.adi_usage (user_id, date, call_count, frq_count, estimated_cost_cents)
  values (p_user_id, p_date, 0, 0, 0)
  on conflict (user_id, date) do nothing;

  update public.adi_usage
  set frq_count = frq_count + 1,
      estimated_cost_cents = estimated_cost_cents + p_cost_cents,
      updated_at = now()
  where user_id = p_user_id
    and date = p_date
    and frq_count < p_limit
  returning frq_count into v_count;

  return coalesce(v_count, -1);
end;
$$;
