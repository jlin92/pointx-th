import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDemo } from '@/app/DemoContext';
import { Screen } from './Screen';
import { BrandTile } from '@/components/offers/BrandTile';
import { OfferCard } from '@/components/offers/OfferCard';
import { SectionHeader } from '@/components/offers/Primitives';
import { Icon } from '@/components/ui/Icon';
import { Disclaimer } from '@/components/ui/Card';
import { settings } from '@/mock-data/settings';
import { offers } from '@/mock-data/offers';
import { eCoupons } from '@/services/selectors';
import { primaryReason } from '@/services/sortEngine';
import type { Offer } from '@/types';
import { cn, shortDate } from '@/hooks/utils';

/** Chapter 5 — My coupon: redeemed e-Coupons with "Ready to use" / "Used/Expired" tabs, as in the live app. */
export function CouponsScreen() {
  const { wallet, usedIds, useCoupon, rankContext, openDetail, openChip } = useDemo();
  const [tab, setTab] = useState<'ready' | 'used'>('ready');
  const [using, setUsing] = useState<Offer | null>(null);
  const all = offers(wallet);
  const ready = all.filter((o) => !usedIds.includes(o.id));
  const used = all.filter((o) => usedIds.includes(o.id));
  const list = tab === 'ready' ? ready : used;
  const suggestions = eCoupons(rankContext, 4);

  return (
    <Screen>
      <div className="flex border-b border-surface-container-high bg-white">
        {(['ready', 'used'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={cn('relative flex-1 py-3 text-[14px] font-semibold', tab === t ? 'text-primary' : 'text-on-surface-variant')}>
            {t === 'ready' ? 'Ready to use' : 'Used/Expired'}
            {tab === t && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 px-3 pt-3">
        <div className="flex justify-end">
          <Icon name="tune" className="text-[22px] text-on-surface-variant" />
        </div>

        {list.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-10 text-center shadow-card">
            <Icon name="inventory_2" className="text-[64px] text-surface-container-highest" />
            <p className="mt-3 font-heading text-[16px] font-semibold text-on-surface">{tab === 'ready' ? 'You currently don’t have an e-Coupon.' : 'Nothing used yet'}</p>
            <p className="mt-1 text-[12px] text-on-surface-variant">{tab === 'ready' ? 'Let’s explore and get e-Coupons now.' : 'e-Coupons you show at the counter move here.'}</p>
            {tab === 'ready' && (
              <button type="button" onClick={() => openChip('x-ecoupon')} className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-semibold text-white">
                Explore e-Coupons
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {list.map((o, i) => (
            <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }} className="overflow-hidden rounded-2xl bg-white shadow-card">
              <button type="button" onClick={() => openDetail(o)} className="flex w-full items-center gap-3 p-3 text-left">
                <BrandTile brandId={o.brandId} className="h-16 w-24 shrink-0 rounded-lg" size="xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] uppercase tracking-wide text-on-surface-variant">{o.brand}</p>
                  <p className="font-heading text-[15px] font-semibold leading-tight text-on-surface">{o.title}</p>
                  <p className="truncate text-[11px] text-on-surface-variant">{o.priceThb?.toLocaleString('en-US')} Baht · until {shortDate(o.validUntil)}</p>
                </div>
              </button>
              <div className="ticket-notch ticket-dash flex items-center justify-between px-3 py-2">
                <span className="text-[11px] text-on-surface-variant">{tab === 'ready' ? 'Show the code at the counter' : 'Used'}</span>
                {tab === 'ready' ? (
                  <button type="button" onClick={() => setUsing(o)} className="rounded-lg bg-primary px-4 py-1.5 text-[12px] font-semibold text-white">
                    Use now
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-[12px] font-semibold text-success">
                    <Icon name="check_circle" filled className="text-[16px]" />
                    Done
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {tab === 'ready' && suggestions.length > 0 && (
          <section>
            <SectionHeader title={ready.length ? 'Add another e-Coupon' : 'e-Coupons within your points'} action="See all" onAction={() => openChip('x-ecoupon')} />
            <div className="mt-2 grid grid-cols-2 gap-3">
              {suggestions.map((s, i) => (
                <OfferCard key={s.offer.id} offer={s.offer} index={i} variant="ecoupon" reason={primaryReason(s)} />
              ))}
            </div>
          </section>
        )}

        <Disclaimer className="px-1">{settings.disclaimers.programmeRules}</Disclaimer>
      </div>

      <AnimatePresence>
        {using && (
          <div className="absolute inset-0 z-40 flex items-end">
            <motion.div className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUsing(null)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 w-full rounded-t-2xl bg-white p-5 text-center">
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-black/15" />
              <p className="text-[12px] uppercase tracking-wide text-on-surface-variant">{using.brand}</p>
              <p className="font-heading text-[20px] font-semibold text-on-surface">{using.title}</p>
              <div className="mx-auto mt-3 w-fit rounded-xl border-2 border-dashed border-primary/40 px-6 py-3 font-mono text-[22px] font-bold tracking-[0.3em] text-primary">PX{using.id.slice(-4)}7Q</div>
              <p className="mt-2 text-[12px] text-on-surface-variant">Show this code at the counter or paste it online · valid until {shortDate(using.validUntil)}</p>
              <button
                type="button"
                onClick={() => {
                  useCoupon(using.id);
                  setUsing(null);
                }}
                className="mt-4 w-full rounded-xl bg-primary py-3 text-[14px] font-semibold text-white"
              >
                Mark as used
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Screen>
  );
}
