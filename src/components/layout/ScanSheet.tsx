import { useEffect, useMemo, useState } from 'react';
import { useDemo } from '@/app/DemoContext';
import { Drawer } from '@/components/ui/Drawer';
import { Icon } from '@/components/ui/Icon';
import { BrandTile } from '@/components/offers/BrandTile';
import { XMark } from './HeaderBar';
import { byType } from '@/mock-data/offers';
import { settings } from '@/mock-data/settings';
import { rankOffers, primaryReason } from '@/services/sortEngine';
import type { Offer } from '@/types';
import { cn, formatPoints } from '@/hooks/utils';

const presetAmount = (shop: Offer): number => {
  if (shop.tags.includes('coffee') || shop.tags.includes('cafe')) return 135;
  if (shop.category === 'Grocery') return 860;
  if (shop.category === 'Gas & Auto') return 1200;
  if (shop.category === 'Fashion') return 1490;
  if (shop.category === 'Entertainment') return 320;
  if (shop.category === 'Food & Beverage') return 420;
  if (shop.category === 'Health & Beauty') return 2100;
  if (shop.category === 'Travel') return 3500;
  return 990;
};

/**
 * The SCB scan button opens this sheet: a simulated QR scan that resolves to
 * a shop, then the pay step — fully with POINTX, or with SCB EASY and points
 * back. DY ranks "your shops" and nudges which way to pay.
 */
export function ScanSheet() {
  const { scanOpen, setScanOpen, scanShop, rankContext, points, scanPay, appUserProfile } = useDemo();
  const [shop, setShop] = useState<Offer | null>(null);
  const [amount, setAmount] = useState(0);
  const [payWith, setPayWith] = useState<'points' | 'money'>('points');

  useEffect(() => {
    if (scanOpen) {
      setShop(scanShop);
      if (scanShop) setAmount(presetAmount(scanShop));
    }
  }, [scanOpen, scanShop]);

  const yourShops = useMemo(() => rankOffers(byType('Shop'), rankContext).ranked.slice(0, 6), [rankContext]);

  const rate = shop?.shopRate ?? settings.pointsPerBaht;
  const cost = Math.round(amount * rate);
  const pointsUsed = Math.min(points, cost);
  const cashTopUp = cost > points ? Math.ceil((cost - points) / rate) : 0;
  // Points back is earned when you pay with POINTX (Point+Money counts).
  const back = shop?.pointsBackPct ? Math.round(amount * settings.pointsPerBaht * (shop.pointsBackPct / 100)) : 0;
  const isNew = appUserProfile.homeVariant === 'newMember';

  const choose = (s: Offer) => {
    setShop(s);
    setAmount(presetAmount(s));
    setPayWith('points');
  };

  const nudge = (() => {
    if (!shop) return null;
    if (back && cashTopUp) return `Pay with POINTX (Point+Money) and ${shop.pointsBackPct}% comes back — ${formatPoints(back)} points on this bill. Paying with SCB EASY earns nothing here.`;
    if (back) return `Deal shop: pay with POINTX and get ${formatPoints(back)} points back (${shop.pointsBackPct}% of the bill).`;
    if (rate < settings.pointsPerBaht) return `Deal shop: ${rate} points = ฿1 here instead of 12.5 — paying with points saves ${Math.round((1 - rate / settings.pointsPerBaht) * 100)}%.`;
    if (appUserProfile.expiringPoints) return `Use expiring points: this takes ${formatPoints(pointsUsed)} of the ${formatPoints(appUserProfile.expiringPoints.amount)} expiring ${appUserProfile.expiringPoints.when}.`;
    if (isNew && cashTopUp) return `Tip: keep your ${formatPoints(points)} points for a Starbucks e-Coupon (1,149) and pay this one with SCB EASY.`;
    return null;
  })();

  return (
    <Drawer open={scanOpen} onClose={() => setScanOpen(false)} title={shop ? 'Pay with POINTX' : 'Scan to pay'}>
      {!shop ? (
        <div className="flex flex-col gap-3 pb-2">
          <div className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-2xl bg-black">
            <div className="absolute inset-3 rounded-xl border-2 border-dashed border-white/40" />
            <Icon name="qr_code_scanner" className="text-[56px] text-white/80" />
            <span className="absolute -bottom-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-on-surface shadow-card">Point camera at a shop QR</span>
          </div>
          <p className="mt-2 text-center text-[12px] text-on-surface-variant">Or pick a shop to simulate the scan</p>
          <p className="flex items-center gap-1 text-[11px] font-semibold text-primary">
            <Icon name="bolt" filled className="text-[13px]" />
            Your shops · ranked by Dynamic Yield
          </p>
          <div className="grid grid-cols-3 gap-2">
            {yourShops.map((s) => (
              <button key={s.offer.id} type="button" onClick={() => choose(s.offer)} className="flex flex-col items-center gap-1 rounded-xl bg-surface p-2 text-center">
                <BrandTile brandId={s.offer.brandId} round size="xs" className="h-11 w-11 ring-1 ring-black/5" />
                <span className="line-clamp-1 w-full text-[10px] font-semibold text-on-surface">{s.offer.brand}</span>
                <span className="text-[9px] text-accent">{s.offer.pointsBackPct ? `${s.offer.pointsBackPct}% back` : primaryReason(s)?.startsWith('Affinity') ? 'Your shop' : `${s.offer.shopRate} = ฿1`}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 pb-2">
          <div className="flex items-center gap-3 rounded-2xl bg-surface p-3">
            <BrandTile brandId={shop.brandId} round size="xs" className="h-12 w-12 ring-1 ring-black/5" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-[15px] font-semibold text-on-surface">{shop.brand}</p>
              <p className="flex items-center gap-1 text-[12px] text-on-surface-variant">
                <XMark size={14} />
                {rate} = 1 Baht{shop.pointsBackPct ? ` · ${shop.pointsBackPct}% points back` : ''}
              </p>
            </div>
            <button type="button" onClick={() => setShop(null)} className="text-[12px] font-semibold text-primary">
              Change
            </button>
          </div>

          <label className="flex items-center justify-between rounded-2xl border border-outline-variant bg-white px-4 py-3">
            <span className="text-[13px] text-on-surface-variant">Amount</span>
            <span className="flex items-center gap-1 font-heading text-[22px] font-semibold text-on-surface">
              ฿
              <input type="number" value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))} className="w-28 bg-transparent text-right outline-none" aria-label="Amount in baht" />
            </span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setPayWith('points')} aria-pressed={payWith === 'points'} className={cn('flex flex-col rounded-2xl border-2 p-3 text-left', payWith === 'points' ? 'border-primary bg-primary-fixed' : 'border-outline-variant bg-white')}>
              <span className="flex items-center gap-1 text-[12px] font-bold text-on-surface">
                <XMark size={14} /> {cashTopUp ? 'Point+Money' : 'Pay with POINTX'}
              </span>
              <span className="mt-1 font-heading text-[18px] font-semibold text-primary">{formatPoints(pointsUsed)} pts{cashTopUp ? <span className="text-[13px] text-on-surface"> + ฿{cashTopUp.toLocaleString('en-US')}</span> : null}</span>
              <span className={cn('text-[10px]', back ? 'text-success' : 'text-on-surface-variant')}>{back ? `+${formatPoints(back)} points back` : `Balance after: ${formatPoints(points - pointsUsed)}`}</span>
            </button>
            <button type="button" onClick={() => setPayWith('money')} aria-pressed={payWith === 'money'} className={cn('flex flex-col rounded-2xl border-2 p-3 text-left', payWith === 'money' ? 'border-primary bg-primary-fixed' : 'border-outline-variant bg-white')}>
              <span className="flex items-center gap-1 text-[12px] font-bold text-on-surface">
                <Icon name="account_balance" className="text-[14px]" /> SCB EASY
              </span>
              <span className="mt-1 font-heading text-[18px] font-semibold text-on-surface">฿{amount.toLocaleString('en-US')}</span>
              <span className="text-[10px] text-on-surface-variant">Keeps your {formatPoints(points)} points</span>
            </button>
          </div>

          {nudge && (
            <p className="flex items-start gap-1.5 rounded-xl bg-accent-soft px-3 py-2 text-[11px] text-on-surface">
              <Icon name="auto_awesome" filled className="mt-px text-[13px] text-accent" />
              {nudge}
            </p>
          )}

          <button type="button" onClick={() => scanPay(shop, amount, payWith)} disabled={amount <= 0} className="mt-1 w-full rounded-xl bg-primary py-3 text-[14px] font-semibold text-white disabled:opacity-40">
            Confirm payment
          </button>
        </div>
      )}
    </Drawer>
  );
}
