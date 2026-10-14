import React from 'react';
import { Search, Download, Printer, Edit, Trash2 } from 'lucide-react';

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
  currentUser = null
}) {
  const startIdx = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  return (
    <div className="content-card">
      <div className="card-header">
        <div>
          <div className="card-title">📑 वार्ड 01 अध्यक्ष - संपूर्ण संपत्ति एवं गृहकर रजिस्टर</div>
          <div className="card-desc">MongoDB डेटाबेस • सर्च, फिल्टर, संपादन और 1-क्लिक प्रिंट पर्ची की सुविधा</div>
        </div>
        <div className="filters-group">
          <button className="btn btn-success btn-sm" onClick={onExportCSV}>
            <Download size={14} /> एक्सेल / CSV एक्सपोर्ट
          </button>
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

          <div className="filters-group">
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
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => onSortChange('sr_no')}>क्र.सं. ⬍</th>
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
              <th className="sortable" onClick={() => onSortChange('total_tax')}>कुल गृहकर (₹) ⬍</th>
              <th style={{ textAlign: 'center' }}>कार्यवाही</th>
            </tr>
          </thead>
          <tbody>
            {properties.length === 0 ? (
              <tr>
                <td colSpan="20" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  कोई रिकॉर्ड नहीं मिला।
                </td>
              </tr>
            ) : (
              properties.map(p => {
                const typeClass = (p.house_type || 'residential').toLowerCase();
                return (
                  <tr key={p._id || p.property_id}>
                    <td>{p.sr_no}</td>
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
                    <td>{p.road_width}</td>
                    <td>{p.total_area}</td>
                    <td>{p.covered_area}</td>
                    <td>{p.business_area || 0}</td>
                    <td>{p.plot_area || 0}</td>
                    <td>₹{p.house_tax_rate || 0.4}</td>
                    <td>₹{(p.total_arv || 0).toLocaleString('en-IN')}</td>
                    <td>₹{p.res_tax || 0}</td>
                    <td>₹{p.com_tax || 0}</td>
                    <td>₹{p.plot_tax || 0}</td>
                    <td><strong style={{ color: 'var(--success)' }}>₹{(p.total_tax || 0).toLocaleString('en-IN')}</strong></td>
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
