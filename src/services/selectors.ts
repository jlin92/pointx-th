import type { Banner, Offer, ScoredOffer, ShelfSource } from '@/types';
import { byType, catalogue, offer } from '@/mock-data/offers';
import { settings } from '@/mock-data/settings';
import { chapterIdByKey } from '@/app/chapters';
import { headlineOrder, rankOffers, scoreOffer, type RankContext } from './sortEngine';

const top = (list: Offer[], ctx: RankContext, n: number): ScoredOffer[] => rankOffers(list, ctx).ranked.slice(0, n);

/** Redeemable pool: X Store products, e-Coupons, dining, donations. */
const redeemable = (): Offer[] => byType('Product', 'eCoupon', 'Dining', 'Donation');

/**
 * "Picked for you" — redeemable items ranked by DY. For a small balance the
 * list is partitioned so items within reach lead and Point+Money stretch
 * items follow (balance-aware merchandising).
 */
export function forYouFull(ctx: RankContext): { ranked: ScoredOffer[]; excluded: ScoredOffer[] } {
  const r = rankOffers(byType('Product', 'eCoupon', 'Dining'), ctx);
  return { ranked: headlineOrder(r.ranked, ctx), excluded: r.excluded };
}
export const forYou = (ctx: RankContext, n = 10): ScoredOffer[] => forYouFull(ctx).ranked.slice(0, n);

export const flashDeals = (ctx: RankContext, n = 8): ScoredOffer[] => top(catalogue.filter((o) => o.flash), ctx, n);
export const specialDeals = (ctx: RankContext, n = 8): ScoredOffer[] => top(byType('Shop').filter((o) => o.pointsBackPct || (o.shopRate ?? 12.5) < 12.5), ctx, n);
export const applePicks = (ctx: RankContext, n = 8): ScoredOffer[] => top(byType('Product').filter((o) => o.brandId === 'apple'), ctx, n);
export const eCoupons = (ctx: RankContext, n = 10): ScoredOffer[] => top(byType('eCoupon'), ctx, n);
export const eatAround = (ctx: RankContext, n = 8): ScoredOffer[] => top(byType('Dining'), ctx, n);
export const wealthWonders = (ctx: RankContext, n = 6): ScoredOffer[] => top(catalogue.filter((o) => o.section === 'Wealth Wonders'), ctx, n);
export const travelPicks = (ctx: RankContext, n = 6): ScoredOffer[] => top(byType('Travel').filter((o) => o.section === 'XTravel'), ctx, n);
export const airlines = (): Offer[] => byType('Travel').filter((o) => o.section === 'Airlines');
export const donations = (ctx: RankContext): ScoredOffer[] => top(byType('Donation'), ctx, 6);

/** Trending Now — popularity-led, affinity-tilted, with ✕ items removed by rule. */
export function trending(ctx: RankContext, n = 8): ScoredOffer[] {
  const pool = byType('Product', 'eCoupon').filter((o) => o.redemptions >= 600);
  return headlineOrder(rankOffers(pool, ctx).ranked, ctx).slice(0, n);
}

/** Missions to promote (unjoined); pinned targeted mission first. */
export const missionsForHome = (ctx: RankContext, n = 6): ScoredOffer[] => top(byType('Mission'), ctx, n);

/** All missions for the Missions screen: joined first (with progress), then ranked. */
export function missionsForTab(ctx: RankContext, joined: Record<string, number>): { joined: Offer[]; ranked: ScoredOffer[]; excluded: ScoredOffer[] } {
  const all = byType('Mission');
  const joinedList = Object.keys(joined)
    .map((id) => all.find((o) => o.id === id))
    .filter((o): o is Offer => !!o);
  const { ranked, excluded } = rankOffers(all, ctx);
  return { joined: joinedList, ranked, excluded: excluded.filter((s) => s.excluded !== 'Already joined') };
}

/** Partner transfers — linked partners (with a balance) first, then by rate. */
export function transfersForHome(ctx: RankContext, n = 11): ScoredOffer[] {
  const linked = ctx.profile.linkedPartners;
  const { ranked } = rankOffers(byType('Transfer'), ctx, { diversify: false });
  return ranked
    .slice()
    .sort((a, b) => (linked[b.offer.id] ? 1 : 0) - (linked[a.offer.id] ? 1 : 0) || b.score - a.score)
    .slice(0, n);
}

/** Newest items in X Store — the unpersonalised control shelf. */
export const newArrivals = (n = 6): Offer[] =>
  byType('Product')
    .slice()
    .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded) || b.id.localeCompare(a.id))
    .slice(0, n);

/**
 * "Use expiring points" — custom algorithm: items within balance, sized
 * to the expiring amount (so a 24,000-point expiry suggests dinners and
 * coffee, not a MacBook), ordered by affinity and user margin, one per brand.
 */
export function bestValue(ctx: RankContext, n = 8): ScoredOffer[] {
  const cap = ctx.profile.expiringPoints ? Math.max(ctx.profile.expiringPoints.amount * 1.5, 10000) : Infinity;
  const list = redeemable().filter((o) => o.pointsCost > 0 && o.pointsCost <= ctx.points && o.pointsCost <= cap);
  const maxPop = Math.max(1, ...list.map((o) => o.redemptions));
  const seen = new Set<string>();
  return list
    .map((o) => scoreOffer(o, ctx, maxPop))
    .filter((s) => !s.excluded)
    .sort((a, b) => {
      const v = (s: ScoredOffer) => s.factors.find((f) => f.key === 'affinity')!.value * 0.6 + s.factors.find((f) => f.key === 'margin')!.value * 0.4;
      return v(b) - v(a) || b.score - a.score;
    })
    .filter((s) => (seen.has(s.offer.brandId) ? false : (seen.add(s.offer.brandId), true)))
    .slice(0, n);
}

/** Resolve a home shelf source into scored items. */
export function shelfItems(source: ShelfSource, ctx: RankContext): ScoredOffer[] {
  switch (source) {
    case 'foryou':
      return forYou(ctx);
    case 'flash':
      return flashDeals(ctx);
    case 'special':
      return specialDeals(ctx);
    case 'apple':
      return applePicks(ctx);
    case 'ecoupon':
      return eCoupons(ctx);
    case 'eat':
      return eatAround(ctx);
    case 'trending':
      return trending(ctx);
    case 'missions':
      return missionsForHome(ctx);
    case 'transfer':
      return transfersForHome(ctx, 8);
    case 'arrivals':
      return newArrivals().map((o) => ({ offer: o, score: 0, factors: [] }));
    case 'bestvalue':
      return bestValue(ctx);
    case 'wealth':
      return wealthWonders(ctx);
    case 'travel':
      return travelPicks(ctx);
    default:
      return [];
  }
}

/** Items that complement the one being viewed (same brand or category, not itself). */
export function relatedOffers(o: Offer, ctx: RankContext, n = 3): Offer[] {
  const pool = catalogue.filter((x) => x.id !== o.id && x.offerType === o.offerType && (x.brandId === o.brandId || x.category === o.category || x.tags.filter((t) => o.tags.includes(t)).length >= 2));
  return top(pool, ctx, n).map((s) => s.offer);
}

/** A mission that helps earn toward an item the member can't yet afford outright. */
export function missionToAfford(o: Offer, ctx: RankContext): Offer | null {
  const gap = o.pointsCost - ctx.points;
  if (gap <= 0) return null;
  const all = byType('Mission').filter((c) => c.rewardPoints && !ctx.joinedIds.has(c.id));
  const ranked = rankOffers(all, ctx).ranked;
  const covering = ranked.filter((s) => (s.offer.rewardPoints ?? 0) >= gap);
  return (covering[0] ?? ranked[0])?.offer ?? null;
}

/** A linked partner whose balance converts into enough POINTX to cover the gap (or the biggest one). */
export function transferToAfford(o: Offer, ctx: RankContext): { partner: Offer; balance: number; receive: number } | null {
  const gap = o.pointsCost - ctx.points;
  if (gap <= 0) return null;
  const options = Object.entries(ctx.profile.linkedPartners)
    .map(([id, balance]) => {
      const partner = offer(id);
      if (partner.offerType !== 'Transfer' || !partner.transferFrom || !partner.transferTo) return null;
      const receive = Math.floor((balance / partner.transferFrom) * partner.transferTo);
      return { partner, balance, receive };
    })
    .filter((x): x is { partner: Offer; balance: number; receive: number } => !!x)
    .sort((a, b) => b.receive - a.receive);
  return options.find((x) => x.receive >= gap) ?? options[0] ?? null;
}

/* ------------------------------------------------------------------ */
/* Generative banner — a live variant written from the top in-session   */
/* affinity for a member with no history.                              */
/* ------------------------------------------------------------------ */

const liveBannerCopy: Record<string, { title: string; body: string; cta: string; chip: string; icon: string }> = {
  Beauty: { title: 'Beauty picks within reach', body: 'Watsons e-Coupon fits your points; SK-II is 40% off with Point+Money.', cta: 'See beauty in X Store', chip: 'x-beauty', icon: 'spa' },
  'Mobile & Gadgets': { title: 'Gadgets, your way', body: 'Redmi Buds are 3,590 points — your AIS Points would cover them.', cta: 'See gadgets', chip: 'x-mobile', icon: 'headphones' },
  'Food & Beverage': { title: 'Coffee first?', body: 'Starbucks and Café Amazon e-Coupons fit your points today.', cta: 'See food & drink', chip: 'x-ecoupon', icon: 'coffee' },
  Dining: { title: 'Dinner plans, sorted', body: 'Eat Around takes Point+Money — Shabushi from 6,238 points.', cta: 'See Eat Around', chip: 'x-dining', icon: 'restaurant' },
  'Health & Wellness': { title: 'Feel-good picks', body: 'Let’s Relax massage is 40% off in points tonight only.', cta: 'See health', chip: 'x-health', icon: 'self_improvement' },
  'Home Appliances': { title: 'Upgrade home for points', body: 'Air purifiers up to 30% off in points this week.', cta: 'See home appliances', chip: 'x-home', icon: 'air' },
  Kitchen: { title: 'Kitchen upgrades', body: 'Seagull and Tefal — Point+Money makes them yours today.', cta: 'See kitchen', chip: 'x-kitchen', icon: 'cooking' },
  Entertainment: { title: 'Movie night for points', body: 'Major Cineplex ticket is 2,700 points, or 15% back when you scan.', cta: 'See entertainment', chip: 'x-entertainment', icon: 'theaters' },
  Travel: { title: 'Trips with POINTX', body: 'XTravel stays give up to 30,000 POINTX back.', cta: 'See travel', chip: 'x-travel', icon: 'flight_takeoff' },
  Fashion: { title: 'Fashion for points', body: 'Scan & pay at H&M, Uniqlo and Pomelo — 12.5 points = ฿1.', cta: 'See fashion shops', chip: 's-fashion', icon: 'checkroom' },
  'Kid & Mom': { title: 'For the little ones', body: 'LEGO, Pampers and Avent — Point+Money covers the rest.', cta: 'See Kid & Mom', chip: 'x-kids', icon: 'child_care' },
};

export function liveBanner(topAffinity: string): (Banner & { chip: string }) | null {
  const key = topAffinity.startsWith('brand:') ? categoryForBrand(topAffinity.slice(6)) : topAffinity;
  const c = key ? liveBannerCopy[key] : undefined;
  if (!c || !key) return null;
  return {
    id: `live-${key}`,
    eyebrow: 'Picked for you',
    title: c.title,
    body: c.body,
    cta: c.cta,
    chapter: c.chip.startsWith('s-') ? chapterIdByKey('shops') : chapterIdByKey('xstore'),
    tone: 'dark',
    icon: c.icon,
    chip: c.chip,
    note: `Generated live from this session’s ${key.toLowerCase()} signal — copy, CTA and destination chosen by DY in real time.`,
  };
}

function categoryForBrand(brandId: string): string | undefined {
  return catalogue.find((o) => o.brandId === brandId)?.category;
}

/** Baht equivalent at the standard rate. */
export const pointsToBaht = (points: number): number => points / settings.pointsPerBaht;

export const offerById = offer;
