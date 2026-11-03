import type { Chapter } from '@/types';

/**
 * Customer-facing screens of the POINTX app built out for this demo. Home,
 * Shops, X Store and My POINTX map to the live app's bottom tabs; the others
 * are reached from within those tabs or the quick actions.
 */
export const chapters: Chapter[] = [
  { id: 1, key: 'home', title: 'Home', copy: 'Personalised home: quick actions, hero banner, shelves, Trending Now, missions, transfers.', icon: 'home' },
  { id: 2, key: 'shops', title: 'Shops', copy: 'Scan & pay merchants with points back, sorted by DY.', icon: 'storefront' },
  { id: 3, key: 'xstore', title: 'X Store', copy: 'Smart search and category pages with DY sorting.', icon: 'shopping_bag' },
  { id: 4, key: 'detail', title: 'Item', copy: 'Item detail, Point+Money split, eligibility and next-best actions.', icon: 'inventory_2' },
  { id: 5, key: 'coupons', title: 'My Coupon', copy: 'Redeemed e-Coupons ready to use.', icon: 'confirmation_number' },
  { id: 6, key: 'missions', title: 'Missions', copy: 'Gamified missions to earn bonus points.', icon: 'emoji_events' },
  { id: 7, key: 'mypointx', title: 'My POINTX', copy: 'Balance, history, partner points transfer and benefits.', icon: 'close' },
  { id: 8, key: 'travel', title: 'XTravel', copy: 'Hotels and airline miles with points.', icon: 'flight_takeoff' },
  { id: 9, key: 'muse', title: 'Assistant', copy: 'POINTX assistant, powered by Shopping Muse.', icon: 'auto_awesome' },
];

export const chapterById = (id: number): Chapter => chapters.find((c) => c.id === id) ?? chapters[0];

export const chapterIdByKey = (key: Chapter['key']): number => chapters.find((c) => c.key === key)?.id ?? 1;

export const totalChapters = chapters.length;
