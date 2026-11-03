import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useDemo } from '@/app/DemoContext';
import { chapterIdByKey } from '@/app/chapters';
import { Screen } from './Screen';
import { BrandTile } from '@/components/offers/BrandTile';
import { useOfferAction } from '@/components/offers/useOfferAction';
import { CtaPill } from '@/components/offers/OfferCard';
import { SectionHeader, WhyButton } from '@/components/offers/Primitives';
import { Icon } from '@/components/ui/Icon';
import { Disclaimer } from '@/components/ui/Card';
import { XMark } from '@/components/layout/HeaderBar';
import { settings } from '@/mock-data/settings';
import { transfersForHome } from '@/services/selectors';
import type { Offer } from '@/types';
import { cn, formatPoints, formatThb } from '@/hooks/utils';

function PartnerRow({ o, i, linked }: { o: Offer; i: number; linked?: number }) {
  const { openDetail } = useDemo();
  const action = useOfferAction(o);
  return (
    <motion.div role="button" tabIndex={0} onClick={() => openDetail(o)} onKeyDown={(e) => e.key === 'Enter' && openDetail(o)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }} className="flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl bg-white text-left shadow-card">
      <BrandTile brandId={o.brandId} className="h-20 w-24 shrink-0" size="sm" />
      <div className="min-w-0 flex-1 py-2">
        <p className="text-[15px] font-medium text-on-surface">{o.title}</p>
        {o.transferFrom && o.transferTo ? (
          <p className="mt-0.5 flex items-center gap-1 text-[14px] text-on-surface-variant">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-px-gold text-[9px] font-bold text-white">P</span>
            {o.transferFrom.toLocaleString('en-US')} <Icon name="arrow_forward" className="text-[14px]" /> <XMark size={14} /> {o.transferTo.toLocaleString('en-US')}
          </p>
        ) : null}
        {linked ? (
          <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-accent">
            <Icon name="auto_awesome" filled className="text-[12px]" />
            {formatPoints(linked)} linked → {action.note?.split('→ ')[1] ?? ''}
          </p>
        ) : null}
      </div>
      <div className="pr-3">{linked ? <CtaPill action={action} size="sm" /> : <Icon name="chevron_right" className="text-[22px] text-primary" />}</div>
    </motion.div>
  );
}

/** Chapter 7 — My POINTX: balance, history, partner transfer, cashback and benefits. */
export function MyPointXScreen() {
  const { points, appUserProfile, history, rankContext, setRanking, openWhy, goToChapter, showToast, openScan } = useDemo();
  const p = appUserProfile;
  const [tab, setTab] = useState<'partners' | 'history' | 'benefits'>('partners');
  const partners = useMemo(() => transfersForHome(rankContext, 11), [rankContext]);
  const allHistory = [...history, ...p.pointsHistory];

  useEffect(() => {
    setRanking({ title: 'All partners', ranked: partners, excluded: [] });
    return () => setRanking(null);
  }, [partners, setRanking]);

  return (
    <Screen>
      <div className="px-header-dark h-12" />
      <div className="-mt-10 flex flex-col gap-3 px-3">
        {/* Points card overlapping the gradient header */}
        <section className="relative rounded-2xl border-2 border-transparent bg-white p-4 shadow-card [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(135deg,#3b1670,#d6186b)_border-box]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <XMark size={40} />
              <span className="font-heading text-[34px] font-semibold leading-none text-on-surface">{formatPoints(points)}</span>
            </span>
            <button type="button" onClick={() => setTab('history')} className="flex items-center gap-1 text-[15px] text-on-surface">
              History
              <Icon name="chevron_right" className="text-[20px]" />
            </button>
          </div>
          <p className="mt-1 text-[12px] text-on-surface-variant">≈ {formatThb(points / settings.pointsPerBaht)} at {settings.pointsPerBaht} points = ฿1</p>
          {p.expiringPoints && (
            <button type="button" onClick={() => goToChapter(1)} className="mt-3 flex w-full items-center gap-2 rounded-xl bg-accent-soft px-3 py-2 text-left text-[12px] text-on-surface">
              <Icon name="hourglass_top" className="text-[18px] text-accent" />
              <span>
                <span className="font-bold">{formatPoints(p.expiringPoints.amount)} points</span> expire {p.expiringPoints.when} — that’s {formatThb(p.expiringPoints.amount / settings.pointsPerBaht)} you’d lose
              </span>
              <Icon name="chevron_right" className="ml-auto text-on-surface-variant" />
            </button>
          )}
        </section>

        {/* Cashback / card */}
        <section className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card">
          <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', p.hasCreditCard ? 'bg-[#e8edff] text-[#2d4ed8]' : 'bg-surface-container text-on-surface-variant')}>
            <Icon name="credit_card" className="text-[24px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold text-on-surface">{p.hasCreditCard ? 'Cashback · pay your SCB card bill with points' : 'Cashback'}</span>
            <span className="block text-[11px] text-on-surface-variant">{p.hasCreditCard ? 'SCB Private Banking card linked · 2,000 bonus points this month' : 'Credit card not found. Link an SCB credit card to redeem cashback.'}</span>
          </span>
          <button type="button" onClick={() => showToast(p.hasCreditCard ? 'Opens SCB EASY bill payment (outside this demo)' : 'Opens card linking in SCB EASY (outside this demo)')} className="rounded-lg border border-primary px-3 py-1.5 text-[12px] font-semibold text-primary">
            {p.hasCreditCard ? 'Pay bill' : 'Link card'}
          </button>
        </section>

        <div className="flex rounded-full bg-surface-container-high p-1">
          {(['partners', 'history', 'benefits'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={cn('flex-1 rounded-full py-2 text-[13px] font-semibold capitalize', tab === t ? 'bg-white text-on-surface shadow-card' : 'text-on-surface-variant')}>
              {t === 'partners' ? 'All partners' : t}
            </button>
          ))}
        </div>

        {tab === 'partners' && (
          <section>
            <div className="flex items-center justify-between">
              <SectionHeader title="All partners" />
              <WhyButton onClick={openWhy} />
            </div>
            <p className="mt-0.5 text-[11px] text-on-surface-variant">{Object.keys(p.linkedPartners).length ? 'Your linked programmes first — with the POINTX you’d receive' : 'Link a programme to move points into POINTX'}</p>
            <div className="mt-2 flex flex-col gap-2">
              {partners.map((s, i) => (
                <PartnerRow key={s.offer.id} o={s.offer} i={i} linked={p.linkedPartners[s.offer.id]} />
              ))}
            </div>
          </section>
        )}

        {tab === 'history' && (
          <section>
            <SectionHeader title="History" />
            <ul className="mt-2 flex flex-col gap-2">
              {allHistory.map((e, i) => (
                <li key={`${e.title}-${i}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-fixed text-primary">
                    <Icon name={e.icon} className="text-[20px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-on-surface">{e.title}</span>
                    <span className="block truncate text-[11px] text-on-surface-variant">{e.detail}</span>
                  </span>
                  <span className={cn('font-heading text-[14px] font-bold', e.points >= 0 ? 'text-success' : 'text-on-surface')}>
                    {e.points >= 0 ? '+' : ''}
                    {formatPoints(e.points)}
                  </span>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => openScan()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[13px] font-semibold text-white">
              <Icon name="qr_code_scanner" className="text-[18px]" />
              Scan & pay to earn more
            </button>
          </section>
        )}

        {tab === 'benefits' && (
          <section>
            <SectionHeader title={`${p.tier} benefits`} />
            <div className="mt-2 flex flex-col gap-2">
              {p.benefits.map((b) => (
                <div key={b.title} className="flex items-start gap-3 rounded-2xl bg-white p-3 shadow-card">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-fixed text-primary">
                    <Icon name={b.icon} className="text-[20px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-on-surface">
                      {b.title}
                      {b.tag && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">{b.tag}</span>}
                    </span>
                    <span className="block text-[11px] leading-snug text-on-surface-variant">{b.body}</span>
                  </span>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => goToChapter(chapterIdByKey('muse'))} className="mt-3 w-full rounded-xl border border-primary py-3 text-[13px] font-semibold text-primary">
              Ask the assistant how POINTX works
            </button>
          </section>
        )}

        <Disclaimer className="px-1">{settings.disclaimers.illustrative}</Disclaimer>
      </div>
    </Screen>
  );
}
