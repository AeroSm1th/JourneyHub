-- ============================================
-- 诊断 + 修复卡住的用户
-- 把 'your-email@example.com' 替换为你实际的邮箱
-- ============================================

-- 步骤 1: 检查 auth.users 中是否还有这个用户
SELECT id, email, created_at, deleted_at
FROM auth.users
WHERE email = 'your-email@example.com';

-- 步骤 2: 检查 public.users 中是否还有这个用户
SELECT id, email, created_at
FROM public.users
WHERE email = 'your-email@example.com';

-- ============================================
-- 如果上面查到了记录，执行下面的清理语句
-- ============================================

-- 步骤 3: 删除 public.users 中的残留记录
DELETE FROM public.users
WHERE email = 'your-email@example.com';

-- 步骤 4: 删除 auth.users 中的残留记录
DELETE FROM auth.users
WHERE email = 'your-email@example.com';

-- 步骤 5: 验证已清理干净
SELECT 'auth.users' AS source, COUNT(*) AS cnt
FROM auth.users WHERE email = 'your-email@example.com'
UNION ALL
SELECT 'public.users', COUNT(*)
FROM public.users WHERE email = 'your-email@example.com';
-- 两行都应该是 0
