-- Atomic check-and-increment: prevents concurrent requests from racing past the limit.
-- Returns the new call_count if incremented, or -1 if already at/over the limit.
create or replace function check_and_increment_adi_usage(
  p_user_id text,
  p_date date,
  p_cost_cents numeric,
  p_limit integer
)
returns integer language plpgsql security definer as $$
declare
  v_count integer;
begin
  -- Ensure the row exists (first request of the day)
  insert into public.adi_usage (user_id, date, call_count, estimated_cost_cents)
  values (p_user_id, p_date, 0, 0)
  on conflict (user_id, date) do nothing;

  -- Atomically increment only if below the limit
  update public.adi_usage
  set call_count = call_count + 1,
      estimated_cost_cents = estimated_cost_cents + p_cost_cents,
      updated_at = now()
  where user_id = p_user_id
    and date = p_date
    and call_count < p_limit
  returning call_count into v_count;

  -- If null, the WHERE didn't match → already at/over limit
  return coalesce(v_count, -1);
end;
$$;
