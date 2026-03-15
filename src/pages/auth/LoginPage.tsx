/**
 * 登录页面
 *
 * 功能：
 * - 使用 React Hook Form + Zod 进行表单验证
 * - 实现邮箱密码登录
 * - 显示验证错误消息
 * - 登录成功后自动重定向
 *
 * 验证需求: 1.2, 1.3
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { loginSchema, type LoginInput } from '@/schemas/authSchema';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useAuth } from '@/features/auth/hooks/useAuth';
import Button from '@/components/Button';
import PageNav from '@/components/PageNav';
import styles from '../Login.module.css';

/**
 * 登录页面组件
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // 使用 React Hook Form + Zod 验证
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 登录 mutation
  const { mutate: login, isPending, error: loginError } = useLogin();

  // 如果已登录，重定向到应用主页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  /**
   * 表单提交处理
   */
  const onSubmit = (data: LoginInput) => {
    login(data);
  };

  // 是否正在处理（表单提交或登录中）
  const isLoading = isSubmitting || isPending;

  return (
    <main className={styles.login}>
      <PageNav />

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h2>登录到 JourneyHub</h2>

        {/* 邮箱输入 */}
        <div className={styles.row}>
          <label htmlFor="email">邮箱地址</label>
          <input
            type="email"
            id="email"
            placeholder="your@email.com"
            disabled={isLoading}
            {...register('email')}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <span id="email-error" className={styles.error} role="alert">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* 密码输入 */}
        <div className={styles.row}>
          <label htmlFor="password">密码</label>
          <input
            type="password"
            id="password"
            placeholder="至少 8 个字符"
            disabled={isLoading}
            {...register('password')}
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <span id="password-error" className={styles.error} role="alert">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* 登录错误提示 */}
        {loginError && (
          <div className={styles.errorBox} role="alert">
            <p>登录失败：{loginError.message}</p>
          </div>
        )}

        {/* 提交按钮 */}
        <div>
          <Button type="primary" disabled={isLoading}>
            {isLoading ? '登录中...' : '登录'}
          </Button>
        </div>

        {/* 注册链接 */}
        <div className={styles.footer}>
          <p>
            还没有账户？{' '}
            <Link to="/auth/register" className={styles.link}>
              立即注册
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}
