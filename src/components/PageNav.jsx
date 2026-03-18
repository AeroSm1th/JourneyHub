import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Logo from './Logo';
import styles from './PageNav.module.css';

function PageNav() {
  const user = useAuthStore((s) => s.user);

  return (
    <nav className={styles.nav}>
      <Logo />

      <ul>
        {user ? (
          <li>
            <NavLink to="/app" className={styles.ctaLink}>
              进入应用
            </NavLink>
          </li>
        ) : (
          <>
            <li>
              <NavLink to="/auth/login" className={styles.ctaLink}>
                登录
              </NavLink>
            </li>
            <li>
              <NavLink to="/auth/register" className={styles.ctaLink}>
                注册
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default PageNav;
