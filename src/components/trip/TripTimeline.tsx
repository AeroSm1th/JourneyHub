/**
 * 行程时间线组件
 *
 * 功能：
 * - 可视化展示行程的每一天
 * - 显示每天的活动和待办事项
 * - 垂直时间线连接所有天数
 * - 今日标记（行程进行中时）
 * - 颜色编码：过去（灰色）、今天（蓝/绿）、未来（浅色）
 * - 支持直接传入数据或通过 hooks 获取
 *
 * 验证需求: 5.4
 */

import { useMemo } from 'react';
import { useTripDays } from '@/features/trips/hooks/useTripDays';
import { useTripTasks } from '@/features/trips/hooks/useTripTasks';
import { Spinner } from '@/components/common/Spinner';
import type { TripDay, TripTask } from '@/types/database';
import './TripTimeline.css';

interface TripTimelineProps {
  /** 行程 ID */
  tripId: string;
  /** 行程开始日期（YYYY-MM-DD） */
  startDate: string;
  /** 行程结束日期（YYYY-MM-DD） */
  endDate: string;
  /** 可选：直接传入日程数据（避免重复请求） */
  trip_days?: TripDay[];
  /** 可选：直接传入待办事项数据（避免重复请求） */
  trip_tasks?: TripTask[];
}

/** 时间线节点数据 */
interface TimelineNode {
  dayIndex: number;
  date: string;
  title?: string;
  notes?: string;
  tasks: TripTask[];
  status: 'past' | 'today' | 'future';
}

/** 格式化日期为中文显示 */
const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(dateString));
};

/** 获取今天的日期字符串（YYYY-MM-DD） */
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * 根据日期范围和已有数据生成时间线节点
 */
function buildTimelineNodes(
  startDate: string,
  endDate: string,
  days: TripDay[],
  tasks: TripTask[]
): TimelineNode[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = getTodayString();
  const nodes: TimelineNode[] = [];

  // 按 day_index 建立日程映射
  const dayMap = new Map<number, TripDay>();
  for (const day of days) {
    dayMap.set(day.day_index, day);
  }

  // 按 day_id 分组待办事项
  const tasksByDayId = new Map<string, TripTask[]>();
  for (const task of tasks) {
    if (task.day_id) {
      const list = tasksByDayId.get(task.day_id) ?? [];
      list.push(task);
      tasksByDayId.set(task.day_id, list);
    }
  }

  let dayIndex = 1;
  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const existingDay = dayMap.get(dayIndex);

    // 确定日期状态
    let status: 'past' | 'today' | 'future';
    if (dateStr < today) {
      status = 'past';
    } else if (dateStr === today) {
      status = 'today';
    } else {
      status = 'future';
    }

    // 获取该天关联的待办事项
    const dayTasks = existingDay ? (tasksByDayId.get(existingDay.id) ?? []) : [];

    nodes.push({
      dayIndex,
      date: dateStr,
      title: existingDay?.title ?? undefined,
      notes: existingDay?.notes ?? undefined,
      tasks: dayTasks,
      status,
    });

    current.setDate(current.getDate() + 1);
    dayIndex++;
  }

  return nodes;
}

/**
 * 行程时间线组件
 */
export function TripTimeline({
  tripId,
  startDate,
  endDate,
  trip_days,
  trip_tasks,
}: TripTimelineProps) {
  // 仅在未直接传入数据时通过 hooks 获取
  const daysQuery = useTripDays(trip_days ? '' : tripId);
  const tasksQuery = useTripTasks(trip_tasks ? '' : tripId);

  const days = trip_days ?? (daysQuery.data as TripDay[] | undefined) ?? [];
  const tasks = trip_tasks ?? (tasksQuery.data as TripTask[] | undefined) ?? [];

  const isLoading = (!trip_days && daysQuery.isLoading) || (!trip_tasks && tasksQuery.isLoading);
  const error = (!trip_days && daysQuery.error) || (!trip_tasks && tasksQuery.error);

  // 构建时间线节点
  const nodes = useMemo(
    () => buildTimelineNodes(startDate, endDate, days, tasks),
    [startDate, endDate, days, tasks]
  );

  // 加载状态
  if (isLoading) {
    return (
      <div className="trip-timeline">
        <Spinner size="md" centered />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="trip-timeline">
        <div className="trip-timeline__error">
          <p>加载时间线失败: {(error as Error).message}</p>
        </div>
      </div>
    );
  }

  // 无数据
  if (nodes.length === 0) {
    return (
      <div className="trip-timeline">
        <p className="trip-timeline__empty">日期范围无效，无法生成时间线</p>
      </div>
    );
  }

  return (
    <div className="trip-timeline">
      <div className="trip-timeline__header">
        <h3 className="trip-timeline__title">🗓️ 行程时间线</h3>
        <span className="trip-timeline__count">共 {nodes.length} 天</span>
      </div>

      <div className="trip-timeline__track">
        {nodes.map((node) => (
          <div
            key={node.dayIndex}
            className={`trip-timeline__node trip-timeline__node--${node.status}`}
          >
            {/* 时间线圆点 */}
            <div className="trip-timeline__dot">
              {node.status === 'today' && <span className="trip-timeline__today-badge">今天</span>}
            </div>

            {/* 节点内容 */}
            <div className="trip-timeline__content">
              <div className="trip-timeline__day-header">
                <span className="trip-timeline__day-index">第 {node.dayIndex} 天</span>
                <time className="trip-timeline__date">{formatDate(node.date)}</time>
              </div>

              {node.title && <p className="trip-timeline__day-title">{node.title}</p>}

              {node.notes && <p className="trip-timeline__day-notes">{node.notes}</p>}

              {/* 该天的待办事项 */}
              {node.tasks.length > 0 && (
                <ul className="trip-timeline__tasks">
                  {node.tasks.map((task) => (
                    <li
                      key={task.id}
                      className={`trip-timeline__task${task.is_done ? ' trip-timeline__task--done' : ''}`}
                    >
                      <span className="trip-timeline__task-icon">{task.is_done ? '☑' : '☐'}</span>
                      <span className="trip-timeline__task-content">{task.content}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
