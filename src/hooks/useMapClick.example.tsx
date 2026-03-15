/**
 * useMapClick Hook 集成示例
 *
 * 这个文件展示了如何在实际的地图页面中使用 useMapClick Hook
 * 注意：这是一个示例文件，不会在生产环境中使用
 */

import React from 'react';
import { useMapClick } from './useMapClick';
import { MapContainer } from '@/components/map/MapContainer';

/**
 * 示例 1: 基础用法 - 显示点击坐标
 */
export function BasicExample() {
  const { coordinates, handleMapClick, clearCoordinates } = useMapClick();

  return (
    <div>
      <h2>基础示例：显示点击坐标</h2>

      <MapContainer onMapClick={handleMapClick}>{/* 地图标记等子组件 */}</MapContainer>

      {coordinates && (
        <div className="coordinates-display">
          <h3>点击位置</h3>
          <p>纬度: {coordinates.lat.toFixed(6)}</p>
          <p>经度: {coordinates.lng.toFixed(6)}</p>
          <button onClick={clearCoordinates}>清除</button>
        </div>
      )}
    </div>
  );
}

/**
 * 示例 2: 与表单集成
 */
export function FormIntegrationExample() {
  const { coordinates, handleMapClick, clearCoordinates } = useMapClick();

  const handleFormSubmit = async (data: any) => {
    console.log('提交表单数据:', data);
    // 这里应该调用 API 创建城市
    // await createCity(data);
    clearCoordinates();
  };

  return (
    <div>
      <h2>表单集成示例</h2>

      <MapContainer onMapClick={handleMapClick}>{/* 地图标记 */}</MapContainer>

      {coordinates && (
        <div className="city-form-panel">
          <h3>添加新城市</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleFormSubmit({
                cityName: formData.get('cityName'),
                countryName: formData.get('countryName'),
                latitude: coordinates.lat,
                longitude: coordinates.lng,
              });
            }}
          >
            <div>
              <label>城市名称:</label>
              <input type="text" name="cityName" required />
            </div>
            <div>
              <label>国家:</label>
              <input type="text" name="countryName" required />
            </div>
            <div>
              <label>坐标:</label>
              <input
                type="text"
                value={`${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`}
                readOnly
              />
            </div>
            <div>
              <button type="submit">提交</button>
              <button type="button" onClick={clearCoordinates}>
                取消
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/**
 * 示例 3: 与 Modal 集成
 */
export function ModalIntegrationExample() {
  const { coordinates, handleMapClick, clearCoordinates } = useMapClick();

  return (
    <div>
      <h2>Modal 集成示例</h2>

      <MapContainer onMapClick={handleMapClick}>{/* 地图标记 */}</MapContainer>

      {/* 简化的 Modal 实现 */}
      {coordinates && (
        <div className="modal-overlay" onClick={clearCoordinates}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>添加城市</h3>
              <button onClick={clearCoordinates}>×</button>
            </div>
            <div className="modal-body">
              <p>点击位置:</p>
              <p>纬度: {coordinates.lat.toFixed(6)}</p>
              <p>经度: {coordinates.lng.toFixed(6)}</p>
              {/* 这里应该放置 CityForm 组件 */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 示例 4: 显示临时标记
 */
export function TemporaryMarkerExample() {
  const { coordinates, handleMapClick, clearCoordinates } = useMapClick();

  return (
    <div>
      <h2>临时标记示例</h2>

      <MapContainer onMapClick={handleMapClick}>
        {/* 已有的城市标记 */}
        {/* {cities.map(city => <CityMarker key={city.id} city={city} />)} */}

        {/* 临时标记显示点击位置 */}
        {coordinates && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'red',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: '2px solid white',
            }}
          >
            <div className="marker-popup">
              <p>新位置</p>
              <p>
                {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              </p>
              <button onClick={clearCoordinates}>取消</button>
            </div>
          </div>
        )}
      </MapContainer>
    </div>
  );
}

/**
 * 示例 5: 完整的地图页面集成
 */
export function CompleteMapPageExample() {
  const { coordinates, handleMapClick, clearCoordinates } = useMapClick();
  const [showForm, setShowForm] = React.useState(false);

  // 当有坐标时自动显示表单
  React.useEffect(() => {
    if (coordinates) {
      setShowForm(true);
    } else {
      setShowForm(false);
    }
  }, [coordinates]);

  const handleCancel = () => {
    clearCoordinates();
    setShowForm(false);
  };

  const handleSubmit = async (data: any) => {
    console.log('创建城市:', data);
    // await createCity(data);
    clearCoordinates();
    setShowForm(false);
  };

  // 使用 handleSubmit 避免未使用警告
  console.log('handleSubmit 已定义:', typeof handleSubmit);

  return (
    <div className="map-page">
      <div className="map-container">
        <MapContainer
          onMapClick={handleMapClick}
          center={coordinates ? [coordinates.lat, coordinates.lng] : undefined}
        >
          {/* 城市标记 */}
        </MapContainer>
      </div>

      <div className="sidebar">
        <h2>我的城市</h2>
        {/* 城市列表 */}
      </div>

      {showForm && coordinates && (
        <div className="form-panel">
          <h3>添加新城市</h3>
          <p>
            位置: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </p>
          {/* CityForm 组件 */}
          <button onClick={handleCancel}>取消</button>
        </div>
      )}
    </div>
  );
}
