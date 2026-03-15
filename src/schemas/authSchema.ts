/**
 * 认证表单验证 Schema
 *
 * 使用 Zod 定义用户认证相关的验证规则，确保安全性和数据完整性
 */

import { z } from 'zod';

/**
 * 邮箱验证规则
 */
const emailSchema = z
  .string({
    required_error: '邮箱不能为空',
  })
  .min(1, '邮箱不能为空')
  .trim()
  .toLowerCase()
  .email('请输入有效的邮箱地址')
  .max(255, '邮箱地址不能超过 255 个字符');

/**
 * 密码验证规则
 * 要求：至少 8 个字符
 */
const passwordSchema = z
  .string({
    required_error: '密码不能为空',
  })
  .min(8, '密码至少需要 8 个字符')
  .max(128, '密码不能超过 128 个字符');

/**
 * 强密码验证规则（可选，用于更严格的场景）
 * 要求：至少 8 个字符，包含大小写字母、数字和特殊字符
 */
const strongPasswordSchema = z
  .string({
    required_error: '密码不能为空',
  })
  .min(8, '密码至少需要 8 个字符')
  .max(128, '密码不能超过 128 个字符')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    '密码必须包含大小写字母、数字和特殊字符'
  );

/**
 * 登录表单验证 Schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * 注册表单验证 Schema
 */
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string({
      required_error: '请确认密码',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

/**
 * 强密码注册表单验证 Schema（可选）
 */
export const registerWithStrongPasswordSchema = z
  .object({
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string({
      required_error: '请确认密码',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

/**
 * 忘记密码表单验证 Schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * 重置密码表单验证 Schema
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string({
      required_error: '请确认密码',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

/**
 * 修改密码表单验证 Schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string({
      required_error: '请输入当前密码',
    }),
    newPassword: passwordSchema,
    confirmNewPassword: z.string({
      required_error: '请确认新密码',
    }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: '两次输入的新密码不一致',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: '新密码不能与当前密码相同',
    path: ['newPassword'],
  });

/**
 * 用户个人资料验证 Schema
 */
export const profileSchema = z.object({
  nickname: z
    .string()
    .min(2, '昵称至少需要 2 个字符')
    .max(50, '昵称不能超过 50 个字符')
    .trim()
    .optional(),

  avatarFile: z
    .instanceof(File, { message: '头像文件格式不正确' })
    .refine((file) => file.size <= 2 * 1024 * 1024, '头像大小不能超过 2MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      '只支持 JPG、PNG、WebP 格式的头像'
    )
    .optional(),
});

/**
 * 邮箱验证码验证 Schema
 */
export const emailVerificationSchema = z.object({
  email: emailSchema,
  code: z
    .string({
      required_error: '验证码不能为空',
    })
    .length(6, '验证码必须是 6 位数字')
    .regex(/^\d{6}$/, '验证码必须是 6 位数字'),
});

/**
 * 类型导出
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterWithStrongPasswordInput = z.infer<typeof registerWithStrongPasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
