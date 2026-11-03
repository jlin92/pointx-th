import { useState } from 'react';
import { useDemo } from '@/app/DemoContext';
import { chapterIdByKey } from '@/app/chapters';
import { Screen } from './Screen';
import { BrandTile, ProductTile } from '@/components/offers/BrandTile';
import { OfferCard } from '@/components/offers/OfferCard';
import { useOfferAction } from '@/components/offers/useOfferAction';
import { DiscountBadge, PointsPrice, SectionHeader, ShopRate, Tags, WhyButton } from '@/components/offers/Primitives';
import { Icon } from '@/components/ui/Icon';
import { Disclaimer } from '@/components/ui/Card';
import { XMark } from '@/components/layout/HeaderBar';
import { settings } from '@/mock-data/settings';
import { pointsPerBaht, savingPct } from '@/mock-data/offers';
import { missionToAfford, relatedOffers, transferToAfford } from '@/services/selectors';
import type { Offer } from '@/types';
import { cn, formatPoints, formatThb, shortDate } from '@/hooks/utils';

/** Chapter 4 — Item detail: Point+Money split, value, eligibility, next-best actions. */
export function DetailScreen() {
  const { detailItem, goToChapter } = useDemo();
  if (!detailItem) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-surface px-8 text-center">
        <Icon name="shopping_bag" className="text-[40px] text-primary" />
        <p className="font-heading text-lg font-semibold text-on-surface">No item selected</p>
        <button type="button" onClick={() => goToChapter(chapterIdByKey('xstore'))} className="mt-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
          Browse X Store
        </button>
      </div>
    );
  }
  return <DetailBody o={detailItem} />;
}

const conditions = (o: Offer): string[] => {
  switch (o.offerType) {
    case 'Shop':
      return [`Scan the shop’s QR with the SCB button and choose POINTX or SCB EASY.`, `${o.shopRate ?? settings.pointsPerBaht} points = ฿1 at ${o.brand}.`, ...(o.pointsBackPct ? [`${o.pointsBackPct}% of the bill returns as POINTX within 15 days.`, 'Maximum bonus 10,000 points per person per week.'] : []), `Promotion period: until ${shortDate(o.validUntil)}.`];
    case 'eCoupon':
      return ['Redeem with points; the code appears in My Coupon instantly.', 'Show the code at the counter or paste it online.', `Valid until ${shortDate(o.validUntil)}. Non-refundable once redeemed.`];
    case 'Dining':
      return ['Book a date and time; the restaurant confirms within 2 hours.', 'Pay with points or Point+Money at booking.', 'Free cancellation up to 24 hours before.'];
    case 'Mission':
      return ['Join first — activity before joining does not count.', `Complete by ${shortDate(o.validUntil)}.`, 'Bonus points land within 3 days of completion.'];
    case 'Transfer':
      return ['Log in to the partner once; future transfers are instant.', 'Transfers are one-way into POINTX and cannot be reversed.', 'Partner rates may change monthly.'];
    case 'Travel':
      return ['Powered by Expedia. Flights, stays and packages.', 'Pay with points or Point+Money. Free cancellation on select properties.', 'POINTX back credited within 30 days of check-out.'];
    default:
      return ['Delivery within 5–7 business days by the brand’s authorised reseller.', 'Pay with points or Point+Money.', `Offer valid until ${shortDate(o.validUntil)} or while stocks last.`];
  }
};

const details = (o: Offer): string => {
  switch (o.offerType) {
    case 'Shop':
      return o.pointsBackPct ? `Get ${o.pointsBackPct}% bonus points back when you scan and pay with POINTX via QR at ${o.brand}. Pay fully with points or Point+Money — bonus points are credited every Friday.` : `Scan and pay with POINTX at ${o.brand}. ${o.shopRate ?? settings.pointsPerBaht} points = ฿1. Pay fully with points or Point+Money through SCB EASY.`;
    case 'eCoupon':
      return `${o.brand} e-Coupon worth ${formatThb(o.priceThb ?? 0)}. Redeem with POINTX and use the code at any ${o.brand} branch or online.`;
    case 'Dining':
      return `${o.subtitle} · ${o.rating} ★ · ${o.booked ? `${(o.booked / 1000).toFixed(1)}K booked` : ''}. ${o.award ? `${o.award} winner. ` : ''}Book through Eat Around and pay with POINTX or Point+Money.`;
    case 'Mission':
      return `${o.subtitle}. Complete the mission to receive ${formatPoints(o.rewardPoints ?? 0)} bonus POINTX.`;
    case 'Transfer':
      return o.transferFrom && o.transferTo ? `Convert ${o.brand} into POINTX at ${o.transferFrom.toLocaleString('en-US')} → ${o.transferTo.toLocaleString('en-US')}. Points arrive instantly.` : `Link your ${o.brand} account and convert points into POINTX. The rate is shown before you confirm.`;
    case 'Travel':
      return `${o.subtitle ?? ''} Book with POINTX via XTravel, powered by Expedia.`;
    default:
      return `${o.title} from ${o.brand}’s authorised reseller. Redeem with POINTX or Point+Money and have it delivered to your door.`;
  }
};

function DetailBody({ o }: { o: Offer }) {
  const { points, rankContext, openWhy, askMuse, joined, joinMission, appUserProfile, transferPartner, transferred } = useDemo();
  const [tab, setTab] = useState<'details' | 'conditions'>('details');
  const action = useOfferAction(o);
  const ppb = pointsPerBaht(o);
  const saving = savingPct(o);
  const gap = o.pointsCost - points;
  const helperMission = gap > 0 ? missionToAfford(o, rankContext) : null;
  const helperTransfer = gap > 0 ? transferToAfford(o, rankContext) : null;
  const related = relatedOffers(o, rankContext, 3);
  const isShop = o.offerType === 'Shop';
  const isMission = o.offerType === 'Mission';
  const isTransfer = o.offerType === 'Transfer';
  const progress = joined[o.id];
  const linked = appUserProfile.linkedPartners[o.id];
  const cashTopUp = gap > 0 && o.pointPlusMoney ? Math.ceil(gap / settings.pointsPerBaht) : 0;

  return (
    <>
    <Screen className="pb-32">
      <div className="relative">
        {isShop || isTransfer || isMission ? (
          <div className="relative">
            <ProductTile offer={o} className="h-52 w-full" iconSize="text-[72px]" hideLabel />
            <BrandTile brandId={o.brandId} size="md" className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-2xl ring-4 ring-white shadow-card" />
          </div>
        ) : o.offerType === 'eCoupon' ? (
          <BrandTile brandId={o.brandId} className="h-52 w-full" size="lg" />
        ) : (
          <ProductTile offer={o} className="h-56 w-full" iconSize="text-[96px]" hideLabel />
        )}
        <DiscountBadge pct={o.discountPct} className="left-3 top-3 rounded-xl text-[14px]" />
        <div className="absolute right-3 top-3">
          <WhyButton onClick={openWhy} dark={false} />
        </div>
      </div>

      <div className="flex flex-col gap-3 px-3 pt-3">
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {!isShop && !isMission && !isTransfer && <p className="text-[12px] uppercase tracking-wide text-on-surface-variant">{o.brand}</p>}
              <h1 className="font-heading text-[20px] font-semibold leading-tight text-on-surface">{o.title}</h1>
              {o.subtitle && !isShop && <p className="mt-0.5 text-[13px] text-on-surface-variant">{o.subtitle}</p>}
            </div>
            <Icon name="ios_share" className="text-[22px] text-on-surface-variant" />
          </div>

          <div className="mt-3">
            {isShop ? (
              <ShopRate offer={o} size="lg" />
            ) : isMission ? (
              <p className="flex items-center gap-1.5 font-heading text-[24px] font-bold text-accent">
                +{formatPoints(o.rewardPoints ?? 0)} <XMark size={22} />
                <span className="text-[13px] font-medium text-on-surface-variant">bonus points</span>
              </p>
            ) : isTransfer ? (
              <p className="flex items-center gap-2 font-heading text-[22px] font-semibold text-on-surface">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-px-gold text-[12px] font-bold text-white">P</span>
                {o.transferFrom?.toLocaleString('en-US') ?? '—'} <Icon name="arrow_forward" className="text-[20px]" /> <XMark size={22} /> {o.transferTo?.toLocaleString('en-US') ?? '—'}
              </p>
            ) : (
              <>
                <PointsPrice offer={o} size="lg" />
                <Tags offer={o} className="mt-2" />
              </>
            )}
          </div>

          {/* Points-cost items: value + Point+Money panel */}
          {o.pointsCost > 0 && (
            <div className="mt-3 rounded-xl bg-surface p-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-on-surface-variant">You have</p>
                  <p className="font-heading text-[20px] font-semibold text-on-surface">{formatPoints(points)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-on-surface-variant">{gap > 0 ? 'Short by' : 'Left after'}</p>
                  <p className={cn('font-heading text-[20px] font-semibold', gap > 0 ? 'text-accent' : 'text-success')}>{formatPoints(Math.abs(gap))}</p>
                </div>
              </div>
              {gap > 0 && o.pointPlusMoney && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[12px] text-on-surface">
                  <span className="px-points-money rounded px-1.5 py-0.5 text-[10px] font-bold text-white">Point+Money</span>
                  Use all {formatPoints(points)} points + pay <span className="font-bold">{formatThb(cashTopUp)}</span>
                </div>
              )}
              {ppb != null && (
                <p className={cn('mt-2 flex items-center gap-1 text-[12px] font-semibold', saving > 0.005 ? 'text-success' : 'text-on-surface-variant')}>
                  <Icon name={saving > 0.005 ? 'trending_up' : 'info'} className="text-[15px]" />
                  {ppb} points per ฿1{saving > 0.005 ? ` — ${Math.round(saving * 100)}% below the ${settings.pointsPerBaht} scan & pay rate` : ` — same as scan & pay`}
                </p>
              )}
            </div>
          )}

          {/* Shop: points back preview */}
          {isShop && (
            <div className="mt-3 rounded-xl bg-surface p-3 text-[12px] text-on-surface">
              {o.pointsBackPct ? (
                <p className="flex items-center gap-1.5 font-semibold text-success">
                  <Icon name="redeem" className="text-[16px]" />
                  Pay ฿500 here → {formatPoints(500 * settings.pointsPerBaht * (o.pointsBackPct / 100))} points back
                </p>
              ) : (
                <p className="flex items-center gap-1.5 text-on-surface-variant">
                  <Icon name="info" className="text-[16px]" />
                  Your {formatPoints(points)} points cover {formatThb(points / (o.shopRate ?? settings.pointsPerBaht))} here
                </p>
              )}
            </div>
          )}

          {/* Mission progress */}
          {isMission && progress != null && o.target ? (
            <div className="mt-3 rounded-xl bg-surface p-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-on-surface">Your progress</span>
                <span className="text-on-surface-variant">
                  {o.targetUnit === 'baht' ? formatThb(progress) : progress} / {o.targetUnit === 'baht' ? formatThb(o.target) : `${o.target} ${o.targetUnit}`}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-container-high">
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, (progress / o.target) * 100)}%` }} />
              </div>
            </div>
          ) : null}

          {/* Transfer preview */}
          {isTransfer && linked && o.transferFrom && o.transferTo ? (
            <div className="mt-3 rounded-xl bg-surface p-3 text-[12px] text-on-surface">
              <p className="font-semibold">
                {formatPoints(linked)} {o.brand} linked → <span className="text-accent">{formatPoints(Math.floor((linked / o.transferFrom) * o.transferTo))} POINTX</span>
              </p>
              <p className="mt-0.5 text-on-surface-variant">After transfer: {formatPoints(points + Math.floor((linked / o.transferFrom) * o.transferTo))} POINTX</p>
            </div>
          ) : null}

          <ul className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-on-surface-variant">
            <li className="flex items-center gap-1.5">
              <Icon name="event" className="text-[16px]" />
              Until {shortDate(o.validUntil)}
            </li>
            <li className="flex items-center gap-1.5">
              <Icon name={isShop ? 'qr_code_scanner' : 'storefront'} className="text-[16px]" />
              {o.channel}
            </li>
            <li className="flex items-center gap-1.5">
              <Icon name="person" className="text-[16px]" />
              {o.memberLevel === 'All' ? 'All members' : o.memberLevel === 'Wealth' ? 'SCB Wealth only' : 'SCB cardholders'}
            </li>
            <li className="flex items-center gap-1.5">
              <Icon name="group" className="text-[16px]" />
              {o.redemptions.toLocaleString('en-US')} · 30d
            </li>
          </ul>
        </section>

        {/* Not enough points → earn the gap */}
        {gap > 0 && (helperMission || helperTransfer) && (
          <section className="rounded-2xl border border-accent/20 bg-accent-soft p-3">
            <p className="flex items-center gap-1.5 text-[12px] font-bold text-accent">
              <Icon name="bolt" filled className="text-[16px]" />
              {o.pointPlusMoney ? `Prefer points only? Close the ${formatPoints(gap)} gap` : `Earn the ${formatPoints(gap)} points you need`}
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {helperTransfer && (
                <div className="flex items-center gap-3 rounded-xl bg-white p-2.5">
                  <BrandTile brandId={helperTransfer.partner.brandId} size="xs" className="h-11 w-11 rounded-xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-on-surface">Transfer {formatPoints(helperTransfer.balance)} {helperTransfer.partner.brand}</span>
                    <span className="block text-[11px] text-on-surface-variant">→ +{formatPoints(helperTransfer.receive)} POINTX{helperTransfer.receive >= gap ? ' · covers the gap' : ''}</span>
                  </span>
                  <button type="button" onClick={() => transferPartner(helperTransfer.partner)} disabled={transferred.includes(helperTransfer.partner.id)} className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-40">
                    {transferred.includes(helperTransfer.partner.id) ? 'Done' : 'Transfer'}
                  </button>
                </div>
              )}
              {helperMission && <OfferCard offer={helperMission} variant="mission" reason="Recommended because you’re short of points" />}
            </div>
          </section>
        )}

        {/* Details | Conditions */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="flex border-b border-surface-container-high">
            {(['details', 'conditions'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={cn('relative flex-1 py-3 text-[14px] font-semibold capitalize', tab === t ? 'text-primary' : 'text-on-surface-variant')}>
                {t}
                {tab === t && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
              </button>
            ))}
          </div>
          <div className="p-4 text-[13px] leading-relaxed text-on-surface">
            {tab === 'details' ? (
              <p>{details(o)}</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {conditions(o).map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-on-surface-variant" />
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <button type="button" onClick={() => askMuse(isShop ? `Should I pay with points or money at ${o.brand}?` : `Is ${o.title} a good use of my points?`)} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-card">
          <span className="flex h-9 w-9 items-center justify-center rounded-full muse-gradient text-white">
            <Icon name="auto_awesome" filled className="text-[18px]" />
          </span>
          <span className="flex-1 text-[13px] font-semibold text-on-surface">{isShop ? 'Points or money here? Ask the POINTX assistant' : 'Is this a good use of my points? Ask the assistant'}</span>
          <Icon name="chevron_right" className="text-on-surface-variant" />
        </button>

        {related.length > 0 && (
          <section>
            <SectionHeader title="You may also like" />
            <div className="mt-2 flex flex-col gap-2">
              {related.map((r, i) => (
                <OfferCard key={r.id} offer={r} index={i} variant="row" />
              ))}
            </div>
          </section>
        )}

        <Disclaimer className="px-1">{settings.disclaimers.programmeRules}</Disclaimer>
      </div>
    </Screen>

      {/* Sticky primary CTA, like the purple "Scan" button in the live app */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-surface via-surface/90 to-transparent px-3 pb-3 pt-6">
        <button
          type="button"
          onClick={isMission && progress == null ? () => joinMission(o) : action.run}
          disabled={action.state === 'disabled'}
          className={cn(
            'pointer-events-auto flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold shadow-float',
            action.state === 'primary' && 'bg-primary text-white',
            action.state === 'done' && 'bg-px-green-soft text-success',
            action.state === 'disabled' && 'bg-surface-container-high text-on-surface-variant',
          )}
        >
          {isShop && (
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/70">
              <img src="/pointx/scb-logo.svg" alt="" className="h-5 w-5" />
            </span>
          )}
          {action.state === 'done' && <Icon name="check" className="text-[18px]" />}
          {action.label}
          {action.note && action.state === 'primary' && <span className="text-[12px] font-medium opacity-80">· {action.note}</span>}
        </button>
      </div>
    </>
  );
}
