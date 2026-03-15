# CityForm 组件使用文档

## 概述

`CityForm` 是城市记录的表单组件，用于创建和编辑城市记录。

## 功能特性

- ✅ 使用 React Hook Form + Zod 进行表单验证
- ✅ 自动预填充坐标和反向地理编码结果
- ✅ 支持图片上传（最大 5MB，支持 JPG/PNG/WebP）
- ✅ 实时字段验证和错误提示
- ✅ 响应式设计，适配移动端

## Props

```typescript
interface CityFormProps {
  initialData?: Partial<CityFormInput>; // 初始数据（编辑模式）
  coordinates: { lat: number; lng: number }; // 坐标（必填）
  geocodingData?: {
    // 反向地理编码数据（可选）
    cityName: string;
    countryName: string;
    continent: string;
  };
  isLoading?: boolean; // 加载状态
  onSubmit: (data: CityFormInput) => Promise<void>; // 提交回调
  onCancel: () => void; // 取消回调
}
```

## 基础用法

```tsx
import { CityForm } from '@/components/city/CityForm';
import { useCreateCity } from '@/features/cities/hooks';

function CreateCityPage() {
  const createCity = useCreateCity();

  const handleSubmit = async (data: CityFormInput) => {
    await createCity.mutateAsync(data);
  };

  return (
    <CityForm
      coordinates={{ lat: 39.9042, lng: 116.4074 }}
      onSubmit={handleSubmit}
      onCancel={() => navigate(-1)}
    />
  );
}
```

## 带反向地理编码的用法

```tsx
import { CityForm } from '@/components/city/CityForm';
import { reverseGeocode } from '@/services/geocoding/nominatim';
import { useState, useEffect } from 'react';

function CreateCityWithGeocoding() {
  const [geocodingData, setGeocodingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const coordinates = { lat: 31.2304, lng: 121.4737 };

  useEffect(() => {
    const fetchGeocodingData = async () => {
      try {
        const data = await reverseGeocode(coordinates.lat, coordinates.lng);
        setGeocodingData(data);
      } catch (error) {
        console.error('反向地理编码失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGeocodingData();
  }, []);

  return (
    <CityForm
      coordinates={coordinates}
      geocodingData={geocodingData}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
```

## 编辑模式用法

```tsx
import { CityForm } from '@/components/city/CityForm';
import { useCity, useUpdateCity } from '@/features/cities/hooks';

function EditCityPage({ cityId }: { cityId: string }) {
  const { data: city, isLoading } = useCity(cityId);
  const updateCity = useUpdateCity();

  if (isLoading || !city) {
    return <Spinner />;
  }

  const handleSubmit = async (data: CityFormInput) => {
    await updateCity.mutateAsync({ id: cityId, updates: data });
  };

  return (
    <CityForm
      initialData={{
        cityName: city.city_name,
        countryName: city.country_name,
        continent: city.continent,
        visitedAt: new Date(city.visited_at),
        tripType: city.trip_type,
        rating: city.rating,
        notes: city.notes,
        tags: city.tags,
        isFavorite: city.is_favorite,
      }}
      coordinates={{ lat: city.latitude, lng: city.longitude }}
      onSubmit={handleSubmit}
      onCancel={() => navigate(-1)}
    />
  );
}
```

## 表单字段说明

### 必填字段

- **城市名称**: 1-100 个字符
- **国家名称**: 1-100 个字符
- **大洲**: 从预定义列表中选择
- **访问日期**: 不能是未来日期
- **旅行类型**: 休闲旅行、商务出差、中转停留

### 可选字段

- **评分**: 1-5 星
- **备注**: 最多 2000 个字符
- **标签**: 最多 10 个标签，每个标签最多 50 个字符
- **封面图片**: 最大 5MB，支持 JPG/PNG/WebP
- **收藏**: 布尔值

## 验证规则

表单使用 Zod schema 进行验证，详见 `src/schemas/citySchema.ts`。

主要验证规则：

- 城市名称和国家名称不能为空
- 纬度范围：-90 到 90
- 经度范围：-180 到 180
- 访问日期不能是未来日期
- 评分必须是 1-5 的整数
- 图片大小不能超过 5MB
- 图片格式必须是 JPG/PNG/WebP

## 错误处理

表单会自动显示验证错误：

```tsx
// 错误会显示在对应字段下方
{
  errors.cityName && <p className="mt-1 text-sm text-red-600">{errors.cityName.message}</p>;
}
```

## 样式定制

组件使用 Tailwind CSS，可以通过修改类名来定制样式。

## 注意事项

1. 坐标字段是只读的，由地图点击或初始数据提供
2. 反向地理编码数据会自动填充表单，但用户可以修改
3. 图片上传会在客户端进行预检查（大小和类型）
4. 表单提交时会显示加载状态，禁用所有输入
5. 取消按钮在提交过程中会被禁用
