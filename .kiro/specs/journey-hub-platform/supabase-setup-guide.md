# Supabase 项目配置指南

本指南将帮助您在 Supabase 控制台创建项目并配置数据库。

## 第一步：创建 Supabase 项目

1. 访问 [Supabase 控制台](https://app.supabase.com/)
2. 点击 "New Project" 按钮
3. 填写项目信息：
   - **Name**: `journey-hub` 或您喜欢的名称
   - **Database Password**: 设置一个强密码（请妥善保管）
   - **Region**: 选择离您最近的区域（建议选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`）
   - **Pricing Plan**: 选择 Free 或 Pro 计划
4. 点击 "Create new project" 按钮
5. 等待项目初始化完成（通常需要 1-2 分钟）

## 第二步：执行数据库初始化脚本

1. 在项目控制台左侧菜单中，点击 **SQL Editor**
2. 点击 "New query" 创建新查询
3. 打开本目录下的 `database-setup.sql` 文件
4. 复制文件中的所有 SQL 代码
5. 粘贴到 SQL Editor 中
6. 点击右下角的 "Run" 按钮执行脚本
7. 等待执行完成，确认没有错误提示

### 验证数据库表创建

执行完脚本后，您可以验证表是否创建成功：

1. 在左侧菜单点击 **Table Editor**
2. 您应该能看到以下 7 个表：
   - `users` - 用户信息表
   - `cities` - 城市记录表
   - `wishlist_items` - 愿望清单表
   - `trips` - 行程表
   - `trip_days` - 行程日程表
   - `trip_tasks` - 行程任务表
   - `shares` - 分享链接表

## 第三步：配置存储桶（Storage Buckets）

### 创建 city-images 存储桶

1. 在左侧菜单点击 **Storage**
2. 点击 "Create a new bucket" 按钮
3. 填写信息：
   - **Name**: `city-images`
   - **Public bucket**: 勾选（允许公开访问）
4. 点击 "Create bucket"

### 配置 city-images 访问策略

1. 点击刚创建的 `city-images` 存储桶
2. 点击 "Policies" 标签
3. 点击 "New Policy" 按钮

#### 策略 1：允许用户上传图片

- **Policy name**: `Users can upload their own images`
- **Allowed operation**: INSERT
- **Policy definition**:
  ```sql
  (bucket_id = 'city-images'::text) AND (auth.uid()::text = (storage.foldername(name))[1])
  ```

#### 策略 2：允许所有人查看图片

- **Policy name**: `Anyone can view images`
- **Allowed operation**: SELECT
- **Policy definition**:
  ```sql
  bucket_id = 'city-images'::text
  ```

#### 策略 3：允许用户删除自己的图片

- **Policy name**: `Users can delete their own images`
- **Allowed operation**: DELETE
- **Policy definition**:
  ```sql
  (bucket_id = 'city-images'::text) AND (auth.uid()::text = (storage.foldername(name))[1])
  ```

### 创建 user-avatars 存储桶

重复上述步骤，创建 `user-avatars` 存储桶，并配置相同的访问策略（将策略中的 `city-images` 替换为 `user-avatars`）。

## 第四步：配置认证设置

### 启用邮箱密码认证

1. 在左侧菜单点击 **Authentication**
2. 点击 **Providers** 标签
3. 找到 "Email" 提供商
4. 确保 "Enable Email provider" 已勾选
5. 配置以下选项：
   - **Confirm email**: 建议在开发阶段关闭，生产环境开启
   - **Secure email change**: 建议开启
   - **Secure password change**: 建议开启

### 配置邮件模板（可选）

1. 点击 **Email Templates** 标签
2. 您可以自定义以下邮件模板：
   - Confirm signup（确认注册）
   - Magic Link（魔法链接登录）
   - Change Email Address（更改邮箱）
   - Reset Password（重置密码）

## 第五步：获取项目配置信息

1. 在左侧菜单点击 **Settings**
2. 点击 **API** 标签
3. 记录以下信息（稍后需要配置到应用中）：

   - **Project URL**: `https://tbagmnjgpvpzuxufecdh.supabase.co
   `
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiYWdtbmpncHZwdXp1eGZlY2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTExMDksImV4cCI6MjA4OTEyNzEwOX0.Miq5UdsZnhtk6hrYjVAqrw3FVAL96QKBY7zoIKZxtwk`

4. 在项目根目录创建 `.env` 文件，添加以下内容：

   ```env
   VITE_SUPABASE_URL=https://tbagmnjgpvpzuxufecdh.supabase.co
   
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiYWdtbmpncHZwdXp1eGZlY2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTExMDksImV4cCI6MjA4OTEyNzEwOX0.Miq5UdsZnhtk6hrYjVAqrw3FVAL96QKBY7zoIKZxtwk
   ```

## 第六步：测试数据库连接

### 方法 1：在 SQL Editor 中测试

在 SQL Editor 中执行以下查询，验证表结构：

```sql
-- 查看所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 查看 cities 表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cities';

-- 测试 RLS 策略（需要先创建测试用户）
SELECT * FROM cities;
```

### 方法 2：在应用中测试

在应用代码中测试连接：

```typescript
// src/services/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 测试连接
const testConnection = async () => {
  const { data, error } = await supabase.from('cities').select('count');
  if (error) {
    console.error('连接失败:', error);
  } else {
    console.log('连接成功!');
  }
};
```

## 第七步：配置 Row Level Security (RLS) 策略

### 执行 RLS 策略脚本

1. 在项目控制台左侧菜单中，点击 **SQL Editor**
2. 点击 "New query" 创建新查询
3. 打开本目录下的 `rls-policies.sql` 文件
4. 复制文件中的所有 SQL 代码
5. 粘贴到 SQL Editor 中
6. 点击右下角的 "Run" 按钮执行脚本
7. 等待执行完成，确认没有错误提示

### 验证 RLS 策略配置

执行以下 SQL 查询验证 RLS 是否正确配置：

```sql
-- 查看所有表的 RLS 状态
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'cities', 'wishlist_items', 'trips', 'trip_days', 'trip_tasks', 'shares')
ORDER BY tablename;
```

所有表的 `rowsecurity` 列应该显示 `true`。

```sql
-- 查看所有 RLS 策略
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

您应该能看到以下策略：

**users 表**：
- Users can view their own profile (SELECT)
- Users can insert their own profile (INSERT)
- Users can update their own profile (UPDATE)

**cities 表**：
- Users can view their own cities (SELECT)
- Users can insert their own cities (INSERT)
- Users can update their own cities (UPDATE)
- Users can delete their own cities (DELETE)
- Public can view shared cities (SELECT)

**wishlist_items 表**：
- Users can view their own wishlist (SELECT)
- Users can insert their own wishlist items (INSERT)
- Users can update their own wishlist items (UPDATE)
- Users can delete their own wishlist items (DELETE)
- Public can view shared wishlist items (SELECT)

**trips 表**：
- Users can view their own trips (SELECT)
- Users can insert their own trips (INSERT)
- Users can update their own trips (UPDATE)
- Users can delete their own trips (DELETE)
- Public can view shared trips (SELECT)

**trip_days 表**：
- Users can view their own trip days (SELECT)
- Users can insert their own trip days (INSERT)
- Users can update their own trip days (UPDATE)
- Users can delete their own trip days (DELETE)
- Public can view shared trip days (SELECT)

**trip_tasks 表**：
- Users can view their own trip tasks (SELECT)
- Users can insert their own trip tasks (INSERT)
- Users can update their own trip tasks (UPDATE)
- Users can delete their own trip tasks (DELETE)
- Public can view shared trip tasks (SELECT)

**shares 表**：
- Anyone can view shares (SELECT)
- Users can insert their own shares (INSERT)
- Users can update their own shares (UPDATE)
- Users can delete their own shares (DELETE)

### RLS 策略说明

#### 1. 用户数据隔离策略

所有表都配置了基于 `auth.uid()` 的数据隔离策略，确保：
- 用户只能查看、创建、修改、删除自己的数据
- 使用 `USING (auth.uid() = user_id)` 子句验证所有权
- 使用 `WITH CHECK (auth.uid() = user_id)` 子句验证插入和更新的数据

#### 2. 级联权限策略

子表（trip_days、trip_tasks）通过父表（trips）验证权限：
- 使用 `EXISTS` 子查询检查父表的所有权
- 确保用户只能访问自己行程的日程和任务

#### 3. 公开分享策略

所有表都配置了公开访问策略，支持数据分享功能：
- **'all' 类型分享**：允许查看用户的所有数据（城市、愿望清单、行程）
- **'trip' 类型分享**：只允许查看特定行程及其关联数据
- 公开访问仅限于 SELECT 操作，不允许修改数据
- 通过 shares 表控制分享的启用和撤销

## 第八步：测试 RLS 策略

### 创建测试用户

1. 在左侧菜单点击 **Authentication**
2. 点击 **Users** 标签
3. 点击 "Add user" 按钮
4. 选择 "Create new user"
5. 创建两个测试用户：
   - 用户 A: `user_a@test.com` / `password123`
   - 用户 B: `user_b@test.com` / `password123`
6. 点击 "Create user"

### 测试数据隔离

#### 测试 1：用户只能访问自己的数据

1. 使用用户 A 登录应用
2. 创建一条城市记录
3. 在应用中查看城市列表，确认可以看到自己的记录
4. 退出登录，使用用户 B 登录
5. 查看城市列表，确认看不到用户 A 的记录
6. 创建用户 B 自己的城市记录
7. 确认只能看到自己的记录

#### 测试 2：验证写操作权限

1. 使用用户 A 登录
2. 尝试修改自己的城市记录（应该成功）
3. 尝试删除自己的城市记录（应该成功）

### 测试公开分享

#### 测试 3：创建和访问分享链接

1. 使用用户 A 登录应用
2. 创建一个分享链接（类型：'all'）
3. 记录生成的分享 URL（例如：`/share/user-a-all-data`）
4. 退出登录（或使用隐身模式）
5. 访问分享 URL
6. 确认可以查看用户 A 的数据
7. 确认无法修改数据（所有编辑按钮应该被隐藏或禁用）

#### 测试 4：撤销分享

1. 使用用户 A 登录
2. 删除之前创建的分享链接
3. 退出登录
4. 再次访问分享 URL
5. 确认无法访问数据（应该显示 404 或权限错误）

### 测试级联权限

#### 测试 5：行程子数据访问

1. 使用用户 A 登录
2. 创建一个行程
3. 为行程添加日程（trip_days）
4. 为行程添加任务（trip_tasks）
5. 确认可以正常查看和修改
6. 退出登录，使用用户 B 登录
7. 确认无法访问用户 A 的行程子数据

### 使用测试脚本

您也可以使用提供的测试脚本进行自动化测试：

1. 在 SQL Editor 中打开 `test-rls-policies.sql` 文件
2. 根据实际创建的测试用户 UUID 修改脚本中的用户 ID
3. 逐步执行测试脚本
4. 查看测试结果，确认所有测试通过

### 测试结果验证

所有测试应该满足以下条件：
- ✅ 用户只能访问自己的数据
- ✅ 用户无法访问其他用户的数据
- ✅ 公开分享链接可以被未登录用户访问
- ✅ 公开访问只能查看数据，不能修改
- ✅ 撤销分享后，公开访问被正确拒绝
- ✅ 子表的权限正确依赖于父表

## 常见问题

### Q1: 执行 SQL 脚本时出现权限错误

**A**: 确保您使用的是项目所有者账号，并且项目已完全初始化完成。

### Q2: RLS 策略不生效

**A**: 检查以下几点：
- 确认表已启用 RLS（执行 `rls-policies.sql` 脚本）
- 确认策略已正确创建（使用验证查询检查）
- 确认用户已登录（`auth.uid()` 不为空）
- 在 SQL Editor 中测试策略逻辑
- 检查策略的 USING 和 WITH CHECK 子句是否正确
- 确认没有策略冲突（多个策略可能相互影响）

### Q3: 公开分享无法访问

**A**: 检查以下几点：
- 确认 shares 表中存在对应的分享记录
- 确认分享记录的 slug 正确
- 确认公开访问策略已创建（"Public can view shared ..." 策略）
- 检查分享类型（'all' 或 'trip'）是否正确
- 对于 'trip' 类型分享，确认 related_trip_id 正确关联
- 使用 SQL 查询验证策略逻辑

### Q3: 存储桶上传失败

**A**: 检查以下几点：
- 确认存储桶已创建并设置为 public
- 确认访问策略已正确配置
- 确认文件路径格式正确（应为 `{user_id}/{filename}`）
- 检查文件大小是否超过限制（Free 计划限制 50MB）

### Q4: 无法连接到数据库

**A**: 检查以下几点：
- 确认 `.env` 文件中的 URL 和 Key 正确
- 确认项目状态为 "Active"
- 检查网络连接
- 查看浏览器控制台是否有 CORS 错误

## 第九步：性能优化建议

### 索引优化

RLS 策略会影响查询性能，确保以下索引已创建：

```sql
-- 验证索引是否存在
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('cities', 'wishlist_items', 'trips', 'trip_days', 'trip_tasks', 'shares')
ORDER BY tablename, indexname;
```

关键索引：
- `idx_cities_user_id` - 用于用户数据隔离查询
- `idx_trips_user_id` - 用于行程权限验证
- `idx_shares_slug` - 用于分享链接查询
- `idx_trip_days_trip_id` - 用于级联权限查询
- `idx_trip_tasks_trip_id` - 用于级联权限查询

### 查询性能分析

使用 EXPLAIN ANALYZE 分析查询性能：

```sql
-- 分析用户城市查询
EXPLAIN ANALYZE
SELECT * FROM cities
WHERE user_id = auth.uid();

-- 分析公开分享查询
EXPLAIN ANALYZE
SELECT * FROM cities
WHERE user_id IN (
  SELECT user_id FROM shares WHERE slug = 'test-slug' AND type = 'all'
);
```

### 监控建议

1. 在 Supabase 控制台的 **Database** > **Query Performance** 中监控慢查询
2. 定期检查 RLS 策略的执行计划
3. 对于大数据量场景，考虑添加额外的索引

## 下一步

完成以上配置后，您可以：

1. ✅ 数据库表结构已创建
2. ✅ RLS 策略已配置并测试
3. ✅ 存储桶已创建并配置访问策略
4. ✅ 认证设置已完成

接下来的开发任务：

1. 开始实现前端应用的 Supabase 客户端集成（任务 2.4）
2. 配置 Supabase Storage（任务 2.3）
3. 定义数据库类型和业务实体类型（任务 3.1, 3.2）
4. 实现用户认证功能（任务 4.1-4.7）
5. 实现数据 CRUD 操作
6. 实现文件上传功能

## 参考资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端文档](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security 指南](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage 指南](https://supabase.com/docs/guides/storage)
