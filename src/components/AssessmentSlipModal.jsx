import React, { useEffect } from 'react';
import { X, Printer } from 'lucide-react';
import { numberToHindiWords } from '../utils/hindiWords';

export default function AssessmentSlipModal({ property, settings, onClose }) {
  useEffect(() => {
    document.body.classList.add('print-slip-active');
    return () => {
      document.body.classList.remove('print-slip-active');
    };
  }, []);

  if (!property) return null;

  const totalTax = Number(property.total_tax) || 0;
  const totalARV = Number(property.total_arv) || 0;
  const resTax = Number(property.res_tax) || 0;
  const comTax = Number(property.com_tax) || 0;
  const plotTax = Number(property.plot_tax) || 0;
  const houseTax = Number(property.house_tax) || (resTax + comTax + plotTax);

  const hasWaterTax = Boolean(property.has_water_tax);
  const waterTax = Number(property.water_tax) || (hasWaterTax ? Math.round(totalARV * 0.075) : 0);

  const hasSewerTax = Boolean(property.has_sewer_tax);
  const sewerTax = Number(property.sewer_tax) || (hasSewerTax ? Math.round(totalARV * 0.025) : 0);

  const totArea = Number(property.total_area) || 0;
  const covArea = Number(property.covered_area) || 0;
  const busArea = Number(property.business_area) || 0;
  const plotArea = Number(property.plot_area) || 0;

  const totLength = Number(property.total_length) || 0;
  const totWidth = Number(property.total_width) || 0;
  const covLength = Number(property.covered_length) || 0;
  const covWidth = Number(property.covered_width) || 0;
  const busLength = Number(property.business_length) || 0;
  const busWidth = Number(property.business_width) || 0;

  const words = numberToHindiWords(totalTax);
  const receiptNo = `HT/2026-27/${String(property.sr_no).padStart(4, '0')}`;
  const assessmentDate = new Date().toLocaleDateString('hi-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const formatRoadWidth = (rw) => {
    if (!rw) return '0 से 9 मीटर';
    if (rw === '0 To 09' || rw === '0 To 09 फीट') return '0 से 9 मीटर';
    if (rw === '09 To 12' || rw === '09 To 12 फीट') return '9 से 12 मीटर';
    if (rw === '12 To 24' || rw === '12 To 24 फीट') return '12 से 24 मीटर';
    if (rw === '24 To 40' || rw === '40 Plus') return '24 मीटर से अधिक';
    return rw;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontWeight: 700 }}>📄 गृहकर निर्धारण मांग पत्र / पर्ची</h3>
          <button className="btn btn-outline btn-sm btn-icon-only" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="assessment-slip">
            <div className="slip-header">
              <div className="slip-emblem">🏛️</div>
              <h2>{settings?.palika_name || 'कार्यालय नगर पालिका परिषद / नगर पंचायत'}</h2>
              <h3>गृहकर, जलकर एवं सीवर कर निर्धारण मांग पत्र (Assessment Notice)</h3>
              <p>{property.ward_name || settings?.ward_name || 'वार्ड 01 - अध्यक्ष'} • वित्तीय वर्ष: {settings?.financial_year || '2026–2027'}</p>
            </div>

            <div className="slip-meta-bar">
              <div>रसीद / मांग पत्र सं.: <strong>{receiptNo}</strong></div>
              <div>दिनांक: <strong>{assessmentDate}</strong></div>
            </div>

            <table className="slip-table">
              <tbody>
                <tr>
                  <th style={{ width: '25%' }}>प्रॉपर्टी आईडी (17 Chars)</th>
                  <td style={{ width: '25%' }}><strong>{property.property_id}</strong></td>
                  <th style={{ width: '25%' }}>हाउस नंबर (House No.)</th>
                  <td style={{ width: '25%' }}><strong>{property.house_no}</strong></td>
                </tr>
                <tr>
                  <th>भवन स्वामी का नाम</th>
                  <td><strong>{property.owner_name}</strong></td>
                  <th>पिता / पति का नाम</th>
                  <td>{property.father_name || 'AGYAT'}</td>
                </tr>
                <tr>
                  <th>मोबाइल नंबर</th>
                  <td>{property.mobile || '---'}</td>
                  <th>सड़क की चौड़ाई (Road Width)</th>
                  <td><strong>{formatRoadWidth(property.road_width)}</strong></td>
                </tr>
                <tr>
                  <th>हाउस टाइप (House Type)</th>
                  <td>
                    <span className={`badge-type badge-${(property.house_type || 'residential').toLowerCase()}`}>
                      {property.house_type}
                    </span>
                  </td>
                  <th>निर्माण की प्रकृति</th>
                  <td>{property.nirman} (दर: ₹{property.house_tax_rate || '0.40'}/sqft)</td>
                </tr>
              </tbody>
            </table>

            <div style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0.75rem 0 0.35rem', color: '#1e3a8a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📐 संपत्ति क्षेत्रफल माप एवं मूल्यांकन विवरण:</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#475569' }}>
                कुल प्लॉट: {totLength > 0 && totWidth > 0 ? `${totLength}′ × ${totWidth}′ = ` : ''}{totArea} sq.ft. | 
                कवर्ड: {covLength > 0 && covWidth > 0 ? `${covLength}′ × ${covWidth}′ = ` : ''}{covArea} sq.ft.
                {busArea > 0 ? ` | दुकान: ${busLength > 0 && busWidth > 0 ? `${busLength}′ × ${busWidth}′ = ` : ''}${busArea} sq.ft.` : ''}
              </span>
            </div>

            <table className="slip-table">
              <thead>
                <tr>
                  <th>विवरण (Description)</th>
                  <th>माप / कुल एरिया</th>
                  <th>मूल्यांकन दर</th>
                  <th>वार्षिक शुद्ध ARV (₹)</th>
                  <th>लागू कर दर</th>
                  <th>वार्षिक कर मांग (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>आवासीय भाग (Residential)</td>
                  <td>{Math.max(0, covArea - busArea)} वर्ग फुट</td>
                  <td>₹{property.house_tax_rate || '0.40'}/माह</td>
                  <td>₹{Math.round(resTax * (property.house_type?.toLowerCase() === 'government' ? 10/3 : 10)).toLocaleString('en-IN')}</td>
                  <td>{property.house_type?.toLowerCase() === 'government' ? '30% (तीन गुना)' : '10%'}</td>
                  <td>₹{resTax.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>व्यावसायिक / दुकान भाग (Commercial)</td>
                  <td>{busArea || (property.house_type?.toLowerCase() === 'commercial' ? covArea : 0)} वर्ग फुट</td>
                  <td>₹{property.commercial_tax_rate || '1.00'}/माह</td>
                  <td>₹{Math.round(comTax * 5).toLocaleString('en-IN')}</td>
                  <td>20% (दोगुना)</td>
                  <td>₹{comTax.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>रिक्त भूखंड भाग (Plot Area)</td>
                  <td>{plotArea} वर्ग फुट</td>
                  <td>₹{property.plot_tax_rate || '0.10'}/माह</td>
                  <td>₹{Math.round(plotTax * 10).toLocaleString('en-IN')}</td>
                  <td>10%</td>
                  <td>₹{plotTax.toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                  <td>मूल गृहकर योग (House Tax)</td>
                  <td>{totArea} वर्ग फुट</td>
                  <td>(20% नियमानुसार छूट समायोजित)</td>
                  <td>₹{totalARV.toLocaleString('en-IN')}</td>
                  <td>{property.house_type?.toLowerCase() === 'commercial' ? '20% (दोगुना)' : property.house_type?.toLowerCase() === 'government' ? '30% (तीन गुना)' : property.house_type?.toLowerCase() === 'mixed' ? 'मिश्रित दर' : '10%'}</td>
                  <td style={{ color: '#0369a1' }}>₹{houseTax.toLocaleString('en-IN')}</td>
                </tr>

                {/* Water Tax Row if active */}
                {hasWaterTax && (
                  <tr style={{ background: '#eff6ff' }}>
                    <td colSpan="2"><strong>🚰 जलकर (Water Tax - 7.5%)</strong></td>
                    <td colSpan="2">शुद्ध ARV (₹{totalARV.toLocaleString('en-IN')}) पर आधारित</td>
                    <td>7.5%</td>
                    <td style={{ color: '#1d4ed8', fontWeight: 700 }}>₹{waterTax.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {/* Sewer Tax Row if active */}
                {hasSewerTax && (
                  <tr style={{ background: '#f0fdf4' }}>
                    <td colSpan="2"><strong>🚽 सीवर कर (Sewer Tax - 2.5%)</strong></td>
                    <td colSpan="2">शुद्ध ARV (₹{totalARV.toLocaleString('en-IN')}) पर आधारित</td>
                    <td>2.5%</td>
                    <td style={{ color: '#15803d', fontWeight: 700 }}>₹{sewerTax.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {/* Grand Total Row */}
                {(hasWaterTax || hasSewerTax) && (
                  <tr style={{ background: '#e2e8f0', fontWeight: 800 }}>
                    <td colSpan="5">कुल वार्षिक मांग (गृहकर + जलकर + सीवर कर)</td>
                    <td style={{ color: 'var(--success)' }}>₹{totalTax.toLocaleString('en-IN')}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="slip-total-banner">
              <div>
                कुल देय वार्षिक कर मांग (Total Annual Tax Demand):
                <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#475569', marginTop: 2 }}>
                  अक्षरों में: <em>{words}</em>
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', color: '#059669', fontWeight: 800 }}>
                ₹{totalTax.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4, marginTop: '0.75rem' }}>
              नोट: 1. यह नोटिस उत्तर प्रदेश नगर पालिका अधिनियम के अंतर्गत जारी स्वकर / गृहकर निर्धारण का मांग पत्र है।<br />
              2. यदि उपरोक्त क्षेत्रफल या श्रेणी में कोई आपत्ति हो तो 15 दिवस के भीतर कार्यालय में साक्ष्य सहित प्रार्थना पत्र प्रस्तुत करें।
            </div>

            <div className="slip-signatures">
              <div className="slip-sign-box">
                भवन स्वामी / करदाता के हस्ताक्षर
              </div>
              <div className="slip-sign-box">
                राजस्व निरीक्षक / सर्वेक्षक
              </div>
              <div className="slip-sign-box">
                अधिशासी अधिकारी / अध्यक्ष<br />
                {property.ward_name || settings?.ward_name || 'वार्ड 01 - अध्यक्ष'}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            बंद करें
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={15} /> प्रिंट / PDF में सेव करें
          </button>
        </div>
      </div>
    </div>
  );
}
