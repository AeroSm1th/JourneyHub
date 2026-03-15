/**
 * CityList 组件测试
 *
 * 测试城市列表组件的各种功能和状态
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CityList } from '../CityList';
import { useCities } from '@/features/cities/hooks/useCities';
import { City } from '@/types/database';

// Mock useCities hook
vi.mock('@/features/cities/hooks/useCities');

// 测试数据
const mockCities: City[] = [
  {
    id: '1',
    user_id: 'user-1',
    city_name: '北京',
    country_name: '中国',
    continent: 'Asia',
    latitude: 39.9042,
    longitude: 116.4074,
    visited_at: '2024-01-15',
    trip_type: 'leisure',
    rating: 5,
    notes: '很棒的城市',
    tags: ['历史', '文化', '美食'],
    cover_image: 'https://example.com/beijing.jpg',
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
    latitude: 31.2304,
    longitude: 121.4737,
    visited_at: '2024-01-10',
    trip_type: 'business',
    rating: 4,
    notes: '现代化大都市',
    tags: ['商业', '现代'],
    cover_image: undefined,
    is_favorite: false,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
  },
  {
    id: '3',
    user_id: 'user-1',
    city_name: '成都',
    country_name: '中国',
    continent: 'Asia',
    latitude: 30.5728,
    longitude: 104.0668,
    visited_at: '2024-01-20',
    trip_type: 'leisure',
    rating: 5,
    notes: '美食天堂',
    tags: ['美食', '休闲', '熊猫', '文化', '历史'],
    cover_image: 'https://example.com/chengdu.jpg',
    is_favorite: true,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
  },
];

// 创建测试用的 QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// 包装组件的辅助函数
const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('CityList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('加载状态', () => {
    it('应该显示加载动画', () => {
      vi.mocked(useCities).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      renderWithQueryClient(<CityList />);

      // 检查加载容器是否存在
      expect(
        screen.getByText((content, element) => {
          return element?.className === 'city-list-loading';
        })
      ).toBeInTheDocument();
    });
  });

  describe('错误状态', () => {
    it('应该显示错误信息', () => {
      const error = new Error('加载失败');
      vi.mocked(useCities).mockReturnValue({
        data: undefined,
        isLoading: false,
        error,
      } as any);

      renderWithQueryClient(<CityList />);

      expect(screen.getByText('加载城市列表失败')).toBeInTheDocument();
      expect(screen.getByText('加载失败')).toBeInTheDocument();
    });
  });

  describe('空状态', () => {
    it('应该显示空状态提示', () => {
      vi.mocked(useCities).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<CityList />);

      expect(screen.getByText('还没有城市记录')).toBeInTheDocument();
      expect(screen.getByText('在地图上点击添加你的第一个城市')).toBeInTheDocument();
    });
  });

  describe('城市列表显示', () => {
    beforeEach(() => {
      vi.mocked(useCities).mockReturnValue({
        data: mockCities,
        isLoading: false,
        error: null,
      } as any);
    });

    it('应该显示列表标题和城市数量', () => {
      renderWithQueryClient(<CityList />);

      expect(screen.getByText('我的足迹')).toBeInTheDocument();
      expect(screen.getByText('3 个城市')).toBeInTheDocument();
    });

    it('应该显示所有城市', () => {
      renderWithQueryClient(<CityList />);

      expect(screen.getByText('北京')).toBeInTheDocument();
      expect(screen.getByText('上海')).toBeInTheDocument();
      expect(screen.getByText('成都')).toBeInTheDocument();
    });

    it('应该显示城市的国家信息', () => {
      renderWithQueryClient(<CityList />);

      const countryElements = screen.getAllByText('中国');
      expect(countryElements).toHaveLength(3);
    });

    it('应该显示访问日期', () => {
      renderWithQueryClient(<CityList />);

      expect(screen.getByText(/2024年1月15日/)).toBeInTheDocument();
      expect(screen.getByText(/2024年1月10日/)).toBeInTheDocument();
      expect(screen.getByText(/2024年1月20日/)).toBeInTheDocument();
    });

    it('应该显示评分', () => {
      renderWithQueryClient(<CityList />);

      const ratingElements = screen.getAllByText(/⭐/);
      expect(ratingElements.length).toBeGreaterThan(0);
    });

    it('应该显示标签（最多3个）', () => {
      renderWithQueryClient(<CityList />);

      expect(screen.getByText('历史')).toBeInTheDocument();
      expect(screen.getByText('文化')).toBeInTheDocument();
      // 使用 getAllByText 因为"美食"标签出现在多个城市中
      const foodTags = screen.getAllByText('美食');
      expect(foodTags.length).toBeGreaterThan(0);
    });

    it('应该显示标签数量超出提示', () => {
      renderWithQueryClient(<CityList />);

      // 成都有5个标签，应该显示 +2
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('应该显示收藏标记', () => {
      renderWithQueryClient(<CityList />);

      const favoriteIcons = screen.getAllByTitle('收藏');
      expect(favoriteIcons).toHaveLength(2); // 北京和成都
    });

    it('应该显示封面图片', () => {
      renderWithQueryClient(<CityList />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2); // 北京和成都有图片
      // 因为按日期降序排序，成都(2024-01-20)在前，北京(2024-01-15)在后
      expect(images[0]).toHaveAttribute('src', 'https://example.com/chengdu.jpg');
      expect(images[0]).toHaveAttribute('alt', '成都');
      expect(images[1]).toHaveAttribute('src', 'https://example.com/beijing.jpg');
      expect(images[1]).toHaveAttribute('alt', '北京');
    });
  });

  describe('排序功能', () => {
    it('应该按访问日期降序排序（需求 3.6）', () => {
      vi.mocked(useCities).mockReturnValue({
        data: mockCities,
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<CityList />);

      const cityNames = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent);

      // 成都 (2024-01-20) > 北京 (2024-01-15) > 上海 (2024-01-10)
      expect(cityNames).toEqual(['成都', '北京', '上海']);
    });
  });

  describe('点击事件', () => {
    it('应该触发点击回调（需求 3.7）', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      vi.mocked(useCities).mockReturnValue({
        data: mockCities,
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<CityList onCityClick={handleClick} />);

      const beijingItem = screen.getByText('北京').closest('li');
      expect(beijingItem).toBeInTheDocument();

      await user.click(beijingItem!);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          city_name: '北京',
        })
      );
    });

    it('应该支持点击不同的城市', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      vi.mocked(useCities).mockReturnValue({
        data: mockCities,
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<CityList onCityClick={handleClick} />);

      // 点击北京
      await user.click(screen.getByText('北京').closest('li')!);
      expect(handleClick).toHaveBeenCalledWith(expect.objectContaining({ city_name: '北京' }));

      // 点击上海
      await user.click(screen.getByText('上海').closest('li')!);
      expect(handleClick).toHaveBeenCalledWith(expect.objectContaining({ city_name: '上海' }));

      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('选中状态', () => {
    it('应该高亮选中的城市', () => {
      vi.mocked(useCities).mockReturnValue({
        data: mockCities,
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<CityList selectedCityId="1" />);

      const beijingItem = screen.getByText('北京').closest('li');
      expect(beijingItem).toHaveClass('city-list-item-active');
    });

    it('未选中的城市不应该有高亮样式', () => {
      vi.mocked(useCities).mockReturnValue({
        data: mockCities,
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<CityList selectedCityId="1" />);

      const shanghaiItem = screen.getByText('上海').closest('li');
      expect(shanghaiItem).not.toHaveClass('city-list-item-active');
    });
  });

  describe('边界情况', () => {
    it('应该处理没有评分的城市', () => {
      const citiesWithoutRating: City[] = [
        {
          ...mockCities[0],
          rating: undefined,
        },
      ];

      vi.mocked(useCities).mockReturnValue({
        data: citiesWithoutRating,
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<CityList />);

      expect(screen.getByText('北京')).toBeInTheDocument();
      // 不应该显示评分
      expect(screen.queryByText(/⭐⭐⭐⭐⭐/)).not.toBeInTheDocument();
    });

    it('应该处理没有标签的城市', () => {
      const citiesWithoutTags: City[] = [
        {
          ...mockCities[0],
          tags: undefined,
        },
      ];

      vi.mocked(useCities).mockReturnValue({
        data: citiesWithoutTags,
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<CityList />);

      expect(screen.getByText('北京')).toBeInTheDocument();
      expect(screen.queryByText('历史')).not.toBeInTheDocument();
    });

    it('应该处理没有封面图的城市', () => {
      const citiesWithoutImage: City[] = [
        {
          ...mockCities[0],
          cover_image: undefined,
        },
      ];

      vi.mocked(useCities).mockReturnValue({
        data: citiesWithoutImage,
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<CityList />);

      expect(screen.getByText('北京')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('应该处理空标签数组', () => {
      const citiesWithEmptyTags: City[] = [
        {
          ...mockCities[0],
          tags: [],
        },
      ];

      vi.mocked(useCities).mockReturnValue({
        data: citiesWithEmptyTags,
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<CityList />);

      expect(screen.getByText('北京')).toBeInTheDocument();
      expect(screen.queryByText('历史')).not.toBeInTheDocument();
    });
  });

  describe('可访问性', () => {
    it('应该有正确的语义化标签', () => {
      vi.mocked(useCities).mockReturnValue({
        data: mockCities,
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<CityList />);

      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    });

    it('图片应该有 alt 属性', () => {
      vi.mocked(useCities).mockReturnValue({
        data: mockCities,
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<CityList />);

      const images = screen.getAllByRole('img');
      images.forEach((img) => {
        expect(img).toHaveAttribute('alt');
      });
    });
  });
});
