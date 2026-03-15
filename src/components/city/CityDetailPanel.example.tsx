/**
 * CityDetailPanel 组件示例
 */

import { useState } from 'react';
import { CityDetailPanel } from './CityDetailPanel';
import { City } from '@/types/database';

// 模拟城市数据
const mockCity: City = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: 'user-123',
  city_name: '北京',
  country_name: '中国',
  continent: 'Asia',
  latitude: 39.9042,
  longitude: 116.4074,
  visited_at: '2024-03-15',
  trip_type: 'leisure',
  rating: 5,
  notes: '这是一次难忘的旅行。参观了故宫、长城等著名景点，品尝了地道的北京烤鸭。',
  tags: ['历史', '文化', '美食', '建筑'],
  cover_image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d',
  is_favorite: true,
  created_at: '2024-03-15T10:00:00Z',
  updated_at: '2024-03-15T10:00:00Z',
};

const mockCityWithoutImage: City = {
  ...mockCity,
  id: '223e4567-e89b-12d3-a456-426614174001',
  city_name: '上海',
  country_name: '中国',
  latitude: 31.2304,
  longitude: 121.4737,
  visited_at: '2024-02-20',
  trip_type: 'business',
  rating: 4,
  notes: '商务出差，参加了一个技术会议。',
  tags: ['商务', '现代'],
  cover_image: undefined,
  is_favorite: false,
};

const mockCityMinimal: City = {
  id: '323e4567-e89b-12d3-a456-426614174002',
  user_id: 'user-123',
  city_name: '广州',
  country_name: '中国',
  continent: 'Asia',
  latitude: 23.1291,
  longitude: 113.2644,
  visited_at: '2024-01-10',
  trip_type: 'transit',
  rating: undefined,
  notes: undefined,
  tags: undefined,
  cover_image: undefined,
  is_favorite: false,
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
};

/**
 * 示例 1: 基本用法
 */
export function BasicExample() {
  return (
    <div style={{ width: '400px', height: '600px', border: '1px solid #e5e7eb' }}>
      <CityDetailPanel
        city={mockCity}
        onEdit={(city) => console.log('Edit:', city)}
        onDeleteSuccess={() => console.log('Deleted')}
        onClose={() => console.log('Closed')}
      />
    </div>
  );
}

/**
 * 示例 2: 无封面图
 */
export function WithoutImageExample() {
  return (
    <div style={{ width: '400px', height: '600px', border: '1px solid #e5e7eb' }}>
      <CityDetailPanel
        city={mockCityWithoutImage}
        onEdit={(city) => console.log('Edit:', city)}
        onDeleteSuccess={() => console.log('Deleted')}
        onClose={() => console.log('Closed')}
      />
    </div>
  );
}

/**
 * 示例 3: 最小信息
 */
export function MinimalExample() {
  return (
    <div style={{ width: '400px', height: '600px', border: '1px solid #e5e7eb' }}>
      <CityDetailPanel
        city={mockCityMinimal}
        onEdit={(city) => console.log('Edit:', city)}
        onDeleteSuccess={() => console.log('Deleted')}
        onClose={() => console.log('Closed')}
      />
    </div>
  );
}

/**
 * 示例 4: 在侧边栏中使用
 */
export function SidebarExample() {
  const [selectedCity, setSelectedCity] = useState<City | null>(mockCity);

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      {/* 城市列表 */}
      <div style={{ width: '200px', padding: '1rem', border: '1px solid #e5e7eb' }}>
        <h3>城市列表</h3>
        <button onClick={() => setSelectedCity(mockCity)}>北京</button>
        <button onClick={() => setSelectedCity(mockCityWithoutImage)}>上海</button>
        <button onClick={() => setSelectedCity(mockCityMinimal)}>广州</button>
      </div>

      {/* 详情面板 */}
      {selectedCity && (
        <div style={{ width: '400px', height: '600px', border: '1px solid #e5e7eb' }}>
          <CityDetailPanel
            city={selectedCity}
            onEdit={(city) => {
              console.log('Edit:', city);
              alert(`编辑城市: ${city.city_name}`);
            }}
            onDeleteSuccess={() => {
              console.log('Deleted');
              setSelectedCity(null);
              alert('删除成功');
            }}
            onClose={() => {
              setSelectedCity(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * 示例 5: 响应式演示
 */
export function ResponsiveExample() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {/* 桌面端 */}
      <div>
        <h4>桌面端 (400px)</h4>
        <div style={{ width: '400px', height: '600px', border: '1px solid #e5e7eb' }}>
          <CityDetailPanel
            city={mockCity}
            onEdit={(city) => console.log('Edit:', city)}
            onDeleteSuccess={() => console.log('Deleted')}
            onClose={() => console.log('Closed')}
          />
        </div>
      </div>

      {/* 移动端 */}
      <div>
        <h4>移动端 (320px)</h4>
        <div style={{ width: '320px', height: '600px', border: '1px solid #e5e7eb' }}>
          <CityDetailPanel
            city={mockCity}
            onEdit={(city) => console.log('Edit:', city)}
            onDeleteSuccess={() => console.log('Deleted')}
            onClose={() => console.log('Closed')}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * 示例 6: 无关闭按钮
 */
export function WithoutCloseButtonExample() {
  return (
    <div style={{ width: '400px', height: '600px', border: '1px solid #e5e7eb' }}>
      <CityDetailPanel
        city={mockCity}
        onEdit={(city) => console.log('Edit:', city)}
        onDeleteSuccess={() => console.log('Deleted')}
        // 不传 onClose，不显示关闭按钮
      />
    </div>
  );
}
