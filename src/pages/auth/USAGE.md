# 登录页面使用指南

## 快速开始

登录页面已经完成实现，可以通过以下路由访问：

- **新路由**: `/auth/login`
- **旧路由**: `/login` (自动重定向到 `/auth/login`)

## 功能特性

✅ **表单验证**
- 邮箱格式验证
- 密码长度验证（至少 8 个字符）
- 实时错误提示

✅ **用户体验**
- 加载状态显示
- 错误消息提示
- 自动重定向（登录成功后）
- 无障碍访问支持

✅ **安全性**
- 密码输入隐藏
- 表单提交时禁用按钮
- 会话令牌管理

## 使用方法

### 1. 在路由中使用

```tsx
import { lazy } from 'react';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));

// 在路由配置中
{
  path: '/auth/login',
  element: <LoginPage />
}
```

### 2. 表单验证规则

| 字段 | 规则 | 错误消息 |
|------|------|---------|
| 邮箱 | 必填、有效邮箱格式 | "邮箱不能为空" / "请输入有效的邮箱地址" |
| 密码 | 必填、至少 8 个字符 | "密码不能为空" / "密码至少需要 8 个字符" |

### 3. 测试账户

开发环境可以使用以下测试账户：

```
邮箱: test@example.com
密码: password123
```

## 技术实现

### 依赖的技术栈

- **React Hook Form**: 表单状态管理
- **Zod**: 表单验证
- **TanStack Query**: 登录请求管理
- **Zustand**: 认证状态管理
- **React Router**: 路由导航

### 核心 Hooks

```tsx
// 认证状态
const { isAuthenticated } = useAuth();

// 登录操作
const { mutate: login, isPending, error } = useLogin();

// 表单管理
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema)
});
```

### 文件结构

```
src/pages/auth/
├── LoginPage.tsx           # 登录页面组件
├── __tests__/
│   └── LoginPage.test.tsx  # 组件测试
├── README.md               # 功能文档
└── USAGE.md                # 使用指南（本文件）
```

## 样式定制

登录页面使用 CSS Modules，样式文件位于 `src/pages/Login.module.css`。

### 可用的样式类

```css
.login      /* 页面容器 */
.form       /* 表单容器 */
.row        /* 表单行 */
.error      /* 错误消息 */
.errorBox   /* 错误提示框 */
.footer     /* 页脚 */
.link       /* 链接样式 */
```

### 自定义样式示例

```tsx
// 使用自定义样式
import customStyles from './CustomLogin.module.css';

<form className={customStyles.form}>
  {/* ... */}
</form>
```

## 常见问题

### Q: 如何修改验证规则？

A: 编辑 `src/schemas/authSchema.ts` 文件中的 `loginSchema`：

```typescript
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema.min(10, '密码至少需要 10 个字符'), // 修改最小长度
});
```

### Q: 如何添加"记住我"功能？

A: 在表单中添加复选框，并在 `useLogin` hook 中处理：

```tsx
const [rememberMe, setRememberMe] = useState(false);

const { mutate: login } = useLogin({
  onSuccess: () => {
    if (rememberMe) {
      // 保存到 localStorage
      localStorage.setItem('rememberMe', 'true');
    }
  }
});
```

### Q: 如何自定义登录成功后的重定向路径？

A: 使用 `useLogin` hook 的 `redirectTo` 选项：

```tsx
const { mutate: login } = useLogin({
  redirectTo: '/dashboard' // 自定义重定向路径
});
```

### Q: 如何处理登录错误？

A: 登录错误会自动显示在表单下方。你也可以自定义错误处理：

```tsx
const { mutate: login, error } = useLogin({
  onError: (error) => {
    // 自定义错误处理
    if (error.message.includes('Invalid')) {
      toast.error('邮箱或密码错误');
    }
  }
});
```

## 下一步

- [ ] 实现注册页面（任务 4.5）
- [ ] 添加"忘记密码"功能
- [ ] 添加社交登录（Google、GitHub 等）
- [ ] 添加双因素认证

## 相关文档

- [认证 API 文档](../../features/auth/README.md)
- [表单验证文档](../../schemas/README.md)
- [路由配置文档](../../app/router/README.md)
