/**
 * authStore 单元测试
 *
 * 测试认证状态管理的核心功能：
 * - 初始状态验证
 * - setAuth 方法
 * - clearAuth 方法
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';
import type { User, Session } from '@supabase/supabase-js';

describe('authStore', () => {
  // 在每个测试前重置 store 状态
  beforeEach(() => {
    useAuthStore.setState({ user: null, session: null });
  });

  describe('初始状态', () => {
    it('应该初始化为 null 状态', () => {
      const { user, session } = useAuthStore.getState();

      expect(user).toBeNull();
      expect(session).toBeNull();
    });
  });

  describe('setAuth', () => {
    it('应该正确设置用户和会话信息', () => {
      const mockUser: Partial<User> = {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };

      const mockSession: Partial<Session> = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser as User,
      };

      const { setAuth } = useAuthStore.getState();
      setAuth(mockUser as User, mockSession as Session);

      const { user, session } = useAuthStore.getState();

      expect(user).toEqual(mockUser);
      expect(session).toEqual(mockSession);
    });

    it('应该允许单独设置用户信息', () => {
      const mockUser: Partial<User> = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      const { setAuth } = useAuthStore.getState();
      setAuth(mockUser as User, null);

      const { user, session } = useAuthStore.getState();

      expect(user).toEqual(mockUser);
      expect(session).toBeNull();
    });

    it('应该允许更新已存在的认证状态', () => {
      const initialUser: Partial<User> = {
        id: 'user-1',
        email: 'user1@example.com',
      };

      const updatedUser: Partial<User> = {
        id: 'user-2',
        email: 'user2@example.com',
      };

      const { setAuth } = useAuthStore.getState();

      // 设置初始状态
      setAuth(initialUser as User, null);
      expect(useAuthStore.getState().user).toEqual(initialUser);

      // 更新状态
      setAuth(updatedUser as User, null);
      expect(useAuthStore.getState().user).toEqual(updatedUser);
    });
  });

  describe('clearAuth', () => {
    it('应该清除所有认证信息', () => {
      const mockUser: Partial<User> = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      const mockSession: Partial<Session> = {
        access_token: 'mock-access-token',
        user: mockUser as User,
      };

      const { setAuth, clearAuth } = useAuthStore.getState();

      // 先设置认证状态
      setAuth(mockUser as User, mockSession as Session);
      expect(useAuthStore.getState().user).not.toBeNull();
      expect(useAuthStore.getState().session).not.toBeNull();

      // 清除认证状态
      clearAuth();

      const { user, session } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(session).toBeNull();
    });

    it('应该在已清除的状态下保持幂等性', () => {
      const { clearAuth } = useAuthStore.getState();

      // 多次调用 clearAuth
      clearAuth();
      clearAuth();
      clearAuth();

      const { user, session } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(session).toBeNull();
    });
  });

  describe('状态隔离', () => {
    it('应该在多次操作中保持状态一致性', () => {
      const user1: Partial<User> = {
        id: 'user-1',
        email: 'user1@example.com',
      };

      const user2: Partial<User> = {
        id: 'user-2',
        email: 'user2@example.com',
      };

      const { setAuth, clearAuth } = useAuthStore.getState();

      // 操作序列
      setAuth(user1 as User, null);
      expect(useAuthStore.getState().user?.id).toBe('user-1');

      setAuth(user2 as User, null);
      expect(useAuthStore.getState().user?.id).toBe('user-2');

      clearAuth();
      expect(useAuthStore.getState().user).toBeNull();

      setAuth(user1 as User, null);
      expect(useAuthStore.getState().user?.id).toBe('user-1');
    });
  });
});
