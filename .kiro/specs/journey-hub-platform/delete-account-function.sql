-- 创建数据库函数：一站式删除账户
-- 需要在 Supabase SQL Editor 中执行此脚本

-- ============================================
-- 1. 修复注册触发器（SECURITY DEFINER 绕过 RLS）
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NEW.created_at)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. 一站式删除账户函数（清理所有业务数据 + auth 用户）
-- ============================================
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
  trip_ids uuid[];
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RAISE EXCEPTION '未登录，无法删除账户';
  END IF;

  -- 收集行程 ID
  SELECT COALESCE(array_agg(id), '{}') INTO trip_ids
  FROM trips WHERE user_id = uid;

  -- 删除行程子表
  IF array_length(trip_ids, 1) > 0 THEN
    DELETE FROM trip_tasks WHERE trip_id = ANY(trip_ids);
    DELETE FROM trip_days WHERE trip_id = ANY(trip_ids);
  END IF;

  -- 删除业务数据
  DELETE FROM trips WHERE user_id = uid;
  DELETE FROM shares WHERE user_id = uid;
  DELETE FROM wishlist_items WHERE user_id = uid;
  DELETE FROM cities WHERE user_id = uid;
  DELETE FROM users WHERE id = uid;

  -- 最后删除 auth 用户
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
