import React, { useState } from 'react';
import { Shield, User, Lock, Eye, EyeOff, LogIn, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('कृपया यूजरनेम और पासवर्ड दोनों दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'लॉगिन विफल रहा');
      }
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Background ambient lighting */}
      <div className="login-ambient-blob blob-1" />
      <div className="login-ambient-blob blob-2" />

      <div className="login-container">
        {/* Brand Banner */}
        <div className="login-brand">
          <div className="login-emblem-badge">
            <Building2 size={36} color="var(--primary)" />
          </div>
          <div className="login-gov-tag">उत्तर प्रदेश नगर पालिका / नगर पंचायत</div>
          <h2>डिजिटल गृहकर निर्धारण पोर्टल</h2>
          <p>वार्ड 01 (अध्यक्ष) संपत्ति कर एवं वार्षिक किराया मूल्य (ARV) प्रबंधन प्रणाली</p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-card-title">
              <Shield size={20} color="var(--primary)" />
              <span>कर्मचारी / अधिकारी लॉगिन</span>
            </div>
            <p className="login-card-subtitle">
              पोर्टल में प्रवेश करने के लिए अपना अधिकृत यूज़रनेम व पासवर्ड दर्ज करें
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="login-error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="inputUsername">
                <User size={15} style={{ marginRight: 6 }} /> यूजरनेम (Username)
              </label>
              <div className="input-with-icon">
                <input
                  id="inputUsername"
                  type="text"
                  className="form-control"
                  placeholder="अपना यूजरनेम दर्ज करें"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="inputPassword">
                <Lock size={15} style={{ marginRight: 6 }} /> पासवर्ड (Password)
              </label>
              <div className="input-password-wrapper">
                <input
                  id="inputPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="अपना गोपनीय पासवर्ड दर्ज करें"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-login-submit"
              disabled={loading}
            >
              {loading ? (
                <span>प्रमाणित किया जा रहा है...</span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>सुरक्षित लॉगिन करें</span>
                </>
              )}
            </button>
          </form>

          {/* Card Footer with Security Badge */}
          <div className="login-card-footer" style={{ borderTop: 'none', paddingTop: 0, marginTop: '1.25rem' }}>
            <div className="login-security-tag">
              <CheckCircle2 size={13} color="var(--success)" /> अधिकृत विभागीय उपयोग हेतु • 256-bit SSL एन्क्रिप्टेड
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
