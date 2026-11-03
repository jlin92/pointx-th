import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDemo } from '@/app/DemoContext';
import { Screen } from './Screen';
import { OfferCard } from '@/components/offers/OfferCard';
import { Carousel, CategoryTab, Chip, HomeSection, SortIndicator } from '@/components/offers/Primitives';
import { Icon } from '@/components/ui/Icon';
import { Disclaimer } from '@/components/ui/Card';
import { settings } from '@/mock-data/settings';
import { byType, chipById, expandQuery, isGiftQuery, popularItems, searchOffers, storeChips } from '@/mock-data/offers';
import { primaryReason, rankOffers, topSessionAffinity } from '@/services/sortEngine';
import { flashDeals } from '@/services/selectors';
import type { Offer, ScoredOffer } from '@/types';
import { cn } from '@/hooks/utils';

/** Everything redeemable in X Store. */
const storePool = (): Offer[] => byType('Product', 'eCoupon', 'Dining', 'Donation', 'Travel');

/** Chapter 3 — X Store: smart search + category pages with DY sorting. */
export function XStoreScreen() {
  const { appUserProfile, searchQuery, setSearchQuery, activeStoreChip, setActiveStoreChip, trackAffinity, rankContext, sortMode, setRanking, openWhy, askMuse, sessionAffinity, points } = useDemo();
  const p = appUserProfile;
  const live = topSessionAffinity(sessionAffinity);

  // Tab order: persona default, with the live top affinity pulled forward for new members.
  const chips = useMemo(() => {
    const base = p.storeChips.map((id) => chipById(id)!).filter(Boolean);
    if (p.homeVariant !== 'newMember' || !live) return base;
    const hot = storeChips.find((c) => c.affinity === live);
    if (!hot || !base.includes(hot)) return base;
    const [deal, all] = base;
    return [deal, all, hot, ...base.filter((c) => c !== hot && c !== deal && c !== all)];
  }, [p, live]);

  const q = searchQuery.trim();
  const gift = isGiftQuery(q);
  const result = useMemo(() => {
    const pool = storePool();
    if (q) {
      const { exact, semantic } = searchOffers(q, pool);
      const a = rankOffers(exact, rankContext);
      // Gift queries are intentionally broad: keep popularity order and let the assistant narrow it down.
      const b = gift ? { ranked: rankOffers(semantic, { ...rankContext, mode: 'today' }).ranked.sort((x, y) => y.offer.redemptions - x.offer.redemptions), excluded: [] as ScoredOffer[] } : rankOffers(semantic, rankContext);
      if (!a.ranked.length && !b.ranked.length) {
        const fallback = rankOffers(popularItems(8), { ...rankContext, mode: 'today' });
        return { title: `No exact match for “${q}” · popular right now`, ranked: fallback.ranked, excluded: [] as ScoredOffer[], semanticCount: 0, fallback: true };
      }
      return { title: `Results for “${q}”`, ranked: [...a.ranked, ...b.ranked], excluded: [...a.excluded, ...b.excluded], semanticCount: b.ranked.length, fallback: false };
    }
    const chip = chipById(activeStoreChip) ?? storeChips[1];
    const r = rankOffers(pool.filter(chip.match), rankContext);
    return { title: chip.label === 'All' ? 'All items' : chip.label, ...r, semanticCount: 0, fallback: false };
  }, [q, gift, activeStoreChip, rankContext]);

  useEffect(() => {
    setRanking({ title: result.title, ranked: result.ranked, excluded: result.excluded });
    return () => setRanking(null);
  }, [result, setRanking]);

  const onChip = (id: string) => {
    setActiveStoreChip(id);
    setSearchQuery('');
    const chip = chipById(id);
    if (chip?.affinity) trackAffinity(chip.affinity, 1);
  };

  const within = result.ranked.filter((s) => s.offer.pointsCost > 0 && s.offer.pointsCost <= points).length;
  const hiddenSummary = summarise(result.excluded);
  const flash = useMemo(() => flashDeals(rankContext, 6), [rankContext]);
  const showFlash = !q && activeStoreChip === 'x-deal' && flash.length > 0;

  return (
    <Screen>
      <div className="px-header-light px-3 pb-0 pt-1">
        <label className="flex items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 shadow-card">
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={p.homeVariant === 'newMember' ? 'Search in X Store · try “earbuds” or “กาแฟ”' : 'Search in X Store'} aria-label="Search in X Store" className="w-full bg-transparent text-[15px] outline-none placeholder:text-on-surface-variant" />
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
            <CategoryTab key={c.id} label={c.label} emoji={c.emoji} active={!q && activeStoreChip === c.id} onClick={() => onChip(c.id)} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-surface px-3 pt-3">
        {q && (
          <button type="button" onClick={() => askMuse(q)} className={cn('flex items-center gap-3 rounded-2xl border p-3 text-left', gift ? 'border-primary/40 bg-[#1f1147] text-white' : 'border-primary/20 bg-primary-fixed')}>
            <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white', gift ? 'bg-white/15' : 'muse-gradient')}>
              <Icon name={gift ? 'redeem' : 'auto_awesome'} filled className="text-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn('block text-[13px] font-bold', gift ? 'text-white' : 'text-on-surface')}>{gift ? 'Looking for a gift? Let the assistant find the best one for your points' : `Ask the POINTX assistant about “${q}”`}</span>
              <span className={cn('block text-[11px]', gift ? 'text-white/75' : 'text-on-surface-variant')}>{gift ? 'Tell it who it’s for — it picks items within your points, or Point+Money' : `Best ${q} for your ${points.toLocaleString('en-US')} points, incl. Point+Money and ways to earn the gap`}</span>
            </span>
            <Icon name="chevron_right" className={gift ? 'text-white/80' : 'text-on-surface-variant'} />
          </button>
        )}

        {showFlash && (
          <HomeSection title="Flash Deal" tone="flash" onMore={() => onChip('x-all')} why>
            <Carousel itemWidth="w-[44%]">
              {flash.map((s, i) => (
                <OfferCard key={s.offer.id} offer={s.offer} index={i} variant="product" reason={sortMode === 'dy' ? primaryReason(s) : undefined} />
              ))}
            </Carousel>
          </HomeSection>
        )}

        <div className="flex items-center justify-between">
          <Chip label={sortMode === 'dy' ? 'For you' : 'Latest'} icon={sortMode === 'dy' ? 'bolt' : undefined} active={sortMode === 'dy'} onClick={openWhy} />
          <span className="text-[12px] text-on-surface-variant">
            {result.ranked.length} items{sortMode === 'dy' && within ? ` · ${within} within your points` : ''}
          </span>
        </div>

        <SortIndicator
          live={sortMode === 'dy' && !!live && !gift && !result.fallback}
          label={result.fallback || gift ? 'Default order · most redeemed first' : sortMode === 'dy' ? (live ? `Sorted for you · ${live.replace(/^brand:/, '')} first` : p.homeVariant === 'newMember' ? 'Sorted for you · within your points first' : 'Sorted for you · your taste + best value per point') : 'POINTX today · newest first, no filtering'}
          onWhy={openWhy}
        />

        <div className="flex items-center justify-between text-[12px] text-on-surface-variant">
          <span>{result.title}</span>
          {sortMode === 'dy' && result.excluded.length > 0 && (
            <button type="button" onClick={openWhy} className="flex items-center gap-1 font-medium">
              <Icon name="visibility_off" className="text-[14px]" />
              {result.excluded.length} hidden · {hiddenSummary}
            </button>
          )}
        </div>

        {q && result.semanticCount > 0 && !gift && (
          <p className="-mt-1 flex items-start gap-1.5 text-[11px] text-on-surface-variant">
            <Icon name="psychology" className="mt-px text-[14px] text-accent" />
            <span>
              Smart search understood “{q}” as {expandQuery(q).filter((t) => t !== q.toLowerCase()).slice(0, 4).join(', ')} · {result.semanticCount} intent match{result.semanticCount === 1 ? '' : 'es'} included
            </span>
          </p>
        )}

        <motion.div key={`${result.title}-${sortMode}-${result.ranked.map((s) => s.offer.id).slice(0, 6).join(',')}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
          {result.ranked.map((s, i) => (
            <OfferCard key={s.offer.id} offer={s.offer} index={i} variant={s.offer.offerType === 'Dining' || s.offer.offerType === 'Travel' ? 'auto' : s.offer.offerType === 'eCoupon' ? 'ecoupon' : 'product'} reason={sortMode === 'dy' ? primaryReason(s) : undefined} className={s.offer.offerType === 'Dining' ? 'col-span-2' : undefined} />
          ))}
        </motion.div>

        {result.ranked.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-card">
            <Icon name="search_off" className="text-[32px] text-on-surface-variant" />
            <p className="mt-2 text-sm font-semibold text-on-surface">No items match</p>
            <p className="text-[12px] text-on-surface-variant">Try “earbuds”, “massage”, “japan” or ask the assistant.</p>
          </div>
        )}

        <Disclaimer className="px-1">{settings.disclaimers.programmeRules}</Disclaimer>
      </div>
    </Screen>
  );
}

function summarise(excluded: ScoredOffer[]): string {
  const counts = new Map<string, number>();
  excluded.forEach((s) => counts.set(s.excluded!, (counts.get(s.excluded!) ?? 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => k.toLowerCase())
    .join(', ');
}
