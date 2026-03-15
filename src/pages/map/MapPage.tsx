/**
 * 地图主页面
 *
 * 集成地图容器、城市标记、侧边栏、城市创建表单
 * 实现地图和列表的联动
 *
 * 验证需求: 2.1, 2.2, 2.6, 3.1, 3.2
 */

import { useState, useCallback } from 'react';
import { MapContainer } from '@/components/map/MapContainer';
import { CityMarker } from '@/components/map/CityMarker';
import { MapControls } from '@/components/map/MapControls';
import { CityList } from '@/components/city/CityList';
import { CityForm } from '@/components/city/CityForm';
import { CityDetailPanel } from '@/components/city/CityDetailPanel';
import { useCities } from '@/features/cities/hooks/useCities';
import { useCreateCity } from '@/features/cities/hooks/useCreateCity';
import { useMapState } from '@/hooks/useMapState';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { reverseGeocode } from '@/services/geocoding/nominatim';
import type { City } from '@/types/database';
import type { CityFormInput } from '@/schemas/citySchema';
import type { GeocodingResult } from '@/types/entities';
import { Menu, X, Plus } from 'lucide-react';
import './MapPage.css';

/** 地图页面视图模式 */
type MapViewMode = 'list' | 'create' | 'detail';

/**
 * 地图主页面组件
 */
export function MapPage() {
  const { data: cities } = useCities();
  const { mapState, setMapViewImmediate } = useMapState();
  const { sidebarOpen, selectedCityId, toggleSidebar, selectCity } = useUIStore();
  const { user } = useAuthStore();
  const createCity = useCreateCity();

  // 类型断言：useCities 返回 City[]
  const cityList = (cities ?? []) as City[];

  // 侧边栏视图模式
  const [viewMode, setViewMode] = useState<MapViewMode>('list');
  // 点击地图获取的坐标
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  // 反向地理编码结果
  const [geocodingData, setGeocodingData] = useState<GeocodingResult | null>(null);
  // 地理编码加载状态
  const [isGeocoding, setIsGeocoding] = useState(false);

  // 获取选中的城市对象
  const selectedCity = selectedCityId
    ? cityList.find((c) => c.id === selectedCityId) ?? null
    : null;

  /**
   * 处理城市列表项点击
   * 需求 2.6: 选择城市时移动地图中心
   */
  const handleCityClick = useCallback(
    (city: City) => {
      selectCity(city.id);
      setViewMode('detail');
      setMapViewImmediate({
        lat: city.latitude,
        lng: city.longitude,
        zoom: 12,
      });
    },
    [selectCity, setMapViewImmediate]
  );

  /**
   * 处理城市标记点击
   */
  const handleMarkerClick = useCallback(
    (cityId: string) => {
      selectCity(cityId);
      setViewMode('detail');
    },
    [selectCity]
  );

  /**
   * 处理地图点击 - 触发城市创建表单
   * 需求 3.1: 点击地图显示创建城市记录的表单
   * 需求 3.2: 通过反向地理编码自动填充
   */
  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      selectCity(null);
      setClickedCoords({ lat, lng });
      setViewMode('create');
      setGeocodingData(null);
      setIsGeocoding(true);

      // 确保侧边栏打开
      if (!sidebarOpen) {
        toggleSidebar();
      }

      // 反向地理编码
      try {
        const result = await reverseGeocode(lat, lng);
        setGeocodingData(result);
      } catch (error) {
        console.error('反向地理编码失败:', error);
      } finally {
        setIsGeocoding(false);
      }
    },
    [selectCity, sidebarOpen, toggleSidebar]
  );

  /**
   * 处理城市表单提交
   */
  const handleFormSubmit = useCallback(
    async (data: CityFormInput) => {
      if (!clickedCoords) return;

      await createCity.mutateAsync({
        user_id: user?.id ?? '',
        city_name: data.cityName,
        country_name: data.countryName,
        continent: data.continent,
        latitude: clickedCoords.lat,
        longitude: clickedCoords.lng,
        visited_at: data.visitedAt instanceof Date
          ? data.visitedAt.toISOString().split('T')[0]
          : String(data.visitedAt),
        trip_type: data.tripType,
        rating: data.rating,
        notes: data.notes,
        tags: data.tags,
        cover_image: undefined,
        is_favorite: data.isFavorite ?? false,
      });

      // 创建成功，返回列表视图
      setViewMode('list');
      setClickedCoords(null);
      setGeocodingData(null);
    },
    [clickedCoords, createCity]
  );

  /**
   * 取消创建，返回列表
   */
  const handleFormCancel = useCallback(() => {
    setViewMode('list');
    setClickedCoords(null);
    setGeocodingData(null);
  }, []);

  /**
   * 从详情返回列表
   */
  const handleBackToList = useCallback(() => {
    selectCity(null);
    setViewMode('list');
  }, [selectCity]);

  /**
   * 编辑城市（暂时返回列表）
   */
  const handleEditCity = useCallback((_city: City) => {
    // TODO: 实现编辑模式
    console.log('编辑城市:', _city.id);
  }, []);

  /**
   * 删除城市成功后返回列表
   */
  const handleDeleteSuccess = useCallback(() => {
    selectCity(null);
    setViewMode('list');
  }, [selectCity]);

  /** 渲染侧边栏内容 */
  const renderSidebarContent = () => {
    switch (viewMode) {
      case 'create':
        return clickedCoords ? (
          <div className="map-sidebar-form">
            <h2 className="map-sidebar-form-title">添加城市记录</h2>
            <CityForm
              coordinates={clickedCoords}
              geocodingData={geocodingData ?? undefined}
              isLoading={isGeocoding}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        ) : null;

      case 'detail':
        return selectedCity ? (
          <div className="map-sidebar-detail">
            <button className="map-sidebar-back" onClick={handleBackToList}>
              ← 返回列表
            </button>
            <CityDetailPanel
              city={selectedCity}
              onEdit={handleEditCity}
              onDeleteSuccess={handleDeleteSuccess}
            />
          </div>
        ) : (
          <CityList onCityClick={handleCityClick} selectedCityId={selectedCityId ?? undefined} />
        );

      default:
        return <CityList onCityClick={handleCityClick} selectedCityId={selectedCityId ?? undefined} />;
    }
  };

  return (
    <div className="map-page">
      {/* 侧边栏 */}
      <aside className={`map-sidebar ${sidebarOpen ? 'map-sidebar-open' : 'map-sidebar-closed'}`}>
        <div className="map-sidebar-header">
          <h1 className="map-sidebar-title">
            {viewMode === 'create' ? '添加城市' : viewMode === 'detail' ? '城市详情' : '我的足迹'}
          </h1>
          <button
            className="map-sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? '关闭侧边栏' : '打开侧边栏'}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="map-sidebar-content">
            {renderSidebarContent()}
          </div>
        )}
      </aside>

      {/* 地图容器 */}
      <main className="map-main">
        <MapContainer
          center={[mapState.lat, mapState.lng]}
          zoom={mapState.zoom}
          onMapClick={handleMapClick}
        >
          <MapControls defaultZoom={mapState.zoom} defaultCenter={[mapState.lat, mapState.lng]} />
          {cityList.map((city) => (
            <CityMarker key={city.id} city={city} onClick={handleMarkerClick} />
          ))}
        </MapContainer>

        {/* 移动端侧边栏切换按钮 */}
        {!sidebarOpen && (
          <button className="map-mobile-toggle" onClick={toggleSidebar} aria-label="打开侧边栏">
            <Menu size={24} />
          </button>
        )}

        {/* 提示文字 */}
        {viewMode === 'list' && (
          <div className="map-hint">
            <Plus size={16} />
            <span>点击地图添加城市</span>
          </div>
        )}
      </main>
    </div>
  );
}
