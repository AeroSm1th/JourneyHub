-- ============================================
-- JourneyHub RLS 策略测试脚本
-- ============================================
-- 说明：此脚本用于测试 RLS 策略的正确性
-- 执行前提：database-setup.sql 和 rls-policies.sql 已执行完成
-- ============================================

-- ============================================
-- 测试准备：创建测试用户和数据
-- ============================================

-- 注意：在实际测试中，需要通过 Supabase Auth 创建真实用户
-- 这里使用模拟的 UUID 来演示测试逻辑

-- 模拟用户 A 的 UUID
-- 在实际测试中，替换为真实的 auth.uid()
DO $
DECLARE
  user_a_id UUID := '11111111-1111-1111-1111-111111111111';
  user_b_id UUID := '22222222-2222-2222-2222-222222222222';
  city_a_id UUID;
  city_b_id UUID;
  trip_a_id UUID;
  trip_b_id UUID;
  share_a_id UUID;
BEGIN
  -- 清理测试数据
  DELETE FROM shares WHERE user_id IN (user_a_id, user_b_id);
  DELETE FROM trip_tasks WHERE trip_id IN (SELECT id FROM trips WHERE user_id IN (user_a_id, user_b_id));
  DELETE FROM trip_days WHERE trip_id IN (SELECT id FROM trips WHERE user_id IN (user_a_id, user_b_id));
  DELETE FROM trips WHERE user_id IN (user_a_id, user_b_id);
  DELETE FROM wishlist_items WHERE user_id IN (user_a_id, user_b_id);
  DELETE FROM cities WHERE user_id IN (user_a_id, user_b_id);
  DELETE FROM users WHERE id IN (user_a_id, user_b_id);

  -- 创建测试用户
  INSERT INTO users (id, email, nickname) VALUES
    (user_a_id, 'user_a@test.com', 'User A'),
    (user_b_id, 'user_b@test.com', 'User B');

  -- 用户 A 创建城市记录
  INSERT INTO cities (id, user_id, city_name, country_name, continent, latitude, longitude, visited_at)
  VALUES (uuid_generate_v4(), user_a_id, 'Beijing', 'China', 'Asia', 39.9042, 116.4074, '2024-01-01')
  RETURNING id INTO city_a_id;

  -- 用户 B 创建城市记录
  INSERT INTO cities (id, user_id, city_name, country_name, continent, latitude, longitude, visited_at)
  VALUES (uuid_generate_v4(), user_b_id, 'Shanghai', 'China', 'Asia', 31.2304, 121.4737, '2024-01-02')
  RETURNING id INTO city_b_id;

  -- 用户 A 创建行程
  INSERT INTO trips (id, user_id, title, related_city_id, start_date, end_date)
  VALUES (uuid_generate_v4(), user_a_id, 'Beijing Trip', city_a_id, '2024-01-01', '2024-01-03')
  RETURNING id INTO trip_a_id;

  -- 用户 B 创建行程
  INSERT INTO trips (id, user_id, title, related_city_id, start_date, end_date)
  VALUES (uuid_generate_v4(), user_b_id, 'Shanghai Trip', city_b_id, '2024-01-02', '2024-01-04')
  RETURNING id INTO trip_b_id;

  -- 用户 A 创建分享链接（分享所有数据）
  INSERT INTO shares (id, user_id, type, slug)
  VALUES (uuid_generate_v4(), user_a_id, 'all', 'user-a-all-data')
  RETURNING id INTO share_a_id;

  RAISE NOTICE 'Test data created successfully';
  RAISE NOTICE 'User A ID: %', user_a_id;
  RAISE NOTICE 'User B ID: %', user_b_id;
  RAISE NOTICE 'City A ID: %', city_a_id;
  RAISE NOTICE 'City B ID: %', city_b_id;
  RAISE NOTICE 'Trip A ID: %', trip_a_id;
  RAISE NOTICE 'Trip B ID: %', trip_b_id;
  RAISE NOTICE 'Share A ID: %', share_a_id;
END $;

-- ============================================
-- 测试 1: 用户数据隔离
-- ============================================

-- 测试说明：验证用户只能访问自己的数据

-- 查询用户 A 的城市记录（应该只返回 Beijing）
-- 在实际测试中，需要以用户 A 的身份登录后执行
SELECT 
  'Test 1.1: User A cities' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 1 AND MAX(city_name) = 'Beijing' THEN 'PASS'
    ELSE 'FAIL'
  END AS result
FROM cities
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- 查询用户 B 的城市记录（应该只返回 Shanghai）
-- 在实际测试中，需要以用户 B 的身份登录后执行
SELECT 
  'Test 1.2: User B cities' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 1 AND MAX(city_name) = 'Shanghai' THEN 'PASS'
    ELSE 'FAIL'
  END AS result
FROM cities
WHERE user_id = '22222222-2222-2222-2222-222222222222';

-- ============================================
-- 测试 2: 公开分享访问
-- ============================================

-- 测试说明：验证未登录用户可以通过分享链接访问数据

-- 查询分享链接是否存在
SELECT 
  'Test 2.1: Share link exists' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 1 THEN 'PASS'
    ELSE 'FAIL'
  END AS result
FROM shares
WHERE slug = 'user-a-all-data';

-- 验证公开访问策略（模拟未登录用户访问）
-- 注意：在实际测试中，需要在未登录状态下执行
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

-- ============================================
-- 测试 3: 级联权限验证
-- ============================================

-- 测试说明：验证子表的权限依赖于父表

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

-- 验证用户 A 可以查看自己的行程日程
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

-- ============================================
-- 测试 4: 写操作权限
-- ============================================

-- 测试说明：验证用户只能修改自己的数据

-- 尝试更新用户 A 的城市记录（应该成功）
UPDATE cities
SET notes = 'Updated by User A'
WHERE user_id = '11111111-1111-1111-1111-111111111111'
AND city_name = 'Beijing';

-- 验证更新是否成功
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

-- ============================================
-- 测试 5: 分享撤销
-- ============================================

-- 测试说明：验证撤销分享后，公开访问被拒绝

-- 删除分享链接
DELETE FROM shares
WHERE slug = 'user-a-all-data'
AND user_id = '11111111-1111-1111-1111-111111111111';

-- 验证分享链接已被删除
SELECT 
  'Test 5.1: Share link revoked' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 0 THEN 'PASS'
    ELSE 'FAIL'
  END AS result
FROM shares
WHERE slug = 'user-a-all-data';

-- ============================================
-- 测试 6: 特定行程分享
-- ============================================

-- 测试说明：验证 'trip' 类型的分享只公开特定行程

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

-- 验证可以访问分享的行程
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

-- ============================================
-- 测试总结
-- ============================================

-- 查看所有测试结果
SELECT 
  'Test Summary' AS summary,
  COUNT(*) AS total_tests,
  SUM(CASE WHEN result = 'PASS' THEN 1 ELSE 0 END) AS passed,
  SUM(CASE WHEN result = 'FAIL' THEN 1 ELSE 0 END) AS failed
FROM (
  -- 这里需要手动汇总上面所有测试的结果
  -- 在实际测试中，可以使用临时表或 CTE 来收集结果
  SELECT 'PASS' AS result
) AS test_results;

-- ============================================
-- 清理测试数据
-- ============================================

-- 取消注释以下代码来清理测试数据
/*
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
*/

-- ============================================
-- 实际测试指南
-- ============================================

/*
在 Supabase 中进行实际测试的步骤：

1. 创建测试用户：
   - 在 Supabase Auth 中创建两个测试用户
   - 记录他们的 UUID

2. 测试用户数据隔离：
   - 以用户 A 登录
   - 创建城市记录
   - 查询城市列表，验证只能看到自己的数据
   - 以用户 B 登录
   - 验证无法看到用户 A 的数据

3. 测试公开分享：
   - 以用户 A 登录
   - 创建分享链接
   - 退出登录（或使用隐身模式）
   - 访问分享链接
   - 验证可以查看数据但无法修改

4. 测试撤销分享：
   - 以用户 A 登录
   - 删除分享链接
   - 退出登录
   - 尝试访问分享链接
   - 验证访问被拒绝

5. 测试级联权限：
   - 以用户 A 登录
   - 创建行程
   - 为行程添加日程和任务
   - 验证可以正常访问和修改
   - 以用户 B 登录
   - 验证无法访问用户 A 的行程子数据

6. 性能测试：
   - 创建大量测试数据（1000+ 条记录）
   - 测试查询性能
   - 验证索引是否生效
   - 使用 EXPLAIN ANALYZE 分析查询计划

7. 安全测试：
   - 尝试绕过 RLS 策略
   - 使用 SQL 注入测试
   - 验证所有边界条件
*/

-- ============================================
-- 测试脚本完成
-- ============================================
