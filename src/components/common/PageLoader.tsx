/**
 * 页面级加载状态组件
 *
 * 用于路由懒加载时的 Suspense fallback
 * 验证需求: 11.1 - 路由级代码分割加载状态
 */

import { Spinner } from './Spinner';
import './PageLoader.css';

/**
 * 全屏页面加载组件，用于路由切换时的过渡状态
 */
export function PageLoader() {
  return (
    <div className="page-loader">
      <Spinner size="lg" />
    </div>
  );
}
