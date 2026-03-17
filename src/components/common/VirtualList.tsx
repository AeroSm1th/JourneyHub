/**
 * 通用虚拟滚动列表组件
 *
 * 使用 @tanstack/react-virtual 实现，只渲染可见区域的项目
 * 适用于城市列表、行程列表等长列表场景
 *
 * 验证需求: 11.5
 */

import { useRef, type ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface VirtualListProps<T> {
  /** 数据列表 */
  items: T[];
  /** 每项的预估高度（px） */
  estimateSize: number;
  /** 渲染每一项的函数 */
  renderItem: (item: T, index: number) => ReactNode;
  /** 容器高度，默认 100% */
  height?: string | number;
  /** 额外预渲染的项数（上下各多渲染几项） */
  overscan?: number;
  /** 容器的 className */
  className?: string;
  /** 获取每项的唯一 key */
  getItemKey?: (index: number) => string | number;
}

/**
 * 虚拟滚动列表
 *
 * @example
 * ```tsx
 * <VirtualList
 *   items={cities}
 *   estimateSize={100}
 *   renderItem={(city) => <CityListItem city={city} />}
 *   getItemKey={(i) => cities[i].id}
 * />
 * ```
 */
export function VirtualList<T>({
  items,
  estimateSize,
  renderItem,
  height = '100%',
  overscan = 5,
  className,
  getItemKey,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    getItemKey,
  });

  return (
    <div
      ref={parentRef}
      className={className}
      style={{
        height,
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={String(virtualItem.key)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
            data-index={virtualItem.index}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
