/**
 * CityCard 组件使用示例
 */

import { CityCard } from './CityCard';
import { City } from '@/types/database';

// React import for InteractiveExample
import React from 'react';

// 示例数据
const exampleCity: City = {
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
  notes: '故宫、长城、天安门广场',
  tags: ['历史', '文化', '美食', '购物'],
  cover_image: 'https://example.com/beijing.jpg',
  is_favorite: true,
  created_at: '2024-03-15T10:00:00Z',
  updated_at: '2024-03-15T10:00:00Z',
};

const exampleCityWithoutImage: City = {
  ...exampleCity,
  id: '223e4567-e89b-12d3-a456-426614174001',
  city_name: '上海',
  country_name: '中国',
  cover_image: undefined,
  is_favorite: false,
  rating: 4,
  tags: ['现代', '金融'],
};

/**
 * 基础用法
 */
export function BasicExample() {
  return (
    <div style={{ maxWidth: '320px' }}>
      <CityCard city={exampleCity} onClick={(city) => console.log('Clicked:', city.city_name)} />
    </div>
  );
}

/**
 * 选中状态
 */
export function SelectedExample() {
  return (
    <div style={{ maxWidth: '320px' }}>
      <CityCard
        city={exampleCity}
        onClick={(city) => console.log('Clicked:', city.city_name)}
        isSelected={true}
      />
    </div>
  );
}

/**
 * 无封面图
 */
export function NoImageExample() {
  return (
    <div style={{ maxWidth: '320px' }}>
      <CityCard
        city={exampleCityWithoutImage}
        onClick={(city) => console.log('Clicked:', city.city_name)}
      />
    </div>
  );
}

/**
 * 网格布局
 */
export function GridExample() {
  const cities = [exampleCity, exampleCityWithoutImage, exampleCity];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        padding: '16px',
      }}
    >
      {cities.map((city, index) => (
        <CityCard
          key={`${city.id}-${index}`}
          city={city}
          onClick={(city) => console.log('Clicked:', city.city_name)}
        />
      ))}
    </div>
  );
}

/**
 * 响应式网格
 */
export function ResponsiveGridExample() {
  const cities = Array.from({ length: 6 }, (_, i) => ({
    ...exampleCity,
    id: `city-${i}`,
    city_name: `城市 ${i + 1}`,
  }));

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      {cities.map((city) => (
        <CityCard
          key={city.id}
          city={city}
          onClick={(city) => console.log('Clicked:', city.city_name)}
        />
      ))}
    </div>
  );
}

/**
 * 交互示例
 */
export function InteractiveExample() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const cities = [
    exampleCity,
    exampleCityWithoutImage,
    { ...exampleCity, id: 'city-3', city_name: '广州' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        padding: '16px',
      }}
    >
      {cities.map((city) => (
        <CityCard
          key={city.id}
          city={city}
          onClick={(city) => setSelectedId(city.id)}
          isSelected={selectedId === city.id}
        />
      ))}
    </div>
  );
}
