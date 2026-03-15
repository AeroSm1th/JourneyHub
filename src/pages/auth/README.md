# 认证页面

本目录包含所有与用户认证相关的页面组件。

## 页面列表

### LoginPage.tsx

登录页面组件，提供用户登录功能。

**功能特性：**

- ✅ 使用 React Hook Form 进行表单管理
- ✅ 使用 Zod 进行表单验证
- ✅ 实时显示验证错误消息
- ✅ 邮箱格式验证
- ✅ 密码强度验证（至少 8 个字符）
- ✅ 登录状态管理
- ✅ 自动重定向（登录成功后）
- ✅ 无障碍访问支持（ARIA 属性）

**路由：**

- `/auth/login` - 新路由
- `/login` - 旧路由（自动重定向到 `/auth/login`）

**使用示例：**

```tsx
import LoginPage from '@/pages/auth/LoginPage';

// 在路由中使用
<Route path="/auth/login" element={<LoginPage />} />;
```

**表单验证规则：**

| 字段 | 验证规则            | 错误消息                                 |
| ---- | ------------------- | ---------------------------------------- |
| 邮箱 | 必填、有效邮箱格式  | "邮箱不能为空" / "请输入有效的邮箱地址"  |
| 密码 | 必填、至少 8 个字符 | "密码不能为空" / "密码至少需要 8 个字符" |

**依赖的 Hooks：**

- `useAuth` - 获取认证状态
- `useLogin` - 执行登录操作
- `useForm` (React Hook Form) - 表单管理
- `zodResolver` - Zod 验证集成

**相关文件：**

- Schema: `src/schemas/authSchema.ts`
- API: `src/features/auth/api.ts`
- Hooks: `src/features/auth/hooks/useLogin.ts`
- 样式: `src/pages/Login.module.css`

## 待实现页面

### RegisterPage.tsx (任务 4.5)

注册页面组件，提供用户注册功能。

**计划功能：**

- 邮箱密码注册
- 密码确认
- 表单验证
- 注册成功后自动登录

## 开发指南

### 添加新的认证页面

1. 在 `src/pages/auth/` 目录下创建新的页面组件
2. 在 `src/schemas/authSchema.ts` 中定义验证规则
3. 在 `src/features/auth/hooks/` 中创建相关 hooks
4. 在 `src/app/router/index.tsx` 中添加路由配置
5. 更新本 README 文件

### 测试

所有认证页面都应该有对应的测试文件：

```bash
# 运行测试
npm run test

# 运行特定测试
npm run test -- LoginPage.test.tsx
```

### 样式规范

认证页面使用 CSS Modules，样式文件位于 `src/pages/Login.module.css`。

**可用的样式类：**

- `.login` - 页面容器
- `.form` - 表单容器
- `.row` - 表单行
- `.error` - 错误消息
- `.errorBox` - 错误提示框
- `.footer` - 页脚
- `.link` - 链接样式

## 验证需求

- ✅ 需求 1.2: 提供邮箱密码登录功能
- ✅ 需求 1.3: 验证邮箱格式和密码强度
- ⏳ 需求 1.1: 提供邮箱密码注册功能（待实现）
