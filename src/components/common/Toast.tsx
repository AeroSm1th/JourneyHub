/**
 * Toast 全局通知组件
 *
 * 显示用户友好的错误提示，支持手动重试按钮
 * 验证需求: 9.6 - 显示用户友好的错误提示
 */

import { useEffect, useCallback, useState } from 'react';
import { useToastStore, type ToastItem } from '@/store/toastStore';
import './Toast.css';

/** 单条 Toast 渲染 */
function ToastEntry({ item, onClose }: { item: ToastItem; onClose: (id: string) => void }) {
  const [leaving, setLeaving] = useState(false);

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onClose(item.id), 200);
  }, [item.id, onClose]);

  // 自动关闭
  useEffect(() => {
    if (item.duration <= 0) return;
    const timer = setTimeout(dismiss, item.duration);
    return () => clearTimeout(timer);
  }, [item.duration, dismiss]);

  const handleRetry = () => {
    dismiss();
    item.onRetry?.();
  };

  return (
    <div
      className={`toast-item toast-${item.type}${leaving ? ' toast-leaving' : ''}`}
      role="alert"
      aria-live="assertive"
    >
      {/* 图标 */}
      <svg className="toast-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        {item.type === 'error' && (
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
            clipRule="evenodd"
          />
        )}
        {item.type === 'success' && (
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clipRule="evenodd"
          />
        )}
        {item.type === 'info' && (
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clipRule="evenodd"
          />
        )}
        {item.type === 'warning' && (
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        )}
      </svg>

      {/* 内容 */}
      <div className="toast-body">
        <p className="toast-message">{item.message}</p>
        {item.onRetry && (
          <div className="toast-actions">
            <button className="toast-retry-btn" onClick={handleRetry} type="button">
              重试
            </button>
          </div>
        )}
      </div>

      {/* 关闭按钮 */}
      <button
        className="toast-close-btn"
        onClick={dismiss}
        type="button"
        aria-label="关闭通知"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Toast 容器组件
 *
 * 放置在应用根组件中，渲染所有活跃的 toast 通知
 */
export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-label="通知">
      {toasts.map((t) => (
        <ToastEntry key={t.id} item={t} onClose={removeToast} />
      ))}
    </div>
  );
}
