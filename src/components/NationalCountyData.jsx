// components/NationalCountyData.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './NationalCountyData.css';

const NationalCountyData = () => {
  // State for sectors and subsectors
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedSubsector, setSelectedSubsector] = useState(null);
  const [subsectorSearch, setSubsectorSearch] = useState('');
  
  // State for indicators
  const [indicators, setIndicators] = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [indicatorsLoading, setIndicatorsLoading] = useState(false);
  const [indicatorSearch, setIndicatorSearch] = useState('');
  
  // State for items
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  
  // State for areas
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [areaSearch, setAreaSearch] = useState('');
  const [showCountySelector, setShowCountySelector] = useState(false);
  
  // State for time period
  const [timePeriodStart, setTimePeriodStart] = useState('');
  const [timePeriodEnd, setTimePeriodEnd] = useState('');
  
  // State for data results
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showResults, setShowResults] = useState(false);
  
  // State for modals
  const [showPreviewDetailsModal, setShowPreviewDetailsModal] = useState(false);
  const [previewDetailsData, setPreviewDetailsData] = useState(null);
  
  // State for export
  const [exporting, setExporting] = useState(false);
  
  // State for notifications
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // API Base URL
  const API_BASE_URL = 'https://statistics.kilimo.go.ke/api';

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchSectors();
    fetchAreas();
  }, []);

  const fetchSectors = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sectors/`);
      const sectorsData = response.data.results || response.data || [];
      const subsectorsRes = await axios.get(`${API_BASE_URL}/subsectors/`);
      const allSubsectors = subsectorsRes.data.results || subsectorsRes.data || [];
      
      const sectorsWithSubsectors = sectorsData.map(sector => ({
        ...sector,
        subsectors: allSubsectors.filter(s => s.sector === sector.id)
      }));
      
      setSectors(sectorsWithSubsectors);
    } catch (error) {
      console.error('Error fetching sectors:', error);
      showNotification('Failed to load sectors', 'error');
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/areas/`);
      const areasData = response.data.results || response.data || [];
      setAreas(areasData);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const fetchIndicatorsBySubsector = useCallback(async (subsectorId) => {
    if (!subsectorId) {
      setIndicators([]);
      return;
    }
    setIndicatorsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/indicators/?subsector=${subsectorId}`);
      const filteredIndicators = response.data.results || response.data || [];
      setIndicators(filteredIndicators);
    } catch (error) {
      console.error('Error fetching indicators:', error);
      showNotification('Failed to load indicators', 'error');
    } finally {
      setIndicatorsLoading(false);
    }
  }, []);

  const fetchItemsByIndicator = useCallback(async (indicatorId) => {
    if (!indicatorId) {
      setItems([]);
      return;
    }
    setItemsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/items/?indicator=${indicatorId}`);
      const filteredItems = response.data.results || response.data || [];
      setItems(filteredItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      showNotification('Failed to load items', 'error');
    } finally {
      setItemsLoading(false);
    }
  }, []);

  const handleSectorChange = (sectorId) => {
    setSelectedSector(sectorId);
    setSelectedSubsector(null);
    setSelectedIndicator(null);
    setSelectedItem(null);
    setIndicators([]);
    setItems([]);
    setShowResults(false);
    setSubsectorSearch('');
  };

  const handleSubsectorSelect = (subsectorId) => {
    if (selectedSubsector === subsectorId) {
      setSelectedSubsector(null);
      setSelectedIndicator(null);
      setSelectedItem(null);
      setIndicators([]);
      setItems([]);
    } else {
      setSelectedSubsector(subsectorId);
      setSelectedIndicator(null);
      setSelectedItem(null);
      fetchIndicatorsBySubsector(subsectorId);
      setItems([]);
    }
    setShowResults(false);
    setIndicatorSearch('');
  };

  const handleIndicatorSelect = (indicatorId) => {
    if (selectedIndicator === indicatorId) {
      setSelectedIndicator(null);
      setSelectedItem(null);
      setItems([]);
    } else {
      setSelectedIndicator(indicatorId);
      setSelectedItem(null);
      fetchItemsByIndicator(indicatorId);
    }
    setShowResults(false);
    setItemSearch('');
  };

  const handleItemSelect = (itemId) => {
    setSelectedItem(selectedItem === itemId ? null : itemId);
    setShowResults(false);
  };

  const handleAreaSelect = (areaId) => {
    setSelectedArea(areaId);
    setShowCountySelector(false);
    setShowResults(false);
  };

  const clearAllFilters = () => {
    setSelectedSector(null);
    setSelectedSubsector(null);
    setSelectedIndicator(null);
    setSelectedItem(null);
    setSelectedArea(null);
    setTimePeriodStart('');
    setTimePeriodEnd('');
    setSubsectorSearch('');
    setIndicatorSearch('');
    setItemSearch('');
    setAreaSearch('');
    setShowCountySelector(false);
    setIndicators([]);
    setItems([]);
    setShowResults(false);
    setData([]);
    showNotification('All filters cleared', 'info');
  };

  const buildFilterParams = (page = 1, pageSizeValue = 20) => {
    const params = { page, page_size: pageSizeValue };
    if (selectedArea) params.area_id = selectedArea;
    if (selectedSubsector) params.subsector_id = selectedSubsector;
    if (selectedIndicator) params.indicator_id = selectedIndicator;
    if (selectedItem) params.item_id = selectedItem;
    if (timePeriodStart) params.time_period_min = timePeriodStart;
    if (timePeriodEnd) params.time_period_max = timePeriodEnd;
    return params;
  };

  const handleShowData = async () => {
    if (!selectedSubsector && !selectedIndicator && !selectedItem) {
      showNotification('Please select a Subsector, Indicator, or Item', 'warning');
      return;
    }
    
    setLoading(true);
    setCurrentPage(1);
    try {
      const params = buildFilterParams(1, pageSize);
      const response = await axios.get(`${API_BASE_URL}/data/`, { params });
      const results = response.data.results || response.data;
      const count = response.data.count || 0;
      
      setData(results);
      setTotalCount(count);
      setShowResults(true);
      showNotification(`Loaded ${results.length} records`, 'success');
      
      setTimeout(() => {
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (page = 1, pageSizeValue = 20) => {
    if (!selectedSubsector && !selectedIndicator && !selectedItem) return;
    setLoading(true);
    try {
      const params = buildFilterParams(page, pageSizeValue);
      const response = await axios.get(`${API_BASE_URL}/data/`, { params });
      const results = response.data.results || response.data;
      const count = response.data.count || 0;
      setData(results);
      setTotalCount(count);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format = 'csv') => {
    if (!selectedSubsector && !selectedIndicator && !selectedItem) {
      showNotification('Please select filters before exporting', 'warning');
      return;
    }
    
    setExporting(true);
    try {
      const params = buildFilterParams(1, totalCount || 10000);
      const response = await axios.get(`${API_BASE_URL}/data/`, { params });
      const allData = response.data.results || response.data;
      
      if (allData.length === 0) {
        showNotification('No data to export', 'warning');
        setExporting(false);
        return;
      }
      
      if (format === 'csv') downloadAsCSV(allData);
      else if (format === 'json') downloadAsJSON(allData);
      else if (format === 'excel') await downloadAsExcel(allData);
      
      showNotification(`Exported ${allData.length} records as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showNotification('Failed to export data', 'error');
    } finally {
      setExporting(false);
    }
  };

  const downloadAsCSV = (data) => {
    const headers = ['Area', 'Sector', 'Subsector', 'Indicator', 'Item', 'Year', 'Value', 'Unit'];
    const csvRows = [headers.join(',')];
    data.forEach(item => {
      const row = [
        `"${(item.area_name || '').replace(/"/g, '""')}"`,
        `"${(item.sector_name || '').replace(/"/g, '""')}"`,
        `"${(item.subsector_name || '').replace(/"/g, '""')}"`,
        `"${(item.indicator_name || '').replace(/"/g, '""')}"`,
        `"${(item.item_name || '').replace(/"/g, '""')}"`,
        `"${(item.time_period || '').replace(/"/g, '""')}"`,
        item.data_value || '',
        `"${(item.unit_symbol || '').replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kilimostat_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsJSON = (data) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kilimostat_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsExcel = async (data) => {
    try {
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
        'Area': item.area_name,
        'Sector': item.sector_name,
        'Subsector': item.subsector_name,
        'Indicator': item.indicator_name,
        'Item': item.item_name,
        'Year': item.time_period,
        'Value': item.data_value,
        'Unit': item.unit_symbol,
        'Flag': item.flag,
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'KilimoSTAT Data');
      XLSX.writeFile(workbook, `kilimostat_data_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      showNotification('Excel export requires xlsx library', 'error');
    }
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 1963; year <= currentYear; year++) years.push(year);
    return years.reverse();
  };

  const timePeriodYears = generateYears();
  const nationalArea = areas.find(area => area.name === 'KENYA');
  
  // Filtered data based on search
  const filteredSubsectors = selectedSector 
    ? (sectors.find(s => s.id === selectedSector)?.subsectors || []).filter(sub => 
        sub.name.toLowerCase().includes(subsectorSearch.toLowerCase())
      )
    : [];
  
  const filteredIndicators = indicators.filter(ind => 
    ind.name.toLowerCase().includes(indicatorSearch.toLowerCase())
  );
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );
  
  const filteredAreasList = areas.filter(area => 
    area.administrative_level === 'ADMIN_1' && 
    area.name !== 'KENYA' && 
    area.name.toLowerCase().includes(areaSearch.toLowerCase())
  );
  
  const hasFilters = selectedSubsector || selectedIndicator || selectedItem;

  const getSelectedSubsectorName = () => {
    const subsector = sectors.flatMap(s => s.subsectors || []).find(s => s.id === selectedSubsector);
    return subsector ? subsector.name : '';
  };

  const getSelectedIndicatorName = () => indicators.find(i => i.id === selectedIndicator)?.name || '';
  const getSelectedItemName = () => items.find(i => i.id === selectedItem)?.name || '';
  const getSelectedAreaName = () => areas.find(a => a.id === selectedArea)?.name || '';

  // Active filters count
  const activeFiltersCount = [
    selectedArea, selectedSubsector, selectedIndicator, selectedItem, timePeriodStart, timePeriodEnd
  ].filter(Boolean).length;

  return (
    <div className="modern-data-page">
      {/* Animated Notification */}
      {notification.show && (
        <div className={`modern-notification ${notification.type}`}>
          <div className="notification-content">
            <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : notification.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`}></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="modern-hero">
        <div className="hero-bg-pattern"></div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                <i className="fas fa-chart-line"></i> Agricultural Data Platform
              </div>
              <h1>National and County <span className="highlight">Data</span></h1>
              <div className="hero-stats-modern">
                <div className="hero-stat">
                  <i className="fas fa-database"></i>
                  <div>
                    <strong>278+</strong>
                    <span>Products</span>
                  </div>
                </div>
                <div className="hero-stat">
                  <i className="fas fa-calendar-alt"></i>
                  <div>
                    <strong>1963-2025</strong>
                    <span>Time Range</span>
                  </div>
                </div>
                <div className="hero-stat">
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <strong>47</strong>
                    <span>Counties</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="floating-card card-1">
                <i className="fas fa-chart-line"></i>
                <span>Production Trends</span>
              </div>
              <div className="floating-card card-2">
                <i className="fas fa-tractor"></i>
                <span>Crop Yield</span>
              </div>
              <div className="floating-card card-3">
                <i className="fas fa-chart-bar"></i>
                <span>Market Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Active Filters Summary Bar */}
        {activeFiltersCount > 0 && (
          <div className="active-filters-summary">
            <div className="summary-left">
              <i className="fas fa-filter"></i>
              <span>{activeFiltersCount} active filter(s)</span>
            </div>
            <div className="active-filters-tags">
              {selectedArea && (
                <div className="filter-tag">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{getSelectedAreaName()}</span>
                  <button onClick={() => handleAreaSelect(null)}>×</button>
                </div>
              )}
              {selectedSubsector && (
                <div className="filter-tag">
                  <i className="fas fa-folder"></i>
                  <span>{getSelectedSubsectorName()}</span>
                  <button onClick={() => handleSubsectorSelect(selectedSubsector)}>×</button>
                </div>
              )}
              {selectedIndicator && (
                <div className="filter-tag">
                  <i className="fas fa-chart-line"></i>
                  <span>{getSelectedIndicatorName()}</span>
                  <button onClick={() => handleIndicatorSelect(selectedIndicator)}>×</button>
                </div>
              )}
              {selectedItem && (
                <div className="filter-tag">
                  <i className="fas fa-box"></i>
                  <span>{getSelectedItemName()}</span>
                  <button onClick={() => handleItemSelect(selectedItem)}>×</button>
                </div>
              )}
              {(timePeriodStart || timePeriodEnd) && (
                <div className="filter-tag">
                  <i className="fas fa-calendar"></i>
                  <span>{timePeriodStart || 'Any'} - {timePeriodEnd || 'Any'}</span>
                  <button onClick={() => { setTimePeriodStart(''); setTimePeriodEnd(''); }}>×</button>
                </div>
              )}
            </div>
            <button className="clear-all-summary" onClick={clearAllFilters}>
              Clear all
            </button>
          </div>
        )}

        {/* Filter Dashboard Grid */}
        <div className="filter-dashboard">
          {/* Card 1: Sector - Dropdown only (no search) */}
          <div className="filter-card">
            <div className="card-header">
              <i className="fas fa-chart-pie"></i>
              <h3>1. Sector</h3>
            </div>
            <div className="card-body">
              <select 
                className="filter-select"
                value={selectedSector || ''}
                onChange={(e) => handleSectorChange(parseInt(e.target.value))}
              >
                <option value="">-- Select Sector --</option>
                {sectors.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Card 2: Subsector with Search */}
          {selectedSector && (
            <div className="filter-card animated-fade">
              <div className="card-header">
                <i className="fas fa-folder-open"></i>
                <h3>2. Subsector</h3>
              </div>
              <div className="card-body">
                <div className="search-input-modern">
                  <i className="fas fa-search"></i>
                  <input 
                    type="text" 
                    placeholder="Search subsectors..." 
                    value={subsectorSearch}
                    onChange={(e) => setSubsectorSearch(e.target.value)}
                  />
                  {subsectorSearch && (
                    <button className="clear-search" onClick={() => setSubsectorSearch('')}>
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
                <div className="tile-grid">
                  {filteredSubsectors.map(sub => (
                    <button
                      key={sub.id}
                      className={`filter-tile ${selectedSubsector === sub.id ? 'active' : ''}`}
                      onClick={() => handleSubsectorSelect(sub.id)}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
                {filteredSubsectors.length === 0 && subsectorSearch && (
                  <div className="no-search-results">
                    <i className="fas fa-search"></i> No subsectors found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card 3: Indicator with Search */}
          {selectedSubsector && (
            <div className="filter-card animated-fade">
              <div className="card-header">
                <i className="fas fa-chart-line"></i>
                <h3>3. Indicator</h3>
                {indicatorsLoading && <i className="fas fa-spinner fa-spin loading-icon"></i>}
              </div>
              <div className="card-body">
                <div className="search-input-modern">
                  <i className="fas fa-search"></i>
                  <input 
                    type="text" 
                    placeholder="Search indicators..." 
                    value={indicatorSearch}
                    onChange={(e) => setIndicatorSearch(e.target.value)}
                  />
                  {indicatorSearch && (
                    <button className="clear-search" onClick={() => setIndicatorSearch('')}>
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
                {filteredIndicators.length === 0 && !indicatorsLoading ? (
                  <div className="empty-filter-state">
                    <i className="fas fa-info-circle"></i>
                    <p>{indicatorSearch ? 'No indicators match your search' : 'No indicators available'}</p>
                  </div>
                ) : (
                  <div className="tile-grid">
                    {filteredIndicators.map(ind => (
                      <button
                        key={ind.id}
                        className={`filter-tile ${selectedIndicator === ind.id ? 'active' : ''}`}
                        onClick={() => handleIndicatorSelect(ind.id)}
                      >
                        {ind.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card 4: Item with Search */}
          {selectedIndicator && (
            <div className="filter-card animated-fade">
              <div className="card-header">
                <i className="fas fa-box"></i>
                <h3>4. Item / Product</h3>
                {itemsLoading && <i className="fas fa-spinner fa-spin loading-icon"></i>}
              </div>
              <div className="card-body">
                <div className="search-input-modern">
                  <i className="fas fa-search"></i>
                  <input 
                    type="text" 
                    placeholder="Search items..." 
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                  />
                  {itemSearch && (
                    <button className="clear-search" onClick={() => setItemSearch('')}>
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
                {filteredItems.length === 0 && !itemsLoading ? (
                  <div className="empty-filter-state">
                    <i className="fas fa-info-circle"></i>
                    <p>{itemSearch ? 'No items match your search' : 'No items available'}</p>
                  </div>
                ) : (
                  <div className="tile-grid items-grid">
                    {filteredItems.map(item => (
                      <button
                        key={item.id}
                        className={`filter-tile ${selectedItem === item.id ? 'active' : ''}`}
                        onClick={() => handleItemSelect(item.id)}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card 5: Location with Search */}
          <div className="filter-card">
            <div className="card-header">
              <i className="fas fa-map-marker-alt"></i>
              <h3>5. Location</h3>
            </div>
            <div className="card-body">
              <div className="location-options">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="area" 
                    checked={selectedArea === nationalArea?.id} 
                    onChange={() => handleAreaSelect(nationalArea?.id)} 
                  />
                  <span>🇰🇪 National (Kenya)</span>
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="area" 
                    checked={selectedArea && selectedArea !== nationalArea?.id} 
                    onChange={() => setShowCountySelector(true)} 
                  />
                  <span>🏛️ Select County</span>
                </label>
              </div>
              
              {showCountySelector && (
                <div className="county-selector">
                  <div className="search-input-modern">
                    <i className="fas fa-search"></i>
                    <input 
                      type="text" 
                      placeholder="Search county..." 
                      value={areaSearch} 
                      onChange={(e) => setAreaSearch(e.target.value)} 
                    />
                    {areaSearch && (
                      <button className="clear-search" onClick={() => setAreaSearch('')}>
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                  <div className="tile-grid county-grid">
                    {filteredAreasList.map(area => (
                      <button
                        key={area.id}
                        className={`filter-tile ${selectedArea === area.id ? 'active' : ''}`}
                        onClick={() => handleAreaSelect(area.id)}
                      >
                        {area.name}
                      </button>
                    ))}
                  </div>
                  {filteredAreasList.length === 0 && areaSearch && (
                    <div className="no-search-results">
                      <i className="fas fa-search"></i> No counties found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Card 6: Time Period */}
          <div className="filter-card">
            <div className="card-header">
              <i className="fas fa-calendar-alt"></i>
              <h3>6. Time Period</h3>
            </div>
            <div className="card-body">
              <div className="year-range">
                <select value={timePeriodStart} onChange={(e) => setTimePeriodStart(e.target.value)}>
                  <option value="">From Year</option>
                  {timePeriodYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <span className="range-arrow">→</span>
                <select value={timePeriodEnd} onChange={(e) => setTimePeriodEnd(e.target.value)}>
                  <option value="">To Year</option>
                  {timePeriodYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="filter-actions-bar">
            <button 
              className="btn-show-data-large" 
              onClick={handleShowData} 
              disabled={!hasFilters || loading}
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> Loading...</>
              ) : (
                <><i className="fas fa-chart-line"></i> Show Data</>
              )}
            </button>
            <div className="export-shortcuts">
              <button 
                className="btn-icon" 
                onClick={() => exportData('csv')} 
                disabled={!hasFilters || exporting || !showResults}
                title="Export as CSV"
              >
                <i className="fas fa-file-csv"></i> CSV
              </button>
              <button 
                className="btn-icon" 
                onClick={() => exportData('json')} 
                disabled={!hasFilters || exporting || !showResults}
                title="Export as JSON"
              >
                <i className="fas fa-file-code"></i> JSON
              </button>
              <button 
                className="btn-icon" 
                onClick={() => exportData('excel')} 
                disabled={!hasFilters || exporting || !showResults}
                title="Export as Excel"
              >
                <i className="fas fa-file-excel"></i> Excel
              </button>
              <button 
                className="btn-icon btn-clear" 
                onClick={clearAllFilters}
                title="Clear all filters"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section">
          {!showResults ? (
            <div className="empty-state-modern">
              <div className="empty-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h4>No Data Loaded</h4>
              <p>Select a subsector, indicator, or item and click "Show Data" to view agricultural statistics.</p>
              <div className="empty-hint">
                <i className="fas fa-lightbulb"></i>
                <span>Start by selecting a sector, then subsector from the filter cards above</span>
              </div>
            </div>
          ) : loading ? (
            <div className="loading-state">
              <div className="modern-spinner"></div>
              <p>Loading your data...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="empty-state-modern">
              <i className="fas fa-inbox"></i>
              <h4>No Results Found</h4>
              <p>Try adjusting your filters or selecting different options.</p>
              <button className="clear-filters-btn" onClick={clearAllFilters}>Clear All Filters</button>
            </div>
          ) : (
            <>
              <div className="results-header">
                <div className="results-title">
                  <i className="fas fa-table"></i>
                  <h4>Data Results</h4>
                  <span className="results-badge">{totalCount.toLocaleString()} records</span>
                </div>
                <button className="refresh-btn" onClick={() => fetchData(currentPage, pageSize)} disabled={loading}>
                  <i className="fas fa-sync-alt"></i>
                </button>
              </div>

              <div className="table-wrapper">
                <table className="modern-data-table">
                  <thead>
                    <tr>
                      <th>Area</th>
                      <th>Indicator</th>
                      <th>Item</th>
                      <th>Year</th>
                      <th>Value</th>
                      <th>Unit</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item.id} onClick={() => { setPreviewDetailsData(item); setShowPreviewDetailsModal(true); }}>
                        <td data-label="Area"><span className="cell-value">{item.area_name}</span></td>
                        <td data-label="Indicator">{item.indicator_name}</td>
                        <td data-label="Item">{item.item_name}</td>
                        <td data-label="Year">{item.time_period}</td>
                        <td data-label="Value" className="value-cell">
                          {item.data_value?.toLocaleString()}
                          {item.flag && <span className="flag-badge-modern">{item.flag}</span>}
                        </td>
                        <td data-label="Unit">{item.unit_symbol}</td>
                        <td className="action-cell">
                          <button className="view-details-btn">
                            <i className="fas fa-info-circle"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalCount > pageSize && (
                <div className="pagination-modern">
                  <button onClick={() => fetchData(currentPage - 1, pageSize)} disabled={currentPage === 1}>
                    <i className="fas fa-chevron-left"></i> Previous
                  </button>
                  <span className="page-info">
                    Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                  </span>
                  <button onClick={() => fetchData(currentPage + 1, pageSize)} disabled={currentPage === Math.ceil(totalCount / pageSize)}>
                    Next <i className="fas fa-chevron-right"></i>
                  </button>
                  <select 
                    value={pageSize} 
                    onChange={(e) => { 
                      setPageSize(Number(e.target.value)); 
                      fetchData(1, Number(e.target.value)); 
                    }} 
                    className="page-size-select"
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showPreviewDetailsModal && previewDetailsData && (
        <div className="modern-modal-overlay" onClick={() => setShowPreviewDetailsModal(false)}>
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <h3><i className="fas fa-info-circle"></i> Record Details</h3>
              <button className="modal-close-btn" onClick={() => setShowPreviewDetailsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body-modern">
              <div className="details-grid-modern">
                <div className="detail-card">
                  <div className="detail-icon"><i className="fas fa-map-marker-alt"></i></div>
                  <div className="detail-info">
                    <label>Area</label>
                    <p>{previewDetailsData.area_name}</p>
                    <span className="detail-sub">{previewDetailsData.area_level}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon"><i className="fas fa-chart-line"></i></div>
                  <div className="detail-info">
                    <label>Indicator</label>
                    <p>{previewDetailsData.indicator_name}</p>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon"><i className="fas fa-box"></i></div>
                  <div className="detail-info">
                    <label>Item</label>
                    <p>{previewDetailsData.item_name}</p>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon"><i className="fas fa-calendar"></i></div>
                  <div className="detail-info">
                    <label>Time Period</label>
                    <p>{previewDetailsData.time_period}</p>
                  </div>
                </div>
                <div className="detail-card highlight">
                  <div className="detail-icon"><i className="fas fa-chart-simple"></i></div>
                  <div className="detail-info">
                    <label>Value</label>
                    <p className="value-highlight">{previewDetailsData.data_value?.toLocaleString()} {previewDetailsData.unit_symbol}</p>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon"><i className="fas fa-building"></i></div>
                  <div className="detail-info">
                    <label>Source</label>
                    <p>{previewDetailsData.source_name}</p>
                    <span className="detail-sub">{previewDetailsData.provider_name}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer-modern">
              <button className="btn-close-modal" onClick={() => setShowPreviewDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NationalCountyData;