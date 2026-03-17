/**
 * 愿望清单列表组件
 *
 * 显示所有愿望清单项目，按优先级降序排序
 * 支持点击查看详情和转换为城市记录
 *
 * 验证需求: 4.4, 4.5, 4.6
 */

import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { useConvertToCity } from '@/features/wishlist/hooks/useConvertToCity';
import { Spinner } from '@/components/common/Spinner';
import { Modal } from '@/components/common/Modal';
import { CityForm } from '@/components/city/CityForm';
import { WishlistCard } from './WishlistCard';
import { WishlistItem } from '@/types/database';
import type { CityFormInput } from '@/schemas/citySchema';
import './WishlistList.css';

interface WishlistListProps {
  /** 项目点击回调 */
  onItemClick?: (item: WishlistItem) => void;
  /** 当前选中的项目 ID */
  selectedItemId?: string;
}

/**
 * 愿望清单列表组件
 *
 * @example
 * ```tsx
 * <WishlistList
 *   onItemClick={(item) => console.log('点击:', item)}
 *   selectedItemId={selectedId}
 * />
 * ```
 */
export function WishlistList({ onItemClick, selectedItemId }: WishlistListProps) {
  const { data, isLoading, error } = useWishlist();
  const items = data as WishlistItem[] | undefined;

  const { isConverting, prefilledData, startConvert, cancelConvert, submitConvert, isSubmitting } =
    useConvertToCity();

  // 加载状态
  if (isLoading) {
    return (
      <div className="wishlist-list-loading">
        <Spinner size="md" centered />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="wishlist-list-error">
        <p className="wishlist-list-error-message">加载愿望清单失败</p>
        <p className="wishlist-list-error-detail">{error.message}</p>
      </div>
    );
  }

  // 空状态
  if (!items || items.length === 0) {
    return (
      <div className="wishlist-list-empty">
        <p className="wishlist-list-empty-message">还没有愿望清单</p>
        <p className="wishlist-list-empty-hint">在地图上点击添加你想去的城市</p>
      </div>
    );
  }

  // 按优先级降序排序（高优先级在前）
  const sortedItems = [...items].sort((a, b) => b.priority - a.priority);

  /** 处理转换表单提交 */
  const handleConvertSubmit = async (formData: CityFormInput) => {
    await submitConvert(formData);
  };

  return (
    <div className="wishlist-list-container">
      <div className="wishlist-list-header">
        <h2 className="wishlist-list-title">愿望清单</h2>
        <span className="wishlist-list-count">{items.length} 个目的地</span>
      </div>

      <ul className="wishlist-list">
        {sortedItems.map((item) => (
          <li key={item.id} className="wishlist-list-item">
            <WishlistCard
              item={item}
              isSelected={selectedItemId === item.id}
              onClick={() => onItemClick?.(item)}
              onConvert={startConvert}
            />
          </li>
        ))}
      </ul>

      {/* 转换表单模态框 */}
      {isConverting && prefilledData && (
        <Modal isOpen={isConverting} onClose={cancelConvert} title="转换为城市记录">
          <CityForm
            initialData={{
              cityName: prefilledData.cityName,
              countryName: prefilledData.countryName,
              continent: prefilledData.continent as any,
              latitude: prefilledData.latitude,
              longitude: prefilledData.longitude,
            }}
            coordinates={{
              lat: prefilledData.latitude,
              lng: prefilledData.longitude,
            }}
            isLoading={isSubmitting}
            onSubmit={handleConvertSubmit}
            onCancel={cancelConvert}
          />
        </Modal>
      )}
    </div>
  );
}
