import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Layers, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    dateOfBirth: '2000-01-01',
    gender: 'male',
    password: '',
    rePassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.rePassword) {
      setApiError('Passwords do not match');
      showToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      setApiError('Password must be at least 6 characters long');
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const res = await signup(formData);
      showToast('Account created successfully!', 'success');

      // If signup returns token and user, AuthContext automatically set it,
      // redirecting to home; if not, redirect to /login
      if (res?.data?.token || res?.token) {
        navigate('/', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errors = err?.response?.data?.errors;
      let msg = err?.response?.data?.message || 'Failed to create account. Please check your inputs.';

      if (Array.isArray(errors) && errors.length > 0) {
        msg = errors.map((e) => (typeof e === 'object' ? e.message || e.msg : e)).join(', ');
      }

      setApiError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container auth-card-register animate-fade-in">
        <div className="auth-brand-header">
          <div className="auth-brand-icon">
            <Layers size={32} />
          </div>
          <h1 className="auth-title">Join Pulse</h1>
          <p className="auth-subtitle">Create an account to start sharing and connecting</p>
        </div>

        {apiError && (
          <div className="auth-error-banner animate-slide-in">
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">
                Full Name
              </label>
              <input
                id="reg-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">
                Username
              </label>
              <input
                id="reg-username"
                name="username"
                type="text"
                className="form-input"
                placeholder="e.g. johndoe22"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Email Address
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="e.g. john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-dob">
                Date of Birth
              </label>
              <input
                id="reg-dob"
                name="dateOfBirth"
                type="date"
                className="form-input"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-gender">
                Gender
              </label>
              <select
                id="reg-gender"
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                Password
              </label>
              <div className="input-with-icon">
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="input-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-rePassword">
                Confirm Password
              </label>
              <input
                id="reg-rePassword"
                name="rePassword"
                type="password"
                className="form-input"
                placeholder="Re-enter password"
                value={formData.rePassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg auth-submit-btn mt-3"
            disabled={isLoading}
          >
            {isLoading ? (
              'Creating your account...'
            ) : (
              <>
                <span>Sign Up</span>
                <UserPlus size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-switch-link">
              Sign In <ArrowRight size={14} className="inline-icon" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
