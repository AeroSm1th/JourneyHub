# User 组件使用指南

## 概述

`User` 组件显示当前登录用户的信息，并提供退出登录功能。

## 功能特性

- ✅ 显示用户邮箱
- ✅ 提供退出登录按钮
- ✅ 退出时清除会话令牌和本地缓存
- ✅ 退出后自动重定向到登录页面
- ✅ 错误处理和容错机制

## 基本用法

### 1. 在应用布局中使用

```tsx
import User from '@/components/User';
import { AppLayout } from '@/app/layouts/AppLayout';

function AppLayout() {
  return (
    <div className="app-layout">
      <header>
        <h1>JourneyHub</h1>
        <User />
      </header>
      <main>{/* 主要内容 */}</main>
    </div>
  );
}
```

### 2. 在导航栏中使用

```tsx
import User from '@/components/User';

function Navbar() {
  return (
    <nav>
      <div className="nav-left">
        <Logo />
        <NavLinks />
      </div>
      <div className="nav-right">
        <User />
      </div>
    </nav>
  );
}
```

## 工作流程

1. **显示用户信息**
   - 从 `useAuth()` hook 获取当前用户
   - 显示用户邮箱

2. **退出登录**
   - 用户点击"退出登录"按钮
   - 调用 `signOut()` API 函数
   - Supabase 清除会话令牌
   - `useAuth()` hook 自动更新状态（通过 `onAuthStateChange` 监听器）
   - 组件重定向到登录页面

3. **错误处理**
   - 如果退出失败，记录错误到控制台
   - 即使出错也尝试重定向到登录页面
   - 确保用户不会卡在错误状态

## 状态管理

### 认证状态自动更新

退出登录时，认证状态会自动更新：

```typescript
// useAuth hook 中的监听器
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // 自动清除认证状态
    clearAuth();
  }
});
```

### 本地缓存清理

Supabase 会自动清除以下内容：

- Session 令牌（localStorage）
- Refresh 令牌
- 用户信息缓存

## 样式定制

组件使用 CSS Modules，可以通过修改 `User.module.css` 来定制样式：

```css
/* User.module.css */
.user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user span {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.user button {
  padding: 0.5rem 1rem;
  background-color: var(--color-danger);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user button:hover {
  background-color: var(--color-danger-dark);
}
```

## 响应式设计

在移动端，可以考虑只显示退出按钮图标：

```tsx
function User() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // ... handleLogout 函数

  return (
    <div className={styles.user}>
      {!isMobile && <span>欢迎, {user.email}</span>}
      <button onClick={handleLogout}>{isMobile ? <LogoutIcon /> : '退出登录'}</button>
    </div>
  );
}
```

## 注意事项

1. **重定向路径**
   - 使用 `replace: true` 避免在浏览器历史中留下记录
   - 退出后用户无法通过"后退"按钮返回

2. **错误处理**
   - 即使 API 调用失败，也会尝试重定向
   - 这确保用户不会卡在错误状态

3. **性能优化**
   - 组件在用户未登录时返回 `null`
   - 避免不必要的渲染

4. **安全性**
   - 退出登录会清除所有会话信息
   - 符合需求 1.7 的要求

## 相关文件

- `src/features/auth/hooks/useAuth.ts` - 认证状态 Hook
- `src/features/auth/api.ts` - 认证 API（包含 signOut 函数）
- `src/store/authStore.ts` - 认证状态 Store
- `src/components/User.module.css` - 组件样式

## 验证需求

- **需求 1.6**: 提供退出登录功能
- **需求 1.7**: 退出登录时清除会话令牌和本地缓存数据
