/**
 * 个人资料页面
 *
 * 显示用户信息（邮箱、昵称、头像），提供编辑功能
 * 支持头像上传、数据导出、账户删除
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Download, Trash2, User as UserIcon } from 'lucide-react';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile';
import { useUploadAvatar } from '@/features/profile/hooks/useUploadAvatar';
import { exportUserData, deleteAccount } from '@/features/profile/api';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase/client';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/common/Spinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import './ProfilePage.css';

/**
 * 个人资料页面组件
 */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  // 昵称编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState('');

  // 删除确认对话框
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 导出状态
  const [isExporting, setIsExporting] = useState(false);

  // 提示消息
  const [toast, setToast] = useState('');

  // 头像上传 ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 当资料加载完成后，同步昵称到本地状态
  useEffect(() => {
    if (profile?.nickname) {
      setNickname(profile.nickname);
    }
  }, [profile?.nickname]);

  /** 显示提示消息 */
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  /** 保存昵称 */
  const handleSaveNickname = useCallback(async () => {
    if (!nickname.trim()) return;
    try {
      await updateProfile.mutateAsync({ nickname: nickname.trim() });
      setIsEditing(false);
      showToast('昵称更新成功');
    } catch {
      showToast('昵称更新失败，请重试');
    }
  }, [nickname, updateProfile, showToast]);

  /** 处理头像文件选择 */
  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // 验证文件类型和大小
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast('请选择 JPG、PNG 或 WebP 格式的图片');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('图片大小不能超过 2MB');
        return;
      }

      try {
        await uploadAvatar.mutateAsync(file);
        showToast('头像更新成功');
      } catch {
        showToast('头像上传失败，请重试');
      }

      // 重置 input 以便再次选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [uploadAvatar, showToast],
  );

  /** 导出用户数据 */
  const handleExportData = useCallback(async () => {
    if (!user?.id) return;
    setIsExporting(true);
    try {
      const data = await exportUserData(user.id);
      // 触发 JSON 文件下载
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journeyhub-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('数据导出成功');
    } catch {
      showToast('数据导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  }, [user?.id, showToast]);

  /** 删除账户 */
  const handleDeleteAccount = useCallback(async () => {
    if (!user?.id) return;
    setIsDeleting(true);
    try {
      await deleteAccount(user.id);
      // 登出 Supabase 会话
      await supabase.auth.signOut();
      clearAuth();
      navigate('/');
    } catch {
      showToast('账户删除失败，请重试');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [user?.id, clearAuth, navigate, showToast]);

  // 加载状态
  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <Spinner size="lg" centered />
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <p className="profile-error-message">加载个人资料失败</p>
          <p className="profile-error-detail">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* 页面头部 */}
      <div className="profile-page-header">
        <h1 className="profile-page-title">个人资料</h1>
      </div>

      {/* 资料卡片 */}
      <div className="profile-card">
        {/* 头像区域 */}
        <div className="profile-avatar-section">
          {profile?.avatar_url ? (
            <img
              className="profile-avatar"
              src={profile.avatar_url}
              alt="用户头像"
            />
          ) : (
            <div className="profile-avatar-placeholder">
              <UserIcon size={40} />
            </div>
          )}
          <div className="profile-avatar-upload">
            <Button
              variant="ghost"
              size="sm"
              loading={uploadAvatar.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={16} />
              &nbsp;更换头像
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
              aria-label="选择头像图片"
            />
          </div>
        </div>

        {/* 信息区域 */}
        <div className="profile-info">
          {/* 邮箱（只读） */}
          <div className="profile-field">
            <span className="profile-field-label">邮箱</span>
            <span className="profile-field-value">
              {profile?.email ?? user?.email ?? '—'}
            </span>
          </div>

          {/* 昵称（可编辑） */}
          <div className="profile-field">
            <span className="profile-field-label">昵称</span>
            {isEditing ? (
              <div className="profile-nickname-row">
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="输入昵称"
                  aria-label="昵称"
                />
                <Button
                  size="sm"
                  onClick={handleSaveNickname}
                  loading={updateProfile.isPending}
                >
                  保存
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setNickname(profile?.nickname ?? '');
                  }}
                >
                  取消
                </Button>
              </div>
            ) : (
              <div className="profile-nickname-row">
                <span className="profile-field-value">
                  {profile?.nickname || '未设置'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  编辑
                </Button>
              </div>
            )}
          </div>

          {/* 注册时间 */}
          <div className="profile-field">
            <span className="profile-field-label">注册时间</span>
            <span className="profile-field-value">
              {profile?.created_at
                ? new Intl.DateTimeFormat('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }).format(new Date(profile.created_at))
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 数据操作 */}
      <div className="profile-actions">
        <h2 className="profile-actions-title">数据管理</h2>
        <div className="profile-actions-row">
          <Button
            variant="secondary"
            onClick={handleExportData}
            loading={isExporting}
          >
            <Download size={16} />
            &nbsp;导出我的数据
          </Button>
        </div>
      </div>

      {/* 危险区域 */}
      <div className="profile-danger-zone">
        <h2 className="profile-danger-title">危险操作</h2>
        <p className="profile-danger-desc">
          删除账户后，所有数据将被永久清除且无法恢复。
        </p>
        <Button
          variant="danger"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 size={16} />
          &nbsp;删除账户
        </Button>
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="确认删除账户"
        message="确定要永久删除你的账户吗？所有城市记录、行程、愿望清单等数据都将被清除。"
        warning="此操作无法撤销。"
        confirmText="确认删除"
        variant="danger"
        loading={isDeleting}
      />

      {/* 提示消息 */}
      {toast && <div className="profile-toast">{toast}</div>}
    </div>
  );
}
