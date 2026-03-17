/**
 * 城市详情页面
 *
 * 显示完整的城市信息和关联的行程
 * 验证需求: 3.7
 */

import { useParams, useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useCity } from '@/features/cities/hooks/useCity';
import { CityDetailPanel } from '@/components/city/CityDetailPanel';
import { Spinner } from '@/components/common/Spinner';
import { BackButton } from '@/components/common/BackButton';
import './CityDetailPage.css';

/**
 * 城市详情页面组件
 *
 * 通过路由参数 cityId 获取城市数据，
 * 复用 CityDetailPanel 展示详情，并显示关联行程。
 */
export default function CityDetailPage() {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const { data: city, isLoading, error } = useCity(cityId ?? '');

  /** 返回城市列表 */
  const handleBack = () => {
    navigate('/app/cities');
  };

  /** 编辑城市（导航到地图页面编辑） */
  const handleEdit = () => {
    if (city) {
      navigate(`/app/map?lat=${city.latitude}&lng=${city.longitude}&zoom=12&edit=${city.id}`);
    }
  };

  /** 删除成功后返回列表 */
  const handleDeleteSuccess = () => {
    navigate('/app/cities');
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="city-detail-page">
        <div className="city-detail-page-loading">
          <Spinner size="lg" centered />
        </div>
      </div>
    );
  }

  // 错误或未找到
  if (error || !city) {
    return (
      <div className="city-detail-page">
        <div className="city-detail-page-empty">
          <MapPin className="city-detail-page-empty-icon" />
          <h2 className="city-detail-page-empty-title">{error ? '加载失败' : '城市未找到'}</h2>
          <p className="city-detail-page-empty-text">
            {error ? error.message : '该城市记录不存在或已被删除'}
          </p>
          <button className="city-detail-page-back-link" onClick={handleBack}>
            返回城市列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="city-detail-page">
      {/* 顶部导航 */}
      <div className="city-detail-page-nav">
        <BackButton label="返回" onClick={handleBack} ariaLabel="返回城市列表" />
      </div>

      {/* 城市详情 */}
      <div className="city-detail-page-content">
        <CityDetailPanel city={city} onEdit={handleEdit} onDeleteSuccess={handleDeleteSuccess} />
      </div>
    </div>
  );
}
