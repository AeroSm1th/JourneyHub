/**
 * 注册页面
 *
 * 在 AuthLayout 内渲染，只包含表单部分
 * 验证需求: 1.1, 1.3
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { registerSchema, type RegisterInput } from '@/schemas/authSchema';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { useAuth } from '@/features/auth/hooks/useAuth';
import './RegisterPage.css';

/**
 * 注册页面组件
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { mutate: signUp, isPending, error: registerError } = useRegister();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data: RegisterInput) => {
    signUp(data);
  };

  const isLoading = isSubmitting || isPending;

  return (
    <div className="register-page">
      <h2 className="register-title">注册 JourneyHub 账户</h2>

      <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
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

        {/* 确认密码 */}
        <div className="form-group">
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
            <span id="confirmPassword-error" className="form-error" role="alert">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* 注册错误 */}
        {registerError && (
          <div className="form-error-box" role="alert">
            <p>注册失败：{registerError.message}</p>
          </div>
        )}

        {/* 提交 */}
        <button type="submit" className="register-btn" disabled={isLoading || !isValid}>
          {isLoading ? '注册中...' : '注册'}
        </button>

        {/* 登录链接 */}
        <p className="register-footer">
          已有账户？{' '}
          <Link to="/auth/login" className="register-link">
            立即登录
          </Link>
        </p>
      </form>
    </div>
  );
}
