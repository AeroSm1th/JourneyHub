import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import PageNav from '../components/PageNav';
import styles from './Homepage.module.css';

export default function Homepage() {
  const user = useAuthStore((s) => s.user);

  return (
    <main className={styles.homepage}>
      <PageNav />

      <section>
        <h1>
          记录你的旅行足迹
          <br />
          JourneyHub 与你同行
        </h1>
        <h2>
          在世界地图上标记你去过的每一座城市，记录旅途中的美好回忆，
          规划未来的冒险旅程，与朋友分享你的旅行故事。
        </h2>
        {user ? (
          <Link to="/app" className="cta">
            进入应用
          </Link>
        ) : (
          <Link to="/auth/login" className="cta">
            开始记录
          </Link>
        )}
      </section>
    </main>
  );
}
