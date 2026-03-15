/**
 * 应用主布局组件
 *
 * 提供应用的主要布局结构，包括侧边栏和主内容区域
 * 验证需求: 10.1, 10.2, 10.3 - 响应式布局
 */

import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import User from '@/components/User';
import './AppLayout.css';

/**
 * 应用主布局组件
 *
 * 布局结构：
 * - 桌面端（≥1024px）：固定侧边栏 + 主内容区域
 * - 平板端（768px-1023px）：可折叠侧边栏 + 主内容区域
 * - 移动端（<768px）：全屏主内容 + 可折叠侧边栏（覆盖层）
 *
 * @example
 * ```tsx
 * <Route path="/app" element={<AppLayout />}>
 *   <Route path="map" element={<MapPage />} />
 *   <Route path="cities" element={<CitiesPage />} />
 * </Route>
 * ```
 */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="app-layout">
      {/* 顶部导航栏 */}
      <header className="app-header">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="切换侧边栏">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1 className="app-title">JourneyHub</h1>
        </div>
        <div className="header-right">
          <User />
        </div>
      </header>

      {/* 主内容区域 */}
      <div className="app-content">
        {/* 侧边栏 */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* 主内容 */}
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <Outlet />
        </main>
      </div>

      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div className="sidebar-overlay md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
