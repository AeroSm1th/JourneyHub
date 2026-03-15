-- ============================================
-- RLS 测试 - 步骤 8: 清理测试数据
-- ============================================
-- 说明：清理所有测试数据
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 删除所有测试数据（按照外键依赖顺序）
DELETE FROM shares 
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid
);

DELETE FROM trip_tasks 
WHERE trip_id IN (
  SELECT id FROM trips 
  WHERE user_id IN (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid
  )
);

DELETE FROM trip_days 
WHERE trip_id IN (
  SELECT id FROM trips 
  WHERE user_id IN (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid
  )
);

DELETE FROM trips 
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid
);

DELETE FROM wishlist_items 
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid
);

DELETE FROM cities 
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid
);

DELETE FROM users 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid
);

-- 验证清理完成
SELECT 
  '✓ 测试数据清理完成' AS status,
  (SELECT COUNT(*) FROM users WHERE id IN (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid
  )) AS remaining_users,
  (SELECT COUNT(*) FROM cities WHERE user_id IN (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid
  )) AS remaining_cities,
  CASE 
    WHEN (SELECT COUNT(*) FROM users WHERE id IN (
      '11111111-1111-1111-1111-111111111111'::uuid,
      '22222222-2222-2222-2222-222222222222'::uuid
    )) = 0 THEN '✓ 清理成功'
    ELSE '✗ 清理失败'
  END AS result;
