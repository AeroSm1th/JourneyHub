import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../Sidebar.tsx';
import { useUIStore } from '@/store/uiStore';

// Mock UI Store
vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

const mockToggleSidebar = vi.fn();

describe('Sidebar', () => {
  describe('渲染测试', () => {
    it('应该渲染侧边栏标题', () => {
      vi.mocked(useUIStore).mockReturnValue({
        sidebarOpen: true,
        toggleSidebar: mockToggleSidebar,
        mapView: 'cities',
        selectedCityId: null,
        isOffline: false,
        setMapView: vi.fn(),
        selectCity: vi.fn(),
        setOfflineStatus: vi.fn(),
      });

      render(
        <Sidebar title="测试标题">
          <div>测试内容</div>
        </Sidebar>
      );

      expect(screen.getByText('测试标题')).toBeInTheDocument();
    });

    it('应该使用默认标题', () => {
      vi.mocked(useUIStore).mockReturnValue({
        sidebarOpen: true,
        toggleSidebar: mockToggleSidebar,
        mapView: 'cities',
        selectedCityId: null,
        isOffline: false,
        setMapView: vi.fn(),
        selectCity: vi.fn(),
        setOfflineStatus: vi.fn(),
      });

      render(
        <Sidebar>
          <div>测试内容</div>
        </Sidebar>
      );

      expect(screen.getByText('我的足迹')).toBeInTheDocument();
    });

    it('应该渲染子内容（当侧边栏打开时）', () => {
      vi.mocked(useUIStore).mockReturnValue({
        sidebarOpen: true,
        toggleSidebar: mockToggleSidebar,
        mapView: 'cities',
        selectedCityId: null,
        isOffline: false,
        setMapView: vi.fn(),
        selectCity: vi.fn(),
        setOfflineStatus: vi.fn(),
      });

      render(
        <Sidebar>
          <div data-testid="sidebar-content">测试内容</div>
        </Sidebar>
      );

      expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
    });

    it('不应该渲染子内容（当侧边栏关闭时）', () => {
      vi.mocked(useUIStore).mockReturnValue({
        sidebarOpen: false,
        toggleSidebar: mockToggleSidebar,
        mapView: 'cities',
        selectedCityId: null,
        isOffline: false,
        setMapView: vi.fn(),
        selectCity: vi.fn(),
        setOfflineStatus: vi.fn(),
      });

      render(
        <Sidebar>
          <div data-testid="sidebar-content">测试内容</div>
        </Sidebar>
      );

      expect(screen.queryByTestId('sidebar-content')).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击切换按钮应该调用 toggleSidebar', () => {
      vi.mocked(useUIStore).mockReturnValue({
        sidebarOpen: true,
        toggleSidebar: mockToggleSidebar,
        mapView: 'cities',
        selectedCityId: null,
        isOffline: false,
        setMapView: vi.fn(),
        selectCity: vi.fn(),
        setOfflineStatus: vi.fn(),
      });

      render(
        <Sidebar>
          <div>测试内容</div>
        </Sidebar>
      );

      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);

      expect(mockToggleSidebar).toHaveBeenCalled();
    });
  });

  describe('样式测试', () => {
    it('应该应用打开状态的类名', () => {
      vi.mocked(useUIStore).mockReturnValue({
        sidebarOpen: true,
        toggleSidebar: mockToggleSidebar,
        mapView: 'cities',
        selectedCityId: null,
        isOffline: false,
        setMapView: vi.fn(),
        selectCity: vi.fn(),
        setOfflineStatus: vi.fn(),
      });

      const { container } = render(
        <Sidebar>
          <div>测试内容</div>
        </Sidebar>
      );

      const sidebar = container.querySelector('.sidebar');
      expect(sidebar).toHaveClass('sidebar-open');
    });
  });

  describe('无障碍测试', () => {
    it('切换按钮应该有 aria-expanded 属性', () => {
      vi.mocked(useUIStore).mockReturnValue({
        sidebarOpen: true,
        toggleSidebar: mockToggleSidebar,
        mapView: 'cities',
        selectedCityId: null,
        isOffline: false,
        setMapView: vi.fn(),
        selectCity: vi.fn(),
        setOfflineStatus: vi.fn(),
      });

      render(
        <Sidebar>
          <div>测试内容</div>
        </Sidebar>
      );

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
