# Rewards platform

Digital stamp cards for any business: cafes, restaurants, barbers, salons, gyms, bakeries. One app hosts many businesses, each with its own link, branding and loyalty rules. Roasted is business #1.

## What each business gets

| Page | Who | What |
|---|---|---|
| `/{slug}` | Customers | Sign up with a username, password and WhatsApp number (and agree to the terms), or log in with username + password. A WhatsApp code is only used to reset a password |
| `/login` | Customers | Log in with username + password from the main site; "Sign up" finds the business first |
| `/me` | Customers | My cards: every card they have, plus search to join other businesses with one tap (same username and password) |
| `/terms` | Everyone | Terms and conditions customers agree to at sign-up |
| `/{slug}/card` | Customers | Stamp card, rotating QR code, spin to win, vouchers, social post stamps, refer-a-friend link, latest offer. Can be added to the home screen, or to Apple / Google Wallet |
| `/{slug}/g/{code}` | Anyone with the link | A gift certificate with its QR code and balance |
| `/{slug}/staff` | Staff (PIN) | Scan member, wallet or gift QR, or search phone; add stamps, redeem rewards and vouchers, approve social posts, sell and use gift certificates |
| `/{slug}/staff` | Manager (PIN) | Also: dashboard (repeat visits, customer groups, per-staff results), offers to customer groups, members list + CSV export, stamp adjustments, team PINs, **all settings** |
| `/platform` | You | Add businesses, pause them, reset manager PINs, see members and activity per client |

### Settings each business can change (Staff page > Settings)
- Name, tagline, logo, 6 colours, font, background texture, stamp icon (bean, cup, leaf, star, heart, scissors, paw, bolt, slice, drop)
- What earns a stamp ("coffee", "cut", "class"), up to 4 reward tiers (e.g. 5 = free pastry, 8 = free coffee)
- Welcome stamps, max stamps per scan, country code, timezone
- Social post stamps (amount, cooldown, handle to tag)
- Double stamp hours (times and days)
- Streak bonus, refer a friend, birthday treat
- Spin to win: halfway through the card, on redeem and/or weekly, prizes, % off, chances, voucher expiry
- Gift certificates on/off, how long they last, currency symbol
- Shop location (wallet cards remind members when they're nearby)
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
  - `offer` (Marketing), for offers sent from the Offers tab: `Hi {{1}}, news from {{2}}: {{3}} See your card: {{4}}`
  Put the token and phone number ID in `META_WA_TOKEN` and `META_WA_PHONE_NUMBER_ID`.

One WhatsApp sender serves all businesses; the business name is included in every message.

## Apple and Google Wallet (optional)

Members get an "Add to Apple Wallet" or "Add to Google Wallet" button on their card. The wallet card shows their stamps, updates by itself after every scan, and offers you send appear on their lock screen for free. The buttons only appear once the keys below are set; everything else works without them.

**Apple** (needs an Apple Developer account, USD 99 a year):
1. developer.apple.com > Certificates, Identifiers & Profiles > Identifiers > **+** > Pass Type IDs, e.g. `pass.com.yourdomain.rewards`.
2. Create a Pass Type ID certificate for it (upload a CSR made with Keychain Access or `openssl req -new -newkey rsa:2048 -nodes -keyout pass.key -out pass.csr`), download the `.cer`, then `openssl x509 -inform der -in pass.cer -out pass.pem`.
3. Download Apple's WWDR G4 certificate from apple.com/certificateauthority and convert it the same way.
4. Set `APPLE_PASS_TYPE_ID`, `APPLE_TEAM_ID` (top right of the developer site), `APPLE_PASS_CERT` (pass.pem), `APPLE_PASS_KEY` (pass.key), `APPLE_WWDR_CERT`, and `APPLE_PASS_KEY_PASSPHRASE` if your key has one. Paste the PEM text; `\n` in place of line breaks is fine.
`APP_URL` must be your real https domain, because iPhones call it to fetch card updates.

**Google** (free):
1. pay.google.com/business/console: create a Wallet issuer account and note the issuer ID.
2. In Google Cloud, enable the Google Wallet API, create a service account and a JSON key, then add the service account's email as a user in the Wallet console.
3. Set `GOOGLE_WALLET_ISSUER_ID`, `GOOGLE_WALLET_SA_EMAIL` and `GOOGLE_WALLET_SA_KEY` (the `private_key` from the JSON file).
4. New issuer accounts are in demo mode (only test users can save cards). Ask for publishing access in the Wallet console before launch.

Wallet cards carry a fixed QR code (wallets can't rotate it like the web card), so a screenshot of a wallet card can be scanned. Every stamp is still logged with the staff member, and the 3-minute repeat warning still applies.

## Good to know
- Indonesia's data protection law (UU PDP) needs consent for marketing messages. Signup has an opt-in tickbox (on by default, can be unticked) and reminders only go to members who opted in.
- Offers only go by WhatsApp to members who opted in, and a business can send at most 3 a day.
- Gift certificates are paid for at the till; the app records them but doesn't take card payments.
- Spin to win is free to play and prizes are discounts only. Indonesia is strict on gambling and prize draws (undian), so check with a local adviser before promoting it heavily.
- Don't give stamps for Google reviews. Google's rules ban rewarding reviews.

## Run locally
```
cp .env.example .env.local   # fill in DATABASE_URL etc.
npm install
npm run migrate
npm run dev                   # http://localhost:3000/platform
```
