-- ============================================
-- RLS 测试 - 步骤 7: 测试特定行程分享
-- ============================================
-- 说明：验证 'trip' 类型分享只公开特定行程
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 创建特定行程的分享链接
INSERT INTO shares (user_id, type, related_trip_id, slug)
SELECT 
  '11111111-1111-1111-1111-111111111111'::uuid,
  'trip',
  id,
  'user-a-beijing-trip'
FROM trips
WHERE user_id = '11111111-1111-1111-1111-111111111111'::uuid
AND title = 'Beijing Trip'
LIMIT 1;

-- 测试 6.1: 验证可以访问分享的行程
SELECT 
  'Test 6.1: Public can view shared trip' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 1 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS result
FROM trips
WHERE id IN (
  SELECT related_trip_id FROM shares WHERE slug = 'user-a-beijing-trip'
);

-- 测试 6.2: 验证分享类型正确
SELECT 
  'Test 6.2: Share type is trip' AS test_name,
  type,
  CASE 
    WHEN type = 'trip' THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS result
FROM shares
WHERE slug = 'user-a-beijing-trip';

-- 测试 6.3: 验证可以访问分享行程的子数据
SELECT 
  'Test 6.3: Can access shared trip sub-data' AS test_name,
  COUNT(DISTINCT td.id) AS days_count,
  COUNT(DISTINCT tt.id) AS tasks_count,
  CASE 
    WHEN COUNT(DISTINCT td.id) >= 1 AND COUNT(DISTINCT tt.id) >= 1 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS result
FROM shares s
JOIN trips t ON s.related_trip_id = t.id
LEFT JOIN trip_days td ON t.id = td.trip_id
LEFT JOIN trip_tasks tt ON t.id = tt.trip_id
WHERE s.slug = 'user-a-beijing-trip'
GROUP BY s.slug;

-- 测试 6.4: 查看完整的分享信息
SELECT 
  'Test 6.4: Complete share info' AS test_name,
  s.slug,
  s.type,
  t.title AS trip_title,
  t.start_date,
  t.end_date,
  COUNT(DISTINCT td.id) AS days_count,
  COUNT(DISTINCT tt.id) AS tasks_count
FROM shares s
JOIN trips t ON s.related_trip_id = t.id
LEFT JOIN trip_days td ON t.id = td.trip_id
LEFT JOIN trip_tasks tt ON t.id = tt.trip_id
WHERE s.slug = 'user-a-beijing-trip'
GROUP BY s.slug, s.type, t.title, t.start_date, t.end_date;
