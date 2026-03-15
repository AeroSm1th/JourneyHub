# 注册页面使用指南

## 快速开始

注册页面已经完成实现，可以通过以下路由访问：

- **路由**: `/auth/register`

## 功能特性

✅ **表单验证**
- 邮箱格式验证
- 密码长度验证（至少 8 个字符）
- 密码确认匹配验证
- 实时错误提示

✅ **用户体验**
- 加载状态显示
- 错误消息提示
- 注册成功后自动重定向到登录页
- 无障碍访问支持

✅ **安全性**
- 密码输入隐藏
- 表单提交时禁用按钮
- 密码确认验证

## 使用方法

### 1. 在路由中使用

```tsx
import { lazy } from 'react';

const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));

// 在路由配置中
{
  path: '/auth/register',
  element: <RegisterPage />
}
```

### 2. 表单验证规则

| 字段 | 规则 | 错误消息 |
|------|------|---------|
| 邮箱 | 必填、有效邮箱格式 | "邮箱不能为空" / "请输入有效的邮箱地址" |
| 密码 | 必填、至少 8 个字符 | "密码不能为空" / "密码至少需要 8 个字符" |
| 确认密码 | 必填、与密码匹配 | "请确认密码" / "两次输入的密码不一致" |

### 3. 注册流程

1. 用户填写邮箱、密码和确认密码
2. 前端验证表单数据
3. 调用 Supabase 注册 API
4. 注册成功后重定向到登录页
5. 用户使用新账户登录

## 技术实现

### 依赖的技术栈

- **React Hook Form**: 表单状态管理
- **Zod**: 表单验证
- **TanStack Query**: 注册请求管理
- **Zustand**: 认证状态管理
- **React Router**: 路由导航

### 核心 Hooks

```tsx
// 认证状态
const { isAuthenticated } = useAuth();

// 注册操作
const { mutate: signUp, isPending, error } = useRegister();

// 表单管理
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(registerSchema)
});
```

### 文件结构

```
src/pages/auth/
├── RegisterPage.tsx           # 注册页面组件
├── LoginPage.tsx              # 登录页面组件
├── __tests__/
│   ├── RegisterPage.test.tsx  # 注册页面测试
│   └── LoginPage.test.tsx     # 登录页面测试
├── README.md                  # 功能文档
├── RegisterPage.USAGE.md      # 注册页面使用指南（本文件）
└── USAGE.md                   # 登录页面使用指南
```

## 样式定制

注册页面复用登录页面的样式，样式文件位于 `src/pages/Login.module.css`。

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

## 常见问题

### Q: 如何修改密码强度要求？

A: 编辑 `src/schemas/authSchema.ts` 文件中的 `registerSchema`：

```typescript
// 使用强密码验证（包含大小写字母、数字和特殊字符）
export const registerSchema = z
  .object({
    email: emailSchema,
    password: strongPasswordSchema, // 使用强密码规则
    confirmPassword: z.string({
      required_error: '请确认密码',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });
```

### Q: 如何自定义注册成功后的行为？

A: 使用 `useRegister` hook 的选项：

```tsx
const { mutate: signUp } = useRegister({
  onSuccess: () => {
    toast.success('注册成功！请查收验证邮件');
  },
  redirectTo: '/auth/verify-email', // 自定义重定向路径
  autoLogin: true, // 注册后自动登录
});
```

### Q: 如何添加邮箱验证功能？

A: Supabase 默认支持邮箱验证。在 Supabase 控制台中启用邮箱验证：

1. 进入 Authentication > Settings
2. 启用 "Enable email confirmations"
3. 配置邮件模板

注册后用户会收到验证邮件，点击链接后账户才会激活。

### Q: 如何处理注册错误？

A: 注册错误会自动显示在表单下方。你也可以自定义错误处理：

```tsx
const { mutate: signUp, error } = useRegister({
  onError: (error) => {
    // 自定义错误处理
    if (error.message.includes('already registered')) {
      toast.error('该邮箱已被注册，请直接登录');
    } else {
      toast.error('注册失败，请稍后重试');
    }
  }
});
```

### Q: 如何添加用户协议和隐私政策？

A: 在表单中添加复选框：

```tsx
<div className={styles.row}>
  <label>
    <input
      type="checkbox"
      {...register('agreeToTerms')}
    />
    我已阅读并同意
    <Link to="/terms">用户协议</Link>
    和
    <Link to="/privacy">隐私政策</Link>
  </label>
  {errors.agreeToTerms && (
    <span className={styles.error}>
      {errors.agreeToTerms.message}
    </span>
  )}
</div>
```

然后更新验证 schema：

```typescript
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: '请阅读并同意用户协议和隐私政策',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });
```

## 测试

注册页面包含完整的测试覆盖：

```bash
# 运行注册页面测试
npm run test:run -- src/pages/auth/__tests__/RegisterPage.test.tsx

# 运行所有认证相关测试
npm run test:run -- src/pages/auth/__tests__/
```

测试覆盖：
- ✅ 表单渲染
- ✅ 表单验证（邮箱、密码、确认密码）
- ✅ 注册提交流程
- ✅ 错误处理
- ✅ 无障碍访问

## 下一步

- [x] 实现注册页面（任务 4.5）✅
- [ ] 实现路由守卫（任务 4.6）
- [ ] 实现退出登录功能（任务 4.7）
- [ ] 添加邮箱验证功能
- [ ] 添加社交登录（Google、GitHub 等）

## 相关文档

- [登录页面使用指南](./USAGE.md)
- [认证 API 文档](../../features/auth/README.md)
- [表单验证文档](../../schemas/README.md)
- [路由配置文档](../../app/router/README.md)

## 验证需求

本实现满足以下需求：

- **需求 1.1**: 提供邮箱密码注册功能 ✅
- **需求 1.3**: 验证邮箱格式和密码强度（至少 8 个字符）✅
