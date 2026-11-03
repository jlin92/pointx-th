import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useDemo } from '@/app/DemoContext';
import { chapterIdByKey } from '@/app/chapters';
import { Screen } from './Screen';
import { OfferCard } from '@/components/offers/OfferCard';
import { Carousel, HomeSection, WhyButton } from '@/components/offers/Primitives';
import { Icon } from '@/components/ui/Icon';
import { Disclaimer } from '@/components/ui/Card';
import { XMark } from '@/components/layout/HeaderBar';
import { settings } from '@/mock-data/settings';
import { offer } from '@/mock-data/offers';
import { primaryReason, topSessionAffinity } from '@/services/sortEngine';
import { forYouFull, liveBanner, shelfItems } from '@/services/selectors';
import type { Banner, HomeSection as HomeSectionDef } from '@/types';
import { cn, formatPoints } from '@/hooks/utils';

const toneClass: Record<Banner['tone'], string> = {
  purple: 'bg-gradient-to-br from-[#3b1670] via-[#5a22b5] to-[#8a1562] text-white',
  pink: 'bg-gradient-to-br from-[#8a1562] to-[#d6186b] text-white',
  gold: 'px-gold text-[#f7e7b8]',
  teal: 'bg-gradient-to-br from-[#0f766e] to-[#2dd4bf] text-white',
  dark: 'bg-[#1f1147] text-white',
};

const quickActionMeta: Record<string, { label: string; icon: string; colour: string; chapter: number; hot?: boolean }> = {
  transfer: { label: 'Partner Points', icon: 'swap_horiz', colour: 'text-[#6b3fd1]', chapter: 7 },
  coupon: { label: 'My Coupon', icon: 'confirmation_number', colour: 'text-[#d6186b]', chapter: 5 },
  cashback: { label: 'Cashback', icon: 'credit_score', colour: 'text-[#2d9cdb]', chapter: 7 },
  airlines: { label: 'Airlines', icon: 'flight', colour: 'text-[#f08c2e]', chapter: 8 },
  xtravel: { label: 'XTravel', icon: 'flight_takeoff', colour: 'text-white', chapter: 8, hot: true },
};

/** Round quick actions under the points line, as in the live app. */
function QuickActions() {
  const { appUserProfile, goToChapter, showToast } = useDemo();
  const linked = Object.keys(appUserProfile.linkedPartners).length;
  return (
    <section className="grid grid-cols-5 gap-1 pt-2">
      {appUserProfile.quickActions.map((id) => {
        const q = quickActionMeta[id];
        const onClick = () => {
          if (id === 'cashback' && !appUserProfile.hasCreditCard) return showToast('Credit card not found — link an SCB card to redeem cashback');
          goToChapter(q.chapter);
        };
        return (
          <button key={id} type="button" onClick={onClick} className="flex min-w-0 flex-col items-center gap-1.5">
            <span className={cn('relative flex h-[52px] w-[52px] items-center justify-center rounded-2xl shadow-card', id === 'xtravel' ? 'bg-gradient-to-br from-[#5a3bd6] to-[#8c6cf0]' : 'bg-white')}>
              <Icon name={q.icon} className={cn('text-[26px]', q.colour)} />
              {q.hot && <span className="absolute -right-1 -top-2 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-white">HOT</span>}
              {id === 'transfer' && linked > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-success text-[10px] font-bold text-white">{linked}</span>}
            </span>
            <span className="w-full truncate text-center text-[11px] text-on-surface">{q.label}</span>
          </button>
        );
      })}
    </section>
  );
}

/** DY personalised hero banner — persona variant, or a live-generated one from in-session affinity. */
function HeroBanner() {
  const { appUserProfile, bannerIndex, goToChapter, openWhy, openChip, openDetail, sessionAffinity, trackAffinity } = useDemo();
  const p = appUserProfile;
  const live = p.homeVariant === 'newMember' ? topSessionAffinity(sessionAffinity) : null;
  const liveB = live ? liveBanner(live) : null;
  const banner: (Banner & { chip?: string }) | undefined = liveB ?? p.bannerVariants[bannerIndex];
  if (!banner) return null;

  const go = () => {
    if (banner.offerId) return openDetail(offer(banner.offerId));
    if (banner.chip) {
      if (live) trackAffinity(live, 1);
      return openChip(banner.chip);
    }
    goToChapter(banner.chapter);
  };

  return (
    <section>
      <motion.div key={banner.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn('relative overflow-hidden rounded-2xl px-4 py-3.5 shadow-card', toneClass[banner.tone])}>
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide opacity-85">
            <Icon name={banner.icon} filled className="text-[14px]" />
            <span className="truncate">{banner.eyebrow}</span>
          </p>
          <h2 className="mt-1 line-clamp-2 font-heading text-[17px] font-semibold leading-tight">{banner.title}</h2>
          <p className="mt-1 line-clamp-2 text-[12px] leading-snug opacity-90">{banner.body}</p>
        </div>
        <div className="relative mt-3 flex items-center justify-between gap-2">
          <button type="button" onClick={go} className="flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold text-on-surface">
            {banner.cta}
            <Icon name="arrow_forward" className="text-[15px]" />
          </button>
          <span className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[10px] font-medium opacity-80">
              <Icon name="auto_awesome" className="text-[12px]" />
              {live ? 'Generated live' : 'Personalised'}
            </span>
            <WhyButton onClick={openWhy} dark />
          </span>
        </div>
      </motion.div>
      <div className="mt-2 flex justify-center gap-1">
        {p.bannerVariants.map((b, i) => (
          <span key={b.id} className={cn('h-1 rounded-full', i === bannerIndex && !live ? 'w-5 bg-[#6b3fd1]' : 'w-3 bg-surface-container-highest')} />
        ))}
      </div>
    </section>
  );
}

/** "All Promotions →" purple band. */
function PromotionsBand() {
  const { openChip } = useDemo();
  return (
    <button type="button" onClick={() => openChip('x-deal')} className="px-band relative flex items-center justify-between overflow-hidden rounded-2xl px-4 py-3 text-left text-white shadow-card">
      <span className="flex items-center gap-2 font-heading text-[17px] font-semibold">
        All Promotions
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-primary">
          <Icon name="arrow_forward" className="text-[15px]" />
        </span>
      </span>
      <span className="flex items-center gap-1 opacity-90">
        <Icon name="campaign" filled className="text-[30px]" />
        <Icon name="percent" filled className="text-[22px]" />
      </span>
    </button>
  );
}

/** Pay your SCB / CardX credit card bill with POINTX — cardholders only. */
function CardBillBand() {
  const { appUserProfile, goToChapter } = useDemo();
  if (!appUserProfile.hasCreditCard) return null;
  return (
    <button type="button" onClick={() => goToChapter(chapterIdByKey('mypointx'))} className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#1e3a8a] to-[#4f46e5] px-4 py-3 text-left text-white shadow-card">
      <span>
        <span className="block font-heading text-[14px] font-semibold">จ่ายบิลบัตรเครดิต SCB/CardX</span>
        <span className="flex items-center gap-1 text-[13px]">
          ด้วยคะแนน <span className="font-bold">POINTX</span>
          <Icon name="arrow_forward" className="text-[15px]" />
        </span>
      </span>
      <Icon name="credit_card" filled className="text-[34px] opacity-90" />
    </button>
  );
}

/** New-member checklist, compact. */
function OnboardingCard() {
  const { appUserProfile, goToChapter, wallet, scanCount, transferred } = useDemo();
  const steps = (appUserProfile.onboarding ?? []).map((s) => ({
    ...s,
    done: s.done || (s.label.includes('e-Coupon') && wallet.length > 0) || (s.label.includes('Scan') && scanCount > 0) || (s.label.includes('Transfer') && transferred.length > 0),
  }));
  const done = steps.filter((s) => s.done).length;
  return (
    <section className="rounded-2xl bg-white p-3 shadow-card">
      <div className="flex items-center justify-between">
        <p className="font-heading text-[15px] font-semibold text-on-surface">Get started with POINTX</p>
        <span className="text-[12px] font-semibold text-on-surface-variant">
          {done}/{steps.length}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container-high">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {steps.map((s) => (
          <li key={s.label}>
            <button type="button" onClick={() => !s.done && goToChapter(s.chapter)} className="flex w-full items-center gap-1.5 text-left">
              <Icon name={s.done ? 'check_circle' : 'radio_button_unchecked'} filled={s.done} className={cn('text-[18px]', s.done ? 'text-success' : 'text-outline')} />
              <span className={cn('text-[12px] leading-tight', s.done ? 'text-on-surface-variant line-through' : 'font-semibold text-on-surface')}>{s.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Live countdown to midnight for the Flash Deal band. */
function useCountdown(): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const s = Math.max(0, Math.floor((end.getTime() - now) / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

/** Render one feed-defined home shelf using the DY selectors. */
function Shelf({ def }: { def: HomeSectionDef }) {
  const { rankContext, goToChapter, openChip, sessionAffinity, appUserProfile, joined, points, sortMode } = useDemo();
  const live = appUserProfile.homeVariant === 'newMember' ? topSessionAffinity(sessionAffinity) : null;
  const countdown = useCountdown();

  const items = useMemo(() => shelfItems(def.source, rankContext), [def.source, rankContext]);
  if (!items.length) return null;

  const more = () => {
    switch (def.source) {
      case 'missions':
        return goToChapter(chapterIdByKey('missions'));
      case 'transfer':
        return goToChapter(chapterIdByKey('mypointx'));
      case 'travel':
        return goToChapter(chapterIdByKey('travel'));
      case 'special':
        return openChip('s-deal');
      case 'eat':
        return openChip('x-dining');
      case 'ecoupon':
        return openChip('x-ecoupon');
      case 'apple':
        return openChip('x-mobile');
      default:
        return openChip('x-deal');
    }
  };

  const dy = sortMode === 'dy';
  const reasonFor = (i: number) => (dy ? primaryReason(items[i]) : undefined);
  const title = def.id === 'foryou' && live ? `Picked for you · ${live.replace(/^brand:/, '')}` : def.title;
  const subtitle =
    def.id === 'foryou' && live ? (
      <span className="flex items-center gap-1 text-accent">
        <Icon name="bolt" filled className="text-[13px]" />
        Updated just now from what you tapped
      </span>
    ) : def.id === 'bestvalue' && appUserProfile.expiringPoints ? (
      `${formatPoints(appUserProfile.expiringPoints.amount)} expire ${appUserProfile.expiringPoints.when} · best value within your ${formatPoints(points)} balance`
    ) : def.id === 'wealth' ? (
      'มีสิทธิ์รับคะแนนคืนรวมสูงสุด 1,000,000 POINTX ทุกเดือน · SCB Wealth only'
    ) : undefined;

  const key = `${def.id}-${sortMode}-${items.map((s) => s.offer.id).slice(0, 6).join(',')}`;

  if (def.layout === 'mission') {
    const joinedCount = Object.keys(joined).length;
    return (
      <HomeSection title={title} onMore={more} why subtitle={joinedCount ? `${joinedCount} in progress · see Missions` : undefined}>
        {joinedCount === 0 && (
          <button type="button" onClick={() => goToChapter(chapterIdByKey('missions'))} className="mb-2 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-[#efe8fb] to-[#fbeaf3] p-3 text-left shadow-card">
            <Icon name="emoji_events" filled className="text-[34px] text-[#8a5cf5]" />
            <span className="flex-1">
              <span className="block font-heading text-[16px] font-semibold text-on-surface">New Missions Await!</span>
              <span className="block text-[12px] text-[#6b3fd1]">Start your challenge now.</span>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-on-surface shadow-card">
              <Icon name="arrow_forward" className="text-[18px]" />
            </span>
          </button>
        )}
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
          {items.slice(0, 3).map((s, i) => (
            <OfferCard key={s.offer.id} offer={s.offer} index={i} variant="mission" reason={reasonFor(i)} />
          ))}
        </motion.div>
      </HomeSection>
    );
  }

  if (def.layout === 'list') {
    return (
      <HomeSection title={title} onMore={more}>
        <div className="flex flex-col gap-2">
          {items.slice(0, 5).map((s, i) => (
            <OfferCard key={s.offer.id} offer={s.offer} index={i} variant="list" />
          ))}
        </div>
      </HomeSection>
    );
  }

  const variant = def.layout === 'shop' ? 'shopTile' : def.layout === 'ecoupon' ? 'ecoupon' : def.layout === 'dining' ? 'dining' : def.layout === 'trending' ? 'trending' : def.layout === 'transfer' ? 'transfer' : def.layout === 'travel' ? 'travel' : 'product';
  const width = def.layout === 'dining' || def.layout === 'travel' ? 'w-[64%]' : def.layout === 'transfer' ? 'w-[40%]' : 'w-[44%]';

  return (
    <HomeSection title={title} onMore={more} why={['foryou', 'bestvalue', 'eat', 'flash', 'special', 'apple', 'trending', 'wealth', 'travel'].includes(def.id)} subtitle={subtitle} tone={def.tone} countdown={def.tone === 'flash' ? countdown : undefined}>
      {def.id === 'travel' && (
        <div className="mb-2 flex items-center justify-between rounded-xl bg-white/80 px-3 py-2 text-[12px] text-on-surface">
          <span className="font-semibold">
            พักฟรีคืนแรก* <span className="text-[#5a3bd6]">POINTX คืนให้</span>
          </span>
          <span className="rounded-lg bg-white px-2 py-0.5 font-heading text-[13px] font-bold text-primary shadow-card">
            รับ POINTX คืน <span className="text-[#5a3bd6]">30,000</span>
          </span>
        </div>
      )}
      <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Carousel itemWidth={width}>
          {items.map((s, i) => (
            <OfferCard key={s.offer.id} offer={s.offer} index={i} variant={variant} reason={reasonFor(i)} />
          ))}
        </Carousel>
      </motion.div>
    </HomeSection>
  );
}

/** Chapter 1 — POINTX home. */
export function HomeScreen() {
  const { appUserProfile, rankContext, setRanking } = useDemo();
  const p = appUserProfile;

  useEffect(() => {
    const r = forYouFull(rankContext);
    setRanking({ title: p.homeVariant === 'newMember' ? 'Picked for you' : 'For you', ranked: r.ranked, excluded: r.excluded });
    return () => setRanking(null);
  }, [rankContext, setRanking, p.homeVariant]);

  const sections = p.homeSections;
  const firstTwo = sections.slice(0, 2);
  const rest = sections.slice(2);

  return (
    <Screen>
      <div className="flex flex-col gap-4 px-3 pt-2">
        <QuickActions />
        <HeroBanner />
        <PromotionsBand />
        {p.homeVariant === 'newMember' && <OnboardingCard />}
        {firstTwo.map((def) => (
          <Shelf key={def.id} def={def} />
        ))}
        <CardBillBand />
        {rest.map((def) => (
          <Shelf key={def.id} def={def} />
        ))}
        <p className="flex items-center justify-center gap-1 text-[11px] text-on-surface-variant">
          <XMark size={12} /> {settings.pointsPerBaht} POINTX = ฿1 at any shop
        </p>
        <Disclaimer className="px-1 pb-2">{settings.disclaimers.illustrative}</Disclaimer>
      </div>
    </Screen>
  );
}
