/**
 * 愿望清单表单组件
 *
 * 功能：
 * - 使用 React Hook Form + Zod 验证
 * - 预填充坐标和反向地理编码结果
 * - 支持设置优先级（1-5）和期望季节
 * - 实时字段验证和错误提示
 *
 * 验证需求: 4.1, 4.2
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { wishlistFormSchema, type WishlistFormInput } from '@/schemas/citySchema';
import { Continent } from '@/types/entities';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/common/Spinner';
import './WishlistForm.css';

/** 表单输入类型（priority 可选，提交后由 Zod default 填充） */
type WishlistFormValues = z.input<typeof wishlistFormSchema>;

/** 优先级选项 */
const PRIORITY_OPTIONS = [1, 2, 3, 4, 5] as const;

/** 季节选项 */
const SEASON_OPTIONS = [
  { value: 'spring', label: '🌸 春季' },
  { value: 'summer', label: '☀️ 夏季' },
  { value: 'autumn', label: '🍂 秋季' },
  { value: 'winter', label: '❄️ 冬季' },
] as const;

interface WishlistFormProps {
  /** 初始数据（编辑模式） */
  initialData?: Partial<WishlistFormInput>;
  /** 地图点击坐标 */
  coordinates: { lat: number; lng: number };
  /** 反向地理编码结果 */
  geocodingData?: {
    cityName: string;
    countryName: string;
    continent: string;
  };
  /** 是否正在加载（如地理编码中） */
  isLoading?: boolean;
  /** 表单提交回调 */
  onSubmit: (data: WishlistFormInput) => Promise<void>;
  /** 取消回调 */
  onCancel: () => void;
}

export const WishlistForm: React.FC<WishlistFormProps> = ({
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
  } = useForm<WishlistFormValues, unknown, WishlistFormInput>({
    resolver: zodResolver(wishlistFormSchema),
    defaultValues: {
      cityName: '',
      countryName: '',
      continent: '' as Continent,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      priority: 3,
      expectedSeason: undefined,
      notes: '',
      ...initialData,
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

  // 监听当前优先级值
  const currentPriority = watch('priority');

  /** 处理表单提交 */
  const handleFormSubmit = async (data: WishlistFormInput) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('愿望清单表单提交失败:', error);
    }
  };

  /** 处理优先级按钮点击 */
  const handlePriorityClick = (value: number) => {
    setValue('priority', value, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="wishlist-form"
      aria-label="愿望清单表单"
    >
      {/* 城市名称 */}
      <div className="wishlist-form__field">
        <label htmlFor="wl-cityName" className="wishlist-form__label wishlist-form__label--required">
          城市名称
        </label>
        <Input
          id="wl-cityName"
          {...register('cityName')}
          placeholder="请输入城市名称"
          disabled={isLoading}
          error={errors.cityName?.message}
        />
      </div>

      {/* 国家名称 */}
      <div className="wishlist-form__field">
        <label
          htmlFor="wl-countryName"
          className="wishlist-form__label wishlist-form__label--required"
        >
          国家
        </label>
        <Input
          id="wl-countryName"
          {...register('countryName')}
          placeholder="请输入国家名称"
          disabled={isLoading}
          error={errors.countryName?.message}
        />
      </div>

      {/* 大洲 */}
      <div className="wishlist-form__field">
        <label
          htmlFor="wl-continent"
          className="wishlist-form__label wishlist-form__label--required"
        >
          大洲
        </label>
        <select
          id="wl-continent"
          {...register('continent')}
          className={`wishlist-form__select ${errors.continent ? 'wishlist-form__input--error' : ''}`}
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
        {errors.continent && <p className="wishlist-form__error">{errors.continent.message}</p>}
      </div>

      {/* 坐标（只读） */}
      <div className="wishlist-form__grid">
        <div className="wishlist-form__field">
          <label className="wishlist-form__label">纬度</label>
          <Input value={coordinates.lat.toFixed(6)} disabled />
        </div>
        <div className="wishlist-form__field">
          <label className="wishlist-form__label">经度</label>
          <Input value={coordinates.lng.toFixed(6)} disabled />
        </div>
      </div>

      {/* 优先级 */}
      <div className="wishlist-form__field">
        <label className="wishlist-form__label">优先级</label>
        <div className="wishlist-form__priority-group">
          {PRIORITY_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              className={`wishlist-form__priority-btn ${
                currentPriority === value ? 'wishlist-form__priority-btn--active' : ''
              }`}
              onClick={() => handlePriorityClick(value)}
              disabled={isLoading}
              aria-label={`优先级 ${value}`}
              aria-pressed={currentPriority === value}
            >
              {value}
            </button>
          ))}
        </div>
        {errors.priority && <p className="wishlist-form__error">{errors.priority.message}</p>}
      </div>

      {/* 期望季节 */}
      <div className="wishlist-form__field">
        <label htmlFor="wl-expectedSeason" className="wishlist-form__label">
          期望季节（可选）
        </label>
        <select
          id="wl-expectedSeason"
          {...register('expectedSeason')}
          className="wishlist-form__select"
          disabled={isLoading}
        >
          <option value="">不限季节</option>
          {SEASON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.expectedSeason && (
          <p className="wishlist-form__error">{errors.expectedSeason.message}</p>
        )}
      </div>

      {/* 备注 */}
      <div className="wishlist-form__field">
        <label htmlFor="wl-notes" className="wishlist-form__label">
          备注（可选）
        </label>
        <textarea
          id="wl-notes"
          {...register('notes')}
          rows={3}
          className="wishlist-form__textarea"
          placeholder="记录你想去这里的原因..."
          disabled={isLoading}
        />
        {errors.notes && <p className="wishlist-form__error">{errors.notes.message}</p>}
      </div>

      {/* 操作按钮 */}
      <div className="wishlist-form__actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" />
              <span style={{ marginLeft: '0.5rem' }}>提交中...</span>
            </>
          ) : (
            '添加到愿望清单'
          )}
        </Button>
      </div>
    </form>
  );
};
