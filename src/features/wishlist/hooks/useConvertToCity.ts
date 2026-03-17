/**
 * useConvertToCity Hook
 *
 * 将愿望清单项目转换为城市记录
 * 从 WishlistItem 提取城市信息，预填充到 CityForm
 * 转换成功后删除原愿望清单项目
 *
 * 验证需求: 4.5, 4.6
 */

import { useState, useCallback } from 'react';
import { useCreateCity } from '@/features/cities/hooks/useCreateCity';
import { useDeleteWishlistItem } from './useDeleteWishlistItem';
import type { WishlistItem, CityInsert } from '@/types/database';
import type { CityFormInput } from '@/schemas/citySchema';

/** 从愿望清单项目提取的预填充数据 */
export interface ConvertPrefilledData {
  cityName: string;
  countryName: string;
  continent: string;
  latitude: number;
  longitude: number;
}

/** Hook 返回值 */
export interface UseConvertToCityReturn {
  /** 是否正在显示转换表单 */
  isConverting: boolean;
  /** 当前正在转换的愿望清单项目 */
  convertingItem: WishlistItem | null;
  /** 预填充数据 */
  prefilledData: ConvertPrefilledData | null;
  /** 开始转换（打开表单） */
  startConvert: (item: WishlistItem) => void;
  /** 取消转换 */
  cancelConvert: () => void;
  /** 提交转换（创建城市记录并删除愿望清单项目） */
  submitConvert: (formData: CityFormInput) => Promise<void>;
  /** 是否正在提交 */
  isSubmitting: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 从愿望清单项目中提取预填充数据
 */
export function extractPrefilledData(item: WishlistItem): ConvertPrefilledData {
  return {
    cityName: item.city_name,
    countryName: item.country_name,
    continent: item.continent,
    latitude: item.latitude,
    longitude: item.longitude,
  };
}

/**
 * 愿望清单转换为城市记录的 Hook
 *
 * @example
 * ```tsx
 * function WishlistActions({ item }: { item: WishlistItem }) {
 *   const {
 *     isConverting,
 *     prefilledData,
 *     startConvert,
 *     cancelConvert,
 *     submitConvert,
 *   } = useConvertToCity();
 *
 *   return (
 *     <>
 *       <button onClick={() => startConvert(item)}>转换为城市记录</button>
 *       {isConverting && prefilledData && (
 *         <CityForm
 *           initialData={prefilledData}
 *           coordinates={{ lat: prefilledData.latitude, lng: prefilledData.longitude }}
 *           onSubmit={submitConvert}
 *           onCancel={cancelConvert}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 */
export const useConvertToCity = (): UseConvertToCityReturn => {
  const [isConverting, setIsConverting] = useState(false);
  const [convertingItem, setConvertingItem] = useState<WishlistItem | null>(null);
  const [prefilledData, setPrefilledData] = useState<ConvertPrefilledData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCity = useCreateCity();
  const deleteWishlistItem = useDeleteWishlistItem();

  /** 开始转换：提取预填充数据并打开表单 */
  const startConvert = useCallback((item: WishlistItem) => {
    const data = extractPrefilledData(item);
    setConvertingItem(item);
    setPrefilledData(data);
    setIsConverting(true);
    setError(null);
  }, []);

  /** 取消转换 */
  const cancelConvert = useCallback(() => {
    setIsConverting(false);
    setConvertingItem(null);
    setPrefilledData(null);
    setError(null);
  }, []);

  /** 提交转换：创建城市记录 → 删除愿望清单项目 */
  const submitConvert = useCallback(
    async (formData: CityFormInput) => {
      if (!convertingItem) {
        setError('没有选中的愿望清单项目');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        // 构建城市插入数据
        const cityData: CityInsert = {
          user_id: convertingItem.user_id,
          city_name: formData.cityName,
          country_name: formData.countryName,
          continent: formData.continent,
          latitude: formData.latitude,
          longitude: formData.longitude,
          visited_at:
            formData.visitedAt instanceof Date
              ? formData.visitedAt.toISOString().split('T')[0]
              : String(formData.visitedAt),
          trip_type: formData.tripType as 'leisure' | 'business' | 'transit',
          rating: formData.rating,
          notes: formData.notes,
          tags: formData.tags,
          is_favorite: formData.isFavorite ?? false,
        };

        // 1. 创建城市记录
        await createCity.mutateAsync(cityData);

        // 2. 删除愿望清单项目
        await deleteWishlistItem.mutateAsync(convertingItem.id);

        // 3. 重置状态
        setIsConverting(false);
        setConvertingItem(null);
        setPrefilledData(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : '转换失败，请稍后重试';
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [convertingItem, createCity, deleteWishlistItem]
  );

  return {
    isConverting,
    convertingItem,
    prefilledData,
    startConvert,
    cancelConvert,
    submitConvert,
    isSubmitting,
    error,
  };
};
