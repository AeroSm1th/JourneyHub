/**
 * 地图主页面
 *
 * 集成地图容器、城市标记、愿望清单标记、侧边栏、城市创建表单
 * 实现地图和列表的联动，支持视图切换
 *
 * 验证需求: 2.1, 2.2, 2.6, 3.1, 3.2, 4.3
 */

import { useState, useCallback } from 'react';
import { MapContainer } from '@/components/map/MapContainer';
import { CityMarker } from '@/components/map/CityMarker';
import { WishlistMarker } from '@/components/map/WishlistMarker';
import { MapControls } from '@/components/map/MapControls';
import { CityList } from '@/components/city/CityList';
import { CityForm } from '@/components/city/CityForm';
import { CityDetailPanel } from '@/components/city/CityDetailPanel';
import { WishlistList } from '@/components/wishlist/WishlistList';
import { useCities } from '@/features/cities/hooks/useCities';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { useCreateCity } from '@/features/cities/hooks/useCreateCity';
import { useMapState } from '@/hooks/useMapState';
import { useUIStore, type MapViewMode as StoreMapViewMode } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { reverseGeocode } from '@/services/geocoding/nominatim';
import type { City, WishlistItem } from '@/types/database';
import type { CityFormInput } from '@/schemas/citySchema';
import type { GeocodingResult } from '@/types/entities';
import { Menu, X, Plus } from 'lucide-react';
import './MapPage.css';

/** 地图页面视图模式 */
type MapViewMode = 'list' | 'create' | 'detail';

/** 视图标签配置 */
const VIEW_TABS: { key: StoreMapViewMode; label: string }[] = [
  { key: 'cities', label: '城市' },
  { key: 'wishlist', label: '愿望清单' },
];

/**
 * 地图主页面组件
 */
export function MapPage() {
  const { data: cities } = useCities();
  const { data: wishlistData } = useWishlist();
  const { mapState, setMapView, setMapViewImmediate } = useMapState();
  const { sidebarOpen, selectedCityId, mapView, toggleSidebar, selectCity, setMapView: setStoreMapView } = useUIStore();
  const { user } = useAuthStore();
  const createCity = useCreateCity();

  // 类型断言
  const cityList = (cities ?? []) as City[];
  const wishlistItems = (wishlistData ?? []) as WishlistItem[];

  // 根据 mapView 状态决定是否显示城市标记
  const showCityMarkers = mapView === 'cities' || mapView === 'trips';
  // 根据 mapView 状态决定是否显示愿望清单标记
  const showWishlistMarkers = mapView === 'wishlist' || mapView === 'trips';

  // 侧边栏视图模式
  const [viewMode, setViewMode] = useState<MapViewMode>('list');
  // 程序化跳转计数器，只在点击城市列表等操作时递增
  const [viewKey, setViewKey] = useState(0);
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
   * 处理视图标签切换
   * 切换标签时同步更新 mapView 状态和侧边栏视图
   * 需求 4.3, 4.4: 视图切换联动
   */
  const handleTabChange = useCallback(
    (view: StoreMapViewMode) => {
      setStoreMapView(view);
      // 切换标签时重置为列表视图
      selectCity(null);
      setViewMode('list');
    },
    [setStoreMapView, selectCity]
  );

  /**
   * 处理城市列表项点击
   * 需求 2.6: 选择城市时移动地图中心
   */
  const handleCityClick = useCallback(
    (city: City) => {
      selectCity(city.id);
      setViewMode('detail');
      setViewKey((k) => k + 1);
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
   * 处理愿望清单标记点击
   * 需求 4.3: 在地图上用不同标记显示愿望清单城市
   */
  const handleWishlistMarkerClick = useCallback(
    (itemId: string) => {
      // 点击愿望清单标记时，暂时只打印日志
      console.log('点击愿望清单标记:', itemId);
    },
    []
  );

  /**
   * 处理地图移动/缩放结束 — 同步 Leaflet 状态到 URL 参数
   */
  const handleMoveEnd = useCallback(
    (lat: number, lng: number, zoom: number) => {
      setMapView({ lat, lng, zoom });
    },
    [setMapView]
  );

  /**
   * 处理地图点击 - 触发城市创建表单
   * 需求 3.1: 点击地图显示创建城市记录的表单
   * 需求 3.2: 通过反向地理编码自动填充
   */
  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      selectCity(null);
      setGeocodingData(null);
      setIsGeocoding(true);
      setClickedCoords({ lat, lng });
      setViewMode('create');

      // 确保侧边栏打开
      if (!sidebarOpen) {
        toggleSidebar();
      }

      // 反向地理编码（传入当前地图缩放级别，用于智能拼接城市名）
      try {
        const result = await reverseGeocode(lat, lng, mapState.zoom);
        console.log('[MapPage] 反向地理编码结果:', result);
        setGeocodingData(result);
      } catch (error) {
        console.error('[MapPage] 反向地理编码失败:', error);
      } finally {
        setIsGeocoding(false);
      }
    },
    [selectCity, sidebarOpen, toggleSidebar, mapState.zoom]
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

  /**
   * 获取侧边栏标题
   * 根据当前视图模式和 mapView 状态返回对应标题
   */
  const getSidebarTitle = (): string => {
    if (viewMode === 'create') return '添加城市';
    if (viewMode === 'detail') return '城市详情';
    if (mapView === 'wishlist') return '愿望清单';
    return '我的足迹';
  };

  /** 渲染侧边栏内容 */
  const renderSidebarContent = () => {
    switch (viewMode) {
      case 'create':
        return clickedCoords ? (
          <div className="map-sidebar-form">
            <h2 className="map-sidebar-form-title">添加城市记录</h2>
            <CityForm
              key={`${clickedCoords.lat}-${clickedCoords.lng}`}
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
          renderListContent()
        );

      default:
        return renderListContent();
    }
  };

  /**
   * 根据 mapView 状态渲染列表内容
   * 需求 4.3, 4.4: 视图切换联动
   */
  const renderListContent = () => {
    if (mapView === 'wishlist') {
      return <WishlistList />;
    }
    return <CityList onCityClick={handleCityClick} selectedCityId={selectedCityId ?? undefined} />;
  };

  return (
    <div className="map-page">
      {/* 侧边栏 */}
      <aside className={`map-sidebar ${sidebarOpen ? 'map-sidebar-open' : 'map-sidebar-closed'}`}>
        <div className="map-sidebar-header">
          <h1 className="map-sidebar-title">
            {getSidebarTitle()}
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
          <>
            {/* 视图切换标签：仅在列表模式下显示 */}
            {viewMode === 'list' && (
              <div className="map-sidebar-tabs" role="tablist" aria-label="视图切换">
                {VIEW_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    role="tab"
                    className={`map-sidebar-tab ${mapView === tab.key ? 'map-sidebar-tab--active' : ''}`}
                    aria-selected={mapView === tab.key}
                    onClick={() => handleTabChange(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            <div className="map-sidebar-content">
              {renderSidebarContent()}
            </div>
          </>
        )}
      </aside>

      {/* 地图容器 */}
      <main className="map-main">
        <MapContainer
          center={[mapState.lat, mapState.lng]}
          zoom={mapState.zoom}
          viewKey={viewKey}
          onMapClick={handleMapClick}
          onMoveEnd={handleMoveEnd}
        >
          <MapControls defaultZoom={mapState.zoom} defaultCenter={[mapState.lat, mapState.lng]} />

          {/* 城市标记：在 cities 或 trips（全部）视图下显示 */}
          {showCityMarkers &&
            cityList.map((city) => (
              <CityMarker key={city.id} city={city} onClick={handleMarkerClick} />
            ))}

          {/* 愿望清单标记：在 wishlist 或 trips（全部）视图下显示 */}
          {showWishlistMarkers &&
            wishlistItems.map((item) => (
              <WishlistMarker key={item.id} item={item} onClick={handleWishlistMarkerClick} />
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
