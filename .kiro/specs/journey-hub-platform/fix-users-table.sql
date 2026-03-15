-- ============================================
-- 修复 users 表 - 插入测试用户数据
-- ============================================

-- 步骤 1: 查看 auth.users 中的用户
SELECT id, email, created_at 
FROM auth.users;

-- 步骤 2: 将认证用户同步到 public.users 表
-- 替换下面的 email 为你在 Authentication 中创建的用户邮箱

INSERT INTO public.users (id, email, created_at)
VALUES (
  '3e650d13-8593-4809-a459-8c6798ac980c',
  'test@example.com',  -- 替换为实际邮箱
  NOW()
);

-- 步骤 3: 验证插入成功
SELECT * FROM public.users;

-- ============================================
-- 现在可以继续执行 test-rls-policies.sql 了
-- ============================================
