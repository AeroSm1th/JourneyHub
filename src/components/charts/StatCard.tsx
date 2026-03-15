/**
 * 统计卡片组件
 *
 * 可复用的数字统计展示卡片，支持图标、标签、数值和副标题
 *
 * 验证需求: 6.1, 6.2, 6.7
 */

import type { ReactNode } from 'react';
import './StatCard.css';

export interface StatCardProps {
  /** 图标（emoji 字符串或 ReactNode） */
  icon: string | ReactNode;
  /** 标签文本 */
  label: string;
  /** 显示的数值 */
  value: string | number;
  /** 可选副标题 */
  subtitle?: string;
  /** 可选强调色（用于图标背景） */
  color?: string;
}

/**
 * 统计卡片组件
 *
 * @example
 * ```tsx
 * <StatCard icon="🏙️" label="城市总数" value={42} color="#3b82f6" />
 * <StatCard icon="🌍" label="大洲覆盖" value="5/7" subtitle="71.4%" color="#10b981" />
 * ```
 */
export function StatCard({ icon, label, value, subtitle, color }: StatCardProps) {
  const iconBg = color ? `${color}1a` : '#f3f4f6';

  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ backgroundColor: iconBg }}>
        {icon}
      </div>
      <p className="stat-card-value" style={color ? { color } : undefined}>
        {value}
      </p>
      <p className="stat-card-label">{label}</p>
      {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
    </div>
  );
}
