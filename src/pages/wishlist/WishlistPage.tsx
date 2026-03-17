/**
 * 愿望清单页面
 *
 * 显示愿望清单列表，点击项目可查看详情和编辑
 * 验证需求: 4.4
 */

import { useState, useCallback } from 'react';
import { WishlistList } from '@/components/wishlist/WishlistList';
import { WishlistDetailPanel } from '@/components/wishlist/WishlistDetailPanel';
import { Modal } from '@/components/common/Modal';
import { CityForm } from '@/components/city/CityForm';
import { useConvertToCity } from '@/features/wishlist/hooks/useConvertToCity';
import type { WishlistItem } from '@/types/database';
import type { CityFormInput } from '@/schemas/citySchema';
import './WishlistPage.css';

export default function WishlistPage() {
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);

  const { isConverting, prefilledData, startConvert, cancelConvert, submitConvert, isSubmitting } =
    useConvertToCity();

  /** 点击列表项进入详情 */
  const handleItemClick = useCallback((item: WishlistItem) => {
    setSelectedItem(item);
  }, []);

  /** 返回列表 */
  const handleBack = useCallback(() => {
    setSelectedItem(null);
  }, []);

  /** 删除成功后返回列表 */
  const handleDeleteSuccess = useCallback(() => {
    setSelectedItem(null);
  }, []);

  /** 转换提交后返回列表 */
  const handleConvertSubmit = useCallback(
    async (formData: CityFormInput) => {
      await submitConvert(formData);
      setSelectedItem(null);
    },
    [submitConvert]
  );

  return (
    <div className="wishlist-page">
      {selectedItem ? (
        <div className="wishlist-page-detail">
          <WishlistDetailPanel
            item={selectedItem}
            onDeleteSuccess={handleDeleteSuccess}
            onConvert={startConvert}
            onBack={handleBack}
          />
        </div>
      ) : (
        <WishlistList onItemClick={handleItemClick} />
      )}

      {/* 转换为城市记录的模态框 */}
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
