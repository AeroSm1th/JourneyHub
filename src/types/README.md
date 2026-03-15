# 数据库类型定义

本目录包含 JourneyHub 应用的所有 Supabase 数据库类型定义。

## 文件说明

- **database.ts**: 核心数据库类型定义文件，包含所有表的类型、插入类型、更新类型
- **index.ts**: 类型统一导出文件，方便其他模块导入

## 数据库表结构

### 1. users（用户表）

- `id`: UUID 主键
- `email`: 邮箱（唯一）
- `nickname`: 昵称（可选）
- `avatar_url`: 头像 URL（可选）
- `created_at`: 创建时间

### 2. cities（城市记录表）

- `id`: UUID 主键
- `user_id`: 用户 ID（外键）
- `city_name`: 城市名称
- `country_name`: 国家名称
- `continent`: 大洲
- `latitude`: 纬度
- `longitude`: 经度
- `visited_at`: 访问日期
- `trip_type`: 旅行类型（leisure | business | transit）
- `rating`: 评分（1-5，可选）
- `notes`: 备注（可选）
- `tags`: 标签数组（可选）
- `cover_image`: 封面图片 URL（可选）
- `is_favorite`: 是否收藏
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 3. wishlist_items（愿望清单表）

- `id`: UUID 主键
- `user_id`: 用户 ID（外键）
- `city_name`: 城市名称
- `country_name`: 国家名称
- `continent`: 大洲
- `latitude`: 纬度
- `longitude`: 经度
- `priority`: 优先级（1-5）
- `expected_season`: 期望季节（可选）
- `notes`: 备注（可选）
- `created_at`: 创建时间

### 4. trips（行程表）

- `id`: UUID 主键
- `user_id`: 用户 ID（外键）
- `title`: 行程标题
- `related_city_id`: 关联城市 ID（可选）
- `related_wishlist_id`: 关联愿望清单 ID（可选）
- `start_date`: 开始日期
- `end_date`: 结束日期
- `status`: 状态（planning | ongoing | completed）
- `budget`: 预算（可选）
- `currency`: 货币（可选）
- `transportation`: 交通方式（可选）
- `accommodation`: 住宿信息（可选）
- `notes`: 备注（可选）
- `share_enabled`: 是否启用分享
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 5. trip_days（行程日程表）

- `id`: UUID 主键
- `trip_id`: 行程 ID（外键）
- `day_index`: 日程索引
- `date`: 日期
- `title`: 标题（可选）
- `notes`: 备注（可选）

### 6. trip_tasks（行程待办事项表）

- `id`: UUID 主键
- `trip_id`: 行程 ID（外键）
- `day_id`: 日程 ID（可选）
- `content`: 内容
- `is_done`: 是否完成
- `created_at`: 创建时间

### 7. shares（分享链接表）

- `id`: UUID 主键
- `user_id`: 用户 ID（外键）
- `type`: 分享类型（all | trip）
- `related_trip_id`: 关联行程 ID（可选）
- `slug`: 分享链接标识符（唯一）
- `created_at`: 创建时间

## 使用方法

### 1. 导入类型

```typescript
// 导入单个类型
import type { City, CityInsert, CityUpdate } from '@/types/database';

// 或从 index.ts 导入
import type { City, CityInsert, CityUpdate } from '@/types';
```

### 2. 在 Supabase 客户端中使用

```typescript
import { supabase } from '@/services/supabase/client';
import type { City } from '@/types';

// 查询数据（自动类型推断）
const { data, error } = await supabase
  .from('cities')
  .select('*')
  .order('visited_at', { ascending: false });

// data 的类型会自动推断为 City[]
```

### 3. 插入数据

```typescript
import type { CityInsert } from '@/types';

const newCity: CityInsert = {
  user_id: 'user-uuid',
  city_name: '北京',
  country_name: '中国',
  continent: 'Asia',
  latitude: 39.9042,
  longitude: 116.4074,
  visited_at: '2024-01-15',
  trip_type: 'leisure',
  is_favorite: false,
};

const { data, error } = await supabase.from('cities').insert(newCity).select().single();
```

### 4. 更新数据

```typescript
import type { CityUpdate } from '@/types';

const updates: CityUpdate = {
  rating: 5,
  notes: '非常棒的城市！',
  is_favorite: true,
};

const { data, error } = await supabase
  .from('cities')
  .update(updates)
  .eq('id', cityId)
  .select()
  .single();
```

### 5. 使用辅助类型

```typescript
import type { TableRow, TableInsert, TableUpdate } from '@/types';

// 获取任意表的 Row 类型
type CityRow = TableRow<'cities'>; // 等同于 City

// 获取任意表的 Insert 类型
type CityInsertType = TableInsert<'cities'>; // 等同于 CityInsert

// 获取任意表的 Update 类型
type CityUpdateType = TableUpdate<'cities'>; // 等同于 CityUpdate
```

## 类型安全优势

1. **自动补全**: IDE 会提供字段名称和类型的自动补全
2. **类型检查**: TypeScript 会在编译时检查类型错误
3. **重构安全**: 修改类型定义后，所有使用该类型的代码都会得到类型检查
4. **文档作用**: 类型定义本身就是最好的文档

## 注意事项

1. **日期格式**: 数据库中的日期字段在 TypeScript 中是 `string` 类型，需要手动转换为 `Date` 对象
2. **可选字段**: 标记为 `?` 的字段在数据库中可以为 `NULL`
3. **数组字段**: `tags` 字段是字符串数组类型 `string[]`
4. **枚举类型**: `trip_type`、`status`、`type` 等字段使用字面量联合类型限制可选值

## 更新类型定义

如果数据库表结构发生变化，需要手动更新 `database.ts` 文件中的类型定义。

未来可以使用 Supabase CLI 自动生成类型：

```bash
# 安装 Supabase CLI
npm install -g supabase

# 生成类型定义
supabase gen types typescript --project-id <project-id> > src/types/database.ts
```
