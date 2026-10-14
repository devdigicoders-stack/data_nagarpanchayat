import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Zap } from 'lucide-react';

export default function FastEntryForm({ 
  nextIds, 
  settings, 
  editingRecord, 
  onSave, 
  onCancel 
}) {
  const [formData, setFormData] = useState({
    property_id: '',
    house_no: '',
    owner_name: '',
    father_name: '',
    mobile: '',
    house_type: 'Residential',
    nirman: 'Pakka',
    road_width: '0 To 09',
    total_area: 600,
    covered_area: 600,
    business_area: 0,
    plot_area: 0,
    house_tax_rate: 0.40,
    plot_tax_rate: 0.10,
    commercial_tax_rate: 1.00,
    discount_percent: 20,
    tax_percent: 10
  });

  // Load next IDs or editing data
  useEffect(() => {
    if (editingRecord) {
      setFormData({
        ...editingRecord,
        total_area: Number(editingRecord.total_area) || 0,
        covered_area: Number(editingRecord.covered_area) || 0,
        business_area: Number(editingRecord.business_area) || 0,
        plot_area: Number(editingRecord.plot_area) || 0,
        house_tax_rate: Number(editingRecord.house_tax_rate) || 0.40,
        plot_tax_rate: Number(editingRecord.plot_tax_rate) || 0.10,
        commercial_tax_rate: Number(editingRecord.commercial_tax_rate) || 1.00,
        discount_percent: Number(editingRecord.discount_percent ?? 20),
        tax_percent: Number(editingRecord.tax_percent ?? 10)
      });
    } else {
      setFormData(prev => ({
        ...prev,
        property_id: nextIds?.nextPropId || '0903701001010369R',
        house_no: nextIds?.nextHouse || '10369',
        owner_name: '',
        father_name: '',
        mobile: '',
        house_type: settings?.sticky_house_type || 'Residential',
        nirman: settings?.sticky_nirman || 'Pakka',
        road_width: settings?.sticky_road_width || '0 To 09',
        total_area: 600,
        covered_area: 600,
        business_area: 0,
        plot_area: 0,
        house_tax_rate: getRateForNirman(settings?.sticky_nirman || 'Pakka', settings),
        plot_tax_rate: settings?.plot_rate || 0.10,
        commercial_tax_rate: settings?.commercial_rate || 1.00,
        discount_percent: settings?.default_discount_percent ?? 20,
        tax_percent: settings?.default_tax_percent ?? 10
      }));
    }
  }, [editingRecord, nextIds, settings]);

  function getRateForNirman(nirman, setts) {
    if (nirman === 'Pakka') return setts?.pakka_rate || 0.40;
    if (nirman === 'Ardh Pakka') return setts?.ardh_pakka_rate || 0.30;
    if (nirman === 'Kachcha') return setts?.kachcha_rate || 0.25;
    if (nirman === 'Plot') return setts?.plot_rate || 0.10;
    return 0.40;
  }

  const handleChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };

      if (field === 'nirman') {
        next.house_tax_rate = getRateForNirman(value, settings);
      }

      if (field === 'total_area') {
        const tot = Math.max(0, Number(value) || 0);
        if (!prev.covered_area || prev.covered_area === prev.total_area) {
          next.covered_area = tot;
        }
        next.plot_area = Math.max(0, tot - (Number(next.covered_area) || 0));
      }

      if (field === 'covered_area') {
        const tot = Math.max(0, Number(prev.total_area) || 0);
        const cov = Math.max(0, Number(value) || 0);
        next.plot_area = Math.max(0, tot - cov);
      }

      if (field === 'house_type') {
        let suffix = 'R';
        if (value === 'Plot') suffix = 'P';
        else if (value === 'Commercial') suffix = 'C';
        else if (value === 'Mixed') suffix = 'M';
        else if (value === 'Government') suffix = 'G';

        if (/[A-Z]$/i.test(prev.property_id)) {
          next.property_id = prev.property_id.slice(0, -1) + suffix;
        } else {
          next.property_id = prev.property_id + suffix;
        }
      }

      return next;
    });
  };

  const handleToggleSuffix = () => {
    setFormData(prev => {
      const val = prev.property_id.trim();
      let updated = val;
      if (val.endsWith('R')) {
        updated = val.slice(0, -1);
      } else if (val.endsWith('P') || val.endsWith('C') || val.endsWith('M') || val.endsWith('G')) {
        updated = val.slice(0, -1) + 'R';
      } else {
        updated = val + 'R';
      }
      return { ...prev, property_id: updated };
    });
  };

  const handle80Percent = () => {
    const tot = Math.max(0, Number(formData.total_area) || 0);
    const cov = Math.round(tot * 0.8);
    setFormData(prev => ({
      ...prev,
      covered_area: cov,
      plot_area: Math.max(0, tot - cov)
    }));
  };

  // Live calculation
  const totalArea = Math.max(0, Number(formData.total_area) || 0);
  const coveredArea = Math.max(0, Number(formData.covered_area) || 0);
  const businessArea = Math.max(0, Number(formData.business_area) || 0);
  const plotArea = Math.max(0, Number(formData.plot_area) || 0);

  const houseRate = Number(formData.house_tax_rate) || 0.40;
  const plotRate = Number(formData.plot_tax_rate) || 0.10;
  const comRate = Number(formData.commercial_tax_rate) || 1.00;
  const discountPct = Number(formData.discount_percent ?? 20);
  const taxPct = Number(formData.tax_percent ?? 10);

  const discountMultiplier = Math.max(0, 1 - (discountPct / 100));
  const resArea = Math.max(0, coveredArea - businessArea);

  const resMonthly = resArea * houseRate;
  const comMonthly = businessArea * comRate;
  const plotMonthly = plotArea * plotRate;
  const grossMonthly = resMonthly + comMonthly + plotMonthly;
  const grossARV = Math.round(grossMonthly * 12);

  const resARV = Math.round(resArea * discountMultiplier * houseRate * 12);
  const comARV = Math.round(businessArea * discountMultiplier * comRate * 12);
  const plotARV = Math.round(plotArea * discountMultiplier * plotRate * 12);
  const netARV = resARV + comARV + plotARV;
  const discountAmt = Math.max(0, grossARV - netARV);

  const finalTax = Math.round(netARV * (taxPct / 100));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="content-card">
      <div className="card-header">
        <div>
          <div className="card-title">
            {editingRecord ? `✏️ प्रविष्टि संपादन (क्र.सं. ${editingRecord.sr_no})` : '✍️ नया गृहकर निर्धारण एवं डेटा प्रविष्टि'}
          </div>
          <div className="card-desc">
            वार्ड 01 अध्यक्ष प्रारूप के अनुसार स्वतः आईडी जनरेशन एवं ऑटो-कैलकुलेटर (MongoDB Sync)
          </div>
        </div>
        <div>
          {editingRecord ? (
            <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>
              रद्द करें
            </button>
          ) : (
            <button 
              type="button" 
              className="btn btn-outline btn-sm" 
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  owner_name: '',
                  father_name: '',
                  mobile: '',
                  total_area: 600,
                  covered_area: 600,
                  business_area: 0,
                  plot_area: 0
                }));
              }}
            >
              <RotateCcw size={13} /> फॉर्म रीसेट
            </button>
          )}
        </div>
      </div>

      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            
            {/* Property ID */}
            <div className="form-group">
              <label className="form-label">
                <span>प्रॉपर्टी आईडी (Property ID)</span>
                <span className="badge-auto">स्वतः जनरेटेड</span>
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={formData.property_id}
                  onChange={(e) => handleChange('property_id', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleToggleSuffix}
                  title="पीछे 'R' लगाएं या हटाएं"
                  style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}
                >
                  ± R / Suffix
                </button>
              </div>
              <div className="form-note">अगला नंबर अपने आप आ जाता है। 'R' या अन्य कोड बदल सकते हैं।</div>
            </div>

            {/* House No */}
            <div className="form-group">
              <label className="form-label">हाउस नंबर (House No.)</label>
              <input
                type="text"
                className="form-control"
                value={formData.house_no}
                onChange={(e) => handleChange('house_no', e.target.value)}
                required
              />
              <div className="form-note">प्रॉपर्टी आईडी से लिंक्ड (उप-भाग होने पर /A, /B जोड़ें)</div>
            </div>

            {/* Owner Name */}
            <div className="form-group">
              <label className="form-label">भवन स्वामी का नाम (Owner Name)</label>
              <input
                type="text"
                className="form-control"
                placeholder="उदा. राम प्रसाद"
                value={formData.owner_name}
                onChange={(e) => handleChange('owner_name', e.target.value)}
                required
              />
            </div>

            {/* Father / Husband Name */}
            <div className="form-group">
              <label className="form-label">पिता / पति का नाम (Father / Husband)</label>
              <input
                type="text"
                className="form-control"
                placeholder="उदा. स्वर्गीय श्याम लाल"
                value={formData.father_name}
                onChange={(e) => handleChange('father_name', e.target.value)}
              />
            </div>

            {/* Mobile No */}
            <div className="form-group">
              <label className="form-label">मोबाइल नंबर (Mobile No.)</label>
              <input
                type="tel"
                className="form-control"
                placeholder="98XXXXXXXX या 0"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
              />
            </div>

            {/* House Type */}
            <div className="form-group">
              <label className="form-label">हाउस टाइप (House Type)</label>
              <select
                className="form-control"
                value={formData.house_type}
                onChange={(e) => handleChange('house_type', e.target.value)}
                required
              >
                <option value="Residential">Residential (आवासीय)</option>
                <option value="Commercial">Commercial (व्यावसायिक)</option>
                <option value="Mixed">Mixed (मिश्रित - रिहायशी + दुकान)</option>
                <option value="Plot">Plot (रिक्त भूखंड)</option>
                <option value="Government">Government (सरकारी / धार्मिक)</option>
              </select>
            </div>

            {/* Nirman Ki Prakriti (Sticky) */}
            <div className="form-group">
              <label className="form-label">
                <span>निर्माण की प्रकृति (Construction)</span>
                <span className="sticky-indicator"><Zap size={12} /> ऑटो-मेमोरी</span>
              </label>
              <select
                className="form-control"
                value={formData.nirman}
                onChange={(e) => handleChange('nirman', e.target.value)}
                required
              >
                <option value="Pakka">Pakka (पक्का - ₹0.40/sqft)</option>
                <option value="Ardh Pakka">Ardh Pakka (अर्ध-पक्का - ₹0.30/sqft)</option>
                <option value="Kachcha">Kachcha (कच्चा - ₹0.25/sqft)</option>
                <option value="Plot">Plot (भूखंड - ₹0.10/sqft)</option>
              </select>
              <div className="form-note">जब तक बदलेंगे नहीं, यह पिछली प्रविष्टि का मान ही दिखाएगा।</div>
            </div>

            {/* Road Width (Sticky) */}
            <div className="form-group">
              <label className="form-label">
                <span>सड़क की चौड़ाई (Road Width)</span>
                <span className="sticky-indicator"><Zap size={12} /> ऑटो-मेमोरी</span>
              </label>
              <select
                className="form-control"
                value={formData.road_width}
                onChange={(e) => handleChange('road_width', e.target.value)}
                required
              >
                <option value="0 To 09">0 To 09 फीट</option>
                <option value="09 To 12">09 To 12 फीट</option>
                <option value="12 To 24">12 To 24 फीट</option>
                <option value="24 To 40">24 To 40 फीट</option>
                <option value="40 Plus">&gt; 40 फीट</option>
              </select>
              <div className="form-note">गली बदलते समय ही इसे बदलने की आवश्यकता होगी।</div>
            </div>
          </div>

          {/* Area Details */}
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text-primary)' }}>
              📐 क्षेत्रफल विवरण (Area Details in Square Feet)
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">कुल क्षेत्रफल (Total Area)</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    step="1"
                    value={formData.total_area}
                    onChange={(e) => handleChange('total_area', e.target.value)}
                    required
                  />
                  <span className="input-addon">वर्ग फुट</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>कवर्ड एरिया (Covered Area)</span>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handle80Percent}
                    style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}
                  >
                    80% भरें
                  </button>
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    step="1"
                    value={formData.covered_area}
                    onChange={(e) => handleChange('covered_area', e.target.value)}
                    required
                  />
                  <span className="input-addon">वर्ग फुट</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">दुकान / बिजनेस एरिया (Business Area)</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    step="1"
                    value={formData.business_area}
                    onChange={(e) => handleChange('business_area', e.target.value)}
                  />
                  <span className="input-addon">वर्ग फुट</span>
                </div>
                <div className="form-note">मिश्रित/कमर्शियल संपत्ति होने पर भरें</div>
              </div>

              <div className="form-group">
                <label className="form-label">खुला / प्लॉट एरिया (Open Plot Area)</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    step="1"
                    value={formData.plot_area}
                    onChange={(e) => handleChange('plot_area', e.target.value)}
                  />
                  <span className="input-addon">वर्ग फुट</span>
                </div>
                <div className="form-note">कुल क्षेत्रफल - कवर्ड एरिया = स्वतः खाली भाग</div>
              </div>
            </div>
          </div>

          {/* Rates and Discount Overrides */}
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text-primary)' }}>
              ⚙️ टैक्स दरें एवं छूट विन्यास (Rates, Discount & Tax %)
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">हाउस टैक्स दर (रु./sqft/माह)</label>
                <input
                  type="number"
                  className="form-control"
                  step="0.01"
                  value={formData.house_tax_rate}
                  onChange={(e) => handleChange('house_tax_rate', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">प्लॉट टैक्स दर (रु./sqft/माह)</label>
                <input
                  type="number"
                  className="form-control"
                  step="0.01"
                  value={formData.plot_tax_rate}
                  onChange={(e) => handleChange('plot_tax_rate', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">कमर्शियल दर (रु./sqft/माह)</label>
                <input
                  type="number"
                  className="form-control"
                  step="0.01"
                  value={formData.commercial_tax_rate}
                  onChange={(e) => handleChange('commercial_tax_rate', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">छूट प्रतिशत (Discount %)</label>
                <select
                  className="form-control"
                  value={formData.discount_percent}
                  onChange={(e) => handleChange('discount_percent', Number(e.target.value))}
                >
                  <option value={0}>0% (कोई छूट नहीं)</option>
                  <option value={5}>5% छूट</option>
                  <option value={10}>10% छूट</option>
                  <option value={15}>15% छूट</option>
                  <option value={20}>20% छूट (मानक नियमानुसार)</option>
                  <option value={25}>25% छूट</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">गृहकर प्रतिशत (House Tax %)</label>
                <select
                  className="form-control"
                  value={formData.tax_percent}
                  onChange={(e) => handleChange('tax_percent', Number(e.target.value))}
                >
                  <option value={5}>5% कर दर</option>
                  <option value={7.5}>7.5% कर दर</option>
                  <option value={10}>10% कर दर (मानक नियमानुसार)</option>
                  <option value={12}>12% कर दर</option>
                  <option value={15}>15% कर दर</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Reactive Calculator Box */}
          <div className="live-calc-box">
            <div className="live-calc-header">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                🧮 लाइव गणना पूर्वावलोकन (Live Real-Time Tax Calculation)
              </h4>
              <span className="badge-auto" style={{ background: '#10b981', color: '#fff' }}>स्वतः गणना</span>
            </div>
            <div className="calc-steps-grid">
              <div className="calc-step-card">
                <div className="label">मासिक किराया मूल्य (Monthly Base)</div>
                <div className="val">₹{grossMonthly.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</div>
              </div>

              <div className="calc-step-card">
                <div className="label">12 महीने का कुल (Gross ARV)</div>
                <div className="val">₹{grossARV.toLocaleString('en-IN')}</div>
              </div>

              <div className="calc-step-card">
                <div className="label">लागू छूट राशि ({discountPct}%)</div>
                <div className="val" style={{ color: 'var(--danger)' }}>- ₹{discountAmt.toLocaleString('en-IN')}</div>
              </div>

              <div className="calc-step-card">
                <div className="label">शुद्ध मूल्यांकन (Net ARV)</div>
                <div className="val" style={{ color: 'var(--primary)' }}>₹{netARV.toLocaleString('en-IN')}</div>
              </div>

              <div className="calc-step-card highlight">
                <div className="label">कुल वार्षिक देय गृहकर (Annual Tax)</div>
                <div className="val">₹{finalTax.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
            {editingRecord && (
              <button type="button" className="btn btn-outline" onClick={onCancel}>
                रद्द करें
              </button>
            )}
            <button type="submit" className="btn btn-primary" style={{ minWidth: 180 }}>
              <Save size={15} />
              <span>{editingRecord ? 'बदलाव सुरक्षित करें (Update)' : 'सुरक्षित करें (Save Record)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
