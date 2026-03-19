/**
 * Supabase 数据库类型定义
 *
 * 此文件定义了 JourneyHub 应用的所有数据库表类型
 * 包含：users, cities, wishlist_items, trips, trip_days, trip_tasks, shares
 */

// ============================================================================
// 基础类型定义
// ============================================================================

/**
 * 用户表类型
 */
export interface User {
  id: string;
  email: string;
  nickname?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

/**
 * 城市记录表类型
 */
export interface City {
  id: string;
  user_id: string;
  city_name: string;
  country_name: string;
  continent: string;
  latitude: number;
  longitude: number;
  visited_at: string;
  trip_type: 'leisure' | 'business' | 'transit';
  rating?: number;
  notes?: string;
  tags?: string[];
  cover_image?: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 愿望清单表类型
 */
export interface WishlistItem {
  id: string;
  user_id: string;
  city_name: string;
  country_name: string;
  continent: string;
  latitude: number;
  longitude: number;
  priority: number;
  expected_season?: string;
  notes?: string;
  created_at: string;
}

/**
 * 行程表类型
 */
export interface Trip {
  id: string;
  user_id: string;
  title: string;
  related_city_id?: string;
  related_wishlist_id?: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'ongoing' | 'completed';
  budget?: number;
  currency?: string;
  transportation?: string;
  accommodation?: string;
  notes?: string;
  share_enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 行程日程表类型
 */
export interface TripDay {
  id: string;
  trip_id: string;
  day_index: number;
  date: string;
  title?: string;
  notes?: string;
}

/**
 * 行程待办事项表类型
 */
export interface TripTask {
  id: string;
  trip_id: string;
  day_id?: string;
  content: string;
  is_done: boolean;
  created_at: string;
}

/**
 * 分享链接表类型
 */
export interface Share {
  id: string;
  user_id: string;
  type: 'all' | 'trip';
  related_trip_id?: string;
  slug: string;
  created_at: string;
}

// ============================================================================
// 数据库表名称映射
// ============================================================================

export type Tables = {
  users: User;
  cities: City;
  wishlist_items: WishlistItem;
  trips: Trip;
  trip_days: TripDay;
  trip_tasks: TripTask;
  shares: Share;
};

// ============================================================================
// 插入类型（Insert Types）
// ============================================================================

/**
 * 城市记录插入类型（排除自动生成的字段）
 */
export type CityInsert = Omit<City, 'id' | 'created_at' | 'updated_at'>;

/**
 * 愿望清单插入类型
 */
export type WishlistItemInsert = Omit<WishlistItem, 'id' | 'created_at'>;

/**
 * 行程插入类型
 */
export type TripInsert = Omit<Trip, 'id' | 'created_at' | 'updated_at'>;

/**
 * 行程日程插入类型
 */
export type TripDayInsert = Omit<TripDay, 'id'>;

/**
 * 行程待办事项插入类型
 */
export type TripTaskInsert = Omit<TripTask, 'id' | 'created_at'>;

/**
 * 分享链接插入类型
 */
export type ShareInsert = Omit<Share, 'id' | 'created_at'>;

// ============================================================================
// 更新类型（Update Types）
// ============================================================================

/**
 * 城市记录更新类型（所有字段可选）
 */
export type CityUpdate = Partial<Omit<City, 'id' | 'user_id' | 'created_at'>>;

/**
 * 愿望清单更新类型
 */
export type WishlistItemUpdate = Partial<Omit<WishlistItem, 'id' | 'user_id' | 'created_at'>>;

/**
 * 行程更新类型
 */
export type TripUpdate = Partial<Omit<Trip, 'id' | 'user_id' | 'created_at'>>;

/**
 * 行程日程更新类型
 */
export type TripDayUpdate = Partial<Omit<TripDay, 'id' | 'trip_id'>>;

/**
 * 行程待办事项更新类型
 */
export type TripTaskUpdate = Partial<Omit<TripTask, 'id' | 'trip_id' | 'created_at'>>;

// ============================================================================
// Supabase Database 类型
// ============================================================================

type RecordLike<T> = T & Record<string, unknown>;

type SupabaseTable<Row extends Record<string, unknown>, Insert extends Record<string, unknown>, Update extends Record<string, unknown>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

/**
 * Supabase 数据库完整类型定义
 * 用于 createClient<Database> 的泛型参数
 */
export interface Database {
  public: {
    Tables: Record<string, SupabaseTable<any, any, any>> & {
      users: SupabaseTable<
        RecordLike<User>,
        RecordLike<Omit<User, 'created_at'>>,
        RecordLike<Partial<Omit<User, 'id' | 'created_at'>>>
      >;
      cities: SupabaseTable<RecordLike<City>, RecordLike<CityInsert>, RecordLike<CityUpdate>>;
      wishlist_items: SupabaseTable<
        RecordLike<WishlistItem>,
        RecordLike<WishlistItemInsert>,
        RecordLike<WishlistItemUpdate>
      >;
      trips: SupabaseTable<RecordLike<Trip>, RecordLike<TripInsert>, RecordLike<TripUpdate>>;
      trip_days: SupabaseTable<RecordLike<TripDay>, RecordLike<TripDayInsert>, RecordLike<TripDayUpdate>>;
      trip_tasks: SupabaseTable<RecordLike<TripTask>, RecordLike<TripTaskInsert>, RecordLike<TripTaskUpdate>>;
      shares: SupabaseTable<
        RecordLike<Share>,
        RecordLike<ShareInsert>,
        RecordLike<Partial<Omit<Share, 'id' | 'user_id' | 'created_at'>>>
      >;
    };
    Views: Record<string, any> & { [_ in never]: never };
    Functions: Record<string, any> & { [_ in never]: never };
    CompositeTypes: Record<string, any> & { [_ in never]: never };
    Enums: {
      trip_type: 'leisure' | 'business' | 'transit';
      trip_status: 'planning' | 'ongoing' | 'completed';
      share_type: 'all' | 'trip';
    };
  };
}

// ============================================================================
// 辅助类型
// ============================================================================

/**
 * 从数据库表中提取 Row 类型
 */
export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/**
 * 从数据库表中提取 Insert 类型
 */
export type TableInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/**
 * 从数据库表中提取 Update 类型
 */
export type TableUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
