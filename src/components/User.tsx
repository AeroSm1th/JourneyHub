/**
 * 用户信息组件
 *
 * 可折叠的用户菜单，点击头像/图标展开，显示邮箱和退出按钮
 * 验证需求: 1.6, 1.7 - 退出登录功能
 */

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/features/auth/api';
import './User.css';

function User() {
  const { user, clearAuth } = useAuthStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  // 取邮箱首字母作为头像
  const initial = (user.email ?? 'U')[0].toUpperCase();

  const handleLogout = async () => {
    try {
      clearAuth();
      await signOut();
    } catch (error) {
      console.error('退出登录失败:', error);
    }
    // signOut 后 onAuthStateChange 会触发 clearAuth
    // ProtectedRoute 检测到 user=null 会自动重定向到登录页
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-avatar-btn"
        onClick={() => setOpen(!open)}
        aria-label="用户菜单"
        aria-expanded={open}
      >
        <span className="user-avatar">{initial}</span>
      </button>

      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-info">
            <span className="user-dropdown-avatar">{initial}</span>
            <span className="user-dropdown-email">{user.email}</span>
          </div>
          <hr className="user-dropdown-divider" />
          <button className="user-dropdown-logout" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}

export default User;
