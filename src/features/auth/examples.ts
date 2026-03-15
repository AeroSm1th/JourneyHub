/**
 * 认证 API 使用示例
 *
 * 本文件展示了如何使用认证 API 函数
 * 注意：这些是示例代码，不应在生产环境中直接使用
 */

import { signUp, signIn, signOut, getCurrentUser } from './api';

// ============================================================================
// 示例 1: 用户注册流程
// ============================================================================

export async function exampleSignUp() {
  try {
    const email = 'newuser@example.com';
    const password = 'securePassword123';

    console.log('开始注册...');
    const user = await signUp(email, password);

    console.log('注册成功！');
    console.log('用户 ID:', user.id);
    console.log('用户邮箱:', user.email);
    console.log('创建时间:', user.created_at);

    return user;
  } catch (error) {
    if (error instanceof Error) {
      console.error('注册失败:', error.message);
    }
    throw error;
  }
}

// ============================================================================
// 示例 2: 用户登录流程
// ============================================================================

export async function exampleSignIn() {
  try {
    const email = 'user@example.com';
    const password = 'password123';

    console.log('开始登录...');
    const user = await signIn(email, password);

    console.log('登录成功！');
    console.log('欢迎回来,', user.nickname || user.email);

    return user;
  } catch (error) {
    if (error instanceof Error) {
      console.error('登录失败:', error.message);

      // 根据错误信息提供用户友好的提示
      if (error.message.includes('Invalid login credentials')) {
        console.log('提示：请检查邮箱和密码是否正确');
      }
    }
    throw error;
  }
}

// ============================================================================
// 示例 3: 退出登录流程
// ============================================================================

export async function exampleSignOut() {
  try {
    console.log('正在退出登录...');
    await signOut();

    console.log('已成功退出登录');
    console.log('会话已清除，本地缓存已清理');
  } catch (error) {
    if (error instanceof Error) {
      console.error('退出登录失败:', error.message);
    }
    throw error;
  }
}

// ============================================================================
// 示例 4: 获取当前用户信息
// ============================================================================

export async function exampleGetCurrentUser() {
  try {
    console.log('检查登录状态...');
    const user = await getCurrentUser();

    if (user) {
      console.log('用户已登录');
      console.log('用户信息:', {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
      });
      return user;
    } else {
      console.log('用户未登录');
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('获取用户信息失败:', error.message);
    }
    throw error;
  }
}

// ============================================================================
// 示例 5: 完整的认证流程（注册 -> 登录 -> 获取信息 -> 退出）
// ============================================================================

export async function exampleCompleteAuthFlow() {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testPassword123';

  try {
    // 步骤 1: 注册新用户
    console.log('\n=== 步骤 1: 注册新用户 ===');
    const newUser = await signUp(testEmail, testPassword);
    console.log('✓ 注册成功:', newUser.email);

    // 步骤 2: 登录
    console.log('\n=== 步骤 2: 登录 ===');
    const loggedInUser = await signIn(testEmail, testPassword);
    console.log('✓ 登录成功:', loggedInUser.email);

    // 步骤 3: 获取当前用户信息
    console.log('\n=== 步骤 3: 获取当前用户信息 ===');
    const currentUser = await getCurrentUser();
    console.log('✓ 当前用户:', currentUser?.email);

    // 步骤 4: 退出登录
    console.log('\n=== 步骤 4: 退出登录 ===');
    await signOut();
    console.log('✓ 退出成功');

    // 步骤 5: 验证已退出
    console.log('\n=== 步骤 5: 验证已退出 ===');
    const userAfterSignOut = await getCurrentUser();
    console.log('✓ 当前用户:', userAfterSignOut === null ? '无（已退出）' : userAfterSignOut.email);

    console.log('\n✓ 完整认证流程测试成功！');
  } catch (error) {
    if (error instanceof Error) {
      console.error('\n✗ 认证流程失败:', error.message);
    }
    throw error;
  }
}

// ============================================================================
// 示例 6: 错误处理最佳实践
// ============================================================================

export async function exampleErrorHandling(email: string, password: string) {
  try {
    const user = await signIn(email, password);
    return { success: true, user };
  } catch (error) {
    // 类型安全的错误处理
    if (error instanceof Error) {
      // 根据错误信息返回用户友好的提示
      let userMessage = '登录失败，请稍后重试';

      if (error.message.includes('Invalid login credentials')) {
        userMessage = '邮箱或密码错误，请检查后重试';
      } else if (error.message.includes('Email not confirmed')) {
        userMessage = '请先验证您的邮箱';
      } else if (error.message.includes('Too many requests')) {
        userMessage = '登录尝试次数过多，请稍后再试';
      }

      return {
        success: false,
        error: {
          message: userMessage,
          originalError: error.message,
        },
      };
    }

    return {
      success: false,
      error: {
        message: '未知错误',
      },
    };
  }
}

// ============================================================================
// 示例 7: 在 React 组件中使用（伪代码）
// ============================================================================

/**
 * 在 React 组件中使用认证 API 的示例
 *
 * ```tsx
 * import { useState } from 'react';
 * import { signIn } from '@/features/auth/api';
 *
 * function LoginForm() {
 *   const [email, setEmail] = useState('');
 *   const [password, setPassword] = useState('');
 *   const [loading, setLoading] = useState(false);
 *   const [error, setError] = useState('');
 *
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     setLoading(true);
 *     setError('');
 *
 *     try {
 *       const user = await signIn(email, password);
 *       console.log('登录成功:', user);
 *       // 跳转到主页或更新全局状态
 *     } catch (err) {
 *       if (err instanceof Error) {
 *         setError(err.message);
 *       }
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input
 *         type="email"
 *         value={email}
 *         onChange={(e) => setEmail(e.target.value)}
 *         placeholder="邮箱"
 *       />
 *       <input
 *         type="password"
 *         value={password}
 *         onChange={(e) => setPassword(e.target.value)}
 *         placeholder="密码"
 *       />
 *       <button type="submit" disabled={loading}>
 *         {loading ? '登录中...' : '登录'}
 *       </button>
 *       {error && <p className="error">{error}</p>}
 *     </form>
 *   );
 * }
 * ```
 */
