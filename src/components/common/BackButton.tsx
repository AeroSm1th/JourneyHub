/**
 * 统一返回按钮组件
 */

import { ArrowLeft } from 'lucide-react';
import './BackButton.css';

interface BackButtonProps {
  /** 按钮文字，默认"返回" */
  label?: string;
  /** 点击回调 */
  onClick: () => void;
  /** 无障碍标签 */
  ariaLabel?: string;
  /** 额外 className */
  className?: string;
}

export function BackButton({
  label = '返回',
  onClick,
  ariaLabel,
  className = '',
}: BackButtonProps) {
  return (
    <button
      className={`back-button ${className}`.trim()}
      onClick={onClick}
      aria-label={ariaLabel ?? label}
    >
      <ArrowLeft size={16} />
      <span>{label}</span>
    </button>
  );
}
