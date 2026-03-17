/**
 * 愿望清单详情面板组件
 *
 * 默认只读展示，点击"编辑"后进入编辑模式
 * 支持编辑、删除、转换为城市记录
 */

import { useState, useCallback } from 'react';
import { useUpdateWishlistItem } from '@/features/wishlist/hooks/useUpdateWishlistItem';
import { useDeleteWishlistItem } from '@/features/wishlist/hooks/useDeleteWishlistItem';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { WishlistForm } from './WishlistForm';
import { Continent } from '@/types/entities';
import type { WishlistItem } from '@/types/database';
import type { WishlistFormInput } from '@/schemas/citySchema';
import './WishlistDetailPanel.css';

interface WishlistDetailPanelProps {
  /** 愿望清单项目数据 */
  item: WishlistItem;
  /** 编辑成功回调 */
  onEditSuccess?: () => void;
  /** 删除成功回调 */
  onDeleteSuccess?: () => void;
  /** 转换为城市记录回调 */
  onConvert?: (item: WishlistItem) => void;
  /** 返回列表回调（显示在标题行右侧） */
  onBack?: () => void;
  /** 返回按钮文字 */
  backLabel?: string;
}

/** 季节显示映射 */
const SEASON_LABELS: Record<string, string> = {
  spring: '🌸 春季',
  summer: '☀️ 夏季',
  autumn: '🍂 秋季',
  winter: '❄️ 冬季',
};

/** 大洲中文映射 */
const CONTINENT_LABELS: Record<string, string> = {
  Asia: '亚洲',
  Europe: '欧洲',
  Africa: '非洲',
  'North America': '北美洲',
  'South America': '南美洲',
  Oceania: '大洋洲',
  Antarctica: '南极洲',
};

export function WishlistDetailPanel({
  item,
  onEditSuccess,
  onDeleteSuccess,
  onConvert,
  onBack,
  backLabel = '返回列表',
}: WishlistDetailPanelProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateItem = useUpdateWishlistItem();
  const deleteItem = useDeleteWishlistItem();

  // 处理编辑表单提交
  const handleEditSubmit = useCallback(
    async (data: WishlistFormInput) => {
      await updateItem.mutateAsync({
        id: item.id,
        updates: {
          city_name: data.cityName.trim(),
          country_name: data.countryName.trim(),
          continent: data.continent,
          priority: data.priority,
          expected_season: data.expectedSeason || undefined,
          notes: data.notes?.trim() || undefined,
        },
      });
      setShowEditModal(false);
      onEditSuccess?.();
    },
    [item.id, updateItem, onEditSuccess]
  );

  const handleDelete = useCallback(async () => {
    try {
      await deleteItem.mutateAsync(item.id);
      onDeleteSuccess?.();
    } catch {
      // 错误由 mutation 处理
    }
  }, [item.id, deleteItem, onDeleteSuccess]);

  return (
    <div className="wl-detail">
      {/* 标题行：名字 + 返回按钮 */}
      <div className="wl-detail-header">
        <h2 className="wl-detail-title">{item.city_name}</h2>
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← {backLabel}
          </Button>
        )}
      </div>

      {/* 基本信息 */}
      <div className="wl-detail-info">
        <div className="wl-detail-row">
          <span className="wl-detail-label">🌍 国家</span>
          <span className="wl-detail-value">{item.country_name}</span>
        </div>

        <div className="wl-detail-row">
          <span className="wl-detail-label">🗺️ 大洲</span>
          <span className="wl-detail-value">
            {CONTINENT_LABELS[item.continent] || item.continent}
          </span>
        </div>

        <div className="wl-detail-row">
          <span className="wl-detail-label">⭐ 优先级</span>
          <span className="wl-detail-value wl-detail-stars">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={i < item.priority ? 'wl-star--filled' : 'wl-star'}>
                ★
              </span>
            ))}
          </span>
        </div>

        <div className="wl-detail-row">
          <span className="wl-detail-label">🌤️ 期望季节</span>
          <span className="wl-detail-value">
            {item.expected_season
              ? SEASON_LABELS[item.expected_season] || item.expected_season
              : '不限'}
          </span>
        </div>

        <div className="wl-detail-row">
          <span className="wl-detail-label">📍 坐标</span>
          <span className="wl-detail-value wl-detail-coords">
            {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
          </span>
        </div>
      </div>

      {/* 备注 */}
      <div className="wl-detail-section">
        <span className="wl-detail-label">📝 备注</span>
        <p className="wl-detail-notes">{item.notes || '暂无备注'}</p>
      </div>

      {/* 底部操作栏：转换按钮 + 编辑/删除 */}
      <div className="wl-detail-footer">
        {onConvert && (
          <Button variant="primary" size="sm" onClick={() => onConvert(item)}>
            🔄 转换为城市记录
          </Button>
        )}
        <div className="wl-detail-footer-actions">
          <Button variant="secondary" size="sm" onClick={() => setShowEditModal(true)}>
            编辑
          </Button>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            删除
          </Button>
        </div>
      </div>

      {/* 编辑悬浮窗 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="编辑愿望清单"
        size="lg"
      >
        <WishlistForm
          key={`edit-wl-${item.id}`}
          coordinates={{ lat: item.latitude, lng: item.longitude }}
          initialData={{
            cityName: item.city_name,
            countryName: item.country_name,
            continent: item.continent as Continent,
            latitude: item.latitude,
            longitude: item.longitude,
            priority: item.priority,
            expectedSeason: (item.expected_season || undefined) as
              | 'spring'
              | 'summer'
              | 'autumn'
              | 'winter'
              | undefined,
            notes: item.notes || '',
          }}
          onSubmit={handleEditSubmit}
          onCancel={() => setShowEditModal(false)}
          submitLabel="提交"
        />
      </Modal>

      {/* 删除确认 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="确认删除"
        message={
          <>
            确定要从愿望清单中移除 <strong>{item.city_name}</strong> 吗？
          </>
        }
        confirmText="确认删除"
        variant="danger"
        loading={deleteItem.isPending}
      />
    </div>
  );
}
