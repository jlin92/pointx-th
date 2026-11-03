import { useDemo } from '@/app/DemoContext';
import { chapterById, chapterIdByKey } from '@/app/chapters';
import { Icon } from '@/components/ui/Icon';
import { cn, formatPoints } from '@/hooks/utils';

/** POINTX "X" coin mark used next to every points figure. */
export function XMark({ className, size = 18 }: { className?: string; size?: number }) {
  return <img src="/pointx/pointx-logo.svg" alt="" width={size} height={size} className={cn('inline-block shrink-0', className)} />;
}

/** Outlined points pill from the top-right of Shops / X Store. */
export function PointsPill({ dark, onClick }: { dark?: boolean; onClick?: () => void }) {
  const { points } = useDemo();
  return (
    <button type="button" onClick={onClick} aria-label={`${formatPoints(points)} points`} className={cn('flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 font-heading text-[15px] font-semibold', dark ? 'border-white/0 text-white' : 'border-accent/70 bg-white/60 text-primary')}>
      <XMark size={20} />
      {formatPoints(points)}
    </button>
  );
}

/**
 * Top app bar, matching the POINTX app:
 *  - Home: lavender fade with "Hi NAME", icon buttons and the points line.
 *  - Shops / X Store: lavender fade with title + outlined points pill.
 *  - My POINTX and sub-screens: deep purple → magenta gradient.
 */
export function HeaderBar() {
  const { chapter, goToChapter, appUserProfile, detailItem, points, showToast, openWhy } = useDemo();
  const meta = chapterById(chapter);
  const myPointx = chapterIdByKey('mypointx');

  if (meta.key === 'home') {
    return (
      <header className="px-header-home relative z-30 px-4 pb-1 pt-1">
        <div className="flex items-center justify-between">
          <p className="font-heading text-[20px] text-on-surface">
            Hi <span className="font-heading text-[26px] font-semibold italic text-[#6b3fd1]" style={{ fontFamily: '"Brush Script MT", "Snell Roundhand", "Prompt", cursive' }}>{appUserProfile.firstName}</span>
          </p>
          <div className="flex items-center gap-1.5">
            {[
              { icon: 'help', label: 'Help', onClick: () => goToChapter(chapterIdByKey('muse')) },
              { icon: 'notifications', label: 'Notifications', onClick: openWhy, dot: true },
              { icon: 'search', label: 'Search', onClick: () => goToChapter(chapterIdByKey('xstore')) },
              { icon: 'person', label: 'Account', onClick: () => goToChapter(myPointx) },
            ].map((b) => (
              <button key={b.icon} type="button" onClick={b.onClick} aria-label={b.label} className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-on-surface shadow-card">
                <Icon name={b.icon} className="text-[22px]" />
                {b.dot && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />}
              </button>
            ))}
          </div>
        </div>
        <button type="button" onClick={() => goToChapter(myPointx)} className="mt-1.5 flex items-center gap-2 text-on-surface">
          <XMark size={26} />
          <span className="font-heading text-[26px] font-semibold leading-none">{formatPoints(points)}</span>
          <Icon name="arrow_forward" className="text-[18px] text-on-surface-variant" />
          {appUserProfile.expiringPoints && (
            <span className="ml-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
              {formatPoints(appUserProfile.expiringPoints.amount)} expire {appUserProfile.expiringPoints.when}
            </span>
          )}
        </button>
      </header>
    );
  }

  if (meta.key === 'shops' || meta.key === 'xstore') {
    return (
      <header className="px-header-light relative z-30 flex items-center justify-between px-4 pb-2 pt-1">
        <h1 className="font-heading text-[22px] font-semibold text-primary">{meta.title}</h1>
        <PointsPill onClick={() => goToChapter(myPointx)} />
      </header>
    );
  }

  if (meta.key === 'mypointx') {
    return (
      <header className="px-header-dark relative z-30 px-4 pb-2 pt-1 text-white">
        <h1 className="font-heading text-[22px] font-medium">My POINTX</h1>
      </header>
    );
  }

  const backTarget = (() => {
    switch (meta.key) {
      case 'detail':
        return detailItem?.offerType === 'Shop' ? chapterIdByKey('shops') : detailItem?.offerType === 'Mission' ? chapterIdByKey('missions') : chapterIdByKey('xstore');
      case 'travel':
      case 'coupons':
      case 'missions':
      case 'muse':
        return 1;
      default:
        return 1;
    }
  })();
  const title = meta.key === 'detail' ? '' : meta.key === 'coupons' ? 'My coupon' : meta.key === 'muse' ? 'POINTX assistant' : meta.title;

  return (
    <header className="px-header-dark relative z-30 flex h-12 items-center justify-between px-2 text-white">
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => goToChapter(backTarget)} aria-label="Back" className="flex h-10 w-10 items-center justify-center">
          <Icon name="arrow_back" className="text-[24px]" />
        </button>
        <span className="truncate font-heading text-[18px] font-medium">{title}</span>
      </div>
      {meta.key === 'muse' ? (
        <button type="button" onClick={() => showToast('Conversation history is outside this demo')} aria-label="History" className="flex h-10 w-10 items-center justify-center">
          <Icon name="history" className="text-[22px]" />
        </button>
      ) : (
        <div className="pr-2">
          <PointsPill dark onClick={() => goToChapter(myPointx)} />
        </div>
      )}
    </header>
  );
}
