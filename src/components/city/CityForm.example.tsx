/**
 * CityForm 组件使用示例
 */

import { useState, useEffect } from 'react';
import { CityForm } from './CityForm';
import type { CityFormInput } from '@/schemas/citySchema';
import { TripType, Continent } from '@/types/entities';

/**
 * 示例 1: 基础用法 - 创建新城市
 */
export function BasicExample() {
  const handleSubmit = async (data: CityFormInput) => {
    console.log('提交的数据:', data);
    // 这里调用 API 创建城市
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert('城市创建成功！');
  };

  const handleCancel = () => {
    console.log('取消操作');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">创建新城市</h2>
      <CityForm
        coordinates={{ lat: 39.9042, lng: 116.4074 }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}

/**
 * 示例 2: 带反向地理编码
 */
export function WithGeocodingExample() {
  const geocodingData = {
    cityName: '北京',
    countryName: '中国',
    continent: 'Asia',
  };

  const handleSubmit = async (data: CityFormInput) => {
    console.log('提交的数据:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert('城市创建成功！');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">创建新城市（带地理编码）</h2>
      <CityForm
        coordinates={{ lat: 39.9042, lng: 116.4074 }}
        geocodingData={geocodingData}
        onSubmit={handleSubmit}
        onCancel={() => console.log('取消')}
      />
    </div>
  );
}

/**
 * 示例 3: 编辑模式
 */
export function EditModeExample() {
  const [initialData] = useState<Partial<CityFormInput>>({
    cityName: '上海',
    countryName: '中国',
    continent: Continent.Asia,
    visitedAt: new Date('2024-01-15'),
    tripType: TripType.Leisure,
    rating: 5,
    notes: '非常棒的城市，美食很多！',
    tags: ['美食', '现代化', '购物'],
    isFavorite: true,
  });

  const handleSubmit = async (data: CityFormInput) => {
    console.log('更新的数据:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert('城市更新成功！');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">编辑城市</h2>
      <CityForm
        initialData={initialData}
        coordinates={{ lat: 31.2304, lng: 121.4737 }}
        onSubmit={handleSubmit}
        onCancel={() => console.log('取消')}
      />
    </div>
  );
}

/**
 * 示例 4: 加载状态
 */
export function LoadingStateExample() {
  const [isLoading, setIsLoading] = useState(true);

  // 模拟加载
  setTimeout(() => setIsLoading(false), 2000);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">加载中...</h2>
      <CityForm
        coordinates={{ lat: 39.9042, lng: 116.4074 }}
        isLoading={isLoading}
        onSubmit={async () => {}}
        onCancel={() => console.log('取消')}
      />
    </div>
  );
}

/**
 * 示例 5: 完整的集成示例（带 React Query）
 */
export function IntegratedExample() {
  const coordinates = { lat: 22.5431, lng: 114.0579 };
  const [geocodingData, setGeocodingData] = useState<{
    cityName: string;
    countryName: string;
    continent: string;
  } | null>(null);
  const [isLoadingGeocode, setIsLoadingGeocode] = useState(true);

  // 模拟反向地理编码
  useEffect(() => {
    setTimeout(() => {
      setGeocodingData({
        cityName: '深圳',
        countryName: '中国',
        continent: 'Asia',
      });
      setIsLoadingGeocode(false);
    }, 1500);
  }, []);

  const handleSubmit = async (data: CityFormInput) => {
    console.log('提交的数据:', data);
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1500));
    alert('城市创建成功！');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">完整示例</h2>
      <div className="mb-4 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          坐标: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
        </p>
        {isLoadingGeocode ? (
          <p className="text-sm text-blue-600 mt-1">正在获取地理信息...</p>
        ) : (
          <p className="text-sm text-green-600 mt-1">地理信息已加载</p>
        )}
      </div>
      <CityForm
        coordinates={coordinates}
        geocodingData={geocodingData || undefined}
        isLoading={isLoadingGeocode}
        onSubmit={handleSubmit}
        onCancel={() => console.log('取消')}
      />
    </div>
  );
}
