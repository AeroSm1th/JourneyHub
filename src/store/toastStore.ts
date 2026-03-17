/**
 * Toast 通知状态管理
 *
 * 使用 Zustand 管理全局 Toast 通知队列
 * 验证需求: 9.6 - 显示用户友好的错误提示
 */

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  /** 可选的重试回调 */
  onRetry?: () => void;
  /** 自动关闭延迟（毫秒），0 表示不自动关闭 */
  duration: number;
}

interface ToastState {
  toasts: ToastItem[];
  /** 添加一条 toast */
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  /** 移除指定 toast */
  removeToast: (id: string) => void;
  /** 清空所有 toast */
  clearAll: () => void;
}

let counter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++counter}-${Date.now()}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => set({ toasts: [] }),
}));

/**
 * 便捷函数：显示 toast 通知
 */
export const toast = {
  success: (message: string, duration = 3000) =>
    useToastStore.getState().addToast({ type: 'success', message, duration }),

  error: (message: string, options?: { onRetry?: () => void; duration?: number }) =>
    useToastStore.getState().addToast({
      type: 'error',
      message,
      onRetry: options?.onRetry,
      duration: options?.duration ?? 6000,
    }),

  info: (message: string, duration = 3000) =>
    useToastStore.getState().addToast({ type: 'info', message, duration }),

  warning: (message: string, duration = 4000) =>
    useToastStore.getState().addToast({ type: 'warning', message, duration }),
};
