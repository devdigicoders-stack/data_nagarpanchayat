import React, { useState, useEffect, useRef } from 'react';
import { Save, RotateCcw, Zap, ArrowRightCircle, PlusCircle, CheckCircle2, Building2, Layers } from 'lucide-react';

export default function FastEntryForm({ 
  nextIds, 
  settings, 
  editingRecord, 
  onSave, 
  onCancel,
  wards = []
}) {
  const [showWardDropdown, setShowWardDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ownerNameInputRef = useRef(null);

  const getSuffixForType = (type) => {
    switch (type) {
      case 'Residential': return 'R';
      case 'Commercial': return 'C';
      case 'Mixed': return 'M';
      case 'Plot': return 'P';
      case 'Government': return 'G';
      default: return 'R';
    }
  };

  const [formData, setFormData] = useState({
    ward_no: 1,
    ward_name: 'वार्ड 01 - अध्यक्ष',
    property_id: '',
    house_no: '',
    owner_name: '',
    father_name: '',
    mobile: '',
    house_type: 'Residential',
    nirman: 'Pakka',
    road_width: '0 से 9 मीटर',
    total_length: '',
    total_width: '',
    total_area: 600,
    covered_length: '',
    covered_width: '',
    covered_area: 600,
    floors_count: 1,
    floors: [
      { id: 1, name: 'भूतल (Ground Floor)', length: '', width: '', area: 600 }
    ],
    business_length: '',
    business_width: '',
    business_area: 0,
    plot_area: 0,
    house_tax_rate: 0.40,
    plot_tax_rate: 0.10,
    commercial_tax_rate: 1.00,
    discount_percent: 20,
    tax_percent: 10,
    has_water_tax: false,
    water_tax_percent: 7.5,
    has_sewer_tax: false,
    sewer_tax_percent: 2.5
  });

  function getRateForNirman(nirman, setts) {
    if (nirman === 'Pakka') return setts?.pakka_rate || 0.40;
    if (nirman === 'Ardh Pakka') return setts?.ardh_pakka_rate || 0.30;
    if (nirman === 'Kachcha') return setts?.kachcha_rate || 0.25;
    if (nirman === 'Plot') return setts?.plot_rate || 0.10;
    return 0.40;
  }

  // Load next IDs or editing data
  useEffect(() => {
    if (editingRecord) {
      setFormData({
        ...editingRecord,
        ward_no: editingRecord.ward_no || 1,
        ward_name: editingRecord.ward_name || 'वार्ड 01 - अध्यक्ष',
        road_width: editingRecord.road_width || '0 से 9 मीटर',
        total_length: editingRecord.total_length || '',
        total_width: editingRecord.total_width || '',
        total_area: Number(editingRecord.total_area) || 0,
        covered_length: editingRecord.covered_length || '',
        covered_width: editingRecord.covered_width || '',
        covered_area: Number(editingRecord.covered_area) || 0,
        floors_count: Number(editingRecord.floors_count) || (editingRecord.floors_data?.length || 1),
        floors: editingRecord.floors_data && editingRecord.floors_data.length > 0
          ? editingRecord.floors_data.map((f, i) => ({
              id: f.id || (i + 1),
              name: f.name || f.floor_name || (i === 0 ? 'भूतल (Ground Floor)' : `${i + 1}वीं मंजिल`),
              length: f.length || '',
              width: f.width || '',
              area: Number(f.area) || 0
            }))
          : [{ id: 1, name: 'भूतल (Ground Floor)', length: editingRecord.covered_length || '', width: editingRecord.covered_width || '', area: Number(editingRecord.covered_area) || 0 }],
        business_length: editingRecord.business_length || '',
        business_width: editingRecord.business_width || '',
        business_area: Number(editingRecord.business_area) || 0,
        plot_area: Number(editingRecord.plot_area) || 0,
        house_tax_rate: Number(editingRecord.house_tax_rate) || 0.40,
        plot_tax_rate: Number(editingRecord.plot_tax_rate) || 0.10,
        commercial_tax_rate: Number(editingRecord.commercial_tax_rate) || 1.00,
        discount_percent: Number(editingRecord.discount_percent ?? 20),
        tax_percent: Number(editingRecord.tax_percent ?? 10),
        has_water_tax: Boolean(editingRecord.has_water_tax),
        water_tax_percent: Number(editingRecord.water_tax_percent ?? 7.5),
        has_sewer_tax: Boolean(editingRecord.has_sewer_tax),
        sewer_tax_percent: Number(editingRecord.sewer_tax_percent ?? 2.5)
      });
    } else {
      const savedWardNo = Number(localStorage.getItem('sticky_active_ward_no')) || settings?.active_ward_no || 1;
      const defaultWard = wards.find(w => w.ward_no === savedWardNo) || wards[0];
      const targetWardNo = defaultWard?.ward_no || 1;
      const targetWardName = defaultWard?.ward_name || 'वार्ड 01 - अध्यक्ष';
      const houseType = settings?.sticky_house_type || 'Residential';

      setFormData(prev => ({
        ...prev,
        ward_no: targetWardNo,
        ward_name: targetWardName,
        property_id: nextIds?.nextPropId || '0903701001010369R',
        house_no: nextIds?.nextHouse || '10369',
        owner_name: '',
        father_name: '',
        mobile: '',
        house_type: houseType,
        nirman: settings?.sticky_nirman || 'Pakka',
        road_width: settings?.sticky_road_width || '0 से 9 मीटर',
        total_length: '',
        total_width: '',
        total_area: 600,
        covered_length: '',
        covered_width: '',
        covered_area: 600,
        floors_count: 1,
        floors: [{ id: 1, name: 'भूतल (Ground Floor)', length: '', width: '', area: 600 }],
        business_length: '',
        business_width: '',
        business_area: 0,
        plot_area: 0,
        house_tax_rate: getRateForNirman(settings?.sticky_nirman || 'Pakka', settings),
        plot_tax_rate: settings?.plot_rate || 0.10,
        commercial_tax_rate: settings?.commercial_rate || 1.00,
        discount_percent: settings?.default_discount_percent ?? 20,
        tax_percent: settings?.default_tax_percent ?? 10,
        has_water_tax: false,
        water_tax_percent: 7.5,
        has_sewer_tax: false,
        sewer_tax_percent: 2.5
      }));

      // If active ward is not ward 1, fetch proper ID for this ward
      if (targetWardNo !== 1 && (!nextIds || nextIds.ward_no !== targetWardNo)) {
        fetch(`/api/next-id?ward_no=${targetWardNo}&house_type=${houseType}`)
          .then(r => r.json())
          .then(data => {
            if (data.nextPropId) {
              setFormData(p => ({
                ...p,
                property_id: data.nextPropId,
                house_no: data.nextHouse
              }));
            }
          })
          .catch(err => console.error('Error fetching ward next ID', err));
      }
    }
  }, [editingRecord, nextIds, settings, wards]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };

      if (field === 'nirman') {
        next.house_tax_rate = getRateForNirman(value, settings);
      }

      if (field === 'total_area') {
        const tot = Math.max(0, Number(value) || 0);
        if (prev.house_type === 'Plot') {
          next.covered_area = 0;
          next.business_area = 0;
          next.plot_area = tot;
        } else {
          if (!prev.covered_area || prev.covered_area === prev.total_area) {
            next.covered_area = tot;
            if (next.floors && next.floors.length === 1) {
              next.floors = [{ ...next.floors[0], area: tot }];
            }
          }
          const gfArea = Number(next.floors?.[0]?.area) || tot;
          next.plot_area = Math.max(0, tot - gfArea);
        }
      }

      if (field === 'covered_area') {
        const tot = Math.max(0, Number(prev.total_area) || 0);
        const cov = Math.max(0, Number(value) || 0);
        const currentFloors = prev.floors && prev.floors.length > 0 ? prev.floors.map(f => ({ ...f })) : [{ id: 1, name: 'भूतल (Ground Floor)', length: '', width: '', area: cov }];
        if (currentFloors.length === 1) {
          currentFloors[0] = { ...currentFloors[0], area: cov };
        }
        const gfArea = Number(currentFloors[0]?.area) || cov;
        next.floors = currentFloors;
        next.plot_area = Math.max(0, tot - gfArea);
      }

      if (field === 'house_type') {
        const suffix = getSuffixForType(value);
        if (/[A-Z]$/i.test(prev.property_id)) {
          next.property_id = prev.property_id.slice(0, -1) + suffix;
        } else {
          next.property_id = prev.property_id + suffix;
        }

        if (value === 'Plot') {
          next.nirman = 'Plot';
          next.covered_area = 0;
          next.covered_length = '';
          next.covered_width = '';
          next.business_area = 0;
          next.business_length = '';
          next.business_width = '';
          next.plot_area = Number(next.total_area) || 0;
          next.floors_count = 0;
          next.floors = [];
        } else if (prev.house_type === 'Plot' && value !== 'Plot') {
          if (next.nirman === 'Plot') {
            next.nirman = 'Pakka';
          }
          const tot = Number(next.total_area) || 0;
          next.covered_area = tot;
          next.plot_area = 0;
          next.floors_count = 1;
          next.floors = [{ id: 1, name: 'भूतल (Ground Floor)', length: next.total_length || '', width: next.total_width || '', area: tot }];
        }
      }

      return next;
    });
  };

  // Total Area Dimension Handler (Length x Width)
  const handleTotalDimChange = (dim, val) => {
    setFormData(prev => {
      const next = { ...prev, [dim]: val };
      const l = Number(dim === 'total_length' ? val : prev.total_length);
      const w = Number(dim === 'total_width' ? val : prev.total_width);
      if (l > 0 && w > 0) {
        const calcArea = Math.round(l * w);
        next.total_area = calcArea;
        if (prev.house_type === 'Plot') {
          next.covered_area = 0;
          next.business_area = 0;
          next.plot_area = calcArea;
        } else {
          if (!prev.covered_area || prev.covered_area === prev.total_area) {
            next.covered_area = calcArea;
            if (next.floors && next.floors.length === 1) {
              next.floors = [{ ...next.floors[0], area: calcArea }];
            }
          }
          const gfArea = Number(next.floors?.[0]?.area) || (Number(next.covered_area) || 0);
          next.plot_area = Math.max(0, calcArea - gfArea);
        }
      }
      return next;
    });
  };

  // Floor templates for multi-story buildings (मंजिल)
  const floorNameTemplates = [
    'भूतल (Ground Floor)',
    'प्रथम तल (1st Floor)',
    'द्वितीय तल (2nd Floor)',
    'तृतीय तल (3rd Floor)',
    'चतुर्थ तल (4th Floor)',
    'पंचम तल (5th Floor)'
  ];

  const handleSetFloorCount = (count) => {
    const targetCount = Math.max(1, count);
    setFormData(prev => {
      const currentFloors = prev.floors && prev.floors.length > 0
        ? prev.floors.map(f => ({ ...f }))
        : [{ id: 1, name: 'भूतल (Ground Floor)', length: prev.covered_length || '', width: prev.covered_width || '', area: Number(prev.covered_area) || 0 }];

      const gf = currentFloors[0] || { id: 1, name: 'भूतल (Ground Floor)', length: '', width: '', area: Number(prev.covered_area) || 0 };
      let updated = [];

      if (targetCount <= currentFloors.length) {
        updated = currentFloors.slice(0, targetCount);
      } else {
        updated = [...currentFloors];
        for (let i = currentFloors.length; i < targetCount; i++) {
          const nextId = i + 1;
          const nextName = floorNameTemplates[i] || `${nextId}वीं मंजिल`;
          updated.push({
            id: nextId,
            name: nextName,
            length: gf.length || '',
            width: gf.width || '',
            area: Number(gf.area) || 0
          });
        }
      }

      const newCoveredArea = updated.reduce((sum, f) => sum + (Number(f.area) || 0), 0);
      const gfArea = Number(updated[0]?.area) || 0;
      const totArea = Number(prev.total_area) || 0;

      return {
        ...prev,
        floors_count: targetCount,
        floors: updated,
        covered_area: newCoveredArea,
        plot_area: Math.max(0, totArea - gfArea)
      };
    });
  };

  const handleAddFloor = () => {
    setFormData(prev => {
      const currentFloors = prev.floors && prev.floors.length > 0
        ? prev.floors.map(f => ({ ...f }))
        : [{ id: 1, name: 'भूतल (Ground Floor)', length: prev.covered_length || '', width: prev.covered_width || '', area: Number(prev.covered_area) || 0 }];
      const nextId = currentFloors.length + 1;
      const nextName = floorNameTemplates[currentFloors.length] || `${nextId}वीं मंजिल`;
      const gf = currentFloors[0] || {};

      const newFloor = {
        id: nextId,
        name: nextName,
        length: gf.length || '',
        width: gf.width || '',
        area: Number(gf.area) || 0
      };

      const updated = [...currentFloors, newFloor];
      const newCoveredArea = updated.reduce((sum, f) => sum + (Number(f.area) || 0), 0);
      const gfArea = Number(updated[0]?.area) || 0;
      const totArea = Number(prev.total_area) || 0;

      return {
        ...prev,
        floors_count: updated.length,
        floors: updated,
        covered_area: newCoveredArea,
        plot_area: Math.max(0, totArea - gfArea)
      };
    });
  };

  const handleRemoveFloor = (index) => {
    if (index === 0) return; // Cannot delete ground floor
    setFormData(prev => {
      const currentFloors = (prev.floors || []).map(f => ({ ...f }));
      const updated = currentFloors.filter((_, i) => i !== index);
      const newCoveredArea = updated.reduce((sum, f) => sum + (Number(f.area) || 0), 0);
      const gfArea = Number(updated[0]?.area) || 0;
      const totArea = Number(prev.total_area) || 0;

      return {
        ...prev,
        floors_count: updated.length,
        floors: updated,
        covered_area: newCoveredArea,
        plot_area: Math.max(0, totArea - gfArea)
      };
    });
  };

  const handleFloorChange = (index, field, val) => {
    setFormData(prev => {
      const currentFloors = prev.floors && prev.floors.length > 0 
        ? prev.floors.map(f => ({ ...f })) 
        : [{ id: 1, name: 'भूतल (Ground Floor)', length: '', width: '', area: 0 }];
      const target = { ...currentFloors[index], [field]: val };

      if (field === 'length' || field === 'width') {
        const l = Number(field === 'length' ? val : target.length);
        const w = Number(field === 'width' ? val : target.width);
        if (l > 0 && w > 0) {
          target.area = Math.round(l * w);
        }
      }

      currentFloors[index] = target;
      const newCoveredArea = currentFloors.reduce((sum, f) => sum + (Number(f.area) || 0), 0);
      const gfArea = Number(currentFloors[0]?.area) || 0;
      const totArea = Number(prev.total_area) || 0;

      const next = {
        ...prev,
        floors: currentFloors,
        covered_area: newCoveredArea,
        plot_area: Math.max(0, totArea - gfArea)
      };

      if (index === 0) {
        if (field === 'length') next.covered_length = val;
        if (field === 'width') next.covered_width = val;
      }

      return next;
    });
  };

  const handleCopyGfToFloor = (index) => {
    setFormData(prev => {
      const currentFloors = (prev.floors || []).map(f => ({ ...f }));
      const gf = currentFloors[0];
      if (!gf || !currentFloors[index]) return prev;
      currentFloors[index] = {
        ...currentFloors[index],
        length: gf.length,
        width: gf.width,
        area: gf.area
      };
      const newCoveredArea = currentFloors.reduce((sum, f) => sum + (Number(f.area) || 0), 0);
      return {
        ...prev,
        floors: currentFloors,
        covered_area: newCoveredArea
      };
    });
  };

  // Covered Area Dimension Handler (Length x Width) - delegates to ground floor
  const handleCoveredDimChange = (dim, val) => {
    handleFloorChange(0, dim === 'covered_length' ? 'length' : 'width', val);
  };

  // Business Area Dimension Handler (Length x Width)
  const handleBusinessDimChange = (dim, val) => {
    setFormData(prev => {
      const next = { ...prev, [dim]: val };
      const l = Number(dim === 'business_length' ? val : prev.business_length);
      const w = Number(dim === 'business_width' ? val : prev.business_width);
      if (l > 0 && w > 0) {
        const calcArea = Math.round(l * w);
        next.business_area = calcArea;
      }
      return next;
    });
  };

  const handleToggleSuffix = () => {
    setFormData(prev => {
      const val = prev.property_id.trim();
      const currentSuffix = getSuffixForType(prev.house_type);
      let updated = val;
      if (val.endsWith(currentSuffix)) {
        updated = val.slice(0, -currentSuffix.length);
      } else if (/[A-Z]$/i.test(val)) {
        updated = val.slice(0, -1) + currentSuffix;
      } else {
        updated = val + currentSuffix;
      }
      return { ...prev, property_id: updated };
    });
  };

  const handle80Percent = () => {
    const tot = Math.max(0, Number(formData.total_area) || 0);
    const cov = Math.round(tot * 0.8);
    setFormData(prev => {
      const currentFloors = prev.floors && prev.floors.length > 0 
        ? prev.floors.map((f, i) => i === 0 ? { ...f, area: cov } : { ...f }) 
        : [{ id: 1, name: 'भूतल (Ground Floor)', length: '', width: '', area: cov }];
      const newCoveredArea = currentFloors.reduce((sum, f) => sum + (Number(f.area) || 0), 0);
      return {
        ...prev,
        floors: currentFloors,
        covered_area: newCoveredArea,
        plot_area: Math.max(0, tot - cov)
      };
    });
  };

  // Live Calculations
  const isPlot = (formData.house_type || '').trim().toLowerCase() === 'plot';
  const totalArea = Math.max(0, Number(formData.total_area) || 0);
  const coveredArea = isPlot ? 0 : Math.max(0, Number(formData.covered_area) || 0);
  const businessArea = isPlot ? 0 : Math.max(0, Number(formData.business_area) || 0);
  const plotArea = isPlot ? totalArea : Math.max(0, Number(formData.plot_area) || 0);
  const groundFloorArea = isPlot ? 0 : (Number(formData.floors?.[0]?.area) || coveredArea);

  const houseRate = Number(formData.house_tax_rate) || 0.40;
  const plotRate = Number(formData.plot_tax_rate) || 0.10;
  const comRate = Number(formData.commercial_tax_rate) || 1.00;
  const discountPct = Number(formData.discount_percent ?? 20);
  const taxPct = Number(formData.tax_percent ?? 10);

  const discountMultiplier = Math.max(0, 1 - (discountPct / 100)); // Statutory 80% taxable base multiplier
  const resArea = Math.max(0, coveredArea - businessArea);

  // 80% Rule on Covered Area / Plot Area:
  // Tax is assessed on 80% of taxable area
  const taxableResArea = Math.round(resArea * discountMultiplier);
  const taxableBusinessArea = Math.round(businessArea * discountMultiplier);
  const taxablePlotArea = Math.round(plotArea * discountMultiplier);

  const resMonthly = taxableResArea * houseRate;
  const comMonthly = taxableBusinessArea * comRate;
  const plotMonthly = taxablePlotArea * plotRate;
  const grossMonthly = isPlot ? plotMonthly : (resMonthly + comMonthly + plotMonthly);
  const grossARV = Math.round(grossMonthly * 12);

  const resARV = isPlot ? 0 : Math.round(taxableResArea * houseRate * 12);
  const comARV = isPlot ? 0 : Math.round(taxableBusinessArea * comRate * 12);
  const plotARV = Math.round(taxablePlotArea * plotRate * 12);
  const netARV = isPlot ? plotARV : (resARV + comARV + plotARV);
  const discountAmt = Math.max(0, ((resArea * houseRate + businessArea * comRate + plotArea * plotRate) * 12) - netARV);

  // House Tax calculation based on property type:
  // Residential: 10% (1x)
  // Commercial: 20% (दोगुना - 2x)
  // Government: 30% (तीन गुना - 3x)
  // Mixed: Residential 10% + Commercial 20%
  // Plot: 10% (प्लॉट टैक्स)
  const houseTypeLower = (formData.house_type || 'Residential').trim().toLowerCase();
  
  let resTax = 0;
  let comTax = 0;
  let plotTax = Math.round(plotARV * (taxPct / 100));
  let taxRateNotice = '10%';

  if (houseTypeLower === 'plot') {
    taxRateNotice = '10% (प्लॉट टैक्स)';
    resTax = 0;
    comTax = 0;
    plotTax = Math.round(plotARV * (taxPct / 100));
  } else if (houseTypeLower === 'commercial') {
    taxRateNotice = '20% (दोगुना - 2x)';
    const commercialCoveredARV = resARV + comARV;
    comTax = Math.round(commercialCoveredARV * ((taxPct * 2) / 100));
    resTax = 0;
  } else if (houseTypeLower === 'government') {
    taxRateNotice = '30% (तीन गुना - 3x)';
    const govtCoveredARV = resARV + comARV;
    resTax = Math.round(govtCoveredARV * ((taxPct * 3) / 100));
    comTax = 0;
  } else if (houseTypeLower === 'mixed') {
    taxRateNotice = 'आवास 10% + दुकान 20%';
    resTax = Math.round(resARV * (taxPct / 100));
    comTax = Math.round(comARV * ((taxPct * 2) / 100));
  } else {
    taxRateNotice = '10%';
    resTax = Math.round(resARV * (taxPct / 100));
    comTax = Math.round(comARV * (taxPct / 100));
  }

  const houseTax = isPlot ? plotTax : (resTax + comTax + plotTax);

  // Water Tax (7.5%)
  const hasWaterTax = Boolean(formData.has_water_tax);
  const waterTaxPercent = Number(formData.water_tax_percent ?? 7.5);
  const waterTax = hasWaterTax ? Math.round(netARV * (waterTaxPercent / 100)) : 0;

  // Sewer Tax (2.5%)
  const hasSewerTax = Boolean(formData.has_sewer_tax);
  const sewerTaxPercent = Number(formData.sewer_tax_percent ?? 2.5);
  const sewerTax = hasSewerTax ? Math.round(netARV * (sewerTaxPercent / 100)) : 0;

  // Total Demand
  const finalTax = houseTax + waterTax + sewerTax;

  const handleWardSelect = async (wNo) => {
    const num = Number(wNo);
    const found = wards.find(w => w.ward_no === num);
    const wName = found ? found.ward_name : `वार्ड ${String(num).padStart(2, '0')}`;
    
    localStorage.setItem('sticky_active_ward_no', String(num));

    setFormData(prev => ({
      ...prev,
      ward_no: num,
      ward_name: wName
    }));

    if (!editingRecord) {
      try {
        const res = await fetch(`/api/next-id?ward_no=${num}&house_type=${formData.house_type}`);
        const data = await res.json();
        if (res.ok) {
          setFormData(prev => ({
            ...prev,
            property_id: data.nextPropId || prev.property_id,
            house_no: data.nextHouse || prev.house_no
          }));
        }
      } catch (err) {
        console.error('Failed to get next ID for ward', err);
      }
    }
  };

  // Submit Handler: supports regular Save or Save & Next
  const handleSubmit = async (e, isSaveAndNext = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    localStorage.setItem('sticky_active_ward_no', String(formData.ward_no));

    const isPlotSubmission = formData.house_type === 'Plot';
    const effectiveCoveredArea = isPlotSubmission ? 0 : coveredArea;
    const effectiveBusinessArea = isPlotSubmission ? 0 : businessArea;
    const effectivePlotArea = isPlotSubmission ? totalArea : plotArea;

    const floorsList = isPlotSubmission
      ? []
      : (formData.floors && formData.floors.length > 0
          ? formData.floors
          : [{ id: 1, name: 'भूतल (Ground Floor)', length: formData.covered_length || '', width: formData.covered_width || '', area: coveredArea }]);

    const submissionData = {
      ...formData,
      nirman: isPlotSubmission ? 'Plot' : formData.nirman,
      total_length: Number(formData.total_length) || 0,
      total_width: Number(formData.total_width) || 0,
      total_area: totalArea,
      covered_length: isPlotSubmission ? 0 : (Number(floorsList[0]?.length || formData.covered_length) || 0),
      covered_width: isPlotSubmission ? 0 : (Number(floorsList[0]?.width || formData.covered_width) || 0),
      covered_area: effectiveCoveredArea,
      floors_count: isPlotSubmission ? 0 : floorsList.length,
      floors_data: floorsList,
      business_length: isPlotSubmission ? 0 : (Number(formData.business_length) || 0),
      business_width: isPlotSubmission ? 0 : (Number(formData.business_width) || 0),
      business_area: effectiveBusinessArea,
      plot_area: effectivePlotArea,
      total_arv: netARV,
      res_tax: resTax,
      com_tax: comTax,
      plot_tax: plotTax,
      house_tax: houseTax,
      water_tax: waterTax,
      sewer_tax: sewerTax,
      total_tax: finalTax
    };

    try {
      const saved = await onSave(submissionData);

      if (isSaveAndNext) {
        // Fetch next ID for the active ward
        const currentWardNo = formData.ward_no || 1;
        const currentHouseType = formData.house_type || 'Residential';
        let newPropId = '';
        let newHouseNo = '';

        try {
          const res = await fetch(`/api/next-id?ward_no=${currentWardNo}&house_type=${currentHouseType}`);
          const data = await res.json();
          if (res.ok) {
            newPropId = data.nextPropId;
            newHouseNo = data.nextHouse;
          }
        } catch (fetchErr) {
          console.error('Next id fetch error', fetchErr);
        }

        // If fetch didn't return, fallback to numeric advance
        if (!newHouseNo) {
          const parsed = parseInt(String(formData.house_no).replace(/\D/g, ''), 10);
          newHouseNo = parsed ? String(parsed + 1) : '10370';
          const prefix = formData.property_id.slice(0, 11) || '09037010010';
          const suffix = getSuffixForType(currentHouseType);
          newPropId = `${prefix}${newHouseNo.padStart(5, '0')}${suffix}`;
        }

        // Reset fields for the next entry while preserving sticky settings
        setFormData(prev => ({
          ...prev,
          property_id: newPropId,
          house_no: newHouseNo,
          owner_name: '',
          father_name: '',
          mobile: '',
          total_length: '',
          total_width: '',
          total_area: '',
          covered_length: '',
          covered_width: '',
          covered_area: '',
          business_length: '',
          business_width: '',
          business_area: 0,
          plot_area: '',
          floors_count: prev.house_type === 'Plot' ? 0 : 1,
          floors: prev.house_type === 'Plot' ? [] : [{ id: 1, name: 'भूतल (Ground Floor)', length: '', width: '', area: 0 }]
        }));

        // Focus owner name for lightning-fast next entry
        setTimeout(() => {
          if (ownerNameInputRef.current) {
            ownerNameInputRef.current.focus();
          }
        }, 150);
      }
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="content-card">
      <div className="card-header">
        <div>
          <div className="card-title">
            {editingRecord ? `✏️ प्रविष्टि संपादन (क्र.सं. ${editingRecord.sr_no})` : '✍️ नया कर निर्धारण एवं डेटा प्रविष्टि'}
          </div>
          <div className="card-desc">
            {formData.ward_name} • स्वतः 17-अंक आईडी • लम्बाई × चौड़ाई कैलकुलेटर • जलकर/सीवर कर विकल्प
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
                  total_length: '',
                  total_width: '',
                  total_area: 600,
                  covered_length: '',
                  covered_width: '',
                  covered_area: 600,
                  business_length: '',
                  business_width: '',
                  business_area: 0,
                  plot_area: 0
                }));
                ownerNameInputRef.current?.focus();
              }}
            >
              <RotateCcw size={13} /> फॉर्म रीसेट
            </button>
          )}
        </div>
      </div>

      <div className="card-body">
        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="form-grid">
            
            {/* Ward Status Bar - Automatic & Sticky */}
            <div className="form-group" style={{ gridColumn: '1 / -1', background: 'var(--primary-light)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.25rem' }}>🏛️</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      सक्रिय प्रविष्टि वार्ड (Active Entry Ward):
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>
                        {formData.ward_name}
                      </strong>
                      <span className="badge-auto" style={{ background: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: '0.75rem' }}>
                        ✓ स्वतः लॉक (हर बार चुनने की आवश्यकता नहीं)
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  onClick={() => setShowWardDropdown(!showWardDropdown)}
                  style={{ background: 'var(--bg-card)', fontSize: '0.78rem', borderColor: 'var(--primary)' }}
                >
                  {showWardDropdown ? '✕ छिपाएं' : '🔁 दूसरा वार्ड चुनें'}
                </button>
              </div>

              {showWardDropdown && (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--primary)' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: 4 }}>
                    अन्य वार्ड चुनें (केवल तभी जब किसी दूसरे वार्ड में एंट्री करनी हो):
                  </label>
                  <select
                    className="form-control"
                    value={formData.ward_no}
                    onChange={(e) => {
                      handleWardSelect(e.target.value);
                      setShowWardDropdown(false);
                    }}
                    style={{ fontWeight: 600, fontSize: '0.9rem', background: 'var(--bg-card)' }}
                  >
                    {wards && wards.length > 0 ? (
                      wards.map(w => (
                        <option key={w.ward_no} value={w.ward_no}>
                          📍 वार्ड {String(w.ward_no).padStart(2, '0')} — {w.ward_name} {w.parshad_name ? `(पार्षद: ${w.parshad_name})` : ''}
                        </option>
                      ))
                    ) : (
                      <option value="1">📍 वार्ड 01 — अध्यक्ष</option>
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Property ID (16 Digits + 1 Letter = 17 Chars) */}
            <div className="form-group">
              <label className="form-label">
                <span>प्रॉपर्टी आईडी (17 अक्षर: 16 अंक + श्रेणी कोड)</span>
                <span className="badge-auto">17 Chars</span>
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={formData.property_id}
                  maxLength={17}
                  onChange={(e) => handleChange('property_id', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleToggleSuffix}
                  title="पीछे स्पेशल लेटर लगाएं या हटाएं"
                  style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}
                >
                  ± {getSuffixForType(formData.house_type)} / Suffix
                </button>
              </div>
              <div className="form-note">
                16 अंक + '{getSuffixForType(formData.house_type)}' (R-आवास, C-कमर्शियल, M-मिक्स, P-प्लॉट, G-सरकारी)
              </div>
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
              <label className="form-label">भवन स्वामी का नाम (Owner Name) *</label>
              <input
                ref={ownerNameInputRef}
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
                <option value="Residential">Residential (आवासीय - 10% कर दर)</option>
                <option value="Commercial">Commercial (व्यावसायिक - 20% दोगुना कर दर)</option>
                <option value="Mixed">Mixed (मिश्रित: दुकान + आवास - दुकान 20% कर दर)</option>
                <option value="Plot">Plot (रिक्त भूखंड - 10% कर दर)</option>
                <option value="Government">Government (सरकारी / संस्था - 30% तीन गुना कर दर)</option>
              </select>
              {formData.house_type === 'Commercial' && (
                <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600, marginTop: 4 }}>
                  ⚡ व्यावसायिक संपत्ति: नियमानुसार गृहकर दर सामान्य से दोगुनी (20%) लागू होगी।
                </div>
              )}
              {formData.house_type === 'Government' && (
                <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600, marginTop: 4 }}>
                  🏛️ सरकारी संपत्ति: नियमानुसार गृहकर दर सामान्य से तीन गुनी (30%) लागू होगी।
                </div>
              )}
              {formData.house_type === 'Mixed' && (
                <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600, marginTop: 4 }}>
                  🏪 मिश्रित संपत्ति: आवासीय भाग पर 10% एवं दुकान/व्यावसायिक भाग पर 20% लागू होगा।
                </div>
              )}
              {formData.house_type === 'Plot' && (
                <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600, marginTop: 4 }}>
                  🌱 रिक्त भूखंड (Plot): इसमें केवल कुल क्षेत्रफल भरना होगा, कवर्ड व खुला क्षेत्र आवश्यक नहीं है।
                </div>
              )}
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

            {/* Road Width in Meters (Sticky) */}
            <div className="form-group">
              <label className="form-label">
                <span>सड़क की चौड़ाई (Road Width in Meters)</span>
                <span className="sticky-indicator"><Zap size={12} /> ऑटो-मेमोरी</span>
              </label>
              <select
                className="form-control"
                value={formData.road_width}
                onChange={(e) => handleChange('road_width', e.target.value)}
                required
              >
                <option value="0 से 9 मीटर">0 से 9 मीटर (9 मीटर तक चौड़ी)</option>
                <option value="9 से 12 मीटर">9 से 12 मीटर तक चौड़ी</option>
                <option value="12 से 24 मीटर">12 से 24 मीटर तक चौड़ी</option>
                <option value="24 मीटर से अधिक">24 मीटर से अधिक चौड़ी</option>
                {/* Fallbacks for older DB entries */}
                <option value="0 To 09" style={{ display: 'none' }}>0 To 09</option>
                <option value="09 To 12" style={{ display: 'none' }}>09 To 12</option>
                <option value="12 To 24" style={{ display: 'none' }}>12 To 24</option>
                <option value="24 To 40" style={{ display: 'none' }}>24 To 40</option>
              </select>
              <div className="form-note">सड़क की चौड़ाई मानक मीटर में दर्ज है।</div>
            </div>
          </div>

          {/* Area Details with Length x Width Calculation */}
          <div style={{ marginTop: '1.5rem', background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                📐 {isPlot ? 'प्लॉट क्षेत्रफल विवरण (Plot Area Calculator)' : 'क्षेत्रफल विवरण एवं स्वतः कैलकुलेटर (Length × Width Calculator)'}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {isPlot 
                  ? 'रिक्त भूखंड के लिए केवल कुल क्षेत्रफल दर्ज करें' 
                  : 'लंबाई व चौड़ाई डालने पर कुल क्षेत्रफल स्वतः निकल जाता है'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isPlot ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              
              {/* Total Area Box */}
              <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{isPlot ? '1. कुल प्लॉट क्षेत्रफल (Total Plot Area)' : '1. कुल क्षेत्रफल (Total Area)'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isPlot && (
                      <span className="badge-auto" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', fontWeight: 700 }}>
                        🌱 केवल प्लॉट मोड (कोड: 'P')
                      </span>
                    )}
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>लंबाई × चौड़ाई</span>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>लंबाई (फीट)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="उदा. 30"
                      className="form-control"
                      value={formData.total_length}
                      onChange={(e) => handleTotalDimChange('total_length', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>चौड़ाई (फीट)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="उदा. 20"
                      className="form-control"
                      value={formData.total_width}
                      onChange={(e) => handleTotalDimChange('total_width', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{isPlot ? 'कुल प्लॉट क्षेत्रफल (वर्ग फुट) *' : 'कुल क्षेत्रफल (वर्ग फुट) *'}</span>
                    {formData.total_length > 0 && formData.total_width > 0 && (
                      <span className="badge-auto" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                        ✓ {formData.total_length} × {formData.total_width} = {totalArea}
                      </span>
                    )}
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      step="any"
                      value={formData.total_area}
                      onChange={(e) => handleChange('total_area', e.target.value)}
                      required
                      style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}
                    />
                    <span className="input-addon">वर्ग फुट</span>
                  </div>
                </div>

                {isPlot && (
                  <div style={{ fontSize: '0.76rem', color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '10px 12px', borderRadius: 'var(--radius-sm)', marginTop: 12 }}>
                    💡 <strong>प्लॉट कर नियम:</strong> रिक्त भूखंड होने पर कवर्ड क्षेत्र 0 रहता है। कुल <strong>{totalArea} वर्ग फुट</strong> के 80% भाग (<strong>{taxablePlotArea} sq.ft.</strong>) पर ₹{plotRate}/sqft की दर से स्वतः प्लॉट टैक्स (10%) की गणना होगी।
                  </div>
                )}
              </div>

              {/* Covered Area Box - Only when NOT Plot */}
              {!isPlot && (
                <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#059669', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Building2 size={16} />
                      <span>2. कवर्ड एरिया (Covered Area)</span>
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={handle80Percent}
                        style={{ padding: '2px 8px', fontSize: '0.72rem', borderColor: '#10b981', color: '#059669' }}
                        title="कुल क्षेत्रफल का 80% कवर्ड सेट करें"
                      >
                        ⚡ 80% भरें
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={handleAddFloor}
                        style={{ padding: '2px 8px', fontSize: '0.72rem', borderColor: '#0284c7', color: '#0284c7', background: '#f0f9ff' }}
                        title="एक और मंजिल जोड़ें"
                      >
                        + मंजिल जोड़ें
                      </button>
                    </div>
                  </div>

                  {/* Floor Count Buttons Bar */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '6px 10px', 
                    background: '#f8fafc', 
                    borderRadius: 'var(--radius-sm)', 
                    marginBottom: 12, 
                    border: '1px solid #e2e8f0',
                    flexWrap: 'wrap',
                    gap: 6
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Layers size={13} />
                        <span>मंजिलों की संख्या:</span>
                      </span>
                      <div style={{ display: 'inline-flex', borderRadius: 4, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                        {[1, 2, 3, 4].map(num => {
                          const active = (formData.floors?.length || 1) === num;
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => handleSetFloorCount(num)}
                              style={{
                                padding: '2px 9px',
                                fontSize: '0.72rem',
                                fontWeight: active ? 700 : 500,
                                background: active ? '#059669' : '#fff',
                                color: active ? '#fff' : '#334155',
                                border: 'none',
                                cursor: 'pointer',
                                borderRight: num < 4 ? '1px solid #cbd5e1' : 'none',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {num === 1 ? '1 मंजिल' : `${num} मंजिल`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {(formData.floors?.length || 1) > 1 && (
                      <span className="badge-auto" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem' }}>
                        बहुमंजिला ({formData.floors.length} मंजिलें)
                      </span>
                    )}
                  </div>

                  {/* Floor List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(formData.floors || [{ id: 1, name: 'भूतल (Ground Floor)', length: formData.covered_length || '', width: formData.covered_width || '', area: coveredArea }]).map((floor, idx) => (
                      <div 
                        key={floor.id || idx}
                        style={{ 
                          background: idx === 0 ? 'var(--bg-subtle, #f8fafc)' : '#f0fdf4', 
                          padding: '10px', 
                          borderRadius: 'var(--radius-sm)', 
                          border: idx === 0 ? '1px solid #e2e8f0' : '1px solid #bbf7d0' 
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: idx === 0 ? '#1e293b' : '#15803d', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span>🏢</span>
                            <span>{floor.name || `${idx + 1}वीं मंजिल`}</span>
                          </span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {idx > 0 && (
                              <button
                                type="button"
                                className="btn btn-outline btn-xs"
                                onClick={() => handleCopyGfToFloor(idx)}
                                style={{ padding: '1px 6px', fontSize: '0.68rem', borderColor: '#10b981', color: '#059669', background: '#fff' }}
                                title="भूतल की लंबाई व चौड़ाई कॉपी करें"
                              >
                                ⚡ भूतल के समान
                              </button>
                            )}
                            {idx > 0 && (
                              <button
                                type="button"
                                className="btn btn-outline btn-xs"
                                onClick={() => handleRemoveFloor(idx)}
                                style={{ padding: '1px 6px', fontSize: '0.68rem', borderColor: '#ef4444', color: '#dc2626', background: '#fff' }}
                                title="यह मंजिल हटाएं"
                              >
                                ✕ हटाएं
                              </button>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 6 }}>
                          <div>
                            <label className="form-label" style={{ fontSize: '0.72rem' }}>लंबाई (फीट)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder={idx === 0 ? "उदा. 24" : "लंबाई"}
                              className="form-control"
                              style={{ height: '32px', fontSize: '0.85rem' }}
                              value={floor.length || ''}
                              onChange={(e) => handleFloorChange(idx, 'length', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="form-label" style={{ fontSize: '0.72rem' }}>चौड़ाई (फीट)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder={idx === 0 ? "उदा. 20" : "चौड़ाई"}
                              className="form-control"
                              style={{ height: '32px', fontSize: '0.85rem' }}
                              value={floor.width || ''}
                              onChange={(e) => handleFloorChange(idx, 'width', e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569' }}>
                              {idx === 0 ? 'भूतल क्षेत्रफल (वर्ग फुट)' : `${floor.name} क्षेत्रफल (वर्ग फुट)`}
                            </span>
                            {floor.length > 0 && floor.width > 0 && (
                              <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 600 }}>
                                ✓ {floor.length} × {floor.width} = {floor.area} sq.ft.
                              </span>
                            )}
                          </div>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              min="0"
                              step="any"
                              value={floor.area ?? ''}
                              onChange={(e) => handleFloorChange(idx, 'area', e.target.value)}
                              required
                              style={{ fontWeight: 700, fontSize: '0.95rem', color: '#059669', height: '34px' }}
                            />
                            <span className="input-addon" style={{ fontSize: '0.75rem', padding: '0 8px' }}>वर्ग फुट</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Covered Area Banner */}
                  <div style={{ 
                    marginTop: 10, 
                    padding: '8px 12px', 
                    background: '#f0fdf4', 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1.5px solid #86efac' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>
                        {formData.floors && formData.floors.length > 1 
                          ? `🏢 कुल कवर्ड क्षेत्रफल (${formData.floors.length} मंजिलों का योग):` 
                          : 'कुल कवर्ड क्षेत्रफल:'}
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                        {coveredArea} वर्ग फुट
                      </span>
                    </div>
                    {formData.floors && formData.floors.length > 1 && (
                      <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 4 }}>
                        जोड़: {formData.floors.map((f, i) => `${f.name.split(' ')[0]}: ${f.area || 0}`).join(' + ')} = <strong>{coveredArea} sq.ft.</strong>
                      </div>
                    )}
                    <div style={{ fontSize: '0.73rem', color: '#059669', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>🏛️ 80% कर योग्य नियम: <strong>{taxableResArea + taxableBusinessArea} sq.ft.</strong> पर टैक्स लागू</span>
                      <span>(20% नियमानुसार छूट)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Plot Area / Open Ground Box - Only when NOT Plot */}
              {!isPlot && (
                <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#d97706', marginBottom: 8 }}>
                    3. खुला / प्लॉट एरिया (Open Area)
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>रिक्त प्लॉट क्षेत्रफल (वर्ग फुट)</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        step="any"
                        value={formData.plot_area}
                        onChange={(e) => handleChange('plot_area', e.target.value)}
                        style={{ fontWeight: 600 }}
                      />
                      <span className="input-addon">वर्ग फुट</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                    {formData.floors && formData.floors.length > 1 ? (
                      <>💡 <strong>स्वतः सूत्र:</strong> {totalArea} कुल प्लॉट - {groundFloorArea} भूतल = <strong>{plotArea} वर्ग फुट</strong> खुला प्लॉट (बहुमंजिला)</>
                    ) : (
                      <>💡 <strong>स्वतः सूत्र:</strong> {totalArea} कुल - {coveredArea} कवर्ड = <strong>{plotArea} वर्ग फुट</strong> खुला प्लॉट</>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Mixed Property Breakdown or Shop Calculator (Hidden for Plot) */}
          {!isPlot && (
            formData.house_type === 'Mixed' ? (
              <div style={{ marginTop: '1.25rem', padding: '16px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(59, 130, 246, 0.08))', border: '1.5px solid #f59e0b', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.3rem' }}>🏪</span>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#b45309' }}>
                        मिक्स प्रॉपर्टी (Mixed Property) - दुकान + आवास विभाजन
                      </strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        दुकान (व्यावसायिक) और रिहायशी आवास का अलग-अलग क्षेत्रफल और टैक्स गणना:
                      </div>
                    </div>
                  </div>
                  <span className="badge-auto" style={{ background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>
                    मिक्स मोड सक्रिय (कोड: 'M')
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  
                  {/* Shop / Commercial Portion */}
                  <div style={{ background: '#fff', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #fde68a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 700, margin: 0 }}>
                        🏪 दुकान / व्यावसायिक एरिया (Business Area) *
                      </label>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>लंबाई × चौड़ाई</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>लंबाई (फीट)</label>
                        <input
                          type="number"
                          step="any"
                          placeholder="उदा. 15"
                          className="form-control"
                          value={formData.business_length}
                          onChange={(e) => handleBusinessDimChange('business_length', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>चौड़ाई (फीट)</label>
                        <input
                          type="number"
                          step="any"
                          placeholder="उदा. 10"
                          className="form-control"
                          value={formData.business_width}
                          onChange={(e) => handleBusinessDimChange('business_width', e.target.value)}
                        />
                      </div>
                    </div>

                    <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>क्षेत्रफल (sq.ft.) *</span>
                      {formData.business_length > 0 && formData.business_width > 0 && (
                        <span className="badge-auto" style={{ background: '#fef3c7', color: '#92400e' }}>
                          ✓ {formData.business_length} × {formData.business_width} = {businessArea}
                        </span>
                      )}
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max={coveredArea}
                        step="any"
                        placeholder="दुकान का क्षेत्रफल"
                        value={formData.business_area}
                        onChange={(e) => handleChange('business_area', e.target.value)}
                        required
                        style={{ fontWeight: 700, color: '#b45309', fontSize: '1rem' }}
                      />
                      <span className="input-addon">sq.ft.</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      {businessArea > 0 ? (
                        <>कवर्ड {businessArea} sq.ft. का 80% = <strong>{taxableBusinessArea} sq.ft. कर योग्य</strong> • दर: ₹{comRate}/sqft • टैक्स: <strong>₹{comTax}</strong></>
                      ) : (
                        <>दर: ₹{comRate}/sqft • टैक्स: <strong>₹{comTax}</strong></>
                      )}
                    </div>
                  </div>

                  {/* Residential Portion (Auto-Calculated) */}
                  <div style={{ background: '#fff', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #bfdbfe' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                      <span>🏠 रिहायशी आवास भाग</span>
                      <span style={{ fontSize: '0.72rem', color: '#2563eb' }}>80% कर योग्य</span>
                    </label>
                    <div style={{ padding: '8px 10px', background: '#eff6ff', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#1e3a8a' }}>
                        {taxableResArea} वर्ग फुट
                      </span>
                      <span style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 600 }}>
                        (कुल कवर्ड {resArea} sq.ft. का 80%)
                      </span>
                    </div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: 5, lineHeight: 1.4 }}>
                      स्वतः: कवर्ड {resArea} sq.ft. का 80% = <strong>{taxableResArea} sq.ft.</strong> • दर: ₹{houseRate}/sqft • मासिक: ₹{resMonthly.toFixed(1)} • टैक्स: <strong style={{ color: '#1e40af' }}>₹{resTax}</strong>
                    </div>
                  </div>

                  {/* Plot Portion */}
                  <div style={{ background: '#fff', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #fed7aa' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', color: '#c2410c', fontWeight: 700 }}>
                      🌱 रिक्त प्लॉट भाग (Plot Area)
                    </label>
                    <div style={{ padding: '8px 10px', background: '#fff7ed', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '1.05rem', color: '#c2410c' }}>
                      {plotArea} वर्ग फुट
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      दर: ₹{plotRate}/sqft • टैक्स: <strong>₹{plotTax}</strong>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div style={{ marginTop: '1.25rem', background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#b45309', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    🏪 दुकान / बिजनेस एरिया (Business Area यदि कोई हो)
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    लंबाई × चौड़ाई कैलकुलेटर
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'flex-end' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>दुकान लंबाई (फीट)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="उदा. 15"
                      className="form-control"
                      value={formData.business_length}
                      onChange={(e) => handleBusinessDimChange('business_length', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>दुकान चौड़ाई (फीट)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="उदा. 10"
                      className="form-control"
                      value={formData.business_width}
                      onChange={(e) => handleBusinessDimChange('business_width', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>दुकान क्षेत्रफल (वर्ग फुट)</span>
                      {formData.business_length > 0 && formData.business_width > 0 && (
                        <span className="badge-auto" style={{ background: '#fef3c7', color: '#92400e' }}>
                          ✓ {formData.business_length} × {formData.business_width} = {businessArea}
                        </span>
                      )}
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        step="any"
                        value={formData.business_area}
                        onChange={(e) => handleChange('business_area', e.target.value)}
                        style={{ fontWeight: 700, color: '#b45309' }}
                      />
                      <span className="input-addon">वर्ग फुट</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                  💡 यदि संपत्ति में दुकान व आवास दोनों हैं, तो ऊपर <strong>हाउस टाइप में "Mixed"</strong> चुनें।
                </div>
              </div>
            )
          )}

          {/* Water & Sewer Tax Options (जल टैक्स 7.5% एवं सीवर टैक्स 2.5%) */}
          <div style={{ marginTop: '1.25rem', padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🚰 जलकर एवं सीवर कर विकल्प (Water & Sewer Tax Demand)</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  (डेटा इनपुट देने पर ही टैक्स मांग में दिखाई देगा)
                </span>
              </div>
              {(hasWaterTax || hasSewerTax) && (
                <span className="badge-auto" style={{ background: '#dcfce7', color: '#166534' }}>
                  अतिरिक्त कर लागू: +₹{waterTax + sewerTax}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              
              {/* Water Tax Checkbox */}
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                padding: '10px 14px', 
                background: formData.has_water_tax ? '#eff6ff' : 'var(--bg-card)', 
                border: formData.has_water_tax ? '1.5px solid #3b82f6' : '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)', 
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}>
                <input
                  type="checkbox"
                  checked={formData.has_water_tax}
                  onChange={(e) => handleChange('has_water_tax', e.target.checked)}
                  style={{ width: 20, height: 20, cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: formData.has_water_tax ? '#1d4ed8' : 'inherit', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🚰 जलकर (Water Tax - 7.5%)</span>
                    {formData.has_water_tax && <span style={{ color: '#1d4ed8' }}>₹{waterTax}</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    शुद्ध मूल्यांकन (Net ARV ₹{netARV}) का 7.5%
                  </div>
                </div>
              </label>

              {/* Sewer Tax Checkbox */}
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                padding: '10px 14px', 
                background: formData.has_sewer_tax ? '#f0fdf4' : 'var(--bg-card)', 
                border: formData.has_sewer_tax ? '1.5px solid #10b981' : '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)', 
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}>
                <input
                  type="checkbox"
                  checked={formData.has_sewer_tax}
                  onChange={(e) => handleChange('has_sewer_tax', e.target.checked)}
                  style={{ width: 20, height: 20, cursor: 'pointer', accentColor: '#10b981' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: formData.has_sewer_tax ? '#15803d' : 'inherit', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🚽 सीवर कर (Sewer Tax - 2.5%)</span>
                    {formData.has_sewer_tax && <span style={{ color: '#15803d' }}>₹{sewerTax}</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    शुद्ध मूल्यांकन (Net ARV ₹{netARV}) का 2.5%
                  </div>
                </div>
              </label>

            </div>
          </div>

          {/* Rates and Discount Overrides */}
          <div style={{ marginTop: '1.25rem' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>
              ⚙️ लागू कर दरें एवं छूट विन्यास (Rates, Discount & Tax %)
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
          <div className="live-calc-box" style={{ marginTop: '1.25rem' }}>
            <div className="live-calc-header">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                🧮 लाइव गणना पूर्वावलोकन (Real-Time Municipal Tax Calculation)
              </h4>
              <span className="badge-auto" style={{ background: '#10b981', color: '#fff' }}>
                स्वतः गणना
              </span>
            </div>
            <div className="calc-steps-grid">
              {isPlot ? (
                <>
                  <div className="calc-step-card" style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
                    <div className="label" style={{ color: '#0369a1' }}>🌱 कर योग्य प्लॉट भाग (80%)</div>
                    <div className="val" style={{ color: '#0284c7' }}>{taxablePlotArea} sq.ft.</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      कुल प्लॉट: {totalArea} sq.ft. (20% छूट)
                    </div>
                  </div>

                  <div className="calc-step-card">
                    <div className="label">मासिक आधार किराया (@ ₹{plotRate})</div>
                    <div className="val">₹{plotMonthly.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {taxablePlotArea} sq.ft. × ₹{plotRate}/sqft
                    </div>
                  </div>

                  <div className="calc-step-card">
                    <div className="label">वार्षिक शुद्ध मूल्यांकन (Annual ARV)</div>
                    <div className="val" style={{ color: 'var(--primary)' }}>₹{netARV.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      12 महीने का वार्षिक मूल्य
                    </div>
                  </div>

                  <div className="calc-step-card">
                    <div className="label">प्लॉट टैक्स (Plot Tax - 10%)</div>
                    <div className="val" style={{ color: '#059669' }}>₹{plotTax.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      ARV का 10% (कोड: 'P')
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="calc-step-card">
                    <div className="label">कर योग्य कवर्ड भाग (80%)</div>
                    <div className="val" style={{ color: '#059669' }}>{taxableResArea + taxableBusinessArea} sq.ft.</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      कुल कवर्ड: {coveredArea} sq.ft.
                    </div>
                  </div>

                  <div className="calc-step-card">
                    <div className="label">मासिक आधार किराया (Monthly Base)</div>
                    <div className="val">₹{grossMonthly.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      80% कर योग्य एरिया × दर
                    </div>
                  </div>

                  <div className="calc-step-card">
                    <div className="label">वार्षिक शुद्ध मूल्यांकन (Annual ARV)</div>
                    <div className="val" style={{ color: 'var(--primary)' }}>₹{netARV.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      12 महीने का वार्षिक मूल्य
                    </div>
                  </div>

                  <div className="calc-step-card">
                    <div className="label">गृहकर (House Tax - {taxRateNotice})</div>
                    <div className="val">₹{houseTax.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      ARV पर लागू कर
                    </div>
                  </div>
                </>
              )}

              {/* Water Tax Step Card (Shown only if checked) */}
              {hasWaterTax && (
                <div className="calc-step-card" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
                  <div className="label" style={{ color: '#1d4ed8' }}>🚰 जलकर (Water 7.5%)</div>
                  <div className="val" style={{ color: '#1d4ed8' }}>₹{waterTax.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '0.7rem', color: '#1d4ed8', marginTop: 2 }}>ARV का 7.5%</div>
                </div>
              )}

              {/* Sewer Tax Step Card (Shown only if checked) */}
              {hasSewerTax && (
                <div className="calc-step-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <div className="label" style={{ color: '#15803d' }}>🚽 सीवर कर (Sewer 2.5%)</div>
                  <div className="val" style={{ color: '#15803d' }}>₹{sewerTax.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '0.7rem', color: '#15803d', marginTop: 2 }}>ARV का 2.5%</div>
                </div>
              )}

              <div className="calc-step-card highlight">
                <div className="label">
                  कुल वार्षिक कर मांग {hasWaterTax || hasSewerTax ? '(गृहकर + अतिरिक्त कर)' : '(Annual House Tax)'}
                </div>
                <div className="val">₹{finalTax.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '0.7rem', color: '#15803d', marginTop: 2 }}>वार्षिक देय राशि</div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Save & Next (सेव एंड अगला भरें) vs Regular Save */}
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            {editingRecord ? (
              <>
                <button type="button" className="btn btn-outline" onClick={onCancel} disabled={isSubmitting}>
                  रद्द करें
                </button>
                <button type="submit" className="btn btn-primary" style={{ minWidth: 200 }} disabled={isSubmitting}>
                  <Save size={15} />
                  <span>{isSubmitting ? 'सुरक्षित हो रहा है...' : 'बदलाव सुरक्षित करें (Update)'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={isSubmitting}
                  style={{ minWidth: 150 }}
                  title="सुरक्षित करें और रजिस्टर पर जाएं"
                >
                  <Save size={15} />
                  <span>केवल सुरक्षित करें</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isSubmitting}
                  style={{ minWidth: 240, padding: '0.65rem 1.4rem', fontSize: '0.95rem', fontWeight: 700, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: '#059669', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}
                  title="डेटा सेव करके तुरंत अगली प्रविष्टि हेतु फॉर्म ब्लैंक करें"
                >
                  <PlusCircle size={17} />
                  <span>{isSubmitting ? 'सुरक्षित हो रहा है...' : '💾 सुरक्षित करें एवं अगला भरें (Save & Next)'}</span>
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
