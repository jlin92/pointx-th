import { useDemo } from '@/app/DemoContext';
import { chapterById, chapterIdByKey } from '@/app/chapters';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/hooks/utils';

interface Tab {
  label: string;
  icon: string;
  chapter: number;
  keys: string[];
}

/** The four POINTX tabs around the central SCB scan button, as in the live app. */
const left: Tab[] = [
  { label: 'Home', icon: 'home', chapter: 1, keys: ['home', 'coupons', 'missions', 'travel', 'muse'] },
  { label: 'Shops', icon: 'storefront', chapter: chapterIdByKey('shops'), keys: ['shops'] },
];
const right: Tab[] = [
  { label: 'X Store', icon: 'shopping_bag', chapter: chapterIdByKey('xstore'), keys: ['xstore', 'detail'] },
  { label: 'My POINTX', icon: 'close', chapter: chapterIdByKey('mypointx'), keys: ['mypointx'] },
];

function TabButton({ tab, active, onClick }: { tab: Tab; active: boolean; onClick: () => void }) {
  const isX = tab.icon === 'close';
  return (
    <button type="button" onClick={onClick} aria-current={active ? 'page' : undefined} className={cn('relative flex w-full flex-col items-center gap-0.5 px-1 pb-1 pt-2', active ? 'text-accent' : 'text-on-surface-variant')}>
      {active && <span className="absolute -top-px left-1/2 h-0.5 w-[84%] -translate-x-1/2 rounded-full bg-accent" />}
      {isX ? (
        <span className={cn('flex h-[26px] w-[26px] items-center justify-center rounded-full border-2', active ? 'border-accent' : 'border-on-surface-variant')}>
          <Icon name="close" className="text-[18px]" style={{ fontVariationSettings: "'wght' 700" }} />
        </span>
      ) : (
        <Icon name={tab.icon} filled={active} className="text-[26px]" />
      )}
      <span className={cn('text-[11px]', active ? 'font-semibold' : 'font-normal')}>{tab.label}</span>
    </button>
  );
}

/** Bottom tab bar with the magenta active indicator and the central SCB scan button. */
export function BottomNav() {
  const { chapter, goToChapter, openScan } = useDemo();
  const key = chapterById(chapter).key;

  return (
    <nav aria-label="Primary" className="relative z-30 border-t border-surface-container-high bg-white px-1 pb-5">
      <ul className="flex items-end justify-between">
        {left.map((tab) => (
          <li key={tab.label} className="flex-1">
            <TabButton tab={tab} active={tab.keys.includes(key)} onClick={() => goToChapter(tab.chapter)} />
          </li>
        ))}
        <li className="relative flex w-20 shrink-0 justify-center">
          <button type="button" onClick={() => openScan()} aria-label="Scan to pay with POINTX" className="absolute -top-9 flex h-16 w-16 items-center justify-center rounded-full bg-white p-1 shadow-float">
            <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#3b1670] to-[#6a1b7a]">
              <span className="flex flex-col items-center">
                <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/70">
                  <img src="/pointx/scb-logo.svg" alt="" className="h-5 w-5" />
                </span>
                <span className="mt-0.5 text-[8px] font-bold tracking-wide text-white">SCB</span>
              </span>
            </span>
          </button>
        </li>
        {right.map((tab) => (
          <li key={tab.label} className="flex-1">
            <TabButton tab={tab} active={tab.keys.includes(key)} onClick={() => goToChapter(tab.chapter)} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
