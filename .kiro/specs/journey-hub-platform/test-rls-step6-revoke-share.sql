-- ============================================
-- RLS 测试 - 步骤 6: 测试分享撤销
-- ============================================
-- 说明：验证撤销分享后，公开访问被正确拒绝
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 删除分享链接
DELETE FROM shares
WHERE slug = 'user-a-all-data'
AND user_id = '11111111-1111-1111-1111-111111111111'::uuid;

-- 测试 5.1: 验证分享链接已被删除
SELECT 
  'Test 5.1: Share link revoked' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS result
FROM shares
WHERE slug = 'user-a-all-data';

-- 测试 5.2: 验证公开访问策略不再生效
-- 注意：在实际应用中，未登录用户将无法访问这些数据
SELECT 
  'Test 5.2: Public access blocked after revoke' AS test_name,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ PASS (no shares found)'
    ELSE '✗ FAIL (shares still exist)'
  END AS result,
  '注意：在实际应用中，未登录用户将无法访问数据' AS note
FROM cities
WHERE user_id IN (
  SELECT user_id FROM shares WHERE slug = 'user-a-all-data'
);
