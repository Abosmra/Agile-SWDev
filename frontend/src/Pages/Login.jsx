import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../api';
import loginImage from '../assets/login.PNG';
import eye from '../assets/eye.png';
import eyeOff from '../assets/eye-off.png';
import { getDefaultRouteForRole, normalizeRoleName } from '../roleUtils';
import '../css/login.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please fill all fields!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address!');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters!');
      return;
    }

    try {
      const auth = await apiPost('/api/login', {
        username: email,
        password
      });

      const normalizedRole = normalizeRoleName(auth.user.Role);
      onLogin(auth);
      navigate(getDefaultRouteForRole(normalizedRole));
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Form */}
        <div className="login-form-side">
          <div className="login-form-wrapper">
            <button className="login-back-btn" onClick={() => navigate('/')}>← Back</button>
            <h1>Login</h1>
            <p className="login-subtitle">Welcome back! Please enter your details.</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group password-group">
                <label>Password</label>

                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <img
                    src={showPassword ? eyeOff : eye}
                    alt="toggle password"
                    className="eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={!isFormValid}
              >
                Log In
              </button>
            </form>

            <button
              type="button"
              className="apply-btn"
              onClick={() => navigate('/apply')}
            >
              New user? Apply now →
            </button>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="login-image-side">
          <img src={loginImage} alt="Login Illustration" className="login-image" />
        </div>
      </div>
    </div>
  );
}
