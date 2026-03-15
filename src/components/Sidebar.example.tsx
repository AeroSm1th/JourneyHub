/**
 * Sidebar 组件使用示例
 */

import Sidebar from './Sidebar';
import { CityList } from './city/CityList';

/**
 * 示例 1: 基础用法
 */
export function BasicSidebarExample() {
  return (
    <Sidebar title="我的足迹">
      <CityList />
    </Sidebar>
  );
}

/**
 * 示例 2: 自定义标题
 */
export function CustomTitleExample() {
  return (
    <Sidebar title="愿望清单">
      <div style={{ padding: '1rem' }}>
        <p>这里显示愿望清单内容</p>
      </div>
    </Sidebar>
  );
}

/**
 * 示例 3: 自定义样式
 */
export function CustomStyleExample() {
  return (
    <Sidebar title="行程规划" className="custom-sidebar">
      <div style={{ padding: '1rem' }}>
        <p>这里显示行程规划内容</p>
      </div>
    </Sidebar>
  );
}

/**
 * 示例 4: 完整的地图页面集成
 */
export function MapPageIntegrationExample() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar title="我的足迹">
        <CityList />
      </Sidebar>

      <main style={{ flex: 1, position: 'relative' }}>
        <div style={{ padding: '2rem' }}>
          <h2>地图区域</h2>
          <p>这里显示地图内容</p>
        </div>
      </main>
    </div>
  );
}
