-- ============================================
-- 清理所有测试数据
-- ============================================
-- 说明：清理所有测试用户的数据（包括模拟 UUID 和真实 UUID）
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 定义所有测试用户的 UUID
-- 模拟测试用户
-- 11111111-1111-1111-1111-111111111111 (测试用户 A)
-- 22222222-2222-2222-2222-222222222222 (测试用户 B)
-- 真实测试用户
-- 3e650d13-8593-4809-a459-8c6798ac980c (真实用户 A)
-- 9f98ab35-f9be-49cb-b3b7-cd65021d8685 (真实用户 B)

-- 删除所有测试数据（按照外键依赖顺序）
DELETE FROM shares 
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  '3e650d13-8593-4809-a459-8c6798ac980c'::uuid,
  '9f98ab35-f9be-49cb-b3b7-cd65021d8685'::uuid
);

DELETE FROM trip_tasks 
WHERE trip_id IN (
  SELECT id FROM trips 
  WHERE user_id IN (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '3e650d13-8593-4809-a459-8c6798ac980c'::uuid,
    '9f98ab35-f9be-49cb-b3b7-cd65021d8685'::uuid
  )
);

DELETE FROM trip_days 
WHERE trip_id IN (
  SELECT id FROM trips 
  WHERE user_id IN (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '3e650d13-8593-4809-a459-8c6798ac980c'::uuid,
    '9f98ab35-f9be-49cb-b3b7-cd65021d8685'::uuid
  )
);

DELETE FROM trips 
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  '3e650d13-8593-4809-a459-8c6798ac980c'::uuid,
  '9f98ab35-f9be-49cb-b3b7-cd65021d8685'::uuid
);

DELETE FROM wishlist_items 
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  '3e650d13-8593-4809-a459-8c6798ac980c'::uuid,
  '9f98ab35-f9be-49cb-b3b7-cd65021d8685'::uuid
);

DELETE FROM cities 
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  '3e650d13-8593-4809-a459-8c6798ac980c'::uuid,
  '9f98ab35-f9be-49cb-b3b7-cd65021d8685'::uuid
);

DELETE FROM users 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid
);

-- 注意：不删除真实 Auth 用户
-- 如果需要删除真实用户，请在 Supabase Auth 控制台中操作

-- 验证清理完成
SELECT 
  '✓ 所有测试数据已清理' AS status,
  (SELECT COUNT(*) FROM cities WHERE user_id IN (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '3e650d13-8593-4809-a459-8c6798ac980c'::uuid,
    '9f98ab35-f9be-49cb-b3b7-cd65021d8685'::uuid
  )) AS remaining_cities,
  (SELECT COUNT(*) FROM trips WHERE user_id IN (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '3e650d13-8593-4809-a459-8c6798ac980c'::uuid,
    '9f98ab35-f9be-49cb-b3b7-cd65021d8685'::uuid
  )) AS remaining_trips,
  (SELECT COUNT(*) FROM shares WHERE user_id IN (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '3e650d13-8593-4809-a459-8c6798ac980c'::uuid,
    '9f98ab35-f9be-49cb-b3b7-cd65021d8685'::uuid
  )) AS remaining_shares,
  CASE 
    WHEN (SELECT COUNT(*) FROM cities WHERE user_id IN (
      '11111111-1111-1111-1111-111111111111'::uuid,
      '22222222-2222-2222-2222-222222222222'::uuid,
      '3e650d13-8593-4809-a459-8c6798ac980c'::uuid,
      '9f98ab35-f9be-49cb-b3b7-cd65021d8685'::uuid
    )) = 0 THEN '✓ 清理成功'
    ELSE '✗ 仍有残留数据'
  END AS result;

-- 显示剩余的所有用户数据（用于确认）
SELECT 
  '剩余用户数据统计' AS info,
  user_id,
  COUNT(*) AS cities_count
FROM cities
GROUP BY user_id
ORDER BY cities_count DESC;
