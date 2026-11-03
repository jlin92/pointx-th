import { useEffect, useMemo } from 'react';
import { useDemo } from '@/app/DemoContext';
import { Screen } from './Screen';
import { OfferCard } from '@/components/offers/OfferCard';
import { SectionHeader, SortIndicator } from '@/components/offers/Primitives';
import { Icon } from '@/components/ui/Icon';
import { Disclaimer } from '@/components/ui/Card';
import { settings } from '@/mock-data/settings';
import { missionsForTab } from '@/services/selectors';
import { primaryReason, topSessionAffinity } from '@/services/sortEngine';
import { formatPoints } from '@/hooks/utils';

/** Chapter 6 — Missions: joined missions with progress, then ranked missions to join. */
export function MissionsScreen() {
  const { rankContext, joined, sortMode, setRanking, openWhy, points, appUserProfile, sessionAffinity } = useDemo();
  const data = useMemo(() => missionsForTab(rankContext, joined), [rankContext, joined]);
  const live = topSessionAffinity(sessionAffinity);
  const potential = data.ranked.reduce((t, s) => t + (s.offer.rewardPoints ?? 0), 0);

  useEffect(() => {
    setRanking({ title: 'Missions', ranked: data.ranked, excluded: data.excluded });
    return () => setRanking(null);
  }, [data, setRanking]);

  return (
    <Screen>
      <div className="flex flex-col gap-3 px-3 pt-3">
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#3b1670] to-[#8a1562] p-4 text-white shadow-card">
          <Icon name="emoji_events" filled className="text-[36px] text-[#f7c948]" />
          <div className="flex-1">
            <p className="font-heading text-[16px] font-semibold">{points < 5000 ? 'Fastest way to more points' : 'Missions for you'}</p>
            <p className="text-[12px] text-white/85">
              {formatPoints(potential)} bonus points available across {data.ranked.length} missions{appUserProfile.hasCreditCard ? '' : ' · card missions hidden until you link an SCB card'}
            </p>
          </div>
        </div>

        {data.joined.length > 0 && (
          <section>
            <SectionHeader title="In progress" />
            <div className="mt-2 flex flex-col gap-2">
              {data.joined.map((o, i) => (
                <OfferCard key={o.id} offer={o} index={i} variant="mission" />
              ))}
            </div>
          </section>
        )}

        <SortIndicator live={sortMode === 'dy' && !!live} label={sortMode === 'dy' ? (appUserProfile.homeVariant === 'newMember' ? 'Sorted for you · easiest to earn first' : 'Sorted for you · your habits first') : 'POINTX today · newest first'} onWhy={openWhy} />

        <section>
          <SectionHeader title={data.joined.length ? 'More missions' : 'Missions'} />
          <div className="mt-2 flex flex-col gap-2">
            {data.ranked.map((s, i) => (
              <OfferCard key={s.offer.id} offer={s.offer} index={i} variant="mission" reason={sortMode === 'dy' ? primaryReason(s) : undefined} />
            ))}
          </div>
        </section>

        <Disclaimer className="px-1">{settings.disclaimers.programmeRules}</Disclaimer>
      </div>
    </Screen>
  );
}
