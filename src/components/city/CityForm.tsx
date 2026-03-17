/**
 * 城市记录表单组件
 *
 * 功能：
 * - 使用 React Hook Form + Zod 验证
 * - 预填充坐标和反向地理编码结果
 * - 实现图片上传功能
 * - 分组卡片布局，提升视觉层次
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cityFormSchema, type CityFormInput } from '@/schemas/citySchema';
import { TripType, Continent } from '@/types/entities';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/common/Spinner';
import './CityForm.css';

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
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(cityFormSchema),
    mode: 'onTouched',
    defaultValues: {
      cityName: '',
      countryName: '',
      continent: '' as Continent,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      visitedAt: new Date().toISOString().split('T')[0] as any,
      tripType: TripType.Leisure,
      ...initialData,
      // 编辑时 tags 可能是数组，需要转为逗号分隔字符串供 input 显示
      tags: (initialData?.tags
        ? Array.isArray(initialData.tags)
          ? initialData.tags.join(', ')
          : initialData.tags
        : '') as any,
    },
  });

  // 当反向地理编码数据可用时，自动填充表单
  useEffect(() => {
    if (geocodingData && !initialData) {
      setValue('cityName', geocodingData.cityName, { shouldDirty: true });
      setValue('countryName', geocodingData.countryName, { shouldDirty: true });
      setValue('continent', geocodingData.continent as Continent, { shouldDirty: true });
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="city-form">
      {/* ━━ 基本信息 ━━ */}
      <section className="city-form__section">
        <h3 className="city-form__section-title">
          <span className="city-form__section-icon">📍</span> 基本信息
        </h3>

        <div className="city-form__field">
          <label htmlFor="cityName" className="city-form__label">
            城市名称<span className="city-form__required">*</span>
          </label>
          <Input
            id="cityName"
            {...register('cityName')}
            placeholder="请输入城市名称"
            disabled={isLoading}
            error={errors.cityName?.message}
          />
        </div>

        <div className="city-form__grid">
          <div className="city-form__field">
            <label htmlFor="countryName" className="city-form__label">
              国家<span className="city-form__required">*</span>
            </label>
            <Input
              id="countryName"
              {...register('countryName')}
              placeholder="请输入国家名称"
              disabled={isLoading}
              error={errors.countryName?.message}
            />
          </div>

          <div className="city-form__field">
            <label htmlFor="continent" className="city-form__label">
              大洲<span className="city-form__required">*</span>
            </label>
            <select
              id="continent"
              {...register('continent')}
              className={`city-form__select${errors.continent ? ' city-form__select--error' : ''}`}
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
            {errors.continent && <p className="city-form__error">{errors.continent.message}</p>}
          </div>
        </div>

        {/* 坐标（只读） */}
        <div className="city-form__grid">
          <div className="city-form__field">
            <label className="city-form__label">纬度</label>
            <Input value={coordinates.lat.toFixed(6)} disabled />
          </div>
          <div className="city-form__field">
            <label className="city-form__label">经度</label>
            <Input value={coordinates.lng.toFixed(6)} disabled />
          </div>
        </div>
      </section>

      {/* ━━ 旅行详情 ━━ */}
      <section className="city-form__section">
        <h3 className="city-form__section-title">
          <span className="city-form__section-icon">✈️</span> 旅行详情
        </h3>

        <div className="city-form__grid">
          <div className="city-form__field">
            <label htmlFor="visitedAt" className="city-form__label">
              访问日期<span className="city-form__required">*</span>
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

          <div className="city-form__field">
            <label htmlFor="tripType" className="city-form__label">
              旅行类型<span className="city-form__required">*</span>
            </label>
            <select
              id="tripType"
              {...register('tripType')}
              className="city-form__select"
              disabled={isLoading}
            >
              <option value={TripType.Leisure}>🏖️ 休闲旅行</option>
              <option value={TripType.Business}>💼 商务出差</option>
              <option value={TripType.Transit}>🔄 中转停留</option>
            </select>
            {errors.tripType && <p className="city-form__error">{errors.tripType.message}</p>}
          </div>
        </div>

        <div className="city-form__field">
          <label htmlFor="rating" className="city-form__label">
            评分（可选）
          </label>
          <select
            id="rating"
            {...register('rating', {
              setValueAs: (value) => (value === '' ? undefined : Number(value)),
            })}
            className="city-form__select"
            disabled={isLoading}
          >
            <option value="">未评分</option>
            <option value="1">⭐ 1 星</option>
            <option value="2">⭐⭐ 2 星</option>
            <option value="3">⭐⭐⭐ 3 星</option>
            <option value="4">⭐⭐⭐⭐ 4 星</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 星</option>
          </select>
          {errors.rating && <p className="city-form__error">{errors.rating.message}</p>}
        </div>

        <div className="city-form__field">
          <label htmlFor="tags" className="city-form__label">
            标签（可选，用逗号分隔）
          </label>
          <Input
            id="tags"
            {...register('tags', {
              setValueAs: (value) => {
                if (!value) return undefined;
                if (Array.isArray(value)) return value.filter(Boolean);
                return String(value)
                  .split(',')
                  .map((tag: string) => tag.trim())
                  .filter(Boolean);
              },
            })}
            placeholder="例如：美食, 历史, 自然"
            disabled={isLoading}
            error={errors.tags?.message}
          />
        </div>
      </section>

      {/* ━━ 补充信息 ━━ */}
      <section className="city-form__section">
        <h3 className="city-form__section-title">
          <span className="city-form__section-icon">📝</span> 补充信息
        </h3>

        <div className="city-form__field">
          <label htmlFor="notes" className="city-form__label">
            备注（可选）
          </label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={3}
            className="city-form__textarea"
            placeholder="记录您的旅行感受..."
            disabled={isLoading}
          />
          {errors.notes && <p className="city-form__error">{errors.notes.message}</p>}
        </div>

        <div className="city-form__field">
          <label htmlFor="coverImage" className="city-form__label">
            封面图片（可选）
          </label>
          <input
            id="coverImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setValue('coverImage', file ?? undefined, { shouldValidate: true });
            }}
            className="city-form__file-input"
            disabled={isLoading}
          />
          {errors.coverImage && (
            <p className="city-form__error">{errors.coverImage.message as string}</p>
          )}
          {coverImage && coverImage instanceof File && (
            <p className="city-form__file-info">
              已选择: {coverImage.name} ({(coverImage.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div className="city-form__checkbox-wrapper">
          <input
            id="isFavorite"
            type="checkbox"
            {...register('isFavorite')}
            className="city-form__checkbox"
            disabled={isLoading}
          />
          <label htmlFor="isFavorite" className="city-form__checkbox-label">
            ❤️ 标记为收藏
          </label>
        </div>
      </section>

      {/* ━━ 操作按钮 ━━ */}
      <div className="city-form__actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoading || !isValid}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" />
              <span style={{ marginLeft: '0.5rem' }}>提交中...</span>
            </>
          ) : (
            '提交'
          )}
        </Button>
      </div>
    </form>
  );
};
