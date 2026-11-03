import { useEffect, useMemo } from 'react';
import { useDemo } from '@/app/DemoContext';
import { Screen } from './Screen';
import { BrandTile } from '@/components/offers/BrandTile';
import { OfferCard } from '@/components/offers/OfferCard';
import { SectionHeader, SortIndicator } from '@/components/offers/Primitives';
import { Icon } from '@/components/ui/Icon';
import { Disclaimer } from '@/components/ui/Card';
import { settings } from '@/mock-data/settings';
import { airlines, travelPicks } from '@/services/selectors';
import { primaryReason } from '@/services/sortEngine';
import { formatPoints, formatThb } from '@/hooks/utils';

/** Chapter 8 — XTravel (powered by Expedia) + Airlines miles. */
export function TravelScreen() {
  const { rankContext, setRanking, openWhy, sortMode, points, appUserProfile, openDetail, showToast } = useDemo();
  const picks = useMemo(() => travelPicks(rankContext, 6), [rankContext]);
  const miles = airlines();
  const linkedRop = Object.keys(appUserProfile.linkedPartners).find((id) => miles.some((m) => m.id === id));

  useEffect(() => {
    setRanking({ title: 'XTravel stays', ranked: picks, excluded: [] });
    return () => setRanking(null);
  }, [picks, setRanking]);

  return (
    <Screen>
      <div className="flex flex-col gap-3 px-3 pt-3">
        <section className="px-travel overflow-hidden rounded-2xl p-4 text-white shadow-card">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-heading text-[18px] font-semibold">
              <Icon name="flight_takeoff" filled className="text-[24px]" />
              XTravel
            </span>
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#1a1a1a]">powered by Expedia</span>
          </div>
          <p className="mt-2 font-heading text-[20px] font-semibold leading-tight">Turn your POINTX into a dream vacation</p>
          <p className="mt-1 text-[12px] text-white/85">Flights, stays and packages · stay free first night* — POINTX gives back up to 30,000 points.</p>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-[12px]">
            <Icon name="account_balance_wallet" className="text-[18px]" />
            Your {formatPoints(points)} points ≈ {formatThb(points / settings.pointsPerBaht)} toward any booking
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5 text-center text-[11px] font-semibold">
            {['Stays', 'Flights', 'Packages', 'Things to do'].map((t, i) => (
              <button key={t} type="button" onClick={() => showToast('Opens XTravel search (outside this demo)')} className={i === 0 ? 'rounded-lg bg-white py-1.5 text-[#5a3bd6]' : 'rounded-lg bg-white/10 py-1.5'}>
                {t}
              </button>
            ))}
          </div>
        </section>

        <SortIndicator live={false} label={sortMode === 'dy' ? (appUserProfile.affinities.Travel ? 'Sorted for you · Japan first from last year’s trip' : 'Sorted for you · popular stays, Point+Money shown') : 'POINTX today · newest first'} onWhy={openWhy} />

        <section>
          <SectionHeader title="Stays with POINTX back" />
          <div className="mt-2 grid grid-cols-2 gap-3">
            {picks.map((s, i) => (
              <OfferCard key={s.offer.id} offer={s.offer} index={i} variant="travel" reason={sortMode === 'dy' ? primaryReason(s) : undefined} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Airlines" />
          <p className="mt-0.5 text-[12px] text-on-surface-variant">Select miles or airline points program</p>
          <div className="mt-2 flex flex-col gap-2">
            {miles.map((m) => (
              <button key={m.id} type="button" onClick={() => openDetail(m)} className="flex items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-card">
                <BrandTile brandId={m.brandId} size="xs" className="h-12 w-16 rounded-lg" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-on-surface">{m.title}</span>
                  <span className="block text-[12px] text-on-surface-variant">{m.subtitle}</span>
                  {linkedRop === m.id && <span className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-accent"><Icon name="auto_awesome" filled className="text-[12px]" />Linked · {formatPoints(appUserProfile.linkedPartners[m.id])} miles</span>}
                </span>
                <Icon name="chevron_right" className="text-[22px] text-on-surface-variant" />
              </button>
            ))}
          </div>
        </section>

        <Disclaimer className="px-1">Expedia, Inc. and PointX Company Limited are not responsible for content on external websites. {settings.disclaimers.illustrative}</Disclaimer>
      </div>
    </Screen>
  );
}
