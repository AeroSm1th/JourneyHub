/**
 * 个人资料 API 封装
 *
 * 封装所有与用户个人资料相关的 Supabase 数据库操作
 * 包括获取资料、更新昵称、上传头像、删除账户、导出数据
 */

import { supabase } from '@/services/supabase/client';
import type { User } from '@/types/database';
import { extractStoragePath } from '@/utils/storage';

// ============================================================================
// 个人资料 API 函数
// ============================================================================

/**
 * 获取用户个人资料
 *
 * @param userId - 用户 ID
 * @returns 用户资料信息
 * @throws Error 如果查询失败或用户不存在
 */
export async function getProfile(userId: string): Promise<User> {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

  if (error) {
    throw new Error(`获取用户资料失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('用户不存在');
  }

  return data as User;
}

/**
 * 更新用户资料（昵称等）
 *
 * @param userId - 用户 ID
 * @param data - 要更新的字段
 * @returns 更新后的用户资料
 * @throws Error 如果更新失败
 */
export async function updateProfile(userId: string, data: { nickname?: string }): Promise<User> {
  const { data: updated, error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`更新用户资料失败: ${error.message}`);
  }

  if (!updated) {
    throw new Error('更新用户资料失败：未返回数据');
  }

  return updated as User;
}

/**
 * 上传用户头像到 Supabase Storage
 * 上传新头像前会删除旧头像文件
 *
 * @param userId - 用户 ID
 * @param file - 头像文件
 * @returns 头像的公开访问 URL
 * @throws Error 如果上传失败
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  // 先获取当前头像 URL，用于后续删除旧文件
  const { data: currentUser } = await supabase
    .from('users')
    .select('avatar_url')
    .eq('id', userId)
    .single();

  const oldAvatarUrl = currentUser?.avatar_url;

  // 生成唯一文件路径，使用时间戳避免缓存问题
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

  // 上传文件到 user-avatars 存储桶
  const { error: uploadError } = await supabase.storage
    .from('user-avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`上传头像失败: ${uploadError.message}`);
  }

  // 删除旧头像文件（不阻塞，失败仅打印日志）
  if (oldAvatarUrl) {
    const oldPath = extractStoragePath(oldAvatarUrl, 'user-avatars');
    if (oldPath) {
      const { error: removeError } = await supabase.storage.from('user-avatars').remove([oldPath]);
      if (removeError) {
        console.error('[profile] 删除旧头像失败:', removeError.message);
      }
    }
  }

  // 获取公开访问 URL
  const { data: urlData } = supabase.storage.from('user-avatars').getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * 更新用户头像 URL
 *
 * @param userId - 用户 ID
 * @param avatarUrl - 头像公开访问 URL
 * @returns 更新后的用户资料
 * @throws Error 如果更新失败
 */
export async function updateAvatar(userId: string, avatarUrl: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`更新头像失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('更新头像失败：未返回数据');
  }

  return data as User;
}

/**
 * 清空用户所有业务数据（保留账户）
 * 删除所有城市记录、愿望清单、行程、分享链接，以及 Storage 中的图片和头像
 *
 * @param userId - 用户 ID
 * @throws Error 如果清空失败
 */
export async function clearAllData(userId: string): Promise<void> {
  // ---- 清理 Storage 文件 ----

  // 清理用户目录下所有头像文件
  const { data: avatarFiles } = await supabase.storage.from('user-avatars').list(userId);

  if (avatarFiles && avatarFiles.length > 0) {
    const paths = avatarFiles.map((f) => `${userId}/${f.name}`);
    const { error } = await supabase.storage.from('user-avatars').remove(paths);
    if (error) console.error('[clearAllData] 清理头像失败:', error.message);
  }

  // 清理用户目录下所有城市图片文件
  const { data: cityFiles } = await supabase.storage.from('city-images').list(userId);

  if (cityFiles && cityFiles.length > 0) {
    const paths = cityFiles.map((f) => `${userId}/${f.name}`);
    const { error } = await supabase.storage.from('city-images').remove(paths);
    if (error) console.error('[clearAllData] 清理城市图片失败:', error.message);
  }

  // ---- 清理数据库业务数据 ----

  // 获取行程 ID
  const { data: trips } = await supabase.from('trips').select('id').eq('user_id', userId);

  const tripIds = ((trips as Array<{ id: string }> | null) || []).map((t) => t.id);

  // 删除行程子表
  if (tripIds.length > 0) {
    await supabase.from('trip_tasks').delete().in('trip_id', tripIds);
    await supabase.from('trip_days').delete().in('trip_id', tripIds);
  }

  // 删除业务数据
  await supabase.from('trips').delete().eq('user_id', userId);
  await supabase.from('shares').delete().eq('user_id', userId);
  await supabase.from('wishlist_items').delete().eq('user_id', userId);
  await supabase.from('cities').delete().eq('user_id', userId);

  // 清除用户头像 URL（保留用户记录）
  await supabase.from('users').update({ avatar_url: null, nickname: null }).eq('id', userId);
}

/**
 * 导出用户所有数据为 JSON 格式
 *
 * @param userId - 用户 ID
 * @returns 包含用户所有数据的 JSON 对象
 * @throws Error 如果导出失败
 */
export async function exportUserData(userId: string): Promise<Record<string, unknown>> {
  // 获取用户资料
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    throw new Error(`导出用户资料失败: ${profileError.message}`);
  }

  // 获取城市记录
  const { data: cities, error: citiesError } = await supabase
    .from('cities')
    .select('*')
    .eq('user_id', userId);

  if (citiesError) {
    throw new Error(`导出城市记录失败: ${citiesError.message}`);
  }

  // 获取愿望清单
  const { data: wishlist, error: wishlistError } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('user_id', userId);

  if (wishlistError) {
    throw new Error(`导出愿望清单失败: ${wishlistError.message}`);
  }

  // 获取行程（包含日程和待办）
  const { data: trips, error: tripsError } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId);

  if (tripsError) {
    throw new Error(`导出行程失败: ${tripsError.message}`);
  }

  const tripIds = ((trips as Array<{ id: string }> | null) || []).map((t) => t.id);

  let tripDays: unknown[] = [];
  let tripTasks: unknown[] = [];

  if (tripIds.length > 0) {
    const { data: days, error: daysError } = await supabase
      .from('trip_days')
      .select('*')
      .in('trip_id', tripIds);

    if (daysError) {
      throw new Error(`导出行程日程失败: ${daysError.message}`);
    }
    tripDays = days || [];

    const { data: tasks, error: tasksError } = await supabase
      .from('trip_tasks')
      .select('*')
      .in('trip_id', tripIds);

    if (tasksError) {
      throw new Error(`导出行程待办失败: ${tasksError.message}`);
    }
    tripTasks = tasks || [];
  }

  // 获取分享链接
  const { data: shares, error: sharesError } = await supabase
    .from('shares')
    .select('*')
    .eq('user_id', userId);

  if (sharesError) {
    throw new Error(`导出分享链接失败: ${sharesError.message}`);
  }

  return {
    exportedAt: new Date().toISOString(),
    profile,
    cities: cities || [],
    wishlist: wishlist || [],
    trips: trips || [],
    tripDays,
    tripTasks,
    shares: shares || [],
  };
}
