/**
 * 应用路由配置
 *
 * 使用 React Router v6 配置应用的路由结构
 * 包含公开路由、认证路由和受保护路由
 */

import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import SpinnerFullPage from '@/components/SpinnerFullPage';

// 懒加载页面组件
const Homepage = lazy(() => import('@/pages/Homepage'));
const Product = lazy(() => import('@/pages/Product'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const AppLayout = lazy(() => import('@/pages/AppLayout'));
const PageNotFound = lazy(() => import('@/pages/PageNotFound'));
const ProtectedRoute = lazy(() => import('@/pages/ProtectedRoute'));

// 城市相关组件
const CityList = lazy(() => import('@/components/CityList'));
const CountryList = lazy(() => import('@/components/CountryList'));
const City = lazy(() => import('@/components/City'));
const Form = lazy(() => import('@/components/Form'));

/**
 * Suspense 包装组件
 * 为懒加载组件提供加载状态
 */
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<SpinnerFullPage />}>{children}</Suspense>
);

/**
 * 应用路由配置
 */
export const router = createBrowserRouter([
  // 首页
  {
    path: '/',
    element: (
      <SuspenseWrapper>
        <Homepage />
      </SuspenseWrapper>
    ),
  },

  // 产品和定价页面
  {
    path: '/product',
    element: (
      <SuspenseWrapper>
        <Product />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/pricing',
    element: (
      <SuspenseWrapper>
        <Pricing />
      </SuspenseWrapper>
    ),
  },

  // 认证路由
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: (
          <SuspenseWrapper>
            <LoginPage />
          </SuspenseWrapper>
        ),
      },
      // 注册页面（待实现）
      // {
      //   path: 'register',
      //   element: (
      //     <SuspenseWrapper>
      //       <RegisterPage />
      //     </SuspenseWrapper>
      //   ),
      // },
    ],
  },

  // 兼容旧路由
  {
    path: '/login',
    element: <Navigate to="/auth/login" replace />,
  },

  // 应用主路由（受保护）
  {
    path: '/app',
    element: (
      <SuspenseWrapper>
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      </SuspenseWrapper>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="cities" replace />,
      },
      {
        path: 'cities',
        element: (
          <SuspenseWrapper>
            <CityList />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'cities/:id',
        element: (
          <SuspenseWrapper>
            <City />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'countries',
        element: (
          <SuspenseWrapper>
            <CountryList />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'form',
        element: (
          <SuspenseWrapper>
            <Form />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // 404 页面
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <PageNotFound />
      </SuspenseWrapper>
    ),
  },
]);
