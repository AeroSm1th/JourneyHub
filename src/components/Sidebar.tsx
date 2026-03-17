/**
 * 侧边栏组件
 *
 * 通用侧边栏容器，支持响应式折叠
 * 验证需求: 10.3
 */

import { ReactNode } from 'react';
import { useUIStore } from '@/store/uiStore';
import { Menu, X } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Sidebar({ title = '导航', children, className = '' }: SidebarProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <>
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar} />}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${className}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">{title}</h1>
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? '关闭侧边栏' : '打开侧边栏'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="sidebar-content">{children}</div>
      </aside>
    </>
  );
}
