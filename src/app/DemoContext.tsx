import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AppUserId, AppUserProfile, Offer, PointsEvent, ScoredOffer } from '@/types';
import { appUserProfileById } from '@/mock-data/appUsers';
import { offer } from '@/mock-data/offers';
import { settings } from '@/mock-data/settings';
import { chapterIdByKey, totalChapters } from './chapters';
import type { RankContext, SortMode } from '@/services/sortEngine';

export type AppUser = AppUserId;

/** The list currently on screen, published by list screens for the reasoning rail. */
export interface CurrentRanking {
  title: string;
  ranked: ScoredOffer[];
  excluded: ScoredOffer[];
}

interface DemoContextValue {
  chapter: number;
  goToChapter: (id: number) => void;
  nextChapter: () => void;
  prevChapter: () => void;

  appUser: AppUser;
  setAppUser: (u: AppUser) => void;
  appUserProfile: AppUserProfile;

  /** Live points balance. */
  points: number;
  /** Session points history (newest first), on top of the persona's history. */
  history: PointsEvent[];

  /** e-Coupons redeemed into My Coupon (persona wallet + this session). */
  wallet: string[];
  usedIds: string[];
  useCoupon: (id: string) => void;
  /** Items redeemed this session (products, dining, donations) — suppressed afterwards. */
  redeemedExtra: string[];
  /** Redeem with points (or Point+Money): deducts points, drops e-Coupons in the wallet. */
  redeemPoints: (o: Offer) => void;

  /** Missions joined with current progress toward target. */
  joined: Record<string, number>;
  joinMission: (o: Offer) => void;

  /** Partner transfers completed this session. */
  transferred: string[];
  transferPartner: (o: Offer) => void;

  /** Scan & pay at a shop: pays with points or money, earns points back, progresses missions. */
  scanPay: (shop: Offer, amountThb: number, payWith: 'points' | 'money') => void;
  scanCount: number;

  /** "Like this?" feedback on Trending Now cards. */
  likedIds: string[];
  dislikedIds: string[];
  rateItem: (o: Offer, like: boolean) => void;

  /** In-session affinity built from taps (category, brand:<id>, tag:<x>). Negative = dislike. */
  sessionAffinity: Record<string, number>;
  trackAffinity: (key: string, weight?: number) => void;

  sortMode: SortMode;
  setSortMode: (m: SortMode) => void;

  rankContext: RankContext;
  ranking: CurrentRanking | null;
  setRanking: (r: CurrentRanking | null) => void;

  detailItem: Offer | null;
  openDetail: (o: Offer) => void;

  /** Shops / X Store state. */
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeShopChip: string;
  setActiveShopChip: (c: string) => void;
  activeStoreChip: string;
  setActiveStoreChip: (c: string) => void;
  /** Jump to X Store (or Shops) with a chip preselected. */
  openChip: (chip: string) => void;

  musePrefill: string | null;
  askMuse: (q: string) => void;
  clearMusePrefill: () => void;

  bannerIndex: number;
  setBannerIndex: (i: number) => void;

  whyOpen: boolean;
  openWhy: () => void;
  closeWhy: () => void;
  presenterOpen: boolean;
  setPresenterOpen: (open: boolean) => void;
  togglePresenter: () => void;
  scanOpen: boolean;
  setScanOpen: (open: boolean) => void;
  /** Shop preselected when the scan sheet opens from a shop card. */
  scanShop: Offer | null;
  openScan: (shop?: Offer) => void;

  toast: string | null;
  showToast: (t: string) => void;

  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [chapter, setChapter] = useState(1);
  const [appUser, setAppUserState] = useState<AppUser>(1);
  const [presenterOpen, setPresenterOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanShop, setScanShop] = useState<Offer | null>(null);
  const [detailItem, setDetailItem] = useState<Offer | null>(null);
  const [walletExtra, setWalletExtra] = useState<string[]>([]);
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [redeemedExtra, setRedeemedExtra] = useState<string[]>([]);
  const [joinedExtra, setJoinedExtra] = useState<Record<string, number>>({});
  const [transferred, setTransferred] = useState<string[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [dislikedIds, setDislikedIds] = useState<string[]>([]);
  const [delta, setDelta] = useState(0);
  const [history, setHistory] = useState<PointsEvent[]>([]);
  const [scanCount, setScanCount] = useState(0);
  const [sessionAffinity, setSessionAffinity] = useState<Record<string, number>>({});
  const [sortMode, setSortMode] = useState<SortMode>('dy');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeShopChip, setActiveShopChip] = useState('s-all');
  const [activeStoreChip, setActiveStoreChip] = useState('x-all');
  const [musePrefill, setMusePrefill] = useState<string | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [ranking, setRanking] = useState<CurrentRanking | null>(null);

  const appUserProfile = useMemo(() => appUserProfileById(appUser), [appUser]);
  const points = Math.max(0, appUserProfile.points + delta);
  const wallet = useMemo(() => [...appUserProfile.walletIds, ...walletExtra], [appUserProfile, walletExtra]);
  const joined = useMemo(() => ({ ...appUserProfile.joined, ...joinedExtra }), [appUserProfile, joinedExtra]);

  const goToChapter = useCallback((id: number) => setChapter(Math.min(Math.max(1, id), totalChapters)), []);
  const nextChapter = useCallback(() => setChapter((c) => Math.min(c + 1, totalChapters)), []);
  const prevChapter = useCallback(() => setChapter((c) => Math.max(c - 1, 1)), []);

  const showToast = useCallback((t: string) => {
    setToast(t);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const trackAffinity = useCallback((key: string, weight = 1) => {
    if (!key) return;
    setSessionAffinity((a) => ({ ...a, [key]: (a[key] ?? 0) + weight }));
  }, []);

  const pushHistory = useCallback((e: PointsEvent) => setHistory((h) => [e, ...h]), []);

  /** Advance every joined mission of the given unit by `n`. */
  const progressMissions = useCallback(
    (unit: Offer['targetUnit'], n = 1, filter?: (m: Offer) => boolean) => {
      setJoinedExtra((j) => {
        const next = { ...j };
        for (const id of new Set([...Object.keys(appUserProfile.joined), ...Object.keys(j)])) {
          const m = offer(id);
          if (m.targetUnit !== unit) continue;
          if (filter && !filter(m)) continue;
          const cur = j[id] ?? appUserProfile.joined[id] ?? 0;
          next[id] = Math.min(m.target ?? Infinity, cur + n);
        }
        return next;
      });
    },
    [appUserProfile],
  );

  const resetSession = useCallback(() => {
    setChapter(1);
    setDetailItem(null);
    setWalletExtra([]);
    setUsedIds([]);
    setRedeemedExtra([]);
    setJoinedExtra({});
    setTransferred([]);
    setLikedIds([]);
    setDislikedIds([]);
    setDelta(0);
    setHistory([]);
    setScanCount(0);
    setSessionAffinity({});
    setSortMode('dy');
    setSearchQuery('');
    setActiveShopChip('s-all');
    setActiveStoreChip('x-all');
    setMusePrefill(null);
    setBannerIndex(0);
    setWhyOpen(false);
    setScanOpen(false);
    setScanShop(null);
  }, []);

  const setAppUser = useCallback(
    (u: AppUser) => {
      setAppUserState(u);
      resetSession();
    },
    [resetSession],
  );

  const resetDemo = useCallback(() => {
    setAppUserState(1);
    resetSession();
  }, [resetSession]);

  const openDetail = useCallback(
    (o: Offer) => {
      setDetailItem(o);
      trackAffinity(o.category, 1);
      trackAffinity(`brand:${o.brandId}`, 1);
      setChapter(chapterIdByKey('detail'));
    },
    [trackAffinity],
  );

  const useCoupon = useCallback(
    (id: string) => {
      setUsedIds((u) => (u.includes(id) ? u : [...u, id]));
      showToast('e-Coupon code shown — present it at the counter');
    },
    [showToast],
  );

  const redeemPoints = useCallback(
    (o: Offer) => {
      const used = Math.min(points, o.pointsCost);
      const cash = o.pointsCost - used > 0 ? Math.ceil((o.pointsCost - used) / settings.pointsPerBaht) : 0;
      setDelta((d) => d - used);
      if (o.offerType === 'eCoupon') setWalletExtra((w) => (w.includes(o.id) ? w : [...w, o.id]));
      else setRedeemedExtra((r) => (r.includes(o.id) ? r : [...r, o.id]));
      trackAffinity(o.category, 2);
      trackAffinity(`brand:${o.brandId}`, 2);
      pushHistory({ icon: o.icon, title: `${o.offerType === 'Dining' ? 'Booked' : o.offerType === 'Donation' ? 'Donated' : 'Redeemed'} · ${o.title}`, detail: `Today · ${cash ? `Point+Money · ฿${cash.toLocaleString('en-US')} paid` : 'Points only'}`, points: -used });
      progressMissions(o.offerType === 'Dining' ? 'bookings' : 'redemptions', 1, (m) => m.rewardPoints !== 50);
      showToast(cash ? `Redeemed · ${used.toLocaleString('en-US')} pts + ฿${cash.toLocaleString('en-US')}` : `Redeemed · ${used.toLocaleString('en-US')} points used`);
    },
    [points, pushHistory, progressMissions, showToast, trackAffinity],
  );

  const joinMission = useCallback(
    (o: Offer) => {
      setJoinedExtra((j) => (j[o.id] != null ? j : { ...j, [o.id]: 0 }));
      trackAffinity(o.category, 0.5);
      showToast(`Joined · ${o.title}`);
    },
    [showToast, trackAffinity],
  );

  const transferPartner = useCallback(
    (o: Offer) => {
      const balance = appUserProfile.linkedPartners[o.id] ?? 0;
      if (!o.transferFrom || !o.transferTo || !balance) {
        showToast(`Opens ${o.brand} login (outside this demo)`);
        return;
      }
      const receive = Math.floor((balance / o.transferFrom) * o.transferTo);
      setDelta((d) => d + receive);
      setTransferred((t) => (t.includes(o.id) ? t : [...t, o.id]));
      pushHistory({ icon: 'swap_horiz', title: `Transferred · ${o.brand}`, detail: `Today · ${balance.toLocaleString('en-US')} ${o.brand} → POINTX`, points: receive });
      progressMissions('transfers');
      showToast(`+${receive.toLocaleString('en-US')} POINTX from ${o.brand}`);
    },
    [appUserProfile, pushHistory, progressMissions, showToast],
  );

  const scanPay = useCallback(
    (shop: Offer, amountThb: number, payWith: 'points' | 'money') => {
      const rate = shop.shopRate ?? settings.pointsPerBaht;
      const cost = Math.round(amountThb * rate);
      const spent = payWith === 'points' ? Math.min(points, cost) : 0;
      const topUp = payWith === 'points' && cost > points ? Math.ceil((cost - points) / rate) : 0;
      // Points back is earned when paying with POINTX (Point+Money counts).
      const back = payWith === 'points' && shop.pointsBackPct ? Math.round(amountThb * settings.pointsPerBaht * (shop.pointsBackPct / 100)) : 0;
      setDelta((d) => d - spent + back);
      setScanCount((c) => c + 1);
      trackAffinity(shop.category, 2);
      trackAffinity(`brand:${shop.brandId}`, 2);
      pushHistory({ icon: shop.icon, title: `Scan & pay · ${shop.brand}`, detail: `Today · ฿${amountThb.toLocaleString('en-US')} · ${payWith === 'points' ? `${spent.toLocaleString('en-US')} pts${topUp ? ` + ฿${topUp.toLocaleString('en-US')}` : ''}` : 'paid with SCB EASY'}${back ? ` · ${shop.pointsBackPct}% points back` : ''}`, points: back - spent });
      progressMissions('scans', 1, (m) => m.brand === 'POINTX' || m.brandId === shop.brandId || (m.tags.includes('cafe') && shop.tags.includes('cafe')));
      progressMissions('baht', amountThb, (m) => m.brandId === shop.brandId);
      showToast(back ? `Paid ฿${amountThb.toLocaleString('en-US')} · +${back.toLocaleString('en-US')} points back` : `Paid ฿${amountThb.toLocaleString('en-US')} with ${payWith === 'points' ? 'points' : 'SCB EASY'}`);
      setScanOpen(false);
      setScanShop(null);
    },
    [points, pushHistory, progressMissions, showToast, trackAffinity],
  );

  const rateItem = useCallback(
    (o: Offer, like: boolean) => {
      if (like) {
        setLikedIds((l) => (l.includes(o.id) ? l : [...l, o.id]));
        setDislikedIds((d) => d.filter((x) => x !== o.id));
        trackAffinity(o.category, 2);
        trackAffinity(`brand:${o.brandId}`, 1);
        o.tags.slice(0, 3).forEach((t) => trackAffinity(`tag:${t}`, 1));
      } else {
        setDislikedIds((d) => (d.includes(o.id) ? d : [...d, o.id]));
        setLikedIds((l) => l.filter((x) => x !== o.id));
        trackAffinity(o.category, -1);
        trackAffinity(`brand:${o.brandId}`, -1);
      }
      progressMissions('redemptions', 1, (m) => m.rewardPoints === 50);
    },
    [progressMissions, trackAffinity],
  );

  const openChip = useCallback((chip: string) => {
    setSearchQuery('');
    if (chip.startsWith('s-')) {
      setActiveShopChip(chip);
      setChapter(chapterIdByKey('shops'));
    } else {
      setActiveStoreChip(chip);
      setChapter(chapterIdByKey('xstore'));
    }
  }, []);

  const askMuse = useCallback((q: string) => {
    setMusePrefill(q);
    setChapter(chapterIdByKey('muse'));
  }, []);
  const clearMusePrefill = useCallback(() => setMusePrefill(null), []);

  const openScan = useCallback((shop?: Offer) => {
    setScanShop(shop ?? null);
    setScanOpen(true);
  }, []);

  const togglePresenter = useCallback(() => setPresenterOpen((o) => !o), []);
  const openWhy = useCallback(() => setWhyOpen(true), []);
  const closeWhy = useCallback(() => setWhyOpen(false), []);

  const rankContext = useMemo<RankContext>(
    () => ({
      profile: appUserProfile,
      points,
      sessionAffinity,
      redeemedIds: new Set([...appUserProfile.redeemedIds, ...usedIds, ...redeemedExtra]),
      walletIds: new Set(wallet),
      joinedIds: new Set([...Object.keys(joined), ...transferred]),
      likedIds: new Set(likedIds),
      dislikedIds: new Set(dislikedIds),
      mode: sortMode,
    }),
    [appUserProfile, points, sessionAffinity, usedIds, redeemedExtra, wallet, joined, transferred, likedIds, dislikedIds, sortMode],
  );

  const value: DemoContextValue = {
    chapter,
    goToChapter,
    nextChapter,
    prevChapter,
    appUser,
    setAppUser,
    appUserProfile,
    points,
    history,
    wallet,
    usedIds,
    useCoupon,
    redeemedExtra,
    redeemPoints,
    joined,
    joinMission,
    transferred,
    transferPartner,
    scanPay,
    scanCount,
    likedIds,
    dislikedIds,
    rateItem,
    sessionAffinity,
    trackAffinity,
    sortMode,
    setSortMode,
    rankContext,
    ranking,
    setRanking,
    detailItem,
    openDetail,
    searchQuery,
    setSearchQuery,
    activeShopChip,
    setActiveShopChip,
    activeStoreChip,
    setActiveStoreChip,
    openChip,
    musePrefill,
    askMuse,
    clearMusePrefill,
    bannerIndex,
    setBannerIndex,
    whyOpen,
    openWhy,
    closeWhy,
    presenterOpen,
    setPresenterOpen,
    togglePresenter,
    scanOpen,
    setScanOpen,
    scanShop,
    openScan,
    toast,
    showToast,
    resetDemo,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within a DemoProvider');
  return ctx;
}
