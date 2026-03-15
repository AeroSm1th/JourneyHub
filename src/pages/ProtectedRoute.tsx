/**
 * 路由守卫组件
 *
 * 保护需要认证的路由，未登录用户将被重定向到登录页面
 * 验证需求: 1.5 - 未认证用户重定向到登录页面
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import SpinnerFullPage from '@/components/SpinnerFullPage';

interface ProtectedRouteProps {
  /**
   * 需要保护的子组件
   */
  children: React.ReactNode;
}

/**
 * 路由守卫组件
 *
 * 功能：
 * - 检查用户是否已登录
 * - 未登录用户重定向到登录页面
 * - 保存原始访问路径，登录后可返回
 * - 显示加载状态
 *
 * @example
 * ```tsx
 * // 在路由配置中使用
 * <Route
 *   path="/app"
 *   element={
 *     <ProtectedRoute>
 *       <AppLayout />
 *     </ProtectedRoute>
 *   }
 * />
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // 显示加载状态
  if (isLoading) {
    return <SpinnerFullPage />;
  }

  // 未登录用户重定向到登录页面
  // 使用 state 保存原始访问路径，登录成功后可以返回
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 已登录用户，渲染受保护的内容
  return <>{children}</>;
};
