-- Payment security hardening: privileged status transitions, confidential
-- credential audit events, and public API exposure reduction.

revoke all on function public.apply_payment_success(uuid, bigint, text, text, text) from public;
revoke all on function public.apply_payment_success(uuid, bigint, text, text, text) from anon;
revoke all on function public.apply_payment_success(uuid, bigint, text, text, text) from authenticated;
grant execute on function public.apply_payment_success(uuid, bigint, text, text, text) to service_role;

create table if not exists public.hesabpay_credential_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  changed_fields text[] not null check (cardinality(changed_fields) > 0),
  merchant_id_hash text,
  created_at timestamptz not null default now()
);

alter table public.hesabpay_credential_audit_log enable row level security;
revoke all on table public.hesabpay_credential_audit_log from anon, authenticated;
grant select, insert on table public.hesabpay_credential_audit_log to authenticated;

create policy "Admins read HesabPay credential audit"
  on public.hesabpay_credential_audit_log for select to authenticated
  using (exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  ));

create policy "Admins append own HesabPay credential audit"
  on public.hesabpay_credential_audit_log for insert to authenticated
  with check (
    actor_user_id = (select auth.uid())
    and exists (
      select 1 from public.admin_users
      where user_id = (select auth.uid())
    )
  );

-- Payment values originate only from service-role payment and admin server
-- workflows. Guest booking inserts may retain their safe defaults.
create or replace function public.prevent_untrusted_booking_payment_mutation()
returns trigger
language plpgsql
set search_path = public, auth
as $$
begin
  if coalesce((select auth.jwt() ->> 'role'), '') = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.quoted_amount_minor is not null
       or new.quoted_currency is not null
       or new.payment_status <> 'unpaid'
       or new.paid_at is not null
       or new.reference_price_minor is not null
       or new.reference_price_currency is not null
       or coalesce(new.amount_paid_minor, 0) <> 0 then
      raise exception 'payment fields may only be set by trusted server workflows';
    end if;
    return new;
  end if;

  if new.quoted_amount_minor is distinct from old.quoted_amount_minor
     or new.quoted_currency is distinct from old.quoted_currency
     or new.payment_status is distinct from old.payment_status
     or new.payment_access_token is distinct from old.payment_access_token
     or new.paid_at is distinct from old.paid_at
     or new.reference_price_minor is distinct from old.reference_price_minor
     or new.reference_price_currency is distinct from old.reference_price_currency
     or new.amount_paid_minor is distinct from old.amount_paid_minor then
    raise exception 'payment fields may only be updated by trusted server workflows';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_untrusted_booking_payment_mutation on public.booking_requests;
create trigger prevent_untrusted_booking_payment_mutation
  before insert or update on public.booking_requests
  for each row execute function public.prevent_untrusted_booking_payment_mutation();

-- Public buckets serve known object URLs without storage.objects SELECT
-- policies. Removing these policies prevents bucket enumeration.
drop policy if exists "Public read brand bucket" on storage.objects;
drop policy if exists "Public read gallery bucket" on storage.objects;
drop policy if exists "Public read journey bucket" on storage.objects;

-- OTPs are only read and written through the server service-role client.
revoke all on table public.admin_password_otps from anon, authenticated;
create policy "Service role manages admin password OTPs"
  on public.admin_password_otps for all to service_role
  using (true)
  with check (true);
