/**
 * 城市详情面板组件
 *
 * 显示完整的城市信息，提供编辑和删除功能
 * 验证需求: 3.7, 3.8, 3.9
 */

import { useState, useCallback } from 'react';
import { City } from '@/types/database';
import { useDeleteCity } from '@/features/cities/hooks/useDeleteCity';
import { useUpdateCity } from '@/features/cities/hooks/useUpdateCity';
import { useAuthStore } from '@/store/authStore';
import { uploadImage } from '@/utils/storage';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CityForm } from './CityForm';
import type { CityFormInput } from '@/schemas/citySchema';
import './CityDetailPanel.css';

interface CityDetailPanelProps {
  /**
   * 城市数据
   */
  city: City;

  /**
   * 编辑回调
   */
  onEdit?: (city: City) => void;

  /**
   * 删除成功回调
   */
  onDeleteSuccess?: () => void;

  /**
   * 关闭面板回调
   */
  onClose?: () => void;

  /**
   * 返回列表回调（显示在标题行右侧）
   */
  onBack?: () => void;

  /**
   * 返回按钮文字
   */
  backLabel?: string;
}

/**
 * 格式化日期
 */
const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
};

/**
 * 格式化旅行类型
 */
const formatTripType = (tripType: string): string => {
  const typeMap: Record<string, string> = {
    leisure: '休闲旅行',
    business: '商务出差',
    transit: '中转停留',
  };
  return typeMap[tripType] || tripType;
};

/**
 * 城市详情面板组件
 *
 * @example
 * ```tsx
 * <CityDetailPanel
 *   city={cityData}
 *   onEdit={(city) => console.log('Edit:', city)}
 *   onDeleteSuccess={() => console.log('Deleted')}
 *   onClose={() => console.log('Closed')}
 * />
 * ```
 */
export function CityDetailPanel({
  city,
  onDeleteSuccess,
  onClose,
  onBack,
  backLabel = '返回列表',
}: CityDetailPanelProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const deleteCity = useDeleteCity();
  const updateCity = useUpdateCity();
  const { user } = useAuthStore();

  // 处理编辑表单提交
  const handleEditSubmit = useCallback(
    async (data: CityFormInput) => {
      const coverImageUrl = await uploadImage(data.coverImage as File | undefined, user?.id ?? '');
      await updateCity.mutateAsync({
        id: city.id,
        updates: {
          city_name: data.cityName,
          country_name: data.countryName,
          continent: data.continent,
          latitude: city.latitude,
          longitude: city.longitude,
          visited_at:
            data.visitedAt instanceof Date
              ? data.visitedAt.toISOString().split('T')[0]
              : String(data.visitedAt),
          trip_type: data.tripType,
          rating: data.rating,
          notes: data.notes,
          tags: data.tags,
          cover_image: coverImageUrl ?? city.cover_image,
          is_favorite: data.isFavorite ?? false,
        },
      });
      setShowEditModal(false);
    },
    [city, updateCity, user]
  );

  // 处理删除确认
  const handleDeleteConfirm = async () => {
    try {
      await deleteCity.mutateAsync(city.id);
      setShowDeleteConfirm(false);
      onDeleteSuccess?.();
    } catch (error) {
      console.error('删除城市失败:', error);
      alert('删除失败，请重试');
    }
  };

  return (
    <div className="city-detail-panel">
      {/* 头部 */}
      <div className="city-detail-header">
        <div className="city-detail-header-content">
          <h2 className="city-detail-title">{city.city_name}</h2>
          {city.is_favorite && (
            <span className="city-detail-favorite" title="收藏">
              ❤️
            </span>
          )}
        </div>
        <div className="city-detail-header-actions">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              ← {backLabel}
            </Button>
          )}
          {onClose && (
            <button className="city-detail-close" onClick={onClose} aria-label="关闭">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 封面图 */}
      {city.cover_image && (
        <div className="city-detail-image-wrapper">
          <img src={city.cover_image} alt={city.city_name} className="city-detail-image" />
        </div>
      )}

      {/* 详情内容 */}
      <div className="city-detail-content">
        {/* 基本信息 */}
        <section className="city-detail-section">
          <h3 className="city-detail-section-title">基本信息</h3>
          <dl className="city-detail-info-list">
            <div className="city-detail-info-item">
              <dt className="city-detail-info-label">国家</dt>
              <dd className="city-detail-info-value">{city.country_name}</dd>
            </div>
            <div className="city-detail-info-item">
              <dt className="city-detail-info-label">大洲</dt>
              <dd className="city-detail-info-value">{city.continent}</dd>
            </div>
            <div className="city-detail-info-item">
              <dt className="city-detail-info-label">访问日期</dt>
              <dd className="city-detail-info-value">{formatDate(city.visited_at)}</dd>
            </div>
            <div className="city-detail-info-item">
              <dt className="city-detail-info-label">旅行类型</dt>
              <dd className="city-detail-info-value">{formatTripType(city.trip_type)}</dd>
            </div>
            <div className="city-detail-info-item">
              <dt className="city-detail-info-label">坐标</dt>
              <dd className="city-detail-info-value">
                {city.latitude.toFixed(6)}, {city.longitude.toFixed(6)}
              </dd>
            </div>
          </dl>
        </section>

        {/* 评分 */}
        {city.rating !== undefined && city.rating !== null && (
          <section className="city-detail-section">
            <h3 className="city-detail-section-title">评分</h3>
            <div className="city-detail-rating">
              {Array.from({ length: 5 }, (_, i) => (
                <svg
                  key={i}
                  className={`city-detail-star ${
                    i < city.rating! ? 'city-detail-star-filled' : ''
                  }`}
                  fill={i < city.rating! ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ))}
              <span className="city-detail-rating-text">{city.rating} / 5</span>
            </div>
          </section>
        )}

        {/* 标签 */}
        {city.tags && city.tags.length > 0 && (
          <section className="city-detail-section">
            <h3 className="city-detail-section-title">标签</h3>
            <div className="city-detail-tags">
              {city.tags.map((tag, index) => (
                <span key={index} className="city-detail-tag">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 备注 */}
        {city.notes && (
          <section className="city-detail-section">
            <h3 className="city-detail-section-title">备注</h3>
            <p className="city-detail-notes">{city.notes}</p>
          </section>
        )}

        {/* 元数据 */}
        <section className="city-detail-section">
          <h3 className="city-detail-section-title">记录信息</h3>
          <dl className="city-detail-info-list">
            <div className="city-detail-info-item">
              <dt className="city-detail-info-label">创建时间</dt>
              <dd className="city-detail-info-value">{formatDate(city.created_at)}</dd>
            </div>
            <div className="city-detail-info-item">
              <dt className="city-detail-info-label">更新时间</dt>
              <dd className="city-detail-info-value">{formatDate(city.updated_at)}</dd>
            </div>
          </dl>
        </section>
      </div>

      {/* 操作按钮 */}
      <div className="city-detail-actions">
        <Button
          variant="primary"
          onClick={() => setShowEditModal(true)}
          disabled={deleteCity.isPending}
        >
          编辑
        </Button>
        <Button
          variant="danger"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleteCity.isPending}
        >
          删除
        </Button>
      </div>

      {/* 编辑悬浮窗 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="编辑城市记录"
        size="lg"
      >
        <CityForm
          key={`edit-${city.id}`}
          coordinates={{ lat: city.latitude, lng: city.longitude }}
          initialData={{
            cityName: city.city_name,
            countryName: city.country_name,
            continent: city.continent as any,
            latitude: city.latitude,
            longitude: city.longitude,
            visitedAt: new Date(city.visited_at),
            tripType: city.trip_type as any,
            rating: city.rating,
            notes: city.notes,
            tags: city.tags,
            isFavorite: city.is_favorite,
          }}
          onSubmit={handleEditSubmit}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="确认删除"
        message={
          <>
            确定要删除城市记录 <strong>{city.city_name}</strong> 吗？
          </>
        }
        warning="此操作无法撤销，删除后数据将无法恢复。"
        confirmText="确认删除"
        cancelText="取消"
        variant="danger"
        loading={deleteCity.isPending}
      />
    </div>
  );
}
