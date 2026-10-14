import React, { useState } from 'react';
import { KeyRound, Lock, Eye, EyeOff, X, Check, AlertCircle } from 'lucide-react';

export default function ChangePasswordModal({ token, onClose, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 5) {
      setError('नया पासवर्ड कम से कम 5 अक्षरों का होना चाहिए।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'पासवर्ड बदलने में विफलता');
      }
      onSuccess(data.message || 'पासवर्ड सफलतापूर्वक बदल दिया गया!');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <KeyRound size={20} color="var(--primary)" />
            <h3>पासवर्ड बदलें (Change Password)</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="login-error-alert" style={{ marginBottom: 16 }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">वर्तमान पासवर्ड (Current Password)</label>
            <input
              type={showPass ? 'text' : 'password'}
              className="form-control"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="वर्तमान पासवर्ड दर्ज करें"
            />
          </div>

          <div className="form-group">
            <label className="form-label">नया पासवर्ड (New Password)</label>
            <input
              type={showPass ? 'text' : 'password'}
              className="form-control"
              required
              minLength={5}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="नया पासवर्ड (कम से कम 5 अक्षर)"
            />
          </div>

          <div className="form-group">
            <label className="form-label">नए पासवर्ड की पुष्टि (Confirm New Password)</label>
            <input
              type={showPass ? 'text' : 'password'}
              className="form-control"
              required
              minLength={5}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="नया पासवर्ड पुनः दर्ज करें"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <input
              type="checkbox"
              id="chkShowPass"
              checked={showPass}
              onChange={(e) => setShowPass(e.target.checked)}
            />
            <label htmlFor="chkShowPass" style={{ fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              पासवर्ड दिखाएं
            </label>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: 20 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              रद्द करें
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Check size={16} />
              <span>{loading ? 'सुरक्षित हो रहा है...' : 'पासवर्ड अपडेट करें'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
