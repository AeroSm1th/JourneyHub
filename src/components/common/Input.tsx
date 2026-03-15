/**
 * 通用输入框组件
 *
 * 提供一致的输入框样式和验证反馈
 * 验证需求: 10.4 - 确保触摸屏可操作
 */

import { InputHTMLAttributes, forwardRef } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * 输入框标签
   */
  label?: string;

  /**
   * 错误消息
   */
  error?: string;

  /**
   * 是否必填
   */
  required?: boolean;
}

/**
 * 通用输入框组件
 *
 * @example
 * ```tsx
 * <Input
 *   label="邮箱"
 *   type="email"
 *   error={errors.email?.message}
 *   {...register('email')}
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, className = '', ...props }, ref) => {
    const inputClasses = ['input', error && 'input-error', className].filter(Boolean).join(' ');

    return (
      <div className="input-wrapper">
        {label && (
          <label className="input-label">
            {label}
            {required && <span className="input-required">*</span>}
          </label>
        )}
        <input ref={ref} className={inputClasses} {...props} />
        {error && <p className="input-error-message">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
