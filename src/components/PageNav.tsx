import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Logo from './Logo';
import './PageNav.css';

function PageNav() {
  const user = useAuthStore((s) => s.user);

  return (
    <nav className="page-nav">
      <Logo />

      <ul>
        {user ? (
          <li>
            <NavLink to="/app" className="cta-link">
              进入应用
            </NavLink>
          </li>
        ) : (
          <>
            <li>
              <NavLink to="/auth/login" className="cta-link">
                登录
              </NavLink>
            </li>
            <li>
              <NavLink to="/auth/register" className="cta-link">
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
