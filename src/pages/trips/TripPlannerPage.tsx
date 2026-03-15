/**
 * 行程规划页面
 *
 * 功能：
 * - 创建模式：显示 TripForm，提交后跳转到编辑模式
 * - 编辑模式：显示行程信息、日程安排、待办事项、时间线
 * - 使用 Tab 切换不同区块
 * - 支持保存草稿（localStorage）
 *
 * 验证需求: 5.1, 5.2, 5.4, 5.6
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTrip } from '@/features/trips/hooks/useTrip';
import { useCreateTrip } from '@/features/trips/hooks/useCreateTrip';
import { TripForm, TripDayEditor, TripTaskList, TripTimeline } from '@/components/trip';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/common/Button';
import type { TripFormInput } from '@/schemas/tripSchema';
import type { TripWithRelations } from '@/features/trips/api';
import './TripPlannerPage.css';

/** Tab 类型 */
type PlannerTab = 'info' | 'schedule' | 'tasks' | 'timeline';

/** Tab 配置 */
const TABS: { key: PlannerTab; label: string; icon: string }[] = [
  { key: 'info', label: '基本信息', icon: '📝' },
  { key: 'schedule', label: '日程安排', icon: '📋' },
  { key: 'tasks', label: '待办事项', icon: '✅' },
  { key: 'timeline', label: '时间线', icon: '🗓️' },
];

/** 草稿存储 key */
const DRAFT_KEY = 'trip-planner-draft';

/** 保存草稿到 localStorage */
function saveDraft(data: Partial<TripFormInput>) {
  try {
    const serializable = {
      ...data,
      startDate: data.startDate?.toISOString(),
      endDate: data.endDate?.toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(serializable));
  } catch {
    // 忽略存储错误
  }
}

/** 从 localStorage 加载草稿 */
function loadDraft(): Partial<TripFormInput> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      startDate: parsed.startDate ? new Date(parsed.startDate) : undefined,
      endDate: parsed.endDate ? new Date(parsed.endDate) : undefined,
    };
  } catch {
    return null;
  }
}

/** 清除草稿 */
function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

/**
 * 行程规划页面组件
 */
export default function TripPlannerPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!tripId;

  // 编辑模式：获取行程数据
  const { data, isLoading, error } = useTrip(tripId ?? '', { enabled: isEditMode });
  const trip = data as TripWithRelations | undefined;

  const createTrip = useCreateTrip();

  // 当前 Tab
  const [activeTab, setActiveTab] = useState<PlannerTab>(isEditMode ? 'info' : 'info');

  // 草稿数据（仅创建模式）
  const [draft, setDraft] = useState<Partial<TripFormInput> | null>(null);

  // 加载草稿（仅创建模式）
  useEffect(() => {
    if (!isEditMode) {
      const saved = loadDraft();
      if (saved) {
        setDraft(saved);
      }
    }
  }, [isEditMode]);

  /** 返回行程列表 */
  const handleBack = useCallback(() => {
    navigate('/app/trips');
  }, [navigate]);

  /** 创建模式：提交表单 */
  const handleCreate = useCallback(
    async (formData: TripFormInput) => {
      if (!user) return;

      const newTrip = await createTrip.mutateAsync({
        user_id: user.id,
        title: formData.title,
        start_date: formData.startDate.toISOString().split('T')[0],
        end_date: formData.endDate.toISOString().split('T')[0],
        related_city_id: formData.relatedCityId,
        related_wishlist_id: formData.relatedWishlistId,
        budget: formData.budget,
        currency: formData.currency,
        transportation: formData.transportation,
        accommodation: formData.accommodation,
        notes: formData.notes,
        share_enabled: formData.shareEnabled ?? false,
        status: 'planning',
      });

      // 创建成功后清除草稿并跳转到编辑模式
      clearDraft();
      navigate(`/app/trips/${newTrip.id}/edit`, { replace: true });
    },
    [user, createTrip, navigate]
  );

  /** 创建模式：取消 */
  const handleCancel = useCallback(() => {
    clearDraft();
    navigate('/app/trips');
  }, [navigate]);

  /** 保存草稿按钮 */
  const handleSaveDraft = useCallback(() => {
    if (draft) {
      saveDraft(draft);
    }
  }, [draft]);

  // 加载状态（编辑模式）
  if (isEditMode && isLoading) {
    return (
      <div className="trip-planner-page">
        <div className="trip-planner-page__loading">
          <Spinner size="lg" centered />
        </div>
      </div>
    );
  }

  // 错误状态（编辑模式）
  if (isEditMode && (error || !trip)) {
    return (
      <div className="trip-planner-page">
        <div className="trip-planner-page__empty">
          <h2 className="trip-planner-page__empty-title">
            {error ? '加载失败' : '行程未找到'}
          </h2>
          <p className="trip-planner-page__empty-text">
            {error ? error.message : '该行程记录不存在或已被删除'}
          </p>
          <Button onClick={handleBack}>返回行程列表</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="trip-planner-page">
      {/* 顶部导航 */}
      <div className="trip-planner-page__nav">
        <button className="trip-planner-page__back" onClick={handleBack} aria-label="返回行程列表">
          <ArrowLeft size={20} />
          <span>返回</span>
        </button>
        <h1 className="trip-planner-page__title">
          {isEditMode ? `编辑行程：${trip?.title ?? ''}` : '创建新行程'}
        </h1>
        {!isEditMode && draft && (
          <Button variant="ghost" size="sm" onClick={handleSaveDraft}>
            保存草稿
          </Button>
        )}
      </div>

      {/* 编辑模式：Tab 导航 */}
      {isEditMode && trip && (
        <div className="trip-planner-page__tabs" role="tablist" aria-label="行程规划标签">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`trip-planner-page__tab${activeTab === tab.key ? ' trip-planner-page__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="trip-planner-page__tab-icon">{tab.icon}</span>
              <span className="trip-planner-page__tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* 内容区域 */}
      <div className="trip-planner-page__content">
        {/* 创建模式：显示表单 */}
        {!isEditMode && (
          <TripForm
            initialData={draft ?? undefined}
            onSubmit={handleCreate}
            onCancel={handleCancel}
            isLoading={createTrip.isPending}
          />
        )}

        {/* 编辑模式：根据 Tab 显示不同内容 */}
        {isEditMode && trip && (
          <>
            {activeTab === 'info' && (
              <TripForm
                initialData={{
                  title: trip.title,
                  startDate: new Date(trip.start_date),
                  endDate: new Date(trip.end_date),
                  relatedCityId: trip.related_city_id,
                  relatedWishlistId: trip.related_wishlist_id,
                  budget: trip.budget,
                  currency: trip.currency ?? 'CNY',
                  transportation: trip.transportation,
                  accommodation: trip.accommodation,
                  notes: trip.notes,
                  shareEnabled: trip.share_enabled,
                }}
                onSubmit={async () => {
                  // 编辑模式下表单提交由 TripForm 内部处理
                  // 这里可以导航回详情页
                  navigate(`/app/trips/${trip.id}`);
                }}
                onCancel={() => navigate(`/app/trips/${trip.id}`)}
              />
            )}

            {activeTab === 'schedule' && (
              <TripDayEditor
                tripId={trip.id}
                startDate={trip.start_date}
                endDate={trip.end_date}
              />
            )}

            {activeTab === 'tasks' && (
              <TripTaskList tripId={trip.id} />
            )}

            {activeTab === 'timeline' && (
              <TripTimeline
                tripId={trip.id}
                startDate={trip.start_date}
                endDate={trip.end_date}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
