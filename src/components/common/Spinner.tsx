/**
 * 通用加载动画组件
 *
 * 提供一致的加载状态指示
 */

import './Spinner.css';

interface SpinnerProps {
  /**
   * 加载动画大小
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * 是否居中显示
   */
  centered?: boolean;
}

/**
 * 通用加载动画组件
 *
 * @example
 * ```tsx
 * <Spinner size="md" centered />
 * ```
 */
export function Spinner({ size = 'md', centered = false }: SpinnerProps) {
  const containerClass = centered ? 'spinner-container-centered' : 'spinner-container';

  return (
    <div className={containerClass}>
      <div className={`spinner spinner-${size}`}></div>
    </div>
  );
}
