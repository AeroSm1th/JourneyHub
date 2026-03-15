/**
 * 应用路由配置
 *
 * 配置 React Router，设置嵌套路由结构
 * 验证需求: 1.5 - 路由守卫和受保护路由
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/pages/ProtectedRoute';
import { AppLayout } from '@/app/layouts/AppLayout';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import Homepage from '@/pages/Homepage';
import { MapPage } from '@/pages/map/MapPage';
import CitiesPage from '@/pages/cities/CitiesPage';
import CityDetailPage from '@/pages/cities/CityDetailPage';

/**
 * 应用路由配置
 *
 * 路由结构：
 * - / - 首页
 * - /auth - 认证布局
 *   - /auth/login - 登录页面
 *   - /auth/register - 注册页面
 * - /app - 应用主布局（受保护）
 *   - /app/map - 地图页面（待实现）
 *   - /app/cities - 城市列表页面（待实现）
 *   - /app/wishlist - 愿望清单页面（待实现）
 *   - /app/trips - 行程列表页面（待实现）
 *   - /app/insights - 统计仪表板（待实现）
 *   - /app/profile - 个人资料页面（待实现）
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Homepage />,
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/auth/login" replace />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/map" replace />,
      },
      {
        path: 'map',
        element: <MapPage />,
      },
      {
        path: 'cities',
        element: <CitiesPage />,
      },
      {
        path: 'cities/:cityId',
        element: <CityDetailPage />,
      },
      {
        path: 'wishlist',
        element: <div>愿望清单页面（待实现）</div>,
      },
      {
        path: 'trips',
        element: <div>行程列表页面（待实现）</div>,
      },
      {
        path: 'trips/:tripId',
        element: <div>行程详情页面（待实现）</div>,
      },
      {
        path: 'trips/new',
        element: <div>创建行程页面（待实现）</div>,
      },
      {
        path: 'insights',
        element: <div>统计仪表板（待实现）</div>,
      },
      {
        path: 'profile',
        element: <div>个人资料页面（待实现）</div>,
      },
    ],
  },
  {
    path: '/share/:slug',
    element: <div>公开分享页面（待实现）</div>,
  },
  {
    path: '*',
    element: <div>404 - 页面未找到</div>,
  },
]);
