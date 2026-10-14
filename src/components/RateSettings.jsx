import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Download, Users, ShieldAlert, ShieldCheck } from 'lucide-react';
import UserManagementTab from './UserManagementTab';

export default function RateSettings({ 
  settings, 
  onUpdateSettings, 
  onReSeed, 
  currentUser, 
  token, 
  showToast 
}) {
  const [subTab, setSubTab] = useState('rates'); // 'rates' | 'users'
  const isAdmin = currentUser?.role === 'admin';

  const [form, setForm] = useState({
    ward_name: 'वार्ड 01 - अध्यक्ष',
    palika_name: 'कार्यालय नगर पालिका परिषद / नगर पंचायत',
    financial_year: '2026-2027',
    pakka_rate: 0.40,
    ardh_pakka_rate: 0.30,
    kachcha_rate: 0.25,
    plot_rate: 0.10,
    commercial_rate: 1.00,
    default_discount_percent: 20,
    default_tax_percent: 10,
    id_prefix: '09037010010'
  });

  useEffect(() => {
    if (settings) {
      setForm({
        ward_name: settings.ward_name || 'वार्ड 01 - अध्यक्ष',
        palika_name: settings.palika_name || 'कार्यालय नगर पालिका परिषद / नगर पंचायत',
        financial_year: settings.financial_year || '2026-2027',
        pakka_rate: settings.pakka_rate ?? 0.40,
        ardh_pakka_rate: settings.ardh_pakka_rate ?? 0.30,
        kachcha_rate: settings.kachcha_rate ?? 0.25,
        plot_rate: settings.plot_rate ?? 0.10,
        commercial_rate: settings.commercial_rate ?? 1.00,
        default_discount_percent: settings.default_discount_percent ?? 20,
        default_tax_percent: settings.default_tax_percent ?? 10,
        id_prefix: settings.id_prefix || '09037010010'
      });
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      if (showToast) showToast('केवल अधिशासी अधिकारी (Admin) ही सेटिंग्स बदल सकते हैं।', 'error');
      return;
    }
    onUpdateSettings(form);
  };

  const handleDownloadBackup = async () => {
    try {
      const res = await fetch('/api/properties?limit=all');
      const data = await res.json();
      const backup = {
        version: '1.0',
        database: 'MongoDB Atlas',
        exportDate: new Date().toISOString(),
        settings: form,
        properties: data.items || []
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `ward_01_mongodb_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      a.remove();
    } catch (err) {
      alert('बैकअप डाउनलोड करने में त्रुटि: ' + err.message);
    }
  };

  return (
    <div className="content-card">
      {/* Sub Tabs Navigation */}
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="card-title">
            <Settings size={18} /> सेटिंग्स एवं प्रशासन (System Administration)
          </div>
          <div className="card-desc">गृहकर दरें, पालिका प्रोफाइल एवं अधिकृत कर्मचारी लॉगिन प्रबंधन</div>
        </div>

        <div className="settings-subtabs" style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className={`btn btn-sm ${subTab === 'rates' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSubTab('rates')}
          >
            <Settings size={14} />
            <span>कर दरें एवं सेटिंग्स</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${subTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSubTab('users')}
          >
            <Users size={14} />
            <span>कर्मचारी / यूजर प्रबंधन {isAdmin && '👑'}</span>
          </button>
        </div>
      </div>

      <div className="card-body">
        {subTab === 'users' ? (
          <UserManagementTab
            token={token}
            currentUser={currentUser}
            showToast={showToast}
          />
        ) : (
          <>
            {/* RBAC Notice if not admin */}
            {!isAdmin && (
              <div className="settings-alert-warning" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--warning-light)', color: 'var(--warning)', marginBottom: 20 }}>
                <ShieldAlert size={20} />
                <span style={{ fontSize: '0.875rem' }}>
                  <strong>अवलोकन मोड (View Only):</strong> आप "<strong>{currentUser?.name || 'अतिथि'}</strong>" के रूप में हैं। कर दरें एवं निकाय सेटिंग्स बदलने के लिए <strong>अधिशासी अधिकारी (Admin)</strong> के रूप में लॉगिन करें।
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">नगर निकाय का नाम</label>
                  <input
                    type="text"
                    className="form-control"
                    disabled={!isAdmin}
                    value={form.palika_name}
                    onChange={(e) => setForm({ ...form, palika_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">वार्ड का नाम</label>
                  <input
                    type="text"
                    className="form-control"
                    disabled={!isAdmin}
                    value={form.ward_name}
                    onChange={(e) => setForm({ ...form, ward_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">वित्तीय वर्ष (Financial Year)</label>
                  <input
                    type="text"
                    className="form-control"
                    disabled={!isAdmin}
                    value={form.financial_year}
                    onChange={(e) => setForm({ ...form, financial_year: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">पक्का निर्माण दर (Pakka Rate per sq.ft.)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    disabled={!isAdmin}
                    value={form.pakka_rate}
                    onChange={(e) => setForm({ ...form, pakka_rate: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">अर्ध पक्का निर्माण दर (Ardh Pakka per sq.ft.)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    disabled={!isAdmin}
                    value={form.ardh_pakka_rate}
                    onChange={(e) => setForm({ ...form, ardh_pakka_rate: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">कच्चा निर्माण दर (Kachcha Rate per sq.ft.)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    disabled={!isAdmin}
                    value={form.kachcha_rate}
                    onChange={(e) => setForm({ ...form, kachcha_rate: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">खाली भूखंड दर (Plot Rate per sq.ft.)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    disabled={!isAdmin}
                    value={form.plot_rate}
                    onChange={(e) => setForm({ ...form, plot_rate: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">व्यावसायिक दर (Commercial Rate per sq.ft.)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    disabled={!isAdmin}
                    value={form.commercial_rate}
                    onChange={(e) => setForm({ ...form, commercial_rate: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">मानक भवन छूट % (Standard Discount)</label>
                  <input
                    type="number"
                    className="form-control"
                    disabled={!isAdmin}
                    value={form.default_discount_percent}
                    onChange={(e) => setForm({ ...form, default_discount_percent: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">गृहकर प्रतिशत % (House Tax %)</label>
                  <input
                    type="number"
                    className="form-control"
                    disabled={!isAdmin}
                    value={form.default_tax_percent}
                    onChange={(e) => setForm({ ...form, default_tax_percent: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">प्रॉपर्टी आईडी प्रीफिक्स (ID Prefix)</label>
                  <input
                    type="text"
                    className="form-control"
                    disabled={!isAdmin}
                    value={form.id_prefix}
                    onChange={(e) => setForm({ ...form, id_prefix: e.target.value })}
                  />
                </div>
              </div>

              {isAdmin && (
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">
                    <Save size={15} /> सेटिंग्स अपडेट करें (Save to DB)
                  </button>
                </div>
              )}
            </form>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

            {/* Database Management */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                💾 डेटाबेस प्रबंधन एवं बैकअप (MongoDB Management)
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                डेटाबेस सीधे <strong>MongoDB Atlas Cloud</strong> से जुड़ा हुआ है। आप किसी भी समय संपूर्ण डेटा JSON प्रारूप में डाउनलोड कर सकते हैं।
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className="btn btn-outline" onClick={handleDownloadBackup}>
                  <Download size={14} /> पूर्ण JSON बैकअप डाउनलोड
                </button>

                {isAdmin && (
                  <button
                    className="btn btn-outline"
                    onClick={onReSeed}
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  >
                    <RefreshCw size={14} /> मूल वार्ड 1 डेटा (394 रिकॉर्ड्स) पुनः सीड करें
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
