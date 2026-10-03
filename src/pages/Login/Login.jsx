import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Layers, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setApiError('Please fill in both fields');
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      await login({
        email: identifier.trim(),
        password,
      });
      showToast('Welcome back!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        'Invalid credentials. Please verify your email/username and password.';
      setApiError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container animate-fade-in">
        <div className="auth-brand-header">
          <div className="auth-brand-icon">
            <Layers size={32} />
          </div>
          <h1 className="auth-title">Welcome to Pulse</h1>
          <p className="auth-subtitle">Sign in to connect with professionals and peers</p>
        </div>

        {apiError && (
          <div className="auth-error-banner animate-slide-in">
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-identifier">
              Email or Username
            </label>
            <input
              id="login-identifier"
              type="text"
              className="form-input"
              placeholder="e.g. name@example.com or username"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (apiError) setApiError('');
              }}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
            </div>
            <div className="input-with-icon">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (apiError) setApiError('');
                }}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg auth-submit-btn"
            disabled={isLoading || !identifier.trim() || !password}
          >
            {isLoading ? (
              'Authenticating...'
            ) : (
              <>
                <span>Sign In</span>
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-switch-link">
              Create Account <ArrowRight size={14} className="inline-icon" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
