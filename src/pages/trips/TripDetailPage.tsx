/**
 * 行程详情页面
 *
 * 默认只读展示行程完整信息；点击"编辑"按钮后进入编辑模式，
 * 所有字段变为可编辑，统一保存或取消。
 * 日程安排和待办事项始终可交互。
 *
 * 验证需求: 5.7
 */

import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { BackButton } from '@/components/common/BackButton';
import { useTrip } from '@/features/trips/hooks/useTrip';
import { useUpdateTrip } from '@/features/trips/hooks/useUpdateTrip';
import { useDeleteTrip } from '@/features/trips/hooks/useDeleteTrip';
import { useUpdateTripTask } from '@/features/trips/hooks/useUpdateTripTask';
import { computeTripStatus } from '@/components/trip/TripList';
import { TripTaskList } from '@/components/trip/TripTaskList';
import { TripDayEditor } from '@/components/trip/TripDayEditor';
import { TripTimeline } from '@/components/trip/TripTimeline';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TripStatus } from '@/types/entities';
import type { TripWithRelations } from '@/features/trips/api';
import type { TripDay, TripTask } from '@/types/database';
import './TripDetailPage.css';

/** 状态标签中文映射 */
const STATUS_LABELS: Record<TripStatus, string> = {
  [TripStatus.Planning]: '计划中',
  [TripStatus.Ongoing]: '进行中',
  [TripStatus.Completed]: '已完成',
};

/** 编辑表单数据 */
interface EditFormData {
  title: string;
  start_date: string;
  end_date: string;
  budget: string;
  transportation: string;
  accommodation: string;
  notes: string;
}

/** 格式化日期 */
const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
};

/** 从行程数据初始化表单 */
function initFormData(trip: TripWithRelations): EditFormData {
  return {
    title: trip.title,
    start_date: trip.start_date,
    end_date: trip.end_date,
    budget: trip.budget != null ? String(trip.budget) : '',
    transportation: trip.transportation || '',
    accommodation: trip.accommodation || '',
    notes: trip.notes || '',
  };
}

/**
 * 行程详情页面组件
 */
export default function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useTrip(tripId ?? '');
  const trip = data as TripWithRelations | undefined;
  const updateTrip = useUpdateTrip();
  const deleteTrip = useDeleteTrip();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // 是否处于编辑模式
  const [isEditing, setIsEditing] = useState(false);
  // 编辑模式下的表单数据
  const [form, setForm] = useState<EditFormData | null>(null);
  // 非编辑模式下待办事项的勾选变更（taskId → 新的 is_done 值）
  const [taskToggles, setTaskToggles] = useState<Record<string, boolean>>({});

  const updateTripTask = useUpdateTripTask();

  // 是否有待办事项的勾选变更
  const hasTaskChanges = useMemo(() => Object.keys(taskToggles).length > 0, [taskToggles]);

  /** 非编辑模式下切换待办事项勾选状态 */
  const toggleTask = useCallback((taskId: string, currentDone: boolean) => {
    setTaskToggles((prev) => {
      const next = { ...prev };
      // 如果已经记录了这个 task 的变更
      if (taskId in next) {
        // 如果切回了原始状态，移除记录
        if (next[taskId] === currentDone) {
          delete next[taskId];
        } else {
          next[taskId] = !next[taskId];
        }
      } else {
        // 首次切换，记录新状态
        next[taskId] = !currentDone;
      }
      return next;
    });
  }, []);

  /** 获取待办事项的当前显示状态（考虑本地勾选变更） */
  const getTaskDone = useCallback(
    (task: TripTask): boolean => {
      if (task.id in taskToggles) return taskToggles[task.id];
      return task.is_done;
    },
    [taskToggles]
  );

  /** 保存待办事项勾选变更 */
  const saveTaskToggles = useCallback(async () => {
    if (!trip || !hasTaskChanges) return;
    try {
      await Promise.all(
        Object.entries(taskToggles).map(([taskId, isDone]) =>
          updateTripTask.mutateAsync({
            id: taskId,
            tripId: trip.id,
            updates: { is_done: isDone },
          })
        )
      );
      setTaskToggles({});
    } catch {
      // 错误由 mutation 处理
    }
  }, [trip, taskToggles, hasTaskChanges, updateTripTask]);

  /** 进入编辑模式 */
  const enterEditMode = useCallback(() => {
    if (!trip) return;
    setForm(initFormData(trip));
    setIsEditing(true);
    setTaskToggles({});
  }, [trip]);

  /** 取消编辑，回到只读模式 */
  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setForm(null);
  }, []);

  /** 更新表单字段 */
  const updateField = useCallback((field: keyof EditFormData, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  /** 保存所有修改 */
  const saveEdit = useCallback(async () => {
    if (!trip || !form) return;

    const budgetNum = form.budget.trim() ? parseFloat(form.budget) : null;
    if (form.budget.trim() && (isNaN(budgetNum as number) || (budgetNum as number) < 0)) return;
    if (!form.title.trim() || !form.start_date || !form.end_date) return;

    try {
      await updateTrip.mutateAsync({
        id: trip.id,
        updates: {
          title: form.title.trim(),
          start_date: form.start_date,
          end_date: form.end_date,
          budget: budgetNum ?? undefined,
          transportation: form.transportation.trim() || undefined,
          accommodation: form.accommodation.trim() || undefined,
          notes: form.notes.trim() || undefined,
        },
      });
      setIsEditing(false);
      setForm(null);
    } catch {
      // 错误由 mutation 处理
    }
  }, [trip, form, updateTrip]);

  /** 返回行程列表 */
  const handleBack = () => navigate('/app/trips');

  /** 确认删除行程 */
  const handleDelete = async () => {
    if (!trip) return;
    try {
      await deleteTrip.mutateAsync(trip.id);
      navigate('/app/trips');
    } catch {
      // 错误由 mutation 处理
    }
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="trip-detail-page">
        <div className="trip-detail-page-loading">
          <Spinner size="lg" centered />
        </div>
      </div>
    );
  }

  // 错误或未找到
  if (error || !trip) {
    return (
      <div className="trip-detail-page">
        <div className="trip-detail-page-empty">
          <MapPin className="trip-detail-page-empty-icon" />
          <h2 className="trip-detail-page-empty-title">{error ? '加载失败' : '行程未找到'}</h2>
          <p className="trip-detail-page-empty-text">
            {error ? error.message : '该行程记录不存在或已被删除'}
          </p>
          <button className="trip-detail-page-back-link" onClick={handleBack}>
            返回行程列表
          </button>
        </div>
      </div>
    );
  }

  const status = computeTripStatus(trip);
  const isSaving = updateTrip.isPending;

  return (
    <div className="trip-detail-page">
      {/* 顶部导航 */}
      <div className="trip-detail-page-nav">
        <BackButton label="返回" onClick={handleBack} ariaLabel="返回行程列表" />
        <div className="trip-detail-page-actions">
          {isEditing ? (
            <>
              <Button variant="primary" size="sm" onClick={saveEdit} loading={isSaving}>
                保存
              </Button>
              <Button variant="secondary" size="sm" onClick={cancelEdit} disabled={isSaving}>
                取消
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={enterEditMode}>
                编辑
              </Button>
              <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                删除
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 行程内容 */}
      <div className="trip-detail-page-content">
        {/* 标题和状态 */}
        <div className="trip-detail-header">
          {isEditing && form ? (
            <input
              className="trip-detail-inline-input trip-detail-inline-input--title"
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              maxLength={200}
              placeholder="行程名称"
              disabled={isSaving}
            />
          ) : (
            <h1 className="trip-detail-title">{trip.title}</h1>
          )}
          <span className={`trip-detail-status trip-detail-status-${status}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>

        {/* 日期范围 */}
        <div className="trip-detail-dates">
          <span>📅</span>
          {isEditing && form ? (
            <>
              <input
                className="trip-detail-inline-input"
                type="date"
                value={form.start_date}
                onChange={(e) => updateField('start_date', e.target.value)}
                disabled={isSaving}
              />
              <span className="trip-detail-date-separator">→</span>
              <input
                className="trip-detail-inline-input"
                type="date"
                value={form.end_date}
                onChange={(e) => updateField('end_date', e.target.value)}
                disabled={isSaving}
              />
            </>
          ) : (
            <>
              <time>{formatDate(trip.start_date)}</time>
              <span className="trip-detail-date-separator">→</span>
              <time>{formatDate(trip.end_date)}</time>
            </>
          )}
        </div>

        {/* 基本信息 */}
        <div className="trip-detail-info-grid">
          {/* 预算 */}
          <div className="trip-detail-info-item">
            <span className="trip-detail-info-label">💰 预算</span>
            {isEditing && form ? (
              <input
                className="trip-detail-inline-input"
                type="number"
                value={form.budget}
                onChange={(e) => updateField('budget', e.target.value)}
                min="0"
                step="0.01"
                placeholder="输入预算金额"
                disabled={isSaving}
              />
            ) : (
              <span className="trip-detail-info-value">
                {trip.budget != null
                  ? `${trip.budget.toLocaleString('zh-CN')} ${trip.currency || 'CNY'}`
                  : '未设置'}
              </span>
            )}
          </div>

          {/* 交通 */}
          <div className="trip-detail-info-item">
            <span className="trip-detail-info-label">🚗 交通</span>
            {isEditing && form ? (
              <input
                className="trip-detail-inline-input"
                type="text"
                value={form.transportation}
                onChange={(e) => updateField('transportation', e.target.value)}
                maxLength={200}
                placeholder="输入交通方式"
                disabled={isSaving}
              />
            ) : (
              <span className="trip-detail-info-value">{trip.transportation || '未设置'}</span>
            )}
          </div>

          {/* 住宿 */}
          <div className="trip-detail-info-item">
            <span className="trip-detail-info-label">🏨 住宿</span>
            {isEditing && form ? (
              <input
                className="trip-detail-inline-input"
                type="text"
                value={form.accommodation}
                onChange={(e) => updateField('accommodation', e.target.value)}
                maxLength={200}
                placeholder="输入住宿信息"
                disabled={isSaving}
              />
            ) : (
              <span className="trip-detail-info-value">{trip.accommodation || '未设置'}</span>
            )}
          </div>

          {/* 关联城市（只读） */}
          {trip.related_city_id && (
            <div className="trip-detail-info-item">
              <span className="trip-detail-info-label">📍 关联城市</span>
              <span className="trip-detail-info-value">
                <button
                  className="trip-detail-city-link"
                  onClick={() => navigate(`/app/cities/${trip.related_city_id}`)}
                >
                  查看城市详情
                </button>
              </span>
            </div>
          )}
        </div>

        {/* 备注 */}
        <div className="trip-detail-section">
          <h2 className="trip-detail-section-title">📝 备注</h2>
          {isEditing && form ? (
            <textarea
              className="trip-detail-inline-textarea"
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              maxLength={5000}
              rows={4}
              placeholder="输入备注..."
              disabled={isSaving}
            />
          ) : (
            <p className="trip-detail-notes">{trip.notes || '暂无备注'}</p>
          )}
        </div>

        {/* 日程安排 */}
        <div className="trip-detail-section">
          {isEditing ? (
            <TripDayEditor tripId={trip.id} startDate={trip.start_date} endDate={trip.end_date} />
          ) : (
            <>
              <h2 className="trip-detail-section-title">📋 日程安排</h2>
              {trip.trip_days.length > 0 ? (
                <ul className="trip-detail-days">
                  {[...trip.trip_days]
                    .sort((a, b) => a.day_index - b.day_index)
                    .map((day: TripDay) => (
                      <li key={day.id} className="trip-detail-day-item">
                        <div className="trip-detail-day-header">
                          <span className="trip-detail-day-index">第 {day.day_index} 天</span>
                          {day.date && (
                            <time className="trip-detail-day-date">{formatDate(day.date)}</time>
                          )}
                        </div>
                        {day.title && <h3 className="trip-detail-day-title">{day.title}</h3>}
                        {day.notes && <p className="trip-detail-day-notes">{day.notes}</p>}
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="trip-detail-empty-hint">暂无日程安排</p>
              )}
            </>
          )}
        </div>

        {/* 待办事项 */}
        <div className="trip-detail-section">
          {isEditing ? (
            <TripTaskList tripId={trip.id} />
          ) : (
            <>
              <h2 className="trip-detail-section-title">
                ✅ 待办事项
                {trip.trip_tasks.length > 0 && (
                  <span className="trip-detail-task-count">
                    {trip.trip_tasks.filter((t) => getTaskDone(t)).length}/{trip.trip_tasks.length}
                  </span>
                )}
              </h2>
              {trip.trip_tasks.length > 0 ? (
                <ul className="trip-detail-tasks">
                  {trip.trip_tasks
                    .filter((t) => !getTaskDone(t))
                    .map((task: TripTask) => {
                      const changed = task.id in taskToggles;
                      return (
                        <li
                          key={task.id}
                          className={`trip-detail-task-item${changed ? ' trip-detail-task-changed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            className="trip-detail-task-checkbox-input"
                            checked={false}
                            onChange={() => toggleTask(task.id, task.is_done)}
                            aria-label={`标记 "${task.content}" 为已完成`}
                          />
                          <span className="trip-detail-task-content">{task.content}</span>
                        </li>
                      );
                    })}
                  {trip.trip_tasks
                    .filter((t) => getTaskDone(t))
                    .map((task: TripTask) => {
                      const changed = task.id in taskToggles;
                      return (
                        <li
                          key={task.id}
                          className={`trip-detail-task-item trip-detail-task-done${changed ? ' trip-detail-task-changed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            className="trip-detail-task-checkbox-input"
                            checked={true}
                            onChange={() => toggleTask(task.id, task.is_done)}
                            aria-label={`标记 "${task.content}" 为未完成`}
                          />
                          <span className="trip-detail-task-content">{task.content}</span>
                        </li>
                      );
                    })}
                </ul>
              ) : (
                <p className="trip-detail-empty-hint">暂无待办事项</p>
              )}
              <div className="trip-detail-task-footer">
                <button
                  className={`trip-detail-task-save${hasTaskChanges ? ' trip-detail-task-save--active' : ''}`}
                  onClick={saveTaskToggles}
                  disabled={!hasTaskChanges || updateTripTask.isPending}
                >
                  {updateTripTask.isPending ? '保存中...' : '保存'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* 行程时间线 */}
        <div className="trip-detail-section">
          <TripTimeline
            tripId={trip.id}
            startDate={trip.start_date}
            endDate={trip.end_date}
            trip_days={trip.trip_days}
            trip_tasks={trip.trip_tasks}
          />
        </div>
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="确认删除"
        message={
          <>
            确定要删除行程 <strong>{trip.title}</strong> 吗？
          </>
        }
        warning="此操作将同时删除关联的日程和待办事项，且无法撤销。"
        confirmText="确认删除"
        variant="danger"
        loading={deleteTrip.isPending}
      />
    </div>
  );
}
