/**
 * 通用模态框组件
 *
 * 提供一致的模态框样式和交互
 * 验证需求: 10.4 - 确保触摸屏可操作
 */

import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

interface ModalProps {
  /**
   * 是否显示模态框
   */
  isOpen: boolean;

  /**
   * 关闭模态框的回调
   */
  onClose: () => void;

  /**
   * 模态框标题
   */
  title?: string;

  /**
   * 模态框内容
   */
  children: ReactNode;

  /**
   * 模态框大小
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * 通用模态框组件
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="确认删除"
 * >
 *   <p>确定要删除这条记录吗？</p>
 * </Modal>
 * ```
 */
export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // 按 ESC 键关闭模态框
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content modal-${size}`} onClick={(e) => e.stopPropagation()}>
        {/* 模态框头部 */}
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button className="modal-close" onClick={onClose} aria-label="关闭">
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
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}

        {/* 模态框主体 */}
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
