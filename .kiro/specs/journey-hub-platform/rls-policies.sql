-- ============================================
-- JourneyHub Row Level Security (RLS) 策略配置
-- ============================================
-- 说明：此脚本配置所有表的 RLS 策略，确保数据安全和隔离
-- 执行前提：database-setup.sql 已执行完成
-- ============================================

-- ============================================
-- 1. 启用 Row Level Security
-- ============================================

-- 为所有表启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. users 表 RLS 策略
-- ============================================

-- 删除已存在的策略（如果有）
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- 用户可以查看自己的信息
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 用户可以插入自己的信息（注册时）
CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 用户可以更新自己的信息
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. cities 表 RLS 策略
-- ============================================

-- 删除已存在的策略
DROP POLICY IF EXISTS "Users can view their own cities" ON cities;
DROP POLICY IF EXISTS "Users can insert their own cities" ON cities;
DROP POLICY IF EXISTS "Users can update their own cities" ON cities;
DROP POLICY IF EXISTS "Users can delete their own cities" ON cities;
DROP POLICY IF EXISTS "Public can view shared cities" ON cities;

-- 用户可以查看自己的城市记录
CREATE POLICY "Users can view their own cities"
  ON cities FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以插入自己的城市记录
CREATE POLICY "Users can insert their own cities"
  ON cities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的城市记录
CREATE POLICY "Users can update their own cities"
  ON cities FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的城市记录
CREATE POLICY "Users can delete their own cities"
  ON cities FOR DELETE
  USING (auth.uid() = user_id);

-- 公开访问：通过分享链接查看城市记录
CREATE POLICY "Public can view shared cities"
  ON cities FOR SELECT
  USING (
    -- 如果存在 'all' 类型的分享链接，允许查看该用户的所有城市
    EXISTS (
      SELECT 1 FROM shares
      WHERE shares.user_id = cities.user_id
      AND shares.type = 'all'
    )
    OR
    -- 如果存在 'trip' 类型的分享链接，允许查看该行程关联的城市
    EXISTS (
      SELECT 1 FROM shares
      JOIN trips ON shares.related_trip_id = trips.id
      WHERE trips.user_id = cities.user_id
      AND shares.type = 'trip'
      AND (
        trips.related_city_id = cities.id
        OR cities.id IN (
          SELECT related_city_id FROM trips WHERE id = shares.related_trip_id
        )
      )
    )
  );

-- ============================================
-- 4. wishlist_items 表 RLS 策略
-- ============================================

-- 删除已存在的策略
DROP POLICY IF EXISTS "Users can view their own wishlist" ON wishlist_items;
DROP POLICY IF EXISTS "Users can insert their own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Users can update their own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Users can delete their own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Public can view shared wishlist items" ON wishlist_items;

-- 用户可以查看自己的愿望清单
CREATE POLICY "Users can view their own wishlist"
  ON wishlist_items FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以插入自己的愿望清单项目
CREATE POLICY "Users can insert their own wishlist items"
  ON wishlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的愿望清单项目
CREATE POLICY "Users can update their own wishlist items"
  ON wishlist_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的愿望清单项目
CREATE POLICY "Users can delete their own wishlist items"
  ON wishlist_items FOR DELETE
  USING (auth.uid() = user_id);

-- 公开访问：通过分享链接查看愿望清单
CREATE POLICY "Public can view shared wishlist items"
  ON wishlist_items FOR SELECT
  USING (
    -- 如果存在 'all' 类型的分享链接，允许查看该用户的所有愿望清单
    EXISTS (
      SELECT 1 FROM shares
      WHERE shares.user_id = wishlist_items.user_id
      AND shares.type = 'all'
    )
  );

-- ============================================
-- 5. trips 表 RLS 策略
-- ============================================

-- 删除已存在的策略
DROP POLICY IF EXISTS "Users can view their own trips" ON trips;
DROP POLICY IF EXISTS "Users can insert their own trips" ON trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON trips;
DROP POLICY IF EXISTS "Users can delete their own trips" ON trips;
DROP POLICY IF EXISTS "Public can view shared trips" ON trips;

-- 用户可以查看自己的行程
CREATE POLICY "Users can view their own trips"
  ON trips FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以插入自己的行程
CREATE POLICY "Users can insert their own trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的行程
CREATE POLICY "Users can update their own trips"
  ON trips FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的行程
CREATE POLICY "Users can delete their own trips"
  ON trips FOR DELETE
  USING (auth.uid() = user_id);

-- 公开访问：通过分享链接查看行程
CREATE POLICY "Public can view shared trips"
  ON trips FOR SELECT
  USING (
    -- 如果存在 'all' 类型的分享链接，允许查看该用户的所有行程
    EXISTS (
      SELECT 1 FROM shares
      WHERE shares.user_id = trips.user_id
      AND shares.type = 'all'
    )
    OR
    -- 如果存在 'trip' 类型的分享链接，允许查看该特定行程
    EXISTS (
      SELECT 1 FROM shares
      WHERE shares.related_trip_id = trips.id
      AND shares.type = 'trip'
    )
  );

-- ============================================
-- 6. trip_days 表 RLS 策略
-- ============================================

-- 删除已存在的策略
DROP POLICY IF EXISTS "Users can view their own trip days" ON trip_days;
DROP POLICY IF EXISTS "Users can insert their own trip days" ON trip_days;
DROP POLICY IF EXISTS "Users can update their own trip days" ON trip_days;
DROP POLICY IF EXISTS "Users can delete their own trip days" ON trip_days;
DROP POLICY IF EXISTS "Public can view shared trip days" ON trip_days;

-- 用户可以查看自己行程的日程
CREATE POLICY "Users can view their own trip days"
  ON trip_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_days.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- 用户可以插入自己行程的日程
CREATE POLICY "Users can insert their own trip days"
  ON trip_days FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_days.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- 用户可以更新自己行程的日程
CREATE POLICY "Users can update their own trip days"
  ON trip_days FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_days.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- 用户可以删除自己行程的日程
CREATE POLICY "Users can delete their own trip days"
  ON trip_days FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_days.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- 公开访问：通过分享链接查看行程日程
CREATE POLICY "Public can view shared trip days"
  ON trip_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      JOIN shares ON (
        (shares.type = 'all' AND shares.user_id = trips.user_id)
        OR
        (shares.type = 'trip' AND shares.related_trip_id = trips.id)
      )
      WHERE trips.id = trip_days.trip_id
    )
  );

-- ============================================
-- 7. trip_tasks 表 RLS 策略
-- ============================================

-- 删除已存在的策略
DROP POLICY IF EXISTS "Users can view their own trip tasks" ON trip_tasks;
DROP POLICY IF EXISTS "Users can insert their own trip tasks" ON trip_tasks;
DROP POLICY IF EXISTS "Users can update their own trip tasks" ON trip_tasks;
DROP POLICY IF EXISTS "Users can delete their own trip tasks" ON trip_tasks;
DROP POLICY IF EXISTS "Public can view shared trip tasks" ON trip_tasks;

-- 用户可以查看自己行程的任务
CREATE POLICY "Users can view their own trip tasks"
  ON trip_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_tasks.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- 用户可以插入自己行程的任务
CREATE POLICY "Users can insert their own trip tasks"
  ON trip_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_tasks.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- 用户可以更新自己行程的任务
CREATE POLICY "Users can update their own trip tasks"
  ON trip_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_tasks.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- 用户可以删除自己行程的任务
CREATE POLICY "Users can delete their own trip tasks"
  ON trip_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_tasks.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- 公开访问：通过分享链接查看行程任务
CREATE POLICY "Public can view shared trip tasks"
  ON trip_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      JOIN shares ON (
        (shares.type = 'all' AND shares.user_id = trips.user_id)
        OR
        (shares.type = 'trip' AND shares.related_trip_id = trips.id)
      )
      WHERE trips.id = trip_tasks.trip_id
    )
  );

-- ============================================
-- 8. shares 表 RLS 策略
-- ============================================

-- 删除已存在的策略
DROP POLICY IF EXISTS "Anyone can view shares" ON shares;
DROP POLICY IF EXISTS "Users can insert their own shares" ON shares;
DROP POLICY IF EXISTS "Users can update their own shares" ON shares;
DROP POLICY IF EXISTS "Users can delete their own shares" ON shares;

-- 任何人都可以查看分享记录（用于验证分享链接的有效性）
CREATE POLICY "Anyone can view shares"
  ON shares FOR SELECT
  USING (true);

-- 用户可以创建自己的分享
CREATE POLICY "Users can insert their own shares"
  ON shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的分享
CREATE POLICY "Users can update their own shares"
  ON shares FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的分享（撤销分享）
CREATE POLICY "Users can delete their own shares"
  ON shares FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 9. 验证 RLS 策略
-- ============================================

-- 查看所有表的 RLS 状态
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'cities', 'wishlist_items', 'trips', 'trip_days', 'trip_tasks', 'shares')
ORDER BY tablename;

-- 查看所有 RLS 策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 10. RLS 策略说明
-- ============================================

/*
策略设计原则：

1. 数据隔离：
   - 每个用户只能访问自己创建的数据
   - 使用 auth.uid() 验证用户身份
   - 所有表都通过 user_id 关联到用户

2. 级联权限：
   - trip_days 和 trip_tasks 通过 trips 表验证权限
   - 子表的权限依赖于父表的所有权

3. 公开分享：
   - shares 表控制数据的公开访问
   - 支持两种分享类型：
     * 'all': 分享用户的所有数据
     * 'trip': 分享特定行程及其关联数据
   - 公开访问策略允许未登录用户查看分享的数据

4. 安全性：
   - 所有写操作（INSERT/UPDATE/DELETE）都需要用户认证
   - 公开访问仅限于 SELECT 操作
   - 使用 WITH CHECK 确保插入和更新的数据符合安全规则

5. 性能优化：
   - 使用 EXISTS 子查询提高查询效率
   - 为关键字段创建索引（user_id, trip_id 等）
   - 避免复杂的 JOIN 操作

测试建议：

1. 测试用户数据隔离：
   - 创建两个测试用户
   - 验证用户 A 无法访问用户 B 的数据

2. 测试分享功能：
   - 创建分享链接
   - 使用未登录状态访问分享链接
   - 验证只能查看分享的数据，不能修改

3. 测试级联权限：
   - 验证用户可以管理自己行程的日程和任务
   - 验证用户无法访问其他用户行程的子数据

4. 测试撤销分享：
   - 删除分享记录
   - 验证公开访问被正确拒绝
*/

-- ============================================
-- RLS 策略配置完成
-- ============================================
