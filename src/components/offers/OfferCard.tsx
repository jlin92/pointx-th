import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import type { Offer } from '@/types';
import { useDemo } from '@/app/DemoContext';
import { BrandTile, ProductTile } from './BrandTile';
import { useOfferAction, type OfferActionState } from './useOfferAction';
import { DiscountBadge, PointsPrice, Reason, ShopRate, Tags } from './Primitives';
import { Icon } from '@/components/ui/Icon';
import { XMark } from '@/components/layout/HeaderBar';
import { cn, formatPoints } from '@/hooks/utils';

interface OfferCardProps {
  offer: Offer;
  index?: number;
  /** Personalisation reason shown beneath the title (DY picks / assistant). */
  reason?: string;
  /**
   * Layout. `auto` picks from the item type: product / ecoupon / dining /
   * shop / mission / transfer / travel. `row` is the compact list row,
   * `trending` adds the "Like this?" footer, `list` is the New Arrival row.
   */
  variant?: 'auto' | 'product' | 'ecoupon' | 'dining' | 'shop' | 'shopTile' | 'mission' | 'transfer' | 'travel' | 'row' | 'trending' | 'list';
  className?: string;
}

/** Purple pill CTA ("Redeem", "Join", "Transfer", "Scan"). */
export function CtaPill({ action, size = 'md', className }: { action: OfferActionState; size?: 'sm' | 'md'; className?: string }) {
  const stop = (e: MouseEvent) => {
    e.stopPropagation();
    action.run();
  };
  return (
    <button
      type="button"
      onClick={stop}
      className={cn(
        'inline-flex items-center justify-center gap-1 rounded-lg font-semibold transition-transform active:scale-95',
        size === 'sm' ? 'px-3 py-1 text-[12px]' : 'px-4 py-1.5 text-[13px]',
        action.state === 'primary' && 'bg-primary text-white',
        action.state === 'done' && 'bg-px-green-soft text-success',
        action.state === 'disabled' && 'bg-surface-container text-on-surface-variant',
        className,
      )}
    >
      {action.state === 'done' && <Icon name="check" className="text-[14px]" />}
      {action.label}
    </button>
  );
}

function autoVariant(o: Offer): NonNullable<OfferCardProps['variant']> {
  switch (o.offerType) {
    case 'eCoupon':
      return 'ecoupon';
    case 'Dining':
      return 'dining';
    case 'Shop':
      return 'shop';
    case 'Mission':
      return 'mission';
    case 'Transfer':
      return 'transfer';
    case 'Travel':
      return 'travel';
    default:
      return 'product';
  }
}

/** Item card in the POINTX visual language. */
export function OfferCard({ offer: o, index = 0, reason, variant = 'auto', className }: OfferCardProps) {
  const { openDetail, rateItem, likedIds, dislikedIds, appUserProfile, joined } = useDemo();
  const action = useOfferAction(o);
  const v = variant === 'auto' ? autoVariant(o) : variant;
  const motionProps = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.04 * Math.min(index, 8), duration: 0.3 },
  };
  const open = () => openDetail(o);

  /* ---------------- Product (X Store card) ---------------- */
  if (v === 'product' || v === 'trending') {
    const liked = likedIds.includes(o.id);
    const disliked = dislikedIds.includes(o.id);
    return (
      <motion.div {...motionProps} className={cn('flex h-full w-full flex-col', className)}>
        <button type="button" onClick={open} className={cn('relative flex flex-1 flex-col overflow-hidden rounded-2xl bg-white text-left shadow-card', v === 'trending' && 'rounded-b-none')}>
          <DiscountBadge pct={o.discountPct} />
          {o.offerType === 'eCoupon' ? <BrandTile brandId={o.brandId} className="aspect-square w-full" size="md" /> : <ProductTile offer={o} className="aspect-square w-full" />}
          <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2">
            <p className="line-clamp-2 min-h-[2.6em] text-[13px] font-medium leading-snug text-on-surface">{o.title}</p>
            {o.priceThb && <p className="mt-0.5 text-[11px] text-on-surface-variant">{o.priceThb.toLocaleString('en-US')} Baht</p>}
            <Reason text={reason} className="mt-0.5" />
            <PointsPrice offer={o} size="sm" className="mt-auto pt-1.5" />
            <Tags offer={o} className="mt-1" />
          </div>
        </button>
        {v === 'trending' && (
          <div className="flex flex-col items-center gap-1.5 rounded-b-2xl bg-surface-container px-2 py-2">
            <span className="text-[12px] text-on-surface-variant">{liked ? 'Added to your taste' : disliked ? 'Thanks — fewer like this' : 'Like this?'}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => rateItem(o, true)} aria-label="Like" className={cn('flex h-8 w-12 items-center justify-center rounded-full', liked ? 'bg-success text-white' : 'bg-white text-on-surface shadow-card')}>
                <Icon name="check" className="text-[18px]" />
              </button>
              <button type="button" onClick={() => rateItem(o, false)} aria-label="Not for me" className={cn('flex h-8 w-12 items-center justify-center rounded-full', disliked ? 'bg-on-surface text-white' : 'bg-white text-on-surface shadow-card')}>
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  /* ---------------- e-Coupon ticket ---------------- */
  if (v === 'ecoupon') {
    return (
      <motion.button type="button" onClick={open} {...motionProps} className={cn('relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-card', className)}>
        <DiscountBadge pct={o.discountPct} />
        <div className="relative">
          <BrandTile brandId={o.brandId} className="aspect-[4/3] w-full" size="md" />
          <div className="ticket-notch ticket-dash flex items-center justify-center gap-1 bg-white py-1.5 text-[13px] font-bold text-on-surface">
            <Icon name="confirmation_number" className="text-[16px]" />
            {o.priceThb?.toLocaleString('en-US')} ฿
          </div>
        </div>
        <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-1">
          <p className="line-clamp-2 min-h-[2.6em] text-[13px] font-medium leading-snug text-on-surface">{o.title}</p>
          <p className="mt-0.5 text-[11px] text-on-surface-variant">{o.priceThb?.toLocaleString('en-US')} Baht</p>
          <Reason text={reason} className="mt-0.5" />
          <PointsPrice offer={o} size="sm" className="mt-auto pt-1.5" />
          <Tags offer={o} className="mt-1" />
        </div>
      </motion.button>
    );
  }

  /* ---------------- Eat Around ---------------- */
  if (v === 'dining') {
    return (
      <motion.button type="button" onClick={open} {...motionProps} className={cn('relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-card', className)}>
        {o.award && <span className="absolute left-0 top-0 z-10 rounded-br-xl bg-px-badge-red px-2 py-1 text-[11px] font-semibold text-white">{o.award}</span>}
        <div className="relative">
          <ProductTile offer={o} className="aspect-[4/3] w-full" iconSize="text-[40px]" />
          <BrandTile brandId={o.brandId} size="xs" className="absolute bottom-2 left-2 h-11 w-11 rounded-xl ring-2 ring-white" />
        </div>
        <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2">
          <p className="text-[11px] text-on-surface-variant">{o.subtitle}</p>
          <p className="line-clamp-1 text-[14px] font-medium text-on-surface">{o.title}</p>
          <p className="flex items-center gap-1 text-[11px] text-on-surface">
            {o.rating} <Icon name="star" filled className="text-[13px] text-px-gold" /> <span className="text-on-surface-variant">{o.booked ? `${(o.booked / 1000).toFixed(1)}K booked` : ''}</span>
          </p>
          <p className="text-[11px] text-on-surface-variant">{o.priceThb?.toLocaleString('en-US')} Baht</p>
          <Reason text={reason} className="mt-0.5" />
          <Tags offer={o} className="mt-1" />
          <PointsPrice offer={o} size="sm" className="mt-1.5" />
        </div>
      </motion.button>
    );
  }

  /* ---------------- Shop (Special Deal tile) ---------------- */
  if (v === 'shopTile') {
    return (
      <motion.button type="button" onClick={open} {...motionProps} className={cn('relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-card', className)}>
        <DiscountBadge pct={o.discountPct} />
        <BrandTile brandId={o.brandId} className="aspect-square w-full" size="md" />
        <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2">
          <p className="line-clamp-2 min-h-[2.6em] text-[13px] font-medium leading-snug text-on-surface">{o.title}</p>
          <Reason text={reason} className="mt-0.5" />
          <div className="mt-auto pt-1.5">
            <ShopRate offer={o} size="sm" />
          </div>
        </div>
      </motion.button>
    );
  }

  /* ---------------- Shop (Shops tab row) ---------------- */
  if (v === 'shop') {
    return (
      <motion.div role="button" tabIndex={0} onClick={open} onKeyDown={(e) => e.key === "Enter" && open()} {...motionProps} className={cn('cursor-pointer relative flex w-full overflow-hidden rounded-2xl bg-white text-left shadow-card', className)}>
        <DiscountBadge pct={o.discountPct} />
        <div className="relative w-[34%] shrink-0">
          <ProductTile offer={o} className="h-full min-h-[120px] w-full" iconSize="text-[34px]" />
          <BrandTile brandId={o.brandId} size="xs" className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-xl ring-2 ring-white" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
          <div>
            <p className="line-clamp-2 text-[14px] font-medium leading-snug text-on-surface">{o.title}</p>
            <Reason text={reason} className="mt-0.5" />
          </div>
          <div className="mt-2 flex items-end justify-between gap-2">
            <ShopRate offer={o} size="md" />
            <CtaPill action={action} size="sm" />
          </div>
        </div>
      </motion.div>
    );
  }

  /* ---------------- Mission ---------------- */
  if (v === 'mission') {
    const progress = joined[o.id];
    const target = o.target ?? 1;
    const pct = progress != null ? Math.min(100, (progress / target) * 100) : 0;
    const done = progress != null && progress >= target;
    const unit = o.targetUnit === 'baht' ? '฿' : '';
    return (
      <motion.div role="button" tabIndex={0} onClick={open} onKeyDown={(e) => e.key === "Enter" && open()} {...motionProps} className={cn('cursor-pointer flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-[#efe8fb] to-white p-3 text-left shadow-card', className)}>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#8a5cf5] shadow-card">
          <Icon name={o.icon} filled className="text-[26px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-heading text-[14px] font-semibold text-on-surface">{o.title}</span>
          <span className="block truncate text-[11px] text-on-surface-variant">{o.subtitle}</span>
          {progress != null && (
            <span className="mt-1 block">
              <span className="block h-1.5 overflow-hidden rounded-full bg-surface-container-high">
                <span className={cn('block h-full rounded-full', done ? 'bg-success' : 'bg-accent')} style={{ width: `${pct}%` }} />
              </span>
              <span className="mt-0.5 block text-[10px] text-on-surface-variant">
                {done ? `Complete · +${formatPoints(o.rewardPoints ?? 0)} on the way` : `${unit}${progress.toLocaleString('en-US')} of ${unit}${target.toLocaleString('en-US')} ${o.targetUnit !== 'baht' ? o.targetUnit : ''}`}
              </span>
            </span>
          )}
          <Reason text={reason} className="mt-0.5" />
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span className="flex items-center gap-1 font-heading text-[14px] font-bold text-accent">
            +{formatPoints(o.rewardPoints ?? 0)} <XMark size={14} />
          </span>
          <CtaPill action={action} size="sm" />
        </span>
      </motion.div>
    );
  }

  /* ---------------- Partner transfer (home tile) ---------------- */
  if (v === 'transfer') {
    const balance = appUserProfile.linkedPartners[o.id];
    return (
      <motion.div role="button" tabIndex={0} onClick={open} onKeyDown={(e) => e.key === "Enter" && open()} {...motionProps} className={cn('cursor-pointer relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-card', className)}>
        <BrandTile brandId={o.brandId} className="aspect-[4/3] w-full" size="sm" />
        <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2">
          <p className="line-clamp-1 text-[13px] font-medium text-on-surface">{o.title}</p>
          {o.transferFrom && o.transferTo ? (
            <p className="mt-0.5 flex items-center gap-1 text-[12px] text-on-surface-variant">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-px-gold text-[9px] font-bold text-white">P</span>
              {o.transferFrom.toLocaleString('en-US')} <Icon name="arrow_forward" className="text-[12px]" /> <XMark size={14} /> {o.transferTo.toLocaleString('en-US')}
            </p>
          ) : (
            <p className="mt-0.5 text-[11px] text-on-surface-variant">Rate shown at transfer</p>
          )}
          {balance ? <Reason text={`${balance.toLocaleString('en-US')} ${o.brand} linked`} className="mt-0.5" /> : <Reason text={reason} className="mt-0.5" />}
          <div className="mt-auto pt-1.5">
            <CtaPill action={action} size="sm" className="w-full" />
          </div>
        </div>
      </motion.div>
    );
  }

  /* ---------------- Travel ---------------- */
  if (v === 'travel') {
    return (
      <motion.button type="button" onClick={open} {...motionProps} className={cn('relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-card', className)}>
        <div className="relative">
          <div className="px-travel flex aspect-[4/3] w-full items-center justify-center text-white">
            <Icon name={o.icon} filled className="text-[44px]" />
          </div>
          {o.rewardPoints ? <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-primary">Up to {formatPoints(o.rewardPoints)} back</span> : null}
        </div>
        <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2">
          <p className="line-clamp-2 min-h-[2.6em] text-[13px] font-medium leading-snug text-on-surface">{o.title}</p>
          {o.priceThb && <p className="mt-0.5 text-[11px] text-on-surface-variant">{o.priceThb.toLocaleString('en-US')} Baht</p>}
          <Reason text={reason} className="mt-0.5" />
          {o.pointsCost > 0 ? <PointsPrice offer={o} size="sm" className="mt-auto pt-1.5" /> : <p className="mt-auto pt-1.5 text-[11px] text-on-surface-variant">{o.subtitle}</p>}
          <Tags offer={o} className="mt-1" />
        </div>
      </motion.button>
    );
  }

  /* ---------------- List row (New Arrival / X Store list) ---------------- */
  if (v === 'list') {
    return (
      <motion.button type="button" onClick={open} {...motionProps} className={cn('relative flex w-full gap-3 overflow-hidden rounded-2xl bg-white p-3 text-left shadow-card', className)}>
        <DiscountBadge pct={o.discountPct} className="rounded-tl-2xl" />
        <div className="w-[30%] shrink-0 pt-4">{o.offerType === 'eCoupon' ? <BrandTile brandId={o.brandId} className="aspect-square w-full rounded-xl" size="sm" /> : <ProductTile offer={o} className="aspect-square w-full rounded-xl" iconSize="text-[38px]" />}</div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="line-clamp-2 text-[14px] font-medium leading-snug text-on-surface">{o.title}</p>
          {o.priceThb && <p className="mt-0.5 text-[11px] text-on-surface-variant">{o.priceThb.toLocaleString('en-US')} Baht</p>}
          <Reason text={reason} className="mt-0.5" />
          <PointsPrice offer={o} size="md" className="mt-auto pt-2" />
          <Tags offer={o} className="mt-1" />
        </div>
      </motion.button>
    );
  }

  /* ---------------- Compact row (assistant results, related) ---------------- */
  return (
    <motion.div role="button" tabIndex={0} onClick={open} onKeyDown={(e) => e.key === "Enter" && open()} {...motionProps} className={cn('cursor-pointer flex w-full items-center gap-3 rounded-2xl bg-white p-2.5 text-left shadow-card', className)}>
      {o.offerType === 'Product' || o.offerType === 'Dining' ? <ProductTile offer={o} className="h-16 w-16 shrink-0 rounded-xl" iconSize="text-[28px]" /> : <BrandTile brandId={o.brandId} className="h-16 w-16 shrink-0 rounded-xl" size="xs" />}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[10px] uppercase tracking-wide text-on-surface-variant">{o.offerType === 'Shop' ? 'Scan & pay' : o.offerType === 'Mission' ? 'Mission' : o.offerType === 'Transfer' ? 'Partner points' : o.brand}</span>
        <span className="line-clamp-2 text-[13px] font-medium leading-snug text-on-surface">{o.title}</span>
        <span className="mt-0.5 block">
          {o.offerType === 'Shop' ? <ShopRate offer={o} size="sm" /> : o.offerType === 'Mission' ? <span className="flex items-center gap-1 text-[12px] font-bold text-accent">+{formatPoints(o.rewardPoints ?? 0)} <XMark size={12} /></span> : o.offerType === 'Transfer' ? <span className="text-[12px] text-on-surface-variant">{o.subtitle}</span> : o.pointsCost > 0 ? <PointsPrice offer={o} size="sm" /> : <span className="text-[12px] text-on-surface-variant">{o.subtitle}</span>}
        </span>
        <Reason text={reason} className="mt-0.5" />
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <CtaPill action={action} size="sm" />
        {action.note && <span className="max-w-[96px] text-right text-[9px] leading-tight text-on-surface-variant">{action.note}</span>}
      </span>
    </motion.div>
  );
}
