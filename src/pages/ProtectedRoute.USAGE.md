# ProtectedRoute 使用指南

## 概述

`ProtectedRoute` 是一个路由守卫组件，用于保护需要认证的路由。未登录用户将被自动重定向到登录页面。

## 功能特性

- ✅ 自动检查用户登录状态
- ✅ 未登录用户重定向到登录页面
- ✅ 保存原始访问路径，登录后可返回
- ✅ 显示加载状态（认证检查期间）
- ✅ 支持嵌套路由保护

## 基本用法

### 1. 保护单个路由

```tsx
import { ProtectedRoute } from '@/pages/ProtectedRoute';
import { AppLayout } from '@/app/layouts/AppLayout';

<Route
  path="/app"
  element={
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  }
/>;
```

### 2. 保护嵌套路由

```tsx
import { ProtectedRoute } from '@/pages/ProtectedRoute';
import { AppLayout } from '@/app/layouts/AppLayout';
import { MapPage } from '@/pages/map/MapPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';

<Route
  path="/app"
  element={
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  }
>
  <Route path="map" element={<MapPage />} />
  <Route path="profile" element={<ProfilePage />} />
</Route>;
```

### 3. 完整路由配置示例

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/pages/ProtectedRoute';
import { HomePage } from '@/pages/home/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { AppLayout } from '@/app/layouts/AppLayout';
import { MapPage } from '@/pages/map/MapPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/auth/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/register',
    element: <RegisterPage />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'map',
        element: <MapPage />,
      },
      // 更多受保护的路由...
    ],
  },
]);
```

## 工作流程

1. **用户访问受保护路由**
   - 例如：`/app/map`

2. **ProtectedRoute 检查认证状态**
   - 调用 `useAuth()` 获取当前用户信息

3. **根据认证状态处理**
   - **加载中**：显示 `SpinnerFullPage` 全屏加载动画
   - **未登录**：重定向到 `/auth/login`，并保存原始路径到 `location.state.from`
   - **已登录**：渲染受保护的内容

4. **登录后返回原始路径**
   - 登录页面可以从 `location.state.from` 获取原始路径
   - 登录成功后导航回该路径

## 登录后返回原始路径

在登录页面中实现：

```tsx
import { useLocation, useNavigate } from 'react-router-dom';

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mutate: login } = useLogin();

  const handleLogin = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        // 获取原始访问路径
        const from = location.state?.from?.pathname || '/app/map';
        // 登录成功后返回原始路径
        navigate(from, { replace: true });
      },
    });
  };

  return <form onSubmit={handleSubmit(handleLogin)}>{/* 表单内容 */}</form>;
}
```

## 状态说明

### isLoading 状态

- 当 `useAuth()` 正在初始化认证状态时，`isLoading` 为 `true`
- 此时显示 `SpinnerFullPage` 全屏加载动画
- 避免在认证检查完成前显示受保护的内容

### user 状态

- `user` 为 `null`：用户未登录
- `user` 为对象：用户已登录，包含用户信息

## 注意事项

1. **加载状态处理**
   - 必须等待认证检查完成后再决定是否重定向
   - 避免闪烁：不要在加载期间显示受保护的内容

2. **重定向路径**
   - 使用 `replace: true` 避免在浏览器历史中留下重定向记录
   - 保存原始路径到 `location.state.from`，方便登录后返回

3. **嵌套路由**
   - 只需在父路由使用 `ProtectedRoute`
   - 所有子路由自动受到保护

4. **性能优化**
   - `useAuth()` 使用 Zustand 管理状态，性能开销很小
   - 认证状态变化时自动更新，无需手动刷新

## 相关文件

- `src/features/auth/hooks/useAuth.ts` - 认证状态 Hook
- `src/store/authStore.ts` - 认证状态 Store
- `src/components/SpinnerFullPage.jsx` - 全屏加载组件
- `src/pages/auth/LoginPage.tsx` - 登录页面

## 验证需求

- **需求 1.5**: 未认证用户访问受保护路由时重定向到登录页面
