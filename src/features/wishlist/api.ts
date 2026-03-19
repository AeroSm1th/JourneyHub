/**
 * 愿望清单 API 封装
 *
 * 封装所有与愿望清单相关的 Supabase 数据库操作
 * 包括 CRUD 操作
 */

import { supabase } from '@/services/supabase/client';
import type { WishlistItem, WishlistItemInsert, WishlistItemUpdate } from '@/types/database';

/**
 * 获取当前用户的所有愿望清单项目
 * 按优先级降序排序（高优先级在前）
 *
 * @returns Promise<WishlistItem[]> 愿望清单数组
 * @throws Error 如果查询失败
 */
export const getAll = async (): Promise<WishlistItem[]> => {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .order('priority', { ascending: false });

  if (error) {
    throw new Error(`获取愿望清单失败: ${error.message}`);
  }

  return (data as WishlistItem[] | null) || [];
};

/**
 * 根据 ID 获取单个愿望清单项目
 *
 * @param id - 愿望清单项目 ID
 * @returns Promise<WishlistItem> 愿望清单项目
 * @throws Error 如果查询失败或记录不存在
 */
export const getById = async (id: string): Promise<WishlistItem> => {
  const { data, error } = await supabase.from('wishlist_items').select('*').eq('id', id).single();

  if (error) {
    throw new Error(`获取愿望清单详情失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('愿望清单项目不存在');
  }

  return data as WishlistItem;
};

/**
 * 创建新的愿望清单项目
 *
 * @param itemData - 愿望清单数据（不包含 id, created_at）
 * @returns Promise<WishlistItem> 创建的愿望清单项目
 * @throws Error 如果创建失败
 */
export const create = async (itemData: WishlistItemInsert): Promise<WishlistItem> => {
  const { data, error } = await supabase.from('wishlist_items').insert(itemData).select().single();

  if (error) {
    throw new Error(`创建愿望清单项目失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('创建愿望清单项目失败：未返回数据');
  }

  return data as WishlistItem;
};

/**
 * 更新愿望清单项目
 *
 * @param id - 愿望清单项目 ID
 * @param updates - 要更新的字段
 * @returns Promise<WishlistItem> 更新后的愿望清单项目
 * @throws Error 如果更新失败
 */
export const update = async (id: string, updates: WishlistItemUpdate): Promise<WishlistItem> => {
  const { data, error } = await supabase
    .from('wishlist_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`更新愿望清单项目失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('更新愿望清单项目失败：未返回数据');
  }

  return data as WishlistItem;
};

/**
 * 删除愿望清单项目
 *
 * @param id - 愿望清单项目 ID
 * @returns Promise<void>
 * @throws Error 如果删除失败
 */
export const deleteItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from('wishlist_items').delete().eq('id', id);

  if (error) {
    throw new Error(`删除愿望清单项目失败: ${error.message}`);
  }
};

/**
 * 导出所有愿望清单 API 函数
 */
export const wishlistApi = {
  getAll,
  getById,
  create,
  update,
  delete: deleteItem,
};
