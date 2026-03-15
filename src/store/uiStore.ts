/**
 * UI 状态管理 Store
 *
 * 使用 Zustand 管理客户端 UI 状态
 * 包括侧边栏、地图视图模式、选中的城市等
 */

import { create } from 'zustand';

/**
 * 地图视图模式
 */
export type MapViewMode = 'cities' | 'wishlist' | 'trips';

/**
 * UI 状态接口
 */
interface UIState {
  /** 侧边栏是否打开 */
  sidebarOpen: boolean;

  /** 当前地图视图模式 */
  mapView: MapViewMode;

  /** 当前选中的城市 ID */
  selectedCityId: string | null;

  /** 是否处于离线状态 */
  isOffline: boolean;

  /** 切换侧边栏开关状态 */
  toggleSidebar: () => void;

  /** 设置地图视图模式 */
  setMapView: (view: MapViewMode) => void;

  /** 选择城市 */
  selectCity: (id: string | null) => void;

  /** 设置离线状态 */
  setOfflineStatus: (isOffline: boolean) => void;
}

/**
 * UI 状态管理 Store
 *
 * @example
 * ```tsx
 * const { sidebarOpen, toggleSidebar } = useUIStore();
 * ```
 */
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mapView: 'cities',
  selectedCityId: null,
  isOffline: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setMapView: (view) => set({ mapView: view }),

  selectCity: (id) => set({ selectedCityId: id }),

  setOfflineStatus: (isOffline) => set({ isOffline }),
}));
