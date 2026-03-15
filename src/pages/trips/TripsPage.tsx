/**
 * 行程列表页面
 *
 * 显示所有行程，支持按状态筛选（planning/ongoing/completed）
 * TripList 组件已内置筛选功能
 *
 * 验证需求: 5.8
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TripList } from '@/components/trip/TripList';
import { Button } from '@/components/common/Button';
import type { Trip } from '@/types/database';
import './TripsPage.css';

/**
 * 行程列表页面组件
 */
export default function TripsPage() {
  const navigate = useNavigate();

  /** 点击行程，导航到详情页 */
  const handleTripClick = useCallback(
    (trip: Trip) => {
      navigate(`/app/trips/${trip.id}`);
    },
    [navigate]
  );

  /** 点击创建行程按钮 */
  const handleCreateTrip = useCallback(() => {
    navigate('/app/trips/new');
  }, [navigate]);

  return (
    <div className="trips-page">
      {/* 页面头部 */}
      <div className="trips-page-header">
        <h1 className="trips-page-title">我的行程</h1>
        <Button variant="primary" onClick={handleCreateTrip}>
          创建行程
        </Button>
      </div>

      {/* 行程列表（内置筛选功能） */}
      <TripList onTripClick={handleTripClick} />
    </div>
  );
}
