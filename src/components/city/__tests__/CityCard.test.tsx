/**
 * CityCard 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CityCard } from '../CityCard';
import { City } from '@/types/database';

// 测试数据
const mockCity: City = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: 'user-123',
  city_name: '北京',
  country_name: '中国',
  continent: 'Asia',
  latitude: 39.9042,
  longitude: 116.4074,
  visited_at: '2024-03-15',
  trip_type: 'leisure',
  rating: 5,
  notes: '故宫、长城、天安门广场',
  tags: ['历史', '文化', '美食', '购物'],
  cover_image: 'https://example.com/beijing.jpg',
  is_favorite: true,
  created_at: '2024-03-15T10:00:00Z',
  updated_at: '2024-03-15T10:00:00Z',
};

const mockCityWithoutImage: City = {
  ...mockCity,
  id: '223e4567-e89b-12d3-a456-426614174001',
  city_name: '上海',
  cover_image: undefined,
  is_favorite: false,
  rating: undefined,
  tags: undefined,
};

describe('CityCard', () => {
  describe('渲染', () => {
    it('应该渲染城市名称和国家', () => {
      render(<CityCard city={mockCity} />);

      expect(screen.getByText('北京')).toBeInTheDocument();
      expect(screen.getByText('中国')).toBeInTheDocument();
    });

    it('应该渲染访问日期', () => {
      render(<CityCard city={mockCity} />);

      // 检查日期元素存在
      const dateElement = screen.getByText(/2024/);
      expect(dateElement).toBeInTheDocument();
      expect(dateElement.tagName).toBe('TIME');
    });

    it('应该渲染封面图', () => {
      render(<CityCard city={mockCity} />);

      const image = screen.getByAltText('北京');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/beijing.jpg');
      expect(image).toHaveAttribute('loading', 'lazy');
    });

    it('应该在没有封面图时显示占位符', () => {
      render(<CityCard city={mockCityWithoutImage} />);

      // 检查占位符 SVG 存在
      const placeholder = screen.getByRole('button').querySelector('.city-card-image-placeholder');
      expect(placeholder).toBeInTheDocument();
    });

    it('应该渲染评分', () => {
      render(<CityCard city={mockCity} />);

      const ratingElement = screen.getByLabelText('评分 5 星');
      expect(ratingElement).toBeInTheDocument();

      // 检查星星数量
      const stars = ratingElement.querySelectorAll('.city-card-star');
      expect(stars).toHaveLength(5);

      // 检查填充的星星数量
      const filledStars = ratingElement.querySelectorAll('.city-card-star-filled');
      expect(filledStars).toHaveLength(5);
    });

    it('应该在没有评分时不显示评分', () => {
      render(<CityCard city={mockCityWithoutImage} />);

      expect(screen.queryByLabelText(/评分/)).not.toBeInTheDocument();
    });

    it('应该渲染标签（最多3个）', () => {
      render(<CityCard city={mockCity} />);

      expect(screen.getByText('历史')).toBeInTheDocument();
      expect(screen.getByText('文化')).toBeInTheDocument();
      expect(screen.getByText('美食')).toBeInTheDocument();
      expect(screen.getByText('+1')).toBeInTheDocument(); // 第4个标签显示为 +1
    });

    it('应该在没有标签时不显示标签区域', () => {
      render(<CityCard city={mockCityWithoutImage} />);

      expect(screen.queryByText('历史')).not.toBeInTheDocument();
    });

    it('应该在收藏时显示收藏标记', () => {
      render(<CityCard city={mockCity} />);

      const favoriteBadge = screen.getByTitle('收藏');
      expect(favoriteBadge).toBeInTheDocument();
    });

    it('应该在未收藏时不显示收藏标记', () => {
      render(<CityCard city={mockCityWithoutImage} />);

      expect(screen.queryByTitle('收藏')).not.toBeInTheDocument();
    });
  });

  describe('交互', () => {
    it('应该在点击时调用 onClick 回调', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<CityCard city={mockCity} onClick={handleClick} />);

      const card = screen.getByRole('button', { name: '北京, 中国' });
      await user.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(mockCity);
    });

    it('应该支持键盘导航（Enter）', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<CityCard city={mockCity} onClick={handleClick} />);

      const card = screen.getByRole('button', { name: '北京, 中国' });
      card.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(mockCity);
    });

    it('应该支持键盘导航（Space）', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<CityCard city={mockCity} onClick={handleClick} />);

      const card = screen.getByRole('button', { name: '北京, 中国' });
      card.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(mockCity);
    });

    it('应该在没有 onClick 时不报错', async () => {
      const user = userEvent.setup();

      render(<CityCard city={mockCity} />);

      const card = screen.getByRole('button', { name: '北京, 中国' });
      await user.click(card);

      // 不应该抛出错误
      expect(card).toBeInTheDocument();
    });
  });

  describe('选中状态', () => {
    it('应该在选中时应用选中样式', () => {
      render(<CityCard city={mockCity} isSelected={true} />);

      const card = screen.getByRole('button', { name: '北京, 中国' });
      expect(card).toHaveClass('city-card-selected');
    });

    it('应该在未选中时不应用选中样式', () => {
      render(<CityCard city={mockCity} isSelected={false} />);

      const card = screen.getByRole('button', { name: '北京, 中国' });
      expect(card).not.toHaveClass('city-card-selected');
    });

    it('应该默认为未选中状态', () => {
      render(<CityCard city={mockCity} />);

      const card = screen.getByRole('button', { name: '北京, 中国' });
      expect(card).not.toHaveClass('city-card-selected');
    });
  });

  describe('无障碍', () => {
    it('应该有正确的 ARIA 标签', () => {
      render(<CityCard city={mockCity} />);

      const card = screen.getByRole('button', { name: '北京, 中国' });
      expect(card).toBeInTheDocument();
    });

    it('应该可以通过 Tab 键聚焦', () => {
      render(<CityCard city={mockCity} />);

      const card = screen.getByRole('button', { name: '北京, 中国' });
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('应该为日期元素设置 datetime 属性', () => {
      render(<CityCard city={mockCity} />);

      const dateElement = screen.getByText(/2024/).closest('time');
      expect(dateElement).toHaveAttribute('datetime', '2024-03-15');
    });
  });

  describe('边界情况', () => {
    it('应该处理空标签数组', () => {
      const cityWithEmptyTags: City = {
        ...mockCity,
        tags: [],
      };

      render(<CityCard city={cityWithEmptyTags} />);

      expect(screen.queryByText('历史')).not.toBeInTheDocument();
    });

    it('应该处理只有1个标签的情况', () => {
      const cityWithOneTag: City = {
        ...mockCity,
        tags: ['历史'],
      };

      render(<CityCard city={cityWithOneTag} />);

      expect(screen.getByText('历史')).toBeInTheDocument();
      expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
    });

    it('应该处理评分为0的情况', () => {
      const cityWithZeroRating: City = {
        ...mockCity,
        rating: 0,
      };

      render(<CityCard city={cityWithZeroRating} />);

      // rating 为 0 时应该显示评分区域
      const ratingElement = screen.getByLabelText('评分 0 星');
      expect(ratingElement).toBeInTheDocument();

      // 所有星星都应该是未填充状态
      const filledStars = ratingElement.querySelectorAll('.city-card-star-filled');
      expect(filledStars).toHaveLength(0);
    });

    it('应该处理长城市名称', () => {
      const cityWithLongName: City = {
        ...mockCity,
        city_name: '这是一个非常非常非常长的城市名称用于测试文本溢出',
      };

      render(<CityCard city={cityWithLongName} />);

      expect(
        screen.getByText('这是一个非常非常非常长的城市名称用于测试文本溢出')
      ).toBeInTheDocument();
    });
  });
});
