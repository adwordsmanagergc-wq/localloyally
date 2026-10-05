import { randomInt } from 'node:crypto';
import { BLACK_FOOD_DAYS, BLACK_FOOD_EVERY, BLACK_FOOD_LABEL, blackCardFriends, blackCardReady } from './blackcard';
import { sql, type Tx } from './db';
import { halfwayAt, isDoubleHour, localNow, maxTier, type Business, type Prize } from './business';

export class RuleError extends Error {}

export async function getBalance(tx: Tx, customerId: string): Promise<number> {
  const [r] = await tx`select coalesce(sum(delta), 0)::int b from stamps where customer_id = ${customerId}`;
  return r.b;
}

export const REASON_LABEL: Record<string, string> = {
  purchase: 'Visit', double_hour: 'Double stamp hour', welcome: 'Welcome stamp', social: 'Social post',
  referral: 'Friend referral', streak: 'Streak bonus', redeem: 'Reward redeemed', adjust: 'Adjustment', bonus: 'Bonus stamp',
};

type StampEvent = { reason: string; delta: number };

/** Staff taps "+ stamp". qty = number of items in this order. */
/** staffId is null when the customer typed a counter code; note says so in the history. */
export async function addPurchase(biz: Business, customerId: string, staffId: string | null, qty: number, force: boolean, note: string | null = null) {
  const s = biz.settings;
  qty = Math.min(s.maxPerVisit, Math.max(1, Math.round(qty) || 1));
  const hasBlackCard = await blackCardReady();
  return sql.begin(async (tx) => {
    const [c] = await tx`select id, referred_by, referral_rewarded from customers
      where id = ${customerId} and business_id = ${biz.id} for update`;
    if (!c) throw new RuleError('Customer not found');

    if (!force) {
      const [recent] = await tx`select 1 from stamps where customer_id = ${customerId} and reason = 'purchase'
        and created_at > now() - interval '3 minutes' limit 1`;
      if (recent) return { needsConfirm: true as const };
    }

    const events: StampEvent[] = [];
    const add = async (cid: string, delta: number, reason: string, note: string | null = null) => {
      await tx`insert into stamps (business_id, customer_id, delta, reason, staff_id, note)
               values (${biz.id}, ${cid}, ${delta}, ${reason}, ${staffId}, ${note})`;
      if (cid === customerId) events.push({ reason, delta });
    };

    await add(customerId, qty, 'purchase', note);
    if (isDoubleHour(s)) await add(customerId, qty, 'double_hour');

    let referrerId: string | null = null;
    let referrerNote = '';
    if (s.referral.enabled && c.referred_by && !c.referral_rewarded) {
      const [{ n }] = await tx`select count(*)::int n from stamps where customer_id = ${customerId} and reason = 'purchase'`;
      if (n === 1) {
        // Only the referrer gets a bonus; the new member already got their welcome stamps.
        await tx`update customers set referral_rewarded = true where id = ${customerId}`;
        referrerId = c.referred_by;
        const [ref] = hasBlackCard ? await tx`select black_card_at from customers where id = ${c.referred_by}` : [];
        if (ref?.black_card_at) {
          // Black card members don't need stamps: every 5 friends who make a first visit earns free food
          // Only friends since they got the black card count
          const k = await blackCardFriends(tx, c.referred_by);
          if (k % BLACK_FOOD_EVERY === 0) {
            await tx`insert into vouchers (business_id, customer_id, label, kind, value, source, period_key, expires_at)
              values (${biz.id}, ${c.referred_by}, ${BLACK_FOOD_LABEL}, 'item', 0, 'campaign', ${`black-food-${new Date(ref.black_card_at).getTime()}-${k}`},
                      now() + make_interval(days => ${BLACK_FOOD_DAYS}::int))
              on conflict do nothing`;
            referrerNote = `🍽️ That's ${BLACK_FOOD_EVERY} friends! Free food of your choice from the menu is on your card.`;
          } else referrerNote = `Your friend just made their first visit. ${k % BLACK_FOOD_EVERY} of ${BLACK_FOOD_EVERY} towards free food from the menu 🍽️`;
        } else {
          await add(c.referred_by, s.referral.stamps, 'referral', 'Friend made first visit');
          referrerNote = `Your friend just made their first visit. +${s.referral.stamps} bonus stamp${s.referral.stamps === 1 ? '' : 's'} for you!`;
        }
      }
    }

    if (s.streak.enabled) {
      const [{ days }] = await tx`
        select count(distinct (created_at at time zone ${s.timezone})::date)::int days from stamps
        where customer_id = ${customerId} and reason = 'purchase' and created_at > now() - make_interval(days => ${s.streak.days}::int)`;
      if (days >= s.streak.visits) {
        const [already] = await tx`select 1 from stamps where customer_id = ${customerId} and reason = 'streak'
          and created_at > now() - make_interval(days => ${s.streak.days}::int)`;
        if (!already) await add(customerId, 1, 'streak', `${s.streak.visits} visits in ${s.streak.days} days`);
      }
    }

    // Balance before a full card turns into a voucher, so notifications can say what was just earned
    const fullBalance = await getBalance(tx, customerId);
    const rewards = await convertFullCard(tx, biz, customerId);
    return { events, balance: await getBalance(tx, customerId), fullBalance, rewards, referrerId, referrerNote };
  });
}

const REWARD_VOUCHER_DAYS = 10;

/**
 * A full card (the top reward's stamps) becomes a voucher for that reward and the card starts again,
 * keeping any extra stamps: 9 of 8 turns into a free coffee voucher and 1 stamp. Returns the rewards given.
 */
export async function convertFullCard(tx: Tx, biz: Business, customerId: string): Promise<string[]> {
  const top = maxTier(biz.settings);
  const reward = biz.settings.rewards.find((r) => r.stamps === top);
  if (!reward || top < 1) return [];
  const given: string[] = [];
  for (let bal = await getBalance(tx, customerId); bal >= top; bal -= top) {
    const [{ n }] = await tx`select count(*)::int n from stamps where customer_id = ${customerId} and reason = 'redeem'`;
    await tx`insert into stamps (business_id, customer_id, delta, reason, note)
             values (${biz.id}, ${customerId}, ${-top}, 'redeem', ${reward.label})`;
    await tx`insert into vouchers (business_id, customer_id, label, kind, value, source, period_key, expires_at)
      values (${biz.id}, ${customerId}, ${reward.label}, 'item', 0, 'campaign', ${'reward-' + n},
              now() + make_interval(days => ${REWARD_VOUCHER_DAYS}::int))
      on conflict do nothing`;
    given.push(reward.label);
  }
  return given;
}

/** Swap stamps for one of the reward tiers. */
export async function redeemReward(biz: Business, customerId: string, staffId: string, tierStamps: number) {
  const s = biz.settings;
  const tier = s.rewards.find((r) => r.stamps === tierStamps);
  if (!tier) throw new RuleError('Unknown reward');
  return sql.begin(async (tx) => {
    const [c] = await tx`select id from customers where id = ${customerId} and business_id = ${biz.id} for update`;
    if (!c) throw new RuleError('Customer not found');
    const bal = await getBalance(tx, customerId);
    if (bal < tier.stamps) throw new RuleError(`${tier.label} needs ${tier.stamps} stamps, they have ${bal}`);
    await tx`insert into stamps (business_id, customer_id, delta, reason, staff_id, note)
             values (${biz.id}, ${customerId}, ${-tier.stamps}, 'redeem', ${staffId}, ${tier.label})`;
    return { balance: bal - tier.stamps, label: tier.label };
  });
}

/** Rewards that appear on their own: the halfway spin and the birthday treat. */
export async function grantPassive(biz: Business, customerId: string) {
  const s = biz.settings;
  // One round trip for what's needed below (the database is far away, so every query counts)
  const [bal, [c]] = await Promise.all([
    getBalance(sql, customerId),
    s.birthday.enabled ? sql`select birthday_month m, birthday_day d from customers where id = ${customerId}` : Promise.resolve([] as any[]),
  ]);
  // Stamps from codes, posts or adjustments can fill a card too: turn it into the voucher (rare, so only then lock the card)
  if (bal >= maxTier(s))
    await sql.begin(async (tx) => {
      const [row] = await tx`select id from customers where id = ${customerId} and business_id = ${biz.id} for update`;
      if (row) await convertFullCard(tx, biz, customerId);
    });
  const jobs: Promise<unknown>[] = [];
  if (s.spin.enabled) {
    // The only spin: one per card, when they're halfway to the top reward (4 of 8). the key counts rewards claimed so far, so a new card earns a new spin.
    jobs.push(sql`
      insert into spins (customer_id, source, period_key)
      select ${customerId}, 'halfway', 'card-' || (select count(*) from stamps where customer_id = ${customerId} and reason = 'redeem')
      where (select coalesce(sum(delta), 0) from stamps where customer_id = ${customerId}) >= ${halfwayAt(s)}
      on conflict do nothing`);
  }
  if (s.birthday.enabled && c?.m && c?.d) jobs.push(grantBirthday(biz, customerId, c.m, c.d));
  await Promise.all(jobs);
}

async function grantBirthday(biz: Business, customerId: string, m: number, d: number) {
  const s = biz.settings;
  const c = { m, d };
  const l = localNow(s.timezone);
  const today = Date.UTC(l.year, l.month - 1, l.day);
  for (const y of [l.year - 1, l.year, l.year + 1]) {
    const day = c.m === 2 && c.d === 29 ? 28 : c.d;
    const diff = Math.round((today - Date.UTC(y, c.m - 1, day)) / 86400000); // negative = before birthday
    if (Math.abs(diff) <= s.birthday.windowDays) {
      const daysLeft = s.birthday.windowDays - diff + 1;
      await sql`insert into vouchers (business_id, customer_id, label, kind, value, source, period_key, expires_at)
        values (${biz.id}, ${customerId}, ${s.birthday.label}, 'item', 0, 'birthday', ${'bday-' + y},
                now() + make_interval(days => ${daysLeft}::int))
        on conflict do nothing`;
    }
  }
}

export function pickPrize(prizes: Prize[]) {
  const total = prizes.reduce((a, p) => a + Math.max(0, p.weight), 0);
  let r = randomInt(total);
  for (let i = 0; i < prizes.length; i++) {
    r -= Math.max(0, prizes[i].weight);
    if (r < 0) return i;
  }
  return prizes.length - 1;
}

/** The result is decided here on the server; the wheel just animates to it. */
export async function spin(biz: Business, customerId: string) {
  const s = biz.settings;
  if (!s.spin.enabled) throw new RuleError('Spin to win is switched off');
  return sql.begin(async (tx) => {
    const [sp] = await tx`select id from spins where customer_id = ${customerId} and source = 'halfway' and used_at is null
      order by created_at limit 1 for update skip locked`;
    if (!sp) throw new RuleError('No spins available');
    const index = pickPrize(s.spin.prizes);
    const prize = s.spin.prizes[index];
    const [v] = await tx`insert into vouchers (business_id, customer_id, label, kind, value, source, expires_at)
      values (${biz.id}, ${customerId}, ${prize.label}, ${prize.kind}, ${prize.value}, 'spin',
              now() + make_interval(days => ${s.spin.voucherDays}::int))
      returning id, expires_at`;
    await tx`update spins set used_at = now(), voucher_id = ${v.id} where id = ${sp.id}`;
    return { index, prize, expiresAt: v.expires_at as Date };
  });
}

export async function redeemVoucher(biz: Business, voucherId: string, customerId: string, staffId: string) {
  const [v] = await sql`update vouchers set redeemed_at = now(), redeemed_by = ${staffId}
    where id = ${voucherId} and customer_id = ${customerId} and business_id = ${biz.id}
      and redeemed_at is null and expires_at > now()
    returning label`;
  if (!v) throw new RuleError('Voucher already used or expired');
  return v.label as string;
}

const PLATFORMS: [RegExp, string][] = [
  [/(^|\.)instagram\.com$/, 'Instagram'], [/(^|\.)tiktok\.com$/, 'TikTok'],
  [/(^|\.)(facebook\.com|fb\.watch|fb\.com)$/, 'Facebook'], [/(^|\.)threads\.(net|com)$/, 'Threads'],
];

export async function submitSocial(biz: Business, customerId: string, rawUrl: string) {
  const s = biz.settings;
  if (!s.social.enabled) throw new RuleError('Social stamps are switched off');
  let url: URL;
  try { url = new URL(String(rawUrl).trim()); } catch { throw new RuleError('Paste the full link to your post'); }
  if (url.protocol !== 'https:') throw new RuleError('Paste the full https link to your post');
  const platform = PLATFORMS.find(([re]) => re.test(url.hostname.toLowerCase()))?.[1];
  if (!platform) throw new RuleError('Link must be an Instagram, TikTok, Facebook or Threads post');
  const [block] = await sql`select status from social_submissions where customer_id = ${customerId}
    and (status = 'pending' or (status = 'approved' and created_at > now() - make_interval(days => ${s.social.cooldownDays}::int)))
    order by created_at desc limit 1`;
  if (block?.status === 'pending') throw new RuleError('Your last post is still waiting for approval');
  if (block) throw new RuleError(`You can earn post stamps once every ${s.social.cooldownDays} days`);
  const clean = url.origin + url.pathname;
  const [dupe] = await sql`select 1 from social_submissions where business_id = ${biz.id} and url = ${clean} and status <> 'rejected'`;
  if (dupe) throw new RuleError('That post has already been submitted');
  await sql`insert into social_submissions (business_id, customer_id, url, platform) values (${biz.id}, ${customerId}, ${clean}, ${platform})`;
  return platform;
}

export async function reviewSocial(biz: Business, id: number, approve: boolean, staffId: string) {
  return sql.begin(async (tx) => {
    const [sub] = await tx`update social_submissions set status = ${approve ? 'approved' : 'rejected'},
      reviewed_by = ${staffId}, reviewed_at = now()
      where id = ${id} and business_id = ${biz.id} and status = 'pending' returning customer_id`;
    if (!sub) throw new RuleError('Already reviewed');
    if (approve)
      await tx`insert into stamps (business_id, customer_id, delta, reason, staff_id)
               values (${biz.id}, ${sub.customer_id}, ${biz.settings.social.stamps}, 'social', ${staffId})`;
    return sub.customer_id as string;
  });
}

export async function customerSummary(biz: Business, customerId: string) {
  const hasBlackCard = await blackCardReady();
  const [c] = await sql`select id, name, username, phone, ref_code, marketing_opt_in, created_at,
      ${hasBlackCard ? sql`black_card_at, black_card_welcomed_at` : sql`null::timestamptz black_card_at, null::timestamptz black_card_welcomed_at`}
    from customers where id = ${customerId} and business_id = ${biz.id}`;
  if (!c) return null;
  const [balance, [spins], vouchers, history, [social], [lastVisit]] = await Promise.all([
    getBalance(sql, customerId),
    sql`select count(*)::int n from spins where customer_id = ${customerId} and source = 'halfway' and used_at is null`,
    sql`select id, label, kind, value, source, period_key, expires_at from vouchers where customer_id = ${customerId}
        and redeemed_at is null and expires_at > now() order by expires_at`,
    sql`select delta, reason, note, created_at from stamps where customer_id = ${customerId} order by created_at desc, id desc limit 10`,
    sql`select status, created_at from social_submissions where customer_id = ${customerId} order by created_at desc limit 1`,
    sql`select max(created_at) as at, count(*)::int as visits from stamps where customer_id = ${customerId} and reason = 'purchase'`,
  ]);
  return {
    customer: c, balance, spins: biz.settings.spin.enabled ? (spins.n as number) : 0, vouchers, history,
    lastSocial: social ?? null, lastVisit: lastVisit?.at ?? null, visits: (lastVisit?.visits as number) ?? 0, doubleHourNow: isDoubleHour(biz.settings),
    maxTier: maxTier(biz.settings),
  };
}
