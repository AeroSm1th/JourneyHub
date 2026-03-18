/**
 * 应用主布局组件
 *
 * 提供应用的主要布局结构，包括导航侧边栏和主内容区域
 * 验证需求: 10.1, 10.2, 10.3 - 响应式布局
 */

import { Outlet, NavLink } from 'react-router-dom';
import { Map, MapPin, Heart, Plane, BarChart3, UserCircle, Menu } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import Sidebar from '@/components/Sidebar';
import User from '@/components/User';
import { usePrefetchCoreData } from '@/hooks/usePrefetch';
import './AppLayout.css';

/**
 * 应用主布局组件
 *
 * 布局结构：
 * - 侧边栏默认展开，可通过按钮切换
 * - 主内容区域自适应剩余空间
 */
export function AppLayout() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  // 布局挂载时预取核心数据，减少首次进入各页面的等待时间
  usePrefetchCoreData();

  return (
    <div className="app-layout">
      {/* 顶部导航栏 */}
      <header className="app-header">
        <div className="header-left">
          <button className="header-sidebar-toggle" onClick={toggleSidebar} aria-label="切换侧边栏">
            <Menu size={20} />
          </button>
          <h1 className="app-title">JourneyHub</h1>
        </div>
        <div className="header-right">
          <User />
        </div>
      </header>

      {/* 主内容区域 */}
      <div className="app-content">
        {/* 导航侧边栏 */}
        <Sidebar title="导航">
          <nav className="sidebar-nav" aria-label="主导航">
            <NavLink
              to="/app/map"
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              <Map size={20} />
              <span>地图</span>
            </NavLink>
            <NavLink
              to="/app/cities"
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              <MapPin size={20} />
              <span>我的足迹</span>
            </NavLink>
            <NavLink
              to="/app/wishlist"
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              <Heart size={20} />
              <span>愿望清单</span>
            </NavLink>
            <NavLink
              to="/app/trips"
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              <Plane size={20} />
              <span>行程</span>
            </NavLink>
            <NavLink
              to="/app/insights"
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              <BarChart3 size={20} />
              <span>统计</span>
            </NavLink>
            <NavLink
              to="/app/profile"
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              <UserCircle size={20} />
              <span>个人资料</span>
            </NavLink>
          </nav>
        </Sidebar>

        {/* 主内容 */}
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
