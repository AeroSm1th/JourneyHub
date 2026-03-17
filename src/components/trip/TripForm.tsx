/**
 * 行程表单组件
 *
 * 功能：
 * - 使用 React Hook Form + Zod 验证
 * - 输入行程名称、开始日期、结束日期（必填）
 * - 选择关联的城市或愿望清单项目（可选）
 * - 输入预算、货币、交通方式、住宿信息（可选）
 * - 实时字段验证和错误提示
 *
 * 验证需求: 5.2, 5.3, 5.5
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { tripFormSchema, type TripFormInput } from '@/schemas/tripSchema';
import { useCities } from '@/features/cities/hooks/useCities';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import type { City, WishlistItem } from '@/types/database';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/common/Spinner';
import './TripForm.css';

/** 表单输入类型（日期字段为 string，提交后由 setValueAs 转为 Date） */
type TripFormValues = z.input<typeof tripFormSchema>;

/** 常用货币选项 */
const CURRENCY_OPTIONS = [
  { value: 'CNY', label: '🇨🇳 CNY - 人民币' },
  { value: 'USD', label: '🇺🇸 USD - 美元' },
  { value: 'EUR', label: '🇪🇺 EUR - 欧元' },
  { value: 'JPY', label: '🇯🇵 JPY - 日元' },
  { value: 'GBP', label: '🇬🇧 GBP - 英镑' },
  { value: 'KRW', label: '🇰🇷 KRW - 韩元' },
  { value: 'THB', label: '🇹🇭 THB - 泰铢' },
  { value: 'SGD', label: '🇸🇬 SGD - 新加坡元' },
  { value: 'AUD', label: '🇦🇺 AUD - 澳元' },
  { value: 'CAD', label: '🇨🇦 CAD - 加元' },
] as const;

interface TripFormProps {
  /** 初始数据（编辑模式） */
  initialData?: Partial<TripFormInput>;
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 表单提交回调 */
  onSubmit: (data: TripFormInput) => Promise<void>;
  /** 取消回调 */
  onCancel: () => void;
}

/**
 * 将 Date 对象格式化为 YYYY-MM-DD 字符串
 */
const formatDateToString = (date?: Date): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

export const TripForm: React.FC<TripFormProps> = ({
  initialData,
  isLoading = false,
  onSubmit,
  onCancel,
}) => {
  // 获取城市列表和愿望清单列表，用于下拉选择
  const { data: citiesData } = useCities();
  const { data: wishlistData } = useWishlist();
  const cities = (citiesData ?? []) as City[];
  const wishlistItems = (wishlistData ?? []) as WishlistItem[];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<TripFormValues, unknown, TripFormInput>({
    resolver: zodResolver(tripFormSchema),
    mode: 'onTouched',
    defaultValues: {
      title: initialData?.title ?? '',
      startDate:
        initialData?.startDate ?? (new Date().toISOString().split('T')[0] as unknown as Date),
      endDate: initialData?.endDate ?? (undefined as unknown as Date),
      relatedCityId: initialData?.relatedCityId ?? undefined,
      relatedWishlistId: initialData?.relatedWishlistId ?? undefined,
      budget: initialData?.budget ?? undefined,
      currency: initialData?.currency ?? 'CNY',
      transportation: initialData?.transportation ?? '',
      accommodation: initialData?.accommodation ?? '',
      notes: initialData?.notes ?? '',
      shareEnabled: initialData?.shareEnabled ?? false,
    },
  });

  /** 处理表单提交 */
  const handleFormSubmit = async (data: TripFormInput) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('行程表单提交失败:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="trip-form" aria-label="行程表单">
      {/* ===== 基本信息 ===== */}
      <div className="trip-form__section-title">基本信息</div>

      {/* 行程名称 */}
      <div className="trip-form__field">
        <label htmlFor="trip-title" className="trip-form__label trip-form__label--required">
          行程名称
        </label>
        <Input
          id="trip-title"
          {...register('title')}
          placeholder="请输入行程名称"
          disabled={isLoading}
          error={errors.title?.message}
        />
      </div>

      {/* 开始日期 & 结束日期 */}
      <div className="trip-form__grid">
        <div className="trip-form__field">
          <label htmlFor="trip-startDate" className="trip-form__label trip-form__label--required">
            开始日期
          </label>
          <input
            id="trip-startDate"
            type="date"
            {...register('startDate', {
              setValueAs: (v: string) => (v ? new Date(v) : undefined),
            })}
            defaultValue={formatDateToString(initialData?.startDate)}
            className={`trip-form__input ${errors.startDate ? 'trip-form__input--error' : ''}`}
            disabled={isLoading}
          />
          {errors.startDate && <p className="trip-form__error">{errors.startDate.message}</p>}
        </div>
        <div className="trip-form__field">
          <label htmlFor="trip-endDate" className="trip-form__label trip-form__label--required">
            结束日期
          </label>
          <input
            id="trip-endDate"
            type="date"
            {...register('endDate', {
              setValueAs: (v: string) => (v ? new Date(v) : undefined),
            })}
            defaultValue={formatDateToString(initialData?.endDate)}
            className={`trip-form__input ${errors.endDate ? 'trip-form__input--error' : ''}`}
            disabled={isLoading}
          />
          {errors.endDate && <p className="trip-form__error">{errors.endDate.message}</p>}
        </div>
      </div>

      {/* ===== 关联信息 ===== */}
      <div className="trip-form__section-title">关联信息</div>

      {/* 关联城市 */}
      <div className="trip-form__field">
        <label htmlFor="trip-relatedCityId" className="trip-form__label">
          关联城市（可选）
        </label>
        <select
          id="trip-relatedCityId"
          {...register('relatedCityId', {
            setValueAs: (v: string) => (v === '' ? undefined : v),
          })}
          className="trip-form__select"
          disabled={isLoading}
        >
          <option value="">不关联城市</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.city_name} - {city.country_name}
            </option>
          ))}
        </select>
        {errors.relatedCityId && <p className="trip-form__error">{errors.relatedCityId.message}</p>}
      </div>

      {/* 关联愿望清单 */}
      <div className="trip-form__field">
        <label htmlFor="trip-relatedWishlistId" className="trip-form__label">
          关联愿望清单（可选）
        </label>
        <select
          id="trip-relatedWishlistId"
          {...register('relatedWishlistId', {
            setValueAs: (v: string) => (v === '' ? undefined : v),
          })}
          className="trip-form__select"
          disabled={isLoading}
        >
          <option value="">不关联愿望清单</option>
          {wishlistItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.city_name} - {item.country_name}
            </option>
          ))}
        </select>
        {errors.relatedWishlistId && (
          <p className="trip-form__error">{errors.relatedWishlistId.message}</p>
        )}
      </div>

      {/* ===== 预算与交通 ===== */}
      <div className="trip-form__section-title">预算与交通</div>

      {/* 预算 & 货币 */}
      <div className="trip-form__grid">
        <div className="trip-form__field">
          <label htmlFor="trip-budget" className="trip-form__label">
            预算（可选）
          </label>
          <input
            id="trip-budget"
            type="number"
            step="0.01"
            min="0"
            {...register('budget', {
              setValueAs: (v: string) => (v === '' ? undefined : Number(v)),
            })}
            className={`trip-form__input ${errors.budget ? 'trip-form__input--error' : ''}`}
            placeholder="请输入预算金额"
            disabled={isLoading}
          />
          {errors.budget && <p className="trip-form__error">{errors.budget.message}</p>}
        </div>
        <div className="trip-form__field">
          <label htmlFor="trip-currency" className="trip-form__label">
            货币（可选）
          </label>
          <select
            id="trip-currency"
            {...register('currency')}
            className="trip-form__select"
            disabled={isLoading}
          >
            {CURRENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.currency && <p className="trip-form__error">{errors.currency.message}</p>}
        </div>
      </div>

      {/* 交通方式 */}
      <div className="trip-form__field">
        <label htmlFor="trip-transportation" className="trip-form__label">
          交通方式（可选）
        </label>
        <Input
          id="trip-transportation"
          {...register('transportation')}
          placeholder="例如：飞机、高铁、自驾"
          disabled={isLoading}
          error={errors.transportation?.message}
        />
      </div>

      {/* 住宿信息 */}
      <div className="trip-form__field">
        <label htmlFor="trip-accommodation" className="trip-form__label">
          住宿信息（可选）
        </label>
        <Input
          id="trip-accommodation"
          {...register('accommodation')}
          placeholder="例如：XX酒店、民宿"
          disabled={isLoading}
          error={errors.accommodation?.message}
        />
      </div>

      {/* 备注 */}
      <div className="trip-form__field">
        <label htmlFor="trip-notes" className="trip-form__label">
          备注（可选）
        </label>
        <textarea
          id="trip-notes"
          {...register('notes')}
          rows={3}
          className="trip-form__textarea"
          placeholder="记录行程相关的备注信息..."
          disabled={isLoading}
        />
        {errors.notes && <p className="trip-form__error">{errors.notes.message}</p>}
      </div>

      {/* 操作按钮 */}
      <div className="trip-form__actions">
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
            '创建行程'
          )}
        </Button>
      </div>
    </form>
  );
};
