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

-- Gift certificates, sold at the counter. Shared by link; staff scan the QR to use them.
create table if not exists gift_cards (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  code text not null unique,
  kind text not null check (kind in ('amount','item')),
  label text not null,                    -- "Gift card" or the item, e.g. "Free coffee"
  amount int not null,                    -- starting value (1 for an item)
  balance int not null,
  to_name text, from_name text, message text,
  expires_at timestamptz not null,
  void boolean not null default false,
  created_by uuid references staff(id),
  created_at timestamptz not null default now()
);
create index if not exists gift_cards_business_idx on gift_cards(business_id, created_at desc);
create table if not exists gift_card_uses (
  id bigserial primary key,
  gift_card_id uuid not null references gift_cards(id) on delete cascade,
  amount int not null,
  staff_id uuid references staff(id),
  created_at timestamptz not null default now()
);

-- Offers the owner sends to a group of members (WhatsApp, wallet and a banner on the card).
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  staff_id uuid references staff(id),
  segment text not null,
  message text not null,
  voucher jsonb,                          -- optional gift: { label, kind, value, days }
  recipients int not null default 0,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists campaigns_business_idx on campaigns(business_id, created_at desc);
create table if not exists campaign_recipients (
  campaign_id uuid not null references campaigns(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','done')),
  whatsapp boolean not null default false,
  wallet boolean not null default false,
  primary key (campaign_id, customer_id)
);
alter table vouchers drop constraint if exists vouchers_source_check;
alter table vouchers add constraint vouchers_source_check check (source in ('spin','birthday','gift','campaign'));

-- Apple / Google Wallet cards
alter table customers add column if not exists wallet_token text unique;  -- fixed barcode on wallet cards
alter table customers add column if not exists wallet_updated_at timestamptz;
alter table customers add column if not exists wallet_news text;          -- latest offer shown on the pass
alter table customers add column if not exists google_wallet boolean not null default false;
create table if not exists apple_devices (
  device_id text primary key,
  push_token text not null,
  updated_at timestamptz not null default now()
);
create table if not exists apple_registrations (
  device_id text not null references apple_devices(device_id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (device_id, customer_id)
);

-- Customers sign up with a username (WhatsApp number stays for codes and messages)
alter table customers add column if not exists username text;
alter table customers add column if not exists terms_accepted_at timestamptz;
create unique index if not exists customers_username_idx on customers (business_id, lower(username)) where username is not null;

-- Stamp codes: customers type a code from staff instead of being scanned
alter table stamps drop constraint if exists stamps_reason_check;
alter table stamps add constraint stamps_reason_check check (reason in ('purchase','double_hour','welcome','social','referral','streak','redeem','adjust','bonus'));
create table if not exists code_uses (       -- counter codes: once per customer per day per kind
  customer_id uuid not null references customers(id) on delete cascade,
  kind text not null check (kind in ('stamp','bonus')),
  day date not null,
  created_at timestamptz not null default now(),
  primary key (customer_id, kind, day)
);
create table if not exists personal_codes (  -- one-off codes a manager sends to one customer
  id bigserial primary key,
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  code text not null,
  stamps int not null check (stamps between 1 and 20),
  note text,
  created_by uuid references staff(id),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  unique (customer_id, code)
);

-- Gift certificates can be sent to a member: they show on that member's card
alter table gift_cards add column if not exists customer_id uuid references customers(id) on delete set null;
alter table gift_cards add column if not exists from_customer_id uuid references customers(id) on delete set null;  -- member who bought it
alter table gift_cards add column if not exists to_phone text;                                                       -- friend who isn't a member yet

-- Images businesses upload in Settings (logo, background photo, stamp). Served from /api/uploads/{id}.
create table if not exists uploads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  kind text not null check (kind in ('logo','background','stamp')),
  content_type text not null,
  data bytea not null,
  created_at timestamptz not null default now()
);
create index if not exists uploads_business_idx on uploads(business_id, created_at desc);

-- Phone notifications for members who added the card to their home screen (web push)
create table if not exists push_subscriptions (
  endpoint text not null,                -- one per phone; the same phone can follow several cards
  customer_id uuid not null references customers(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  primary key (endpoint, customer_id)
);
create index if not exists push_subscriptions_customer_idx on push_subscriptions(customer_id);
alter table campaign_recipients add column if not exists push boolean not null default false;

-- Black card: free coffee for life, sent by a manager (lib/blackcard.ts also adds these on first use)
alter table customers add column if not exists black_card_at timestamptz;
alter table customers add column if not exists black_card_by uuid references staff(id) on delete set null;
alter table customers add column if not exists black_card_welcomed_at timestamptz;  -- intro animation shown
