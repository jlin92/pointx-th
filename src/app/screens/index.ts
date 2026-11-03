import type { ComponentType } from 'react';
import { HomeScreen } from './HomeScreen';
import { ShopsScreen } from './ShopsScreen';
import { XStoreScreen } from './XStoreScreen';
import { DetailScreen } from './DetailScreen';
import { CouponsScreen } from './CouponsScreen';
import { MissionsScreen } from './MissionsScreen';
import { MyPointXScreen } from './MyPointXScreen';
import { TravelScreen } from './TravelScreen';
import { MuseScreen } from './MuseScreen';

/** Chapter id → screen component. */
export const screenByChapter: Record<number, ComponentType> = {
  1: HomeScreen,
  2: ShopsScreen,
  3: XStoreScreen,
  4: DetailScreen,
  5: CouponsScreen,
  6: MissionsScreen,
  7: MyPointXScreen,
  8: TravelScreen,
  9: MuseScreen,
};
