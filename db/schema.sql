-- Loyalty platform schema (multi-business). Safe to run more than once.
create extension if not exists pgcrypto;

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,              -- used in the URL: /roasted
  name text not null,
  settings jsonb not null default '{}',   -- branding + program rules, see lib/business.ts
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  phone text not null,                    -- digits only, international format, e.g. 6281234567890
  birthday_month int check (birthday_month between 1 and 12),
  birthday_day int check (birthday_day between 1 and 31),
  marketing_opt_in boolean not null default false,
  ref_code text not null unique,
  referred_by uuid references customers(id),
  referral_rewarded boolean not null default false,
  last_nudged_at timestamptz,
  created_at timestamptz not null default now(),
  unique (business_id, phone)
);

create table if not exists otp_codes (
  business_id uuid not null references businesses(id) on delete cascade,
  phone text not null,
  code_hash text not null,
  attempts int not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (business_id, phone)
);

create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  pin_hash text not null,
  role text not null default 'staff' check (role in ('staff','manager')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Every stamp change is one row. Balance = sum(delta). Redeeming a reward is a negative row.
create table if not exists stamps (
  id bigserial primary key,
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  delta int not null,
  reason text not null check (reason in ('purchase','double_hour','welcome','social','referral','streak','redeem','adjust')),
  staff_id uuid references staff(id),
  note text,
  created_at timestamptz not null default now()
);
create index if not exists stamps_customer_idx on stamps(customer_id, created_at desc);
create index if not exists stamps_business_idx on stamps(business_id, created_at desc);

create table if not exists spins (
  id bigserial primary key,
  customer_id uuid not null references customers(id) on delete cascade,
  source text not null check (source in ('redeem','weekly','gift','halfway')),
  period_key text,                       -- e.g. 2026-40 for weekly spins, stops doubles
  used_at timestamptz,
  voucher_id uuid,
  created_at timestamptz not null default now(),
  unique (customer_id, source, period_key)
);

create table if not exists vouchers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  label text not null,
  kind text not null check (kind in ('percent','item')),
  value int not null default 0,
  source text not null check (source in ('spin','birthday','gift')),
  period_key text,
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  redeemed_by uuid references staff(id),
  reminded_at timestamptz,
  created_at timestamptz not null default now(),
  unique (customer_id, source, period_key)
);

create table if not exists social_submissions (
  id bigserial primary key,
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  url text not null,
  platform text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references staff(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists social_status_idx on social_submissions(business_id, status, created_at);

create table if not exists rate_limits (
  key text primary key,
  count int not null,
  window_start timestamptz not null
);

create table if not exists trial_requests (
  id bigserial primary key,
  business_name text not null,
  business_type text,
  contact_name text not null,
  whatsapp text not null,
  email text,
  city text,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table customers add column if not exists review_asked_at timestamptz;
alter table customers add column if not exists password_hash text;
alter table spins drop constraint if exists spins_source_check;
alter table spins add constraint spins_source_check check (source in ('redeem','weekly','gift','halfway'));
