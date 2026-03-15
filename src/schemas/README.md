# Zod 验证 Schema 文档

本目录包含所有表单验证的 Zod Schema 定义，确保数据完整性和类型安全。

## 文件结构

```
src/schemas/
├── authSchema.ts      # 认证相关验证规则
├── citySchema.ts      # 城市记录和愿望清单验证规则
├── tripSchema.ts      # 行程相关验证规则
└── README.md          # 本文档
```

## 使用方法

### 1. 基本验证

```typescript
import { loginSchema } from '@/schemas/authSchema';

// 验证数据
const result = loginSchema.safeParse({
  email: 'user@example.com',
  password: 'password123',
});

if (result.success) {
  console.log('验证通过:', result.data);
} else {
  console.log('验证失败:', result.error.errors);
}
```

### 2. 与 React Hook Form 集成

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cityFormSchema, type CityFormInput } from '@/schemas/citySchema';

function CityForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CityFormInput>({
    resolver: zodResolver(cityFormSchema),
  });

  const onSubmit = (data: CityFormInput) => {
    console.log('表单数据:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('cityName')} />
      {errors.cityName && <span>{errors.cityName.message}</span>}

      <button type="submit">提交</button>
    </form>
  );
}
```

### 3. 服务端验证

```typescript
import { cityFormSchema } from '@/schemas/citySchema';

async function createCity(formData: unknown) {
  // 验证数据
  const validatedData = cityFormSchema.parse(formData);

  // 保存到数据库
  const { data, error } = await supabase.from('cities').insert(validatedData);

  return data;
}
```

## Schema 详细说明

### authSchema.ts

包含所有认证相关的验证规则：

- **loginSchema**: 登录表单验证
  - email: 必填，有效邮箱格式
  - password: 必填，至少 8 个字符

- **registerSchema**: 注册表单验证
  - email: 必填，有效邮箱格式
  - password: 必填，至少 8 个字符
  - confirmPassword: 必填，必须与 password 一致

- **profileSchema**: 个人资料验证
  - nickname: 可选，2-50 个字符
  - avatarFile: 可选，最大 2MB，支持 JPG/PNG/WebP

- **changePasswordSchema**: 修改密码验证
  - currentPassword: 必填
  - newPassword: 必填，至少 8 个字符
  - confirmNewPassword: 必填，必须与 newPassword 一致
  - 新密码不能与当前密码相同

### citySchema.ts

包含城市记录和愿望清单的验证规则：

- **cityFormSchema**: 城市记录表单验证
  - cityName: 必填，1-100 个字符
  - countryName: 必填，1-100 个字符
  - continent: 必填，枚举值
  - latitude: 必填，-90 到 90
  - longitude: 必填，-180 到 180
  - visitedAt: 必填，不能是未来日期
  - tripType: 必填，枚举值（leisure/business/transit）
  - rating: 可选，1-5 的整数
  - notes: 可选，最多 2000 个字符
  - tags: 可选，最多 10 个标签，每个最多 50 个字符
  - coverImage: 可选，最大 5MB，支持 JPG/PNG/WebP
  - isFavorite: 可选，布尔值，默认 false

- **cityUpdateSchema**: 城市记录更新验证（所有字段可选）

- **citySearchSchema**: 城市搜索参数验证

- **wishlistFormSchema**: 愿望清单表单验证
  - 与 cityFormSchema 类似，但使用 priority 和 expectedSeason 替代 rating 和 visitedAt

- **wishlistUpdateSchema**: 愿望清单更新验证（所有字段可选）

### tripSchema.ts

包含行程相关的验证规则：

- **tripFormSchema**: 行程表单验证
  - title: 必填，1-200 个字符
  - startDate: 必填，日期类型
  - endDate: 必填，日期类型，不能早于 startDate
  - 行程时长不能超过 365 天
  - relatedCityId: 可选，UUID 格式
  - relatedWishlistId: 可选，UUID 格式
  - budget: 可选，正数，最大 999999999.99
  - currency: 可选，3 个字符，默认 'CNY'
  - transportation: 可选，最多 200 个字符
  - accommodation: 可选，最多 200 个字符
  - notes: 可选，最多 5000 个字符
  - shareEnabled: 可选，布尔值，默认 false

- **tripUpdateSchema**: 行程更新验证（所有字段可选）

- **tripDayFormSchema**: 行程日程表单验证
  - dayIndex: 必填，正整数，从 1 开始
  - date: 必填，日期类型
  - title: 可选，最多 200 个字符
  - notes: 可选，最多 2000 个字符

- **tripTaskFormSchema**: 行程待办事项表单验证
  - dayId: 可选，UUID 格式
  - content: 必填，1-500 个字符
  - isDone: 可选，布尔值，默认 false

- **tripFilterSchema**: 行程筛选参数验证

- **createShareSchema**: 分享链接创建验证
  - type: 必填，枚举值（all/trip）
  - relatedTripId: 当 type 为 'trip' 时必填

## 验证规则设计原则

1. **安全性优先**: 所有用户输入都必须经过验证
2. **用户友好**: 提供清晰的中文错误消息
3. **类型安全**: 使用 TypeScript 类型推断
4. **业务逻辑**: 包含复杂的业务规则验证（如日期范围、密码一致性等）
5. **可扩展性**: 易于添加新的验证规则

## 常见验证场景

### 文件上传验证

```typescript
// 验证图片文件
coverImage: z.instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, '图片大小不能超过 5MB')
  .refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    '只支持 JPG、PNG、WebP 格式'
  )
  .optional();
```

### 日期范围验证

```typescript
// 验证结束日期不能早于开始日期
.refine(
  (data) => data.endDate >= data.startDate,
  {
    message: '结束日期不能早于开始日期',
    path: ['endDate'],
  }
)
```

### 密码确认验证

```typescript
// 验证两次密码输入一致
.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  }
)
```

### 条件验证

```typescript
// 当分享类型为 'trip' 时，必须提供 relatedTripId
.refine(
  (data) => {
    if (data.type === 'trip') {
      return !!data.relatedTripId;
    }
    return true;
  },
  {
    message: '分享单个行程时必须提供行程 ID',
    path: ['relatedTripId'],
  }
)
```

## 错误处理

### 获取所有错误

```typescript
const result = schema.safeParse(data);

if (!result.success) {
  result.error.errors.forEach((error) => {
    console.log(`字段 ${error.path.join('.')}: ${error.message}`);
  });
}
```

### 获取特定字段错误

```typescript
const result = schema.safeParse(data);

if (!result.success) {
  const emailError = result.error.errors.find((error) => error.path[0] === 'email');

  if (emailError) {
    console.log('邮箱错误:', emailError.message);
  }
}
```

## 测试建议

```typescript
import { describe, it, expect } from 'vitest';
import { loginSchema } from '@/schemas/authSchema';

describe('loginSchema', () => {
  it('应该接受有效的登录数据', () => {
    const validData = {
      email: 'user@example.com',
      password: 'password123',
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('应该拒绝无效的邮箱', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123',
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('应该拒绝过短的密码', () => {
    const invalidData = {
      email: 'user@example.com',
      password: '123',
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```

## 参考资料

- [Zod 官方文档](https://zod.dev/)
- [React Hook Form + Zod 集成](https://react-hook-form.com/get-started#SchemaValidation)
- [需求文档](../../.kiro/specs/journey-hub-platform/requirements.md)
