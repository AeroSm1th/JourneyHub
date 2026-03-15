# Geocoding Service

反向地理编码服务，用于将经纬度坐标转换为地理位置信息。

## 功能

- 使用 Nominatim API（OpenStreetMap）进行反向地理编码
- 将经纬度坐标转换为城市名称、国家和大洲
- 支持全球 200+ 个国家和地区
- 自动处理超时和错误
- 符合 Nominatim 使用政策

## 使用方法

### 基本用法

```typescript
import { reverseGeocode } from '@/services/geocoding/nominatim';

// 获取北京的地理信息
const result = await reverseGeocode(39.9042, 116.4074);
console.log(result);
// {
//   cityName: '北京市',
//   countryName: '中国',
//   continent: 'Asia',
//   latitude: 39.9042,
//   longitude: 116.4074
// }
```

### 在地图点击事件中使用

```typescript
import { reverseGeocode } from '@/services/geocoding/nominatim';

const handleMapClick = async (lat: number, lng: number) => {
  try {
    const location = await reverseGeocode(lat, lng);

    // 使用获取的位置信息预填充表单
    setCityFormData({
      cityName: location.cityName,
      countryName: location.countryName,
      continent: location.continent,
      latitude: location.latitude,
      longitude: location.longitude,
    });
  } catch (error) {
    console.error('反向地理编码失败:', error);
    toast.error('无法获取位置信息，请手动输入');
  }
};
```

### 错误处理

```typescript
import { reverseGeocode } from '@/services/geocoding/nominatim';

try {
  const result = await reverseGeocode(lat, lng);
  // 处理成功结果
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('超时')) {
      // 处理超时错误
      console.error('请求超时，请检查网络连接');
    } else if (error.message.includes('纬度') || error.message.includes('经度')) {
      // 处理参数验证错误
      console.error('坐标参数无效');
    } else {
      // 处理其他错误
      console.error('反向地理编码失败:', error.message);
    }
  }
}
```

## API 参考

### `reverseGeocode(latitude, longitude)`

将经纬度坐标转换为地理位置信息。

**参数：**

- `latitude` (number): 纬度，范围 -90 到 90
- `longitude` (number): 经度，范围 -180 到 180

**返回值：**

- `Promise<GeocodingResult>`: 包含城市名称、国家、大洲和坐标的对象

**抛出错误：**

- 参数超出有效范围
- API 请求失败
- 网络超时（10秒）
- 无法解析响应数据

### `getContinent(countryCode)`

根据 ISO 3166-1 alpha-2 国家代码获取大洲名称。

**参数：**

- `countryCode` (string): 两位国家代码（如 'cn', 'us', 'gb'）

**返回值：**

- `string`: 大洲名称（'Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania', 'Antarctica', 'Unknown'）

**示例：**

```typescript
import { getContinent } from '@/services/geocoding/nominatim';

console.log(getContinent('cn')); // 'Asia'
console.log(getContinent('us')); // 'North America'
console.log(getContinent('gb')); // 'Europe'
```

## 类型定义

```typescript
interface GeocodingResult {
  cityName: string; // 城市名称
  countryName: string; // 国家名称
  continent: string; // 大洲名称
  latitude: number; // 纬度
  longitude: number; // 经度
}
```

## 注意事项

1. **使用限制**：Nominatim API 有使用频率限制，请勿在短时间内发送大量请求
2. **User-Agent**：所有请求都包含 JourneyHub 的 User-Agent 标识，符合 Nominatim 使用政策
3. **超时设置**：请求超时时间为 10 秒
4. **语言偏好**：API 请求优先返回中文结果，其次是英文
5. **城市名称优先级**：city > town > village > municipality > county > state

## 支持的大洲和国家

服务支持全球 200+ 个国家和地区，覆盖七大洲：

- **亚洲 (Asia)**: 中国、日本、韩国、印度、泰国等 40+ 国家
- **欧洲 (Europe)**: 英国、法国、德国、意大利等 40+ 国家
- **北美洲 (North America)**: 美国、加拿大、墨西哥等 20+ 国家
- **南美洲 (South America)**: 巴西、阿根廷、智利等 10+ 国家
- **非洲 (Africa)**: 埃及、南非、尼日利亚等 50+ 国家
- **大洋洲 (Oceania)**: 澳大利亚、新西兰等 15+ 国家
- **南极洲 (Antarctica)**

## 测试

运行单元测试：

```bash
npm test -- src/services/geocoding/__tests__/nominatim.test.ts
```

测试覆盖：

- ✅ 国家代码到大洲的映射
- ✅ 参数验证（纬度、经度范围）
- ✅ 成功的反向地理编码
- ✅ 不同城市级别的处理（city, town, village）
- ✅ 错误处理（API 错误、网络错误、超时）
- ✅ 边界值测试

## 相关文件

- `nominatim.ts` - 主要实现文件
- `__tests__/nominatim.test.ts` - 单元测试
- `@/types/entities.ts` - GeocodingResult 类型定义
