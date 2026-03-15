/**
 * 通用确认对话框组件
 *
 * 在执行危险操作（如删除）前要求用户确认
 * 验证需求: 3.10 - 删除前要求用户确认
 */

import { ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  /**
   * 是否显示对话框
   */
  isOpen: boolean;

  /**
   * 关闭对话框的回调
   */
  onClose: () => void;

  /**
   * 确认操作的回调
   */
  onConfirm: () => void;

  /**
   * 对话框标题
   */
  title?: string;

  /**
   * 确认消息，支持 ReactNode 以便高亮关键信息
   */
  message: ReactNode;

  /**
   * 警告提示文本
   */
  warning?: string;

  /**
   * 确认按钮文本
   */
  confirmText?: string;

  /**
   * 取消按钮文本
   */
  cancelText?: string;

  /**
   * 对话框类型，影响图标和确认按钮样式
   */
  variant?: 'danger' | 'warning';

  /**
   * 确认操作是否正在进行中
   */
  loading?: boolean;
}

/**
 * 危险操作图标（感叹号三角形）
 */
function DangerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/**
 * 通用确认对话框组件
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   isOpen={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={handleDelete}
 *   title="确认删除"
 *   message={<>确定要删除 <strong>北京</strong> 吗？</>}
 *   warning="此操作无法撤销。"
 *   confirmText="确认删除"
 *   variant="danger"
 *   loading={isDeleting}
 * />
 * ```
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '确认操作',
  message,
  warning,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="confirm-dialog">
        {/* 警告图标 */}
        <div className={`confirm-dialog-icon confirm-dialog-icon--${variant}`}>
          <DangerIcon />
        </div>

        {/* 确认消息 */}
        <p className="confirm-dialog-message">{message}</p>

        {/* 警告提示 */}
        {warning && <p className="confirm-dialog-warning">{warning}</p>}

        {/* 操作按钮 */}
        <div className="confirm-dialog-actions">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
