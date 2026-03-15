/**
 * 属性测试：退出登录清除数据
 *
 * 属性 4: 退出登录清除数据
 * 验证需求: 1.7
 *
 * 对于任何已登录用户，当执行退出登录操作时，
 * 系统应该清除会话令牌和所有本地缓存的用户数据。
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { useAuthStore } from '@/store/authStore';

// ============================================================================
// 辅助生成器
// ============================================================================

/** 生成模拟的用户对象 */
const arbUser = fc.record({
  id: fc.uuid(),
  email: fc
    .tuple(
      fc.string({ minLength: 1, maxLength: 10 }).filter((s) => /^[a-z0-9]+$/.test(s)),
      fc.constantFrom('test.com', 'example.com')
    )
    .map(([local, domain]) => `${local}@${domain}`),
  app_metadata: fc.constant({}),
  user_metadata: fc.constant({}),
  aud: fc.constant('authenticated'),
  created_at: fc.constant(new Date().toISOString()),
});

/** 生成模拟的会话对象 */
const arbSession = fc.record({
  access_token: fc.string({ minLength: 20, maxLength: 100 }).filter((s) => s.trim().length > 0),
  refresh_token: fc.string({ minLength: 20, maxLength: 100 }).filter((s) => s.trim().length > 0),
  expires_in: fc.integer({ min: 3600, max: 86400 }),
  token_type: fc.constant('bearer'),
});

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 4: 退出登录清除数据', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  /**
   * 属性 4.1: clearAuth 应清除用户信息
   */
  it('属性 4.1: 退出登录后 user 应为 null', () => {
    fc.assert(
      fc.property(arbUser, arbSession, (user, session) => {
        const store = useAuthStore.getState();

        // 先设置认证状态
        store.setAuth(user as any, session as any);
        expect(useAuthStore.getState().user).not.toBeNull();

        // 执行退出
        store.clearAuth();

        // 验证：用户应被清除
        expect(useAuthStore.getState().user).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 4.2: clearAuth 应清除会话令牌
   */
  it('属性 4.2: 退出登录后 session 应为 null', () => {
    fc.assert(
      fc.property(arbUser, arbSession, (user, session) => {
        const store = useAuthStore.getState();

        store.setAuth(user as any, session as any);
        expect(useAuthStore.getState().session).not.toBeNull();

        store.clearAuth();

        // 验证：会话应被清除
        expect(useAuthStore.getState().session).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 4.3: clearAuth 是幂等的
   */
  it('属性 4.3: 多次调用 clearAuth 应产生相同结果', () => {
    fc.assert(
      fc.property(arbUser, arbSession, fc.integer({ min: 2, max: 5 }), (user, session, times) => {
        const store = useAuthStore.getState();

        store.setAuth(user as any, session as any);

        // 多次清除
        for (let i = 0; i < times; i++) {
          store.clearAuth();
        }

        expect(useAuthStore.getState().user).toBeNull();
        expect(useAuthStore.getState().session).toBeNull();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 4.4: clearAuth 后可以重新设置认证
   */
  it('属性 4.4: 退出后重新登录应正常工作', () => {
    fc.assert(
      fc.property(arbUser, arbSession, arbUser, arbSession, (user1, session1, user2, session2) => {
        const store = useAuthStore.getState();

        // 第一次登录
        store.setAuth(user1 as any, session1 as any);
        expect(useAuthStore.getState().user?.id).toBe(user1.id);

        // 退出
        store.clearAuth();
        expect(useAuthStore.getState().user).toBeNull();

        // 第二次登录
        store.setAuth(user2 as any, session2 as any);
        expect(useAuthStore.getState().user?.id).toBe(user2.id);
        expect(useAuthStore.getState().session?.access_token).toBe(session2.access_token);

        store.clearAuth();
      }),
      { numRuns: 50 }
    );
  });
});
