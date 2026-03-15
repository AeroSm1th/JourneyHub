/**
 * CityList 组件使用示例
 *
 * 展示城市列表组件的各种使用场景
 */

import { CityList } from './CityList';
import { City } from '@/types/database';

/**
 * 示例 1: 基础使用
 */
export function BasicExample() {
  return (
    <div style={{ height: '600px', border: '1px solid #e5e7eb' }}>
      <CityList />
    </div>
  );
}

/**
 * 示例 2: 带点击事件
 */
export function WithClickHandlerExample() {
  const handleCityClick = (city: City) => {
    console.log('点击了城市:', city.city_name);
    alert(`你点击了 ${city.city_name}, ${city.country_name}`);
  };

  return (
    <div style={{ height: '600px', border: '1px solid #e5e7eb' }}>
      <CityList onCityClick={handleCityClick} />
    </div>
  );
}

/**
 * 示例 3: 带选中状态
 */
export function WithSelectedCityExample() {
  const selectedCityId = 'some-city-id';

  const handleCityClick = (city: City) => {
    console.log('选中城市:', city.city_name);
  };

  return (
    <div style={{ height: '600px', border: '1px solid #e5e7eb' }}>
      <CityList onCityClick={handleCityClick} selectedCityId={selectedCityId} />
    </div>
  );
}

/**
 * 示例 4: 在侧边栏中使用
 */
export function InSidebarExample() {
  const handleCityClick = (city: City) => {
    // 点击城市时，地图中心移动到该城市
    console.log('移动地图到:', city.latitude, city.longitude);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
      }}
    >
      {/* 侧边栏 */}
      <aside
        style={{
          width: '400px',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CityList onCityClick={handleCityClick} />
      </aside>

      {/* 主内容区（地图） */}
      <main style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#6b7280',
          }}
        >
          地图区域
        </div>
      </main>
    </div>
  );
}

/**
 * 示例 5: 响应式布局
 */
export function ResponsiveExample() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem',
        padding: '1rem',
      }}
    >
      <div style={{ height: '500px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ padding: '1rem', margin: 0, borderBottom: '1px solid #e5e7eb' }}>
          桌面端视图
        </h3>
        <div style={{ height: 'calc(100% - 60px)' }}>
          <CityList />
        </div>
      </div>

      <div style={{ height: '500px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ padding: '1rem', margin: 0, borderBottom: '1px solid #e5e7eb' }}>
          移动端视图
        </h3>
        <div style={{ height: 'calc(100% - 60px)', maxWidth: '375px' }}>
          <CityList />
        </div>
      </div>
    </div>
  );
}
