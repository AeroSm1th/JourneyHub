/**
 * 城市记录 API 封装
 *
 * 封装所有与城市记录相关的 Supabase 数据库操作
 * 包括 CRUD 操作和搜索功能
 */

import { supabase } from '@/services/supabase/client';
import type { City, CityInsert } from '@/types/database';
import type { CitySearchParams } from '@/types/entities';

/**
 * 获取当前用户的所有城市记录
 * 按访问日期降序排序
 *
 * @returns Promise<City[]> 城市记录数组
 * @throws Error 如果查询失败
 */
export const getAll = async (): Promise<City[]> => {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('visited_at', { ascending: false });

  if (error) {
    throw new Error(`获取城市列表失败: ${error.message}`);
  }

  return data || [];
};

/**
 * 根据 ID 获取单个城市记录
 *
 * @param id - 城市记录 ID
 * @returns Promise<City> 城市记录
 * @throws Error 如果查询失败或记录不存在
 */
export const getById = async (id: string): Promise<City> => {
  const { data, error } = await supabase.from('cities').select('*').eq('id', id).single();

  if (error) {
    throw new Error(`获取城市详情失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('城市记录不存在');
  }

  return data;
};

/**
 * 创建新的城市记录
 *
 * @param cityData - 城市记录数据（不包含 id, created_at, updated_at）
 * @returns Promise<City> 创建的城市记录
 * @throws Error 如果创建失败
 */
export const create = async (cityData: CityInsert): Promise<City> => {
  const { data, error } = await supabase.from('cities').insert(cityData).select().single();

  if (error) {
    throw new Error(`创建城市记录失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('创建城市记录失败：未返回数据');
  }

  return data;
};

/**
 * 更新城市记录
 *
 * @param id - 城市记录 ID
 * @param updates - 要更新的字段
 * @returns Promise<City> 更新后的城市记录
 * @throws Error 如果更新失败
 */
export const update = async (id: string, updates: Partial<CityInsert>): Promise<City> => {
  const { data, error } = await supabase
    .from('cities')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`更新城市记录失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('更新城市记录失败：未返回数据');
  }

  return data;
};

/**
 * 删除城市记录
 *
 * @param id - 城市记录 ID
 * @returns Promise<void>
 * @throws Error 如果删除失败
 */
export const deleteCity = async (id: string): Promise<void> => {
  const { error } = await supabase.from('cities').delete().eq('id', id);

  if (error) {
    throw new Error(`删除城市记录失败: ${error.message}`);
  }
};

/**
 * 搜索城市记录
 * 支持按城市名称、国家名称、大洲、旅行类型等筛选
 *
 * @param params - 搜索参数
 * @returns Promise<City[]> 匹配的城市记录数组
 * @throws Error 如果搜索失败
 */
export const search = async (params: CitySearchParams): Promise<City[]> => {
  let query = supabase.from('cities').select('*');

  // 文本搜索（城市名称或国家名称）
  if (params.query) {
    query = query.or(`city_name.ilike.%${params.query}%,country_name.ilike.%${params.query}%`);
  }

  // 大洲筛选
  if (params.continent) {
    query = query.eq('continent', params.continent);
  }

  // 国家筛选
  if (params.country) {
    query = query.eq('country_name', params.country);
  }

  // 旅行类型筛选
  if (params.tripType) {
    query = query.eq('trip_type', params.tripType);
  }

  // 评分筛选
  if (params.rating !== undefined) {
    query = query.gte('rating', params.rating);
  }

  // 标签筛选
  if (params.tags && params.tags.length > 0) {
    query = query.contains('tags', params.tags);
  }

  // 日期范围筛选
  if (params.startDate) {
    query = query.gte('visited_at', params.startDate);
  }
  if (params.endDate) {
    query = query.lte('visited_at', params.endDate);
  }

  // 收藏筛选
  if (params.isFavorite !== undefined) {
    query = query.eq('is_favorite', params.isFavorite);
  }

  // 按访问日期降序排序
  query = query.order('visited_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw new Error(`搜索城市记录失败: ${error.message}`);
  }

  return data || [];
};

/**
 * 获取所有唯一的国家列表
 *
 * @returns Promise<string[]> 国家名称数组
 * @throws Error 如果查询失败
 */
export const getUniqueCountries = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('cities')
    .select('country_name')
    .order('country_name');

  if (error) {
    throw new Error(`获取国家列表失败: ${error.message}`);
  }

  // 去重
  const uniqueCountries = Array.from(new Set(data?.map((item) => item.country_name) || []));

  return uniqueCountries;
};

/**
 * 获取所有唯一的大洲列表
 *
 * @returns Promise<string[]> 大洲名称数组
 * @throws Error 如果查询失败
 */
export const getUniqueContinents = async (): Promise<string[]> => {
  const { data, error } = await supabase.from('cities').select('continent').order('continent');

  if (error) {
    throw new Error(`获取大洲列表失败: ${error.message}`);
  }

  // 去重
  const uniqueContinents = Array.from(new Set(data?.map((item) => item.continent) || []));

  return uniqueContinents;
};

/**
 * 获取所有唯一的标签列表
 *
 * @returns Promise<string[]> 标签数组
 * @throws Error 如果查询失败
 */
export const getUniqueTags = async (): Promise<string[]> => {
  const { data, error } = await supabase.from('cities').select('tags');

  if (error) {
    throw new Error(`获取标签列表失败: ${error.message}`);
  }

  // 展平并去重所有标签
  const allTags = data?.flatMap((item) => item.tags || []) || [];
  const uniqueTags = Array.from(new Set(allTags));

  return uniqueTags.sort();
};

/**
 * 切换城市的收藏状态
 *
 * @param id - 城市记录 ID
 * @param isFavorite - 新的收藏状态
 * @returns Promise<City> 更新后的城市记录
 * @throws Error 如果更新失败
 */
export const toggleFavorite = async (id: string, isFavorite: boolean): Promise<City> => {
  return update(id, { is_favorite: isFavorite });
};

/**
 * 批量删除城市记录
 *
 * @param ids - 城市记录 ID 数组
 * @returns Promise<void>
 * @throws Error 如果删除失败
 */
export const batchDelete = async (ids: string[]): Promise<void> => {
  const { error } = await supabase.from('cities').delete().in('id', ids);

  if (error) {
    throw new Error(`批量删除城市记录失败: ${error.message}`);
  }
};

/**
 * 获取城市记录总数
 *
 * @returns Promise<number> 城市记录总数
 * @throws Error 如果查询失败
 */
export const getCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('cities')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw new Error(`获取城市记录总数失败: ${error.message}`);
  }

  return count || 0;
};

/**
 * 导出所有城市 API 函数
 */
export const citiesApi = {
  getAll,
  getById,
  create,
  update,
  delete: deleteCity,
  search,
  getUniqueCountries,
  getUniqueContinents,
  getUniqueTags,
  toggleFavorite,
  batchDelete,
  getCount,
};
