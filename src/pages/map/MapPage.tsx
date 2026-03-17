/**
 * 地图主页面
 *
 * 集成地图容器、城市标记、愿望清单标记、侧边栏、城市创建表单
 * 实现地图和列表的联动，支持视图切换
 *
 * 验证需求: 2.1, 2.2, 2.6, 3.1, 3.2, 4.3
 */

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer } from '@/components/map/MapContainer';
import { CityMarker } from '@/components/map/CityMarker';
import { WishlistMarker } from '@/components/map/WishlistMarker';
import { MapControls } from '@/components/map/MapControls';
import { MapLegend } from '@/components/map/MapLegend';
import { CityList } from '@/components/city/CityList';
import { CityForm } from '@/components/city/CityForm';
import { CityDetailPanel } from '@/components/city/CityDetailPanel';
import { WishlistList } from '@/components/wishlist/WishlistList';
import { WishlistForm } from '@/components/wishlist/WishlistForm';
import { WishlistDetailPanel } from '@/components/wishlist/WishlistDetailPanel';
import { Modal } from '@/components/common/Modal';
import { useCities } from '@/features/cities/hooks/useCities';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { useCreateCity } from '@/features/cities/hooks/useCreateCity';
import { useUpdateCity } from '@/features/cities/hooks/useUpdateCity';
import { useCreateWishlistItem } from '@/features/wishlist/hooks/useCreateWishlistItem';
import { useConvertToCity } from '@/features/wishlist/hooks/useConvertToCity';
import { useMapState } from '@/hooks/useMapState';
import { useUIStore, type MapViewMode as StoreMapViewMode } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { reverseGeocode } from '@/services/geocoding/nominatim';
import type { City, WishlistItem } from '@/types/database';
import type { CityFormInput, WishlistFormInput } from '@/schemas/citySchema';
import type { GeocodingResult } from '@/types/entities';
import { uploadImage } from '@/utils/storage';
import { Menu, Plus } from 'lucide-react';
import { BackButton } from '@/components/common/BackButton';
import './MapPage.css';

/** 地图页面视图模式 */
type MapViewMode = 'list' | 'create' | 'detail' | 'edit';

/** 视图标签配置 */
const VIEW_TABS: { key: StoreMapViewMode; label: string }[] = [
  { key: 'cities', label: '我的足迹' },
  { key: 'wishlist', label: '愿望清单' },
];

/**
 * 地图主页面组件
 */
export function MapPage() {
  const { data: cities } = useCities();
  const { data: wishlistData } = useWishlist();
  const { mapState, setMapView, setMapViewImmediate } = useMapState();
  const {
    sidebarOpen,
    selectedCityId,
    mapView,
    toggleSidebar,
    selectCity,
    setMapView: setStoreMapView,
  } = useUIStore();
  const { user } = useAuthStore();
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();
  const createWishlistItem = useCreateWishlistItem();
  const {
    isConverting,
    prefilledData,
    startConvert,
    cancelConvert,
    submitConvert,
    isSubmitting: isConvertSubmitting,
  } = useConvertToCity();

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
  // 当前正在编辑的城市
  const [editingCity, setEditingCity] = useState<City | null>(null);
  // 当前选中的愿望清单项目
  const [selectedWishlistItem, setSelectedWishlistItem] = useState<WishlistItem | null>(null);

  // 处理 URL 中的 edit 参数（从 CityDetailPage 导航过来）
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const editCityId = searchParams.get('edit');
    if (editCityId && cityList.length > 0) {
      const cityToEdit = cityList.find((c) => c.id === editCityId);
      if (cityToEdit) {
        setEditingCity(cityToEdit);
        selectCity(cityToEdit.id);
        setViewMode('edit');
        // 清除 URL 中的 edit 参数，避免重复触发
        setSearchParams((prev) => {
          const params = new URLSearchParams(prev);
          params.delete('edit');
          return params;
        });
      }
    }
  }, [searchParams, cityList, selectCity, setSearchParams]);

  // 获取选中的城市对象
  const selectedCity = selectedCityId
    ? (cityList.find((c) => c.id === selectedCityId) ?? null)
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
      setSelectedWishlistItem(null);
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
      const item = wishlistItems.find((w) => w.id === itemId);
      if (item) {
        setSelectedWishlistItem(item);
        selectCity(null);
        setViewMode('detail');
      }
    },
    [wishlistItems, selectCity]
  );

  /**
   * 处理愿望清单列表项点击
   */
  const handleWishlistItemClick = useCallback(
    (item: WishlistItem) => {
      setSelectedWishlistItem(item);
      selectCity(null);
      setViewMode('detail');
      setViewKey((k) => k + 1);
      setMapViewImmediate({
        lat: item.latitude,
        lng: item.longitude,
        zoom: 12,
      });
    },
    [selectCity, setMapViewImmediate]
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

      // 上传封面图片（如果有）
      const coverImageUrl = await uploadImage(
        data.coverImage as File | undefined,
        user?.id ?? ''
      );

      await createCity.mutateAsync({
        user_id: user?.id ?? '',
        city_name: data.cityName,
        country_name: data.countryName,
        continent: data.continent,
        latitude: clickedCoords.lat,
        longitude: clickedCoords.lng,
        visited_at:
          data.visitedAt instanceof Date
            ? data.visitedAt.toISOString().split('T')[0]
            : String(data.visitedAt),
        trip_type: data.tripType,
        rating: data.rating,
        notes: data.notes,
        tags: data.tags,
        cover_image: coverImageUrl,
        is_favorite: data.isFavorite ?? false,
      });

      // 创建成功，返回列表视图
      setViewMode('list');
      setClickedCoords(null);
      setGeocodingData(null);
    },
    [clickedCoords, createCity, user]
  );

  /**
   * 处理愿望清单表单提交
   * 需求 4.1, 4.2: 在愿望清单视图下点击地图创建愿望清单项目
   */
  const handleWishlistFormSubmit = useCallback(
    async (data: WishlistFormInput) => {
      if (!clickedCoords) return;

      await createWishlistItem.mutateAsync({
        user_id: user?.id ?? '',
        city_name: data.cityName,
        country_name: data.countryName,
        continent: data.continent,
        latitude: clickedCoords.lat,
        longitude: clickedCoords.lng,
        priority: data.priority,
        expected_season: data.expectedSeason,
        notes: data.notes,
      });

      // 创建成功，返回列表视图
      setViewMode('list');
      setClickedCoords(null);
      setGeocodingData(null);
    },
    [clickedCoords, createWishlistItem, user]
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
    setSelectedWishlistItem(null);
    setViewMode('list');
  }, [selectCity]);

  /**
   * 编辑城市 — 切换到编辑表单视图
   */
  const handleEditCity = useCallback((city: City) => {
    setEditingCity(city);
    setViewMode('edit');
  }, []);

  /**
   * 处理城市编辑表单提交
   */
  const handleEditFormSubmit = useCallback(
    async (data: CityFormInput) => {
      if (!editingCity) return;

      // 上传封面图片（如果有新图片）
      const coverImageUrl = await uploadImage(
        data.coverImage as File | undefined,
        user?.id ?? ''
      );

      await updateCity.mutateAsync({
        id: editingCity.id,
        updates: {
          city_name: data.cityName,
          country_name: data.countryName,
          continent: data.continent,
          latitude: editingCity.latitude,
          longitude: editingCity.longitude,
          visited_at:
            data.visitedAt instanceof Date
              ? data.visitedAt.toISOString().split('T')[0]
              : String(data.visitedAt),
          trip_type: data.tripType,
          rating: data.rating,
          notes: data.notes,
          tags: data.tags,
          // 有新图片用新 URL，没有则保留原图
          cover_image: coverImageUrl ?? editingCity.cover_image,
          is_favorite: data.isFavorite ?? false,
        },
      });

      // 更新成功，返回详情视图
      setEditingCity(null);
      setViewMode('detail');
    },
    [editingCity, updateCity, user]
  );

  /**
   * 取消编辑，返回详情视图
   */
  const handleEditCancel = useCallback(() => {
    setEditingCity(null);
    setViewMode('detail');
  }, []);

  /**
   * 删除城市成功后返回列表
   */
  const handleDeleteSuccess = useCallback(() => {
    selectCity(null);
    setViewMode('list');
  }, [selectCity]);

  /**
   * 处理愿望清单转换表单提交
   */
  const handleConvertSubmit = useCallback(
    async (formData: CityFormInput) => {
      await submitConvert(formData);
      // 转换成功后返回列表
      setSelectedWishlistItem(null);
      setViewMode('list');
    },
    [submitConvert]
  );

  /** 渲染侧边栏内容 */
  const renderSidebarContent = () => {
    switch (viewMode) {
      case 'create':
        if (!clickedCoords) return null;
        // 根据当前 mapView 状态决定显示城市表单还是愿望清单表单
        if (mapView === 'wishlist') {
          return (
            <div className="map-sidebar-form">
              <h2 className="map-sidebar-form-title">添加到愿望清单</h2>
              <WishlistForm
                key={`wl-${clickedCoords.lat}-${clickedCoords.lng}`}
                coordinates={clickedCoords}
                geocodingData={geocodingData ?? undefined}
                isLoading={isGeocoding}
                onSubmit={handleWishlistFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          );
        }
        return (
          <div className="map-sidebar-form">
            <h2 className="map-sidebar-form-title">添加城市记录</h2>
            <CityForm
              key={`city-${clickedCoords.lat}-${clickedCoords.lng}`}
              coordinates={clickedCoords}
              geocodingData={geocodingData ?? undefined}
              isLoading={isGeocoding}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        );

      case 'detail':
        // 愿望清单详情
        if (selectedWishlistItem) {
          return (
            <div className="map-sidebar-detail">
              <WishlistDetailPanel
                item={selectedWishlistItem}
                onDeleteSuccess={handleBackToList}
                onConvert={startConvert}
                onBack={handleBackToList}
              />
            </div>
          );
        }
        // 城市详情
        return selectedCity ? (
          <div className="map-sidebar-detail">
            <CityDetailPanel
              city={selectedCity}
              onEdit={handleEditCity}
              onDeleteSuccess={handleDeleteSuccess}
              onBack={handleBackToList}
            />
          </div>
        ) : (
          renderListContent()
        );

      case 'edit':
        return editingCity ? (
          <div className="map-sidebar-form">
            <BackButton label="返回详情" onClick={handleEditCancel} />
            <h2 className="map-sidebar-form-title">编辑城市记录</h2>
            <CityForm
              key={`edit-${editingCity.id}`}
              coordinates={{ lat: editingCity.latitude, lng: editingCity.longitude }}
              initialData={{
                cityName: editingCity.city_name,
                countryName: editingCity.country_name,
                continent: editingCity.continent as any,
                latitude: editingCity.latitude,
                longitude: editingCity.longitude,
                visitedAt: new Date(editingCity.visited_at),
                tripType: editingCity.trip_type as any,
                rating: editingCity.rating,
                notes: editingCity.notes,
                tags: editingCity.tags,
                isFavorite: editingCity.is_favorite,
              }}
              onSubmit={handleEditFormSubmit}
              onCancel={handleEditCancel}
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
      return (
        <WishlistList
          onItemClick={handleWishlistItemClick}
          selectedItemId={selectedWishlistItem?.id}
        />
      );
    }
    return <CityList onCityClick={handleCityClick} selectedCityId={selectedCityId ?? undefined} />;
  };

  return (
    <div className="map-page">
      {/* 侧边栏 */}
      <aside className={`map-sidebar ${sidebarOpen ? 'map-sidebar-open' : 'map-sidebar-closed'}`}>
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

            <div className="map-sidebar-content">{renderSidebarContent()}</div>
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

        {/* 地图图例 */}
        <MapLegend mapView={mapView} />

        {/* 提示文字 */}
        {viewMode === 'list' && (
          <div className="map-hint">
            <Plus size={16} />
            <span>{mapView === 'wishlist' ? '点击地图添加愿望清单' : '点击地图添加城市'}</span>
          </div>
        )}
      </main>

      {/* 愿望清单转换为城市记录的模态框 */}
      {isConverting && prefilledData && (
        <Modal isOpen={isConverting} onClose={cancelConvert} title="转换为城市记录">
          <CityForm
            initialData={{
              cityName: prefilledData.cityName,
              countryName: prefilledData.countryName,
              continent: prefilledData.continent as any,
              latitude: prefilledData.latitude,
              longitude: prefilledData.longitude,
            }}
            coordinates={{
              lat: prefilledData.latitude,
              lng: prefilledData.longitude,
            }}
            isLoading={isConvertSubmitting}
            onSubmit={handleConvertSubmit}
            onCancel={cancelConvert}
          />
        </Modal>
      )}
    </div>
  );
}
