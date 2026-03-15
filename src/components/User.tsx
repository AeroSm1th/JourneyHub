/**
 * 用户信息组件
 *
 * 显示当前登录用户信息和退出登录按钮
 * 验证需求: 1.6, 1.7 - 退出登录功能
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { signOut } from '@/features/auth/api';
import styles from './User.module.css';

/**
 * 用户信息组件
 *
 * 功能：
 * - 显示用户邮箱
 * - 提供退出登录按钮
 * - 退出后清除会话令牌和本地缓存
 * - 重定向到登录页面
 *
 * @example
 * ```tsx
 * <User />
 * ```
 */
function User() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 调用退出登录 API
      await signOut();

      // 重定向到登录页面
      navigate('/auth/login', { replace: true });
    } catch (error) {
      console.error('退出登录失败:', error);
      // 即使出错也尝试重定向
      navigate('/auth/login', { replace: true });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={styles.user}>
      <span>欢迎, {user.email}</span>
      <button onClick={handleLogout}>退出登录</button>
    </div>
  );
}

export default User;
