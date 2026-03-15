# RLS 策略自动化测试指南

本指南详细说明如何使用 `test-rls-policies.sql` 脚本进行 Row Level Security (RLS) 策略的自动化测试。

## 测试前准备

### 1. 确保数据库已正确配置

在运行测试脚本之前，确保已完成以下步骤：

- ✅ 执行了 `database-setup.sql`（创建表结构）
- ✅ 执行了 `rls-policies.sql`（配置 RLS 策略）
- ✅ Supabase 项目已正常运行

### 2. 清理现有测试数据（可选）

如果之前运行过测试，建议先清理旧的测试数据：

```sql
-- 在 Supabase SQL Editor 中执行
DO $
DECLARE
  user_a_id UUID := '11111111-1111-1111-1111-111111111111';
  user_b_id UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
  DELETE FROM shares WHERE user_id IN (user_a_id, user_b_id);
  DELETE FROM trip_tasks WHERE trip_id IN (SELECT id FROM trips WHERE user_id IN (user_a_id, user_b_id));
  DELETE FROM trip_days WHERE trip_id IN (SELECT id FROM trips WHERE user_id IN (user_a_id, user_b_id));
  DELETE FROM trips WHERE user_id IN (user_a_id, user_b_id);
  DELETE FROM wishlist_items WHERE user_id IN (user_a_id, user_b_id);
  DELETE FROM cities WHERE user_id IN (user_a_id, user_b_id);
  DELETE FROM users WHERE id IN (user_a_id, user_b_id);
  
  RAISE NOTICE 'Test data cleaned successfully';
END $;
```

## ⚠️ 重要提示：语法兼容性问题

原始的 `test-rls-policies.sql` 文件使用了 `DO $` 块语法，这在 Supabase SQL Editor 中**不被支持**，会报错：

```
Error: syntax error at or near "$"
```

**解决方案**：我已经创建了 8 个独立的测试脚本文件，使用标准 SQL 语法，可以直接在 Supabase SQL Editor 中执行。

## 方法一：使用拆分的测试脚本（推荐）⭐

这是最简单、最可靠的测试方法。

### 步骤 1：打开 SQL Editor

1. 登录 [Supabase 控制台](https://app.supabase.com/)
2. 选择你的 JourneyHub 项目
3. 在左侧菜单点击 **SQL Editor**
4. 点击 "New query" 创建新查询

### 步骤 2：按顺序执行测试脚本

按照以下顺序，逐个执行测试脚本：

#### 测试 1：创建测试数据

**文件**: `test-rls-step1-create-data.sql`

1. 复制文件内容
2. 粘贴到 SQL Editor
3. 点击 "Run"
4. 验证结果显示：`✓ 测试数据创建完成`

#### 测试 2：数据隔离

**文件**: `test-rls-step2-data-isolation.sql`

执行后应该看到所有测试显示 `✓ PASS`

#### 测试 3：公开分享

**文件**: `test-rls-step3-public-share.sql`

验证分享链接功能正常

#### 测试 4：级联权限

**文件**: `test-rls-step4-cascade-permissions.sql`

验证子表权限依赖父表

#### 测试 5：写操作

**文件**: `test-rls-step5-write-operations.sql`

验证用户可以修改自己的数据

#### 测试 6：撤销分享

**文件**: `test-rls-step6-revoke-share.sql`

验证撤销分享后无法访问

#### 测试 7：特定行程分享

**文件**: `test-rls-step7-trip-share.sql`

验证 'trip' 类型分享

#### 测试 8：清理数据

**文件**: `test-rls-step8-cleanup.sql`

清理所有测试数据

### 快速参考

详细的测试步骤和预期结果，请查看 `QUICK_TEST_GUIDE.md` 文件。

## 方法二：原始测试脚本（不推荐）

### 步骤 2：执行测试脚本

#### 方式 A：完整执行（不推荐 - 会报错）

⚠️ **注意**：`test-rls-policies.sql` 使用了 `DO $` 块语法，在 Supabase SQL Editor 中会报错。请使用方法一的拆分脚本。

#### 方式 B：分段执行（逐步运行测试）

推荐按以下顺序分段执行，便于观察每个测试的结果：

**第 1 步：创建测试数据**

```sql
-- 复制并执行 "测试准备：创建测试用户和数据" 部分
DO $
DECLARE
  user_a_id UUID := '11111111-1111-1111-1111-111111111111';
  user_b_id UUID := '22222222-2222-2222-2222-222222222222';
  -- ... 完整的 DO 块代码
END $;
```

**预期结果**：
```
NOTICE: Test data created successfully
NOTICE: User A ID: 11111111-1111-1111-1111-111111111111
NOTICE: User B ID: 22222222-2222-2222-2222-222222222222
NOTICE: City A ID: [UUID]
NOTICE: City B ID: [UUID]
NOTICE: Trip A ID: [UUID]
NOTICE: Trip B ID: [UUID]
NOTICE: Share A ID: [UUID]
```

**第 2 步：测试用户数据隔离**

```sql
-- 测试 1.1: 用户 A 的城市记录
SELECT 
  'Test 1.1: User A cities' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 1 AND MAX(city_name) = 'Beijing' THEN 'PASS'
    ELSE 'FAIL'
  END AS result
FROM cities
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- 测试 1.2: 用户 B 的城市记录
SELECT 
  'Test 1.2: User B cities' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 1 AND MAX(city_name) = 'Shanghai' THEN 'PASS'
    ELSE 'FAIL'
  END AS result
FROM cities
WHERE user_id = '22222222-2222-2222-2222-222222222222';
```

**预期结果**：
```
test_name              | count | result
-----------------------|-------|-------
Test 1.1: User A cities|   1   | PASS
Test 1.2: User B cities|   1   | PASS
```

**第 3 步：测试公开分享访问**

```sql
-- 测试 2.1: 分享链接是否存在
SELECT 
  'Test 2.1: Share link exists' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 1 THEN 'PASS'
    ELSE 'FAIL'
  END AS result
FROM shares
WHERE slug = 'user-a-all-data';

-- 测试 2.2: 公开访问分享的城市
SELECT 
  'Test 2.2: Public can view shared cities' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) >= 1 THEN 'PASS'
    ELSE 'FAIL'
  END AS result
FROM cities
WHERE user_id IN (
  SELECT user_id FROM shares WHERE slug = 'user-a-all-data'
);
```

**预期结果**：
```
test_name                          | count | result
-----------------------------------|-------|-------
Test 2.1: Share link exists        |   1   | PASS
Test 2.2: Public can view shared...|   1   | PASS
```

**第 4 步：测试级联权限**

```sql
-- 创建测试数据：用户 A 的行程日程
INSERT INTO trip_days (trip_id, day_index, date, title)
SELECT 
  id,
  1,
  '2024-01-01',
  'Day 1'
FROM trips
WHERE user_id = '11111111-1111-1111-1111-111111111111'
LIMIT 1;

-- 测试 3.1: 用户可以查看自己的行程日程
SELECT 
  'Test 3.1: User can view own trip days' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) >= 1 THEN 'PASS'
    ELSE 'FAIL'
  END AS result
FROM trip_days
WHERE trip_id IN (
  SELECT id FROM trips WHERE user_id = '11111111-1111-1111-1111-111111111111'
);
```

**预期结果**：
```
test_name                          | count | result
-----------------------------------|-------|-------
Test 3.1: User can view own trip...|   1   | PASS
```

**第 5 步：测试写操作权限**

```sql
-- 更新用户 A 的城市记录
UPDATE cities
SET notes = 'Updated by User A'
WHERE user_id = '11111111-1111-1111-1111-111111111111'
AND city_name = 'Beijing';

-- 测试 4.1: 验证更新是否成功
SELECT 
  'Test 4.1: User can update own cities' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 1 AND MAX(notes) = 'Updated by User A' THEN 'PASS'
    ELSE 'FAIL'
  END AS result
FROM cities
WHERE user_id = '11111111-1111-1111-1111-111111111111'
AND city_name = 'Beijing';
```

**预期结果**：
```
test_name                          | count | result
-----------------------------------|-------|-------
Test 4.1: User can update own ci...|   1   | PASS
```

**第 6 步：测试分享撤销**

```sql
-- 删除分享链接
DELETE FROM shares
WHERE slug = 'user-a-all-data'
AND user_id = '11111111-1111-1111-1111-111111111111';

-- 测试 5.1: 验证分享链接已被删除
SELECT 
  'Test 5.1: Share link revoked' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 0 THEN 'PASS'
    ELSE 'FAIL'
  END AS result
FROM shares
WHERE slug = 'user-a-all-data';
```

**预期结果**：
```
test_name                  | count | result
---------------------------|-------|-------
Test 5.1: Share link revo..|   0   | PASS
```

**第 7 步：测试特定行程分享**

```sql
-- 创建特定行程的分享链接
INSERT INTO shares (user_id, type, related_trip_id, slug)
SELECT 
  '11111111-1111-1111-1111-111111111111',
  'trip',
  id,
  'user-a-beijing-trip'
FROM trips
WHERE user_id = '11111111-1111-1111-1111-111111111111'
AND title = 'Beijing Trip'
LIMIT 1;

-- 测试 6.1: 验证可以访问分享的行程
SELECT 
  'Test 6.1: Public can view shared trip' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 1 THEN 'PASS'
    ELSE 'FAIL'
  END AS result
FROM trips
WHERE id IN (
  SELECT related_trip_id FROM shares WHERE slug = 'user-a-beijing-trip'
);
```

**预期结果**：
```
test_name                          | count | result
-----------------------------------|-------|-------
Test 6.1: Public can view shared...|   1   | PASS
```

### 步骤 3：查看测试结果汇总

执行完所有测试后，可以手动统计结果：

```sql
-- 手动汇总测试结果
SELECT 
  '测试总结' AS summary,
  6 AS total_tests,
  6 AS passed,  -- 根据实际结果修改
  0 AS failed   -- 根据实际结果修改
;
```

## 方法二：使用真实用户进行测试

为了更真实地测试 RLS 策略，建议使用 Supabase Auth 创建的真实用户进行测试。

### 步骤 1：创建测试用户

1. 在 Supabase 控制台，点击 **Authentication** > **Users**
2. 点击 "Add user" > "Create new user"
3. 创建两个测试用户：
   - 用户 A: `test_user_a@example.com` / `TestPassword123!`
   - 用户 B: `test_user_b@example.com` / `TestPassword123!`
4. 记录他们的 UUID（在用户列表中可以看到）

### 步骤 2：修改测试脚本

将测试脚本中的模拟 UUID 替换为真实用户的 UUID：

```sql
DO $
DECLARE
  -- 替换为真实的用户 UUID
  user_a_id UUID := 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';  -- 用户 A 的真实 UUID
  user_b_id UUID := 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy';  -- 用户 B 的真实 UUID
  -- ... 其余代码保持不变
```

### 步骤 3：在应用中测试

1. 使用用户 A 登录应用
2. 创建城市记录
3. 退出登录，使用用户 B 登录
4. 验证无法看到用户 A 的数据
5. 使用用户 A 创建分享链接
6. 在未登录状态访问分享链接
7. 验证可以查看但无法修改数据

## 方法三：使用 Supabase CLI 进行测试

如果你安装了 Supabase CLI，可以使用命令行执行测试：

### 步骤 1：安装 Supabase CLI

```bash
# 使用 npm 安装
npm install -g supabase

# 或使用 Homebrew (macOS)
brew install supabase/tap/supabase
```

### 步骤 2：链接到项目

```bash
# 在项目根目录执行
supabase link --project-ref your-project-ref

# 输入数据库密码
```

### 步骤 3：执行测试脚本

```bash
# 执行测试脚本
supabase db execute --file .kiro/specs/journey-hub-platform/test-rls-policies.sql

# 或者使用 psql
supabase db execute < .kiro/specs/journey-hub-platform/test-rls-policies.sql
```

## 测试结果解读

### 成功的测试结果

所有测试的 `result` 列应该显示 `PASS`：

```
test_name                              | count | result
---------------------------------------|-------|-------
Test 1.1: User A cities                |   1   | PASS
Test 1.2: User B cities                |   1   | PASS
Test 2.1: Share link exists            |   1   | PASS
Test 2.2: Public can view shared cities|   1   | PASS
Test 3.1: User can view own trip days  |   1   | PASS
Test 4.1: User can update own cities   |   1   | PASS
Test 5.1: Share link revoked           |   0   | PASS
Test 6.1: Public can view shared trip  |   1   | PASS
```

### 失败的测试结果

如果某个测试显示 `FAIL`，需要进行故障排查：

#### 示例：Test 1.1 失败

```
test_name              | count | result
-----------------------|-------|-------
Test 1.1: User A cities|   0   | FAIL
```

**可能原因**：
1. RLS 策略未正确配置
2. 测试数据未成功创建
3. user_id 不匹配

**排查步骤**：

```sql
-- 1. 检查 RLS 是否启用
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'cities';

-- 2. 检查策略是否存在
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'cities';

-- 3. 检查测试数据是否存在
SELECT id, user_id, city_name
FROM cities
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- 4. 测试策略逻辑
EXPLAIN ANALYZE
SELECT * FROM cities
WHERE user_id = '11111111-1111-1111-1111-111111111111';
```

## 高级测试场景

### 测试场景 1：跨用户访问尝试

验证用户 B 无法访问用户 A 的数据：

```sql
-- 模拟用户 B 尝试访问用户 A 的数据
-- 注意：这个查询应该返回 0 行
SELECT 
  'Cross-user access test' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 0 THEN 'PASS (correctly blocked)'
    ELSE 'FAIL (security breach!)'
  END AS result
FROM cities
WHERE user_id = '11111111-1111-1111-1111-111111111111'
AND auth.uid() = '22222222-2222-2222-2222-222222222222';
```

### 测试场景 2：未登录用户访问

验证未登录用户无法访问私有数据：

```sql
-- 模拟未登录用户（auth.uid() 为 NULL）
-- 注意：这个查询应该返回 0 行
SELECT 
  'Unauthenticated access test' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 0 THEN 'PASS (correctly blocked)'
    ELSE 'FAIL (security breach!)'
  END AS result
FROM cities
WHERE user_id = '11111111-1111-1111-1111-111111111111';
-- 在未登录状态下执行
```

### 测试场景 3：级联删除测试

验证删除行程时，关联的日程和任务被正确删除：

```sql
-- 记录删除前的数据
SELECT 
  'Before delete' AS stage,
  (SELECT COUNT(*) FROM trips WHERE user_id = '11111111-1111-1111-1111-111111111111') AS trips_count,
  (SELECT COUNT(*) FROM trip_days WHERE trip_id IN (SELECT id FROM trips WHERE user_id = '11111111-1111-1111-1111-111111111111')) AS days_count,
  (SELECT COUNT(*) FROM trip_tasks WHERE trip_id IN (SELECT id FROM trips WHERE user_id = '11111111-1111-1111-1111-111111111111')) AS tasks_count;

-- 删除行程
DELETE FROM trips
WHERE user_id = '11111111-1111-1111-1111-111111111111'
AND title = 'Beijing Trip';

-- 验证级联删除
SELECT 
  'After delete' AS stage,
  (SELECT COUNT(*) FROM trips WHERE user_id = '11111111-1111-1111-1111-111111111111') AS trips_count,
  (SELECT COUNT(*) FROM trip_days WHERE trip_id IN (SELECT id FROM trips WHERE user_id = '11111111-1111-1111-1111-111111111111')) AS days_count,
  (SELECT COUNT(*) FROM trip_tasks WHERE trip_id IN (SELECT id FROM trips WHERE user_id = '11111111-1111-1111-1111-111111111111')) AS tasks_count;
```

**预期结果**：
- 删除前：trips_count = 1, days_count >= 1, tasks_count >= 0
- 删除后：trips_count = 0, days_count = 0, tasks_count = 0

## 性能测试

### 测试查询性能

使用 `EXPLAIN ANALYZE` 分析 RLS 策略对查询性能的影响：

```sql
-- 测试用户数据查询性能
EXPLAIN ANALYZE
SELECT * FROM cities
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- 测试公开分享查询性能
EXPLAIN ANALYZE
SELECT * FROM cities
WHERE user_id IN (
  SELECT user_id FROM shares WHERE slug = 'user-a-all-data' AND type = 'all'
);

-- 测试级联权限查询性能
EXPLAIN ANALYZE
SELECT * FROM trip_days
WHERE trip_id IN (
  SELECT id FROM trips WHERE user_id = '11111111-1111-1111-1111-111111111111'
);
```

**关注指标**：
- Execution Time（执行时间）
- Planning Time（规划时间）
- Index Scan vs Seq Scan（索引扫描 vs 顺序扫描）
- Rows（返回行数）

## 清理测试数据

测试完成后，清理测试数据：

```sql
-- 执行清理脚本
DO $
DECLARE
  user_a_id UUID := '11111111-1111-1111-1111-111111111111';
  user_b_id UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
  DELETE FROM shares WHERE user_id IN (user_a_id, user_b_id);
  DELETE FROM trip_tasks WHERE trip_id IN (SELECT id FROM trips WHERE user_id IN (user_a_id, user_b_id));
  DELETE FROM trip_days WHERE trip_id IN (SELECT id FROM trips WHERE user_id IN (user_a_id, user_b_id));
  DELETE FROM trips WHERE user_id IN (user_a_id, user_b_id);
  DELETE FROM wishlist_items WHERE user_id IN (user_a_id, user_b_id);
  DELETE FROM cities WHERE user_id IN (user_a_id, user_b_id);
  DELETE FROM users WHERE id IN (user_a_id, user_b_id);
  
  RAISE NOTICE 'Test data cleaned successfully';
END $;
```

## 持续集成（CI）测试

如果你使用 GitHub Actions 或其他 CI/CD 工具，可以将 RLS 测试集成到自动化流程中：

### GitHub Actions 示例

创建 `.github/workflows/test-rls.yml`：

```yaml
name: Test RLS Policies

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-rls:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        
      - name: Link to Supabase project
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      
      - name: Run RLS tests
        run: |
          supabase db execute --file .kiro/specs/journey-hub-platform/test-rls-policies.sql
```

## 故障排查清单

如果测试失败，按以下清单逐项检查：

- [ ] 数据库表已创建（执行了 database-setup.sql）
- [ ] RLS 已启用（所有表的 rowsecurity = true）
- [ ] RLS 策略已创建（执行了 rls-policies.sql）
- [ ] 测试用户 UUID 正确
- [ ] 测试数据已成功创建
- [ ] 索引已创建
- [ ] Supabase 项目状态正常
- [ ] 网络连接正常

## 总结

使用 `test-rls-policies.sql` 脚本可以快速验证 RLS 策略的正确性。推荐的测试流程：

1. ✅ 在 Supabase SQL Editor 中分段执行测试
2. ✅ 使用真实用户在应用中进行端到端测试
3. ✅ 使用 EXPLAIN ANALYZE 进行性能测试
4. ✅ 将测试集成到 CI/CD 流程中

定期运行这些测试可以确保 RLS 策略始终正确工作，保护用户数据安全。
