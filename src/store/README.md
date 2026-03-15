# Store 状态管理

本目录包含使用 Zustand 管理的客户端状态。

## 目录结构

```
store/
├── authStore.ts      # 认证状态管理
├── uiStore.ts        # UI 状态管理（待实现）
├── draftStore.ts     # 表单草稿管理（待实现）
└── __tests__/        # 单元测试
```

## authStore - 认证状态管理

### 功能说明

`authStore` 负责管理用户的认证状态，包括：

- 当前登录用户信息
- Supabase 会话信息（访问令牌、刷新令牌等）
- 认证状态的设置和清除方法

### 使用示例

#### 1. 获取认证状态

```typescript
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const { user, session } = useAuthStore();

  if (!user) {
    return <div>请先登录</div>;
  }

  return <div>欢迎，{user.email}</div>;
}
```

#### 2. 登录成功后设置认证状态

```typescript
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase/client';

async function handleLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('登录失败:', error);
    return;
  }

  // 设置认证状态
  const { setAuth } = useAuthStore.getState();
  setAuth(data.user, data.session);
}
```

#### 3. 退出登录时清除认证状态

```typescript
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase/client';

async function handleLogout() {
  // 调用 Supabase 退出登录
  await supabase.auth.signOut();

  // 清除本地认证状态
  const { clearAuth } = useAuthStore.getState();
  clearAuth();
}
```

#### 4. 在组件外部访问状态

```typescript
import { useAuthStore } from '@/store/authStore';

// 获取当前状态
const currentUser = useAuthStore.getState().user;

// 订阅状态变化
const unsubscribe = useAuthStore.subscribe((state) => {
  console.log('认证状态变化:', state.user);
});

// 取消订阅
unsubscribe();
```

### API 参考

#### State

| 属性      | 类型              | 说明                              |
| --------- | ----------------- | --------------------------------- |
| `user`    | `User \| null`    | 当前登录用户信息，null 表示未登录 |
| `session` | `Session \| null` | Supabase 会话信息，包含访问令牌等 |

#### Actions

| 方法        | 参数                                             | 说明             |
| ----------- | ------------------------------------------------ | ---------------- |
| `setAuth`   | `(user: User \| null, session: Session \| null)` | 设置认证状态     |
| `clearAuth` | `()`                                             | 清除所有认证信息 |

### 类型定义

```typescript
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  setAuth: (user: User | null, session: Session | null) => void;
  clearAuth: () => void;
}
```

### 测试

运行测试：

```bash
npm test -- src/store/__tests__/authStore.test.ts
```

测试覆盖：

- ✅ 初始状态验证
- ✅ setAuth 方法功能
- ✅ clearAuth 方法功能
- ✅ 状态更新和隔离

## 设计原则

### 1. 状态分离

- **Server State**：使用 TanStack Query 管理（城市、行程等数据）
- **Client State**：使用 Zustand 管理（认证、UI 状态、草稿等）

### 2. 最小化状态

只在 store 中存储必要的状态，避免冗余数据。

### 3. 不可变更新

Zustand 内部使用 immer，确保状态更新的不可变性。

### 4. 类型安全

所有 store 都有完整的 TypeScript 类型定义。

## 相关文档

- [Zustand 官方文档](https://github.com/pmndrs/zustand)
- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [需求文档 - 1.4 登录成功生成令牌](../../.kiro/specs/journey-hub-platform/requirements.md)
