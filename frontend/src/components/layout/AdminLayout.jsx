import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-right">
          {user && <span className="muted">{user.email}</span>}
          <button
            className="btn btn-sm"
            onClick={() => {
              dispatch(logout());
              navigate('/login');
            }}
          >
            Log out
          </button>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
