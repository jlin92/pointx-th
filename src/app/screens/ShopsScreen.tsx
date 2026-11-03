import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDemo } from '@/app/DemoContext';
import { Screen } from './Screen';
import { OfferCard } from '@/components/offers/OfferCard';
import { CategoryTab, Chip, SortIndicator } from '@/components/offers/Primitives';
import { Icon } from '@/components/ui/Icon';
import { Disclaimer } from '@/components/ui/Card';
import { settings } from '@/mock-data/settings';
import { byType, chipById, searchOffers, shopChips } from '@/mock-data/offers';
import { primaryReason, rankOffers, topSessionAffinity } from '@/services/sortEngine';
import type { ScoredOffer } from '@/types';
import { cn } from '@/hooks/utils';

/** Chapter 2 — Shops: scan & pay merchants, category tabs, DY sorting. */
export function ShopsScreen() {
  const { appUserProfile, searchQuery, setSearchQuery, activeShopChip, setActiveShopChip, trackAffinity, rankContext, sortMode, setRanking, openWhy, askMuse, sessionAffinity } = useDemo();
  const p = appUserProfile;
  const live = topSessionAffinity(sessionAffinity);

  // Tab order: persona default, with the live top affinity pulled forward for new members.
  const chips = useMemo(() => {
    const base = p.shopChips.map((id) => chipById(id)!).filter(Boolean);
    if (p.homeVariant !== 'newMember' || !live) return base;
    const hot = shopChips.find((c) => c.affinity === live);
    if (!hot || !base.includes(hot)) return base;
    const [deal, all] = base;
    return [deal, all, hot, ...base.filter((c) => c !== hot && c !== deal && c !== all)];
  }, [p, live]);

  const q = searchQuery.trim();
  const result = useMemo(() => {
    const pool = byType('Shop');
    if (q) {
      const { exact, semantic } = searchOffers(q, pool);
      const a = rankOffers(exact, rankContext, { diversify: false });
      const b = rankOffers(semantic, rankContext, { diversify: false });
      return { title: `Results for “${q}”`, ranked: [...a.ranked, ...b.ranked], excluded: [...a.excluded, ...b.excluded], semanticCount: b.ranked.length };
    }
    const chip = chipById(activeShopChip) ?? shopChips[1];
    const r = rankOffers(pool.filter(chip.match), rankContext, { diversify: false });
    return { title: chip.label === 'All' ? 'All shops' : chip.label, ...r, semanticCount: 0 };
  }, [q, activeShopChip, rankContext]);

  useEffect(() => {
    setRanking({ title: result.title, ranked: result.ranked, excluded: result.excluded });
    return () => setRanking(null);
  }, [result, setRanking]);

  const onChip = (id: string) => {
    setActiveShopChip(id);
    setSearchQuery('');
    const chip = chipById(id);
    if (chip?.affinity) trackAffinity(chip.affinity, 1);
  };

  return (
    <Screen>
      <div className="px-header-light px-3 pb-0 pt-1">
        <label className="flex items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 shadow-card">
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search in shops" aria-label="Search in shops" className="w-full bg-transparent text-[15px] outline-none placeholder:text-on-surface-variant" />
          {searchQuery ? (
            <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear" className="text-on-surface-variant">
              <Icon name="cancel" filled className="text-[20px]" />
            </button>
          ) : (
            <Icon name="search" className="text-[24px] text-primary" />
          )}
        </label>
        <div className="no-scrollbar -mx-3 mt-3 flex overflow-x-auto px-3">
          {chips.map((c) => (
            <CategoryTab key={c.id} label={c.label} emoji={c.emoji} active={!q && activeShopChip === c.id} onClick={() => onChip(c.id)} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-surface px-3 pt-3">
        <div className="flex items-center justify-between">
          <Chip label={sortMode === 'dy' ? 'For you' : 'Latest'} icon={sortMode === 'dy' ? 'bolt' : undefined} active={sortMode === 'dy'} onClick={openWhy} />
          {sortMode === 'dy' && result.excluded.length > 0 && (
            <button type="button" onClick={openWhy} className="flex items-center gap-1 text-[12px] font-medium text-on-surface-variant">
              <Icon name="visibility_off" className="text-[14px]" />
              {result.excluded.length} hidden
            </button>
          )}
        </div>

        {q && (
          <button type="button" onClick={() => askMuse(q)} className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary-fixed p-3 text-left">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full muse-gradient text-white">
              <Icon name="auto_awesome" filled className="text-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-on-surface">Ask the POINTX assistant about “{q}”</span>
              <span className="block text-[11px] text-on-surface-variant">Where to scan & pay, points back and what your balance covers</span>
            </span>
            <Icon name="chevron_right" className="text-on-surface-variant" />
          </button>
        )}

        <SortIndicator live={sortMode === 'dy' && !!live} label={sortMode === 'dy' ? (live ? `Sorted for you · ${live.replace(/^brand:/, '')} first` : p.homeVariant === 'newMember' ? 'Sorted for you · points-back deals first' : 'Sorted for you · your shops first') : 'POINTX today · latest first'} onWhy={openWhy} />

        {q && result.semanticCount > 0 && (
          <p className="-mt-1 flex items-start gap-1.5 text-[11px] text-on-surface-variant">
            <Icon name="psychology" className="mt-px text-[14px] text-accent" />
            Smart search understood “{q}” · {result.semanticCount} intent match{result.semanticCount === 1 ? '' : 'es'} included
          </p>
        )}

        <motion.div key={`${result.title}-${sortMode}-${result.ranked.map((s) => s.offer.id).slice(0, 5).join(',')}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2.5">
          {result.ranked.map((s: ScoredOffer, i) => (
            <OfferCard key={s.offer.id} offer={s.offer} index={i} variant="shop" reason={sortMode === 'dy' ? primaryReason(s) : undefined} />
          ))}
        </motion.div>

        {result.ranked.length === 0 && (
          <div className={cn('rounded-2xl bg-white p-6 text-center shadow-card')}>
            <Icon name="search_off" className="text-[32px] text-on-surface-variant" />
            <p className="mt-2 text-sm font-semibold text-on-surface">No shops match</p>
            <p className="text-[12px] text-on-surface-variant">Try “coffee”, “fuel”, “cinema” or ask the assistant.</p>
          </div>
        )}

        <Disclaimer className="px-1">{settings.disclaimers.redeem}</Disclaimer>
      </div>
    </Screen>
  );
}
