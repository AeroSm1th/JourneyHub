-- ============================================
-- RLS 测试 - 步骤 5: 测试写操作权限
-- ============================================
-- 说明：验证用户可以修改自己的数据
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 更新用户 A 的城市记录
UPDATE cities
SET notes = 'Updated by User A - Test'
WHERE user_id = '11111111-1111-1111-1111-111111111111'::uuid
AND city_name = 'Beijing';

-- 测试 4.1: 验证更新是否成功
SELECT 
  'Test 4.1: User can update own cities' AS test_name,
  COUNT(*) AS count,
  MAX(notes) AS updated_notes,
  CASE 
    WHEN COUNT(*) = 1 AND MAX(notes) = 'Updated by User A - Test' THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS result
FROM cities
WHERE user_id = '11111111-1111-1111-1111-111111111111'::uuid
AND city_name = 'Beijing';

-- 测试 4.2: 更新行程信息
UPDATE trips
SET notes = 'Updated trip notes'
WHERE user_id = '11111111-1111-1111-1111-111111111111'::uuid
AND title = 'Beijing Trip';

SELECT 
  'Test 4.2: User can update own trips' AS test_name,
  COUNT(*) AS count,
  MAX(notes) AS updated_notes,
  CASE 
    WHEN COUNT(*) = 1 AND MAX(notes) = 'Updated trip notes' THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS result
FROM trips
WHERE user_id = '11111111-1111-1111-1111-111111111111'::uuid
AND title = 'Beijing Trip';

-- 测试 4.3: 更新行程任务状态
UPDATE trip_tasks
SET is_done = true
WHERE trip_id IN (
  SELECT id FROM trips 
  WHERE user_id = '11111111-1111-1111-1111-111111111111'::uuid
)
AND content = 'Visit Forbidden City';

SELECT 
  'Test 4.3: User can update trip tasks' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 1 AND bool_and(is_done) = true THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS result
FROM trip_tasks
WHERE trip_id IN (
  SELECT id FROM trips 
  WHERE user_id = '11111111-1111-1111-1111-111111111111'::uuid
)
AND content = 'Visit Forbidden City';
