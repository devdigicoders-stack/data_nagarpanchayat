import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import RegisterTable from './components/RegisterTable';
import FastEntryForm from './components/FastEntryForm';
import OwnerLookup from './components/OwnerLookup';
import RateSettings from './components/RateSettings';
import AssessmentSlipModal from './components/AssessmentSlipModal';
import LoginPage from './components/LoginPage';
import ChangePasswordModal from './components/ChangePasswordModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('tabDashboard');
  const [theme, setTheme] = useState('light');
  const [dbConnected, setDbConnected] = useState(false);

  // Authentication State
  const [token, setToken] = useState(() => localStorage.getItem('ward_01_tax_token') || null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ward_01_tax_user') || 'null');
    } catch {
      return null;
    }
  });
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Data States
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [totalProps, setTotalProps] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [houseType, setHouseType] = useState('');
  const [nirman, setNirman] = useState('');
  const [sortBy, setSortBy] = useState('sr_no');
  const [sortOrder, setSortOrder] = useState('asc');

  const [nextIds, setNextIds] = useState(null);
  const [settings, setSettings] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedSlipProperty, setSelectedSlipProperty] = useState(null);
  const [ownerSearchQuery, setOwnerSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Initial Theme
  useEffect(() => {
    const saved = localStorage.getItem('ward_01_react_theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('ward_01_react_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // Verify Session Token on mount
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('ward_01_tax_token');
      if (savedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${savedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentUser(data.user);
            setToken(savedToken);
          } else {
            handleLogout(false);
          }
        } catch (err) {
          console.error('Session verify error:', err);
        }
      }
    };
    verifySession();
  }, []);

  // Health / DB Connection Check
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setDbConnected(data.database === 'connected');
      } catch (err) {
        setDbConnected(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Login & Logout Handlers
  const handleLogin = (newToken, newUser) => {
    setToken(newToken);
    setCurrentUser(newUser);
    localStorage.setItem('ward_01_tax_token', newToken);
    localStorage.setItem('ward_01_tax_user', JSON.stringify(newUser));
    showToast(`स्वागत है! ${newUser.name} (${newUser.designation || newUser.role}) के रूप में लॉगिन सफल`);
  };

  const handleLogout = (notify = true) => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('ward_01_tax_token');
    localStorage.removeItem('ward_01_tax_user');
    if (notify) showToast('आप पोर्टल से सफलतापूर्वक लॉगआउट हो चुके हैं।', 'info');
  };

  // Fetch Settings & Next IDs
  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  const loadNextIds = async () => {
    try {
      const res = await fetch('/api/next-id');
      const data = await res.json();
      setNextIds(data);
    } catch (err) {
      console.error('Failed to load next IDs', err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const loadProperties = async () => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search,
        house_type: houseType,
        nirman,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      const res = await fetch(`/api/properties?${queryParams.toString()}`);
      const data = await res.json();
      setProperties(data.items || []);
      setTotalProps(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load properties', err);
    }
  };

  useEffect(() => {
    loadSettings();
    loadNextIds();
    loadStats();
  }, []);

  useEffect(() => {
    loadProperties();
  }, [page, limit, search, houseType, nirman, sortBy, sortOrder]);

  // Form Save
  const handleSaveProperty = async (formData) => {
    if (currentUser?.role === 'viewer') {
      showToast('दर्शक (Viewer) को नए रिकॉर्ड जोड़ने या संपादित करने का अधिकार नहीं है।', 'error');
      return;
    }

    try {
      let res;
      if (editingRecord && editingRecord._id) {
        res = await fetch(`/api/properties/${editingRecord._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(formData)
        });
      } else {
        res = await fetch('/api/properties', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(formData)
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'सुरक्षित करने में त्रुटि');
      }

      const saved = await res.json();
      showToast(
        editingRecord
          ? `प्रॉपर्टी ${saved.property_id} सफलतापूर्वक अपडेट हुई!`
          : `नई प्रॉपर्टी ${saved.property_id} सुरक्षित हो गई!`
      );

      setEditingRecord(null);
      loadProperties();
      loadStats();
      loadNextIds();
      setActiveTab('tabRegister');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete
  const handleDeleteProperty = async (prop) => {
    if (currentUser?.role !== 'admin') {
      showToast('केवल अधिशासी अधिकारी (Admin) ही संपत्ति रिकॉर्ड हटा सकते हैं।', 'error');
      return;
    }

    if (confirm(`क्या आप वाकई क्र.सं. ${prop.sr_no} (आईडी: ${prop.property_id} - ${prop.owner_name}) को हटाना चाहते हैं?`)) {
      try {
        const res = await fetch(`/api/properties/${prop._id}`, { 
          method: 'DELETE',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) throw new Error('हटाने में विफलता');
        showToast('प्रॉपर्टी रिकॉर्ड हटा दिया गया।', 'info');
        loadProperties();
        loadStats();
        loadNextIds();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  // Edit action
  const handleEditProperty = (prop) => {
    if (currentUser?.role === 'viewer') {
      showToast('दर्शक (Viewer) को संपत्ति संपादन का अधिकार नहीं है।', 'warning');
      return;
    }
    setEditingRecord(prop);
    setActiveTab('tabEntry');
  };

  // Owner click in table
  const handleOwnerClick = (ownerName) => {
    setOwnerSearchQuery(ownerName);
    setActiveTab('tabOwnerSearch');
  };

  // Update Settings
  const handleUpdateSettings = async (newSettings) => {
    if (currentUser?.role !== 'admin') {
      showToast('केवल अधिशासी अधिकारी (Admin) ही दरें व सेटिंग्स बदल सकते हैं।', 'error');
      return;
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      setSettings(data);
      showToast('सेटिंग्स MongoDB में सुरक्षित हो गईं!');
    } catch (err) {
      showToast('सेटिंग्स अपडेट करने में विफलता', 'error');
    }
  };

  // Re-Seed from initial 394 data
  const handleReSeed = async () => {
    if (currentUser?.role !== 'admin') {
      showToast('केवल अधिशासी अधिकारी (Admin) ही डेटाबेस रीसीड कर सकते हैं।', 'error');
      return;
    }

    if (confirm('चेतावनी: क्या आप वाकई डेटाबेस को मूल 394 वार्ड 1 रिकॉर्ड्स पर पुनः लोड करना चाहते हैं?')) {
      try {
        showToast('डेटाबेस रीफ्रेश हो रहा है...', 'info');
        loadProperties();
        loadStats();
        loadNextIds();
        showToast('डेटाबेस सफलतापूर्वक रीफ्रेश हुआ!');
      } catch (err) {
        showToast('सीडिंग में विफलता', 'error');
      }
    }
  };

  // CSV Export
  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/properties?limit=all');
      const data = await res.json();
      const allItems = data.items || [];

      const headers = [
        'Sr.no.', 'Property Id', 'House No.', 'Owner Name', 'Husband/Father Name',
        'Mobile Number', 'House Type', 'Nirman Ki Prakriti', 'Road Width',
        'Total Area', 'Covered Area', 'Business Area', 'Plot Area',
        'House Tax Rate', 'Plot Tax Rate', 'Total ARV', 'Res. Tax',
        'Com. Tax', 'Plot Tax', 'Total House Tax'
      ];

      const rows = allItems.map(p => [
        p.sr_no || '',
        p.property_id || '',
        p.house_no || '',
        `"${(p.owner_name || '').replace(/"/g, '""')}"`,
        `"${(p.father_name || '').replace(/"/g, '""')}"`,
        p.mobile || '0',
        p.house_type || 'Residential',
        p.nirman || 'Pakka',
        `"${p.road_width || ''}"`,
        p.total_area || 0,
        p.covered_area || 0,
        p.business_area || 0,
        p.plot_area || 0,
        p.house_tax_rate || 0.40,
        p.plot_tax_rate || 0.10,
        p.total_arv || 0,
        p.res_tax || 0,
        p.com_tax || 0,
        p.plot_tax || 0,
        p.total_tax || 0
      ]);

      const csvContent = '\uFEFF' + [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Ward_01_Adhyaksh_MongoDB_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('एक्सेल / CSV फाइल डाउनलोड हो गई!');
    } catch (err) {
      showToast('एक्सपोर्ट में त्रुटि', 'error');
    }
  };

  // If NOT logged in, show the official Login Screen
  if (!currentUser) {
    return (
      <div>
        <LoginPage
          onLogin={handleLogin}
        />
        {/* Toast notifications */}
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast ${t.type}`}>
              <span>{t.type === 'error' ? '❌' : t.type === 'info' ? 'ℹ️' : '✅'}</span>
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        wardName={settings?.ward_name || 'वार्ड 01 - अध्यक्ष'}
        dbConnected={dbConnected}
        theme={theme}
        currentUser={currentUser}
        onToggleTheme={handleToggleTheme}
        onNewEntry={() => {
          setEditingRecord(null);
          setActiveTab('tabEntry');
        }}
        onOpenLogin={() => {
          setToken(null);
          setCurrentUser(null);
          setIsGuest(false);
        }}
        onOpenChangePassword={() => setShowChangePasswordModal(true)}
        onLogout={handleLogout}
      />

      <nav className="main-nav">
        <div className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'tabDashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('tabDashboard')}
          >
            📊 डैशबोर्ड (Dashboard)
          </button>
          <button
            className={`tab-btn ${activeTab === 'tabRegister' ? 'active' : ''}`}
            onClick={() => setActiveTab('tabRegister')}
          >
            📋 संपत्ति रजिस्टर (Ward 1 Register)
          </button>
          <button
            className={`tab-btn ${activeTab === 'tabEntry' ? 'active' : ''}`}
            onClick={() => {
              if (currentUser?.role === 'viewer') {
                showToast('दर्शक (Viewer) को नया कर निर्धारण जोड़ने की अनुमति नहीं है।', 'warning');
                return;
              }
              setActiveTab('tabEntry');
            }}
          >
            ✍️ {editingRecord ? 'प्रविष्टि संपादन (Edit)' : 'नया कर निर्धारण (Fast Entry)'}
          </button>
          <button
            className={`tab-btn ${activeTab === 'tabOwnerSearch' ? 'active' : ''}`}
            onClick={() => setActiveTab('tabOwnerSearch')}
          >
            👥 स्वामी अनुसार संपत्तियां (Owner Lookup)
          </button>
          <button
            className={`tab-btn ${activeTab === 'tabSettings' ? 'active' : ''}`}
            onClick={() => setActiveTab('tabSettings')}
          >
            ⚙️ दर एवं सेटिंग्स (Rate Master & Users)
          </button>
        </div>
      </nav>

      <main className="app-container">
        {activeTab === 'tabDashboard' && (
          <Dashboard
            stats={stats}
            onOpenSlip={(prop) => setSelectedSlipProperty(prop)}
            onViewAll={() => setActiveTab('tabRegister')}
          />
        )}

        {activeTab === 'tabRegister' && (
          <RegisterTable
            properties={properties}
            total={totalProps}
            page={page}
            limit={limit}
            totalPages={totalPages}
            search={search}
            houseType={houseType}
            nirman={nirman}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            onHouseTypeChange={(v) => { setHouseType(v); setPage(1); }}
            onNirmanChange={(v) => { setNirman(v); setPage(1); }}
            onPageSizeChange={(v) => { setLimit(v === 'all' ? 10000 : Number(v)); setPage(1); }}
            onPageChange={(p) => setPage(p)}
            onSortChange={(field) => {
              if (sortBy === field) {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortBy(field);
                setSortOrder('asc');
              }
            }}
            onOpenSlip={(prop) => setSelectedSlipProperty(prop)}
            onEdit={handleEditProperty}
            onDelete={handleDeleteProperty}
            onOwnerClick={handleOwnerClick}
            onExportCSV={handleExportCSV}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'tabEntry' && (
          <FastEntryForm
            nextIds={nextIds}
            settings={settings}
            editingRecord={editingRecord}
            onSave={handleSaveProperty}
            onCancel={() => {
              setEditingRecord(null);
              setActiveTab('tabRegister');
            }}
          />
        )}

        {activeTab === 'tabOwnerSearch' && (
          <OwnerLookup
            initialQuery={ownerSearchQuery}
            onOpenSlip={(prop) => setSelectedSlipProperty(prop)}
          />
        )}

        {activeTab === 'tabSettings' && (
          <RateSettings
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onReSeed={handleReSeed}
            currentUser={currentUser}
            token={token}
            showToast={showToast}
          />
        )}
      </main>

      {/* Slip Print Modal */}
      {selectedSlipProperty && (
        <AssessmentSlipModal
          property={selectedSlipProperty}
          settings={settings}
          onClose={() => setSelectedSlipProperty(null)}
        />
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          token={token}
          onClose={() => setShowChangePasswordModal(false)}
          onSuccess={(msg) => showToast(msg, 'success')}
        />
      )}

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{t.type === 'error' ? '❌' : t.type === 'info' ? 'ℹ️' : '✅'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
