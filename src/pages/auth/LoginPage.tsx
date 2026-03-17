/**
 * 登录页面
 *
 * 在 AuthLayout 内渲染，只包含表单部分
 * 验证需求: 1.2, 1.3
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { loginSchema, type LoginInput } from '@/schemas/authSchema';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useAuth } from '@/features/auth/hooks/useAuth';
import './LoginPage.css';

/**
 * 登录页面组件
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate: login, isPending, error: loginError } = useLogin();

  // 已登录则跳转
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data: LoginInput) => {
    login(data);
  };

  const isLoading = isSubmitting || isPending;

  return (
    <div className="login-page">
      <h2 className="login-title">登录到 JourneyHub</h2>

      <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
        {/* 邮箱 */}
        <div className="form-group">
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
            <span id="email-error" className="form-error" role="alert">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* 密码 */}
        <div className="form-group">
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
            <span id="password-error" className="form-error" role="alert">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* 登录错误 */}
        {loginError && (
          <div className="form-error-box" role="alert">
            <p>登录失败：{loginError.message}</p>
          </div>
        )}

        {/* 提交 */}
        <button type="submit" className="login-btn" disabled={isLoading || !isValid}>
          {isLoading ? '登录中...' : '登录'}
        </button>

        {/* 注册链接 */}
        <p className="login-footer">
          还没有账户？{' '}
          <Link to="/auth/register" className="login-link">
            立即注册
          </Link>
        </p>
      </form>
    </div>
  );
}
