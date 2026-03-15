# Row Level Security (RLS) 配置总结

## 概述

本文档总结了 JourneyHub 项目的 Row Level Security (RLS) 策略配置，确保数据安全和用户隔离。

## 配置文件

- **rls-policies.sql**: 完整的 RLS 策略配置脚本
- **test-rls-policies.sql**: RLS 策略测试脚本
- **supabase-setup-guide.md**: Supabase 项目配置指南（包含 RLS 配置步骤）

## RLS 策略架构

### 三层安全模型

```
┌─────────────────────────────────────────────────────────┐
│                    1. 用户数据隔离层                      │
│  - 用户只能访问自己创建的数据                              │
│  - 基于 auth.uid() = user_id 验证                        │
│  - 适用于：users, cities, wishlist_items, trips, shares │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    2. 级联权限验证层                      │
│  - 子表权限依赖于父表所有权                               │
│  - 使用 EXISTS 子查询验证父表                            │
│  - 适用于：trip_days, trip_tasks                        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    3. 公开分享访问层                      │
│  - 通过 shares 表控制数据公开访问                         │
│  - 支持 'all' 和 'trip' 两种分享类型                     │
│  - 仅允许 SELECT 操作，不允许修改                         │
└─────────────────────────────────────────────────────────┘
```

## 策略详细说明

### 1. users 表策略

| 策略名称 | 操作类型 | 说明 |
|---------|---------|------|
| Users can view their own profile | SELECT | 用户可以查看自己的个人信息 |
| Users can insert their own profile | INSERT | 用户可以创建自己的个人信息（注册时） |
| Users can update their own profile | UPDATE | 用户可以更新自己的个人信息 |

**验证条件**: `auth.uid() = id`

### 2. cities 表策略

| 策略名称 | 操作类型 | 说明 |
|---------|---------|------|
| Users can view their own cities | SELECT | 用户可以查看自己的城市记录 |
| Users can insert their own cities | INSERT | 用户可以创建自己的城市记录 |
| Users can update their own cities | UPDATE | 用户可以更新自己的城市记录 |
| Users can delete their own cities | DELETE | 用户可以删除自己的城市记录 |
| Public can view shared cities | SELECT | 公开访问分享的城市记录 |

**用户数据隔离**: `auth.uid() = user_id`

**公开分享条件**:
- 存在 'all' 类型的分享链接：允许查看该用户的所有城市
- 存在 'trip' 类型的分享链接：允许查看该行程关联的城市

### 3. wishlist_items 表策略

| 策略名称 | 操作类型 | 说明 |
|---------|---------|------|
| Users can view their own wishlist | SELECT | 用户可以查看自己的愿望清单 |
| Users can insert their own wishlist items | INSERT | 用户可以添加愿望清单项目 |
| Users can update their own wishlist items | UPDATE | 用户可以更新愿望清单项目 |
| Users can delete their own wishlist items | DELETE | 用户可以删除愿望清单项目 |
| Public can view shared wishlist items | SELECT | 公开访问分享的愿望清单 |

**用户数据隔离**: `auth.uid() = user_id`

**公开分享条件**:
- 存在 'all' 类型的分享链接：允许查看该用户的所有愿望清单

### 4. trips 表策略

| 策略名称 | 操作类型 | 说明 |
|---------|---------|------|
| Users can view their own trips | SELECT | 用户可以查看自己的行程 |
| Users can insert their own trips | INSERT | 用户可以创建自己的行程 |
| Users can update their own trips | UPDATE | 用户可以更新自己的行程 |
| Users can delete their own trips | DELETE | 用户可以删除自己的行程 |
| Public can view shared trips | SELECT | 公开访问分享的行程 |

**用户数据隔离**: `auth.uid() = user_id`

**公开分享条件**:
- 存在 'all' 类型的分享链接：允许查看该用户的所有行程
- 存在 'trip' 类型的分享链接：允许查看该特定行程

### 5. trip_days 表策略（级联权限）

| 策略名称 | 操作类型 | 说明 |
|---------|---------|------|
| Users can view their own trip days | SELECT | 用户可以查看自己行程的日程 |
| Users can insert their own trip days | INSERT | 用户可以添加行程日程 |
| Users can update their own trip days | UPDATE | 用户可以更新行程日程 |
| Users can delete their own trip days | DELETE | 用户可以删除行程日程 |
| Public can view shared trip days | SELECT | 公开访问分享的行程日程 |

**级联权限验证**:
```sql
EXISTS (
  SELECT 1 FROM trips
  WHERE trips.id = trip_days.trip_id
  AND trips.user_id = auth.uid()
)
```

**公开分享条件**:
- 通过 trips 表和 shares 表的 JOIN 验证分享权限

### 6. trip_tasks 表策略（级联权限）

| 策略名称 | 操作类型 | 说明 |
|---------|---------|------|
| Users can view their own trip tasks | SELECT | 用户可以查看自己行程的任务 |
| Users can insert their own trip tasks | INSERT | 用户可以添加行程任务 |
| Users can update their own trip tasks | UPDATE | 用户可以更新行程任务 |
| Users can delete their own trip tasks | DELETE | 用户可以删除行程任务 |
| Public can view shared trip tasks | SELECT | 公开访问分享的行程任务 |

**级联权限验证**:
```sql
EXISTS (
  SELECT 1 FROM trips
  WHERE trips.id = trip_tasks.trip_id
  AND trips.user_id = auth.uid()
)
```

**公开分享条件**:
- 通过 trips 表和 shares 表的 JOIN 验证分享权限

### 7. shares 表策略

| 策略名称 | 操作类型 | 说明 |
|---------|---------|------|
| Anyone can view shares | SELECT | 任何人都可以查看分享记录（验证分享链接有效性） |
| Users can insert their own shares | INSERT | 用户可以创建自己的分享链接 |
| Users can update their own shares | UPDATE | 用户可以更新自己的分享链接 |
| Users can delete their own shares | DELETE | 用户可以删除（撤销）自己的分享链接 |

**公开访问**: `USING (true)` - 允许所有人查看分享记录

**用户数据隔离**: `auth.uid() = user_id` - 只能管理自己的分享

## 分享功能详解

### 分享类型

#### 1. 'all' 类型分享

分享用户的所有数据，包括：
- 所有城市记录（cities）
- 所有愿望清单项目（wishlist_items）
- 所有行程（trips）
- 所有行程日程（trip_days）
- 所有行程任务（trip_tasks）

**使用场景**: 用户想要公开展示自己的完整旅行足迹

**SQL 示例**:
```sql
INSERT INTO shares (user_id, type, slug)
VALUES (auth.uid(), 'all', 'my-travel-journey');
```

#### 2. 'trip' 类型分享

只分享特定的行程及其关联数据，包括：
- 该行程的基本信息（trips）
- 该行程关联的城市（cities）
- 该行程的日程（trip_days）
- 该行程的任务（trip_tasks）

**使用场景**: 用户想要分享某次特定的旅行计划

**SQL 示例**:
```sql
INSERT INTO shares (user_id, type, related_trip_id, slug)
VALUES (auth.uid(), 'trip', '行程UUID', 'my-beijing-trip-2024');
```

### 分享链接格式

```
https://your-domain.com/share/{slug}
```

例如：
- `https://journeyhub.com/share/user-a-all-data`
- `https://journeyhub.com/share/beijing-trip-2024`

### 撤销分享

删除 shares 表中的记录即可撤销分享：

```sql
DELETE FROM shares
WHERE slug = 'my-travel-journey'
AND user_id = auth.uid();
```

撤销后，公开访问策略将不再允许访问该数据。

## 安全性保证

### 1. 数据隔离

✅ **保证**: 用户 A 无法访问用户 B 的数据
- 所有表都使用 `auth.uid() = user_id` 验证
- RLS 在数据库层面强制执行，无法绕过

### 2. 级联权限

✅ **保证**: 用户只能访问自己行程的子数据
- trip_days 和 trip_tasks 通过 trips 表验证所有权
- 使用 EXISTS 子查询确保父表权限

### 3. 公开访问限制

✅ **保证**: 公开访问只能查看数据，不能修改
- 公开访问策略只适用于 SELECT 操作
- INSERT/UPDATE/DELETE 操作仍需要用户认证

### 4. 分享控制

✅ **保证**: 用户完全控制数据分享
- 只有数据所有者可以创建分享链接
- 只有数据所有者可以撤销分享链接
- 撤销后立即生效，无延迟

## 性能优化

### 关键索引

确保以下索引已创建以优化 RLS 策略性能：

```sql
-- 用户数据隔离查询
CREATE INDEX idx_cities_user_id ON cities(user_id);
CREATE INDEX idx_wishlist_user_id ON wishlist_items(user_id);
CREATE INDEX idx_trips_user_id ON trips(user_id);

-- 级联权限查询
CREATE INDEX idx_trip_days_trip_id ON trip_days(trip_id);
CREATE INDEX idx_trip_tasks_trip_id ON trip_tasks(trip_id);

-- 分享链接查询
CREATE INDEX idx_shares_slug ON shares(slug);
CREATE INDEX idx_shares_user_id ON shares(user_id);
```

### 查询优化建议

1. **避免全表扫描**: 始终在查询中包含 user_id 条件
2. **使用 EXISTS 而非 IN**: EXISTS 子查询通常比 IN 子查询更高效
3. **限制返回结果**: 使用 LIMIT 和 OFFSET 进行分页
4. **监控慢查询**: 定期检查 Supabase 的 Query Performance 面板

## 测试清单

### 基础测试

- [ ] 用户 A 可以查看自己的数据
- [ ] 用户 A 无法查看用户 B 的数据
- [ ] 用户 A 可以创建自己的数据
- [ ] 用户 A 可以更新自己的数据
- [ ] 用户 A 可以删除自己的数据

### 分享功能测试

- [ ] 用户 A 可以创建 'all' 类型分享链接
- [ ] 未登录用户可以通过分享链接查看数据
- [ ] 未登录用户无法修改分享的数据
- [ ] 用户 A 可以撤销分享链接
- [ ] 撤销后，未登录用户无法访问数据
- [ ] 用户 A 可以创建 'trip' 类型分享链接
- [ ] 'trip' 类型分享只公开特定行程数据

### 级联权限测试

- [ ] 用户 A 可以管理自己行程的日程
- [ ] 用户 A 可以管理自己行程的任务
- [ ] 用户 A 无法访问用户 B 行程的日程
- [ ] 用户 A 无法访问用户 B 行程的任务

### 边界条件测试

- [ ] 未登录用户无法访问任何私有数据
- [ ] 删除行程时，关联的日程和任务被级联删除
- [ ] 删除用户时，所有关联数据被级联删除
- [ ] 分享链接的 slug 必须唯一

## 故障排查

### 问题 1: RLS 策略不生效

**症状**: 用户可以看到其他用户的数据

**排查步骤**:
1. 检查表是否启用了 RLS：
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public' AND tablename = 'cities';
   ```
2. 检查策略是否存在：
   ```sql
   SELECT policyname FROM pg_policies
   WHERE schemaname = 'public' AND tablename = 'cities';
   ```
3. 检查用户是否已登录（auth.uid() 不为空）
4. 重新执行 rls-policies.sql 脚本

### 问题 2: 公开分享无法访问

**症状**: 访问分享链接时返回空数据或权限错误

**排查步骤**:
1. 检查 shares 表中是否存在对应记录：
   ```sql
   SELECT * FROM shares WHERE slug = 'your-slug';
   ```
2. 检查公开访问策略是否存在：
   ```sql
   SELECT * FROM pg_policies
   WHERE tablename = 'cities'
   AND policyname = 'Public can view shared cities';
   ```
3. 使用 EXPLAIN ANALYZE 分析查询计划
4. 检查分享类型和 related_trip_id 是否正确

### 问题 3: 级联权限失败

**症状**: 用户无法访问自己行程的日程或任务

**排查步骤**:
1. 检查 trip_id 是否正确
2. 检查 trips 表中的 user_id 是否匹配
3. 验证 EXISTS 子查询逻辑：
   ```sql
   SELECT EXISTS (
     SELECT 1 FROM trips
     WHERE trips.id = 'your-trip-id'
     AND trips.user_id = auth.uid()
   );
   ```
4. 检查外键约束是否正确配置

## 维护建议

### 定期检查

1. **每月**: 检查 RLS 策略是否仍然有效
2. **每季度**: 审查慢查询日志，优化索引
3. **每半年**: 进行完整的安全审计

### 更新策略

如果需要修改 RLS 策略：

1. 先在测试环境验证新策略
2. 使用 `DROP POLICY IF EXISTS` 删除旧策略
3. 创建新策略
4. 运行测试脚本验证
5. 在生产环境应用更改

### 监控指标

- RLS 策略执行时间
- 慢查询数量
- 权限拒绝错误数量
- 分享链接访问量

## 参考资源

- [Supabase RLS 官方文档](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS 文档](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)

## 总结

JourneyHub 的 RLS 策略配置实现了：

✅ **完整的数据隔离**: 用户只能访问自己的数据  
✅ **灵活的分享功能**: 支持全部数据和特定行程的分享  
✅ **严格的权限控制**: 级联权限确保子数据的安全  
✅ **高性能查询**: 通过索引优化提升查询效率  
✅ **易于测试**: 提供完整的测试脚本和测试清单  

所有策略都在数据库层面强制执行，确保数据安全性和隐私保护。
