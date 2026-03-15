/**
 * 城市记录表单组件
 *
 * 功能：
 * - 使用 React Hook Form + Zod 验证
 * - 预填充坐标和反向地理编码结果
 * - 实现图片上传功能
 * - 实时字段验证和错误提示
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cityFormSchema, type CityFormInput } from '@/schemas/citySchema';
import { TripType, Continent } from '@/types/entities';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/common/Spinner';

interface CityFormProps {
  initialData?: Partial<CityFormInput>;
  coordinates: { lat: number; lng: number };
  geocodingData?: {
    cityName: string;
    countryName: string;
    continent: string;
  };
  isLoading?: boolean;
  onSubmit: (data: CityFormInput) => Promise<void>;
  onCancel: () => void;
}

export const CityForm: React.FC<CityFormProps> = ({
  initialData,
  coordinates,
  geocodingData,
  isLoading = false,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(cityFormSchema),
    defaultValues: {
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      visitedAt: new Date(),
      tripType: TripType.Leisure,
      ...initialData,
    },
  });

  // 当反向地理编码数据可用时，自动填充表单
  useEffect(() => {
    if (geocodingData && !initialData) {
      setValue('cityName', geocodingData.cityName);
      setValue('countryName', geocodingData.countryName);
      setValue('continent', geocodingData.continent as Continent);
    }
  }, [geocodingData, initialData, setValue]);

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data as CityFormInput);
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  const coverImage = watch('coverImage');

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* 城市名称 */}
      <div>
        <label htmlFor="cityName" className="block text-sm font-medium text-gray-700 mb-1">
          城市名称 <span className="text-red-500">*</span>
        </label>
        <Input
          id="cityName"
          {...register('cityName')}
          placeholder="请输入城市名称"
          disabled={isLoading}
          error={errors.cityName?.message}
        />
      </div>

      {/* 国家名称 */}
      <div>
        <label htmlFor="countryName" className="block text-sm font-medium text-gray-700 mb-1">
          国家 <span className="text-red-500">*</span>
        </label>
        <Input
          id="countryName"
          {...register('countryName')}
          placeholder="请输入国家名称"
          disabled={isLoading}
          error={errors.countryName?.message}
        />
      </div>

      {/* 大洲 */}
      <div>
        <label htmlFor="continent" className="block text-sm font-medium text-gray-700 mb-1">
          大洲 <span className="text-red-500">*</span>
        </label>
        <select
          id="continent"
          {...register('continent')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="">请选择大洲</option>
          <option value={Continent.Asia}>亚洲</option>
          <option value={Continent.Europe}>欧洲</option>
          <option value={Continent.Africa}>非洲</option>
          <option value={Continent.NorthAmerica}>北美洲</option>
          <option value={Continent.SouthAmerica}>南美洲</option>
          <option value={Continent.Oceania}>大洋洲</option>
          <option value={Continent.Antarctica}>南极洲</option>
        </select>
        {errors.continent && (
          <p className="mt-1 text-sm text-red-600">{errors.continent.message}</p>
        )}
      </div>

      {/* 坐标（只读） */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">纬度</label>
          <Input value={coordinates.lat.toFixed(6)} disabled />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">经度</label>
          <Input value={coordinates.lng.toFixed(6)} disabled />
        </div>
      </div>

      {/* 访问日期 */}
      <div>
        <label htmlFor="visitedAt" className="block text-sm font-medium text-gray-700 mb-1">
          访问日期 <span className="text-red-500">*</span>
        </label>
        <Input
          id="visitedAt"
          type="date"
          {...register('visitedAt', {
            setValueAs: (value) => (value ? new Date(value) : undefined),
          })}
          max={new Date().toISOString().split('T')[0]}
          disabled={isLoading}
          error={errors.visitedAt?.message}
        />
      </div>

      {/* 旅行类型 */}
      <div>
        <label htmlFor="tripType" className="block text-sm font-medium text-gray-700 mb-1">
          旅行类型 <span className="text-red-500">*</span>
        </label>
        <select
          id="tripType"
          {...register('tripType')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value={TripType.Leisure}>休闲旅行</option>
          <option value={TripType.Business}>商务出差</option>
          <option value={TripType.Transit}>中转停留</option>
        </select>
        {errors.tripType && <p className="mt-1 text-sm text-red-600">{errors.tripType.message}</p>}
      </div>

      {/* 评分 */}
      <div>
        <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
          评分（可选）
        </label>
        <select
          id="rating"
          {...register('rating', {
            setValueAs: (value) => (value === '' ? undefined : Number(value)),
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="">未评分</option>
          <option value="1">⭐ 1 星</option>
          <option value="2">⭐⭐ 2 星</option>
          <option value="3">⭐⭐⭐ 3 星</option>
          <option value="4">⭐⭐⭐⭐ 4 星</option>
          <option value="5">⭐⭐⭐⭐⭐ 5 星</option>
        </select>
        {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>}
      </div>

      {/* 备注 */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          备注（可选）
        </label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="记录您的旅行感受..."
          disabled={isLoading}
        />
        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
      </div>

      {/* 标签 */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          标签（可选，用逗号分隔）
        </label>
        <Input
          id="tags"
          {...register('tags', {
            setValueAs: (value) =>
              value
                ? value
                    .split(',')
                    .map((tag: string) => tag.trim())
                    .filter(Boolean)
                : undefined,
          })}
          placeholder="例如：美食, 历史, 自然"
          disabled={isLoading}
          error={errors.tags?.message}
        />
      </div>

      {/* 封面图片 */}
      <div>
        <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
          封面图片（可选）
        </label>
        <input
          id="coverImage"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          {...register('coverImage', {
            setValueAs: (value) => (value && value[0] ? value[0] : undefined),
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {errors.coverImage && (
          <p className="mt-1 text-sm text-red-600">{errors.coverImage.message}</p>
        )}
        {coverImage && (
          <p className="mt-1 text-sm text-gray-600">
            已选择: {coverImage.name} ({(coverImage.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* 收藏 */}
      <div className="flex items-center">
        <input
          id="isFavorite"
          type="checkbox"
          {...register('isFavorite')}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          disabled={isLoading}
        />
        <label htmlFor="isFavorite" className="ml-2 block text-sm text-gray-700">
          标记为收藏
        </label>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" />
              <span className="ml-2">提交中...</span>
            </>
          ) : (
            '提交'
          )}
        </Button>
      </div>
    </form>
  );
};
