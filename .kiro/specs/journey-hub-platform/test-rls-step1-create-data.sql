-- ============================================
-- RLS 测试 - 步骤 1: 创建测试数据
-- ============================================
-- 说明：此脚本创建测试用户和测试数据
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 清理旧的测试数据（如果存在）
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

-- 创建测试用户
INSERT INTO users (id, email, nickname) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'user_a@test.com', 'User A'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'user_b@test.com', 'User B');

-- 用户 A 创建城市记录
INSERT INTO cities (user_id, city_name, country_name, continent, latitude, longitude, visited_at)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Beijing',
  'China',
  'Asia',
  39.9042,
  116.4074,
  '2024-01-01'
);

-- 用户 B 创建城市记录
INSERT INTO cities (user_id, city_name, country_name, continent, latitude, longitude, visited_at)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Shanghai',
  'China',
  'Asia',
  31.2304,
  121.4737,
  '2024-01-02'
);

-- 用户 A 创建行程
INSERT INTO trips (user_id, title, start_date, end_date)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Beijing Trip',
  '2024-01-01',
  '2024-01-03'
);

-- 用户 B 创建行程
INSERT INTO trips (user_id, title, start_date, end_date)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Shanghai Trip',
  '2024-01-02',
  '2024-01-04'
);

-- 用户 A 创建分享链接（分享所有数据）
INSERT INTO shares (user_id, type, slug)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'all',
  'user-a-all-data'
);

-- 验证数据创建成功
SELECT 
  '✓ 测试数据创建完成' AS status,
  (SELECT COUNT(*) FROM users WHERE id IN (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid
  )) AS users_count,
  (SELECT COUNT(*) FROM cities WHERE user_id IN (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid
  )) AS cities_count,
  (SELECT COUNT(*) FROM trips WHERE user_id IN (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid
  )) AS trips_count,
  (SELECT COUNT(*) FROM shares WHERE user_id = '11111111-1111-1111-1111-111111111111'::uuid) AS shares_count;
