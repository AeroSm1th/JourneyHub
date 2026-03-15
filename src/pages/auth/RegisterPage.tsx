/**
 * 注册页面
 *
 * 功能：
 * - 使用 React Hook Form + Zod 进行表单验证
 * - 实现邮箱密码注册
 * - 验证邮箱格式和密码强度（至少 8 个字符）
 * - 验证密码确认匹配
 * - 显示验证错误消息
 * - 注册成功后重定向到登录页
 *
 * 验证需求: 1.1, 1.3
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { registerSchema, type RegisterInput } from '@/schemas/authSchema';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { useAuth } from '@/features/auth/hooks/useAuth';
import Button from '@/components/Button';
import PageNav from '@/components/PageNav';
import styles from '../Login.module.css';

/**
 * 注册页面组件
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // 使用 React Hook Form + Zod 验证
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // 注册 mutation
  const { mutate: signUp, isPending, error: registerError } = useRegister();

  // 如果已登录，重定向到应用主页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  /**
   * 表单提交处理
   */
  const onSubmit = (data: RegisterInput) => {
    signUp(data);
  };

  // 是否正在处理（表单提交或注册中）
  const isLoading = isSubmitting || isPending;

  return (
    <main className={styles.login}>
      <PageNav />

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h2>注册 JourneyHub 账户</h2>

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

        {/* 确认密码输入 */}
        <div className={styles.row}>
          <label htmlFor="confirmPassword">确认密码</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="再次输入密码"
            disabled={isLoading}
            {...register('confirmPassword')}
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          />
          {errors.confirmPassword && (
            <span id="confirmPassword-error" className={styles.error} role="alert">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* 注册错误提示 */}
        {registerError && (
          <div className={styles.errorBox} role="alert">
            <p>注册失败：{registerError.message}</p>
          </div>
        )}

        {/* 提交按钮 */}
        <div>
          <Button type="primary" disabled={isLoading}>
            {isLoading ? '注册中...' : '注册'}
          </Button>
        </div>

        {/* 登录链接 */}
        <div className={styles.footer}>
          <p>
            已有账户？{' '}
            <Link to="/auth/login" className={styles.link}>
              立即登录
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}
