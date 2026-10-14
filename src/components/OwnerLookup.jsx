import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Printer } from 'lucide-react';

export default function OwnerLookup({ initialQuery = '', onOpenSlip }) {
  const [query, setQuery] = useState(initialQuery);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      fetchOwnerGroups(initialQuery);
    }
  }, [initialQuery]);

  const fetchOwnerGroups = async (q) => {
    if (!q.trim()) {
      setGroups([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/owners/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (err) {
      console.error('Owner search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (val) => {
    setQuery(val);
    fetchOwnerGroups(val);
  };

  return (
    <div className="content-card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <UserCheck size={18} /> भवन स्वामी अनुसार संपत्तियां एवं संयुक्त मांग (Multi-Property Lookup)
          </div>
          <div className="card-desc">
            यदि एक व्यक्ति की कई संपत्तियां/प्रॉपर्टी आईडी हैं, तो उनका समेकित विवरण यहाँ देखें
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="search-box" style={{ marginBottom: '1.5rem' }}>
          <span className="search-icon"><Search size={16} /></span>
          <input
            type="text"
            className="form-control"
            placeholder="भवन स्वामी का नाम या मोबाइल नंबर टाइप करें (उदा. RAMRTAN, RAHMANTULLAH, BUDHESWAR)..."
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            लोड हो रहा है...
          </div>
        ) : groups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            {query.trim() ? `'${query}' के नाम पर कोई संपत्ति नहीं मिली।` : '🔎 स्वामी का नाम दर्ज करें या रजिस्टर से किसी नाम पर क्लिक करें।'}
          </div>
        ) : (
          groups.map((grp, idx) => (
            <div
              key={idx}
              className="content-card"
              style={{ marginBottom: '1.5rem', border: '1.5px solid var(--primary)' }}
            >
              <div className="card-header" style={{ background: 'var(--primary-light)' }}>
                <div>
                  <div className="card-title" style={{ color: 'var(--primary)' }}>
                    👤 {grp.owner_name}
                    <span className="badge-ward" style={{ background: 'var(--primary)', color: '#fff' }}>
                      {grp.properties.length} संपत्तियां दर्ज
                    </span>
                  </div>
                  <div className="card-desc">
                    पिता/पति: {grp.father_name || '---'} • मोबाइल: {grp.mobile || '---'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    समेकित कुल वार्षिक गृहकर मांग
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--success)' }}>
                    ₹{grp.totalTax.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>प्रॉपर्टी आईडी</th>
                      <th>हाउस नं.</th>
                      <th>हाउस टाइप</th>
                      <th>निर्माण</th>
                      <th>रोड विड्थ</th>
                      <th>कुल एरिया</th>
                      <th>कवर्ड एरिया</th>
                      <th>नेट ARV</th>
                      <th>वार्षिक गृहकर</th>
                      <th>पर्ची प्रिंट</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grp.properties.map(p => (
                      <tr key={p._id || p.property_id}>
                        <td><strong>{p.property_id}</strong></td>
                        <td>{p.house_no}</td>
                        <td>
                          <span className={`badge-type badge-${(p.house_type || 'residential').toLowerCase()}`}>
                            {p.house_type}
                          </span>
                        </td>
                        <td>{p.nirman}</td>
                        <td>{p.road_width}</td>
                        <td>{p.total_area} sqft</td>
                        <td>{p.covered_area} sqft</td>
                        <td>₹{(p.total_arv || 0).toLocaleString('en-IN')}</td>
                        <td><strong style={{ color: 'var(--success)' }}>₹{(p.total_tax || 0).toLocaleString('en-IN')}</strong></td>
                        <td>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => onOpenSlip(p)}
                          >
                            <Printer size={13} style={{ marginRight: 3 }} /> पर्ची
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
