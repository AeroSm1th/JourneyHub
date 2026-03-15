/**
 * 通用按钮组件
 *
 * 提供一致的按钮样式和交互
 * 验证需求: 10.4 - 确保触摸屏可操作
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 按钮变体
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';

  /**
   * 按钮大小
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * 是否为加载状态
   */
  loading?: boolean;

  /**
   * 按钮内容
   */
  children: ReactNode;
}

/**
 * 通用按钮组件
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   提交
 * </Button>
 * ```
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const classes = ['btn', `btn-${variant}`, `btn-${size}`, loading && 'btn-loading', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <span className="btn-spinner">
          <svg
            className="animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
      )}
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
    </button>
  );
}
