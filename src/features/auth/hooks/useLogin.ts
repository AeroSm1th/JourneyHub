/**
 * 登录 Mutation Hook
 *
 * 提供用户登录功能，使用 TanStack Query 管理登录状态
 * 验证需求: 1.2 - 提供邮箱密码登录功能
 */

import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../api';
import { useAuthStore } from '@/store/authStore';
import type { LoginInput } from '@/schemas/authSchema';

/**
 * 登录选项
 */
interface UseLoginOptions {
  /**
   * 登录成功后的回调
   */
  onSuccess?: () => void;

  /**
   * 登录失败后的回调
   */
  onError?: (error: Error) => void;

  /**
   * 登录成功后的重定向路径
   * 默认为 '/app'
   */
  redirectTo?: string;
}

/**
 * 登录 Mutation Hook
 *
 * 功能：
 * - 执行用户登录操作
 * - 自动更新认证状态
 * - 登录成功后自动重定向
 * - 提供加载状态和错误信息
 *
 * @param options - 登录选项
 * @returns Mutation 对象
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { mutate: login, isPending, error } = useLogin({
 *     onSuccess: () => {
 *       toast.success('登录成功！');
 *     },
 *     onError: (error) => {
 *       toast.error(error.message);
 *     },
 *   });
 *
 *   const handleSubmit = (data: LoginInput) => {
 *     login(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="email" type="email" />
 *       <input name="password" type="password" />
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? '登录中...' : '登录'}
 *       </button>
 *       {error && <p className="error">{error.message}</p>}
 *     </form>
 *   );
 * }
 * ```
 */
export function useLogin(options?: UseLoginOptions) {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation({
    /**
     * 执行登录操作
     */
    mutationFn: async (credentials: LoginInput) => {
      const user = await signIn(credentials.email, credentials.password);
      return user;
    },

    /**
     * 登录成功处理
     */
    onSuccess: (user) => {
      // 注意：认证状态会通过 useAuth 中的 onAuthStateChange 自动更新
      // 这里不需要手动调用 setAuth

      // 执行用户自定义的成功回调
      options?.onSuccess?.();

      // 重定向到指定页面
      const redirectPath = options?.redirectTo || '/app';
      navigate(redirectPath);
    },

    /**
     * 登录失败处理
     */
    onError: (error: Error) => {
      console.error('登录失败:', error);

      // 执行用户自定义的错误回调
      options?.onError?.(error);
    },
  });
}
