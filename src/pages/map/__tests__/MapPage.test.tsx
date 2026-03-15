/**
 * MapPage 组件测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MapPage } from '../MapPage';
import * as citiesHooks from '@/features/cities/hooks/useCities';
import * as wishlistHooks from '@/features/wishlist/hooks/useWishlist';
import * as mapStateHooks from '@/hooks/useMapState';
import { City, WishlistItem } from '@/types/database';

// Mock Leaflet 组件
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => <div data-testid="popup">{children}</div>,
  useMap: () => ({
    on: vi.fn(),
    off: vi.fn(),
    setView: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
  }),
}));

// Mock Lucide 图标
vi.mock('lucide-react', () => ({
  Menu: () => <span>Menu</span>,
  X: () => <span>X</span>,
  Plus: () => <span>Plus</span>,
  Locate: () => <span>Locate</span>,
  ZoomIn: () => <span>ZoomIn</span>,
  ZoomOut: () => <span>ZoomOut</span>,
  Maximize2: () => <span>Maximize2</span>,
  MapPin: () => <span>MapPin</span>,
  Star: () => <span>Star</span>,
  Pencil: () => <span>Pencil</span>,
  Trash2: () => <span>Trash2</span>,
}));

// Mock 地理定位 hook
vi.mock('@/hooks/useGeolocation', () => ({
  useGeolocation: () => ({
    isLoading: false,
    position: null,
    error: null,
    getPosition: vi.fn(),
  }),
}));

// Mock UI Store - 使用可配置的 mock
const mockSetMapView = vi.fn();
const mockToggleSidebar = vi.fn();
const mockSelectCity = vi.fn();

let mockMapView = 'cities';

vi.mock('@/store/uiStore', () => ({
  useUIStore: () => ({
    sidebarOpen: true,
    selectedCityId: null,
    mapView: mockMapView,
    isOffline: false,
    toggleSidebar: mockToggleSidebar,
    setMapView: mockSetMapView,
    selectCity: mockSelectCity,
    setOfflineStatus: vi.fn(),
  }),
}));

// Mock Auth Store
vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'user-1', email: 'test@example.com' },
    session: null,
    setAuth: vi.fn(),
    clearAuth: vi.fn(),
  }),
}));

// Mock useCreateCity hook
vi.mock('@/features/cities/hooks/useCreateCity', () => ({
  useCreateCity: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

// Mock reverseGeocode
vi.mock('@/services/geocoding/nominatim', () => ({
  reverseGeocode: vi.fn().mockResolvedValue({
    cityName: '测试城市',
    countryName: '测试国家',
    continent: 'Asia',
    latitude: 39.9,
    longitude: 116.4,
  }),
}));

// 创建测试用的城市数据
const mockCities: City[] = [
  {
    id: '1',
    user_id: 'user-1',
    city_name: '北京',
    country_name: '中国',
    continent: 'Asia',
    latitude: 39.9,
    longitude: 116.4,
    visited_at: '2024-01-15',
    trip_type: 'leisure',
    rating: 5,
    notes: '很棒的城市',
    tags: ['文化', '历史'],
    cover_image: null,
    is_favorite: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    user_id: 'user-1',
    city_name: '上海',
    country_name: '中国',
    continent: 'Asia',
    latitude: 31.2,
    longitude: 121.5,
    visited_at: '2024-02-20',
    trip_type: 'business',
    rating: 4,
    notes: '现代化大都市',
    tags: ['商业', '美食'],
    cover_image: null,
    is_favorite: false,
    created_at: '2024-02-20T00:00:00Z',
    updated_at: '2024-02-20T00:00:00Z',
  },
];

// 创建测试用的愿望清单数据
const mockWishlistItems: WishlistItem[] = [
  {
    id: 'w1',
    user_id: 'user-1',
    city_name: '东京',
    country_name: '日本',
    continent: 'Asia',
    latitude: 35.6762,
    longitude: 139.6503,
    priority: 5,
    expected_season: 'spring',
    notes: '想去看樱花',
    created_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'w2',
    user_id: 'user-1',
    city_name: '巴黎',
    country_name: '法国',
    continent: 'Europe',
    latitude: 48.8566,
    longitude: 2.3522,
    priority: 4,
    expected_season: 'summer',
    notes: '浪漫之都',
    created_at: '2024-03-02T00:00:00Z',
  },
];

// 测试辅助函数
function renderMapPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MapPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe('MapPage', () => {
  beforeEach(() => {
    // 重置 mapView 为默认值
    mockMapView = 'cities';

    // Mock useCities hook
    vi.spyOn(citiesHooks, 'useCities').mockReturnValue({
      data: mockCities,
      isLoading: false,
      error: null,
    } as any);

    // Mock useWishlist hook
    vi.spyOn(wishlistHooks, 'useWishlist').mockReturnValue({
      data: mockWishlistItems,
      isLoading: false,
      error: null,
    } as any);

    // Mock useMapState hook
    vi.spyOn(mapStateHooks, 'useMapState').mockReturnValue({
      mapState: { lat: 39.9, lng: 116.4, zoom: 6 },
      setMapView: vi.fn(),
      setMapViewImmediate: vi.fn(),
    });
  });

  it('应该渲染地图容器', () => {
    renderMapPage();
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('应该渲染侧边栏标题', () => {
    renderMapPage();
    // 使用 getByRole 更精确地查找 h1 标题
    expect(screen.getByRole('heading', { level: 1, name: '我的足迹' })).toBeInTheDocument();
  });

  it('应该渲染城市列表', () => {
    renderMapPage();
    // 侧边栏默认打开，应该能看到城市列表
    // 使用 getAllByText 因为城市名称会在列表和地图标记中都出现
    const beijingElements = screen.getAllByText('北京');
    const shanghaiElements = screen.getAllByText('上海');

    expect(beijingElements.length).toBeGreaterThan(0);
    expect(shanghaiElements.length).toBeGreaterThan(0);
  });

  it('应该渲染所有城市标记', () => {
    renderMapPage();
    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(mockCities.length);
  });

  it('应该支持切换侧边栏', async () => {
    const user = userEvent.setup();
    renderMapPage();

    // 找到切换按钮
    const toggleButton = screen.getAllByRole('button', { name: /侧边栏/ })[0];

    // 点击切换
    await user.click(toggleButton);

    // 验证侧边栏状态变化
    // 注意：这里需要根据实际的 DOM 结构来验证
  });

  it('加载状态时侧边栏应该显示加载状态', () => {
    vi.spyOn(citiesHooks, 'useCities').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    renderMapPage();
    // 侧边栏打开时，CityList 组件会显示加载状态
    // 检查 spinner 容器类名
    const spinnerContainer = document.querySelector(
      '.spinner-container, .spinner-container-centered'
    );
    expect(spinnerContainer).toBeTruthy();
  });

  it('错误状态时侧边栏应该显示错误消息', () => {
    const errorMessage = '加载失败';
    vi.spyOn(citiesHooks, 'useCities').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error(errorMessage),
    } as any);

    renderMapPage();
    // CityList 组件会显示错误消息
    expect(screen.getByText('加载城市列表失败')).toBeInTheDocument();
  });

  it('空数据时侧边栏应该显示空状态提示', () => {
    vi.spyOn(citiesHooks, 'useCities').mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    renderMapPage();
    // CityList 组件会显示空状态
    expect(screen.getByText('还没有城市记录')).toBeInTheDocument();
  });

  // ========== 视图切换与愿望清单标记测试 ==========

  it('cities 视图下应该只渲染城市标记', () => {
    mockMapView = 'cities';
    renderMapPage();
    const markers = screen.getAllByTestId('marker');
    // 只有城市标记（2 个城市）
    expect(markers).toHaveLength(mockCities.length);
  });

  it('wishlist 视图下应该只渲染愿望清单标记', () => {
    mockMapView = 'wishlist';
    renderMapPage();
    const markers = screen.getAllByTestId('marker');
    // 只有愿望清单标记（2 个愿望清单项目）
    expect(markers).toHaveLength(mockWishlistItems.length);
  });

  it('trips 视图下应该同时渲染城市和愿望清单标记', () => {
    mockMapView = 'trips';
    renderMapPage();
    const markers = screen.getAllByTestId('marker');
    // 城市标记 + 愿望清单标记
    expect(markers).toHaveLength(mockCities.length + mockWishlistItems.length);
  });

  it('列表模式下应该显示视图切换标签', () => {
    renderMapPage();
    // 应该有城市和愿望清单两个标签
    expect(screen.getByRole('tab', { name: '城市' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '愿望清单' })).toBeInTheDocument();
  });

  it('cities 视图下城市标签应该处于激活状态', () => {
    mockMapView = 'cities';
    renderMapPage();
    const cityTab = screen.getByRole('tab', { name: '城市' });
    expect(cityTab).toHaveAttribute('aria-selected', 'true');
  });

  it('wishlist 视图下应该显示愿望清单标题', () => {
    mockMapView = 'wishlist';
    renderMapPage();
    expect(screen.getByRole('heading', { level: 1, name: '愿望清单' })).toBeInTheDocument();
  });

  it('wishlist 视图下愿望清单标签应该处于激活状态', () => {
    mockMapView = 'wishlist';
    renderMapPage();
    const wishlistTab = screen.getByRole('tab', { name: '愿望清单' });
    expect(wishlistTab).toHaveAttribute('aria-selected', 'true');
  });

  it('点击愿望清单标签应该调用 setMapView', async () => {
    const user = userEvent.setup();
    renderMapPage();
    const wishlistTab = screen.getByRole('tab', { name: '愿望清单' });
    await user.click(wishlistTab);
    expect(mockSetMapView).toHaveBeenCalledWith('wishlist');
  });
});
