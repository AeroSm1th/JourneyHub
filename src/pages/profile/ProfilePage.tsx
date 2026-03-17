/**
 * 个人资料页面
 *
 * 显示用户信息（邮箱、昵称、头像），提供编辑功能
 * 支持头像上传、数据导出、账户删除
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Camera, Download, Trash2, User as UserIcon, Pencil } from 'lucide-react';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile';
import { useUploadAvatar } from '@/features/profile/hooks/useUploadAvatar';
import { exportUserData, clearAllData } from '@/features/profile/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/common/Spinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import './ProfilePage.css';

/**
 * 个人资料页面组件
 */
export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  // 昵称编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState('');

  // 待上传的头像文件（本地暂存，保存时才上传）
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(null);

  // 保存中状态
  const [isSaving, setIsSaving] = useState(false);

  // 清空数据确认对话框
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

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

  /** 统一保存（昵称 + 头像） */
  const handleSave = useCallback(async () => {
    if (!nickname.trim()) return;
    setIsSaving(true);
    try {
      // 如果有待上传的头像，先上传
      if (pendingAvatarFile) {
        await uploadAvatar.mutateAsync(pendingAvatarFile);
      }
      // 保存昵称
      await updateProfile.mutateAsync({ nickname: nickname.trim() });
      // 清理暂存状态
      setPendingAvatarFile(null);
      if (pendingAvatarPreview) {
        URL.revokeObjectURL(pendingAvatarPreview);
        setPendingAvatarPreview(null);
      }
      setIsEditing(false);
      showToast('资料更新成功');
    } catch {
      showToast('资料更新失败，请重试');
    } finally {
      setIsSaving(false);
    }
  }, [nickname, pendingAvatarFile, pendingAvatarPreview, updateProfile, uploadAvatar, showToast]);

  /** 取消编辑 */
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setNickname(profile?.nickname ?? '');
    setPendingAvatarFile(null);
    if (pendingAvatarPreview) {
      URL.revokeObjectURL(pendingAvatarPreview);
      setPendingAvatarPreview(null);
    }
  }, [profile?.nickname, pendingAvatarPreview]);

  /** 处理头像文件选择（本地暂存，不立即上传） */
  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // 释放旧的预览 URL
      if (pendingAvatarPreview) {
        URL.revokeObjectURL(pendingAvatarPreview);
      }

      // 本地暂存文件和预览
      setPendingAvatarFile(file);
      setPendingAvatarPreview(URL.createObjectURL(file));

      // 重置 input 以便再次选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [pendingAvatarPreview, showToast]
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

  /** 清空所有数据 */
  const handleClearData = useCallback(async () => {
    if (!user?.id) return;
    setIsClearing(true);
    try {
      await clearAllData(user.id);
      queryClient.clear();
      setShowClearConfirm(false);
      showToast('所有数据已清空');
    } catch {
      showToast('清空数据失败，请重试');
    } finally {
      setIsClearing(false);
    }
  }, [user?.id, queryClient, showToast]);

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
        {/* 右上角编辑按钮 */}
        {!isEditing ? (
          <button
            className="profile-edit-btn"
            onClick={() => setIsEditing(true)}
            aria-label="编辑资料"
          >
            <Pencil size={16} />
            编辑
          </button>
        ) : (
          <div className="profile-edit-actions">
            <Button size="sm" onClick={handleSave} loading={isSaving}>
              保存
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
              取消
            </Button>
          </div>
        )}

        {/* 头像区域 */}
        <div className="profile-avatar-section">
          {/* 编辑模式下优先显示待上传的预览图 */}
          {pendingAvatarPreview ? (
            <img className="profile-avatar" src={pendingAvatarPreview} alt="待上传头像预览" />
          ) : profile?.avatar_url ? (
            <img className="profile-avatar" src={profile.avatar_url} alt="用户头像" />
          ) : (
            <div className="profile-avatar-placeholder">
              <UserIcon size={40} />
            </div>
          )}
          {isEditing && (
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
          )}
        </div>

        {/* 信息区域 */}
        <div className="profile-info">
          {/* 邮箱（只读） */}
          <div className="profile-field">
            <span className="profile-field-label">邮箱</span>
            <span className="profile-field-value">{profile?.email ?? user?.email ?? '—'}</span>
          </div>

          {/* 昵称 */}
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
              </div>
            ) : (
              <span className="profile-field-value">{profile?.nickname || '未设置'}</span>
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
          <Button variant="secondary" onClick={handleExportData} loading={isExporting}>
            <Download size={16} />
            &nbsp;导出我的数据
          </Button>
        </div>
      </div>

      {/* 危险区域 */}
      <div className="profile-danger-zone">
        <h2 className="profile-danger-title">危险操作</h2>
        <p className="profile-danger-desc">
          清空数据后，所有城市记录、行程、愿望清单等数据将被永久清除且无法恢复。账户本身会保留。
        </p>
        <Button variant="danger" onClick={() => setShowClearConfirm(true)}>
          <Trash2 size={16} />
          &nbsp;清空所有数据
        </Button>
      </div>

      {/* 清空数据确认对话框 */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearData}
        title="确认清空数据"
        message="确定要清空所有数据吗？所有城市记录、行程、愿望清单、头像等数据都将被清除。"
        warning="此操作无法撤销，但账户会保留。"
        confirmText="确认清空"
        variant="danger"
        loading={isClearing}
      />

      {/* 提示消息 */}
      {toast && <div className="profile-toast">{toast}</div>}
    </div>
  );
}
