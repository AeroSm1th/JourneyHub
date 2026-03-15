/**
 * 应用主组件
 *
 * 配置全局 Provider 和路由
 */

import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './app/router';
import { CitiesProvider } from './contexts/CitiesContext';
import { AuthProvider } from './contexts/FakeAuthContext';

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
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CitiesProvider>
          <RouterProvider router={router} />
        </CitiesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
