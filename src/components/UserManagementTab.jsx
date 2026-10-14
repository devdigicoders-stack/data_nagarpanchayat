import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Shield, Phone, Calendar, CheckCircle } from 'lucide-react';

export default function UserManagementTab({ token, currentUser, showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'operator',
    designation: 'कर संग्राहक (Tax Collector)',
    mobile: ''
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        showToast(data.error || 'उपयोगकर्ताओं को लोड करने में असमर्थ', 'error');
      }
    } catch (err) {
      showToast('सर्वर से संपर्क करने में असमर्थ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && currentUser?.role === 'admin') {
      loadUsers();
    }
  }, [token, currentUser]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'कर्मचारी जोड़ने में विफल');
      }
      showToast(`नया कर्मचारी खाता "${data.name}" सफलतापूर्वक बनाया गया!`);
      setShowAddForm(false);
      setFormData({
        username: '',
        password: '',
        name: '',
        role: 'operator',
        designation: 'कर संग्राहक (Tax Collector)',
        mobile: ''
      });
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    if (user._id === currentUser?.id || user.username === currentUser?.username) {
      showToast('आप स्वयं अपना एडमिन खाता नहीं हटा सकते।', 'error');
      return;
    }

    if (confirm(`क्या आप वाकई कर्मचारी "${user.name}" (${user.username}) का खाता हटाना चाहते हैं?`)) {
      try {
        const res = await fetch(`/api/auth/users/${user._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'खाता हटाने में विफलता');
        }
        showToast(data.message || 'खाता हटा दिया गया');
        loadUsers();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="card" style={{ padding: 24, textAlign: 'center' }}>
        <Shield size={40} color="var(--warning)" style={{ margin: '0 auto 12px' }} />
        <h3>केवल अधिशासी अधिकारी (Admin) के लिए अधिकृत</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          कर्मचारी एवं लॉगिन प्रबंधन का अधिकार केवल एडमिन स्तर के अधिकारियों को है।
        </p>
      </div>
    );
  }

  return (
    <div className="user-management-section">
      <div className="settings-header-action" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.25rem' }}>
            <Users size={22} color="var(--primary)" />
            <span>कर्मचारी एवं लॉगिन प्रबंधन (Municipal Staff Users)</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
            पोर्टल ऑपरेटरों, कर संग्राहकों एवं पर्यवेक्षकों के खाते बनाएं और प्रबंधित करें।
          </p>
        </div>

        <button
          className={`btn ${showAddForm ? 'btn-outline' : 'btn-primary'} btn-sm`}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <UserPlus size={16} />
          <span>{showAddForm ? 'फॉर्म बंद करें' : '➕ नया कर्मचारी जोड़ें'}</span>
        </button>
      </div>

      {/* Add User Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleCreateUser} className="card user-add-card" style={{ marginBottom: 24, padding: 20, border: '1px solid var(--primary-light)', background: 'var(--bg-subtle)' }}>
          <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)' }}>
            <UserPlus size={18} />
            <span>नया कर्मचारी खाता प्रपत्र (New Staff Registration)</span>
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">कर्मचारी का नाम (Full Name) *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="उदा. राहुल कुमार शर्मा"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">लॉगिन यूजरनेम (Username) *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="उदा. rahul_tax"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">प्रारंभिक पासवर्ड (Password) *</label>
              <input
                type="password"
                className="form-control"
                required
                minLength={5}
                placeholder="कम से कम 5 अक्षर"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">भूमिका / अधिकार (Role) *</label>
              <select
                className="form-control"
                value={formData.role}
                onChange={(e) => {
                  const role = e.target.value;
                  const designation = role === 'admin' 
                    ? 'अधिशासी अधिकारी / EO' 
                    : role === 'operator' 
                    ? 'कर संग्राहक (Tax Collector)' 
                    : 'वार्ड प्रतिनिधि (Viewer)';
                  setFormData({ ...formData, role, designation });
                }}
              >
                <option value="operator">💼 ऑपरेटर / कर संग्राहक (प्रविष्टि, संपादन, रसीद)</option>
                <option value="viewer">🏛️ वार्ड प्रतिनिधि / दर्शक (केवल अवलोकन व प्रिंट)</option>
                <option value="admin">👑 व्यवस्थापक / अधिशासी अधिकारी (पूर्ण अधिकार)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">पदनाम (Designation)</label>
              <input
                type="text"
                className="form-control"
                placeholder="उदा. सहायक राजस्व निरीक्षक"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">मोबाइल नंबर (Mobile)</label>
              <input
                type="text"
                className="form-control"
                placeholder="10 अंकों का मोबाइल नंबर"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddForm(false)}>
              रद्द करें
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <CheckCircle size={15} />
              <span>खाता सुरक्षित करें</span>
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="table-responsive">
        <table className="register-table">
          <thead>
            <tr>
              <th>कर्मचारी का नाम</th>
              <th>यूजरनेम</th>
              <th>भूमिका (Role)</th>
              <th>पदनाम (Designation)</th>
              <th>मोबाइल</th>
              <th>अंतिम लॉगिन</th>
              <th style={{ textAlign: 'center' }}>कार्य (Action)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>लोड हो रहा है...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>कोई कर्मचारी नहीं मिला।</td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelf = u._id === currentUser?.id || u.username === currentUser?.username;
                const roleBadgeClass = u.role === 'admin' ? 'badge-admin-role' : u.role === 'operator' ? 'badge-operator-role' : 'badge-viewer-role';
                const roleLabel = u.role === 'admin' ? '👑 Admin (EO)' : u.role === 'operator' ? '💼 Operator' : '🏛️ Viewer';

                return (
                  <tr key={u._id}>
                    <td>
                      <strong>{u.name}</strong>
                      {isSelf && <span className="badge-self" style={{ marginLeft: 8, fontSize: '0.7rem' }}>आप स्वयं</span>}
                    </td>
                    <td><code>{u.username}</code></td>
                    <td><span className={`badge-role-tag ${roleBadgeClass}`}>{roleLabel}</span></td>
                    <td>{u.designation || '-'}</td>
                    <td>{u.mobile || '-'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString('hi-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'कभी नहीं'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {!isSelf ? (
                        <button
                          className="btn btn-outline btn-sm btn-icon-only"
                          onClick={() => handleDeleteUser(u)}
                          title="कर्मचारी हटाएं"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>सक्रिय सत्र</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
