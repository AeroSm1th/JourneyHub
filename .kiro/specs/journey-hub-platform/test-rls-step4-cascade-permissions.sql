-- ============================================
-- RLS 测试 - 步骤 4: 测试级联权限
-- ============================================
-- 说明：验证用户可以管理自己行程的子数据
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 创建测试数据：用户 A 的行程日程
INSERT INTO trip_days (trip_id, day_index, date, title)
SELECT 
  id,
  1,
  '2024-01-01',
  'Day 1'
FROM trips
WHERE user_id = '11111111-1111-1111-1111-111111111111'::uuid
AND title = 'Beijing Trip'
LIMIT 1;

-- 创建测试数据：用户 A 的行程任务
INSERT INTO trip_tasks (trip_id, content)
SELECT 
  id,
  'Visit Forbidden City'
FROM trips
WHERE user_id = '11111111-1111-1111-1111-111111111111'::uuid
AND title = 'Beijing Trip'
LIMIT 1;

-- 测试 3.1: 用户可以查看自己的行程日程
SELECT 
  'Test 3.1: User can view own trip days' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) >= 1 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS result
FROM trip_days
WHERE trip_id IN (
  SELECT id FROM trips WHERE user_id = '11111111-1111-1111-1111-111111111111'::uuid
);

-- 测试 3.2: 用户可以查看自己的行程任务
SELECT 
  'Test 3.2: User can view own trip tasks' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) >= 1 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS result
FROM trip_tasks
WHERE trip_id IN (
  SELECT id FROM trips WHERE user_id = '11111111-1111-1111-1111-111111111111'::uuid
);

-- 测试 3.3: 验证级联关系
SELECT 
  'Test 3.3: Cascade relationship' AS test_name,
  t.title AS trip_title,
  COUNT(DISTINCT td.id) AS days_count,
  COUNT(DISTINCT tt.id) AS tasks_count,
  CASE 
    WHEN COUNT(DISTINCT td.id) >= 1 AND COUNT(DISTINCT tt.id) >= 1 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS result
FROM trips t
LEFT JOIN trip_days td ON t.id = td.trip_id
LEFT JOIN trip_tasks tt ON t.id = tt.trip_id
WHERE t.user_id = '11111111-1111-1111-1111-111111111111'::uuid
GROUP BY t.title;
