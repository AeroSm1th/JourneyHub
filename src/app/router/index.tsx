/**
 * 应用路由配置
 *
 * 配置 React Router，设置嵌套路由结构
 * 验证需求: 1.5 - 路由守卫和受保护路由
 * 验证需求: 11.1 - 路由级代码分割（React.lazy + Suspense）
 */

import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/pages/ProtectedRoute';
import { AppLayout } from '@/app/layouts/AppLayout';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { PageLoader } from '@/components/common';

// 懒加载页面组件 - 每个路由生成独立的 chunk
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const Homepage = lazy(() => import('@/pages/Homepage'));
const MapPage = lazy(() => import('@/pages/map/MapPage').then((m) => ({ default: m.MapPage })));
const WishlistPage = lazy(() => import('@/pages/wishlist/WishlistPage'));
const CitiesPage = lazy(() => import('@/pages/cities/CitiesPage'));
const CityDetailPage = lazy(() => import('@/pages/cities/CityDetailPage'));
const TripDetailPage = lazy(() => import('@/pages/trips/TripDetailPage'));
const TripPlannerPage = lazy(() => import('@/pages/trips/TripPlannerPage'));
const TripsPage = lazy(() => import('@/pages/trips/TripsPage'));
const InsightsPage = lazy(() => import('@/pages/insights/InsightsPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));

/**
 * 应用路由配置
 *
 * 路由结构：
 * - / - 首页
 * - /auth - 认证布局
 *   - /auth/login - 登录页面
 *   - /auth/register - 注册页面
 * - /app - 应用主布局（受保护）
 *   - /app/map - 地图页面
 *   - /app/cities - 城市列表页面
 *   - /app/wishlist - 愿望清单页面
 *   - /app/trips - 行程列表页面
 *   - /app/insights - 统计仪表板
 *   - /app/profile - 个人资料页面
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Homepage />
      </Suspense>
    ),
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
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: 'register',
        element: (
          <Suspense fallback={<PageLoader />}>
            <RegisterPage />
          </Suspense>
        ),
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
        element: (
          <Suspense fallback={<PageLoader />}>
            <MapPage />
          </Suspense>
        ),
      },
      {
        path: 'cities',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CitiesPage />
          </Suspense>
        ),
      },
      {
        path: 'cities/:cityId',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CityDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'wishlist',
        element: (
          <Suspense fallback={<PageLoader />}>
            <WishlistPage />
          </Suspense>
        ),
      },
      {
        path: 'trips',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TripsPage />
          </Suspense>
        ),
      },
      {
        path: 'trips/:tripId',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TripDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'trips/new',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TripPlannerPage />
          </Suspense>
        ),
      },
      {
        path: 'trips/:tripId/edit',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TripPlannerPage />
          </Suspense>
        ),
      },
      {
        path: 'insights',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InsightsPage />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        ),
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
