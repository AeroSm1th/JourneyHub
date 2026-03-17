/**
 * 城市列表页面
 *
 * 显示所有城市的网格或列表视图
 * 支持搜索和筛选（按大洲、旅行类型、排序）
 *
 * 验证需求: 3.6
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, List, MapPin } from 'lucide-react';
import { useCities } from '@/features/cities/hooks/useCities';
import { CityCard } from '@/components/city/CityCard';
import { Spinner } from '@/components/common/Spinner';
import type { City } from '@/types/database';
import './CitiesPage.css';

/** 视图模式 */
type ViewMode = 'grid' | 'list';

/** 排序方式 */
type SortBy = 'date-desc' | 'date-asc' | 'name' | 'rating';

/** 大洲选项 */
const CONTINENT_OPTIONS = [
  { value: '', label: '全部大洲' },
  { value: 'Asia', label: '亚洲' },
  { value: 'Europe', label: '欧洲' },
  { value: 'North America', label: '北美洲' },
  { value: 'South America', label: '南美洲' },
  { value: 'Africa', label: '非洲' },
  { value: 'Oceania', label: '大洋洲' },
  { value: 'Antarctica', label: '南极洲' },
];

/** 旅行类型选项 */
const TRIP_TYPE_OPTIONS = [
  { value: '', label: '全部类型' },
  { value: 'leisure', label: '休闲' },
  { value: 'business', label: '商务' },
  { value: 'transit', label: '中转' },
];

/** 排序选项 */
const SORT_OPTIONS = [
  { value: 'date-desc', label: '最近访问' },
  { value: 'date-asc', label: '最早访问' },
  { value: 'name', label: '城市名称' },
  { value: 'rating', label: '评分最高' },
];

/** 格式化日期 */
const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
};

/**
 * 城市列表页面组件
 */
export default function CitiesPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useCities();
  const cities: City[] | undefined = data as City[] | undefined;

  // 筛选和视图状态
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [continentFilter, setContinentFilter] = useState('');
  const [tripTypeFilter, setTripTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date-desc');

  /** 筛选和排序后的城市列表 */
  const filteredCities = useMemo(() => {
    if (!cities) return [];

    let result = [...cities];

    // 搜索过滤
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (c) => c.city_name.toLowerCase().includes(q) || c.country_name.toLowerCase().includes(q)
      );
    }

    // 大洲筛选
    if (continentFilter) {
      result = result.filter((c) => c.continent === continentFilter);
    }

    // 旅行类型筛选
    if (tripTypeFilter) {
      result = result.filter((c) => c.trip_type === tripTypeFilter);
    }

    // 排序
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime();
        case 'date-asc':
          return new Date(a.visited_at).getTime() - new Date(b.visited_at).getTime();
        case 'name':
          return a.city_name.localeCompare(b.city_name, 'zh-CN');
        case 'rating':
          return (b.rating ?? 0) - (a.rating ?? 0);
        default:
          return 0;
      }
    });

    return result;
  }, [cities, searchQuery, continentFilter, tripTypeFilter, sortBy]);

  /** 点击城市卡片，导航到详情 */
  const handleCityClick = useCallback(
    (city: City) => {
      navigate(`/app/cities/${city.id}`);
    },
    [navigate]
  );

  // 加载状态
  if (isLoading) {
    return (
      <div className="cities-page">
        <div className="cities-loading">
          <Spinner size="lg" centered />
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="cities-page">
        <div className="cities-error">
          <p className="cities-error-message">加载城市列表失败</p>
          <p className="cities-error-detail">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cities-page">
      {/* 页面头部 */}
      <div className="cities-page-header">
        <h1 className="cities-page-title">
          我的足迹
          {cities && cities.length > 0 && (
            <span className="cities-page-count"> · {cities.length} 个足迹</span>
          )}
        </h1>

        {/* 视图切换 */}
        <div className="cities-view-toggle" role="group" aria-label="视图切换">
          <button
            className={`cities-view-btn ${viewMode === 'grid' ? 'cities-view-btn-active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="网格视图"
            aria-pressed={viewMode === 'grid'}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            className={`cities-view-btn ${viewMode === 'list' ? 'cities-view-btn-active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="列表视图"
            aria-pressed={viewMode === 'list'}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="cities-toolbar">
        <div className="cities-search-wrapper">
          <Search size={18} className="cities-search-icon" />
          <input
            type="search"
            className="cities-search-input"
            placeholder="搜索城市或国家..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="搜索城市"
          />
        </div>

        <select
          className="cities-filter-select"
          value={continentFilter}
          onChange={(e) => setContinentFilter(e.target.value)}
          aria-label="按大洲筛选"
        >
          {CONTINENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className="cities-filter-select"
          value={tripTypeFilter}
          onChange={(e) => setTripTypeFilter(e.target.value)}
          aria-label="按旅行类型筛选"
        >
          {TRIP_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className="cities-filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          aria-label="排序方式"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 城市列表内容 */}
      {filteredCities.length === 0 ? (
        <div className="cities-empty">
          <MapPin className="cities-empty-icon" />
          <h2 className="cities-empty-title">
            {cities && cities.length > 0 ? '没有匹配的城市' : '还没有城市记录'}
          </h2>
          <p className="cities-empty-text">
            {cities && cities.length > 0
              ? '试试调整搜索条件或筛选项'
              : '在地图上点击添加你的第一个城市'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="cities-grid">
          {filteredCities.map((city) => (
            <CityCard key={city.id} city={city} onClick={handleCityClick} />
          ))}
        </div>
      ) : (
        <div className="cities-list-view" role="list">
          {filteredCities.map((city) => (
            <div
              key={city.id}
              className="cities-list-item"
              role="listitem"
              tabIndex={0}
              onClick={() => handleCityClick(city)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCityClick(city);
                }
              }}
            >
              <div className="cities-list-item-image">
                {city.cover_image ? (
                  <img src={city.cover_image} alt={city.city_name} loading="lazy" />
                ) : (
                  <div className="cities-list-item-image-placeholder">
                    <MapPin size={24} />
                  </div>
                )}
              </div>
              <div className="cities-list-item-info">
                <h3 className="cities-list-item-name">{city.city_name}</h3>
                <p className="cities-list-item-country">{city.country_name}</p>
                <time className="cities-list-item-date" dateTime={city.visited_at}>
                  {formatDate(city.visited_at)}
                </time>
              </div>
              {city.rating != null && (
                <span className="cities-list-item-rating" aria-label={`评分 ${city.rating} 星`}>
                  {'★'.repeat(city.rating)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
