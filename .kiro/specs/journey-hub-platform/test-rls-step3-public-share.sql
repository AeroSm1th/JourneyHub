-- ============================================
-- RLS 测试 - 步骤 3: 测试公开分享访问
-- ============================================
-- 说明：验证未登录用户可以通过分享链接访问数据
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 测试 2.1: 分享链接是否存在
SELECT 
  'Test 2.1: Share link exists' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 1 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS result
FROM shares
WHERE slug = 'user-a-all-data';

-- 测试 2.2: 公开访问分享的城市
SELECT 
  'Test 2.2: Public can view shared cities' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) >= 1 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS result
FROM cities
WHERE user_id IN (
  SELECT user_id FROM shares WHERE slug = 'user-a-all-data'
);

-- 测试 2.3: 查看分享的详细信息
SELECT 
  'Test 2.3: Share details' AS test_name,
  s.slug,
  s.type,
  u.email AS shared_by,
  COUNT(c.id) AS cities_count
FROM shares s
JOIN users u ON s.user_id = u.id
LEFT JOIN cities c ON c.user_id = s.user_id
WHERE s.slug = 'user-a-all-data'
GROUP BY s.slug, s.type, u.email;
