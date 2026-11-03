import { brandStyle } from '@/mock-data/offers';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/hooks/utils';

const fontClass: Record<NonNullable<ReturnType<typeof brandStyle>['font']>, string> = {
  serif: 'font-serif font-bold tracking-wide',
  sans: 'font-sans font-semibold tracking-wide',
  black: 'font-heading font-bold tracking-tight',
  italic: 'font-heading font-bold italic tracking-tight',
};

interface BrandTileProps {
  brandId: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  round?: boolean;
}

/**
 * Brand logo stand-in: the live app shows partner logos on colour blocks; we
 * render the wordmark on the brand colour so no remote assets are needed and
 * nothing can 404 during a live demo.
 */
export function BrandTile({ brandId, className, size = 'md', round }: BrandTileProps) {
  const s = brandStyle(brandId);
  const text = { xs: 'text-[9px]', sm: 'text-[11px]', md: 'text-[15px]', lg: 'text-[20px]' }[size];
  const icon = { xs: 'text-[14px]', sm: 'text-[18px]', md: 'text-[26px]', lg: 'text-[34px]' }[size];
  const isGradient = s.bg.startsWith('linear');
  return (
    <div
      className={cn('flex items-center justify-center overflow-hidden', round ? 'rounded-full' : 'rounded-none', className)}
      style={{ background: isGradient ? s.bg : undefined, backgroundColor: isGradient ? undefined : s.bg, color: s.fg }}
      aria-label={s.label}
      role="img"
    >
      <div className={cn('flex flex-col items-center justify-center gap-0.5 px-2 text-center leading-none', fontClass[s.font ?? 'black'])}>
        {s.icon && !round && <Icon name={s.icon} filled className={cn(icon)} style={{ color: s.accent ?? s.fg }} />}
        {s.icon && round && size === 'xs' ? <Icon name={s.icon} filled className="text-[18px]" /> : <span className={cn(round ? 'max-w-full break-words px-1 text-[8px] leading-[1.05]' : text)}>{s.label}</span>}
      </div>
    </div>
  );
}

/**
 * Product visual: a soft tile with the item icon in the brand colour and the
 * brand wordmark in the corner (like the "Authorised Reseller" mark).
 */
export function ProductTile({ offer, className, iconSize = 'text-[44px]' }: { offer: { icon: string; brandId: string; brand: string }; className?: string; iconSize?: string }) {
  const s = brandStyle(offer.brandId);
  const colour = s.bg.startsWith('linear') || s.bg === '#ffffff' || s.bg === '#f1f1f1' ? s.fg : s.bg;
  return (
    <div className={cn('relative flex items-center justify-center overflow-hidden bg-[#f7f6fb]', className)} role="img" aria-label={offer.brand}>
      <span className="absolute right-2 top-2 max-w-[60%] truncate rounded px-1 text-[8px] font-bold uppercase tracking-wide text-on-surface-variant">{s.label}</span>
      <Icon name={offer.icon} className={cn(iconSize)} style={{ color: colour === '#ffffff' ? '#3b1670' : colour }} />
    </div>
  );
}
