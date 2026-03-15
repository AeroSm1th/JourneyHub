/**
 * 侧边栏组件
 *
 * 支持城市/愿望清单视图切换
 * 验证需求: 4.4, 10.3
 */

import { ReactNode } from 'react';
import { useUIStore, MapViewMode } from '@/store/uiStore';
import { Menu, X } from 'lucide-react';
import './Sidebar.css';

/** 视图标签配置 */
const VIEW_TABS: { key: MapViewMode; label: string }[] = [
  { key: 'cities', label: '城市' },
  { key: 'wishlist', label: '愿望清单' },
];

interface SidebarProps {
  title?: string;
  children: ReactNode;
  /** 愿望清单视图内容 */
  wishlistContent?: ReactNode;
  className?: string;
}

export default function Sidebar({
  title = '我的足迹',
  children,
  wishlistContent,
  className = '',
}: SidebarProps) {
  const { sidebarOpen, toggleSidebar, mapView, setMapView } = useUIStore();

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

        {sidebarOpen && (
          <>
            {/* 视图切换标签 */}
            <div className="sidebar-tabs" role="tablist" aria-label="视图切换">
              {VIEW_TABS.map((tab) => (
                <button
                  key={tab.key}
                  role="tab"
                  className={`sidebar-tab ${mapView === tab.key ? 'sidebar-tab--active' : ''}`}
                  aria-selected={mapView === tab.key}
                  onClick={() => setMapView(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 根据当前视图渲染内容 */}
            <div className="sidebar-content" role="tabpanel">
              {mapView === 'wishlist' && wishlistContent ? wishlistContent : children}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
