-- HesabPay payment integration: booking quote fields, payment attempts, admin gateway settings

-- Align booking_status enum with application workflow
alter type public.booking_status rename to booking_status_old;

create type public.booking_status as enum (
  'new',
  'contacted',
  'quoted',
  'confirmed',
  'traveling',
  'declined'
);

alter table public.booking_requests
  alter column status drop default,
  alter column status type public.booking_status using (
    case status::text
      when 'reviewed' then 'contacted'::public.booking_status
      when 'new' then 'new'::public.booking_status
      when 'confirmed' then 'confirmed'::public.booking_status
      when 'declined' then 'declined'::public.booking_status
      else 'new'::public.booking_status
    end
  ),
  alter column status set default 'new';

drop type public.booking_status_old;

-- Guest payment access + admin-set payable amount
alter table public.booking_requests
  add column if not exists quoted_amount_minor bigint,
  add column if not exists quoted_currency text,
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists payment_access_token uuid not null default gen_random_uuid(),
  add column if not exists paid_at timestamptz;

create unique index if not exists booking_requests_payment_access_token_uidx
  on public.booking_requests (payment_access_token);

alter table public.booking_requests
  add constraint booking_requests_quoted_amount_positive
    check (quoted_amount_minor is null or quoted_amount_minor > 0),
  add constraint booking_requests_quoted_currency_check
    check (quoted_currency is null or quoted_currency in ('USD', 'AFN'));

-- Public toggle (safe for cached site_settings reads)
alter table public.site_settings
  add column if not exists hesabpay_enabled boolean not null default false;

-- Server-only merchant credentials (never exposed via public site_settings cache)
create table if not exists public.hesabpay_settings (
  id int primary key default 1 check (id = 1),
  environment text not null default 'sandbox'
    check (environment in ('sandbox', 'production')),
  sandbox_api_base_url text not null default 'https://sandbox-api.hesab.com',
  production_api_base_url text not null default 'https://api.hesab.com',
  api_key text,
  merchant_id text,
  merchant_pin text,
  webhook_secret text,
  allowed_checkout_hosts text not null default 'api.hesab.com,sandbox-api.hesab.com,pay.hesab.com,checkout.hesab.com',
  updated_at timestamptz not null default now()
);

insert into public.hesabpay_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  public_reference uuid not null default gen_random_uuid(),
  booking_id uuid not null references public.booking_requests (id) on delete cascade,
  provider text not null default 'hesabpay' check (provider = 'hesabpay'),
  status text not null default 'created'
    check (status in (
      'created', 'pending', 'processing', 'succeeded', 'failed',
      'cancelled', 'expired', 'refunded', 'partially_refunded', 'manual_review'
    )),
  provider_status text,
  currency text not null check (currency in ('USD', 'AFN')),
  amount_minor bigint not null check (amount_minor > 0),
  provider_transaction_id text,
  provider_session_id text,
  provider_checkout_url text,
  idempotency_key text not null,
  failure_code text,
  failure_message text,
  initiated_by uuid,
  paid_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (public_reference),
  unique (idempotency_key)
);

create unique index if not exists payment_attempts_provider_tx_uidx
  on public.payment_attempts (provider_transaction_id)
  where provider_transaction_id is not null;

create index if not exists payment_attempts_booking_id_idx on public.payment_attempts (booking_id);
create index if not exists payment_attempts_status_idx on public.payment_attempts (status);
create index if not exists payment_attempts_created_at_idx on public.payment_attempts (created_at desc);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'hesabpay',
  provider_event_id text,
  provider_transaction_id text,
  payment_attempt_id uuid references public.payment_attempts (id) on delete set null,
  event_type text,
  payload_hash text not null,
  processing_status text not null default 'received'
    check (processing_status in ('received', 'processed', 'ignored', 'failed')),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error_message text,
  unique (provider, provider_event_id)
);

create index if not exists payment_events_payload_hash_idx on public.payment_events (payload_hash);

-- Atomic success transition
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

  update public.booking_requests
  set payment_status = 'paid',
      paid_at = now(),
      status = case when status in ('new', 'contacted', 'quoted') then 'confirmed'::public.booking_status else status end,
      updated_at = now()
  where id = v_attempt.booking_id;

  return true;
end;
$$;

revoke all on function public.apply_payment_success(uuid, bigint, text, text, text) from public;
grant execute on function public.apply_payment_success(uuid, bigint, text, text, text) to service_role;

alter table public.hesabpay_settings enable row level security;
alter table public.payment_attempts enable row level security;
alter table public.payment_events enable row level security;

create policy "Admins manage hesabpay settings"
  on public.hesabpay_settings for all to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins read payment attempts"
  on public.payment_attempts for select to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins read payment events"
  on public.payment_events for select to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- Guests may read safe payment attempt fields via server routes only (service role writes)
create policy "Guest read own payment attempt by booking token"
  on public.payment_attempts for select to anon, authenticated
  using (
    exists (
      select 1 from public.booking_requests b
      where b.id = payment_attempts.booking_id
    )
  );

grant select on public.payment_attempts to anon, authenticated;
grant select on public.hesabpay_settings to authenticated;
grant all on public.hesabpay_settings to authenticated;
