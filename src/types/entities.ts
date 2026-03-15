/**
 * JourneyHub 业务实体类型定义
 *
 * 此文件定义了面向业务的实体类型，包括：
 * - 基础实体类型（与数据库表对应）
 * - 表单数据类型（用于表单提交）
 * - 扩展实体类型（包含关联数据）
 * - 统计和可视化类型
 */

// ============================================================================
// 基础实体类型（从 database.ts 导入）
// ============================================================================

export type { User, City, WishlistItem, Trip, TripDay, TripTask, Share } from './database';

// ============================================================================
// 枚举类型
// ============================================================================

/**
 * 旅行类型
 */
export enum TripType {
  Leisure = 'leisure',
  Business = 'business',
  Transit = 'transit',
}

/**
 * 行程状态
 */
export enum TripStatus {
  Planning = 'planning',
  Ongoing = 'ongoing',
  Completed = 'completed',
}

/**
 * 分享类型
 */
export enum ShareType {
  All = 'all',
  Trip = 'trip',
}

/**
 * 大洲枚举
 */
export enum Continent {
  Asia = 'Asia',
  Europe = 'Europe',
  Africa = 'Africa',
  NorthAmerica = 'North America',
  SouthAmerica = 'South America',
  Oceania = 'Oceania',
  Antarctica = 'Antarctica',
}

/**
 * 季节枚举
 */
export enum Season {
  Spring = 'spring',
  Summer = 'summer',
  Autumn = 'autumn',
  Winter = 'winter',
}

// ============================================================================
// 表单数据类型
// ============================================================================

/**
 * 城市记录表单数据
 * 用于创建和编辑城市记录
 */
export interface CityFormData {
  cityName: string;
  countryName: string;
  continent: string;
  latitude: number;
  longitude: number;
  visitedAt: Date;
  tripType: TripType;
  rating?: number;
  notes?: string;
  tags?: string[];
  coverImage?: File;
  isFavorite?: boolean;
}

/**
 * 愿望清单表单数据
 */
export interface WishlistFormData {
  cityName: string;
  countryName: string;
  continent: string;
  latitude: number;
  longitude: number;
  priority?: number;
  expectedSeason?: Season;
  notes?: string;
}

/**
 * 行程表单数据
 */
export interface TripFormData {
  title: string;
  relatedCityId?: string;
  relatedWishlistId?: string;
  startDate: Date;
  endDate: Date;
  budget?: number;
  currency?: string;
  transportation?: string;
  accommodation?: string;
  notes?: string;
  shareEnabled?: boolean;
}

/**
 * 行程日程表单数据
 */
export interface TripDayFormData {
  dayIndex: number;
  date: Date;
  title?: string;
  notes?: string;
}

/**
 * 行程待办事项表单数据
 */
export interface TripTaskFormData {
  dayId?: string;
  content: string;
  isDone?: boolean;
}

/**
 * 用户个人资料表单数据
 */
export interface ProfileFormData {
  nickname?: string;
  avatarFile?: File;
}

/**
 * 认证表单数据
 */
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

// ============================================================================
// 扩展实体类型（包含关联数据）
// ============================================================================

/**
 * 扩展的城市记录类型
 * 包含关联的行程信息
 */
export interface CityWithTrips {
  id: string;
  userId: string;
  cityName: string;
  countryName: string;
  continent: string;
  latitude: number;
  longitude: number;
  visitedAt: string;
  tripType: TripType;
  rating?: number;
  notes?: string;
  tags?: string[];
  coverImage?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  // 关联数据
  trips?: Trip[];
}

/**
 * 扩展的行程类型
 * 包含关联的城市、日程和待办事项
 */
export interface TripWithDetails {
  id: string;
  userId: string;
  title: string;
  relatedCityId?: string;
  relatedWishlistId?: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  budget?: number;
  currency?: string;
  transportation?: string;
  accommodation?: string;
  notes?: string;
  shareEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  // 关联数据
  relatedCity?: City;
  relatedWishlist?: WishlistItem;
  days: TripDay[];
  tasks: TripTask[];
}

/**
 * 扩展的用户类型
 * 包含统计信息
 */
export interface UserWithStats {
  id: string;
  email: string;
  nickname?: string;
  avatarUrl?: string;
  createdAt: string;
  // 统计信息
  totalCities: number;
  totalCountries: number;
  totalTrips: number;
  totalWishlistItems: number;
}

// ============================================================================
// 地理位置相关类型
// ============================================================================

/**
 * 坐标类型
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * 地图标记类型
 */
export interface MapMarker {
  id: string;
  type: 'city' | 'wishlist';
  coordinates: Coordinates;
  title: string;
  subtitle?: string;
  data: City | WishlistItem;
}

/**
 * 地图视图状态
 */
export interface MapViewState {
  center: Coordinates;
  zoom: number;
}

/**
 * 反向地理编码结果
 */
export interface GeocodingResult {
  cityName: string;
  countryName: string;
  continent: string;
  latitude: number;
  longitude: number;
}

// ============================================================================
// 统计与可视化类型
// ============================================================================

/**
 * 旅行统计数据
 */
export interface TravelStatistics {
  // 基础统计
  totalCities: number;
  totalCountries: number;
  totalContinents: number;
  continentCoverage: number; // 百分比 (0-100)

  // 大洲分布
  citiesByContinent: Record<string, number>;

  // 年度统计
  citiesByYear: Record<string, number>;

  // 热门城市
  topCities: Array<{
    cityName: string;
    countryName: string;
    visitCount: number;
  }>;

  // 旅行类型分布
  tripTypeDistribution: Record<TripType, number>;

  // 评分统计
  averageRating?: number;
  ratingDistribution: Record<number, number>; // 1-5 星的数量
}

/**
 * 国家统计
 */
export interface CountryStatistics {
  countryName: string;
  continent: string;
  cityCount: number;
  cities: Array<{
    cityName: string;
    visitedAt: string;
  }>;
}

/**
 * 大洲统计
 */
export interface ContinentStatistics {
  continent: string;
  cityCount: number;
  countryCount: number;
  countries: string[];
}

/**
 * 年度统计
 */
export interface YearlyStatistics {
  year: number;
  cityCount: number;
  countryCount: number;
  tripCount: number;
  cities: Array<{
    cityName: string;
    countryName: string;
    visitedAt: string;
  }>;
}

/**
 * ECharts 图表数据类型
 */
export interface ChartData {
  // 世界地图热力图数据
  worldMapData: Array<{
    name: string; // 国家名称
    value: number; // 访问次数
  }>;

  // 年度柱状图数据
  yearlyChartData: {
    years: string[];
    values: number[];
  };

  // 大洲饼图数据
  continentPieData: Array<{
    name: string;
    value: number;
  }>;
}

// ============================================================================
// 分享相关类型
// ============================================================================

/**
 * 分享数据（公开访问）
 * 排除私密信息
 */
export interface ShareData {
  type: ShareType;
  slug: string;
  createdAt: string;
  // 公开数据
  cities?: Array<Omit<City, 'userId'>>;
  trip?: Omit<TripWithDetails, 'userId'>;
  statistics?: Omit<TravelStatistics, 'averageRating'>;
}

/**
 * 分享链接创建请求
 */
export interface CreateShareRequest {
  type: ShareType;
  relatedTripId?: string;
}

/**
 * 分享链接响应
 */
export interface ShareResponse {
  id: string;
  slug: string;
  url: string;
  createdAt: string;
}

// ============================================================================
// 搜索与筛选类型
// ============================================================================

/**
 * 城市搜索参数
 */
export interface CitySearchParams {
  query?: string;
  continent?: string;
  country?: string;
  tripType?: TripType;
  rating?: number;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  isFavorite?: boolean;
}

/**
 * 行程筛选参数
 */
export interface TripFilterParams {
  status?: TripStatus;
  startDate?: string;
  endDate?: string;
  minBudget?: number;
  maxBudget?: number;
}

/**
 * 搜索结果
 */
export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================================================
// 离线支持类型
// ============================================================================

/**
 * 草稿数据类型
 */
export interface DraftData {
  id: string;
  type: 'city' | 'wishlist' | 'trip';
  data: CityFormData | WishlistFormData | TripFormData;
  createdAt: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
}

/**
 * 同步状态
 */
export interface SyncStatus {
  isOnline: boolean;
  lastSyncAt?: string;
  pendingDrafts: number;
  failedDrafts: number;
}

// ============================================================================
// API 响应类型
// ============================================================================

/**
 * 通用 API 响应
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  message?: string;
}

/**
 * API 错误
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// UI 状态类型
// ============================================================================

/**
 * 地图视图模式
 */
export type MapViewMode = 'cities' | 'wishlist' | 'trips';

/**
 * 侧边栏状态
 */
export interface SidebarState {
  isOpen: boolean;
  activeView: MapViewMode;
}

/**
 * 模态框状态
 */
export interface ModalState {
  isOpen: boolean;
  type?: 'city-form' | 'trip-form' | 'wishlist-form' | 'confirm-delete' | 'share';
  data?: any;
}

/**
 * 加载状态
 */
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

/**
 * 通知类型
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// ============================================================================
// 工具类型
// ============================================================================

/**
 * 深度部分类型（递归）
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 必需字段类型
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * 可选字段类型
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 时间戳字段类型
 */
export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户所有权字段
 */
export interface UserOwned {
  userId: string;
}
