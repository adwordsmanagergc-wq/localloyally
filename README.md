# Rewards platform

Digital stamp cards for any business: cafes, restaurants, barbers, salons, gyms, bakeries. One app hosts many businesses, each with its own link, branding and loyalty rules. Roasted is business #1.

## What each business gets

| Page | Who | What |
|---|---|---|
| `/{slug}` | Customers | Join or log in with name + WhatsApp number (6-digit code sent on WhatsApp) |
| `/{slug}/card` | Customers | Stamp card, rotating QR code, spin to win, vouchers, social post stamps, refer-a-friend link. Can be added to the home screen like an app |
| `/{slug}/staff` | Staff (PIN) | Scan QR or search phone, add stamps, redeem rewards and vouchers, approve social posts |
| `/{slug}/staff` | Manager (PIN) | Also: dashboard, members list + CSV export, stamp adjustments, team PINs, **all settings** |
| `/platform` | You | Add businesses, pause them, reset manager PINs, see members and activity per client |

### Settings each business can change (Staff page > Settings)
- Name, tagline, logo, 6 colours, font, background texture, stamp icon (bean, cup, leaf, star, heart, scissors, paw, bolt, slice, drop)
- What earns a stamp ("coffee", "cut", "class"), up to 4 reward tiers (e.g. 5 = free pastry, 8 = free coffee)
- Welcome stamps, max stamps per scan, country code, timezone
- Social post stamps (amount, cooldown, handle to tag)
- Double stamp hours (times and days)
- Streak bonus, refer a friend, birthday treat
- Spin to win: on redeem and/or weekly, prizes, % off, chances, voucher expiry
- WhatsApp reminders (1 stamp away, voucher expiring)

New businesses start from a template: cafe, matcha/tea bar, restaurant, barber/salon, beauty/spa, gym/studio, bakery.

### Anti-cheat built in
- Customer QR code expires every 10 minutes (screenshots stop working) and only works for that business
- Staff get a warning if they stamp the same person twice within 3 minutes
- Spin results are decided on the server, not in the browser
- Social posts need staff approval, one pending at a time, cooldown between posts, same link can't be used twice
- PIN and code attempts are rate limited; every stamp is logged with the staff member who gave it

## Set up (about 20 minutes)

1. **Database:** create a free project at supabase.com. Copy the connection string (Project settings > Database > Connection pooling, port 6543).
2. **Code:** push this folder to a new GitHub repo (e.g. `rewards-platform`).
3. **Vercel:** import the repo. Add the environment variables from `.env.example`:
   - `DATABASE_URL`, `SESSION_SECRET` (run `openssl rand -hex 32`), `PLATFORM_ADMIN_PASSWORD`, `APP_URL`, `CRON_SECRET`
   - `WHATSAPP_PROVIDER` (see below)
   - `PLATFORM_NAME`, `CONTACT_WHATSAPP` (your number, digits with country code): the home page's "Start free trial" button opens a WhatsApp chat with you. `CONTACT_EMAIL` is used instead if no number is set.
4. **Create tables:** on your computer, put the same values in `.env.local`, then `npm install` and `npm run migrate`.
5. **Domain:** add e.g. `rewards.metatap...` or `loyalty.yourdomain.com` in Vercel > Domains.
6. Go to `/platform`, log in, add **Roasted** (link name `roasted`, template Cafe), then log in at `/roasted/staff` with the manager PIN and open Settings.
7. Put a "Rewards" button on the Roasted website linking to `https://your-domain/roasted`, and print a QR code of that link for the counter.

The daily reminder job is already set in `vercel.json` (10am Bali time).

## WhatsApp

- `WHATSAPP_PROVIDER=dev`: codes are printed in the Vercel logs. Use for testing only.
- `WHATSAPP_PROVIDER=fonnte` (quickest in Indonesia): sign up at fonnte.com, connect a spare WhatsApp number by scanning the QR, copy the token into `FONNTE_TOKEN`. Works straight away. Uses an unofficial connection, so use a dedicated number, not your main one.
- `WHATSAPP_PROVIDER=meta` (official, best once you have many clients): set up WhatsApp Cloud API in Meta Business Manager, then create and get approved 3 templates:
  - `login_code` (category Authentication, copy-code button): `{{1}} is your verification code.`
  - `one_stamp_away` (Marketing): `Hi {{1}}! You're 1 stamp away from your next reward: {{2}} at {{3}}.`
  - `voucher_expiring` (Marketing): `Hi {{1}}, your {{2}} voucher at {{3}} expires soon.`
  Put the token and phone number ID in `META_WA_TOKEN` and `META_WA_PHONE_NUMBER_ID`.

One WhatsApp sender serves all businesses; the business name is included in every message.

## Good to know
- Indonesia's data protection law (UU PDP) needs consent for marketing messages. Signup has an opt-in tickbox (on by default, can be unticked) and reminders only go to members who opted in.
- Spin to win is free to play and prizes are discounts only. Indonesia is strict on gambling and prize draws (undian), so check with a local adviser before promoting it heavily.
- Don't give stamps for Google reviews. Google's rules ban rewarding reviews.

## Run locally
```
cp .env.example .env.local   # fill in DATABASE_URL etc.
npm install
npm run migrate
npm run dev                   # http://localhost:3000/platform
```
