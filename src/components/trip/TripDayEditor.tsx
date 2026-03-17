/**
 * 行程日程编辑组件
 *
 * 功能：
 * - 根据行程开始和结束日期自动生成天数
 * - 每天显示日期、可编辑的标题和备注
 * - 支持内联编辑（点击编辑标题/备注）
 * - 自动创建或更新日程记录
 *
 * 验证需求: 5.4
 */

import { useState, useMemo, useCallback } from 'react';
import { useTripDays } from '@/features/trips/hooks/useTripDays';
import { useCreateTripDay } from '@/features/trips/hooks/useCreateTripDay';
import { useUpdateTripDay } from '@/features/trips/hooks/useUpdateTripDay';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/common/Button';
import type { TripDay } from '@/types/database';
import './TripDayEditor.css';

interface TripDayEditorProps {
  /** 行程 ID */
  tripId: string;
  /** 行程开始日期（YYYY-MM-DD 格式） */
  startDate: string;
  /** 行程结束日期（YYYY-MM-DD 格式） */
  endDate: string;
}

/** 生成的日程条目（可能尚未持久化） */
interface DayEntry {
  dayIndex: number;
  date: string;
  /** 已持久化的日程记录（如果存在） */
  existing?: TripDay;
}

/** 正在编辑的字段标识 */
interface EditingField {
  dayIndex: number;
  field: 'title' | 'notes';
}

/** 格式化日期为中文显示 */
const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(dateString));
};

/**
 * 根据开始和结束日期生成日程条目列表
 */
function generateDayEntries(
  startDate: string,
  endDate: string,
  existingDays: TripDay[]
): DayEntry[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const entries: DayEntry[] = [];

  // 按 day_index 建立已有日程的映射
  const existingMap = new Map<number, TripDay>();
  for (const day of existingDays) {
    existingMap.set(day.day_index, day);
  }

  let dayIndex = 1;
  const current = new Date(start);
  while (current <= end) {
    entries.push({
      dayIndex,
      date: current.toISOString().split('T')[0],
      existing: existingMap.get(dayIndex),
    });
    current.setDate(current.getDate() + 1);
    dayIndex++;
  }

  return entries;
}

/**
 * 行程日程编辑组件
 */
export function TripDayEditor({ tripId, startDate, endDate }: TripDayEditorProps) {
  const { data: existingDays, isLoading, error } = useTripDays(tripId);
  const createDay = useCreateTripDay();
  const updateDay = useUpdateTripDay();

  // 当前正在编辑的字段
  const [editing, setEditing] = useState<EditingField | null>(null);
  // 编辑中的临时值
  const [editValue, setEditValue] = useState('');

  // 根据日期范围生成日程条目
  const days: TripDay[] = (existingDays as TripDay[] | undefined) ?? [];
  const dayEntries = useMemo(() => {
    return generateDayEntries(startDate, endDate, days);
  }, [startDate, endDate, days]);

  /** 开始编辑某个字段 */
  const handleStartEdit = useCallback(
    (dayIndex: number, field: 'title' | 'notes', currentValue: string) => {
      setEditing({ dayIndex, field });
      setEditValue(currentValue);
    },
    []
  );

  /** 取消编辑 */
  const handleCancelEdit = useCallback(() => {
    setEditing(null);
    setEditValue('');
  }, []);

  /** 保存编辑 */
  const handleSaveEdit = useCallback(
    async (entry: DayEntry) => {
      if (!editing) return;

      const trimmedValue = editValue.trim();

      if (entry.existing) {
        // 更新已有日程
        await updateDay.mutateAsync({
          id: entry.existing.id,
          tripId,
          updates: { [editing.field]: trimmedValue || undefined },
        });
      } else {
        // 创建新日程
        await createDay.mutateAsync({
          trip_id: tripId,
          day_index: entry.dayIndex,
          date: entry.date,
          [editing.field]: trimmedValue || undefined,
        });
      }

      setEditing(null);
      setEditValue('');
    },
    [editing, editValue, tripId, updateDay, createDay]
  );

  // 加载状态
  if (isLoading) {
    return (
      <div className="trip-day-editor">
        <Spinner size="md" centered />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="trip-day-editor">
        <div className="trip-day-editor__error">
          <p>加载日程失败: {error.message}</p>
        </div>
      </div>
    );
  }

  // 无日程（日期范围无效）
  if (dayEntries.length === 0) {
    return (
      <div className="trip-day-editor">
        <p className="trip-day-editor__empty">日期范围无效，无法生成日程</p>
      </div>
    );
  }

  const isSaving = createDay.isPending || updateDay.isPending;

  return (
    <div className="trip-day-editor">
      <div className="trip-day-editor__header">
        <h3 className="trip-day-editor__title">📋 日程安排</h3>
        <span className="trip-day-editor__count">共 {dayEntries.length} 天</span>
      </div>

      <ul className="trip-day-editor__list">
        {dayEntries.map((entry) => {
          const title = entry.existing?.title ?? '';
          const notes = entry.existing?.notes ?? '';
          const isEditingTitle = editing?.dayIndex === entry.dayIndex && editing.field === 'title';
          const isEditingNotes = editing?.dayIndex === entry.dayIndex && editing.field === 'notes';

          return (
            <li key={entry.dayIndex} className="trip-day-editor__item">
              {/* 日程头部：天数和日期 */}
              <div className="trip-day-editor__item-header">
                <span className="trip-day-editor__day-index">第 {entry.dayIndex} 天</span>
                <time className="trip-day-editor__date">{formatDate(entry.date)}</time>
              </div>

              {/* 标题字段 */}
              <div className="trip-day-editor__field">
                {isEditingTitle ? (
                  <div className="trip-day-editor__edit-row">
                    <input
                      className="trip-day-editor__input"
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="输入当天标题..."
                      maxLength={200}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(entry);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      disabled={isSaving}
                    />
                    <div className="trip-day-editor__edit-actions">
                      <Button size="sm" onClick={() => handleSaveEdit(entry)} loading={isSaving}>
                        保存
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="trip-day-editor__editable"
                    onClick={() => handleStartEdit(entry.dayIndex, 'title', title)}
                    title="点击编辑标题"
                  >
                    {title || <span className="trip-day-editor__placeholder">点击添加标题...</span>}
                  </button>
                )}
              </div>

              {/* 备注字段 */}
              <div className="trip-day-editor__field">
                {isEditingNotes ? (
                  <div className="trip-day-editor__edit-row">
                    <textarea
                      className="trip-day-editor__textarea"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="输入当天备注..."
                      maxLength={2000}
                      rows={3}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      disabled={isSaving}
                    />
                    <div className="trip-day-editor__edit-actions">
                      <Button size="sm" onClick={() => handleSaveEdit(entry)} loading={isSaving}>
                        保存
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="trip-day-editor__editable trip-day-editor__editable--notes"
                    onClick={() => handleStartEdit(entry.dayIndex, 'notes', notes)}
                    title="点击编辑备注"
                  >
                    {notes || <span className="trip-day-editor__placeholder">点击添加备注...</span>}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
