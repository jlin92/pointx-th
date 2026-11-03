import { useDemo } from '@/app/DemoContext';
import { chapterIdByKey } from '@/app/chapters';
import { settings } from '@/mock-data/settings';
import type { Offer } from '@/types';

export interface OfferActionState {
  label: string;
  state: 'primary' | 'done' | 'disabled';
  /** Supporting note, e.g. "Point+Money · ฿1,200". */
  note?: string;
  run: () => void;
}

/** Resolves what the item's CTA does for this member right now. */
export function useOfferAction(o: Offer): OfferActionState {
  const { points, wallet, usedIds, redeemedExtra, joined, transferred, appUserProfile, redeemPoints, joinMission, transferPartner, openScan, showToast, goToChapter } = useDemo();
  const inWallet = wallet.includes(o.id);
  const used = usedIds.includes(o.id);
  const redeemed = redeemedExtra.includes(o.id) || appUserProfile.redeemedIds.includes(o.id);
  const gap = o.pointsCost - points;
  const topUp = gap > 0 ? Math.ceil(gap / settings.pointsPerBaht) : 0;

  switch (o.offerType) {
    case 'eCoupon':
      if (used) return { label: 'Used', state: 'done', run: () => goToChapter(chapterIdByKey('coupons')) };
      if (inWallet) return { label: 'In My Coupon', state: 'done', run: () => goToChapter(chapterIdByKey('coupons')) };
      if (!o.inStock) return { label: 'Sold out', state: 'disabled', run: () => showToast('This e-Coupon is out of stock') };
      if (gap > 0) return { label: 'Redeem', state: 'disabled', note: `Earn ${gap.toLocaleString('en-US')} more`, run: () => showToast(`You need ${gap.toLocaleString('en-US')} more points — try a mission or a transfer`) };
      return { label: 'Redeem', state: 'primary', run: () => redeemPoints(o) };
    case 'Product':
    case 'Dining':
    case 'Donation':
    case 'Travel': {
      const verb = o.offerType === 'Dining' || o.offerType === 'Travel' ? 'Book' : o.offerType === 'Donation' ? 'Donate' : 'Redeem';
      if (redeemed) return { label: o.offerType === 'Dining' ? 'Booked' : 'Redeemed', state: 'done', run: () => goToChapter(chapterIdByKey('mypointx')) };
      if (!o.inStock) return { label: 'Sold out', state: 'disabled', run: () => showToast('Out of stock') };
      if (o.pointsCost === 0) return { label: verb, state: 'primary', run: () => showToast(`Opens ${o.brand} (outside this demo)`) };
      if (gap > 0 && !o.pointPlusMoney) return { label: verb, state: 'disabled', note: `Earn ${gap.toLocaleString('en-US')} more`, run: () => showToast(`You need ${gap.toLocaleString('en-US')} more points`) };
      if (gap > 0) return { label: `${verb} · Point+Money`, state: 'primary', note: `${points.toLocaleString('en-US')} pts + ฿${topUp.toLocaleString('en-US')}`, run: () => redeemPoints(o) };
      return { label: verb, state: 'primary', note: 'Within your points', run: () => redeemPoints(o) };
    }
    case 'Shop':
      return { label: 'Scan', state: 'primary', run: () => openScan(o) };
    case 'Mission':
      if (joined[o.id] != null) return { label: 'Joined', state: 'done', run: () => goToChapter(chapterIdByKey('missions')) };
      return { label: 'Join', state: 'primary', run: () => joinMission(o) };
    case 'Transfer': {
      const balance = appUserProfile.linkedPartners[o.id];
      if (transferred.includes(o.id)) return { label: 'Transferred', state: 'done', run: () => goToChapter(chapterIdByKey('mypointx')) };
      if (balance && o.transferFrom && o.transferTo) return { label: 'Transfer', state: 'primary', note: `${balance.toLocaleString('en-US')} → ${Math.floor((balance / o.transferFrom) * o.transferTo).toLocaleString('en-US')} POINTX`, run: () => transferPartner(o) };
      return { label: 'Link', state: 'primary', run: () => transferPartner(o) };
    }
    default:
      return { label: o.cta, state: 'primary', run: () => showToast('Outside this demo') };
  }
}
