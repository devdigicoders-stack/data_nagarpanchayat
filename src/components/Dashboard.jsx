import React from 'react';
import { Home, IndianRupee, TrendingUp, Building2, Printer, ArrowRight } from 'lucide-react';

export default function Dashboard({ stats, onOpenSlip, onViewAll }) {
  const {
    totalCount = 394,
    totalTax = 0,
    totalARV = 0,
    totalComTax = 0,
    typeBreakdown = [],
    topAssessments = []
  } = stats || {};

  const typeMap = {};
  typeBreakdown.forEach(item => {
    typeMap[item._id] = item;
  });

  const resCount = typeMap['Residential']?.count || 0;
  const resTax = typeMap['Residential']?.totalTax || 0;

  const comCount = typeMap['Commercial']?.count || 0;
  const comTax = typeMap['Commercial']?.totalTax || 0;

  const mixedCount = typeMap['Mixed']?.count || 0;
  const mixedTax = typeMap['Mixed']?.totalTax || 0;

  const plotCount = typeMap['Plot']?.count || 0;
  const plotTax = typeMap['Plot']?.totalTax || 0;

  const govtCount = typeMap['Government']?.count || 0;
  const govtTax = typeMap['Government']?.totalTax || 0;

  return (
    <div>
      {/* 4 Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-info">
            <div className="stat-label">
              <span className="label-full">कुल संपत्तियां (Total Properties)</span>
              <span className="label-short">कुल संपत्तियां</span>
            </div>
            <div className="stat-value">{totalCount.toLocaleString('en-IN')}</div>
            <div className="stat-sub">वार्ड 01 कुल सर्वे भवन</div>
          </div>
          <div className="stat-icon"><Home size={20} /></div>
        </div>

        <div className="stat-card green">
          <div className="stat-info">
            <div className="stat-label">
              <span className="label-full">कुल वार्षिक गृहकर मांग (Total Tax)</span>
              <span className="label-short">कुल गृहकर मांग</span>
            </div>
            <div className="stat-value">₹{totalTax.toLocaleString('en-IN')}</div>
            <div className="stat-sub">10% वार्षिक शुद्ध मांग</div>
          </div>
          <div className="stat-icon"><IndianRupee size={20} /></div>
        </div>

        <div className="stat-card amber">
          <div className="stat-info">
            <div className="stat-label">
              <span className="label-full">कुल वार्षिक मूल्यांकन (Gross ARV)</span>
              <span className="label-short">वार्षिक ARV</span>
            </div>
            <div className="stat-value">₹{totalARV.toLocaleString('en-IN')}</div>
            <div className="stat-sub">छूट से पूर्व किराया मूल्य</div>
          </div>
          <div className="stat-icon"><TrendingUp size={20} /></div>
        </div>

        <div className="stat-card purple">
          <div className="stat-info">
            <div className="stat-label">
              <span className="label-full">व्यावसायिक एवं मिश्रित (Com/Mixed)</span>
              <span className="label-short">व्यावसायिक / मिश्रित</span>
            </div>
            <div className="stat-value">{(comCount + mixedCount).toLocaleString('en-IN')}</div>
            <div className="stat-sub">मांग: ₹{(comTax + mixedTax).toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-icon"><Building2 size={20} /></div>
        </div>
      </div>

      {/* Property Type Breakdown */}
      <div className="content-card">
        <div className="card-header">
          <div>
            <div className="card-title">📌 वार्ड 01 संपत्ति वर्गीकरण एवं कर विश्लेषण</div>
            <div className="card-desc">आवासीय, व्यावसायिक, मिश्रित एवं रिक्त भूखंडों का सारांश (MongoDB Data)</div>
          </div>
        </div>
        <div className="card-body">
          <div className="calc-steps-grid">
            <div className="calc-step-card">
              <div className="label">🏡 आवासीय (Residential)</div>
              <div className="val" style={{ color: '#2563eb' }}>{resCount} भवन</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                मांग: ₹{resTax.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="calc-step-card">
              <div className="label">🏬 व्यावसायिक (Commercial)</div>
              <div className="val" style={{ color: '#dc2626' }}>{comCount} भवन</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                मांग: ₹{comTax.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="calc-step-card">
              <div className="label">🏪 मिश्रित (Mixed Use)</div>
              <div className="val" style={{ color: '#7c3aed' }}>{mixedCount} भवन</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                मांग: ₹{mixedTax.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="calc-step-card">
              <div className="label">📐 खाली भूखंड (Plot)</div>
              <div className="val" style={{ color: '#d97706' }}>{plotCount} भूखंड</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                मांग: ₹{plotTax.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="calc-step-card">
              <div className="label">🏛️ सरकारी / संस्था (Govt)</div>
              <div className="val" style={{ color: '#475569' }}>{govtCount} संपत्ति</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                मांग: ₹{govtTax.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Assessments Table */}
      <div className="content-card">
        <div className="card-header">
          <div className="card-title">⭐ प्रमुख कर निर्धारण संपत्तियां (Top Tax Assessments)</div>
          <button className="btn btn-outline btn-sm" onClick={onViewAll}>
            पूरा रजिस्टर देखें <ArrowRight size={14} />
          </button>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>क्र.सं.</th>
                <th>प्रॉपर्टी आईडी</th>
                <th>हाउस नं.</th>
                <th>स्वामी का नाम</th>
                <th>हाउस टाइप</th>
                <th>निर्माण</th>
                <th>कवर्ड एरिया</th>
                <th>नेट ARV (₹)</th>
                <th>वार्षिक गृहकर (₹)</th>
                <th>पर्ची</th>
              </tr>
            </thead>
            <tbody>
              {topAssessments.map(p => (
                <tr key={p._id || p.sr_no}>
                  <td>{p.sr_no}</td>
                  <td><strong>{p.property_id}</strong></td>
                  <td>{p.house_no}</td>
                  <td>{p.owner_name}</td>
                  <td>
                    <span className={`badge-type badge-${(p.house_type || 'residential').toLowerCase()}`}>
                      {p.house_type}
                    </span>
                  </td>
                  <td>{p.nirman}</td>
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
    </div>
  );
}
