import type { AppUserProfile, Offer, RankFactor, ScoredOffer } from '@/types';
import { daysUntil } from '@/hooks/utils';
import { catalogue, pointsPerBaht } from '@/mock-data/offers';
import { settings } from '@/mock-data/settings';

/**
 * Mock of the Dynamic Yield sorting optimiser used on POINTX Home shelves,
 * X Store category pages, Shops and Eat Around.
 *
 *  1. Personal (targeted) items stay pinned on top.
 *  2. Merchandising rules filter out what the member cannot use right now:
 *     out of stock, expired, already redeemed, already in My Coupon, already
 *     joined, rated ✕, points-only items above the balance, Wealth-only items
 *     for non-Wealth members, cardholder missions without a card, and items
 *     similar to something bought in the last weeks (purchase cadence).
 *  3. The remainder is scored with a weighted blend (Algorithm Studio style):
 *     real-time affinity, user margin (value per point vs 12.5), reach (can
 *     the balance cover it — Point+Money counts), popularity, urgency (flash
 *     deal / low stock) and an earn boost for members short of points.
 *
 *  "today" mode reproduces the current POINTX behaviour: newest first, no
 *  filtering — so the contrast is visible in the demo.
 */

export type SortMode = 'dy' | 'today';

export interface RankContext {
  profile: AppUserProfile;
  points: number;
  sessionAffinity: Record<string, number>;
  redeemedIds: Set<string>;
  walletIds: Set<string>;
  joinedIds: Set<string>;
  likedIds: Set<string>;
  dislikedIds: Set<string>;
  mode: SortMode;
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));

/** Combined seed + in-session affinity for an item, 0..1 (negative live signals demote). */
export function affinityFor(o: Offer, ctx: RankContext): { value: number; note?: string } {
  const seed = ctx.profile.affinities;
  const live = ctx.sessionAffinity;
  const keys = [o.category, `brand:${o.brandId}`, ...o.tags.map((t) => `tag:${t}`)];
  let seedScore = 0;
  let liveScore = 0;
  let negative = 0;
  let hit: string | undefined;
  let fromLive = false;
  for (const k of keys) {
    if ((seed[k] ?? 0) > seedScore) {
      seedScore = seed[k];
      if (!fromLive) hit = k;
    }
    const l = live[k] ?? 0;
    if (l > liveScore) {
      liveScore = l;
      hit = k;
      fromLive = true;
    }
    if (l < negative) negative = l;
  }
  // Live signals count 1 per interaction; three interactions saturate. A ✕ pulls the whole category down.
  const value = clamp(seedScore * 0.7 + clamp(liveScore / 3) * 0.9 + negative * 0.25);
  const label = hit?.startsWith('brand:') ? o.brand : hit?.replace(/^tag:/, '');
  if (negative < 0 && value < 0.2) return { value, note: 'You passed on something similar' };
  if (value > 0.2 && label && fromLive && liveScore >= 1) return { value, note: `Because you browsed ${label}` };
  return { value, note: value > 0.2 && label ? `Affinity: ${label}` : undefined };
}

/** User margin — value for the member per point (vs the 12.5 scan & pay benchmark). */
export function marginFor(o: Offer): { value: number; note?: string } {
  switch (o.offerType) {
    case 'Shop': {
      if (o.pointsBackPct) return { value: clamp(0.4 + o.pointsBackPct / 100), note: `${o.pointsBackPct}% points back` };
      if ((o.shopRate ?? settings.pointsPerBaht) < settings.pointsPerBaht) return { value: 0.8, note: `${o.shopRate} pts = ฿1 · beats 12.5` };
      return { value: 0.3 };
    }
    case 'Mission': {
      const r = o.rewardPoints ?? 0;
      return { value: clamp(0.3 + Math.log10(1 + r) / 4), note: `+${r.toLocaleString('en-US')} bonus points` };
    }
    case 'Transfer': {
      if (!o.transferFrom || !o.transferTo) return { value: 0.4 };
      const ratio = o.transferTo / o.transferFrom;
      return { value: clamp(0.3 + ratio / 10), note: `${o.transferFrom} → ${o.transferTo}` };
    }
    case 'Travel':
      return { value: o.rewardPoints ? 0.7 : 0.4, note: o.rewardPoints ? `Up to ${o.rewardPoints.toLocaleString('en-US')} POINTX back` : undefined };
    case 'Dining': {
      // Dining is priced at the standard rate; value comes from curation (awards, rating).
      const v = clamp(0.35 + (o.award ? 0.25 : 0) + Math.max(0, (o.rating ?? 4) - 4) * 0.3);
      return { value: v, note: o.award ? `${o.award} · ${o.rating} ★` : `${o.rating} ★ · ${((o.booked ?? 0) / 1000).toFixed(0)}K booked` };
    }
    default: {
      const ppb = pointsPerBaht(o);
      if (ppb == null) return { value: 0.3 };
      const saving = 1 - ppb / settings.pointsPerBaht;
      return { value: clamp(0.3 + saving * 1.6), note: saving > 0.005 ? `${ppb} pts per ฿1 · ${Math.round(saving * 100)}% below 12.5` : `${ppb} pts per ฿1` };
    }
  }
}

/** Reach — can the member's balance cover it today? Point+Money counts partially. */
function reachFor(o: Offer, ctx: RankContext): { value: number; note?: string } {
  if (o.pointsCost <= 0) return { value: 0.7 };
  if (o.pointsCost <= ctx.points) return { value: 1, note: 'Within your points' };
  if (o.pointPlusMoney) {
    const cover = ctx.points / o.pointsCost;
    const cash = Math.ceil((o.pointsCost - ctx.points) / settings.pointsPerBaht);
    return { value: clamp(0.25 + cover * 0.5), note: `Point+Money · ฿${cash.toLocaleString('en-US')} top-up` };
  }
  return { value: 0 };
}

function urgencyFor(o: Offer): { value: number; note?: string } {
  const d = daysUntil(o.validUntil);
  if (o.flash && d <= 2) return { value: 1, note: 'Flash deal · ends tonight' };
  if (o.stockLeft != null && o.stockLeft <= 5) return { value: 1, note: `Only ${o.stockLeft} left` };
  if (o.stockLevel === 'low') return { value: 0.8, note: 'Running out' };
  if (d <= 7) return { value: 0.6, note: `Ends in ${d} days` };
  return { value: 0 };
}

/** Products bought recently → similar products are suppressed for a few weeks. */
function recentlyBoughtSimilar(o: Offer, ctx: RankContext): string | undefined {
  if (o.offerType !== 'Product') return undefined;
  for (const id of ctx.redeemedIds) {
    const bought = catalogue.find((x) => x.id === id);
    if (!bought || bought.offerType !== 'Product' || bought.category !== o.category) continue;
    const shared = o.tags.filter((t) => bought.tags.includes(t)).length;
    if (shared >= 3) return `Bought ${bought.title.split(' ').slice(0, 2).join(' ')} recently`;
  }
  return undefined;
}

/** Merchandising rule that removes the item, if any. */
export function exclusionFor(o: Offer, ctx: RankContext): string | undefined {
  if (!o.inStock) return 'Out of stock';
  if (daysUntil(o.validUntil) < 0) return 'Expired';
  if (ctx.redeemedIds.has(o.id)) return 'Already redeemed';
  if (ctx.walletIds.has(o.id)) return 'Already in My Coupon';
  if (ctx.joinedIds.has(o.id)) return 'Already joined';
  if (ctx.dislikedIds.has(o.id)) return 'You said no (✕)';
  if (o.memberLevel === 'Wealth' && !ctx.profile.isWealth) return 'SCB Wealth only';
  if (o.memberLevel === 'Cardholder' && !ctx.profile.hasCreditCard) return 'Needs an SCB credit card';
  if (o.pointsCost > ctx.points && !o.pointPlusMoney) return 'Not enough points';
  const cadence = recentlyBoughtSimilar(o, ctx);
  if (cadence) return cadence;
  return undefined;
}

export function scoreOffer(o: Offer, ctx: RankContext, maxPop: number): ScoredOffer {
  const excluded = exclusionFor(o, ctx);
  const aff = affinityFor(o, ctx);
  const margin = marginFor(o);
  const reach = reachFor(o, ctx);
  const urg = urgencyFor(o);
  const pop = clamp(Math.log10(1 + o.redemptions) / Math.log10(1 + maxPop));
  const shortOfPoints = ctx.points < 5000;
  const earnType = o.offerType === 'Mission' || (o.offerType === 'Shop' && !!o.pointsBackPct) || o.offerType === 'Transfer';
  const liked = ctx.likedIds.has(o.id);

  const factors: RankFactor[] = [
    { key: 'affinity', label: 'Affinity', value: liked ? 1 : aff.value, weight: 0.35, note: liked ? 'You liked this (✓)' : aff.note },
    { key: 'margin', label: 'User margin', value: margin.value, weight: 0.2, note: margin.note },
    { key: 'reach', label: 'Reach', value: reach.value, weight: 0.15, note: reach.note },
    { key: 'popularity', label: 'Popularity', value: pop, weight: 0.1, note: `${o.redemptions.toLocaleString('en-US')} redeemed · 30d` },
    { key: 'urgency', label: 'Urgency', value: urg.value, weight: 0.1, note: urg.note },
    {
      key: 'gamification',
      label: 'Earn boost',
      value: earnType ? 1 : 0,
      weight: shortOfPoints ? 0.15 : 0.03,
      note: earnType && shortOfPoints ? 'Low balance — promote ways to earn' : undefined,
    },
  ];
  const totalW = factors.reduce((t, f) => t + f.weight, 0);
  const score = Math.round((factors.reduce((t, f) => t + f.value * f.weight, 0) / totalW) * 100);
  return { offer: o, score, factors, excluded };
}

/**
 * Light diversification: within the first `window` slots a brand appears once
 * before any brand repeats, so a shelf doesn't open with three AirPods cards.
 * Pinned items are left untouched.
 */
function diversify(list: ScoredOffer[], pinned: Set<string>, window = 6): ScoredOffer[] {
  const head = list.filter((s) => pinned.has(s.offer.id));
  const rest = list.filter((s) => !pinned.has(s.offer.id));
  const out: ScoredOffer[] = [];
  const deferred: ScoredOffer[] = [];
  const seen = new Set<string>();
  for (const s of rest) {
    if (out.length < window && seen.has(s.offer.brandId)) deferred.push(s);
    else {
      out.push(s);
      seen.add(s.offer.brandId);
    }
  }
  return [...head, ...out, ...deferred];
}

/**
 * Rank a list of items for the member. Pinned (personal) items are kept on
 * top in DY mode; "today" mode is the live app's newest-first order.
 */
export function rankOffers(list: Offer[], ctx: RankContext, opts: { diversify?: boolean } = {}): { ranked: ScoredOffer[]; excluded: ScoredOffer[] } {
  if (ctx.mode === 'today') {
    const ranked = list
      .slice()
      .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded) || b.id.localeCompare(a.id))
      .map((offer) => ({ offer, score: 0, factors: [] as RankFactor[] }));
    return { ranked, excluded: [] };
  }
  const maxPop = Math.max(1, ...list.map((o) => o.redemptions));
  const scored = list.map((o) => scoreOffer(o, ctx, maxPop));
  const pinned = new Set(ctx.profile.pinned);
  const sorted = scored
    .filter((s) => !s.excluded)
    .sort((a, b) => {
      const pa = pinned.has(a.offer.id) ? 0 : 1;
      const pb = pinned.has(b.offer.id) ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return b.score - a.score || b.offer.redemptions - a.offer.redemptions;
    })
    .map((s) => (pinned.has(s.offer.id) ? { ...s, factors: [{ key: 'pinned', label: 'Personal item', value: 1, weight: 1, note: 'Targeted for you — always on top' } as RankFactor, ...s.factors] } : s));
  const ranked = opts.diversify === false ? sorted : diversify(sorted, pinned);
  const excluded = scored.filter((s) => s.excluded);
  return { ranked, excluded };
}

/** Convenience: ranked items only. */
export const rankedOffers = (list: Offer[], ctx: RankContext): Offer[] => rankOffers(list, ctx).ranked.map((s) => s.offer);

/** Display priority for factor notes: the most situational signal wins. */
export const factorPriority: RankFactor['key'][] = ['pinned', 'urgency', 'gamification', 'affinity', 'reach', 'margin', 'popularity'];

/** The single most relevant reason to show on a card. */
export function primaryReason(s: ScoredOffer, allow: RankFactor['key'][] = ['pinned', 'urgency', 'gamification', 'affinity', 'reach']): string | undefined {
  // In-session signals are the demo's headline: they outrank stock / flash notes.
  const live = s.factors.find((f) => f.key === 'affinity' && f.note?.startsWith('Because you'));
  if (live && allow.includes('affinity') && !s.factors.some((f) => f.key === 'pinned')) return live.note;
  for (const key of factorPriority) {
    if (!allow.includes(key)) continue;
    const f = s.factors.find((x) => x.key === key && x.note && x.weight > 0 && x.value > 0);
    if (f) return f.note;
  }
  return undefined;
}

/** Top live affinity label for copy ("Picked for your beauty interest"). */
export function topSessionAffinity(session: Record<string, number>): string | null {
  const entries = Object.entries(session).filter(([k, v]) => !k.startsWith('tag:') && v > 0);
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0].replace(/^brand:/, '');
}
