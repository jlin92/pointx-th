import type { AppUserId, MusePrompt, MuseReply, Offer, ProactiveNudge, Tier } from '@/types';
import { byType, catalogue, expandQuery, offer, pointsPerBaht, searchOffers } from '@/mock-data/offers';
import { settings } from '@/mock-data/settings';
import { ID } from '@/mock-data/catalogueIds';
import { daysUntil, formatPoints, formatThb } from '@/hooks/utils';

/** Live member state the dynamic resolvers need. */
export interface MuseContext {
  points: number;
  tier: Tier;
  walletIds: Set<string>;
  redeemedIds: Set<string>;
  joinedIds: Set<string>;
  dislikedIds: Set<string>;
  /** Progress on joined missions. */
  joined: Record<string, number>;
  hasCreditCard: boolean;
  isWealth: boolean;
  /** Seed + live affinities merged. */
  affinities: Record<string, number>;
  linkedPartners: Record<string, number>;
  expiringPoints?: { amount: number; when: string };
}

const RATE = settings.pointsPerBaht;
const ids = (list: Offer[]) => list.map((o) => o.id);
const usable = (o: Offer, ctx: MuseContext) => o.inStock && daysUntil(o.validUntil) >= 0 && !ctx.redeemedIds.has(o.id) && !ctx.walletIds.has(o.id) && !ctx.dislikedIds.has(o.id) && (o.memberLevel !== 'Wealth' || ctx.isWealth) && (o.memberLevel !== 'Cardholder' || ctx.hasCreditCard);
const aff = (o: Offer, ctx: MuseContext) => Math.max((ctx.affinities[o.category] ?? 0) * 0.6, ctx.affinities[`brand:${o.brandId}`] ?? 0, ...o.tags.map((t) => (ctx.affinities[`tag:${t}`] ?? 0) * 0.3));
const saving = (o: Offer) => {
  const ppb = pointsPerBaht(o);
  return ppb == null ? 0 : 1 - ppb / RATE;
};
const valueNote = (o: Offer) => {
  const ppb = pointsPerBaht(o);
  if (ppb == null) return o.subtitle ?? '';
  const s = Math.round(saving(o) * 100);
  return s > 0 ? `${ppb} pts per ฿1 · ${s}% below 12.5` : `${ppb} pts per ฿1`;
};
const split = (o: Offer, ctx: MuseContext) => {
  const gap = o.pointsCost - ctx.points;
  if (gap <= 0) return `Within your points · ${formatPoints(ctx.points - o.pointsCost)} left after`;
  if (o.pointPlusMoney) return `Point+Money · all ${formatPoints(ctx.points)} pts + ${formatThb(Math.ceil(gap / RATE))}`;
  return `Needs ${formatPoints(gap)} more points`;
};
const within = (o: Offer, ctx: MuseContext) => (o.pointsCost <= ctx.points ? 0 : 1);
const dedupeBrand = (list: Offer[]) => list.filter((o, i, arr) => arr.findIndex((x) => x.brandId === o.brandId) === i);
const transferOptions = (ctx: MuseContext) =>
  Object.entries(ctx.linkedPartners)
    .map(([id, balance]) => {
      const partner = offer(id);
      if (partner.offerType !== 'Transfer' || !partner.transferFrom || !partner.transferTo || ctx.joinedIds.has(id)) return null;
      return { partner, balance, receive: Math.floor((balance / partner.transferFrom) * partner.transferTo) };
    })
    .filter((x): x is { partner: Offer; balance: number; receive: number } => !!x)
    .sort((a, b) => b.receive - a.receive);

/* ================================================================== */
/* PERSONA 1 — Mint · NEW MEMBER (education + affordable value + earn)   */
/* ================================================================== */

const mintScripts: Record<string, MuseReply> = {
  'how-it-works': {
    kind: 'support',
    text: 'Welcome to POINTX, Mint! Here’s the whole thing in three lines:',
    bullets: [
      'Pay with points anywhere you see the POINTX QR — 12.5 points = ฿1. Deal shops like Café Amazon give 30–70% of the bill back as points.',
      'Redeem in X Store: 5,000+ items, e-Coupons, restaurants and trips — fully with points, or Point+Money when you’re a bit short.',
      'Bring points together: AIS, The 1, M Card and more convert into POINTX in seconds, and missions pay bonus points for everyday things.',
    ],
    chips: ['New member', 'Programme basics'],
    followups: ['What can I get with 1,250 points?', 'How do I earn points fast?', 'Transfer my AIS Points'],
  },
  airpods: {
    kind: 'commerce',
    text: 'AirPods 5 with the charging case are a flash deal tonight — 61,763 points. You have 1,250, so here are your three routes:',
    chips: ['Intent: AirPods', 'Flash deal · ends tonight', 'Point+Money'],
    results: [ID.AIRPODS5_CASE, ID.T_AIS, ID.M_FIRST_REDEEM, ID.REDMI_BUDS],
    reasons: ['Point+Money · 1,250 pts + ฿4,842 today', 'Transfer 3,200 AIS → +12,800 POINTX', '+500 points on your first X Store redemption', 'Same idea for 3,590 points — nearly within reach'],
    followups: ['Transfer my AIS Points', 'How do I earn points fast?', 'Show me cheaper earbuds'],
  },
};

const mintRules: { match: RegExp; key: string }[] = [
  { match: /(airpods|air pods)/i, key: 'airpods' },
  { match: /(how.*(work|start)|what is pointx|new here|explain|tour)/i, key: 'how-it-works' },
];

/* ================================================================== */
/* PERSONA 2 — Korn · RETURNING SCB WEALTH (expiry + dining + travel)    */
/* ================================================================== */

const kornScripts: Record<string, MuseReply> = {
  macbook: {
    kind: 'commerce',
    text: 'MacBook Neo is a flash deal — 306,900 points (12% off) with only 2 left. You have 186,420. Two ways to close it today:',
    chips: ['Flash deal · 2 left', 'Point+Money', 'Partner top-up'],
    results: [ID.MACBOOK_NEO, ID.T_MCARD, ID.M_CARD_BILL],
    reasons: ['Point+Money · 186,420 pts + ฿9,639', 'Transfer 4,400 M Card → +4,000 POINTX', '+2,000 bonus when you pay your card bill with points'],
    followups: ['Use my expiring points', 'Plan a Japan trip with points', 'Any other Apple deals?'],
  },
  wealth: {
    kind: 'support',
    text: 'As an SCB Wealth member you see Wealth Wonders — this month it’s up to 1,000,000 points back on card spend, plus:',
    bullets: ['Pay your SCB Private Banking card bill with POINTX and earn 2,000 bonus points (your targeted mission).', 'Wealth-only items in X Store, like iPhone 18 Pro Max and Whoop Life.', 'Airport lounges (Miracle, The Coral) accept scan & pay.'],
    chips: ['SCB Wealth', 'Segment-gated'],
    action: { label: 'See Wealth Wonders', chapter: 3, chip: 'x-deal' },
    followups: ['Use my expiring points', 'Book dinner this weekend'],
  },
  'pay-amazon': {
    kind: 'support',
    text: 'Pay with POINTX. Café Amazon gives 30% of the bill back as points when you scan with POINTX — a ฿135 coffee costs 1,688 points and returns 506. You have 24,000 expiring on 31 Dec, so spending points here is pure upside.',
    chips: ['30% points back', 'Expiring points', 'Scan & pay'],
    followups: ['Use my expiring points', 'Which shops give points back?'],
  },
};

const kornRules: { match: RegExp; key: string }[] = [
  { match: /(macbook|laptop)/i, key: 'macbook' },
  { match: /(wealth|benefit|private banking|exclusive)/i, key: 'wealth' },
  { match: /(points or money|pay with points|should i pay).*(amazon|coffee|café)/i, key: 'pay-amazon' },
];

/* ================================================================== */
/* SHARED — static answers                                              */
/* ================================================================== */

const commonScripts: Record<string, MuseReply> = {
  gift: {
    kind: 'support',
    text: 'Happy to help you find a gift. Tell me who it’s for and I’ll pick items within your points first, then Point+Money options.',
    chips: ['Intent: gifting', 'Guided discovery'],
    followups: ['For my partner', 'For a friend', 'For my mum', 'For the kids', 'A gift under 5,000 points'],
  },
};

const commonRules: { match: RegExp; key: string }[] = [{ match: /^(help me find a gift|gift ideas?|gifts?\b|present\b|ของขวัญ)/i, key: 'gift' }];

/* ================================================================== */
/* DYNAMIC — answers computed from the feed and the member's state       */
/* ================================================================== */

const giftTags: Record<string, string[]> = {
  partner: ['perfume', 'jewelry', 'romantic', 'fine dining', 'staycation', 'massage'],
  wife: ['perfume', 'jewelry', 'romantic', 'luxury'],
  husband: ['watch', 'gaming', 'headphones', 'fine dining'],
  boyfriend: ['headphones', 'gaming', 'watch', 'coffee'],
  girlfriend: ['perfume', 'skincare', 'jewelry', 'dessert'],
  friend: ['coffee', 'dessert', 'massage', 'movie', 'bubble tea'],
  mum: ['skincare', 'massage', 'spa', 'afternoon tea', 'kitchen'],
  mom: ['skincare', 'massage', 'spa', 'kitchen'],
  mother: ['skincare', 'massage', 'spa', 'kitchen'],
  dad: ['shaver', 'tools', 'coffee machine', 'fuel'],
  father: ['shaver', 'tools', 'coffee machine'],
  kid: ['kids', 'toys', 'gaming', 'ice cream'],
  kids: ['kids', 'toys', 'gaming', 'ice cream'],
  children: ['kids', 'toys', 'gaming'],
  son: ['gaming', 'toys', 'headphones'],
  daughter: ['toys', 'skincare', 'bubble tea'],
};

function resolveDynamic(userId: AppUserId, text: string, ctx: MuseContext): { reply: MuseReply; intent: string } | null {
  const t = text.toLowerCase();
  const redeemable = catalogue.filter((o) => ['Product', 'eCoupon', 'Dining'].includes(o.offerType) && usable(o, ctx));

  // Gift follow-ups ("for my partner", "a gift under 5,000 points", "something for the kids")
  const giftFor = t.match(/for (?:my |the )?(partner|wife|husband|boyfriend|girlfriend|friend|mum|mom|mother|dad|father|kids?|children|son|daughter)/);
  const cap = /under (\d[\d,]*)/.exec(t)?.[1]?.replace(/,/g, '');
  if (giftFor || (cap && /gift/.test(t))) {
    const who = giftFor?.[1] ?? 'budget';
    const tags = giftTags[who] ?? [];
    const list = dedupeBrand(
      redeemable
        .filter((o) => o.offerType !== 'Dining' || ['partner', 'wife', 'husband'].includes(who))
        .filter((o) => (tags.length ? o.tags.some((x) => tags.includes(x)) : true))
        .filter((o) => (cap ? o.pointsCost <= Number(cap) : true))
        .sort((a, b) => within(a, ctx) - within(b, ctx) || saving(b) - saving(a) || b.redemptions - a.redemptions),
    ).slice(0, 4);
    if (list.length)
      return {
        intent: `gift-${who}`,
        reply: {
          kind: 'commerce',
          text: cap ? `Gifts under ${formatPoints(Number(cap))} points — best value per point first:` : `For ${giftFor?.[0].replace(/^for /, '')} — within your ${formatPoints(ctx.points)} points first, then Point+Money:`,
          chips: [`Gift · ${who}`, 'Within your points first'],
          results: ids(list),
          reasons: list.map((o) => split(o, ctx)),
          followups: ['A gift under 5,000 points', 'Help me find a gift', ctx.points > 0 ? 'What can I get with my points?' : 'How do I earn points fast?'],
        },
      };
  }

  // "What can I get with my points?" / "what can 1,250 points buy"
  if (/(what can i (get|redeem|buy)|with my points|points (get|buy) me|what can \d|within my points|afford)/.test(t)) {
    const list = dedupeBrand(redeemable.filter((o) => o.pointsCost > 0 && o.pointsCost <= ctx.points).sort((a, b) => saving(b) * 0.6 + aff(b, ctx) * 0.4 - (saving(a) * 0.6 + aff(a, ctx) * 0.4) || b.redemptions - a.redemptions)).slice(0, 4);
    if (!list.length) {
      const earn = byType('Mission')
        .filter((m) => usable(m, ctx) && !ctx.joinedIds.has(m.id))
        .slice(0, 3);
      return { intent: 'earn', reply: { kind: 'commerce', text: 'Nothing fits your balance yet — but these missions get you there fast:', chips: ['Earn boost'], results: ids(earn), reasons: earn.map((m) => `+${formatPoints(m.rewardPoints ?? 0)} · ${m.subtitle}`), followups: ['How do I earn points fast?', 'Transfer partner points'] } };
    }
    const stretch = redeemable.filter((o) => o.pointPlusMoney && o.pointsCost > ctx.points && o.pointsCost <= ctx.points * 4).sort((a, b) => aff(b, ctx) - aff(a, ctx) || b.redemptions - a.redemptions)[0];
    return {
      intent: 'within-balance',
      reply: {
        kind: 'commerce',
        text: `${formatPoints(ctx.points)} points goes further than you’d think. Best value per point first — these all fit your balance${ctx.expiringPoints ? `, and they use the ${formatPoints(ctx.expiringPoints.amount)} expiring ${ctx.expiringPoints.when}` : ''}:`,
        chips: ['Within your balance', 'Best value per point', ...(ctx.expiringPoints ? ['Expiring points'] : [])],
        results: [...ids(list), ...(stretch ? [stretch.id] : [])],
        reasons: [...list.map((o) => valueNote(o)), ...(stretch ? [`Stretch · ${split(stretch, ctx)}`] : [])],
        action: { label: 'See all within your points', chapter: 3, chip: 'x-all' },
        followups: ['How do I earn points fast?', 'Find me a coffee deal', 'Help me find a gift'],
      },
    };
  }

  // Expiring points
  if (/(expir|before they go|lose my points|use my points)/.test(t) && ctx.expiringPoints) {
    const list = dedupeBrand(redeemable.filter((o) => o.pointsCost > 0 && o.pointsCost <= ctx.points).sort((a, b) => saving(b) * 0.5 + aff(b, ctx) * 0.5 - (saving(a) * 0.5 + aff(a, ctx) * 0.5))).slice(0, 4);
    return {
      intent: 'expiring',
      reply: {
        kind: 'commerce',
        text: `You have ${formatPoints(ctx.expiringPoints.amount)} points expiring ${ctx.expiringPoints.when} (≈${formatThb(ctx.expiringPoints.amount / RATE)}). Highest value per point for the things you actually do — dining, coffee, Apple — all within your balance:`,
        chips: [`${formatPoints(ctx.expiringPoints.amount)} expiring`, 'User margin', 'Your affinities'],
        results: ids(list),
        reasons: list.map((o) => `${valueNote(o)} · ${split(o, ctx).split(' · ')[0]}`),
        followups: ['Book dinner this weekend', 'Plan a Japan trip with points', 'Which shops give points back?'],
      },
    };
  }

  // Transfer partner points
  if (/(transfer|move|convert|bring).*(point|ais|the 1|m card|lotus|partner)|partner points|my ais/.test(t)) {
    const opts = transferOptions(ctx);
    if (opts.length) {
      const total = opts.reduce((s, x) => s + x.receive, 0);
      return {
        intent: 'transfer',
        reply: {
          kind: 'commerce',
          text: `You’ve got ${opts.map((x) => `${formatPoints(x.balance)} ${x.partner.brand}`).join(' and ')} sitting unused. Moved into POINTX that’s +${formatPoints(total)} — taking you to ${formatPoints(ctx.points + total)}. One tap each:`,
          chips: ['Linked partners', 'Real-time balance', 'Earn boost'],
          results: [...opts.map((x) => x.partner.id), ...(ctx.joinedIds.has(ID.M_TRANSFER) ? [] : [ID.M_TRANSFER])],
          reasons: [...opts.map((x) => `${formatPoints(x.balance)} → +${formatPoints(x.receive)} POINTX`), ...(ctx.joinedIds.has(ID.M_TRANSFER) ? [] : ['+200 bonus for your first transfer'])],
          action: { label: 'Open Partner Points', chapter: 7 },
          followups: ['What can I get with my points?', 'How do I earn points fast?'],
        },
      };
    }
    const all = byType('Transfer')
      .filter((o) => o.transferFrom && o.transferTo)
      .sort((a, b) => b.transferTo! / b.transferFrom! - a.transferTo! / a.transferFrom!)
      .slice(0, 4);
    return { intent: 'transfer', reply: { kind: 'commerce', text: 'Eleven partner programmes convert into POINTX. The most generous rates right now:', chips: ['Partner transfer'], results: ids(all), reasons: all.map((o) => `${o.transferFrom} → ${o.transferTo}`), action: { label: 'Open Partner Points', chapter: 7 } } };
  }

  // Earn fast
  if (/(earn|more points|fast|bonus|mission|challenge|cashback)/.test(t) && !/expir|which shops|shops? (give|with)/.test(t)) {
    const missions = byType('Mission')
      .filter((m) => usable(m, ctx) && !ctx.joinedIds.has(m.id))
      .sort((a, b) => aff(b, ctx) - aff(a, ctx) || (userId === 1 ? (a.target ?? 1) - (b.target ?? 1) : (b.rewardPoints ?? 0) - (a.rewardPoints ?? 0)))
      .slice(0, 2);
    const shops = byType('Shop')
      .filter((s) => s.pointsBackPct)
      .sort((a, b) => aff(b, ctx) - aff(a, ctx) || b.pointsBackPct! - a.pointsBackPct!)
      .slice(0, 1);
    const opts = transferOptions(ctx).slice(0, 1);
    const inProgress = Object.entries(ctx.joined)
      .map(([id, v]) => ({ m: offer(id), v }))
      .find((x) => x.m.target && x.v < x.m.target && x.v > 0);
    const lead = inProgress ? `You’re ${inProgress.m.target! - inProgress.v} ${inProgress.m.targetUnit} from finishing “${inProgress.m.title}” (+${formatPoints(inProgress.m.rewardPoints ?? 0)}) — do that first. Then: ` : userId === 1 ? 'Three ways, fastest first: ' : 'Biggest earners for the way you already spend: ';
    const list = [...missions, ...shops, ...opts.map((x) => x.partner)];
    return {
      intent: 'earn',
      reply: {
        kind: 'commerce',
        text: `${lead}join a mission (free), scan & pay at a points-back shop, ${opts.length ? 'and move the partner points you already own.' : 'and link a partner programme.'}`,
        chips: ['Earn boost', 'offer_type = Mission', 'points_back_pct', ...(inProgress ? ['Progress-aware'] : [])],
        results: ids(list),
        reasons: [...missions.map((m) => `+${formatPoints(m.rewardPoints ?? 0)} · ${m.subtitle}`), ...shops.map((s) => `${s.pointsBackPct}% of every bill back as points`), ...opts.map((x) => `${formatPoints(x.balance)} ${x.partner.brand} → +${formatPoints(x.receive)}`)],
        action: { label: 'See all missions', chapter: 6 },
        followups: ['Which shops give points back?', ctx.points > 0 ? 'What can I get with my points?' : 'Transfer partner points'],
      },
    };
  }

  // Shops with points back
  if (/(which shops|shops? (give|with)|points back|where (can|should) i (scan|pay)|\bscan\b)/.test(t)) {
    const list = byType('Shop')
      .filter((s) => (s.pointsBackPct || (s.shopRate ?? RATE) < RATE) && usable(s, ctx))
      .sort((a, b) => aff(b, ctx) - aff(a, ctx) || (b.pointsBackPct ?? 0) - (a.pointsBackPct ?? 0))
      .slice(0, 4);
    return {
      intent: 'shops-back',
      reply: {
        kind: 'commerce',
        text: `Pay with POINTX at these and part of the bill comes straight back as points${aff(list[0], ctx) > 0.3 ? ' — your usual places first' : ''}:`,
        chips: ['points_back_pct', 'shop_rate < 12.5', 'Scan & pay'],
        results: ids(list),
        reasons: list.map((s) => (s.pointsBackPct ? `${s.pointsBackPct}% points back · ${s.category}` : `${s.shopRate} pts = ฿1 instead of 12.5`)),
        action: { label: 'Open Shops · Deal', chapter: 2, chip: 's-deal' },
        followups: ['How do I earn points fast?', 'Find me a coffee deal'],
      },
    };
  }

  // Dinner / restaurants
  if (/(dinner|restaurant|\beat\b|buffet|lunch|hungry|อาหาร|กิน|date night|celebrat|anniversary)/.test(t)) {
    const list = byType('Dining')
      .filter((d) => usable(d, ctx))
      .sort((a, b) => aff(b, ctx) - aff(a, ctx) || (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 4);
    const eat = ctx.joined[ID.M_EAT];
    const m = offer(ID.M_EAT);
    return {
      intent: 'dinner',
      reply: {
        kind: 'commerce',
        text: `${eat != null && eat < (m.target ?? 3) ? `One more booking finishes your Eat Around explorer mission (${eat} of ${m.target}, +${formatPoints(m.rewardPoints ?? 0)} points). ` : ''}${aff(list[0], ctx) > 0.5 ? 'Your favourites first, then Red Table Award places you haven’t tried' : 'Red Table Award restaurants, best rated first'} — all take Point+Money:`,
        chips: ['Eat Around', ...(eat != null ? [`Mission ${eat}/${m.target}`] : []), 'Point+Money'],
        results: ids(list),
        reasons: list.map((d) => `${d.rating} ★ · ${split(d, ctx)}`),
        action: { label: 'Open Eat Around', chapter: 3, chip: 'x-dining' },
        followups: ['Use my expiring points', 'Plan a Japan trip with points', 'Help me find a gift'],
      },
    };
  }

  // Travel / Japan
  if (/(japan|tokyo|ญี่ปุ่น|\btrip\b|travel|holiday|vacation|hotel|flight|miles|phuket|beach|xtravel)/.test(t)) {
    const japan = /japan|tokyo|ญี่ปุ่น/.test(t);
    const stays = byType('Travel')
      .filter((o) => o.section === 'XTravel')
      .sort((a, b) => (japan ? (b.tags.includes('japan') ? 1 : 0) - (a.tags.includes('japan') ? 1 : 0) : 0) || aff(b, ctx) - aff(a, ctx) || b.redemptions - a.redemptions)
      .slice(0, 2);
    const miles = byType('Travel')
      .filter((o) => o.section === 'Airlines')
      .sort((a, b) => (ctx.linkedPartners[b.id] ? 1 : 0) - (ctx.linkedPartners[a.id] ? 1 : 0))[0];
    const lounge = byType('Shop').find((s) => s.tags.includes('airport lounge'));
    const list = [...stays, miles, ...(lounge ? [lounge] : [])];
    const top = stays[0];
    return {
      intent: 'travel',
      reply: {
        kind: 'commerce',
        text: `${japan ? 'Japan again? ' : ''}${top.title} is ${formatPoints(top.pointsCost)} points — ${split(top, ctx)}${top.rewardPoints ? `, and XTravel gives up to ${formatPoints(top.rewardPoints)} POINTX back after check-out` : ''}. ${ctx.linkedPartners[miles.id] ? `Your ${miles.title} account is linked, so flights can come from miles.` : 'Flights can come from airline miles too.'}`,
        chips: [japan ? 'Intent: Japan' : 'Intent: travel', 'XTravel · Expedia', 'Point+Money'],
        results: ids(list),
        reasons: [...stays.map((s) => split(s, ctx)), ctx.linkedPartners[miles.id] ? `Linked · ${formatPoints(ctx.linkedPartners[miles.id])} miles` : 'Convert POINTX to miles from 1,000', 'Scan & pay for the lounge'],
        action: { label: 'Open XTravel', chapter: 8 },
        followups: ['Use my expiring points', 'Book dinner this weekend'],
      },
    };
  }

  // Coffee
  if (/(coffee|cafe|café|กาแฟ|latte|americano|starbucks|amazon)/.test(t)) {
    const coupons = byType('eCoupon')
      .filter((o) => o.tags.includes('coffee') && usable(o, ctx))
      .sort((a, b) => within(a, ctx) - within(b, ctx) || saving(b) - saving(a))
      .slice(0, 2);
    const shops = byType('Shop')
      .filter((o) => o.tags.includes('coffee') && o.pointsBackPct)
      .slice(0, 1);
    const skipped = byType('eCoupon').filter((o) => o.tags.includes('coffee') && (ctx.redeemedIds.has(o.id) || ctx.walletIds.has(o.id))).length;
    const list = [...coupons, ...shops];
    return {
      intent: 'coffee',
      reply: {
        kind: 'commerce',
        text: `Coffee it is. ${coupons[0] && coupons[0].pointsCost <= ctx.points ? `${coupons[0].brand} e-Coupon fits your balance at ${formatPoints(coupons[0].pointsCost)} points (${Math.round(saving(coupons[0]) * 100)}% below the scan rate)` : 'Nearest e-Coupons first'} — or scan & pay at Café Amazon and get 30% of the bill back${skipped ? `. I’ve skipped ${skipped} you already have` : ''}:`,
        chips: ['Intent: coffee', 'Smart search', ...(skipped ? ['Redeemed-aware'] : ['Within your points'])],
        results: ids(list),
        reasons: [...coupons.map((o) => `${valueNote(o)} · ${split(o, ctx).split(' · ')[0]}`), ...shops.map((s) => `${s.pointsBackPct}% points back on every cup`)],
        followups: ['Which shops give points back?', 'What can I get with my points?', 'How do I earn points fast?'],
      },
    };
  }

  // Movie
  if (/(movie|cinema|film|หนัง)/.test(t)) {
    const list = [offer(ID.MAJOR_TICKET), offer(ID.MAJOR_SHOP), ...byType('Mission').filter((m) => m.tags.includes('movie') && !ctx.joinedIds.has(m.id))].filter((o) => usable(o, ctx));
    return { intent: 'movie', reply: { kind: 'commerce', text: 'Movie night: a Major Cineplex ticket e-Coupon is 2,700 points, or scan & pay at Major and get 15% back — plus a 150-point mission for doing it.', chips: ['Intent: movie', 'Points back', 'Mission'], results: ids(list), reasons: list.map((o) => (o.offerType === 'eCoupon' ? split(o, ctx) : o.offerType === 'Shop' ? `${o.pointsBackPct}% points back` : `+${o.rewardPoints} bonus`)), followups: ['Book dinner this weekend', 'Help me find a gift'] } };
  }

  // Donate
  if (/(donat|charity|give back|บริจาค)/.test(t)) {
    const list = byType('Donation').slice(0, 4);
    return { intent: 'donate', reply: { kind: 'commerce', text: 'Every 1,250 points donates ฿100 — fully with points, and you choose the cause:', chips: ['Donations'], results: ids(list), reasons: list.map((o) => split(o, ctx)), action: { label: 'See all donations', chapter: 3, chip: 'x-donations' } } };
  }

  // Flash deals
  if (/(flash|deal(s)? (right )?now|ending (tonight|soon)|today only)/.test(t)) {
    const list = catalogue
      .filter((o) => o.flash && usable(o, ctx))
      .sort((a, b) => within(a, ctx) - within(b, ctx) || aff(b, ctx) - aff(a, ctx))
      .slice(0, 4);
    return { intent: 'flash', reply: { kind: 'commerce', text: 'Flash deals end at midnight. Ones you can actually take today first:', chips: ['flash_deal = true', 'Ends tonight', 'Reach'], results: ids(list), reasons: list.map((o) => `${o.discountPct ? `-${o.discountPct}% · ` : ''}${split(o, ctx)}`), action: { label: 'See Flash Deal', chapter: 3, chip: 'x-deal' } } };
  }

  // "Is X a good use of my points?" — value check on the item in context
  if (/(good (use|deal)|worth it|should i (redeem|buy|book))/.test(t)) {
    const name = t.replace(/^is\s+/, '').replace(/\s+a good.*$/, '').trim();
    const hit = catalogue.find((o) => o.title.toLowerCase().startsWith(name.slice(0, 18))) ?? searchOffers(name).exact[0];
    if (hit && hit.pointsCost > 0) {
      const s = Math.round(saving(hit) * 100);
      const good = s >= 5 || aff(hit, ctx) >= 0.5;
      return { intent: 'deal-check', reply: { kind: 'support', text: `${good ? 'Yes' : 'It’s fair, not special'} — ${hit.title} is ${pointsPerBaht(hit)} points per ฿1${s > 0 ? `, ${s}% better than scanning to pay (12.5)` : ', the same as scanning to pay'}. ${split(hit, ctx)}.${hit.stockLeft && hit.stockLeft <= 5 ? ` Only ${hit.stockLeft} left.` : ''}${aff(hit, ctx) >= 0.5 ? ' It also matches what you usually go for.' : ''}`, chips: ['User margin', good ? 'Good value' : 'Fair value', 'Eligibility ✓'], followups: ['What can I get with my points?', 'How do I earn points fast?'] } };
    }
  }

  // "I want X" / "show me X" / "cheaper X" — product search in the feed
  const want = t.match(/(?:i want|looking for|show me|find me|do you have|cheaper|any other)\s+(?:an?\s+|the\s+|some\s+)?(.+?)(?:\?|$| please| deals?| options?)/);
  if (want) {
    const q = want[1].replace(/\b(other|more|cheaper)\b/g, '').trim();
    const { exact, semantic } = searchOffers(
      q,
      catalogue.filter((o) => ['Product', 'eCoupon', 'Dining', 'Travel'].includes(o.offerType)),
    );
    let list = [...exact, ...semantic].filter((o) => usable(o, ctx));
    list = /cheap/.test(t) ? list.sort((a, b) => a.pointsCost - b.pointsCost) : list.sort((a, b) => within(a, ctx) - within(b, ctx) || aff(b, ctx) - aff(a, ctx) || b.redemptions - a.redemptions);
    list = list.filter((o, i, arr) => arr.findIndex((x) => x.brandId === o.brandId && x.category === o.category) === i).slice(0, 4);
    if (list.length) {
      const top = list[0];
      const gap = top.pointsCost - ctx.points;
      const opts = transferOptions(ctx)[0];
      const mission = gap > 0 ? byType('Mission').filter((m) => usable(m, ctx) && !ctx.joinedIds.has(m.id)).sort((a, b) => (b.rewardPoints ?? 0) - (a.rewardPoints ?? 0))[0] : null;
      const extras = gap > 0 ? [...(opts ? [opts.partner] : []), ...(mission ? [mission] : [])] : [];
      return {
        intent: `want:${q}`,
        reply: {
          kind: 'commerce',
          text: `${q.charAt(0).toUpperCase() + q.slice(1)} — ${top.pointsCost <= ctx.points ? 'within your points first' : `the top pick is ${formatPoints(top.pointsCost)} points; you have ${formatPoints(ctx.points)}, so Point+Money or close the gap`}:`,
          chips: [`Intent: ${q}`, 'Smart search', top.pointsCost <= ctx.points ? 'Within your points' : 'Point+Money'],
          results: [...ids(list), ...ids(extras)],
          reasons: [...list.map((o) => split(o, ctx)), ...(opts && gap > 0 ? [`Transfer ${formatPoints(opts.balance)} ${opts.partner.brand} → +${formatPoints(opts.receive)}`] : []), ...(mission && gap > 0 ? [`+${formatPoints(mission.rewardPoints ?? 0)} · ${mission.subtitle}`] : [])],
          followups: ['How do I earn points fast?', 'What can I get with my points?'],
        },
      };
    }
  }

  return null;
}

/**
 * Everyday phrasing — "anything good?", "any promo?", "what's hot", "โปร" —
 * answered with discounted items the member can reach, their taste first.
 * Bare topics ("yoga", "skincare") fall through to a tag search.
 */
const casualWords = /\b(promo(tion)?s?|sale|cheap|bargain|what'?s (good|hot|new)|recommend|suggest|anything good|best deals?|deals?|offers?|discounts?|hot)\b|โปร|ลดราคา|ของดี|แนะนำ/;

function resolveGeneric(text: string, ctx: MuseContext): { reply: MuseReply; intent: string } | null {
  const t = text.toLowerCase();
  if (!casualWords.test(t)) {
    const terms = expandQuery(t);
    const topical = catalogue.filter((o) => ['Product', 'eCoupon', 'Dining', 'Shop'].includes(o.offerType) && usable(o, ctx) && o.tags.some((x) => terms.includes(x)));
    if (!topical.length) return null;
    const list = dedupeBrand(topical.sort((a, b) => within(a, ctx) - within(b, ctx) || aff(b, ctx) - aff(a, ctx) || b.redemptions - a.redemptions)).slice(0, 4);
    return { intent: `topic:${t}`, reply: { kind: 'commerce', text: `Here’s what matches “${text}” — within your points first:`, chips: ['Smart search', 'Within your points first'], results: ids(list), reasons: list.map((o) => (o.offerType === 'Shop' ? `Scan & pay · ${o.pointsBackPct ? `${o.pointsBackPct}% back` : `${o.shopRate} = ฿1`}` : split(o, ctx))), followups: ['What can I get with my points?', 'How do I earn points fast?'] } };
  }
  const list = dedupeBrand(
    catalogue
      .filter((o) => ['Product', 'eCoupon'].includes(o.offerType) && (o.discountPct ?? 0) >= 8 && usable(o, ctx))
      .sort((a, b) => within(a, ctx) - within(b, ctx) || aff(b, ctx) - aff(a, ctx) || (b.discountPct ?? 0) - (a.discountPct ?? 0)),
  ).slice(0, 4);
  const personal = list.some((o) => aff(o, ctx) > 0.3);
  return {
    intent: 'deals',
    reply: {
      kind: 'commerce',
      text: personal ? 'Plenty. Discounted in points right now, leaning to what you usually go for — the ones within your balance first:' : 'Plenty — these are discounted in points right now. Within your balance first, then Point+Money:',
      chips: ['discount_pct ≥ 8', personal ? 'Your taste first' : 'Most redeemed', 'Reach'],
      results: ids(list),
      reasons: list.map((o) => `-${o.discountPct}% · ${split(o, ctx).split(' · ')[0]}`),
      followups: ['Any flash deals right now?', 'What can I get with my points?', 'Help me find a gift'],
    },
  };
}

/* ================================================================== */
/* Exports                                                             */
/* ================================================================== */

const scriptsByUser: Record<AppUserId, Record<string, MuseReply>> = { 1: mintScripts, 2: kornScripts };
const rulesByUser: Record<AppUserId, { match: RegExp; key: string }[]> = { 1: mintRules, 2: kornRules };

export const musePromptsByUser: Record<AppUserId, MusePrompt[]> = {
  1: [
    { id: 'p1', label: 'How does POINTX work?', icon: 'school', intent: 'how-it-works' },
    { id: 'p2', label: 'What can I get with 1,250 points?', icon: 'account_balance_wallet', intent: 'within-balance' },
    { id: 'p3', label: 'How do I earn points fast?', icon: 'bolt', intent: 'earn' },
    { id: 'p4', label: 'I want AirPods', icon: 'headphones', intent: 'airpods' },
    { id: 'p5', label: 'Find me a coffee deal', icon: 'coffee', intent: 'coffee' },
    { id: 'p6', label: 'Transfer my AIS Points', icon: 'swap_horiz', intent: 'transfer' },
  ],
  2: [
    { id: 'k1', label: 'Use my expiring points', icon: 'hourglass_top', intent: 'expiring' },
    { id: 'k2', label: 'Book dinner this weekend', icon: 'restaurant', intent: 'dinner' },
    { id: 'k3', label: 'Plan a Japan trip with points', icon: 'flight_takeoff', intent: 'travel' },
    { id: 'k4', label: 'I want the MacBook Neo', icon: 'laptop_mac', intent: 'macbook' },
    { id: 'k5', label: 'Points or money at Café Amazon?', icon: 'coffee', intent: 'pay-amazon' },
    { id: 'k6', label: 'What are my Wealth benefits?', icon: 'workspace_premium', intent: 'wealth' },
  ],
};

/** Shared prompts — surfaced as chips only where they make sense for this member. */
export function commonPromptsFor(userId: AppUserId, ctx: MuseContext): { label: string; icon: string }[] {
  const all: { label: string; icon: string; show: boolean }[] = [
    { label: 'Which shops give points back?', icon: 'redeem', show: true },
    { label: 'Any flash deals right now?', icon: 'bolt', show: true },
    { label: 'What can I get with my points?', icon: 'account_balance_wallet', show: userId !== 1 },
    { label: 'Transfer partner points', icon: 'swap_horiz', show: userId !== 1 && Object.keys(ctx.linkedPartners).length > 0 },
    { label: 'Movie tonight?', icon: 'theaters', show: true },
    { label: 'Something for the kids', icon: 'child_care', show: true },
    { label: 'Help me find a gift', icon: 'redeem', show: true },
    { label: 'Donate my points', icon: 'volunteer_activism', show: ctx.points >= 1250 },
    { label: 'How do I earn points fast?', icon: 'emoji_events', show: userId !== 1 },
  ];
  return all.filter((p) => p.show).map(({ label, icon }) => ({ label, icon }));
}

export const proactiveNudgeByUser: Record<AppUserId, ProactiveNudge> = {
  1: {
    text: 'Hi Mint, welcome to POINTX! Your 1,250 welcome points already cover a Starbucks or LINE MAN e-Coupon. Want a 20-second tour of how it all works?',
    cta: 'Show me how it works',
    intent: 'how-it-works',
  },
  2: {
    text: 'Hi Korn — 24,000 of your points expire on 31 Dec. Want the best-value ways to use them, starting with dinner?',
    cta: 'Use my expiring points',
    intent: 'expiring',
  },
};

const fallbackByUser: Record<AppUserId, MuseReply> = {
  1: {
    kind: 'support',
    text: 'I can explain how POINTX works, show what your points can get, or find the fastest way to earn more. Try one of these:',
    followups: ['How does POINTX work?', 'What can I get with 1,250 points?', 'How do I earn points fast?'],
  },
  2: {
    kind: 'support',
    text: 'I can find the best value for your expiring points, book dinner, plan a trip or work out a Point+Money split. Try one of these:',
    followups: ['Use my expiring points', 'Book dinner this weekend', 'Plan a Japan trip with points'],
  },
};

/** Resolve an assistant reply for a starter-prompt intent, per persona. */
export function replyForIntent(userId: AppUserId, intent: string, ctx: MuseContext): MuseReply {
  const scripted = scriptsByUser[userId]?.[intent] ?? commonScripts[intent];
  if (scripted) return scripted;
  const label = musePromptsByUser[userId].find((p) => p.intent === intent)?.label ?? intent;
  return replyForText(userId, label, ctx).reply;
}

/**
 * Resolve an assistant reply for free-typed text. Order: persona scripts →
 * shared scripts → feed-driven dynamic answers → everyday phrasing → fallback.
 */
export function replyForText(userId: AppUserId, text: string, ctx: MuseContext): { reply: MuseReply; intent?: string } {
  const rule = rulesByUser[userId]?.find((r) => r.match.test(text));
  if (rule) return { reply: scriptsByUser[userId][rule.key], intent: rule.key };
  const common = commonRules.find((r) => r.match.test(text));
  if (common) return { reply: commonScripts[common.key], intent: common.key };
  const dyn = resolveDynamic(userId, text, ctx);
  if (dyn) return dyn;
  const generic = resolveGeneric(text, ctx);
  if (generic) return generic;
  return { reply: fallbackByUser[userId] };
}

/** Affinity signal an intent represents (feeds real-time personalisation). */
export const intentAffinity: Record<string, string> = {
  coffee: 'Food & Beverage',
  airpods: 'Mobile & Gadgets',
  macbook: 'Mobile & Gadgets',
  dinner: 'Dining',
  travel: 'Travel',
  movie: 'Entertainment',
  'gift-kids': 'Kid & Mom',
  'gift-kid': 'Kid & Mom',
  'gift-mum': 'Beauty',
  'gift-partner': 'Beauty',
  donate: 'Donations',
};
