import type { AppUserId, AppUserProfile } from '@/types';
import { ID } from './catalogueIds';

/**
 * Two contrasting POINTX members who move through the same app (Home → Shops →
 * X Store → item → My Coupon → Missions → My POINTX → XTravel → assistant) but
 * see very different content, sorting and emphasis on every screen.
 *
 *  - Persona 1 (Mint): NEW member who opened POINTX for the first time today
 *    after SCB EASY prompted her. 1,250 welcome points, no SCB credit card,
 *    no history. Cold start on popularity + what her balance can reach; earn
 *    paths promoted (missions, points-back shops, partner transfers); the app
 *    re-ranks within the session as she browses and rates items.
 *
 *  - Persona 2 (Korn): RETURNING SCB Wealth cardholder. 186,420 points with
 *    24,000 expiring 31 Dec. Eat Around regular, XTravel Japan trip, Apple
 *    fan, weekly Café Amazon scan & pay. Sees expiry urgency with best value
 *    per point, affinity sorting, Wealth-only shelf, suppression of what she
 *    already has, mission progress and partner top-ups for big-ticket items.
 *
 * All values are illustrative for demonstration only.
 */
export const appUserProfiles: Record<AppUserId, AppUserProfile> = {
  /* ------------------------------------------------------------------ */
  /* Persona 1 — Mint · New POINTX member (first open)                    */
  /* ------------------------------------------------------------------ */
  1: {
    id: 1,
    name: 'Pimchanok "Mint" Srisuk',
    firstName: 'MINT',
    tier: 'New member',
    points: 1250,
    memberSince: 'Today',
    context: 'Opened POINTX 3 minutes ago from SCB EASY · 1,250 welcome points · No SCB credit card · No scan, redemption or browsing history · Has 3,200 AIS Points and 850 The 1 points she has never used.',
    brief: 'Brand-new member, 1,250 points, no credit card. First visit — no affinity yet; the app builds it live as she browses X Store and rates Trending Now cards.',
    homeVariant: 'newMember',
    affinities: {},
    redeemedIds: [],
    recentPurchases: [],
    pinned: [ID.M_FIRST_SCAN],
    walletIds: [],
    joined: {},
    linkedPartners: { [ID.T_AIS]: 3200, [ID.T_THE1]: 850 },
    hasCreditCard: false,
    isWealth: false,
    bannerVariants: [
      {
        id: 'p1-welcome',
        eyebrow: 'Welcome to POINTX',
        title: 'Your 1,250 points already buy a Starbucks coffee',
        body: 'Welcome points are in. Redeem an e-Coupon today, or scan & pay at 1,000+ shops and earn points back on the spot.',
        cta: 'See what 1,250 points get me',
        chapter: 3,
        chip: 'x-ecoupon',
        tone: 'purple',
        icon: 'celebration',
        note: 'Generated for the “new member · small balance” audience: shows a concrete, affordable reward first so the balance feels real.',
      },
      {
        id: 'p1-transfer',
        eyebrow: 'You have points elsewhere',
        title: 'Move your 3,200 AIS Points into POINTX',
        body: '3,200 AIS Points → 12,800 POINTX. Add The 1 and you could redeem AirPods with Point+Money this week.',
        cta: 'Transfer partner points',
        chapter: 7,
        tone: 'teal',
        icon: 'swap_horiz',
        note: 'Variant B: partner-transfer led, from the linked-partner signal. DY tests both and allocates traffic to the winner per audience.',
      },
      {
        id: 'p1-how',
        eyebrow: 'How POINTX works',
        title: 'Scan to pay. Earn points back. Redeem anything.',
        body: '12.5 points = ฿1 at any shop. Deal shops give up to 70% points back. X Store has 5,000+ items for points or Point+Money.',
        cta: 'Ask the assistant',
        chapter: 9,
        tone: 'dark',
        icon: 'school',
        note: 'Variant C: education-led copy, routes to Shopping Muse for the “how does it work” conversation.',
      },
    ],
    onboarding: [
      { label: 'Join POINTX', done: true, icon: 'looks_one', chapter: 1 },
      { label: 'Redeem your first e-Coupon', done: false, icon: 'confirmation_number', chapter: 3 },
      { label: 'Scan & pay at a shop', done: false, icon: 'qr_code_scanner', chapter: 2 },
      { label: 'Transfer partner points', done: false, icon: 'swap_horiz', chapter: 7 },
    ],
    quickActions: ['transfer', 'coupon', 'cashback', 'airlines', 'xtravel'],
    shopChips: ['s-deal', 's-all', 's-fashion', 's-grocery', 's-jewelry', 's-food', 's-health', 's-gas', 's-education', 's-entertainment', 's-travel', 's-shopping'],
    storeChips: ['x-deal', 'x-all', 'x-ecoupon', 'x-mobile', 'x-beauty', 'x-home', 'x-kitchen', 'x-dining', 'x-health', 'x-kids', 'x-entertainment', 'x-donations', 'x-travel'],
    homeSections: [
      { id: 'foryou', title: 'Picked for you', strategy: 'Cold start: most-redeemed items, split into “within your 1,250 points” first and Point+Money stretch items with the exact cash top-up. Re-ranks in real time from this session’s taps and ✓/✕ ratings.', layout: 'product', source: 'foryou' },
      { id: 'missions', title: 'My Missions', strategy: 'Earn boost: balance is low, so missions that pay points (First Scan & Pay pinned as a targeted mission) sit above redemption shelves.', layout: 'mission', source: 'missions' },
      { id: 'transfer', title: 'Partner Points Transfer to POINTX', strategy: 'Her linked AIS Points and The 1 accounts move to the front with the exact POINTX she would receive.', layout: 'transfer', source: 'transfer' },
      { id: 'special', title: 'Special Deal', strategy: 'Points-back shops ranked by value per point — the fastest way to earn on everyday spend.', layout: 'shop', source: 'special', tone: 'special' },
      { id: 'flash', title: 'Flash Deal', strategy: 'Urgency shelf (ends tonight). Stretch items shown as Point+Money.', layout: 'product', source: 'flash', tone: 'flash' },
      { id: 'ecoupon', title: 'e-Coupon', strategy: 'Coupons within her balance first (Starbucks, LINE MAN, KOI), then the next reachable ones.', layout: 'ecoupon', source: 'ecoupon' },
      { id: 'trending', title: 'Trending Now', strategy: 'Popularity-ranked with the live “Like this?” ✓/✕ feedback feeding DY affinity in real time.', layout: 'trending', source: 'trending' },
      { id: 'eat', title: 'Eat Around', strategy: 'Standard merchandised shelf; Point+Money so even a new member can book.', layout: 'dining', source: 'eat', tone: 'eat' },
      { id: 'arrivals', title: 'New Arrival', strategy: 'Newest items, unpersonalised — the control shelf.', layout: 'list', source: 'arrivals' },
    ],
    benefits: [
      { icon: 'qr_code_scanner', title: 'Scan & pay with points', body: '12.5 points = ฿1 at 1,000+ shops. Pay fully with points or Point+Money.' },
      { icon: 'redeem', title: 'Points back at Deal shops', body: 'Café Amazon 30%, ShopeeFood 50%, The Mall up to 70% points back on every scan.' },
      { icon: 'swap_horiz', title: 'Bring partner points together', body: 'AIS, The 1, M Card, Lotus’s and more convert into POINTX in seconds.' },
      { icon: 'shopping_bag', title: 'X Store & e-Coupons', body: '5,000+ items, dining, travel and donations — points or Point+Money.' },
      { icon: 'credit_card', title: 'Link an SCB credit card', body: 'Card points flow into POINTX automatically and unlock bill payment with points.', tag: 'Not linked' },
    ],
    pointsHistory: [{ icon: 'celebration', title: 'Welcome bonus · joined POINTX', detail: 'Today · via SCB EASY', points: 1250 }],
    whyShownNow:
      'Mint opened POINTX minutes ago with 1,250 welcome points and no history. DY leads with what her balance can already buy, shows stretch items as Point+Money with the exact top-up, and promotes the three ways she can earn — missions, points-back shops and transferring the AIS and The 1 points she already owns. Every tap, search and ✓/✕ rating in this session updates her affinity profile, so Picked for you, Trending Now, the X Store chips and the assistant re-rank before she leaves the app.',
    why: [
      { icon: 'celebration', label: 'Joined today', detail: 'New-member audience: affordable value and education before promotion.' },
      { icon: 'account_balance_wallet', label: '1,250 points', detail: 'Within-balance items first; bigger items shown as Point+Money, not hidden.' },
      { icon: 'credit_card_off', label: 'No SCB credit card', detail: 'Cashback and card missions filtered out; card-linking suggested in Benefits.' },
      { icon: 'swap_horiz', label: 'AIS + The 1 linked', detail: 'Partner transfer promoted with the exact POINTX she would receive.' },
      { icon: 'bolt', label: 'Real-time affinity', detail: 'Chips tapped, items viewed and ✓/✕ ratings re-rank Home, X Store and the assistant instantly.' },
    ],
    demoObjectives: [
      'Personalise a cold-start member: affordable value, earn paths, education.',
      'Build affinity live (browse + ✓/✕) and re-rank Picked for you, Trending Now, chips and the assistant within one session.',
      'Smart search understands “earbuds” / “กาแฟ”, hands off to Shopping Muse.',
      'First e-Coupon redeemed, first scan & pay, first mission joined — with a transparent “why”.',
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Persona 2 — Korn · Returning SCB Wealth cardholder                    */
  /* ------------------------------------------------------------------ */
  2: {
    id: 2,
    name: 'Kornkanok "Korn" Wattanasin',
    firstName: 'KORN',
    tier: 'SCB Wealth',
    points: 186420,
    expiringPoints: { amount: 24000, when: '31 Dec' },
    memberSince: 'Feb 2023',
    context: 'SCB Wealth · SCB Private Banking card · 186,420 points, 24,000 expiring 31 Dec · Booked Copper Beyond Buffet twice this quarter · Tokyo trip via XTravel last Nov · Redeemed AirPods 5 in X Store 6 weeks ago · Scans & pays at Café Amazon most mornings · Redeemed Starbucks THB 100 e-Coupon last week · 4,400 M Card points linked.',
    brief: 'Wealth cardholder, 186,420 pts with 24,000 expiring 31 Dec. Loves dining out, Japan trips and Apple. Needs a reason to use points before they expire — and a hub that hides what she already has.',
    homeVariant: 'returning',
    affinities: {
      Dining: 0.95,
      'brand:copper': 0.9,
      Travel: 0.8,
      'brand:xtravel': 0.75,
      'Mobile & Gadgets': 0.7,
      'brand:apple': 0.85,
      'Food & Beverage': 0.6,
      'brand:caf-amazon': 0.8,
      'brand:starbucks': 0.4,
      Beauty: 0.35,
      'Health & Wellness': 0.3,
    },
    redeemedIds: [ID.STARBUCKS_100, ID.AIRPODS5_CASE],
    recentPurchases: ['Mobile & Gadgets'],
    pinned: [ID.M_CARD_BILL],
    walletIds: [ID.AMAZON_100],
    joined: { [ID.M_EAT]: 2 },
    linkedPartners: { [ID.T_MCARD]: 4400, [ID.ROP]: 18000 },
    hasCreditCard: true,
    isWealth: true,
    bannerVariants: [
      {
        id: 'p2-expiry',
        eyebrow: '24,000 points expire 31 Dec',
        title: 'That’s a Copper dinner for two — on us',
        body: 'Your expiring points cover Copper Beyond Buffet (32,488) with Point+Money, or 20 Café Amazon coffees. Use them before they go.',
        cta: 'Use expiring points',
        chapter: 3,
        offerId: ID.COPPER_DINNER,
        tone: 'pink',
        icon: 'hourglass_top',
        note: 'Generated for the “expiring points + dining affinity” audience: urgency plus a concrete, personal example of value.',
      },
      {
        id: 'p2-japan',
        eyebrow: 'Japan again this winter?',
        title: 'Tokyo 4 nights · 306,250 points or Point+Money',
        body: 'Your 186,420 points cover ฿14,914 of the ฿24,500 stay — pay ฿9,587 or top up from M Card, and get up to 30,000 POINTX back.',
        cta: 'Plan with XTravel',
        chapter: 8,
        tone: 'teal',
        icon: 'flight_takeoff',
        note: 'Variant B: travel-affinity copy from last November’s XTravel booking; shows the Point+Money split live.',
      },
      {
        id: 'p2-wealth',
        eyebrow: 'Wealth Wonders · make it a million',
        title: 'Up to 1,000,000 points back on SCB Wealth spend',
        body: 'Exclusive to SCB Wealth members this month — plus your card bill can be paid with POINTX for 2,000 bonus points.',
        cta: 'See Wealth Wonders',
        chapter: 3,
        chip: 'x-deal',
        tone: 'gold',
        icon: 'workspace_premium',
        note: 'Variant C: segment-gated creative for the SCB Wealth audience; routes to the Wealth shelf and the targeted bill-payment mission.',
      },
    ],
    quickActions: ['transfer', 'coupon', 'cashback', 'airlines', 'xtravel'],
    shopChips: ['s-food', 's-travel', 's-deal', 's-all', 's-health', 's-shopping', 's-entertainment', 's-fashion', 's-grocery', 's-jewelry', 's-gas', 's-education'],
    storeChips: ['x-dining', 'x-travel', 'x-mobile', 'x-deal', 'x-all', 'x-beauty', 'x-ecoupon', 'x-home', 'x-kitchen', 'x-health', 'x-entertainment', 'x-kids', 'x-donations'],
    homeSections: [
      { id: 'bestvalue', title: 'Use your expiring points', strategy: 'Custom algorithm: items within her 186,420 balance ranked by value per point, weighted to her dining / travel / Apple affinities. 24,000 expiring points drive the title and urgency copy.', layout: 'product', source: 'bestvalue' },
      { id: 'wealth', title: 'Wealth Wonders', strategy: 'Segment-gated shelf: visible only to SCB Wealth members. Hidden for Mint by merchandising rule.', layout: 'product', source: 'wealth', tone: 'gold' },
      { id: 'eat', title: 'Eat Around', strategy: 'Dining affinity (Copper twice this quarter) — Copper Dinner and NAMA first; Red Table Award restaurants she hasn’t tried next. Eat Around explorer mission at 2 of 3.', layout: 'dining', source: 'eat', tone: 'eat' },
      { id: 'foryou', title: 'For you', strategy: 'Affinity (dining, travel, Apple, coffee) blended with user margin. Suppressed: AirPods 5 (redeemed 6 weeks ago), Starbucks THB 100 (redeemed last week), Café Amazon e-Coupon (already in wallet).', layout: 'product', source: 'foryou' },
      { id: 'travel', title: 'XTravel · up to 30,000 POINTX back', strategy: 'Travel affinity from last year’s Tokyo booking; Japan first, with the Point+Money split against her balance.', layout: 'travel', source: 'travel', tone: 'travel' },
      { id: 'flash', title: 'Flash Deal', strategy: 'Urgency shelf (ends tonight). AirPods variants demoted by purchase-cadence rule; MacBook Neo stays.', layout: 'product', source: 'flash', tone: 'flash' },
      { id: 'apple', title: 'Apple Top Picks', strategy: 'Brand affinity shelf; AirPods hidden (bought 6 weeks ago), Apple Watch and iPad promoted as complements.', layout: 'product', source: 'apple' },
      { id: 'missions', title: 'My Missions', strategy: 'Targeted “Pay your SCB card bill with points” mission pinned (cardholder); joined Eat Around mission shows live progress 2/3.', layout: 'mission', source: 'missions' },
      { id: 'ecoupon', title: 'e-Coupon', strategy: 'Coffee and dining coupons first; redeemed and wallet items excluded by rule.', layout: 'ecoupon', source: 'ecoupon' },
      { id: 'trending', title: 'Trending Now', strategy: 'Popularity shelf with ✓/✕ feedback; her affinities already tilt it to gadgets and dining.', layout: 'trending', source: 'trending' },
      { id: 'transfer', title: 'Partner Points Transfer to POINTX', strategy: 'M Card (4,400 pts linked) first — the top-up that makes a MacBook reachable.', layout: 'transfer', source: 'transfer' },
      { id: 'arrivals', title: 'New Arrival', strategy: 'Newest items, unpersonalised — the control shelf.', layout: 'list', source: 'arrivals' },
    ],
    benefits: [
      { icon: 'workspace_premium', title: 'Wealth Wonders · up to 1,000,000 points back', body: 'Monthly points-back campaign exclusive to SCB Wealth cardholders.', tag: 'SCB Wealth' },
      { icon: 'credit_card', title: 'Pay your card bill with POINTX', body: 'Use points toward your SCB Private Banking card statement — 2,000 bonus points this month.', tag: 'Cardholder' },
      { icon: 'airline_seat_recline_extra', title: 'Airport lounge with points', body: 'Miracle Lounge and The Coral accept scan & pay.' },
      { icon: 'restaurant', title: 'Eat Around priority booking', body: 'Red Table Award restaurants with Point+Money.' },
      { icon: 'flight', title: 'Royal Orchid Plus linked', body: 'Convert POINTX to ROP miles from 1,000 points.' },
    ],
    pointsHistory: [
      { icon: 'coffee', title: 'Scan & pay · Café Amazon Sathorn', detail: 'Mon 2 Nov · ฿135 · 30% points back', points: 506 },
      { icon: 'confirmation_number', title: 'Redeemed · Starbucks e-Coupon THB 100', detail: 'Mon 26 Oct', points: -1149 },
      { icon: 'restaurant', title: 'Eat Around · Copper Beyond Buffet', detail: 'Sat 17 Oct · Point+Money', points: -24988 },
      { icon: 'credit_card', title: 'SCB Private Banking card · October points', detail: 'Thu 1 Oct · auto-synced', points: 21840 },
      { icon: 'headphones', title: 'Redeemed · AirPods 5 with Wireless Charging Case', detail: 'Sun 20 Sep · X Store', points: -61763 },
      { icon: 'flight_takeoff', title: 'XTravel · Tokyo 4 nights', detail: 'Nov 2025 · 30,000 points back', points: 30000 },
    ],
    whyShownNow:
      'Korn is an SCB Wealth cardholder who dines out through Eat Around, flew to Tokyo on XTravel last year, buys Apple in X Store and scans & pays at Café Amazon most mornings. She holds 186,420 points with 24,000 expiring on 31 Dec. DY leads with expiry urgency and a concrete, personal use (Copper dinner), ranks every shelf by her affinities and value per point, unlocks the Wealth-only shelf, and suppresses what she already has — the AirPods she redeemed, the Starbucks coupon from last week, the Café Amazon coupon in her wallet. Her targeted card-bill mission is pinned, and the assistant knows her M Card points can top up a MacBook.',
    why: [
      { icon: 'hourglass_top', label: '24,000 pts expiring', detail: 'Expiry drives the hero banner and the “Use your expiring points” shelf.' },
      { icon: 'restaurant', label: 'Eat Around regular', detail: 'Dining affinity (Copper ×2); mission at 2 of 3 bookings.' },
      { icon: 'flight_takeoff', label: 'Tokyo via XTravel', detail: 'Travel affinity; Japan first with the Point+Money split.' },
      { icon: 'workspace_premium', label: 'SCB Wealth', detail: 'Wealth Wonders shelf unlocked; card-bill mission targeted.' },
      { icon: 'block', label: 'Already has / bought', detail: 'AirPods 5 (6 weeks), Starbucks THB 100 (last week), Café Amazon coupon (wallet) — all suppressed.' },
    ],
    demoObjectives: [
      'Expiry urgency with a personal, concrete use for the points.',
      'Affinity + value-per-point sorting on Home, X Store and Eat Around — compare with “POINTX today”.',
      'Segment-gated Wealth shelf and targeted card-bill mission.',
      'Suppress redeemed / wallet / recently-bought items; Apple shelf shows complements instead.',
      'Shopping Muse plans dinner, Japan and a MacBook top-up from the same feed and her balance.',
    ],
  },
};

export const appUserProfileById = (id: AppUserId): AppUserProfile => appUserProfiles[id];
