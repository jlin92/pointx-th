import type { ReactNode } from 'react';
import { cn } from '@/hooks/utils';
import { Icon } from '@/components/ui/Icon';

interface MobileFrameProps {
  children: ReactNode;
  className?: string;
  /** Status bar colour scheme — light text over the dark purple header. */
  dark?: boolean;
  /** Background behind the status bar. */
  barClass?: string;
}

/** iOS-style status bar: clock on the left, signal/wifi/battery on the right. */
function StatusBar({ dark }: { dark?: boolean }) {
  return (
    <div className={cn('relative z-40 flex h-11 shrink-0 items-center justify-between px-7 pt-2', dark ? 'text-white' : 'text-on-surface')}>
      <span className="font-heading text-[15px] font-semibold tracking-tight">8:15</span>
      <div className="flex items-center gap-1.5">
        <Icon name="signal_cellular_alt" filled className="text-[17px]" />
        <Icon name="wifi" filled className="text-[17px]" />
        <span className={cn('rounded-md px-1.5 py-0.5 text-[11px] font-bold', dark ? 'bg-white text-black' : 'bg-black text-white')}>97</span>
      </div>
    </div>
  );
}

/**
 * Renders a phone frame with a Dynamic Island, status bar and home indicator.
 * Children flow below the status bar; drawers/modals are contained within the
 * device viewport.
 */
export function MobileFrame({ children, className, dark, barClass }: MobileFrameProps) {
  return (
    <div className={cn('relative mx-auto w-full max-w-[420px] select-none', className)}>
      <div className="relative rounded-[52px] bg-[#1c1c22] p-[10px] shadow-frame">
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[44px] bg-surface">
          <div className="pointer-events-none absolute left-1/2 top-2.5 z-50 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
          <div className="relative flex h-full flex-col">
            <div className={cn(barClass ?? (dark ? 'px-header-dark' : 'px-header-home'))}>
              <StatusBar dark={dark} />
            </div>
            {children}
          </div>
          <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-50 h-1 w-28 -translate-x-1/2 rounded-full bg-black/60" />
        </div>
      </div>
    </div>
  );
}
