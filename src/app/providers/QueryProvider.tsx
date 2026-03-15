/**
 * TanStack Query Provider 配置
 *
 * 配置全局的 QueryClient，管理服务器状态缓存和同步
 * 验证需求: 11.2 - 使用 TanStack Query 缓存服务器数据
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * 创建 QueryClient 实例
 *
 * 配置：
 * - staleTime: 5 分钟 - 数据在 5 分钟内被认为是新鲜的
 * - cacheTime: 10 分钟 - 未使用的数据在 10 分钟后被垃圾回收
 * - retry: 1 - 失败后重试 1 次
 * - refetchOnWindowFocus: false - 窗口聚焦时不自动重新获取
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 数据在 5 分钟内被认为是新鲜的，不会重新获取
        staleTime: 5 * 60 * 1000,

        // 未使用的数据在 10 分钟后被垃圾回收
        gcTime: 10 * 60 * 1000,

        // 失败后重试 1 次
        retry: 1,

        // 窗口聚焦时不自动重新获取
        refetchOnWindowFocus: false,

        // 网络重连时重新获取
        refetchOnReconnect: true,
      },
      mutations: {
        // Mutation 失败后不重试
        retry: 0,

        // Mutation 错误处理
        onError: (error) => {
          console.error('Mutation 错误:', error);
        },
      },
    },
  });
}

/**
 * Query Provider 组件
 *
 * 提供 TanStack Query 的上下文，管理所有服务器状态
 *
 * @example
 * ```tsx
 * <QueryProvider>
 *   <App />
 * </QueryProvider>
 * ```
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // 使用 useState 确保 QueryClient 只创建一次
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 开发环境下显示 React Query Devtools */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
