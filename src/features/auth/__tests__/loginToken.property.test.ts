/**
 * 属性测试：登录成功生成令牌
 *
 * 属性 2: 登录成功生成令牌
 * 验证需求: 1.4
 *
 * 对于任何有效的用户凭据，当登录成功时，
 * 系统应该生成会话令牌并将其存储在客户端。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { useAuthStore } from '@/store/authStore';

// ============================================================================
// 辅助生成器
// ============================================================================

/** 生成模拟的 Supabase User 对象 */
const arbUser = fc.record({
  id: fc.uuid(),
  email: fc
    .tuple(
      fc.string({ minLength: 1, maxLength: 10 }).filter((s) => /^[a-z0-9]+$/.test(s)),
      fc.constantFrom('test.com', 'example.com', 'mail.org')
    )
    .map(([local, domain]) => `${local}@${domain}`),
  app_metadata: fc.constant({}),
  user_metadata: fc.constant({}),
  aud: fc.constant('authenticated'),
  created_at: fc.constant(new Date().toISOString()),
});

/** 生成模拟的 Session 对象 */
const arbSession = fc.record({
  access_token: fc.string({ minLength: 20, maxLength: 100 }).filter((s) => s.trim().length > 0),
  refresh_token: fc.string({ minLength: 20, maxLength: 100 }).filter((s) => s.trim().length > 0),
  expires_in: fc.integer({ min: 3600, max: 86400 }),
  token_type: fc.constant('bearer'),
});

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 2: 登录成功生成令牌', () => {
  beforeEach(() => {
    // 重置 store 状态
    useAuthStore.getState().clearAuth();
  });

  /**
   * 属性 2.1: setAuth 应该正确存储用户和会话信息
   */
  it('属性 2.1: 对于任何有效的用户和会话，setAuth 应正确存储', () => {
    fc.assert(
      fc.property(arbUser, arbSession, (user, session) => {
        const store = useAuthStore.getState();

        // 设置认证状态
        store.setAuth(user as any, session as any);

        // 验证：用户和会话应被存储
        const state = useAuthStore.getState();
        expect(state.user).not.toBeNull();
        expect(state.session).not.toBeNull();
        expect(state.user?.id).toBe(user.id);
        expect(state.user?.email).toBe(user.email);
        expect(state.session?.access_token).toBe(session.access_token);
        expect(state.session?.refresh_token).toBe(session.refresh_token);

        // 清理
        store.clearAuth();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 2.2: 会话令牌应该是非空字符串
   */
  it('属性 2.2: 存储的会话令牌应该是非空字符串', () => {
    fc.assert(
      fc.property(arbUser, arbSession, (user, session) => {
        const store = useAuthStore.getState();
        store.setAuth(user as any, session as any);

        const state = useAuthStore.getState();
        expect(typeof state.session?.access_token).toBe('string');
        expect(state.session!.access_token.length).toBeGreaterThan(0);
        expect(typeof state.session?.refresh_token).toBe('string');
        expect(state.session!.refresh_token.length).toBeGreaterThan(0);

        store.clearAuth();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 2.3: 多次登录应该更新令牌
   */
  it('属性 2.3: 多次调用 setAuth 应该更新为最新的令牌', () => {
    fc.assert(
      fc.property(arbUser, arbSession, arbSession, (user, session1, session2) => {
        const store = useAuthStore.getState();

        // 第一次设置
        store.setAuth(user as any, session1 as any);
        expect(useAuthStore.getState().session?.access_token).toBe(session1.access_token);

        // 第二次设置（更新）
        store.setAuth(user as any, session2 as any);
        expect(useAuthStore.getState().session?.access_token).toBe(session2.access_token);

        store.clearAuth();
      }),
      { numRuns: 50 }
    );
  });
});
