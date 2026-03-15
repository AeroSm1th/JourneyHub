/**
 * 应用主组件
 *
 * 配置全局 Provider 和路由
 */

import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './app/router';

// 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 分钟
      cacheTime: 10 * 60 * 1000, // 10 分钟
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * 应用主组件
 *
 * 认证状态通过 Zustand (useAuthStore) 管理
 * 数据获取通过 TanStack Query + Supabase 管理
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
