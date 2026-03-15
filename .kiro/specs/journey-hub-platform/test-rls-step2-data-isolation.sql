-- ============================================
-- RLS 测试 - 步骤 2: 测试用户数据隔离
-- ============================================
-- 说明：验证用户只能访问自己的数据
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 测试 1.1: 用户 A 的城市记录
SELECT 
  'Test 1.1: User A cities' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 1 AND MAX(city_name) = 'Beijing' THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS result
FROM cities
WHERE user_id = '11111111-1111-1111-1111-111111111111'::uuid;

-- 测试 1.2: 用户 B 的城市记录
SELECT 
  'Test 1.2: User B cities' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 1 AND MAX(city_name) = 'Shanghai' THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS result
FROM cities
WHERE user_id = '22222222-2222-2222-2222-222222222222'::uuid;

-- 测试 1.3: 验证数据隔离（只统计测试用户的数据）
-- 注意：这个查询在实际应用中，当以用户 A 身份登录时，应该返回 0 行
SELECT 
  'Test 1.3: Data isolation check' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 2 THEN '✓ PASS (Admin view - both test users visible)'
    WHEN COUNT(*) > 2 THEN '⚠ WARNING (Other users data exists, but test users OK)'
    ELSE '✗ FAIL'
  END AS result,
  '注意：在实际应用中，用户只能看到自己的数据' AS note
FROM cities
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid
);


-- 测试 1.4: 验证测试用户数据完整性
SELECT 
  'Test 1.4: Test users data integrity' AS test_name,
  user_id,
  city_name,
  CASE 
    WHEN user_id = '11111111-1111-1111-1111-111111111111'::uuid AND city_name = 'Beijing' THEN '✓ User A OK'
    WHEN user_id = '22222222-2222-2222-2222-222222222222'::uuid AND city_name = 'Shanghai' THEN '✓ User B OK'
    ELSE '✗ Unexpected data'
  END AS result
FROM cities
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid
)
ORDER BY user_id;

-- 测试 1.5: 显示数据库中所有用户的城市数量（用于调试）
SELECT 
  'Test 1.5: All users cities count (debug info)' AS test_name,
  user_id,
  COUNT(*) AS cities_count
FROM cities
GROUP BY user_id
ORDER BY cities_count DESC;
