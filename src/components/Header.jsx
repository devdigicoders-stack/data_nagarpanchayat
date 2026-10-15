import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, PlusCircle, Database, User, LogOut, KeyRound, Shield, ChevronDown, LogIn } from 'lucide-react';

export default function Header({ 
  wardName = 'वार्ड 01 - अध्यक्ष', 
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
              <h1 className="brand-heading">डिजिटल गृहकर प्रबंधन प्रणाली</h1>
              <div className="brand-badges-row">
                <span className="badge-ward">{wardName}</span>
                <span className={`db-status-badge ${dbConnected ? 'connected' : 'disconnected'}`}>
                  <span className="db-dot" />
                  <Database size={13} style={{ marginLeft: 2 }} />
                  <span className="db-badge-text">{dbConnected ? 'MongoDB Atlas Live' : 'Connecting DB...'}</span>
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
            className="btn btn-outline btn-sm header-action-btn" 
            onClick={onToggleTheme} 
            title="थीम बदलें (Dark/Light)"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span className="btn-label">{theme === 'dark' ? 'लाइट मोड' : 'डार्क मोड'}</span>
          </button>
          
          {/* New Entry Button */}
          {currentUser?.role !== 'viewer' && (
            <button 
              className="btn btn-primary btn-sm header-action-btn" 
              onClick={onNewEntry}
            >
              <PlusCircle size={15} />
              <span className="btn-label">नई प्रविष्टि</span>
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
