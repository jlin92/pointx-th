/* ------------------------------------------------------------------ */
/* Demo chapters                                                       */
/* ------------------------------------------------------------------ */

export type ChapterKey =
  | 'home'
  | 'shops'
  | 'xstore'
  | 'detail'
  | 'coupons'
  | 'missions'
  | 'mypointx'
  | 'travel'
  | 'muse';

export interface Chapter {
  id: number;
  key: ChapterKey;
  title: string;
  copy: string;
  icon: string;
}

/* ------------------------------------------------------------------ */
/* Catalogue (DY product feed for POINTX)                               */
/* ------------------------------------------------------------------ */

/**
 *  Product  — X Store merchandise (points or Point+Money)
 *  eCoupon  — e-Coupon / voucher redeemed with points
 *  Dining   — Eat Around restaurant deal (Point+Money)
 *  Shop     — merchant where you scan & pay with points (points back)
 *  Mission  — gamified challenge that earns bonus points
 *  Transfer — partner points programme that converts into POINTX
 *  Travel   — XTravel / airline miles redemption
 *  Donation — charity redemption
 */
export type OfferType = 'Product' | 'eCoupon' | 'Dining' | 'Shop' | 'Mission' | 'Transfer' | 'Travel' | 'Donation';

export type OfferCta = 'Redeem' | 'Scan' | 'Join' | 'Transfer' | 'Book' | 'Donate';

export interface Offer {
  id: string;
  name: string;
  /** Card headline. */
  title: string;
  subtitle?: string;
  brand: string;
  brandId: string;
  image: string;
  /** Material icon used as the product visual stand-in. */
  icon: string;
  /** Points price (0 for shops, missions, transfers). */
  pointsCost: number;
  /** Original points price before discount (strikethrough). */
  pointsOriginal?: number;
  /** Retail value in THB (products, coupons, dining). */
  priceThb?: number;
  /** Discount on the points price, e.g. 10 = "-10%". */
  discountPct?: number;
  /** Can be paid with a mix of points and money. */
  pointPlusMoney: boolean;
  inStock: boolean;
  stockLevel: 'low' | 'normal';
  stockLeft?: number;
  category: string;
  offerType: OfferType;
  cta: OfferCta;
  /** Home / X Store section the feed assigns this item to. */
  section: string;
  /** Flash deal (countdown on the shelf). */
  flash?: boolean;
  /** Shops: points needed for ฿1 at this merchant (12.5 standard, lower = deal). */
  shopRate?: number;
  /** Shops: percentage of points returned on a scan & pay. */
  pointsBackPct?: number;
  /** Dining: rating and bookings. */
  rating?: number;
  booked?: number;
  award?: string;
  /** Missions: reward and target. */
  rewardPoints?: number;
  target?: number;
  targetUnit?: 'scans' | 'baht' | 'bookings' | 'transfers' | 'redemptions';
  /** Transfers: partner → POINTX rate. */
  transferFrom?: number;
  transferTo?: number;
  /** Eligibility: All · Cardholder · Wealth. */
  memberLevel: string;
  channel: string;
  validUntil: string;
  /** Semantic keywords for smart search. */
  tags: string[];
  /** 30-day redemptions (popularity). */
  redemptions: number;
  dateAdded: string;
}

/* ------------------------------------------------------------------ */
/* Personas                                                            */
/* ------------------------------------------------------------------ */

export type AppUserId = 1 | 2;
/** POINTX has no public tiers; SCB card segment drives eligibility. */
export type Tier = 'New member' | 'SCB Cardholder' | 'SCB Wealth';

export interface WhyReason {
  icon: string;
  label: string;
  detail: string;
}

/** A home banner creative. Several variants = DY generative experiences. */
export interface Banner {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  chapter: number;
  /** Optional X Store chip to pre-select when the CTA fires. */
  chip?: string;
  /** Optional offer to open when the CTA fires. */
  offerId?: string;
  tone: 'purple' | 'pink' | 'gold' | 'teal' | 'dark';
  icon: string;
  /** Presenter note on why this variant was generated. */
  note: string;
}

export interface OnboardingStep {
  label: string;
  done: boolean;
  icon: string;
  chapter: number;
}

export type ShelfSource =
  | 'foryou'
  | 'flash'
  | 'special'
  | 'apple'
  | 'ecoupon'
  | 'eat'
  | 'trending'
  | 'missions'
  | 'transfer'
  | 'arrivals'
  | 'bestvalue'
  | 'pointsmoney'
  | 'wealth'
  | 'travel';

export interface HomeSection {
  id: string;
  title: string;
  /** How the items are chosen; shown in the Why panel. */
  strategy: string;
  layout: 'product' | 'shop' | 'ecoupon' | 'dining' | 'trending' | 'mission' | 'transfer' | 'list' | 'travel';
  source: ShelfSource;
  /** Shelf header treatment. */
  tone?: 'plain' | 'flash' | 'eat' | 'gold' | 'special' | 'travel';
}

export interface MemberBenefit {
  icon: string;
  title: string;
  body: string;
  tag?: string;
}

export interface PointsEvent {
  icon: string;
  title: string;
  detail: string;
  points: number;
}

/** Full POINTX experience definition for one persona. */
export interface AppUserProfile {
  id: AppUserId;
  name: string;
  firstName: string;
  tier: Tier;
  points: number;
  expiringPoints?: { amount: number; when: string };
  memberSince: string;
  context: string;
  brief: string;
  homeVariant: 'newMember' | 'returning';
  /** Seed affinities from historic behaviour (category or brand:<id>) → 0..1. */
  affinities: Record<string, number>;
  /** Items already redeemed (suppressed by merchandising rules). */
  redeemedIds: string[];
  /** Recently purchased categories (purchase-cadence suppression). */
  recentPurchases: string[];
  /** Targeted "personal items" that must stay pinned on top. */
  pinned: string[];
  /** e-Coupons already in the wallet when the demo starts. */
  walletIds: string[];
  /** Missions already joined, with progress toward target. */
  joined: Record<string, number>;
  /** Partner programmes the member has linked (available to transfer). */
  linkedPartners: Record<string, number>;
  hasCreditCard: boolean;
  isWealth: boolean;
  bannerVariants: Banner[];
  onboarding?: OnboardingStep[];
  quickActions: string[];
  shopChips: string[];
  storeChips: string[];
  homeSections: HomeSection[];
  benefits: MemberBenefit[];
  pointsHistory: PointsEvent[];
  whyShownNow: string;
  why: WhyReason[];
  demoObjectives: string[];
}

/* ------------------------------------------------------------------ */
/* Sorting engine                                                      */
/* ------------------------------------------------------------------ */

export interface RankFactor {
  key: 'affinity' | 'margin' | 'popularity' | 'urgency' | 'gamification' | 'pinned' | 'reach';
  label: string;
  /** Normalised contribution 0..1 before weighting. */
  value: number;
  weight: number;
  note?: string;
}

export interface ScoredOffer {
  offer: Offer;
  score: number;
  factors: RankFactor[];
  /** When set, the offer is filtered out by a merchandising rule. */
  excluded?: string;
}

/* ------------------------------------------------------------------ */
/* Shopping Muse (POINTX assistant)                                     */
/* ------------------------------------------------------------------ */

export interface MuseReply {
  kind?: 'support' | 'commerce';
  text: string;
  bullets?: string[];
  chips?: string[];
  results?: string[];
  reasons?: string[];
  followups?: string[];
  action?: { label: string; chapter: number; chip?: string };
}

export interface MusePrompt {
  id: string;
  label: string;
  icon: string;
  intent: string;
}

export interface ProactiveNudge {
  text: string;
  cta: string;
  intent: string;
}

export interface MuseMessage extends MuseReply {
  id: string;
  role: 'user' | 'assistant';
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export interface Settings {
  appName: string;
  poweredBy: string;
  /** Standard POINTX rate: points needed for ฿1 when scanning to pay. */
  pointsPerBaht: number;
  disclaimers: {
    illustrative: string;
    programmeRules: string;
    redeem: string;
  };
}
