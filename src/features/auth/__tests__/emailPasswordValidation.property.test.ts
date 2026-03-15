/**
 * 属性测试：邮箱和密码验证
 *
 * 属性 1: 邮箱和密码验证
 * 验证需求: 1.3
 *
 * 对于任何用户输入的邮箱和密码组合，当提交注册表单时，
 * 系统应该拒绝无效的邮箱格式和弱密码（少于 8 个字符），
 * 并接受有效的输入。
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { loginSchema, registerSchema } from '@/schemas/authSchema';

// ============================================================================
// 辅助生成器
// ============================================================================

/** 生成有效的邮箱地址 */
const arbValidEmail = fc
  .tuple(
    // local part: 以字母开头，只包含字母数字
    fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s)),
    fc.string({ minLength: 1, maxLength: 10 }).filter((s) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s)),
    fc.constantFrom('com', 'org', 'net', 'io', 'cn')
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

/** 生成有效的密码（至少 8 个字符） */
const arbValidPassword = fc.string({ minLength: 8, maxLength: 128 }).filter((s) => s.length >= 8);

/** 生成无效的邮箱（不含 @ 或域名） */
const arbInvalidEmail = fc.oneof(
  // 没有 @ 符号
  fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !s.includes('@') && s.trim().length > 0),
  // 没有域名
  fc.string({ minLength: 1, maxLength: 20 }).map((s) => `${s.replace('@', '')}@`),
  // 空字符串
  fc.constant('')
);

/** 生成弱密码（少于 8 个字符） */
const arbWeakPassword = fc.string({ minLength: 1, maxLength: 7 });

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 1: 邮箱和密码验证', () => {
  /**
   * 属性 1.1: 有效的邮箱和密码应通过登录验证
   */
  it('属性 1.1: 有效的邮箱和密码组合应通过登录 schema 验证', () => {
    fc.assert(
      fc.property(arbValidEmail, arbValidPassword, (email, password) => {
        const result = loginSchema.safeParse({ email, password });
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 1.2: 无效的邮箱应被拒绝
   */
  it('属性 1.2: 无效的邮箱格式应导致验证失败', () => {
    fc.assert(
      fc.property(arbInvalidEmail, arbValidPassword, (email, password) => {
        const result = loginSchema.safeParse({ email, password });
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 1.3: 弱密码（少于 8 个字符）应被拒绝
   */
  it('属性 1.3: 少于 8 个字符的密码应导致验证失败', () => {
    fc.assert(
      fc.property(arbValidEmail, arbWeakPassword, (email, password) => {
        const result = loginSchema.safeParse({ email, password });
        expect(result.success).toBe(false);
        if (!result.success) {
          const pwdError = result.error.issues.find((i) => i.path.includes('password'));
          expect(pwdError).toBeDefined();
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 1.4: 空密码应被拒绝
   */
  it('属性 1.4: 空密码应导致验证失败', () => {
    fc.assert(
      fc.property(arbValidEmail, (email) => {
        const result = loginSchema.safeParse({ email, password: '' });
        expect(result.success).toBe(false);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 1.5: 注册时密码确认必须匹配
   */
  it('属性 1.5: 注册时两次密码不一致应导致验证失败', () => {
    fc.assert(
      fc.property(
        arbValidEmail,
        arbValidPassword,
        arbValidPassword,
        (email, password, confirmPassword) => {
          // 确保两个密码不同
          if (password === confirmPassword) return;

          const result = registerSchema.safeParse({ email, password, confirmPassword });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 1.6: 注册时密码确认匹配应通过验证
   */
  it('属性 1.6: 注册时两次密码一致应通过验证', () => {
    fc.assert(
      fc.property(arbValidEmail, arbValidPassword, (email, password) => {
        const result = registerSchema.safeParse({
          email,
          password,
          confirmPassword: password,
        });
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 1.7: 邮箱应被 trim 和转小写
   */
  it('属性 1.7: 邮箱应被 trim 并转为小写', () => {
    fc.assert(
      fc.property(arbValidEmail, arbValidPassword, (email, password) => {
        const paddedEmail = `  ${email.toUpperCase()}  `;
        const result = loginSchema.safeParse({ email: paddedEmail, password });

        if (result.success) {
          expect(result.data.email).toBe(email.toLowerCase().trim());
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 1.8: 超长邮箱（>255 字符）应被拒绝
   */
  it('属性 1.8: 超过 255 字符的邮箱应导致验证失败', () => {
    fc.assert(
      fc.property(arbValidPassword, (password) => {
        const longLocal = 'a'.repeat(250);
        const longEmail = `${longLocal}@test.com`;
        const result = loginSchema.safeParse({ email: longEmail, password });
        expect(result.success).toBe(false);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * 属性 1.9: 超长密码（>128 字符）应被拒绝
   */
  it('属性 1.9: 超过 128 字符的密码应导致验证失败', () => {
    fc.assert(
      fc.property(arbValidEmail, (email) => {
        const longPassword = 'a'.repeat(129);
        const result = loginSchema.safeParse({ email, password: longPassword });
        expect(result.success).toBe(false);
      }),
      { numRuns: 20 }
    );
  });
});
