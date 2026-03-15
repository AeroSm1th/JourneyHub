# 数据库表结构快速参考

本文档提供 JourneyHub 数据库表结构的快速参考。

## 表关系图

```
users (用户)
  ├── cities (城市记录) [1:N]
  ├── wishlist_items (愿望清单) [1:N]
  ├── trips (行程) [1:N]
  └── shares (分享链接) [1:N]

trips (行程)
  ├── trip_days (日程) [1:N]
  ├── trip_tasks (任务) [1:N]
  ├── related_city_id → cities [N:1]
  └── related_wishlist_id → wishlist_items [N:1]

trip_days (日程)
  └── trip_tasks (任务) [1:N]
```

## 表结构详情

### 1. users - 用户表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 用户唯一标识 |
| email | TEXT | UNIQUE, NOT NULL | 用户邮箱 |
| nickname | TEXT | - | 用户昵称 |
| avatar_url | TEXT | - | 头像 URL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |

**索引**: 无额外索引

**RLS 策略**:
- 用户可以查看和更新自己的信息

---

### 2. cities - 城市记录表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 记录唯一标识 |
| user_id | UUID | FK → users, NOT NULL | 所属用户 |
| city_name | TEXT | NOT NULL | 城市名称 |
| country_name | TEXT | NOT NULL | 国家名称 |
| continent | TEXT | NOT NULL | 所属大洲 |
| latitude | DECIMAL(10,8) | NOT NULL | 纬度 |
| longitude | DECIMAL(11,8) | NOT NULL | 经度 |
| visited_at | DATE | NOT NULL | 访问日期 |
| trip_type | TEXT | CHECK | 旅行类型: leisure/business/transit |
| rating | INTEGER | CHECK (1-5) | 评分 |
| notes | TEXT | - | 备注 |
| tags | TEXT[] | - | 标签数组 |
| cover_image | TEXT | - | 封面图片 URL |
| is_favorite | BOOLEAN | DEFAULT FALSE | 是否收藏 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |

**索引**:
- `idx_cities_user_id` ON user_id
- `idx_cities_visited_at` ON visited_at
- `idx_cities_continent` ON continent
- `idx_cities_country_name` ON country_name

**RLS 策略**:
- 用户只能查看、创建、更新、删除自己的城市记录

**触发器**:
- `update_cities_updated_at`: 自动更新 updated_at 字段

---

### 3. wishlist_items - 愿望清单表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 记录唯一标识 |
| user_id | UUID | FK → users, NOT NULL | 所属用户 |
| city_name | TEXT | NOT NULL | 城市名称 |
| country_name | TEXT | NOT NULL | 国家名称 |
| continent | TEXT | NOT NULL | 所属大洲 |
| latitude | DECIMAL(10,8) | NOT NULL | 纬度 |
| longitude | DECIMAL(11,8) | NOT NULL | 经度 |
| priority | INTEGER | CHECK (1-5), DEFAULT 3 | 优先级 |
| expected_season | TEXT | - | 期望季节 |
| notes | TEXT | - | 备注 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |

**索引**:
- `idx_wishlist_user_id` ON user_id
- `idx_wishlist_priority` ON priority

**RLS 策略**:
- 用户只能管理自己的愿望清单

---

### 4. trips - 行程表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 行程唯一标识 |
| user_id | UUID | FK → users, NOT NULL | 所属用户 |
| title | TEXT | NOT NULL | 行程标题 |
| related_city_id | UUID | FK → cities, NULL | 关联城市记录 |
| related_wishlist_id | UUID | FK → wishlist_items, NULL | 关联愿望清单 |
| start_date | DATE | NOT NULL | 开始日期 |
| end_date | DATE | NOT NULL | 结束日期 |
| status | TEXT | CHECK, DEFAULT 'planning' | 状态: planning/ongoing/completed |
| budget | DECIMAL(12,2) | - | 预算 |
| currency | TEXT | DEFAULT 'CNY' | 货币单位 |
| transportation | TEXT | - | 交通方式 |
| accommodation | TEXT | - | 住宿信息 |
| notes | TEXT | - | 备注 |
| share_enabled | BOOLEAN | DEFAULT FALSE | 是否启用分享 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |

**约束**:
- `valid_date_range`: end_date >= start_date

**索引**:
- `idx_trips_user_id` ON user_id
- `idx_trips_start_date` ON start_date
- `idx_trips_status` ON status

**RLS 策略**:
- 用户只能管理自己的行程

**触发器**:
- `update_trips_updated_at`: 自动更新 updated_at 字段

---

### 5. trip_days - 行程日程表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 日程唯一标识 |
| trip_id | UUID | FK → trips, NOT NULL | 所属行程 |
| day_index | INTEGER | NOT NULL | 第几天（从 1 开始） |
| date | DATE | NOT NULL | 日期 |
| title | TEXT | - | 当天标题 |
| notes | TEXT | - | 当天备注 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |

**约束**:
- UNIQUE(trip_id, day_index): 每个行程的 day_index 唯一

**索引**:
- `idx_trip_days_trip_id` ON trip_id
- `idx_trip_days_date` ON date

**RLS 策略**:
- 用户只能管理自己行程的日程（通过 trips 表关联验证）

---

### 6. trip_tasks - 行程任务表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 任务唯一标识 |
| trip_id | UUID | FK → trips, NOT NULL | 所属行程 |
| day_id | UUID | FK → trip_days, NULL | 关联日程（可选） |
| content | TEXT | NOT NULL | 任务内容 |
| is_done | BOOLEAN | DEFAULT FALSE | 是否完成 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |

**索引**:
- `idx_trip_tasks_trip_id` ON trip_id
- `idx_trip_tasks_day_id` ON day_id
- `idx_trip_tasks_is_done` ON is_done

**RLS 策略**:
- 用户只能管理自己行程的任务（通过 trips 表关联验证）

---

### 7. shares - 分享链接表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 分享记录唯一标识 |
| user_id | UUID | FK → users, NOT NULL | 分享者 |
| type | TEXT | CHECK, NOT NULL | 分享类型: all/trip |
| related_trip_id | UUID | FK → trips, NULL | 关联行程（type=trip 时） |
| slug | TEXT | UNIQUE, NOT NULL | 分享链接标识符 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |

**索引**:
- `idx_shares_slug` ON slug
- `idx_shares_user_id` ON user_id

**RLS 策略**:
- 任何人都可以查看分享（用于公开访问）
- 用户只能创建、更新、删除自己的分享

---

## 存储桶 (Storage Buckets)

### 1. city-images

**用途**: 存储城市封面图片

**路径格式**: `{user_id}/{timestamp}-{filename}`

**访问策略**:
- 用户可以上传自己的图片
- 所有人可以查看图片
- 用户可以删除自己的图片

**配置**:
- Public: 是
- File size limit: 5MB
- Allowed MIME types: image/jpeg, image/png, image/webp

---

### 2. user-avatars

**用途**: 存储用户头像

**路径格式**: `{user_id}/avatar.{ext}`

**访问策略**:
- 用户可以上传自己的头像
- 所有人可以查看头像
- 用户可以删除自己的头像

**配置**:
- Public: 是
- File size limit: 2MB
- Allowed MIME types: image/jpeg, image/png, image/webp

---

## 常用查询示例

### 查询用户的所有城市记录（按访问日期降序）

```sql
SELECT * FROM cities
WHERE user_id = '{user_id}'
ORDER BY visited_at DESC;
```

### 查询用户访问过的国家数量

```sql
SELECT COUNT(DISTINCT country_name) as country_count
FROM cities
WHERE user_id = '{user_id}';
```

### 查询用户每个大洲的城市数量

```sql
SELECT continent, COUNT(*) as city_count
FROM cities
WHERE user_id = '{user_id}'
GROUP BY continent
ORDER BY city_count DESC;
```

### 查询用户的进行中行程

```sql
SELECT * FROM trips
WHERE user_id = '{user_id}'
AND status = 'ongoing'
ORDER BY start_date ASC;
```

### 查询行程的所有日程和任务

```sql
SELECT 
  td.day_index,
  td.date,
  td.title as day_title,
  tt.content as task_content,
  tt.is_done
FROM trip_days td
LEFT JOIN trip_tasks tt ON tt.day_id = td.id
WHERE td.trip_id = '{trip_id}'
ORDER BY td.day_index, tt.created_at;
```

### 查询用户的愿望清单（按优先级降序）

```sql
SELECT * FROM wishlist_items
WHERE user_id = '{user_id}'
ORDER BY priority DESC, created_at DESC;
```

### 查询分享链接的详细信息

```sql
SELECT 
  s.*,
  u.nickname as owner_nickname,
  t.title as trip_title
FROM shares s
JOIN users u ON u.id = s.user_id
LEFT JOIN trips t ON t.id = s.related_trip_id
WHERE s.slug = '{slug}';
```

---

## TypeScript 类型定义参考

```typescript
// 用户
interface User {
  id: string;
  email: string;
  nickname?: string;
  avatarUrl?: string;
  createdAt: string;
}

// 城市记录
interface City {
  id: string;
  userId: string;
  cityName: string;
  countryName: string;
  continent: string;
  latitude: number;
  longitude: number;
  visitedAt: string;
  tripType: 'leisure' | 'business' | 'transit';
  rating?: number;
  notes?: string;
  tags?: string[];
  coverImage?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

// 愿望清单
interface WishlistItem {
  id: string;
  userId: string;
  cityName: string;
  countryName: string;
  continent: string;
  latitude: number;
  longitude: number;
  priority: number;
  expectedSeason?: string;
  notes?: string;
  createdAt: string;
}

// 行程
interface Trip {
  id: string;
  userId: string;
  title: string;
  relatedCityId?: string;
  relatedWishlistId?: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'ongoing' | 'completed';
  budget?: number;
  currency?: string;
  transportation?: string;
  accommodation?: string;
  notes?: string;
  shareEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// 行程日程
interface TripDay {
  id: string;
  tripId: string;
  dayIndex: number;
  date: string;
  title?: string;
  notes?: string;
  createdAt: string;
}

// 行程任务
interface TripTask {
  id: string;
  tripId: string;
  dayId?: string;
  content: string;
  isDone: boolean;
  createdAt: string;
}

// 分享链接
interface Share {
  id: string;
  userId: string;
  type: 'all' | 'trip';
  relatedTripId?: string;
  slug: string;
  createdAt: string;
}
```

---

## 数据迁移注意事项

如果需要修改表结构，请遵循以下原则：

1. **添加字段**: 使用 `ALTER TABLE ADD COLUMN`，设置默认值
2. **删除字段**: 先确认没有代码依赖，再使用 `ALTER TABLE DROP COLUMN`
3. **修改字段类型**: 使用 `ALTER TABLE ALTER COLUMN TYPE`，注意数据兼容性
4. **添加约束**: 先清理不符合约束的数据，再添加约束
5. **修改 RLS 策略**: 先删除旧策略，再创建新策略

### 迁移脚本示例

```sql
-- 添加新字段
ALTER TABLE cities ADD COLUMN IF NOT EXISTS weather TEXT;

-- 修改字段类型
ALTER TABLE cities ALTER COLUMN rating TYPE SMALLINT;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_cities_is_favorite ON cities(is_favorite);

-- 删除索引
DROP INDEX IF EXISTS idx_cities_old_field;

-- 更新 RLS 策略
DROP POLICY IF EXISTS "old_policy_name" ON cities;
CREATE POLICY "new_policy_name" ON cities FOR SELECT USING (auth.uid() = user_id);
```
