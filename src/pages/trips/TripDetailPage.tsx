/**
 * 行程详情页面
 *
 * 显示行程完整信息，包括关联城市、日程和待办事项
 * 验证需求: 5.7
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useTrip } from '@/features/trips/hooks/useTrip';
import { useDeleteTrip } from '@/features/trips/hooks/useDeleteTrip';
import { computeTripStatus } from '@/components/trip/TripList';
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

/** 格式化日期 */
const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
};

/**
 * 行程详情页面组件
 */
export default function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useTrip(tripId ?? '');
  const trip = data as TripWithRelations | undefined;
  const deleteTrip = useDeleteTrip();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /** 返回行程列表 */
  const handleBack = () => {
    navigate('/app/trips');
  };

  /** 编辑行程 */
  const handleEdit = () => {
    if (trip) {
      navigate(`/app/trips/${trip.id}/edit`);
    }
  };

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
          <h2 className="trip-detail-page-empty-title">
            {error ? '加载失败' : '行程未找到'}
          </h2>
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
  const sortedDays = [...trip.trip_days].sort((a, b) => a.day_index - b.day_index);
  const doneTasks = trip.trip_tasks.filter((t) => t.is_done);
  const pendingTasks = trip.trip_tasks.filter((t) => !t.is_done);

  return (
    <div className="trip-detail-page">
      {/* 顶部导航 */}
      <div className="trip-detail-page-nav">
        <button className="trip-detail-page-back" onClick={handleBack} aria-label="返回行程列表">
          <ArrowLeft size={20} />
          <span>返回</span>
        </button>
        <div className="trip-detail-page-actions">
          <Button variant="secondary" size="sm" onClick={handleEdit}>
            编辑
          </Button>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            删除
          </Button>
        </div>
      </div>

      {/* 行程内容 */}
      <div className="trip-detail-page-content">
        {/* 标题和状态 */}
        <div className="trip-detail-header">
          <h1 className="trip-detail-title">{trip.title}</h1>
          <span className={`trip-detail-status trip-detail-status-${status}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>

        {/* 日期范围 */}
        <div className="trip-detail-dates">
          <span>📅</span>
          <time>{formatDate(trip.start_date)}</time>
          <span className="trip-detail-date-separator">→</span>
          <time>{formatDate(trip.end_date)}</time>
        </div>

        {/* 基本信息 */}
        <div className="trip-detail-info-grid">
          {trip.budget != null && (
            <div className="trip-detail-info-item">
              <span className="trip-detail-info-label">💰 预算</span>
              <span className="trip-detail-info-value">
                {trip.budget.toLocaleString('zh-CN')} {trip.currency || 'CNY'}
              </span>
            </div>
          )}
          {trip.transportation && (
            <div className="trip-detail-info-item">
              <span className="trip-detail-info-label">🚗 交通</span>
              <span className="trip-detail-info-value">{trip.transportation}</span>
            </div>
          )}
          {trip.accommodation && (
            <div className="trip-detail-info-item">
              <span className="trip-detail-info-label">🏨 住宿</span>
              <span className="trip-detail-info-value">{trip.accommodation}</span>
            </div>
          )}
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
        {trip.notes && (
          <div className="trip-detail-section">
            <h2 className="trip-detail-section-title">📝 备注</h2>
            <p className="trip-detail-notes">{trip.notes}</p>
          </div>
        )}

        {/* 日程列表 */}
        {sortedDays.length > 0 && (
          <div className="trip-detail-section">
            <h2 className="trip-detail-section-title">📋 日程安排</h2>
            <ul className="trip-detail-days">
              {sortedDays.map((day: TripDay) => (
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
          </div>
        )}

        {/* 待办事项 */}
        {trip.trip_tasks.length > 0 && (
          <div className="trip-detail-section">
            <h2 className="trip-detail-section-title">
              ✅ 待办事项
              <span className="trip-detail-task-count">
                {doneTasks.length}/{trip.trip_tasks.length}
              </span>
            </h2>
            <ul className="trip-detail-tasks">
              {pendingTasks.map((task: TripTask) => (
                <li key={task.id} className="trip-detail-task-item">
                  <span className="trip-detail-task-checkbox">☐</span>
                  <span className="trip-detail-task-content">{task.content}</span>
                </li>
              ))}
              {doneTasks.map((task: TripTask) => (
                <li key={task.id} className="trip-detail-task-item trip-detail-task-done">
                  <span className="trip-detail-task-checkbox">☑</span>
                  <span className="trip-detail-task-content">{task.content}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
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
