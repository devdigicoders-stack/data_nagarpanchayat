import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, PlusCircle, Database, User, LogOut, KeyRound, Shield, ChevronDown, LogIn } from 'lucide-react';

export default function Header({ 
  wardName = 'वार्ड 01 - अध्यक्ष', 
  wards = [],
  selectedWard = 'all',
  onSelectWard,
  dbConnected = false, 
  theme = 'light', 
  currentUser = null,
  onToggleTheme, 
  onNewEntry,
  onOpenLogin,
  onOpenChangePassword,
  onLogout
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'अधिशासी अधिकारी (Admin)';
      case 'operator': return 'कर संग्राहक (Operator)';
      case 'viewer': return 'वार्ड अध्यक्ष (Viewer)';
      default: return 'कर्मचारी';
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'badge-role-admin';
      case 'operator': return 'badge-role-operator';
      case 'viewer': return 'badge-role-viewer';
      default: return '';
    }
  };

  return (
    <header className="top-header">
      <div className="header-inner">
        <div className="brand-section">
          <div className="brand-logo-badge">🏛️</div>
          <div className="brand-titles">
            <div className="brand-titles-main">
              <h1 className="brand-heading">
                डिजिटल गृहकर<span className="brand-heading-suffix"> प्रबंधन प्रणाली</span>
              </h1>
              <div className="brand-badges-row">
                {wards && wards.length > 0 ? (
                  <div className="ward-selector-badge" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <select
                      className="header-ward-select"
                      value={selectedWard}
                      onChange={(e) => onSelectWard && onSelectWard(e.target.value)}
                      title="वार्ड फ़िल्टर बदलें"
                      style={{
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        border: '1px solid var(--primary)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '2px 8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="all">🏛️ सभी वार्ड (All Wards)</option>
                      {wards.map(w => (
                        <option key={w.ward_no} value={w.ward_no}>
                          📍 वार्ड {String(w.ward_no).padStart(2, '0')} - {w.ward_name.replace(/^वार्ड\s*\d+\s*[-–]?\s*/i, '')} {w.property_count ? `(${w.property_count})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="badge-ward">{wardName}</span>
                )}
                <span className={`db-status-badge ${dbConnected ? 'connected' : 'disconnected'}`}>
                  <span className="db-dot" />
                  <Database size={11} className="db-icon" />
                  <span className="db-badge-text">{dbConnected ? 'Live' : 'Connecting...'}</span>
                </span>
              </div>
            </div>
            <p className="brand-subtext">
              नगर निकाय गृहकर (House Tax) एवं वार्षिक किराया मूल्य (ARV) निर्धारण पोर्टल • MERN Stack (React + Node.js + MongoDB)
            </p>
          </div>
        </div>

        <div className="header-actions">
          {/* Theme Toggle */}
          <button 
            className="btn btn-outline btn-sm header-action-btn theme-toggle-btn" 
            onClick={onToggleTheme} 
            title={theme === 'dark' ? 'लाइट मोड चालू करें' : 'डार्क मोड चालू करें'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span className="btn-label-desktop">{theme === 'dark' ? 'लाइट मोड' : 'डार्क मोड'}</span>
          </button>
          
          {/* New Entry Button */}
          {currentUser?.role !== 'viewer' && (
            <button 
              className="btn btn-primary btn-sm header-action-btn new-entry-btn" 
              onClick={onNewEntry}
              title="नया कर निर्धारण रिकॉर्ड दर्ज करें"
            >
              <PlusCircle size={15} />
              <span className="btn-label-desktop">नई प्रविष्टि</span>
              <span className="btn-label-mobile">प्रविष्टि</span>
            </button>
          )}

          {/* User Profile or Login Trigger */}
          {currentUser ? (
            <div className="user-profile-menu-container" ref={dropdownRef}>
              <button 
                className="user-profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                title="कर्मचारी प्रोफाइल एवं सेटिंग्स"
              >
                <div className="user-avatar-circle">
                  {currentUser.role === 'admin' ? '👑' : currentUser.role === 'operator' ? '💼' : '👤'}
                </div>
                <div className="user-btn-details">
                  <span className="user-btn-name">{currentUser.name || currentUser.username}</span>
                  <span className={`user-btn-role ${getRoleBadgeClass(currentUser.role)}`}>
                    {currentUser.role === 'admin' ? 'Admin (EO)' : currentUser.role === 'operator' ? 'Operator' : 'Viewer'}
                  </span>
                </div>
                <ChevronDown size={14} className={`chevron-icon ${dropdownOpen ? 'rotate' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="user-dropdown-card">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-avatar">
                      {currentUser.role === 'admin' ? '👑' : currentUser.role === 'operator' ? '💼' : '👤'}
                    </div>
                    <div className="user-dropdown-meta">
                      <div className="user-meta-name">{currentUser.name}</div>
                      <div className="user-meta-designation">{currentUser.designation || getRoleLabel(currentUser.role)}</div>
                      <div className="user-meta-username">@{currentUser.username}</div>
                    </div>
                  </div>

                  <div className="user-permissions-strip">
                    <Shield size={13} color="var(--primary)" />
                    <span>
                      {currentUser.role === 'admin' && 'पूर्ण अधिकार: दरें, संपादन, विलोपन व यूजर प्रबंधन'}
                      {currentUser.role === 'operator' && 'अधिकार: नई प्रविष्टि, संपादन एवं असेसमेंट पर्ची प्रिंट'}
                      {currentUser.role === 'viewer' && 'अधिकार: केवल अवलोकन, खोज एवं पर्ची प्रिंट'}
                    </span>
                  </div>

                  <div className="user-dropdown-actions">
                    <button 
                      className="user-action-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenChangePassword();
                      }}
                    >
                      <KeyRound size={15} />
                      <span>पासवर्ड बदलें (Change Password)</span>
                    </button>

                    <button 
                      className="user-action-item user-logout-action"
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                    >
                      <LogOut size={15} />
                      <span>लॉगआउट (Sign Out)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="btn btn-primary btn-sm" 
              onClick={onOpenLogin}
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <LogIn size={15} />
              <span>पोर्टल लॉगिन</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
