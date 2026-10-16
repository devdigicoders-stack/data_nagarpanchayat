import React from 'react';
import { Search, Download, Printer, Edit, Trash2, FileText } from 'lucide-react';

export default function RegisterTable({
  properties = [],
  total = 0,
  page = 1,
  limit = 25,
  totalPages = 1,
  search = '',
  houseType = '',
  nirman = '',
  sortBy = 'sr_no',
  sortOrder = 'asc',
  onSearchChange,
  onHouseTypeChange,
  onNirmanChange,
  onPageSizeChange,
  onPageChange,
  onSortChange,
  onOpenSlip,
  onEdit,
  onDelete,
  onOwnerClick,
  onExportCSV,
  onExportPDF,
  currentUser = null,
  currentWardName = 'सभी वार्ड',
  wards = [],
  selectedWard = 'all',
  onWardChange,
  onResetFilters,
  loading = false
}) {
  const [exportWard, setExportWard] = React.useState(selectedWard || 'all');

  React.useEffect(() => {
    setExportWard(selectedWard || 'all');
  }, [selectedWard]);

  const handleWardSelect = (wVal) => {
    setExportWard(wVal);
    if (onWardChange) {
      onWardChange(wVal);
    }
  };

  const hasActiveFilters = Boolean(
    (search && search.trim()) ||
    houseType ||
    nirman ||
    (selectedWard && selectedWard !== 'all')
  );

  const startIdx = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  return (
    <div className="content-card">
      <div className="card-header">
        <div>
          <div className="card-title">📑 {currentWardName} - संपूर्ण संपत्ति एवं गृहकर रजिस्टर</div>
          <div className="card-desc">MongoDB डेटाबेस • सर्च, फिल्टर, संपादन और 1-क्लिक प्रिंट पर्ची की सुविधा</div>
        </div>
        <div className="card-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-subtle)', padding: '3px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>वार्ड:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '3px 6px', fontSize: '0.82rem', fontWeight: 600, border: 'none', background: 'transparent', cursor: 'pointer' }}
              value={selectedWard}
              onChange={(e) => handleWardSelect(e.target.value)}
              title="वार्ड चुनें (डेटा फ़िल्टर एवं एक्सपोर्ट हेतु)"
            >
              <option value="all">📊 सभी वार्ड (संपूर्ण निकाय)</option>
              {wards && wards.map(w => (
                <option key={w.ward_no} value={w.ward_no}>
                  📍 वार्ड {String(w.ward_no).padStart(2, '0')} - {w.ward_name.replace(/^वार्ड\s*\d+\s*[-–]?\s*/i, '')} {w.property_count ? `(${w.property_count})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="btn btn-success btn-sm" 
            onClick={() => onExportCSV(selectedWard)}
            title="चयनित वार्ड/फ़िल्टर का एक्सेल/CSV डेटा डाउनलोड करें"
          >
            <Download size={14} /> एक्सेल / CSV एक्सपोर्ट
          </button>

          {onExportPDF && (
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => onExportPDF(selectedWard)}
              title="चयनित वार्ड/फ़िल्टर का संपूर्ण डेटा पीडीएफ (PDF) में निकालें या प्रिंट करें"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
            >
              <FileText size={14} /> 📄 पीडीएफ (PDF) / प्रिंट
            </button>
          )}
        </div>
      </div>

      <div className="card-body" style={{ paddingBottom: '0.5rem' }}>
        {/* Search & Filter Toolbar */}
        <div className="toolbar-container">
          <div className="search-box">
            <span className="search-icon"><Search size={16} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="नाम, मोबाइल, हाउस नं. या प्रॉपर्टी आईडी से खोजें..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="filters-group" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <select
              className="form-control"
              style={{ width: 'auto', fontWeight: 600 }}
              value={selectedWard}
              onChange={(e) => handleWardSelect(e.target.value)}
              title="वार्ड अनुसार फ़िल्टर करें"
            >
              <option value="all">📍 सभी वार्ड (All Wards)</option>
              {wards && wards.map(w => (
                <option key={w.ward_no} value={w.ward_no}>
                  वार्ड {String(w.ward_no).padStart(2, '0')} - {w.ward_name.replace(/^वार्ड\s*\d+\s*[-–]?\s*/i, '')} {w.property_count ? `(${w.property_count})` : ''}
                </option>
              ))}
            </select>

            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={houseType}
              onChange={(e) => onHouseTypeChange(e.target.value)}
            >
              <option value="">सभी हाउस टाइप</option>
              <option value="Residential">Residential (आवासीय)</option>
              <option value="Commercial">Commercial (व्यावसायिक)</option>
              <option value="Mixed">Mixed (मिश्रित)</option>
              <option value="Plot">Plot (भूखंड)</option>
              <option value="Government">Government (सरकारी)</option>
            </select>

            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={nirman}
              onChange={(e) => onNirmanChange(e.target.value)}
            >
              <option value="">सभी निर्माण प्रकार</option>
              <option value="Pakka">Pakka (पक्का)</option>
              <option value="Ardh Pakka">Ardh Pakka (अर्ध पक्का)</option>
              <option value="Kachcha">Kachcha (कच्चा)</option>
              <option value="Plot">Plot (खाली)</option>
            </select>

            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={limit}
              onChange={(e) => onPageSizeChange(e.target.value)}
            >
              <option value="15">15 प्रति पेज</option>
              <option value="25">25 प्रति पेज</option>
              <option value="50">50 प्रति पेज</option>
              <option value="100">100 प्रति पेज</option>
              <option value="all">सभी</option>
            </select>

            {hasActiveFilters && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  if (onResetFilters) onResetFilters();
                  if (onWardChange) onWardChange('all');
                }}
                title="सभी फ़िल्टर हटाएं"
                style={{ color: 'var(--danger)', borderColor: 'var(--border-color)', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontWeight: 600 }}
              >
                ✕ फ़िल्टर हटाएं
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => onSortChange('sr_no')}>क्र.सं. ⬍</th>
              <th>वार्ड</th>
              <th className="sortable" onClick={() => onSortChange('property_id')}>प्रॉपर्टी आईडी ⬍</th>
              <th className="sortable" onClick={() => onSortChange('house_no')}>हाउस नं. ⬍</th>
              <th className="sortable" onClick={() => onSortChange('owner_name')}>स्वामी का नाम ⬍</th>
              <th>पिता/पति का नाम</th>
              <th>मोबाइल नं.</th>
              <th>प्रकार</th>
              <th>निर्माण</th>
              <th>रोड विड्थ</th>
              <th className="sortable" onClick={() => onSortChange('total_area')}>कुल एरिया ⬍</th>
              <th>कवर्ड एरिया</th>
              <th>दुकान/व्यवसाय</th>
              <th>प्लॉट एरिया</th>
              <th>दर (₹)</th>
              <th className="sortable" onClick={() => onSortChange('total_arv')}>नेट ARV (₹) ⬍</th>
              <th>आवासीय कर</th>
              <th>कमर्शियल कर</th>
              <th>प्लॉट कर</th>
              <th className="sortable" onClick={() => onSortChange('water_tax')} style={{ color: '#1d4ed8' }}>जल कर (7.5%) ⬍</th>
              <th className="sortable" onClick={() => onSortChange('sewer_tax')} style={{ color: '#15803d' }}>सीवर कर (2.5%) ⬍</th>
              <th className="sortable" onClick={() => onSortChange('total_tax')}>कुल गृहकर (₹) ⬍</th>
              <th style={{ textAlign: 'center' }}>कार्यवाही</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="23" style={{ textAlign: 'center', padding: '3rem', color: 'var(--primary)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: '0.95rem', fontWeight: 600 }}>
                    <span style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    डेटा फ़िल्टर हो रहा है...
                  </div>
                </td>
              </tr>
            ) : properties.length === 0 ? (
              <tr>
                <td colSpan="23" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 6 }}>कोई रिकॉर्ड नहीं मिला</div>
                  <div style={{ fontSize: '0.85rem' }}>चयनित फ़िल्टर के अनुसार कोई संपत्ति डेटा उपलब्ध नहीं है।</div>
                  {hasActiveFilters && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        if (onResetFilters) onResetFilters();
                        if (onWardChange) onWardChange('all');
                      }}
                      style={{ marginTop: 12 }}
                    >
                      सभी फ़िल्टर हटाएं (Reset)
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              properties.map(p => {
                const typeClass = (p.house_type || 'residential').toLowerCase();
                return (
                  <tr key={p._id || p.property_id}>
                    <td>{p.sr_no}</td>
                    <td>
                      <span 
                        className="badge-ward" 
                        style={{ fontSize: '0.73rem', padding: '2px 6px', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => handleWardSelect(p.ward_no)}
                        title={`वार्ड ${p.ward_no} अनुसार फ़िल्टर करें`}
                      >
                        {p.ward_no ? `वार्ड ${String(p.ward_no).padStart(2, '0')}` : 'वार्ड 01'}
                      </span>
                    </td>
                    <td><strong>{p.property_id}</strong></td>
                    <td>{p.house_no}</td>
                    <td>
                      <a
                        href="#owner"
                        onClick={(e) => {
                          e.preventDefault();
                          onOwnerClick(p.owner_name);
                        }}
                        style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                      >
                        {p.owner_name}
                      </a>
                    </td>
                    <td>{p.father_name}</td>
                    <td>{p.mobile}</td>
                    <td><span className={`badge-type badge-${typeClass}`}>{p.house_type}</span></td>
                    <td>{p.nirman}</td>
                    <td>
                      <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {p.road_width ? (p.road_width.includes('To') ? p.road_width.replace('0 To 09', '0-9 मी.').replace('09 To 12', '9-12 मी.').replace('12 To 24', '12-24 मी.') : p.road_width) : '0-9 मी.'}
                      </span>
                    </td>
                    <td>{p.total_area}</td>
                    <td>{p.covered_area}</td>
                    <td>{p.business_area || 0}</td>
                    <td>{p.plot_area || 0}</td>
                    <td>₹{p.house_tax_rate || 0.4}</td>
                    <td>₹{(p.total_arv || 0).toLocaleString('en-IN')}</td>
                    <td>₹{p.res_tax || 0}</td>
                    <td>₹{p.com_tax || 0}</td>
                    <td>₹{p.plot_tax || 0}</td>
                    <td>
                      {Number(p.water_tax) > 0 ? (
                        <span style={{ color: '#1d4ed8', fontWeight: 600 }}>
                          ₹{Number(p.water_tax).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>₹0</span>
                      )}
                    </td>
                    <td>
                      {Number(p.sewer_tax) > 0 ? (
                        <span style={{ color: '#15803d', fontWeight: 600 }}>
                          ₹{Number(p.sewer_tax).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>₹0</span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--success)' }}>₹{(p.total_tax || 0).toLocaleString('en-IN')}</strong>
                      {(p.has_water_tax || p.has_sewer_tax) && (
                        <div style={{ fontSize: '0.68rem', marginTop: 2, display: 'flex', gap: 4 }}>
                          {p.has_water_tax && <span style={{ color: '#1d4ed8', fontWeight: 600 }}>🚰 जल</span>}
                          {p.has_sewer_tax && <span style={{ color: '#15803d', fontWeight: 600 }}>🚽 सीवर</span>}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onOpenSlip(p)}
                        title="गृहकर निर्धारण पर्ची"
                        style={{ marginRight: 4 }}
                      >
                        <Printer size={13} style={{ marginRight: 2 }} /> पर्ची
                      </button>
                      {currentUser?.role !== 'viewer' && (
                        <button
                          className="btn btn-outline btn-sm btn-icon-only"
                          onClick={() => onEdit(p)}
                          title="संपादित करें"
                          style={{ marginRight: 4 }}
                        >
                          <Edit size={13} />
                        </button>
                      )}
                      {currentUser?.role === 'admin' && (
                        <button
                          className="btn btn-outline btn-sm btn-icon-only"
                          onClick={() => onDelete(p)}
                          title="हटाएं (केवल एडमिन)"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="pagination-container">
        <div className="pagination-info">
          कुल {total} में से {startIdx}–{endIdx} प्रविष्टियाँ प्रदर्शित
        </div>

        {totalPages > 1 && (
          <div className="pagination-controls">
            {page > 1 && (
              <button className="page-num-btn" onClick={() => onPageChange(page - 1)}>
                ◀
              </button>
            )}

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pNum = page - 2 + i;
              if (pNum < 1) pNum = i + 1;
              if (pNum > totalPages) return null;
              return (
                <button
                  key={pNum}
                  className={`page-num-btn ${page === pNum ? 'active' : ''}`}
                  onClick={() => onPageChange(pNum)}
                >
                  {pNum}
                </button>
              );
            })}

            {page < totalPages && (
              <button className="page-num-btn" onClick={() => onPageChange(page + 1)}>
                ▶
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
