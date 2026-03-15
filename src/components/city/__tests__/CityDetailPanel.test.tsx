/**
 * CityDetailPanel 组件测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CityDetailPanel } from '../CityDetailPanel';
import { City } from '@/types/database';

// 模拟 API
vi.mock('@/features/cities/api', () => ({
  citiesApi: {
    delete: vi.fn(),
  },
}));

// 创建测试用的 QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

// 测试包装器
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

// 模拟城市数据
const mockCity: City = {
  id: '123',
  user_id: 'user-123',
  city_name: '北京',
  country_name: '中国',
  continent: 'Asia',
  latitude: 39.9042,
  longitude: 116.4074,
  visited_at: '2024-03-15',
  trip_type: 'leisure',
  rating: 5,
  notes: '这是一次难忘的旅行',
  tags: ['历史', '文化'],
  cover_image: 'https://example.com/image.jpg',
  is_favorite: true,
  created_at: '2024-03-15T10:00:00Z',
  updated_at: '2024-03-15T10:00:00Z',
};

describe('CityDetailPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染', () => {
    it('应该渲染城市基本信息', () => {
      render(<CityDetailPanel city={mockCity} />, { wrapper });

      expect(screen.getByText('北京')).toBeInTheDocument();
      expect(screen.getByText('中国')).toBeInTheDocument();
      expect(screen.getByText('Asia')).toBeInTheDocument();
    });

    it('应该渲染封面图', () => {
      render(<CityDetailPanel city={mockCity} />, { wrapper });

      const image = screen.getByAltText('北京');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', mockCity.cover_image);
    });

    it('应该渲染评分', () => {
      render(<CityDetailPanel city={mockCity} />, { wrapper });

      expect(screen.getByText('5 / 5')).toBeInTheDocument();
    });

    it('应该渲染标签', () => {
      render(<CityDetailPanel city={mockCity} />, { wrapper });

      expect(screen.getByText('历史')).toBeInTheDocument();
      expect(screen.getByText('文化')).toBeInTheDocument();
    });

    it('应该渲染备注', () => {
      render(<CityDetailPanel city={mockCity} />, { wrapper });

      expect(screen.getByText('这是一次难忘的旅行')).toBeInTheDocument();
    });

    it('应该显示收藏标记', () => {
      render(<CityDetailPanel city={mockCity} />, { wrapper });

      const favoriteIcons = screen.getAllByTitle('收藏');
      expect(favoriteIcons.length).toBeGreaterThan(0);
    });
  });

  describe('可选内容', () => {
    it('无封面图时不应该渲染图片', () => {
      const cityWithoutImage = { ...mockCity, cover_image: undefined };
      render(<CityDetailPanel city={cityWithoutImage} />, { wrapper });

      expect(screen.queryByAltText('北京')).not.toBeInTheDocument();
    });

    it('无评分时不应该渲染评分区域', () => {
      const cityWithoutRating = { ...mockCity, rating: undefined };
      render(<CityDetailPanel city={cityWithoutRating} />, { wrapper });

      expect(screen.queryByText(/\/ 5/)).not.toBeInTheDocument();
    });

    it('无标签时不应该渲染标签区域', () => {
      const cityWithoutTags = { ...mockCity, tags: undefined };
      render(<CityDetailPanel city={cityWithoutTags} />, { wrapper });

      expect(screen.queryByText('历史')).not.toBeInTheDocument();
    });

    it('无备注时不应该渲染备注区域', () => {
      const cityWithoutNotes = { ...mockCity, notes: undefined };
      render(<CityDetailPanel city={cityWithoutNotes} />, { wrapper });

      expect(screen.queryByText('这是一次难忘的旅行')).not.toBeInTheDocument();
    });

    it('非收藏城市不应该显示收藏标记', () => {
      const cityNotFavorite = { ...mockCity, is_favorite: false };
      render(<CityDetailPanel city={cityNotFavorite} />, { wrapper });

      expect(screen.queryByTitle('收藏')).not.toBeInTheDocument();
    });
  });

  describe('交互', () => {
    it('点击编辑按钮应该调用 onEdit 回调', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      render(<CityDetailPanel city={mockCity} onEdit={onEdit} />, { wrapper });

      const editButton = screen.getByRole('button', { name: '编辑' });
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledWith(mockCity);
    });

    it('点击关闭按钮应该调用 onClose 回调', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<CityDetailPanel city={mockCity} onClose={onClose} />, { wrapper });

      const closeButton = screen.getByLabelText('关闭');
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('没有 onClose 回调时不应该显示关闭按钮', () => {
      render(<CityDetailPanel city={mockCity} />, { wrapper });

      expect(screen.queryByLabelText('关闭')).not.toBeInTheDocument();
    });
  });

  describe('删除功能', () => {
    it('点击删除按钮应该显示确认对话框', async () => {
      const user = userEvent.setup();

      render(<CityDetailPanel city={mockCity} />, { wrapper });

      const deleteButton = screen.getByRole('button', { name: '删除' });
      await user.click(deleteButton);

      expect(screen.getByRole('heading', { name: '确认删除' })).toBeInTheDocument();
      expect(screen.getByText(/确定要删除城市记录/)).toBeInTheDocument();
      expect(screen.getByText('北京', { selector: 'strong' })).toBeInTheDocument();
    });

    it('在确认对话框中点击取消应该关闭对话框', async () => {
      const user = userEvent.setup();

      render(<CityDetailPanel city={mockCity} />, { wrapper });

      // 打开对话框
      const deleteButton = screen.getByRole('button', { name: '删除' });
      await user.click(deleteButton);

      // 点击取消
      const cancelButton = screen.getByRole('button', { name: '取消' });
      await user.click(cancelButton);

      // 对话框应该关闭
      await waitFor(() => {
        expect(screen.queryByText('确认删除')).not.toBeInTheDocument();
      });
    });
  });

  describe('格式化', () => {
    it('应该正确格式化日期', () => {
      render(<CityDetailPanel city={mockCity} />, { wrapper });

      // 中文日期格式 - 使用 getAllByText 因为有多个日期
      const dates = screen.getAllByText(/2024年3月15日/);
      expect(dates.length).toBeGreaterThan(0);
    });

    it('应该正确格式化旅行类型', () => {
      render(<CityDetailPanel city={mockCity} />, { wrapper });

      expect(screen.getByText('休闲旅行')).toBeInTheDocument();
    });

    it('应该正确格式化坐标', () => {
      render(<CityDetailPanel city={mockCity} />, { wrapper });

      expect(screen.getByText(/39\.904200, 116\.407400/)).toBeInTheDocument();
    });
  });
});
