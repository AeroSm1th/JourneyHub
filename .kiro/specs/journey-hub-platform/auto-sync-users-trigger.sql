-- ============================================
-- 自动同步用户触发器
-- ============================================
-- 说明：当在 auth.users 中创建新用户时，自动同步到 public.users
-- 执行此脚本后，以后创建的用户会自动同步
-- ============================================

-- 创建触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 验证触发器已创建
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- 同步现有用户（一次性操作）
-- ============================================
-- 将 auth.users 中已存在但 public.users 中不存在的用户同步过来

INSERT INTO public.users (id, email, created_at)
SELECT 
  au.id,
  au.email,
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 验证同步结果
SELECT 
  'auth.users' as source,
  COUNT(*) as user_count
FROM auth.users
UNION ALL
SELECT 
  'public.users' as source,
  COUNT(*) as user_count
FROM public.users;

-- 应该看到两个表的用户数量相同

-- ============================================
-- 完成！
-- ============================================
-- 现在：
-- ✅ 所有现有用户已同步到 public.users
-- ✅ 以后创建的新用户会自动同步
-- ✅ 可以继续执行 test-rls-policies.sql 了
-- ============================================
