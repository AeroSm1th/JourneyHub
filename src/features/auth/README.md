# 认证功能模块

## 概述

本模块封装了 Supabase 认证相关的 API 方法，提供类型安全的用户注册、登录、退出和获取当前用户功能。

## API 函数

### signUp(email, password)

用户注册功能。

**参数：**

- `email: string` - 用户邮箱地址
- `password: string` - 用户密码（至少 8 个字符）

**返回值：**

- `Promise<User>` - 注册成功返回用户信息

**示例：**

```typescript
import { signUp } from '@/features/auth/api';

try {
  const user = await signUp('user@example.com', 'password123');
  console.log('注册成功:', user);
} catch (error) {
  console.error('注册失败:', error.message);
}
```

**验证需求：** 1.1（用户注册）

---

### signIn(email, password)

用户登录功能。

**参数：**

- `email: string` - 用户邮箱地址
- `password: string` - 用户密码

**返回值：**

- `Promise<User>` - 登录成功返回用户信息

**示例：**

```typescript
import { signIn } from '@/features/auth/api';

try {
  const user = await signIn('user@example.com', 'password123');
  console.log('登录成功:', user);
} catch (error) {
  console.error('登录失败:', error.message);
}
```

**验证需求：** 1.2（用户登录）

---

### signOut()

退出登录功能。

**参数：** 无

**返回值：**

- `Promise<void>` - 退出成功

**示例：**

```typescript
import { signOut } from '@/features/auth/api';

try {
  await signOut();
  console.log('退出成功');
} catch (error) {
  console.error('退出失败:', error.message);
}
```

**验证需求：** 1.6（退出登录）

---

### getCurrentUser()

获取当前登录用户信息。

**参数：** 无

**返回值：**

- `Promise<User | null>` - 返回当前登录用户信息，未登录返回 null

**示例：**

```typescript
import { getCurrentUser } from '@/features/auth/api';

try {
  const user = await getCurrentUser();
  if (user) {
    console.log('当前用户:', user.email);
  } else {
    console.log('未登录');
  }
} catch (error) {
  console.error('获取用户信息失败:', error.message);
}
```

---

## 类型定义

### User

```typescript
interface User {
  id: string;
  email: string;
  nickname?: string;
  avatar_url?: string;
  created_at: string;
}
```

### AuthResponse

```typescript
interface AuthResponse {
  user: User | null;
  error?: AuthError;
}
```

### AuthError

```typescript
interface AuthError {
  message: string;
  code?: string;
}
```

---

## 错误处理

所有 API 函数在失败时都会抛出错误，建议使用 try-catch 进行错误处理：

```typescript
try {
  const user = await signIn(email, password);
  // 处理成功逻辑
} catch (error) {
  // 处理错误
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

常见错误信息：

- `"邮箱已存在"` - 注册时邮箱已被使用
- `"邮箱或密码错误"` - 登录凭据不正确
- `"注册失败：未返回用户信息"` - 注册过程中出现异常
- `"获取用户信息失败：..."` - 数据库查询失败

---

## 与 TanStack Query 集成

推荐在 `hooks/` 目录下创建自定义 hooks 来集成 TanStack Query：

```typescript
// src/features/auth/hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query';
import { signIn } from '../api';

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn(email, password),
    onSuccess: (user) => {
      console.log('登录成功:', user);
    },
    onError: (error) => {
      console.error('登录失败:', error);
    },
  });
}
```

---

## 注意事项

1. **用户表记录创建**：当前实现中，`signUp` 函数返回基础的用户对象。在生产环境中，建议通过 Supabase 数据库触发器自动创建 `users` 表记录。

2. **会话管理**：Supabase 客户端已配置为自动持久化会话到 localStorage，并自动刷新令牌。

3. **类型安全**：所有函数都提供完整的 TypeScript 类型支持，确保类型安全。

4. **错误处理**：所有函数在失败时都会抛出错误，调用时需要进行适当的错误处理。

---

## 下一步

- 创建 `hooks/useAuth.ts` - 封装认证状态管理
- 创建 `hooks/useLogin.ts` - 封装登录逻辑
- 创建 `hooks/useRegister.ts` - 封装注册逻辑
- 创建 `components/` - 认证相关 UI 组件
