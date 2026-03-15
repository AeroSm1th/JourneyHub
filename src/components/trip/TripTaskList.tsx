/**
 * 行程待办事项列表组件
 *
 * 功能：
 * - 显示行程的待办事项列表
 * - 支持添加新待办事项
 * - 支持内联编辑待办事项内容
 * - 支持删除待办事项
 * - 支持通过复选框标记完成/未完成
 * - 已完成事项显示删除线
 * - 显示完成进度（已完成/总数）
 * - 可选按 dayId 过滤
 *
 * 验证需求: 5.6
 */

import { useState, useCallback, useMemo } from 'react';
import { useTripTasks } from '@/features/trips/hooks/useTripTasks';
import { useCreateTripTask } from '@/features/trips/hooks/useCreateTripTask';
import { useUpdateTripTask } from '@/features/trips/hooks/useUpdateTripTask';
import { useDeleteTripTask } from '@/features/trips/hooks/useDeleteTripTask';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/common/Button';
import type { TripTask } from '@/types/database';
import './TripTaskList.css';

interface TripTaskListProps {
  /** 行程 ID */
  tripId: string;
  /** 可选的日程 ID，用于过滤特定日期的待办事项 */
  dayId?: string;
}

/**
 * 行程待办事项列表组件
 */
export function TripTaskList({ tripId, dayId }: TripTaskListProps) {
  const { data: allTasks, isLoading, error } = useTripTasks(tripId);
  const createTask = useCreateTripTask();
  const updateTask = useUpdateTripTask();
  const deleteTask = useDeleteTripTask();

  // 新增待办事项的输入值
  const [newContent, setNewContent] = useState('');
  // 正在编辑的待办事项 ID
  const [editingId, setEditingId] = useState<string | null>(null);
  // 编辑中的临时值
  const [editValue, setEditValue] = useState('');

  // 按 dayId 过滤待办事项
  const tasks = useMemo(() => {
    const list = (allTasks as TripTask[] | undefined) ?? [];
    if (dayId) {
      return list.filter((task) => task.day_id === dayId);
    }
    return list;
  }, [allTasks, dayId]);

  // 完成统计
  const doneCount = useMemo(() => tasks.filter((t) => t.is_done).length, [tasks]);

  /** 添加新待办事项 */
  const handleAdd = useCallback(async () => {
    const trimmed = newContent.trim();
    if (!trimmed) return;

    await createTask.mutateAsync({
      trip_id: tripId,
      content: trimmed,
      is_done: false,
      ...(dayId ? { day_id: dayId } : {}),
    });
    setNewContent('');
  }, [newContent, tripId, dayId, createTask]);

  /** 切换完成状态 */
  const handleToggle = useCallback(
    (task: TripTask) => {
      updateTask.mutate({
        id: task.id,
        tripId,
        updates: { is_done: !task.is_done },
      });
    },
    [tripId, updateTask]
  );

  /** 开始编辑 */
  const handleStartEdit = useCallback((task: TripTask) => {
    setEditingId(task.id);
    setEditValue(task.content);
  }, []);

  /** 取消编辑 */
  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValue('');
  }, []);

  /** 保存编辑 */
  const handleSaveEdit = useCallback(
    async (taskId: string) => {
      const trimmed = editValue.trim();
      if (!trimmed) {
        handleCancelEdit();
        return;
      }

      await updateTask.mutateAsync({
        id: taskId,
        tripId,
        updates: { content: trimmed },
      });
      setEditingId(null);
      setEditValue('');
    },
    [editValue, tripId, updateTask, handleCancelEdit]
  );

  /** 删除待办事项 */
  const handleDelete = useCallback(
    (taskId: string) => {
      deleteTask.mutate({ id: taskId, tripId });
    },
    [tripId, deleteTask]
  );

  const isSaving = createTask.isPending || updateTask.isPending || deleteTask.isPending;

  // 加载状态
  if (isLoading) {
    return (
      <div className="trip-task-list">
        <Spinner size="md" centered />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="trip-task-list">
        <div className="trip-task-list__error">
          <p>加载待办事项失败: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trip-task-list">
      <div className="trip-task-list__header">
        <h3 className="trip-task-list__title">✅ 待办事项</h3>
        <span className="trip-task-list__count">
          {doneCount}/{tasks.length} 已完成
        </span>
      </div>

      {/* 添加待办事项 */}
      <div className="trip-task-list__add-form">
        <input
          className="trip-task-list__add-input"
          type="text"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="添加新的待办事项..."
          maxLength={500}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          disabled={isSaving}
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!newContent.trim()}
          loading={createTask.isPending}
        >
          添加
        </Button>
      </div>

      {/* 待办事项列表 */}
      {tasks.length === 0 ? (
        <p className="trip-task-list__empty">暂无待办事项</p>
      ) : (
        <ul className="trip-task-list__items">
          {tasks.map((task) => {
            const isEditing = editingId === task.id;

            return (
              <li key={task.id} className="trip-task-list__item">
                {/* 复选框 */}
                <input
                  type="checkbox"
                  className="trip-task-list__checkbox"
                  checked={task.is_done}
                  onChange={() => handleToggle(task)}
                  aria-label={`标记 "${task.content}" 为${task.is_done ? '未完成' : '已完成'}`}
                />

                {/* 内容：编辑模式或显示模式 */}
                {isEditing ? (
                  <input
                    className="trip-task-list__edit-input"
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    maxLength={500}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(task.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    onBlur={() => handleSaveEdit(task.id)}
                    disabled={updateTask.isPending}
                  />
                ) : (
                  <span
                    className={`trip-task-list__content${task.is_done ? ' trip-task-list__content--done' : ''}`}
                    onClick={() => handleStartEdit(task)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleStartEdit(task);
                    }}
                  >
                    {task.content}
                  </span>
                )}

                {/* 删除按钮 */}
                {!isEditing && (
                  <div className="trip-task-list__actions">
                    <button
                      className="trip-task-list__delete-btn"
                      onClick={() => handleDelete(task.id)}
                      aria-label={`删除 "${task.content}"`}
                      title="删除"
                    >
                      ×
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
