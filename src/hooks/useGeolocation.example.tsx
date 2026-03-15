import React, { useEffect, useState } from 'react';
import { useGeolocation } from './useGeolocation';

/**
 * 示例 1: 基础用法 - 简单的位置获取按钮
 */
export function BasicLocationExample() {
  const { coordinates, error, isLoading, getCurrentPosition } = useGeolocation();

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-4">基础用法示例</h3>

      <button
        onClick={getCurrentPosition}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isLoading ? '获取中...' : '📍 获取我的位置'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          <strong>错误:</strong> {error.message}
        </div>
      )}

      {coordinates && (
        <div className="mt-4 p-3 bg-green-100 rounded">
          <h4 className="font-semibold mb-2">位置信息:</h4>
          <p>纬度: {coordinates.latitude.toFixed(6)}</p>
          <p>经度: {coordinates.longitude.toFixed(6)}</p>
          <p>精度: {coordinates.accuracy.toFixed(2)} 米</p>
        </div>
      )}
    </div>
  );
}

/**
 * 示例 2: 高级配置 - 自定义超时和精度
 */
export function AdvancedLocationExample() {
  const { coordinates, error, isLoading, getCurrentPosition } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 60000,
  });

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-4">高级配置示例</h3>

      <div className="mb-4 text-sm text-gray-600">
        <p>配置:</p>
        <ul className="list-disc list-inside">
          <li>高精度定位: 开启</li>
          <li>超时时间: 5 秒</li>
          <li>缓存时间: 60 秒</li>
        </ul>
      </div>

      <button
        onClick={getCurrentPosition}
        disabled={isLoading}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
      >
        {isLoading ? '定位中...' : '🎯 高精度定位'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          <strong>错误 [{error.code}]:</strong> {error.message}
        </div>
      )}

      {coordinates && (
        <div className="mt-4 p-3 bg-blue-100 rounded">
          <h4 className="font-semibold mb-2">详细位置信息:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>纬度:</div>
            <div>{coordinates.latitude.toFixed(6)}</div>
            <div>经度:</div>
            <div>{coordinates.longitude.toFixed(6)}</div>
            <div>精度:</div>
            <div>{coordinates.accuracy.toFixed(2)} 米</div>
            {coordinates.altitude !== null && (
              <>
                <div>海拔:</div>
                <div>{coordinates.altitude.toFixed(2)} 米</div>
              </>
            )}
            {coordinates.speed !== null && (
              <>
                <div>速度:</div>
                <div>{coordinates.speed.toFixed(2)} m/s</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 示例 3: 错误处理 - 根据错误类型显示不同提示
 */
export function ErrorHandlingExample() {
  const { error, isLoading, getCurrentPosition } = useGeolocation();

  const getErrorMessage = () => {
    if (!error) return null;

    switch (error.code) {
      case 'PERMISSION_DENIED':
        return {
          title: '权限被拒绝',
          message: '请在浏览器设置中允许访问位置信息',
          icon: '🚫',
        };
      case 'POSITION_UNAVAILABLE':
        return {
          title: '位置不可用',
          message: '无法获取位置信息，请检查网络连接或 GPS 设置',
          icon: '📡',
        };
      case 'TIMEOUT':
        return {
          title: '获取超时',
          message: '获取位置超时，请重试',
          icon: '⏱️',
        };
      case 'NOT_SUPPORTED':
        return {
          title: '不支持',
          message: '您的浏览器不支持地理位置功能',
          icon: '❌',
        };
      default:
        return {
          title: '未知错误',
          message: error.message,
          icon: '⚠️',
        };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-4">错误处理示例</h3>

      <button
        onClick={getCurrentPosition}
        disabled={isLoading}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
      >
        {isLoading ? '获取中...' : '📍 获取位置'}
      </button>

      {errorInfo && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <div className="flex items-start">
            <span className="text-2xl mr-3">{errorInfo.icon}</span>
            <div>
              <h4 className="font-semibold text-red-800">{errorInfo.title}</h4>
              <p className="text-red-600 mt-1">{errorInfo.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 示例 4: 与反向地理编码结合
 */
export function LocationWithGeocodingExample() {
  const { coordinates, isLoading, getCurrentPosition } = useGeolocation();
  const [locationInfo, setLocationInfo] = useState<{
    city: string;
    country: string;
  } | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (coordinates) {
      setGeocoding(true);
      // 模拟反向地理编码（实际应该调用 reverseGeocode API）
      setTimeout(() => {
        setLocationInfo({
          city: '北京市',
          country: '中国',
        });
        setGeocoding(false);
      }, 1000);
    }
  }, [coordinates]);

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-4">反向地理编码示例</h3>

      <button
        onClick={getCurrentPosition}
        disabled={isLoading}
        className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-400"
      >
        {isLoading ? '定位中...' : '🌍 获取位置和城市'}
      </button>

      {geocoding && (
        <div className="mt-4 p-3 bg-yellow-100 rounded">
          <p>正在获取城市信息...</p>
        </div>
      )}

      {coordinates && locationInfo && !geocoding && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-100 to-green-100 rounded">
          <h4 className="font-semibold mb-2">📍 您的位置:</h4>
          <p className="text-lg">
            {locationInfo.city}, {locationInfo.country}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            坐标: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * 示例 5: 在表单中使用
 */
export function FormIntegrationExample() {
  const { coordinates, isLoading, getCurrentPosition } = useGeolocation();
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    cityName: '',
  });

  useEffect(() => {
    if (coordinates) {
      setFormData((prev) => ({
        ...prev,
        latitude: coordinates.latitude.toFixed(6),
        longitude: coordinates.longitude.toFixed(6),
      }));
    }
  }, [coordinates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('提交表单:', formData);
    alert('表单已提交！查看控制台');
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-4">表单集成示例</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">城市名称</label>
          <input
            type="text"
            value={formData.cityName}
            onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="输入城市名称"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">纬度</label>
            <input
              type="text"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="纬度"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">经度</label>
            <input
              type="text"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="经度"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={getCurrentPosition}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? '定位中...' : '📍 使用我的位置'}
        </button>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          提交
        </button>
      </form>
    </div>
  );
}

/**
 * 所有示例的容器组件
 */
export function UseGeolocationExamples() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">useGeolocation Hook 示例</h1>

      <BasicLocationExample />
      <AdvancedLocationExample />
      <ErrorHandlingExample />
      <LocationWithGeocodingExample />
      <FormIntegrationExample />
    </div>
  );
}
