/**
 * 认证表单验证 Schema 单元测试
 *
 * 测试所有认证相关的 Zod schema 验证规则、边界条件和错误消息
 */

import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  registerWithStrongPasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  profileSchema,
  emailVerificationSchema,
} from '../authSchema';

describe('loginSchema', () => {
  describe('邮箱验证', () => {
    it('应该接受有效的邮箱地址', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.com',
        'user+tag@example.co.uk',
        'user123@test-domain.com',
      ];

      validEmails.forEach((email) => {
        const result = loginSchema.safeParse({
          email,
          password: 'password123',
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝无效的邮箱格式', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
      ];

      invalidEmails.forEach((email) => {
        const result = loginSchema.safeParse({
          email,
          password: 'password123',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('请输入有效的邮箱地址');
        }
      });
    });

    it('应该拒绝空邮箱', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('邮箱不能为空');
      }
    });

    it('应该拒绝超过 255 字符的邮箱', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = loginSchema.safeParse({
        email: longEmail,
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('邮箱地址不能超过 255 个字符');
      }
    });

    it('应该自动转换邮箱为小写', () => {
      const result = loginSchema.safeParse({
        email: 'USER@EXAMPLE.COM',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('应该自动去除邮箱的首尾空格', () => {
      const result = loginSchema.safeParse({
        email: '  user@example.com  ',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        // 验证邮箱已被转换为小写并去除空格
        expect(result.data.email).toBe('user@example.com');
      }
    });
  });

  describe('密码验证', () => {
    it('应该接受至少 8 个字符的密码', () => {
      const validPasswords = ['password', 'password123', 'a'.repeat(8), 'a'.repeat(128)];

      validPasswords.forEach((password) => {
        const result = loginSchema.safeParse({
          email: 'user@example.com',
          password,
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝少于 8 个字符的密码', () => {
      const shortPasswords = ['', 'pass', '1234567'];

      shortPasswords.forEach((password) => {
        const result = loginSchema.safeParse({
          email: 'user@example.com',
          password,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('密码至少需要 8 个字符');
        }
      });
    });

    it('应该拒绝超过 128 个字符的密码', () => {
      const longPassword = 'a'.repeat(129);
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: longPassword,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('密码不能超过 128 个字符');
      }
    });

    it('应该拒绝空密码', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('密码至少需要 8 个字符');
      }
    });
  });

  describe('完整表单验证', () => {
    it('应该接受有效的登录表单', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
    });

    it('应该拒绝缺少必填字段的表单', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
      });

      expect(result.success).toBe(false);
    });
  });
});

describe('registerSchema', () => {
  describe('密码确认验证', () => {
    it('应该接受匹配的密码和确认密码', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(result.success).toBe(true);
    });

    it('应该拒绝不匹配的密码和确认密码', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmPasswordError = result.error.issues.find(
          (issue) => issue.path[0] === 'confirmPassword'
        );
        expect(confirmPasswordError?.message).toBe('两次输入的密码不一致');
      }
    });

    it('应该拒绝空的确认密码', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: '',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('完整表单验证', () => {
    it('应该接受有效的注册表单', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(result.success).toBe(true);
    });
  });
});

describe('registerWithStrongPasswordSchema', () => {
  describe('强密码验证', () => {
    it('应该接受包含大小写字母、数字和特殊字符的密码', () => {
      const validStrongPasswords = ['Password123!', 'MyP@ssw0rd', 'Str0ng!Pass', 'C0mpl3x@Pass'];

      validStrongPasswords.forEach((password) => {
        const result = registerWithStrongPasswordSchema.safeParse({
          email: 'user@example.com',
          password,
          confirmPassword: password,
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝缺少大写字母的密码', () => {
      const result = registerWithStrongPasswordSchema.safeParse({
        email: 'user@example.com',
        password: 'password123!',
        confirmPassword: 'password123!',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('密码必须包含大小写字母、数字和特殊字符');
      }
    });

    it('应该拒绝缺少小写字母的密码', () => {
      const result = registerWithStrongPasswordSchema.safeParse({
        email: 'user@example.com',
        password: 'PASSWORD123!',
        confirmPassword: 'PASSWORD123!',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('密码必须包含大小写字母、数字和特殊字符');
      }
    });

    it('应该拒绝缺少数字的密码', () => {
      const result = registerWithStrongPasswordSchema.safeParse({
        email: 'user@example.com',
        password: 'Password!',
        confirmPassword: 'Password!',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('密码必须包含大小写字母、数字和特殊字符');
      }
    });

    it('应该拒绝缺少特殊字符的密码', () => {
      const result = registerWithStrongPasswordSchema.safeParse({
        email: 'user@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('密码必须包含大小写字母、数字和特殊字符');
      }
    });
  });
});

describe('forgotPasswordSchema', () => {
  it('应该接受有效的邮箱', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'user@example.com',
    });

    expect(result.success).toBe(true);
  });

  it('应该拒绝无效的邮箱', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'invalid',
    });

    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('应该接受匹配的新密码和确认密码', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'newpassword123',
      confirmPassword: 'newpassword123',
    });

    expect(result.success).toBe(true);
  });

  it('应该拒绝不匹配的新密码和确认密码', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'newpassword123',
      confirmPassword: 'different123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmPasswordError = result.error.issues.find(
        (issue) => issue.path[0] === 'confirmPassword'
      );
      expect(confirmPasswordError?.message).toBe('两次输入的密码不一致');
    }
  });
});

describe('changePasswordSchema', () => {
  it('应该接受有效的密码修改表单', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpassword123',
      newPassword: 'newpassword123',
      confirmNewPassword: 'newpassword123',
    });

    expect(result.success).toBe(true);
  });

  it('应该拒绝不匹配的新密码和确认新密码', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpassword123',
      newPassword: 'newpassword123',
      confirmNewPassword: 'different123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmPasswordError = result.error.issues.find(
        (issue) => issue.path[0] === 'confirmNewPassword'
      );
      expect(confirmPasswordError?.message).toBe('两次输入的新密码不一致');
    }
  });

  it('应该拒绝新密码与当前密码相同', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'password123',
      newPassword: 'password123',
      confirmNewPassword: 'password123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const newPasswordError = result.error.issues.find((issue) => issue.path[0] === 'newPassword');
      expect(newPasswordError?.message).toBe('新密码不能与当前密码相同');
    }
  });

  it('应该拒绝缺少当前密码', () => {
    const result = changePasswordSchema.safeParse({
      newPassword: 'newpassword123',
      confirmNewPassword: 'newpassword123',
    });

    expect(result.success).toBe(false);
  });
});

describe('profileSchema', () => {
  describe('昵称验证', () => {
    it('应该接受有效的昵称 (2-50 字符)', () => {
      const validNicknames = ['张三', 'John', 'a'.repeat(50)];

      validNicknames.forEach((nickname) => {
        const result = profileSchema.safeParse({
          nickname,
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝少于 2 个字符的昵称', () => {
      const result = profileSchema.safeParse({
        nickname: 'a',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('昵称至少需要 2 个字符');
      }
    });

    it('应该拒绝超过 50 个字符的昵称', () => {
      const longNickname = 'a'.repeat(51);
      const result = profileSchema.safeParse({
        nickname: longNickname,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('昵称不能超过 50 个字符');
      }
    });

    it('应该自动去除昵称的首尾空格', () => {
      const result = profileSchema.safeParse({
        nickname: '  张三  ',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nickname).toBe('张三');
      }
    });

    it('应该允许昵称为可选字段', () => {
      const result = profileSchema.safeParse({});

      expect(result.success).toBe(true);
    });
  });

  describe('头像文件验证', () => {
    it('应该接受有效的头像文件 (JPG, PNG, WebP, ≤2MB)', () => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

      validTypes.forEach((type) => {
        const file = new File([''], 'avatar.jpg', { type });
        Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 });

        const result = profileSchema.safeParse({
          avatarFile: file,
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝超过 2MB 的头像', () => {
      const file = new File([''], 'avatar.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 });

      const result = profileSchema.safeParse({
        avatarFile: file,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('头像大小不能超过 2MB');
      }
    });

    it('应该拒绝不支持的头像格式', () => {
      const file = new File([''], 'avatar.gif', { type: 'image/gif' });
      Object.defineProperty(file, 'size', { value: 1 * 1024 * 1024 });

      const result = profileSchema.safeParse({
        avatarFile: file,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('只支持 JPG、PNG、WebP 格式的头像');
      }
    });

    it('应该允许头像文件为可选字段', () => {
      const result = profileSchema.safeParse({
        nickname: '张三',
      });

      expect(result.success).toBe(true);
    });
  });
});

describe('emailVerificationSchema', () => {
  describe('验证码验证', () => {
    it('应该接受 6 位数字验证码', () => {
      const validCodes = ['123456', '000000', '999999'];

      validCodes.forEach((code) => {
        const result = emailVerificationSchema.safeParse({
          email: 'user@example.com',
          code,
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝非 6 位的验证码', () => {
      const invalidCodes = ['12345', '1234567', ''];

      invalidCodes.forEach((code) => {
        const result = emailVerificationSchema.safeParse({
          email: 'user@example.com',
          code,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('验证码必须是 6 位数字');
        }
      });
    });

    it('应该拒绝包含非数字字符的验证码', () => {
      const invalidCodes = ['12345a', 'abcdef', '12 456'];

      invalidCodes.forEach((code) => {
        const result = emailVerificationSchema.safeParse({
          email: 'user@example.com',
          code,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('验证码必须是 6 位数字');
        }
      });
    });

    it('应该拒绝空验证码', () => {
      const result = emailVerificationSchema.safeParse({
        email: 'user@example.com',
        code: '',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('完整表单验证', () => {
    it('应该接受有效的邮箱验证表单', () => {
      const result = emailVerificationSchema.safeParse({
        email: 'user@example.com',
        code: '123456',
      });

      expect(result.success).toBe(true);
    });
  });
});
