import { useDemo } from '@/app/DemoContext';
import { chapterById } from '@/app/chapters';
import { Icon } from '@/components/ui/Icon';
import { RankingBoard } from './RankingBoard';
import { liveBanner } from '@/services/selectors';
import { topSessionAffinity } from '@/services/sortEngine';

/**
 * Left-side "Why shown now" panel. Opens when the member taps "Why this?" or
 * "Why this order?" and explains the signals and the sort behind what the
 * selected member is seeing right now.
 */
export function WhyShownPanel({ onClose }: { onClose?: () => void }) {
  const { appUserProfile, chapter, sessionAffinity, ranking, sortMode, bannerIndex, likedIds, dislikedIds } = useDemo();
  const { name, context, why, whyShownNow } = appUserProfile;
  const screen = chapterById(chapter);
  const liveSignals = Object.entries(sessionAffinity)
    .filter(([k]) => !k.startsWith('tag:'))
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  const isNew = appUserProfile.homeVariant === 'newMember';
  const live = topSessionAffinity(sessionAffinity);

  const treatment = (() => {
    switch (screen.key) {
      case 'home': {
        const banner = isNew && live && liveBanner(live) ? `Generated banner from live “${live}” affinity` : `Generative banner variant ${String.fromCharCode(65 + bannerIndex)} · ${appUserProfile.bannerVariants[bannerIndex]?.note ?? ''}`;
        return `${banner}. ${appUserProfile.homeSections[0]?.strategy ?? ''}`;
      }
      case 'shops':
        return isNew
          ? 'Shops ranked by value per point (points-back deals first) and live affinity; category tabs reorder to the live top affinity. Smart search understands “coffee” / “กาแฟ” and hands off to Shopping Muse.'
          : 'Shops ranked by her scan & pay habits (Café Amazon, lounges) and points-back value; tabs ordered by her categories. Smart search hands off to Shopping Muse.';
      case 'xstore':
        return isNew
          ? 'X Store ranked by reach (within 1,250 points first, Point+Money stretch next), value per point and live affinity. Rules hide out-of-stock, Wealth-only and ✕-rated items. Smart search expands intent words; a hand-off card routes the query to Shopping Muse.'
          : 'X Store ranked by affinity (Apple, dining, travel) + value per point. Rules hide AirPods-like items (bought 6 weeks ago), redeemed and wallet items; the Wealth shelf is unlocked. Smart search hands off to Shopping Muse.';
      case 'detail':
        return isNew ? 'Point+Money split against her 1,250 balance; if points-only and short, the mission and partner transfer that close the gap are recommended (earn next-best action).' : 'Value panel shows points per ฿1 vs the 12.5 scan rate and the Point+Money split; M Card transfer offered as a top-up; related items from the same brand / tags.';
      case 'coupons':
        return 'Suggestions below the wallet are e-Coupons within balance, ranked by value per point; redeemed and wallet items excluded.';
      case 'missions':
        return isNew ? 'Earn boost: low balance, so missions are promoted and sorted easiest-to-earn first; card missions hidden (no SCB credit card); First Scan & Pay pinned as a targeted mission.' : 'Targeted card-bill mission pinned (cardholder); joined Eat Around mission shows live progress 2/3; others ranked by her habits (dining, coffee).';
      case 'mypointx':
        return isNew ? 'Linked partners (AIS, The 1) pulled to the top with the exact POINTX she would receive; Cashback shows “Credit card not found” with a card-link nudge.' : 'M Card (4,400 linked) first — the top-up that makes a MacBook reachable; expiring-points banner on the balance card; cardholder bill payment surfaced.';
      case 'travel':
        return isNew ? 'Popular stays with the Point+Money split; airline miles listed with minimums.' : 'Japan first from last November’s XTravel booking; Royal Orchid Plus flagged as linked; Point+Money split against her balance.';
      default:
        return isNew ? 'Proactive education nudge · prompts built for a small balance (“What can I get with 1,250 points?”) · each intent updates affinity in real time.' : 'Proactive expiry nudge · value-ranked results within balance · redeemed-, wallet- and mission-aware answers · Point+Money math and partner top-ups.';
    }
  })();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5 no-scrollbar">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-accent">Why shown now</p>
          <h2 className="text-lg font-extrabold text-ink">{name}</h2>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close why shown now" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-ink">
            ✕
          </button>
        )}
      </div>

      <p className="text-xs leading-relaxed text-muted">{context}</p>

      <div className="rounded-2xl border border-accent/20 bg-accent-soft p-3">
        <p className="text-xs font-bold text-accent">On this screen · {screen.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink">{treatment}</p>
      </div>

      {ranking && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
            Sorting optimiser · {ranking.title}
            {sortMode === 'today' && <span className="ml-1 rounded bg-black/[0.06] px-1.5 py-0.5 text-[10px] normal-case">POINTX today</span>}
          </p>
          {sortMode === 'today' ? (
            <p className="rounded-xl border border-dashed border-black/[0.12] bg-white/60 p-3 text-[11px] text-muted">Newest first, no scoring, no filtering — switch the presenter toggle back to Dynamic Yield to see the weighted ranking.</p>
          ) : (
            <RankingBoard ranked={ranking.ranked} excluded={ranking.excluded} />
          )}
        </div>
      )}

      <div className="rounded-2xl border border-black/[0.06] bg-white p-3">
        <p className="text-xs font-bold text-ink">Why this, right now</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{whyShownNow}</p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Live session signals</p>
        {liveSignals.length === 0 ? (
          <p className="rounded-xl border border-dashed border-black/[0.12] bg-white/60 p-3 text-[11px] text-muted">Nothing yet — {isNew ? 'ranking is popularity + reach based. Tap a category, open an item, rate a Trending card or ask the assistant and come back.' : 'ranking uses her historic affinities. Browse to add live signals on top.'}</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {liveSignals.map(([k, score], i) => (
              <li key={k} className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${score < 0 ? 'bg-black/[0.08] text-muted line-through' : i === 0 ? 'bg-accent text-white' : 'bg-white text-ink shadow-sm'}`}>
                <Icon name={score < 0 ? 'thumb_down' : 'bolt'} filled className="text-[12px]" />
                {k.replace(/^brand:/, '')} · {score > 0 ? '+' : ''}
                {Math.round(score * 10) / 10}
              </li>
            ))}
          </ul>
        )}
        {(likedIds.length > 0 || dislikedIds.length > 0) && (
          <p className="text-[10px] text-muted">
            Explicit feedback: {likedIds.length} ✓ · {dislikedIds.length} ✕ — ✕ items are removed by rule and their category demoted.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Signals considered</p>
        {why.map((reason) => (
          <div key={reason.label} className="flex items-start gap-3 rounded-xl border border-black/[0.06] bg-white p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Icon name={reason.icon} filled className="text-lg" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink">{reason.label}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{reason.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-auto text-[10px] leading-relaxed text-muted">Reasoning is illustrative. Dynamic Yield sorts, filters and tests the experience via API against POINTX’s own UI; Shopping Muse handles conversational discovery against the same catalogue feed and the member’s live balance.</p>
    </div>
  );
}
