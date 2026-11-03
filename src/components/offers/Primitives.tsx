import type { ReactNode } from 'react';
import { useDemo } from '@/app/DemoContext';
import { Icon } from '@/components/ui/Icon';
import { XMark } from '@/components/layout/HeaderBar';
import { cn, formatPoints } from '@/hooks/utils';
import type { Offer } from '@/types';

/**
 * Home shelf, in the POINTX visual language: a plain heading with "See all",
 * or a coloured banner header (Flash Deal, Eat Around, Wealth Wonders…).
 */
export function HomeSection({
  title,
  onMore,
  children,
  why,
  subtitle,
  tone = 'plain',
  countdown,
  className,
}: {
  title: string;
  onMore?: () => void;
  children: ReactNode;
  why?: boolean;
  subtitle?: ReactNode;
  tone?: 'plain' | 'flash' | 'eat' | 'gold' | 'special' | 'travel';
  countdown?: string;
  className?: string;
}) {
  const { openWhy } = useDemo();
  const banded = tone !== 'plain';
  const bandClass = { flash: 'px-flash text-white', eat: 'px-eat text-white', gold: 'px-gold text-[#f7e7b8]', special: 'bg-[#e6ddf7] text-on-surface', travel: 'px-travel text-white', plain: '' }[tone];
  return (
    <section className={cn(banded && 'overflow-hidden rounded-2xl shadow-card', className)}>
      {banded ? (
        <div className={cn('flex items-center justify-between px-4 py-3', bandClass)}>
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate font-heading text-[18px] font-semibold">{title}</h2>
            {countdown && (
              <span className="flex items-center gap-0.5 text-[12px] font-medium">
                Ends in
                {countdown.split(':').map((p, i) => (
                  <span key={i} className="ml-0.5 rounded bg-white px-1 py-0.5 font-heading text-[12px] font-bold text-on-surface">
                    {p}
                  </span>
                ))}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
            {why && <WhyButton onClick={openWhy} dark={tone !== 'special'} />}
            {onMore && (
              <button type="button" onClick={onMore} className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-accent">
                See all
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 px-1">
          <h2 className="min-w-0 truncate font-heading text-[18px] font-semibold text-on-surface">{title}</h2>
          <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
            {why && <WhyButton onClick={openWhy} />}
            {onMore && (
              <button type="button" onClick={onMore} className="flex items-center text-[13px] font-medium text-on-surface-variant">
                See all
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            )}
          </div>
        </div>
      )}
      {subtitle && <div className={cn('mt-1 text-[11px] text-on-surface-variant', banded ? 'px-4 pt-2' : 'px-1')}>{subtitle}</div>}
      <div className={cn(banded ? 'bg-gradient-to-b from-black/[0.03] to-transparent p-3' : 'mt-2.5')}>{children}</div>
    </section>
  );
}

/** Horizontal carousel of fixed-width cards with hidden scrollbar. */
export function Carousel({ children, itemWidth = 'w-[44%]' }: { children: ReactNode[]; itemWidth?: string }) {
  return (
    <div className="no-scrollbar -mx-3 flex items-stretch gap-2.5 overflow-x-auto px-3 pb-1">
      {children.map((c, i) => (
        <div key={i} className={cn('flex shrink-0', itemWidth)}>
          {c}
        </div>
      ))}
    </div>
  );
}

/** Small "Why this?" affordance that opens the reasoning rail. */
export function WhyButton({ onClick, className, dark }: { onClick: () => void; className?: string; dark?: boolean }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label="Why is this shown now?"
      className={cn('flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold', dark ? 'bg-white/20 text-white' : 'bg-white text-on-surface-variant shadow-card', className)}
    >
      <Icon name="info" className="text-[13px]" />
      Why this?
    </button>
  );
}

/** Category tab with emoji icon, as on the Shops / X Store tabs. */
export function CategoryTab({ label, emoji, active, onClick }: { label: string; emoji: string; active?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn('flex w-[76px] shrink-0 flex-col items-center gap-1 rounded-t-2xl px-1 pb-2 pt-2 transition-colors', active ? 'bg-white text-on-surface' : 'text-on-surface-variant')}>
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl text-[22px]', active ? 'bg-primary-fixed' : 'bg-white/60')}>{emoji}</span>
      <span className={cn('w-full truncate text-center text-[12px]', active ? 'font-semibold' : 'font-medium')}>{label}</span>
    </button>
  );
}

/** Outlined filter chip ("Latest"). */
export function Chip({ label, icon, active, onClick }: { label: string; icon?: string; active?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn('flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors', active ? 'border-primary bg-primary text-white' : 'border-outline-variant bg-white text-on-surface')}>
      {icon && <Icon name={icon} className="text-[15px]" />}
      {label}
    </button>
  );
}

/** Plain section heading with optional trailing action. */
export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-heading text-[18px] font-semibold text-on-surface">{title}</h2>
      {action && (
        <button type="button" onClick={onAction} className="flex items-center text-[13px] font-medium text-on-surface-variant">
          {action}
          <Icon name="chevron_right" className="text-[18px]" />
        </button>
      )}
    </div>
  );
}

/** Thin DY sort indicator shown above personalised lists. */
export function SortIndicator({ label, onWhy, live }: { label: string; onWhy?: () => void; live?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-card">
      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-on-surface">
        <Icon name={live ? 'bolt' : 'swap_vert'} filled={live} className={cn('text-[16px]', live ? 'text-accent' : 'text-on-surface-variant')} />
        {label}
      </span>
      {onWhy && (
        <button type="button" onClick={onWhy} className="text-[12px] font-semibold text-accent">
          Why this order?
        </button>
      )}
    </div>
  );
}

/** Pink points price with optional strikethrough original, e.g. "⊗ 61,763  68,625". */
export function PointsPrice({ offer: o, size = 'md', className }: { offer: Offer; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const main = { sm: 'text-[15px]', md: 'text-[18px]', lg: 'text-[26px]' }[size];
  const strike = { sm: 'text-[11px]', md: 'text-[12px]', lg: 'text-[14px]' }[size];
  const mark = { sm: 14, md: 18, lg: 24 }[size];
  return (
    <span className={cn('flex items-baseline gap-1.5', className)}>
      <span className="flex items-center gap-1">
        <XMark size={mark} />
        <span className={cn('font-heading font-bold leading-none text-accent', main)}>{formatPoints(o.pointsCost)}</span>
      </span>
      {o.pointsOriginal && <span className={cn('text-on-surface-variant line-through', strike)}>{formatPoints(o.pointsOriginal)}</span>}
    </span>
  );
}

/** "12.5 = 1 Baht" / "9 ~~12.5~~ = 1 Baht" rate line for shops. */
export function ShopRate({ offer: o, size = 'md' }: { offer: Offer; size?: 'sm' | 'md' | 'lg' }) {
  const main = { sm: 'text-[15px]', md: 'text-[20px]', lg: 'text-[26px]' }[size];
  const deal = (o.shopRate ?? 12.5) < 12.5;
  return (
    <span className="flex items-baseline gap-1.5">
      <XMark size={size === 'sm' ? 14 : 18} className="self-center" />
      <span className={cn('font-heading font-semibold leading-none', main, deal ? 'text-accent' : 'text-on-surface')}>{o.shopRate ?? 12.5}</span>
      {deal && <span className="text-[12px] text-on-surface-variant line-through">12.5</span>}
      <span className="text-[13px] text-on-surface">= 1 Baht</span>
    </span>
  );
}

/** The purple→orange "Point+Money ฿" badge and the "20 left" tag. */
export function Tags({ offer: o, className }: { offer: Offer; className?: string }) {
  return (
    <span className={cn('flex flex-wrap items-center gap-1', className)}>
      {o.stockLeft != null && o.stockLeft <= 40 && <span className="rounded border border-primary/30 bg-primary-fixed/40 px-1.5 py-0.5 text-[10px] font-medium text-primary">{o.stockLeft} left</span>}
      {o.pointPlusMoney && o.pointsCost > 0 && (
        <span className="px-points-money flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold text-white">
          Point<span className="text-[#ffd166]">+</span>Money <span className="rounded-sm bg-white/90 px-0.5 text-[9px] text-[#f08c2e]">฿</span>
        </span>
      )}
    </span>
  );
}

/** Pink discount badge, top-left of a card. */
export function DiscountBadge({ pct, className }: { pct?: number; className?: string }) {
  if (!pct) return null;
  return <span className={cn('absolute left-0 top-0 z-10 rounded-br-xl rounded-tl-xl bg-px-badge-red px-2 py-1 text-[12px] font-bold text-white', className)}>-{pct}%</span>;
}

/** Personalisation reason shown beneath a title (DY picks / assistant). */
export function Reason({ text, className }: { text?: string; className?: string }) {
  if (!text) return null;
  return (
    <span className={cn('flex items-start gap-1 text-[11px] leading-snug text-accent', className)}>
      <Icon name="auto_awesome" filled className="mt-px text-[12px]" />
      <span className="font-medium">{text}</span>
    </span>
  );
}
