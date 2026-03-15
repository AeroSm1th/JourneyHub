/**
 * 认证页面布局组件
 *
 * 为登录和注册页面提供简洁的居中布局
 */

import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

/**
 * 认证布局组件
 *
 * 特点：
 * - 简洁的居中布局
 * - 响应式设计
 * - 品牌展示区域
 *
 * @example
 * ```tsx
 * <Route path="/auth" element={<AuthLayout />}>
 *   <Route path="login" element={<LoginPage />} />
 *   <Route path="register" element={<RegisterPage />} />
 * </Route>
 * ```
 */
export function AuthLayout() {
  return (
    <div className="auth-layout">
      {/* 左侧品牌展示区域（仅桌面端显示） */}
      <div className="auth-brand">
        <div className="brand-content">
          <h1 className="brand-title">JourneyHub</h1>
          <p className="brand-subtitle">记录你的旅行足迹，规划未来的冒险</p>
          <div className="brand-features">
            <div className="feature-item">
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
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>在地图上标记你的足迹</span>
            </div>
            <div className="feature-item">
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
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>规划你的旅行行程</span>
            </div>
            <div className="feature-item">
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
                <path d="M3 3v18h18"></path>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
              </svg>
              <span>查看你的旅行统计</span>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧表单区域 */}
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
