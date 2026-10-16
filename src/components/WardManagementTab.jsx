import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  ShieldAlert, 
  Phone, 
  Home, 
  IndianRupee, 
  Hash, 
  UserCheck, 
  Check, 
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function WardManagementTab({ token, currentUser, showToast, onWardsUpdated }) {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWard, setEditingWard] = useState(null);

  const isAdmin = currentUser?.role === 'admin';

  const [formData, setFormData] = useState({
    ward_no: '',
    ward_name: '',
    id_prefix: '',
    parshad_name: '',
    contact_no: '',
    description: ''
  });

  const loadWards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wards');
      const data = await res.json();
      if (res.ok) {
        setWards(data);
        if (onWardsUpdated) onWardsUpdated(data);
      } else {
        showToast(data.error || 'वार्ड सूची लोड करने में त्रुटि', 'error');
      }
    } catch (err) {
      showToast('सर्वर से संपर्क नहीं हो पाया', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWards();
  }, []);

  // Auto-generate prefix when ward_no changes
  const handleWardNoChange = (val) => {
    const num = val.replace(/\D/g, '');
    const pad = num ? String(num).padStart(2, '0') : '';
    setFormData(prev => ({
      ...prev,
      ward_no: num,
      ward_name: prev.ward_name || (num ? `वार्ड ${pad} - ` : ''),
      id_prefix: num ? `090370${pad}0010` : prev.id_prefix
    }));
  };

  const handleCreateWard = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('केवल अधिशासी अधिकारी (Admin) ही नया वार्ड बना सकते हैं।', 'error');
      return;
    }

    try {
      const res = await fetch('/api/wards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'वार्ड जोड़ने में विफल');
      }

      showToast(`नया वार्ड "${data.ward_name}" सफलतापूर्वक बनाया गया!`);
      setShowAddForm(false);
      setFormData({
        ward_no: '',
        ward_name: '',
        id_prefix: '',
        parshad_name: '',
        contact_no: '',
        description: ''
      });
      loadWards();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateWard = async (e) => {
    e.preventDefault();
    if (!isAdmin || !editingWard) return;

    try {
      const res = await fetch(`/api/wards/${editingWard._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingWard)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'वार्ड अपडेट करने में विफल');
      }

      showToast(`वार्ड "${data.ward_name}" विवरण अपडेट किया गया!`);
      setEditingWard(null);
      loadWards();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteWard = async (ward) => {
    if (!isAdmin) {
      showToast('केवल एडमिन को वार्ड हटाने की अनुमति है।', 'error');
      return;
    }

    if (ward.property_count > 0) {
      alert(`⚠️ इस वार्ड (${ward.ward_name}) में ${ward.property_count} संपत्तियां पहले से दर्ज हैं!\n\nडेटा सुरक्षा के लिए इसे सीधे नहीं हटाया जा सकता।`);
      return;
    }

    if (confirm(`क्या आप वाकई "${ward.ward_name}" को हटाना चाहते हैं?`)) {
      try {
        const res = await fetch(`/api/wards/${ward._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'वार्ड हटाने में त्रुटि');
        }
        showToast(data.message || 'वार्ड सफलतापूर्वक हटा दिया गया');
        loadWards();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  // Stats calculation
  const totalWards = wards.length;
  const totalProperties = wards.reduce((sum, w) => sum + (w.property_count || 0), 0);
  const totalTax = wards.reduce((sum, w) => sum + (w.total_tax || 0), 0);

  return (
    <div className="ward-management-section">
      {/* Top Header & Action */}
      <div className="settings-header-action" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.25rem', margin: 0 }}>
            <Building2 size={22} color="var(--primary)" />
            <span>नगर निकाय वार्ड प्रबंधन (Municipal Wards Management)</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4, marginBottom: 0 }}>
            निकाय के सभी वार्डों की सूची, वार्ड कोड (ID Prefix), और वार्ड प्रतिनिधि का विवरण प्रबंधित करें।
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className={`btn ${showAddForm ? 'btn-outline' : 'btn-primary'} btn-sm`}
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingWard(null);
            }}
          >
            <PlusCircle size={16} />
            <span>{showAddForm ? 'फॉर्म बंद करें' : '➕ नया वार्ड बनाएं'}</span>
          </button>
        )}
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="calc-step-card" style={{ padding: '14px 18px' }}>
          <div className="label">🏛️ कुल वार्ड (Total Wards)</div>
          <div className="val" style={{ color: 'var(--primary)', fontSize: '1.5rem', marginTop: 4 }}>
            {totalWards} वार्ड
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>सक्रिय नगर निकाय प्रभाग</div>
        </div>

        <div className="calc-step-card" style={{ padding: '14px 18px' }}>
          <div className="label">🏡 कुल पंजीकृत संपत्तियां</div>
          <div className="val" style={{ color: '#059669', fontSize: '1.5rem', marginTop: 4 }}>
            {totalProperties.toLocaleString('en-IN')} भवन
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>सभी वार्डों का योग</div>
        </div>

        <div className="calc-step-card" style={{ padding: '14px 18px' }}>
          <div className="label">💰 कुल वार्षिक कर मांग</div>
          <div className="val" style={{ color: '#d97706', fontSize: '1.5rem', marginTop: 4 }}>
            ₹{totalTax.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>गृहकर एवं जलकर मांग</div>
        </div>
      </div>

      {/* Non-Admin Warning */}
      {!isAdmin && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--warning-light)', color: 'var(--warning)', marginBottom: 20 }}>
          <ShieldAlert size={20} />
          <span style={{ fontSize: '0.875rem' }}>
            <strong>अवलोकन मोड (View Only):</strong> नया वार्ड जोड़ने अथवा संपादित करने के लिए <strong>अधिशासी अधिकारी (Admin)</strong> लॉगिन आवश्यक है।
          </span>
        </div>
      )}

      {/* Add Ward Form */}
      {showAddForm && (
        <form onSubmit={handleCreateWard} className="card" style={{ marginBottom: 24, padding: 20, border: '1px solid var(--primary-light)', background: 'var(--bg-subtle)' }}>
          <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', margin: '0 0 16px 0' }}>
            <PlusCircle size={18} />
            <span>नया वार्ड निर्माण प्रपत्र (Create New Municipal Ward)</span>
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">वार्ड संख्या (Ward Number) *</label>
              <input
                type="number"
                min="1"
                max="99"
                className="form-control"
                required
                placeholder="उदा. 2"
                value={formData.ward_no}
                onChange={(e) => handleWardNoChange(e.target.value)}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>क्रम संख्या (उदा. 1, 2, 3)</small>
            </div>

            <div className="form-group">
              <label className="form-label">वार्ड का नाम (Ward Name in Hindi) *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="उदा. वार्ड 02 - सुभाष नगर"
                value={formData.ward_name}
                onChange={(e) => setFormData({ ...formData, ward_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">प्रॉपर्टी कोड प्रीफिक्स (ID Prefix) *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="उदा. 090370020010"
                value={formData.id_prefix}
                onChange={(e) => setFormData({ ...formData, id_prefix: e.target.value })}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>इस वार्ड के भवनों के लिए यूनिक कोड</small>
            </div>

            <div className="form-group">
              <label className="form-label">पार्षद / वार्ड प्रतिनिधि का नाम</label>
              <input
                type="text"
                className="form-control"
                placeholder="उदा. श्री सुनील यादव"
                value={formData.parshad_name}
                onChange={(e) => setFormData({ ...formData, parshad_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">संपर्क मोबाइल नंबर</label>
              <input
                type="tel"
                maxLength="10"
                className="form-control"
                placeholder="उदा. 9839XXXXXX"
                value={formData.contact_no}
                onChange={(e) => setFormData({ ...formData, contact_no: e.target.value.replace(/\D/g, '') })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">वार्ड का विवरण / सीमाएं (Description)</label>
              <input
                type="text"
                className="form-control"
                placeholder="उदा. रेलवे क्रॉसिंग से लेकर मुख्य बाजार तक"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddForm(false)}>
              रद्द करें
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Check size={16} /> वार्ड सुरक्षित करें
            </button>
          </div>
        </form>
      )}

      {/* Edit Ward Modal / Inline Form */}
      {editingWard && (
        <form onSubmit={handleUpdateWard} className="card" style={{ marginBottom: 24, padding: 20, border: '2px solid var(--accent)', background: 'var(--bg-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)' }}>
              <Edit3 size={18} />
              <span>वार्ड संपादन: {editingWard.ward_name} (वार्ड {editingWard.ward_no})</span>
            </h4>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingWard(null)}>
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">वार्ड का नाम</label>
              <input
                type="text"
                className="form-control"
                required
                value={editingWard.ward_name}
                onChange={(e) => setEditingWard({ ...editingWard, ward_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">आईडी कोड प्रीफिक्स (ID Prefix)</label>
              <input
                type="text"
                className="form-control"
                required
                value={editingWard.id_prefix}
                onChange={(e) => setEditingWard({ ...editingWard, id_prefix: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">पार्षद / प्रतिनिधि का नाम</label>
              <input
                type="text"
                className="form-control"
                value={editingWard.parshad_name || ''}
                onChange={(e) => setEditingWard({ ...editingWard, parshad_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">संपर्क मोबाइल नंबर</label>
              <input
                type="tel"
                maxLength="10"
                className="form-control"
                value={editingWard.contact_no || ''}
                onChange={(e) => setEditingWard({ ...editingWard, contact_no: e.target.value.replace(/\D/g, '') })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">विवरण (Description)</label>
              <input
                type="text"
                className="form-control"
                value={editingWard.description || ''}
                onChange={(e) => setEditingWard({ ...editingWard, description: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingWard(null)}>
              रद्द करें
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Check size={16} /> बदलाव सुरक्षित करें
            </button>
          </div>
        </form>
      )}

      {/* Wards Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>वार्ड क्र.</th>
              <th>वार्ड का नाम (Ward Name)</th>
              <th>आईडी कोड प्रीफिक्स</th>
              <th>पार्षद / प्रतिनिधि</th>
              <th>संपर्क</th>
              <th style={{ textAlign: 'right' }}>कुल संपत्तियां</th>
              <th style={{ textAlign: 'right' }}>कुल वार्षिक मांग</th>
              {isAdmin && <th style={{ textAlign: 'center', width: 110 }}>कार्रवाई</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  वार्ड डेटा लोड हो रहा है...
                </td>
              </tr>
            ) : wards.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  कोई वार्ड उपलब्ध नहीं है। ऊपर दिए गए बटन से नया वार्ड जोड़ें।
                </td>
              </tr>
            ) : (
              wards.map(ward => (
                <tr key={ward._id || ward.ward_no}>
                  <td>
                    <span className="badge-ward" style={{ fontWeight: 700, padding: '4px 8px', fontSize: '0.8rem' }}>
                      {String(ward.ward_no).padStart(2, '0')}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {ward.ward_name}
                    </div>
                    {ward.description && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {ward.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <code style={{ fontSize: '0.8rem', background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 4 }}>
                      {ward.id_prefix || '---'}
                    </code>
                  </td>
                  <td>
                    {ward.parshad_name ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <UserCheck size={14} color="var(--primary)" />
                        <span>{ward.parshad_name}</span>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>---</span>
                    )}
                  </td>
                  <td>
                    {ward.contact_no ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Phone size={13} color="var(--text-muted)" />
                        <span>{ward.contact_no}</span>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>---</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    <span style={{ color: (ward.property_count || 0) > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {(ward.property_count || 0).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    ₹{(ward.total_tax || 0).toLocaleString('en-IN')}
                  </td>
                  {isAdmin && (
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          title="वार्ड संपादित करें"
                          onClick={() => {
                            setEditingWard({ ...ward });
                            setShowAddForm(false);
                          }}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-xs text-danger"
                          title="वार्ड हटाएं"
                          onClick={() => handleDeleteWard(ward)}
                          style={{ borderColor: 'var(--danger-light)', color: 'var(--danger)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
