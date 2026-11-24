import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectIsAuthenticated } from '../features/auth/authSlice';
import { Alert } from '../components/common/ui';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state) => state.auth);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [form, setForm] = useState({ email: '', password: '' });

  if (isAuthenticated) return <Navigate to={location.state?.from || '/admin/forms'} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    const response = await dispatch(login(form));
    if (login.fulfilled.match(response)) navigate(location.state?.from || '/admin/forms', { replace: true });
  };

  return (
    <div className="center-page">
      <form className="card login-card" onSubmit={onSubmit}>
        <h1>Admin login</h1>
        <Alert>{error}</Alert>
        <div className="form-group">
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="username"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button className="btn btn-primary btn-block" disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
