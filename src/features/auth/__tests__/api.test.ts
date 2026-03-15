/**
 * 认证 API 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUp, signIn, signOut, getCurrentUser } from '../api';
import { supabase } from '@/services/supabase/client';

// Mock Supabase 客户端
vi.mock('@/services/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('认证 API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('应该成功注册用户', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: {
          user: mockUser,
          session: null,
        },
        error: null,
      } as any);

      const result = await signUp('test@example.com', 'password123');

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        created_at: expect.any(String),
      });
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('应该在注册失败时抛出错误', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: '邮箱已存在' } as any,
      } as any);

      await expect(signUp('test@example.com', 'password123')).rejects.toThrow('邮箱已存在');
    });
  });

  describe('signIn', () => {
    it('应该成功登录用户', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockUserData = {
        id: 'user-123',
        email: 'test@example.com',
        nickname: 'Test User',
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: {
          user: mockUser,
          session: {} as any,
        },
        error: null,
      } as any);

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockUserData,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);

      const result = await signIn('test@example.com', 'password123');

      expect(result).toEqual(mockUserData);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('应该在登录失败时抛出错误', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: '邮箱或密码错误' } as any,
      } as any);

      await expect(signIn('test@example.com', 'wrong-password')).rejects.toThrow('邮箱或密码错误');
    });
  });

  describe('signOut', () => {
    it('应该成功退出登录', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      await expect(signOut()).resolves.toBeUndefined();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('应该在退出失败时抛出错误', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: { message: '退出失败' } as any,
      });

      await expect(signOut()).rejects.toThrow('退出失败');
    });
  });

  describe('getCurrentUser', () => {
    it('应该返回当前登录用户', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      };

      const mockUserData = {
        id: 'user-123',
        email: 'test@example.com',
        nickname: 'Test User',
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      } as any);

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockUserData,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);

      const result = await getCurrentUser();

      expect(result).toEqual(mockUserData);
    });

    it('应该在未登录时返回 null', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });

    it('应该在用户记录不存在时返回 null', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      } as any);

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' } as any,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });
  });
});
