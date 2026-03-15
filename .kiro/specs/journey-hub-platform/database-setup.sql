-- ============================================
-- JourneyHub 数据库初始化脚本
-- ============================================
-- 说明：在 Supabase 控制台的 SQL Editor 中执行此脚本
-- 执行顺序：按照脚本顺序从上到下执行
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 创建 users 表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nickname TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE users IS '用户基本信息表';
COMMENT ON COLUMN users.id IS '用户唯一标识';
COMMENT ON COLUMN users.email IS '用户邮箱';
COMMENT ON COLUMN users.nickname IS '用户昵称';
COMMENT ON COLUMN users.avatar_url IS '用户头像 URL';
COMMENT ON COLUMN users.created_at IS '创建时间';

-- ============================================
-- 2. 创建 cities 表
-- ============================================
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  country_name TEXT NOT NULL,
  continent TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  visited_at DATE NOT NULL,
  trip_type TEXT CHECK (trip_type IN ('leisure', 'business', 'transit')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  tags TEXT[],
  cover_image TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE cities IS '城市旅行记录表';
COMMENT ON COLUMN cities.id IS '城市记录唯一标识';
COMMENT ON COLUMN cities.user_id IS '所属用户 ID';
COMMENT ON COLUMN cities.city_name IS '城市名称';
COMMENT ON COLUMN cities.country_name IS '国家名称';
COMMENT ON COLUMN cities.continent IS '所属大洲';
COMMENT ON COLUMN cities.latitude IS '纬度';
COMMENT ON COLUMN cities.longitude IS '经度';
COMMENT ON COLUMN cities.visited_at IS '访问日期';
COMMENT ON COLUMN cities.trip_type IS '旅行类型：leisure(休闲)、business(商务)、transit(中转)';
COMMENT ON COLUMN cities.rating IS '评分 1-5';
COMMENT ON COLUMN cities.notes IS '备注';
COMMENT ON COLUMN cities.tags IS '标签数组';
COMMENT ON COLUMN cities.cover_image IS '封面图片 URL';
COMMENT ON COLUMN cities.is_favorite IS '是否收藏';
COMMENT ON COLUMN cities.created_at IS '创建时间';
COMMENT ON COLUMN cities.updated_at IS '更新时间';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_cities_user_id ON cities(user_id);
CREATE INDEX IF NOT EXISTS idx_cities_visited_at ON cities(visited_at);
CREATE INDEX IF NOT EXISTS idx_cities_continent ON cities(continent);
CREATE INDEX IF NOT EXISTS idx_cities_country_name ON cities(country_name);

-- ============================================
-- 3. 创建 wishlist_items 表
-- ============================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  country_name TEXT NOT NULL,
  continent TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  priority INTEGER CHECK (priority >= 1 AND priority <= 5) DEFAULT 3,
  expected_season TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE wishlist_items IS '愿望清单表';
COMMENT ON COLUMN wishlist_items.id IS '愿望清单项目唯一标识';
COMMENT ON COLUMN wishlist_items.user_id IS '所属用户 ID';
COMMENT ON COLUMN wishlist_items.city_name IS '城市名称';
COMMENT ON COLUMN wishlist_items.country_name IS '国家名称';
COMMENT ON COLUMN wishlist_items.continent IS '所属大洲';
COMMENT ON COLUMN wishlist_items.latitude IS '纬度';
COMMENT ON COLUMN wishlist_items.longitude IS '经度';
COMMENT ON COLUMN wishlist_items.priority IS '优先级 1-5';
COMMENT ON COLUMN wishlist_items.expected_season IS '期望季节';
COMMENT ON COLUMN wishlist_items.notes IS '备注';
COMMENT ON COLUMN wishlist_items.created_at IS '创建时间';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_priority ON wishlist_items(priority);

-- ============================================
-- 4. 创建 trips 表
-- ============================================
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  related_city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  related_wishlist_id UUID REFERENCES wishlist_items(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('planning', 'ongoing', 'completed')) DEFAULT 'planning',
  budget DECIMAL(12, 2),
  currency TEXT DEFAULT 'CNY',
  transportation TEXT,
  accommodation TEXT,
  notes TEXT,
  share_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

COMMENT ON TABLE trips IS '行程规划表';
COMMENT ON COLUMN trips.id IS '行程唯一标识';
COMMENT ON COLUMN trips.user_id IS '所属用户 ID';
COMMENT ON COLUMN trips.title IS '行程标题';
COMMENT ON COLUMN trips.related_city_id IS '关联的城市记录 ID';
COMMENT ON COLUMN trips.related_wishlist_id IS '关联的愿望清单项目 ID';
COMMENT ON COLUMN trips.start_date IS '开始日期';
COMMENT ON COLUMN trips.end_date IS '结束日期';
COMMENT ON COLUMN trips.status IS '状态：planning(规划中)、ongoing(进行中)、completed(已完成)';
COMMENT ON COLUMN trips.budget IS '预算';
COMMENT ON COLUMN trips.currency IS '货币单位';
COMMENT ON COLUMN trips.transportation IS '交通方式';
COMMENT ON COLUMN trips.accommodation IS '住宿信息';
COMMENT ON COLUMN trips.notes IS '备注';
COMMENT ON COLUMN trips.share_enabled IS '是否启用分享';
COMMENT ON COLUMN trips.created_at IS '创建时间';
COMMENT ON COLUMN trips.updated_at IS '更新时间';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_start_date ON trips(start_date);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);

-- ============================================
-- 5. 创建 trip_days 表
-- ============================================
CREATE TABLE IF NOT EXISTS trip_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL,
  date DATE NOT NULL,
  title TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, day_index)
);

COMMENT ON TABLE trip_days IS '行程日程表';
COMMENT ON COLUMN trip_days.id IS '日程唯一标识';
COMMENT ON COLUMN trip_days.trip_id IS '所属行程 ID';
COMMENT ON COLUMN trip_days.day_index IS '第几天（从 1 开始）';
COMMENT ON COLUMN trip_days.date IS '日期';
COMMENT ON COLUMN trip_days.title IS '当天标题';
COMMENT ON COLUMN trip_days.notes IS '当天备注';
COMMENT ON COLUMN trip_days.created_at IS '创建时间';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_trip_days_trip_id ON trip_days(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_days_date ON trip_days(date);

-- ============================================
-- 6. 创建 trip_tasks 表
-- ============================================
CREATE TABLE IF NOT EXISTS trip_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_id UUID REFERENCES trip_days(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE trip_tasks IS '行程待办事项表';
COMMENT ON COLUMN trip_tasks.id IS '任务唯一标识';
COMMENT ON COLUMN trip_tasks.trip_id IS '所属行程 ID';
COMMENT ON COLUMN trip_tasks.day_id IS '关联的日程 ID（可选）';
COMMENT ON COLUMN trip_tasks.content IS '任务内容';
COMMENT ON COLUMN trip_tasks.is_done IS '是否完成';
COMMENT ON COLUMN trip_tasks.created_at IS '创建时间';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_trip_tasks_trip_id ON trip_tasks(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_tasks_day_id ON trip_tasks(day_id);
CREATE INDEX IF NOT EXISTS idx_trip_tasks_is_done ON trip_tasks(is_done);

-- ============================================
-- 7. 创建 shares 表
-- ============================================
CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('all', 'trip')) NOT NULL,
  related_trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE shares IS '数据分享链接表';
COMMENT ON COLUMN shares.id IS '分享记录唯一标识';
COMMENT ON COLUMN shares.user_id IS '分享者用户 ID';
COMMENT ON COLUMN shares.type IS '分享类型：all(全部数据)、trip(特定行程)';
COMMENT ON COLUMN shares.related_trip_id IS '关联的行程 ID（type=trip 时必填）';
COMMENT ON COLUMN shares.slug IS '分享链接的唯一标识符';
COMMENT ON COLUMN shares.created_at IS '创建时间';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_shares_slug ON shares(slug);
CREATE INDEX IF NOT EXISTS idx_shares_user_id ON shares(user_id);

-- ============================================
-- 8. 启用 Row Level Security (RLS)
-- ============================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. 创建 RLS 策略 - users 表
-- ============================================

-- 用户可以查看自己的信息
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 用户可以更新自己的信息
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 10. 创建 RLS 策略 - cities 表
-- ============================================

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
  USING (auth.uid() = user_id);

-- 用户可以删除自己的城市记录
CREATE POLICY "Users can delete their own cities"
  ON cities FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 11. 创建 RLS 策略 - wishlist_items 表
-- ============================================

-- 用户可以管理自己的愿望清单
CREATE POLICY "Users can view their own wishlist"
  ON wishlist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items"
  ON wishlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist items"
  ON wishlist_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items"
  ON wishlist_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 12. 创建 RLS 策略 - trips 表
-- ============================================

-- 用户可以管理自己的行程
CREATE POLICY "Users can view their own trips"
  ON trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips"
  ON trips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips"
  ON trips FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 13. 创建 RLS 策略 - trip_days 表
-- ============================================

-- 用户可以管理自己行程的日程
CREATE POLICY "Users can view their own trip days"
  ON trip_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_days.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own trip days"
  ON trip_days FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_days.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own trip days"
  ON trip_days FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_days.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own trip days"
  ON trip_days FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_days.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- ============================================
-- 14. 创建 RLS 策略 - trip_tasks 表
-- ============================================

-- 用户可以管理自己行程的任务
CREATE POLICY "Users can view their own trip tasks"
  ON trip_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_tasks.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own trip tasks"
  ON trip_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_tasks.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own trip tasks"
  ON trip_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_tasks.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own trip tasks"
  ON trip_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_tasks.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- ============================================
-- 15. 创建 RLS 策略 - shares 表
-- ============================================

-- 任何人都可以查看分享（用于公开访问）
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
  USING (auth.uid() = user_id);

-- 用户可以删除自己的分享
CREATE POLICY "Users can delete their own shares"
  ON shares FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 16. 创建触发器函数 - 自动更新 updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 cities 表创建触发器
CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON cities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 trips 表创建触发器
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 17. 创建存储桶（Storage Buckets）
-- ============================================
-- 注意：此部分需要在 Supabase Storage 界面手动创建，或使用 Supabase CLI
-- 
-- 需要创建的存储桶：
-- 1. city-images: 存储城市封面图片
-- 2. user-avatars: 存储用户头像
--
-- 存储桶策略：
-- - city-images: 用户可以上传和删除自己的图片，所有人可以查看
-- - user-avatars: 用户可以上传和删除自己的头像，所有人可以查看

-- ============================================
-- 脚本执行完成
-- ============================================
-- 
-- 后续步骤：
-- 1. 在 Supabase 控制台的 Storage 中创建存储桶
-- 2. 配置存储桶的访问策略
-- 3. 在应用中配置 Supabase 客户端连接信息
-- 4. 测试数据库连接和 RLS 策略
-- 
-- ============================================
