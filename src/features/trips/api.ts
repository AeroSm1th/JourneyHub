/**
 * 行程 API 封装
 *
 * 封装所有与行程相关的 Supabase 数据库操作
 * 包括行程、行程日程、待办事项的 CRUD 操作
 */

import { supabase } from '@/services/supabase/client';
import type {
  Trip,
  TripInsert,
  TripUpdate,
  TripDay,
  TripDayInsert,
  TripDayUpdate,
  TripTask,
  TripTaskInsert,
  TripTaskUpdate,
} from '@/types/database';

// ============================================================================
// 行程详情类型（含关联数据）
// ============================================================================

/**
 * 包含日程和待办事项的行程详情
 */
export interface TripWithRelations extends Trip {
  trip_days: TripDay[];
  trip_tasks: TripTask[];
}

// ============================================================================
// 行程 CRUD 操作
// ============================================================================

/**
 * 获取当前用户的所有行程
 * 按创建时间降序排序
 *
 * @returns Promise<Trip[]> 行程数组
 * @throws Error 如果查询失败
 */
const getAll = async (): Promise<Trip[]> => {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`获取行程列表失败: ${error.message}`);
  }

  return (data as Trip[] | null) || [];
};

/**
 * 根据 ID 获取单个行程（含关联的日程和待办事项）
 *
 * @param id - 行程 ID
 * @returns Promise<TripWithRelations> 行程详情（含 trip_days 和 trip_tasks）
 * @throws Error 如果查询失败或记录不存在
 */
const getById = async (id: string): Promise<TripWithRelations> => {
  const { data, error } = await supabase
    .from('trips')
    .select('*, trip_days(*), trip_tasks(*)')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`获取行程详情失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('行程不存在');
  }

  return data as unknown as TripWithRelations;
};

/**
 * 创建新行程
 *
 * @param tripData - 行程数据（不包含 id, created_at, updated_at）
 * @returns Promise<Trip> 创建的行程
 * @throws Error 如果创建失败
 */
const create = async (tripData: TripInsert): Promise<Trip> => {
  const { data, error } = await supabase.from('trips').insert(tripData).select().single();

  if (error) {
    throw new Error(`创建行程失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('创建行程失败：未返回数据');
  }

  return data as Trip;
};

/**
 * 更新行程
 *
 * @param id - 行程 ID
 * @param updates - 要更新的字段
 * @returns Promise<Trip> 更新后的行程
 * @throws Error 如果更新失败
 */
const update = async (id: string, updates: TripUpdate): Promise<Trip> => {
  const { data, error } = await supabase
    .from('trips')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`更新行程失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('更新行程失败：未返回数据');
  }

  return data as Trip;
};

/**
 * 删除行程（级联删除关联的日程和待办事项）
 *
 * @param id - 行程 ID
 * @returns Promise<void>
 * @throws Error 如果删除失败
 */
const deleteTrip = async (id: string): Promise<void> => {
  const { error } = await supabase.from('trips').delete().eq('id', id);

  if (error) {
    throw new Error(`删除行程失败: ${error.message}`);
  }
};

// ============================================================================
// 行程日程 CRUD 操作
// ============================================================================

/**
 * 获取指定行程的所有日程
 * 按 day_index 升序排序
 *
 * @param tripId - 行程 ID
 * @returns Promise<TripDay[]> 日程数组
 * @throws Error 如果查询失败
 */
const getDaysByTripId = async (tripId: string): Promise<TripDay[]> => {
  const { data, error } = await supabase
    .from('trip_days')
    .select('*')
    .eq('trip_id', tripId)
    .order('day_index', { ascending: true });

  if (error) {
    throw new Error(`获取行程日程失败: ${error.message}`);
  }

  return (data as TripDay[] | null) || [];
};

/**
 * 创建行程日程
 *
 * @param dayData - 日程数据
 * @returns Promise<TripDay> 创建的日程
 * @throws Error 如果创建失败
 */
const createDay = async (dayData: TripDayInsert): Promise<TripDay> => {
  const { data, error } = await supabase.from('trip_days').insert(dayData).select().single();

  if (error) {
    throw new Error(`创建行程日程失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('创建行程日程失败：未返回数据');
  }

  return data as TripDay;
};

/**
 * 更新行程日程
 *
 * @param id - 日程 ID
 * @param updates - 要更新的字段
 * @returns Promise<TripDay> 更新后的日程
 * @throws Error 如果更新失败
 */
const updateDay = async (id: string, updates: TripDayUpdate): Promise<TripDay> => {
  const { data, error } = await supabase
    .from('trip_days')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`更新行程日程失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('更新行程日程失败：未返回数据');
  }

  return data as TripDay;
};

/**
 * 删除行程日程
 *
 * @param id - 日程 ID
 * @returns Promise<void>
 * @throws Error 如果删除失败
 */
const deleteDay = async (id: string): Promise<void> => {
  const { error } = await supabase.from('trip_days').delete().eq('id', id);

  if (error) {
    throw new Error(`删除行程日程失败: ${error.message}`);
  }
};

// ============================================================================
// 行程待办事项 CRUD 操作
// ============================================================================

/**
 * 获取指定行程的所有待办事项
 * 按创建时间升序排序
 *
 * @param tripId - 行程 ID
 * @returns Promise<TripTask[]> 待办事项数组
 * @throws Error 如果查询失败
 */
const getTasksByTripId = async (tripId: string): Promise<TripTask[]> => {
  const { data, error } = await supabase
    .from('trip_tasks')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`获取待办事项失败: ${error.message}`);
  }

  return (data as TripTask[] | null) || [];
};

/**
 * 创建待办事项
 *
 * @param taskData - 待办事项数据
 * @returns Promise<TripTask> 创建的待办事项
 * @throws Error 如果创建失败
 */
const createTask = async (taskData: TripTaskInsert): Promise<TripTask> => {
  const { data, error } = await supabase.from('trip_tasks').insert(taskData).select().single();

  if (error) {
    throw new Error(`创建待办事项失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('创建待办事项失败：未返回数据');
  }

  return data as TripTask;
};

/**
 * 更新待办事项（含标记完成）
 *
 * @param id - 待办事项 ID
 * @param updates - 要更新的字段
 * @returns Promise<TripTask> 更新后的待办事项
 * @throws Error 如果更新失败
 */
const updateTask = async (id: string, updates: TripTaskUpdate): Promise<TripTask> => {
  const { data, error } = await supabase
    .from('trip_tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`更新待办事项失败: ${error.message}`);
  }

  if (!data) {
    throw new Error('更新待办事项失败：未返回数据');
  }

  return data as TripTask;
};

/**
 * 删除待办事项
 *
 * @param id - 待办事项 ID
 * @returns Promise<void>
 * @throws Error 如果删除失败
 */
const deleteTask = async (id: string): Promise<void> => {
  const { error } = await supabase.from('trip_tasks').delete().eq('id', id);

  if (error) {
    throw new Error(`删除待办事项失败: ${error.message}`);
  }
};

// ============================================================================
// 导出 API 对象
// ============================================================================

/**
 * 行程 CRUD API
 */
export const tripsApi = {
  getAll,
  getById,
  create,
  update,
  delete: deleteTrip,
};

/**
 * 行程日程 CRUD API
 */
export const tripDaysApi = {
  getByTripId: getDaysByTripId,
  create: createDay,
  update: updateDay,
  delete: deleteDay,
};

/**
 * 行程待办事项 CRUD API
 */
export const tripTasksApi = {
  getByTripId: getTasksByTripId,
  create: createTask,
  update: updateTask,
  delete: deleteTask,
};
