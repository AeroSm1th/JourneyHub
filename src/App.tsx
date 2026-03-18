/**
 * 应用主组件
 *
 * 配置全局 Provider、路由和全局错误处理
 * 集成 authErrorHandler（认证错误自动登出）和 dbErrorHandler（数据库错误精确映射）
 *
 * 验证需求: 9.6, 9.7 - 全局错误处理与日志记录
 */

import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { router } from './app/router';
import { captureError, isAuthError } from '@/utils/errorLogger';
import { handleAuthError } from '@/utils/authErrorHandler';
import { handleDbError, isDbError, mapDbError } from '@/utils/dbErrorHandler';
import { toast } from '@/store/toastStore';
import { ToastContainer } from '@/components/common/Toast';

/**
 * 获取用户友好的错误消息
 *
 * 优先使用 dbErrorHandler 的精确错误码映射，
 * 网络错误单独处理，其余返回空字符串由调用方提供兜底消息。
 */
function getUserFriendlyMessage(error: unknown): string {
  // 网络错误
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return '网络连接失败，请检查网络后重试';
  }

  // 数据库错误：使用 dbErrorHandler 的精确映射
  if (isDbError(error)) {
    return mapDbError(error).userMessage;
  }

  return '';
}

// 创建 QueryClient 实例，配置全局错误处理
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // 记录查询错误日志
      captureError('query', error, {
        queryKey: query.queryKey,
      });

      // 认证错误：触发自动登出流程
      if (isAuthError(error)) {
        handleAuthError(error, { source: 'query', queryKey: query.queryKey });
        return;
      }

      // 数据库错误：使用精确错误码映射显示 toast
      if (isDbError(error)) {
        // 后台刷新失败（有缓存数据）：仅记录日志不打扰用户
        if (query.state.data !== undefined) return;
        handleDbError(error, { source: 'query', queryKey: query.queryKey });
        return;
      }

      // 后台刷新失败（有缓存数据）：仅记录日志不打扰用户
      if (query.state.data !== undefined) return;

      // 其他错误：显示 Toast 通知 + 手动重试按钮
      const friendlyMsg = getUserFriendlyMessage(error) || '数据加载失败，请稍后重试';
      toast.error(friendlyMsg, {
        onRetry: () => query.fetch(),
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // 记录变更错误日志
      captureError('mutation', error, {
        mutationKey: mutation.options.mutationKey,
      });

      // 认证错误：触发自动登出流程
      if (isAuthError(error)) {
        handleAuthError(error, { source: 'mutation', mutationKey: mutation.options.mutationKey });
        return;
      }

      // 数据库错误：使用精确错误码映射显示 toast
      if (isDbError(error)) {
        handleDbError(error, { source: 'mutation', mutationKey: mutation.options.mutationKey });
        return;
      }

      // 其他错误
      const friendlyMsg = getUserFriendlyMessage(error) || '操作失败，请重试';
      toast.error(friendlyMsg);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 分钟
      cacheTime: 10 * 60 * 1000,  // 10 分钟
      retry: (failureCount, error) => {
        // 认证错误和数据库约束错误不重试
        if (isAuthError(error)) return false;
        if (isDbError(error)) return false;
        // 网络错误和服务端错误最多重试 3 次（指数退避）
        return failureCount < 3;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        // 认证错误和数据库约束错误不重试
        if (isAuthError(error)) return false;
        if (isDbError(error)) return false;
        // mutation 网络错误最多重试 3 次
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          return failureCount < 3;
        }
        return false;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    },
  },
});

/**
 * 应用主组件
 *
 * 认证状态通过 Zustand (useAuthStore) 管理
 * 数据获取通过 TanStack Query + Supabase 管理
 * 全局错误通过 QueryCache/MutationCache + authErrorHandler + dbErrorHandler 统一处理
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer />
    </QueryClientProvider>
  );
}

export default App;
