-- Package/tour reference price snapshot + partial payment tracking

alter table public.booking_requests
  add column if not exists reference_price_minor bigint,
  add column if not exists reference_price_currency text,
  add column if not exists amount_paid_minor bigint not null default 0;

alter table public.booking_requests
  add constraint booking_requests_reference_price_positive
    check (reference_price_minor is null or reference_price_minor > 0),
  add constraint booking_requests_amount_paid_nonnegative
    check (amount_paid_minor >= 0);

alter table public.booking_requests
  drop constraint if exists booking_requests_quoted_currency_check;

alter table public.booking_requests
  add constraint booking_requests_quoted_currency_check
    check (quoted_currency is null or quoted_currency in ('USD', 'AFN')),
  add constraint booking_requests_reference_price_currency_check
    check (reference_price_currency is null or reference_price_currency in ('USD', 'AFN'));

-- Replace success handler: accumulate partial payments until admin quote is met
create or replace function public.apply_payment_success(
  p_attempt_id uuid,
  p_expected_amount_minor bigint,
  p_expected_currency text,
  p_provider_transaction_id text,
  p_provider_status text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt public.payment_attempts%rowtype;
  v_booking public.booking_requests%rowtype;
  v_new_paid bigint;
  v_quote bigint;
begin
  select * into v_attempt
  from public.payment_attempts
  where id = p_attempt_id
  for update;

  if not found then
    return false;
  end if;

  if v_attempt.status = 'succeeded' then
    return false;
  end if;

  if v_attempt.amount_minor <> p_expected_amount_minor
     or v_attempt.currency <> p_expected_currency then
    raise exception 'payment amount or currency mismatch';
  end if;

  select * into v_booking
  from public.booking_requests
  where id = v_attempt.booking_id
  for update;

  if v_booking.payment_status = 'paid' then
    update public.payment_attempts
    set status = 'succeeded',
        provider_transaction_id = coalesce(provider_transaction_id, p_provider_transaction_id),
        provider_status = coalesce(p_provider_status, provider_status),
        paid_at = coalesce(paid_at, now()),
        updated_at = now()
    where id = p_attempt_id;
    return false;
  end if;

  update public.payment_attempts
  set status = 'succeeded',
      provider_transaction_id = p_provider_transaction_id,
      provider_status = p_provider_status,
      paid_at = now(),
      updated_at = now()
  where id = p_attempt_id;

  v_new_paid := coalesce(v_booking.amount_paid_minor, 0) + v_attempt.amount_minor;
  v_quote := v_booking.quoted_amount_minor;

  update public.booking_requests
  set amount_paid_minor = v_new_paid,
      payment_status = case
        when v_quote is not null and v_new_paid >= v_quote then 'paid'
        else 'partial'
      end,
      paid_at = case
        when v_quote is not null and v_new_paid >= v_quote then coalesce(paid_at, now())
        else paid_at
      end,
      status = case
        when v_quote is not null and v_new_paid >= v_quote
          and status in ('new', 'contacted', 'quoted') then 'confirmed'::public.booking_status
        else status
      end,
      updated_at = now()
  where id = v_attempt.booking_id;

  return true;
end;
$$;

revoke all on function public.apply_payment_success(uuid, bigint, text, text, text) from public;
grant execute on function public.apply_payment_success(uuid, bigint, text, text, text) to service_role;
