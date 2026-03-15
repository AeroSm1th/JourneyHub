/**
 * MapPage 使用示例
 *
 * 展示如何在路由中使用地图主页面
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MapPage } from './MapPage';

// 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 分钟
      cacheTime: 10 * 60 * 1000, // 10 分钟
      retry: 1,
    },
  },
});

/**
 * 示例 1: 基本使用
 */
export function BasicExample() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

/**
 * 示例 2: 带有初始地图状态的 URL
 *
 * 访问 /map?lat=39.9&lng=116.4&zoom=10 将显示北京地区
 */
export function WithInitialStateExample() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* URL 参数会自动被 useMapState hook 读取 */}
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

/**
 * 示例 3: 在应用布局中使用
 */
function AppLayout() {
  return (
    <div className="app">
      <header>
        <h1>JourneyHub</h1>
      </header>
      <main>
        <MapPage />
      </main>
    </div>
  );
}

export function WithLayoutExample() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/app" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

/**
 * 示例 4: 响应式布局测试
 *
 * 在不同屏幕尺寸下测试地图页面：
 * - 桌面端（≥1024px）：侧边栏固定显示
 * - 平板端（768-1023px）：侧边栏较窄
 * - 移动端（<768px）：侧边栏可折叠
 */
export function ResponsiveExample() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div style={{ width: '100vw', height: '100vh' }}>
          <MapPage />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
