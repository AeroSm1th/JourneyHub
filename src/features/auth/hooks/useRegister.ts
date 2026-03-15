/**
 * 注册 Mutation Hook
 *
 * 提供用户注册功能，使用 TanStack Query 管理注册状态
 * 验证需求: 1.1 - 提供邮箱密码注册功能
 */

import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../api';
import type { RegisterInput } from '@/schemas/authSchema';

/**
 * 注册选项
 */
interface UseRegisterOptions {
  /**
   * 注册成功后的回调
   */
  onSuccess?: () => void;

  /**
   * 注册失败后的回调
   */
  onError?: (error: Error) => void;

  /**
   * 注册成功后的重定向路径
   * 默认为 '/auth/login'
   */
  redirectTo?: string;

  /**
   * 是否自动登录
   * 默认为 false，注册成功后跳转到登录页
   */
  autoLogin?: boolean;
}

/**
 * 注册 Mutation Hook
 *
 * 功能：
 * - 执行用户注册操作
 * - 注册成功后自动重定向
 * - 提供加载状态和错误信息
 * - 支持自动登录选项
 *
 * @param options - 注册选项
 * @returns Mutation 对象
 *
 * @example
 * ```tsx
 * function RegisterForm() {
 *   const { mutate: register, isPending, error } = useRegister({
 *     onSuccess: () => {
 *       toast.success('注册成功！请登录');
 *     },
 *     onError: (error) => {
 *       toast.error(error.message);
 *     },
 *   });
 *
 *   const handleSubmit = (data: RegisterInput) => {
 *     register(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="email" type="email" />
 *       <input name="password" type="password" />
 *       <input name="confirmPassword" type="password" />
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? '注册中...' : '注册'}
 *       </button>
 *       {error && <p className="error">{error.message}</p>}
 *     </form>
 *   );
 * }
 * ```
 */
export function useRegister(options?: UseRegisterOptions) {
  const navigate = useNavigate();

  return useMutation({
    /**
     * 执行注册操作
     */
    mutationFn: async (credentials: RegisterInput) => {
      // 注意：RegisterInput 包含 confirmPassword，但 API 只需要 email 和 password
      const user = await signUp(credentials.email, credentials.password);
      return user;
    },

    /**
     * 注册成功处理
     */
    onSuccess: (user) => {
      console.log('注册成功:', user.email);

      // 执行用户自定义的成功回调
      options?.onSuccess?.();

      // 根据配置决定重定向路径
      if (options?.autoLogin) {
        // 如果启用自动登录，Supabase 会自动登录用户
        // 重定向到应用主页
        const redirectPath = options?.redirectTo || '/app';
        navigate(redirectPath);
      } else {
        // 默认重定向到登录页
        const redirectPath = options?.redirectTo || '/auth/login';
        navigate(redirectPath);
      }
    },

    /**
     * 注册失败处理
     */
    onError: (error: Error) => {
      console.error('注册失败:', error);

      // 执行用户自定义的错误回调
      options?.onError?.(error);
    },
  });
}
