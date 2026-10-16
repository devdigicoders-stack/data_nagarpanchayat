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
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState('all');
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [totalProps, setTotalProps] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [houseType, setHouseType] = useState('');
  const [nirman, setNirman] = useState('');
  const [sortBy, setSortBy] = useState('sr_no');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loadingProperties, setLoadingProperties] = useState(false);

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

  const loadWards = async () => {
    try {
      const res = await fetch('/api/wards');
      const data = await res.json();
      if (res.ok) {
        setWards(data);
      }
    } catch (err) {
      console.error('Failed to load wards', err);
    }
  };

  const loadNextIds = async (wNo = selectedWard) => {
    try {
      const url = (wNo && wNo !== 'all') ? `/api/next-id?ward_no=${wNo}` : '/api/next-id';
      const res = await fetch(url);
      const data = await res.json();
      setNextIds(data);
    } catch (err) {
      console.error('Failed to load next IDs', err);
    }
  };

  const loadStats = async (wNo = selectedWard) => {
    try {
      const url = (wNo && wNo !== 'all') ? `/api/stats?ward_no=${wNo}` : '/api/stats';
      const res = await fetch(url);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  // Debounce search input to avoid race conditions and erratic API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(handler);
  }, [search]);

  const loadProperties = async () => {
    setLoadingProperties(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search: debouncedSearch,
        house_type: houseType,
        nirman,
        ward_no: selectedWard,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      const res = await fetch(`/api/properties?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.items || []);
        setTotalProps(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load properties', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  useEffect(() => {
    loadSettings();
    loadWards();
    loadNextIds();
  }, []);

  useEffect(() => {
    loadProperties();
    loadStats(selectedWard);
  }, [page, limit, debouncedSearch, houseType, nirman, sortBy, sortOrder, selectedWard]);

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

      const isEdit = Boolean(editingRecord);
      setEditingRecord(null);
      loadProperties();
      loadStats(selectedWard);
      const wardNo = saved.ward_no || formData.ward_no || 1;
      loadNextIds(wardNo);

      if (isEdit) {
        showToast(`प्रॉपर्टी ${saved.property_id} सफलतापूर्वक अपडेट हुई!`);
        setActiveTab('tabRegister');
      } else {
        showToast(`✅ नई प्रॉपर्टी (${saved.property_id} - ${saved.owner_name}) सुरक्षित हुई! अगला मकान दर्ज करें।`);
        setActiveTab('tabEntry');
      }
      return saved;
    } catch (err) {
      showToast(err.message, 'error');
      return null;
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

  // CSV Export with Ward & active filter selection
  const handleExportCSV = async (targetWardNo = selectedWard) => {
    try {
      const wardToExport = (targetWardNo !== undefined && targetWardNo !== null) ? targetWardNo : selectedWard;
      const exportParams = new URLSearchParams({
        limit: 'all',
        ...(wardToExport && wardToExport !== 'all' ? { ward_no: wardToExport } : {}),
        ...(houseType ? { house_type: houseType } : {}),
        ...(nirman ? { nirman } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {})
      });
      const res = await fetch(`/api/properties?${exportParams.toString()}`);
      const data = await res.json();
      const allItems = data.items || [];

      const headers = [
        'Ward', 'Sr.no.', 'Property Id', 'House No.', 'Owner Name', 'Husband/Father Name',
        'Mobile Number', 'House Type', 'Nirman Ki Prakriti', 'Road Width',
        'Total Area', 'Covered Area', 'Business Area', 'Plot Area',
        'House Tax Rate', 'Plot Tax Rate', 'Total ARV', 'Res. Tax',
        'Com. Tax', 'Plot Tax', 'Water Tax (7.5%)', 'Sewer Tax (2.5%)', 'Total House Tax'
      ];

      const rows = allItems.map(p => [
        `"${p.ward_name || `वार्ड ${p.ward_no || 1}`}"`,
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
        p.water_tax || 0,
        p.sewer_tax || 0,
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
      const wardLabel = (wardToExport === 'all') ? 'All_Wards' : `Ward_${wardToExport}`;
      a.download = `Palika_House_Tax_${wardLabel}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`एक्सेल / CSV फाइल (${wardToExport === 'all' ? 'सभी वार्ड' : `वार्ड ${wardToExport}`}) डाउनलोड हो गई!`);
    } catch (err) {
      showToast('एक्सपोर्ट में त्रुटि', 'error');
    }
  };

  // PDF / Print full register data
  const handleExportPDF = async (targetWardNo = selectedWard) => {
    try {
      showToast('संपूर्ण रजिस्टर पीडीएफ तैयार हो रहा है...', 'info');
      const wardToExport = (targetWardNo !== undefined && targetWardNo !== null) ? targetWardNo : selectedWard;
      const exportParams = new URLSearchParams({
        limit: 'all',
        ...(wardToExport && wardToExport !== 'all' ? { ward_no: wardToExport } : {}),
        ...(houseType ? { house_type: houseType } : {}),
        ...(nirman ? { nirman } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {})
      });
      const res = await fetch(`/api/properties?${exportParams.toString()}`);
      const data = await res.json();
      const allItems = data.items || [];

      if (allItems.length === 0) {
        showToast('पीडीएफ के लिए कोई रिकॉर्ड उपलब्ध नहीं है।', 'error');
        return;
      }

      // Determine Ward Display Name
      const targetWardObj = wards.find(w => String(w.ward_no) === String(wardToExport));
      const wardLabel = (wardToExport === 'all' || !wardToExport) 
        ? 'सभी वार्ड (संपूर्ण नगर निकाय)' 
        : (targetWardObj?.ward_name || `वार्ड ${String(wardToExport).padStart(2, '0')}`);

      const palikaName = settings?.palikaName || 'कार्यालय नगर पालिका परिषद / नगर पंचायत';
      const currentDate = new Date().toLocaleDateString('hi-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });

      // Calculate totals
      let sumARV = 0;
      let sumResTax = 0;
      let sumComTax = 0;
      let sumPlotTax = 0;
      let sumWaterTax = 0;
      let sumSewerTax = 0;
      let sumTotalTax = 0;

      allItems.forEach(p => {
        sumARV += Number(p.total_arv) || 0;
        sumResTax += Number(p.res_tax) || 0;
        sumComTax += Number(p.com_tax) || 0;
        sumPlotTax += Number(p.plot_tax) || 0;
        sumWaterTax += Number(p.water_tax) || 0;
        sumSewerTax += Number(p.sewer_tax) || 0;
        sumTotalTax += Number(p.total_tax) || 0;
      });

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showToast('पॉप-अप ब्लॉक हो गया है। कृपया ब्राउज़र सेटिंग्स में पॉप-अप की अनुमति दें।', 'error');
        return;
      }

      const rowsHtml = allItems.map(p => `
        <tr>
          <td style="text-align: center;">${p.sr_no || ''}</td>
          <td style="text-align: center; white-space: nowrap;">${p.ward_no ? `वार्ड ${String(p.ward_no).padStart(2, '0')}` : 'वार्ड 01'}</td>
          <td style="font-weight: 600;">${p.property_id || ''}</td>
          <td style="text-align: center;">${p.house_no || ''}</td>
          <td style="font-weight: 600;">${p.owner_name || ''}</td>
          <td>${p.father_name || ''}</td>
          <td style="text-align: center;">${p.mobile || ''}</td>
          <td style="text-align: center;">${p.house_type || ''}</td>
          <td style="text-align: center;">${p.nirman || ''}</td>
          <td style="text-align: right;">${p.total_area || 0}</td>
          <td style="text-align: right;">${p.covered_area || 0}</td>
          <td style="text-align: right;">₹${(Number(p.total_arv) || 0).toLocaleString('en-IN')}</td>
          <td style="text-align: right;">₹${(Number(p.res_tax) || 0).toLocaleString('en-IN')}</td>
          <td style="text-align: right;">₹${(Number(p.com_tax) || 0).toLocaleString('en-IN')}</td>
          <td style="text-align: right;">₹${(Number(p.plot_tax) || 0).toLocaleString('en-IN')}</td>
          <td style="text-align: right; color: #1d4ed8; font-weight: 600;">₹${(Number(p.water_tax) || 0).toLocaleString('en-IN')}</td>
          <td style="text-align: right; color: #15803d; font-weight: 600;">₹${(Number(p.sewer_tax) || 0).toLocaleString('en-IN')}</td>
          <td style="text-align: right; font-weight: 700; color: #047857;">₹${(Number(p.total_tax) || 0).toLocaleString('en-IN')}</td>
        </tr>
      `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="hi">
        <head>
          <meta charset="utf-8">
          <title>वार्षिक गृहकर रजिस्टर - ${wardLabel}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 7mm 6mm 10mm 6mm;
            }
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif;
              margin: 0;
              padding: 12px;
              color: #111827;
              background: #fff;
              font-size: 10px;
            }
            .no-print {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              padding: 10px 16px;
              margin-bottom: 12px;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0; }
              tr { page-break-inside: avoid; }
            }
            .header-box {
              text-align: center;
              border-bottom: 2px solid #1e3a8a;
              padding-bottom: 6px;
              margin-bottom: 8px;
            }
            .palika-title {
              font-size: 16px;
              font-weight: 800;
              color: #1e3a8a;
              letter-spacing: 0.5px;
            }
            .report-title {
              font-size: 12px;
              font-weight: 700;
              color: #374151;
              margin-top: 2px;
            }
            .meta-strip {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              font-weight: 600;
              color: #4b5563;
              margin-top: 4px;
              background: #f1f5f9;
              padding: 4px 10px;
              border-radius: 4px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9.5px;
            }
            th, td {
              border: 1px solid #94a3b8;
              padding: 3.5px 4.5px;
            }
            th {
              background-color: #f1f5f9;
              font-weight: 700;
              color: #0f172a;
              text-align: center;
              white-space: nowrap;
            }
            .totals-row td {
              background-color: #e2e8f0;
              font-weight: 800;
              border-top: 2px solid #0f172a;
            }
            .signatures-box {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
              padding: 0 40px;
              page-break-inside: avoid;
            }
            .sig-item {
              text-align: center;
              font-weight: 700;
              font-size: 10.5px;
              border-top: 1px dashed #64748b;
              padding-top: 5px;
              min-width: 150px;
            }
            .btn {
              cursor: pointer;
              padding: 7px 16px;
              font-weight: 700;
              border-radius: 6px;
              font-size: 13px;
              border: 1px solid #cbd5e1;
            }
            .btn-primary { background: #1e40af; color: #fff; border-color: #1e40af; }
            .btn-secondary { background: #f1f5f9; color: #1e293b; }
          </style>
        </head>
        <body>
          <div class="no-print">
            <div style="font-size: 13px; font-weight: 700; color: #1e3a8a;">
              📄 संपत्ति एवं वार्षिक गृहकर रजिस्टर (${allItems.length} संपत्तियां)
              <span style="font-size: 11px; font-weight: 500; color: #475569; margin-left: 10px;">
                💡 टिप: प्रिंट विंडो में 'Destination' में 'Save as PDF' चुनकर सीधे PDF फाइल डाउनलोड कर सकते हैं।
              </span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary" onclick="window.print()">🖨️ प्रिंट करें / Save as PDF</button>
              <button class="btn btn-secondary" onclick="window.close()">✕ बंद करें</button>
            </div>
          </div>

          <div class="header-box">
            <div class="palika-title">🏛️ ${palikaName}</div>
            <div class="report-title">वार्षिक गृहकर एवं संपत्ति कर निर्धारण संपूर्ण रजिस्टर (House Tax Register) • वित्तीय वर्ष 2026-27</div>
            <div class="meta-strip">
              <span><strong>📍 वार्ड:</strong> ${wardLabel}</span>
              <span><strong>कुल संपत्तियां:</strong> ${allItems.length}</span>
              <span><strong>वार्षिक ARV योग:</strong> ₹${sumARV.toLocaleString('en-IN')}</span>
              <span><strong>कुल मांग (Total Tax):</strong> ₹${sumTotalTax.toLocaleString('en-IN')}</span>
              <span><strong>दिनांक:</strong> ${currentDate}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>क्र.सं.</th>
                <th>वार्ड</th>
                <th>प्रॉपर्टी आईडी</th>
                <th>भवन नं.</th>
                <th>स्वामी का नाम</th>
                <th>पिता/पति का नाम</th>
                <th>मोबाइल</th>
                <th>प्रकार</th>
                <th>निर्माण</th>
                <th>कुल एरिया</th>
                <th>कवर्ड एरिया</th>
                <th>नेट ARV (₹)</th>
                <th>आवासीय (₹)</th>
                <th>कमर्शियल (₹)</th>
                <th>प्लॉट कर (₹)</th>
                <th style="color: #1d4ed8;">जल कर (7.5%)</th>
                <th style="color: #15803d;">सीवर कर (2.5%)</th>
                <th style="color: #047857;">कुल गृहकर (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="totals-row">
                <td colspan="11" style="text-align: right; padding-right: 10px;">कुल महायोग (Grand Total):</td>
                <td style="text-align: right;">₹${sumARV.toLocaleString('en-IN')}</td>
                <td style="text-align: right;">₹${sumResTax.toLocaleString('en-IN')}</td>
                <td style="text-align: right;">₹${sumComTax.toLocaleString('en-IN')}</td>
                <td style="text-align: right;">₹${sumPlotTax.toLocaleString('en-IN')}</td>
                <td style="text-align: right; color: #1d4ed8;">₹${sumWaterTax.toLocaleString('en-IN')}</td>
                <td style="text-align: right; color: #15803d;">₹${sumSewerTax.toLocaleString('en-IN')}</td>
                <td style="text-align: right; color: #047857; font-size: 10.5px;">₹${sumTotalTax.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <div class="signatures-box">
            <div class="sig-item">हस्ताक्षर कर संग्राहक / ऑपरेटर</div>
            <div class="sig-item">हस्ताक्षर राजस्व निरीक्षक / अधीक्षक</div>
            <div class="sig-item">हस्ताक्षर अधिशासी अधिकारी (EO) / प्रशासक</div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);

    } catch (err) {
      console.error('PDF export error:', err);
      showToast('पीडीएफ एक्सपोर्ट में त्रुटि', 'error');
    }
  };

  // If NOT logged in, show the official Login Screen
  if (!currentUser) {
    return (
      <div className="app-root-wrapper">
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

  const currentWardObj = wards.find(w => String(w.ward_no) === String(selectedWard));
  const currentWardName = selectedWard === 'all'
    ? 'सभी वार्ड'
    : (currentWardObj?.ward_name || `वार्ड ${String(selectedWard).padStart(2, '0')}`);

  return (
    <div className="app-root-wrapper">
      <Header
        wardName={currentWardName}
        wards={wards}
        selectedWard={selectedWard}
        onSelectWard={(wNo) => {
          setSelectedWard(wNo);
          setPage(1);
        }}
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
            📋 संपत्ति रजिस्टर ({selectedWard === 'all' ? 'सभी वार्ड' : `वार्ड ${selectedWard}`})
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
            ⚙️ दर, वार्ड एवं सेटिंग्स (Settings & Wards)
          </button>
        </div>
      </nav>

      <main className="app-container">
        {activeTab === 'tabDashboard' && (
          <Dashboard
            stats={stats}
            currentWardName={currentWardName}
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
            onSearchChange={(v) => setSearch(v)}
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
            onExportPDF={handleExportPDF}
            currentUser={currentUser}
            currentWardName={currentWardName}
            wards={wards}
            selectedWard={selectedWard}
            onWardChange={(wNo) => {
              setSelectedWard(wNo);
              setPage(1);
            }}
            onResetFilters={() => {
              setSearch('');
              setHouseType('');
              setNirman('');
              setSelectedWard('all');
              setPage(1);
            }}
            loading={loadingProperties}
          />
        )}

        {activeTab === 'tabEntry' && (
          <FastEntryForm
            nextIds={nextIds}
            settings={settings}
            editingRecord={editingRecord}
            wards={wards}
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
            wards={wards}
            onUpdateSettings={handleUpdateSettings}
            onReSeed={handleReSeed}
            currentUser={currentUser}
            token={token}
            showToast={showToast}
            onWardsUpdated={(updatedWards) => {
              setWards(updatedWards);
              loadStats(selectedWard);
              loadProperties();
            }}
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
