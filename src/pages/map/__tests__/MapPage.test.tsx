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
import * as mapStateHooks from '@/hooks/useMapState';
import { City } from '@/types/database';

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

// Mock UI Store
vi.mock('@/store/uiStore', () => ({
  useUIStore: () => ({
    sidebarOpen: true,
    selectedCityId: null,
    mapView: 'cities',
    isOffline: false,
    toggleSidebar: vi.fn(),
    setMapView: vi.fn(),
    selectCity: vi.fn(),
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
    // Mock useCities hook
    vi.spyOn(citiesHooks, 'useCities').mockReturnValue({
      data: mockCities,
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
});
