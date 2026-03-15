/**
 * 愿望清单列表组件测试
 *
 * 测试列表渲染、排序、空状态、加载状态、错误状态、点击回调
 * 验证需求: 4.1, 4.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WishlistList } from '../WishlistList';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { useConvertToCity } from '@/features/wishlist/hooks/useConvertToCity';
import type { WishlistItem } from '@/types/database';

// Mock hooks
vi.mock('@/features/wishlist/hooks/useWishlist');
vi.mock('@/features/wishlist/hooks/useConvertToCity');

// ============================================================================
// 测试数据
// ============================================================================

const mockItems: WishlistItem[] = [
  {
    id: 'w1',
    user_id: 'user-1',
    city_name: '巴黎',
    country_name: '法国',
    continent: 'Europe',
    latitude: 48.8566,
    longitude: 2.3522,
    priority: 5,
    expected_season: 'spring',
    notes: '浪漫之都',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'w2',
    user_id: 'user-1',
    city_name: '东京',
    country_name: '日本',
    continent: 'Asia',
    latitude: 35.6762,
    longitude: 139.6503,
    priority: 3,
    expected_season: 'autumn',
    notes: undefined,
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 'w3',
    user_id: 'user-1',
    city_name: '悉尼',
    country_name: '澳大利亚',
    continent: 'Oceania',
    latitude: -33.8688,
    longitude: 151.2093,
    priority: 4,
    expected_season: 'summer',
    notes: '歌剧院',
    created_at: '2024-01-03T00:00:00Z',
  },
];

// ============================================================================
// 辅助函数
// ============================================================================

/** useConvertToCity 的默认 mock 返回值 */
const defaultConvertMock = {
  isConverting: false,
  convertingItem: null,
  prefilledData: null,
  startConvert: vi.fn(),
  cancelConvert: vi.fn(),
  submitConvert: vi.fn(),
  isSubmitting: false,
  error: null,
};

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

/** 渲染愿望清单列表 */
function renderWishlistList(props: Record<string, any> = {}) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <WishlistList {...props} />
    </QueryClientProvider>,
  );
}

// ============================================================================
// 测试
// ============================================================================

describe('愿望清单列表组件测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useConvertToCity).mockReturnValue(defaultConvertMock);
  });

  // --------------------------------------------------------------------------
  // 加载状态
  // --------------------------------------------------------------------------
  describe('加载状态', () => {
    it('应显示加载动画', () => {
      vi.mocked(useWishlist).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      renderWishlistList();

      // Spinner 渲染在 .wishlist-list-loading 容器中
      const loadingContainer = document.querySelector('.wishlist-list-loading');
      expect(loadingContainer).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // 错误状态
  // --------------------------------------------------------------------------
  describe('错误状态', () => {
    it('应显示错误信息', () => {
      vi.mocked(useWishlist).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('网络连接失败'),
      } as any);

      renderWishlistList();

      expect(screen.getByText('加载愿望清单失败')).toBeInTheDocument();
      expect(screen.getByText('网络连接失败')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // 空状态
  // --------------------------------------------------------------------------
  describe('空状态', () => {
    it('data 为空数组时应显示空状态提示', () => {
      vi.mocked(useWishlist).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      renderWishlistList();

      expect(screen.getByText('还没有愿望清单')).toBeInTheDocument();
      expect(screen.getByText('在地图上点击添加你想去的城市')).toBeInTheDocument();
    });

    it('data 为 undefined 时应显示空状态提示', () => {
      vi.mocked(useWishlist).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);

      renderWishlistList();

      expect(screen.getByText('还没有愿望清单')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // 列表渲染
  // --------------------------------------------------------------------------
  describe('列表渲染', () => {
    beforeEach(() => {
      vi.mocked(useWishlist).mockReturnValue({
        data: mockItems,
        isLoading: false,
        error: null,
      } as any);
    });

    it('应显示标题和项目数量', () => {
      renderWishlistList();

      expect(screen.getByText('愿望清单')).toBeInTheDocument();
      expect(screen.getByText('3 个目的地')).toBeInTheDocument();
    });

    it('应显示所有愿望清单项目', () => {
      renderWishlistList();

      expect(screen.getByText('巴黎')).toBeInTheDocument();
      expect(screen.getByText('东京')).toBeInTheDocument();
      expect(screen.getByText('悉尼')).toBeInTheDocument();
    });

    it('应按优先级降序排序（高优先级在前）', () => {
      renderWishlistList();

      // 获取所有城市标题
      const headings = screen.getAllByRole('heading', { level: 3 });
      const names = headings.map((h) => h.textContent);

      // 巴黎(5) > 悉尼(4) > 东京(3)
      expect(names).toEqual(['巴黎', '悉尼', '东京']);
    });

    it('应显示国家信息', () => {
      renderWishlistList();

      expect(screen.getByText('法国')).toBeInTheDocument();
      expect(screen.getByText('日本')).toBeInTheDocument();
      expect(screen.getByText('澳大利亚')).toBeInTheDocument();
    });

    it('应使用列表语义化标签', () => {
      renderWishlistList();

      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });
  });

  // --------------------------------------------------------------------------
  // 点击事件
  // --------------------------------------------------------------------------
  describe('点击事件', () => {
    beforeEach(() => {
      vi.mocked(useWishlist).mockReturnValue({
        data: mockItems,
        isLoading: false,
        error: null,
      } as any);
    });

    it('点击项目应触发 onItemClick 回调', async () => {
      const user = userEvent.setup();
      const onItemClick = vi.fn();

      renderWishlistList({ onItemClick });

      // WishlistCard 使用 role="button"，通过 aria-label 定位
      const parisCard = screen.getByLabelText('巴黎, 法国');
      await user.click(parisCard);

      expect(onItemClick).toHaveBeenCalledTimes(1);
      expect(onItemClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'w1', city_name: '巴黎' }),
      );
    });
  });

  // --------------------------------------------------------------------------
  // 选中状态
  // --------------------------------------------------------------------------
  describe('选中状态', () => {
    beforeEach(() => {
      vi.mocked(useWishlist).mockReturnValue({
        data: mockItems,
        isLoading: false,
        error: null,
      } as any);
    });

    it('应高亮选中的项目', () => {
      renderWishlistList({ selectedItemId: 'w1' });

      const parisCard = screen.getByLabelText('巴黎, 法国');
      expect(parisCard).toHaveClass('wishlist-card--selected');
    });

    it('未选中的项目不应有高亮样式', () => {
      renderWishlistList({ selectedItemId: 'w1' });

      const tokyoCard = screen.getByLabelText('东京, 日本');
      expect(tokyoCard).not.toHaveClass('wishlist-card--selected');
    });
  });

  // --------------------------------------------------------------------------
  // 转换功能
  // --------------------------------------------------------------------------
  describe('转换为城市记录', () => {
    beforeEach(() => {
      vi.mocked(useWishlist).mockReturnValue({
        data: mockItems,
        isLoading: false,
        error: null,
      } as any);
    });

    it('每个卡片应显示转换按钮', () => {
      renderWishlistList();

      const convertButtons = screen.getAllByRole('button', { name: /转换为城市记录/ });
      expect(convertButtons).toHaveLength(3);
    });

    it('点击转换按钮应调用 startConvert', async () => {
      const user = userEvent.setup();
      const startConvert = vi.fn();
      vi.mocked(useConvertToCity).mockReturnValue({
        ...defaultConvertMock,
        startConvert,
      });

      renderWishlistList();

      // 点击巴黎的转换按钮
      const convertButtons = screen.getAllByRole('button', { name: /转换为城市记录/ });
      await user.click(convertButtons[0]); // 巴黎排在第一位（优先级最高）

      expect(startConvert).toHaveBeenCalledTimes(1);
    });
  });
});
