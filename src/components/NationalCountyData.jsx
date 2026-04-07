// components/NationalCountyData.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const NationalCountyData = () => {
  // State for sectors and subsectors
  const [sectors, setSectors] = useState([]);
  const [expandedSectors, setExpandedSectors] = useState({});
  const [selectedSubsector, setSelectedSubsector] = useState(null);
  const [subsectorSearch, setSubsectorSearch] = useState('');
  
  // State for indicators
  const [indicators, setIndicators] = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [indicatorsLoading, setIndicatorsLoading] = useState(false);
  const [indicatorSearch, setIndicatorSearch] = useState('');
  
  // State for areas
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [areaSearch, setAreaSearch] = useState('');
  const [showCounties, setShowCounties] = useState(true);
  
  // State for items
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  
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
      const initialExpanded = {};
      sectorsWithSubsectors.forEach(sector => { initialExpanded[sector.id] = false; });
      setExpandedSectors(initialExpanded);
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
    if (!subsectorId) { setIndicators([]); return; }
    setIndicatorsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/indicators/`);
      const allIndicators = response.data.results || response.data || [];
      const filteredIndicators = allIndicators.filter(indicator => indicator.subsector === subsectorId);
      setIndicators(filteredIndicators);
    } catch (error) {
      console.error('Error fetching indicators:', error);
      showNotification('Failed to load indicators', 'error');
    } finally {
      setIndicatorsLoading(false);
    }
  }, []);

  const fetchItemsByIndicator = useCallback(async (indicatorId) => {
    if (!indicatorId) { setItems([]); return; }
    setItemsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/items/`);
      const allItems = response.data.results || response.data || [];
      setItems(allItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      showNotification('Failed to load items', 'error');
    } finally {
      setItemsLoading(false);
    }
  }, []);

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
  };

  const handleItemSelect = (itemId) => {
    setSelectedItem(selectedItem === itemId ? null : itemId);
    setShowResults(false);
  };

  const handleAreaSelect = (areaId) => {
    setSelectedArea(selectedArea === areaId ? null : areaId);
    setShowResults(false);
  };

  const clearAllFilters = () => {
    setSelectedSubsector(null);
    setSelectedIndicator(null);
    setSelectedArea(null);
    setSelectedItem(null);
    setTimePeriodStart('');
    setTimePeriodEnd('');
    setSubsectorSearch('');
    setIndicatorSearch('');
    setItemSearch('');
    setAreaSearch('');
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
        const resultsSection = document.querySelector('.results-section-modern');
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
        'Area': item.area_name, 'Sector': item.sector_name, 'Subsector': item.subsector_name,
        'Indicator': item.indicator_name, 'Item': item.item_name, 'Year': item.time_period,
        'Value': item.data_value, 'Unit': item.unit_symbol, 'Flag': item.flag,
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
  const filteredIndicators = indicators.filter(ind => ind.name.toLowerCase().includes(indicatorSearch.toLowerCase()));
  const filteredItems = items.filter(item => item.name.toLowerCase().includes(itemSearch.toLowerCase()));
  const filteredAreasList = areas.filter(area => area.administrative_level === 'ADMIN_1' && area.name !== 'KENYA' && area.name.toLowerCase().includes(areaSearch.toLowerCase()));
  const nationalArea = areas.find(area => area.name === 'KENYA');
  const hasFilters = selectedSubsector || selectedIndicator || selectedItem;

  const getSelectedSubsectorName = () => {
    const subsector = sectors.flatMap(s => s.subsectors || []).find(s => s.id === selectedSubsector);
    return subsector ? subsector.name : '';
  };

  const getSelectedIndicatorName = () => indicators.find(i => i.id === selectedIndicator)?.name || '';
  const getSelectedItemName = () => items.find(i => i.id === selectedItem)?.name || '';
  const getSelectedAreaName = () => areas.find(a => a.id === selectedArea)?.name || '';

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

      {/* Hero Section with Gradient */}
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
        <div className="modern-layout">
          {/* Left Panel - Modern Filters */}
          <div className="modern-filters-panel">
            <div className="filters-header">
              <div className="filters-title">
                <i className="fas fa-sliders-h"></i>
                <h3>Data Filters</h3>
              </div>
              {(selectedSubsector || selectedIndicator || selectedArea || selectedItem) && (
                <button className="clear-all-btn" onClick={clearAllFilters}>
                  <i className="fas fa-times-circle"></i> Clear all
                </button>
              )}
            </div>

            {/* Active Filters Tags */}
            {(selectedArea || selectedSubsector || selectedIndicator || selectedItem) && (
              <div className="active-filters-tags">
                <span className="tags-label">Active:</span>
                {selectedArea && (
                  <div className="filter-tag">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{getSelectedAreaName()}</span>
                    <button onClick={() => handleAreaSelect(selectedArea)}>×</button>
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
              </div>
            )}

            {/* Area Selection */}
            <div className="filter-group-modern">
              <div className="filter-group-header" onClick={() => setShowCounties(!showCounties)}>
                <i className={`fas fa-chevron-${showCounties ? 'down' : 'right'}`}></i>
                <i className="fas fa-map-marker-alt group-icon"></i>
                <span>Location</span>
                {selectedArea && <span className="group-badge">1 selected</span>}
              </div>
              {showCounties && (
                <div className="filter-group-content">
                  <div className="search-input">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Search county..." value={areaSearch} onChange={(e) => setAreaSearch(e.target.value)} />
                  </div>
                  <div className="options-list">
                    {nationalArea && (
                      <label className={`option-radio ${selectedArea === nationalArea.id ? 'selected' : ''}`}>
                        <input type="radio" name="area" checked={selectedArea === nationalArea.id} onChange={() => handleAreaSelect(nationalArea.id)} />
                        <span className="radio-indicator"></span>
                        <span className="option-text">
                          <strong>{nationalArea.name}</strong>
                          <span className="badge-national">National</span>
                        </span>
                      </label>
                    )}
                    {filteredAreasList.map(area => (
                      <label key={area.id} className={`option-radio ${selectedArea === area.id ? 'selected' : ''}`}>
                        <input type="radio" name="area" checked={selectedArea === area.id} onChange={() => handleAreaSelect(area.id)} />
                        <span className="radio-indicator"></span>
                        <span className="option-text">{area.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Subsector Selection */}
            <div className="filter-group-modern">
              <div className="filter-group-header">
                <i className="fas fa-chart-pie group-icon"></i>
                <span>Items Aggregated</span>
              </div>
              <div className="filter-group-content">
                <div className="search-input">
                  <i className="fas fa-search"></i>
                  <input type="text" placeholder="Search subsector..." value={subsectorSearch} onChange={(e) => setSubsectorSearch(e.target.value)} />
                </div>
                <div className="accordion-list">
                  {sectors.map(sector => {
                    const displaySubsectors = sector.subsectors?.filter(s => !subsectorSearch || s.name.toLowerCase().includes(subsectorSearch.toLowerCase())) || [];
                    if (displaySubsectors.length === 0 && subsectorSearch) return null;
                    return (
                      <div key={sector.id} className="accordion-item">
                        <div className="accordion-header" onClick={() => setExpandedSectors(prev => ({ ...prev, [sector.id]: !prev[sector.id] }))}>
                          <i className={`fas fa-chevron-${expandedSectors[sector.id] ? 'down' : 'right'}`}></i>
                          <span>{sector.name}</span>
                          <span className="item-count">{displaySubsectors.length}</span>
                        </div>
                        {expandedSectors[sector.id] && (
                          <div className="accordion-content">
                            {displaySubsectors.map(subsector => (
                              <label key={subsector.id} className={`option-radio ${selectedSubsector === subsector.id ? 'selected' : ''}`}>
                                <input type="radio" name="subsector" checked={selectedSubsector === subsector.id} onChange={() => handleSubsectorSelect(subsector.id)} />
                                <span className="radio-indicator"></span>
                                <span className="option-text">{subsector.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Indicators Section */}
            {selectedSubsector && (
              <div className="filter-group-modern animated-fade">
                <div className="filter-group-header">
                  <i className="fas fa-chart-line group-icon"></i>
                  <span>Indicators</span>
                  {indicatorsLoading && <i className="fas fa-spinner fa-spin loading-icon"></i>}
                </div>
                <div className="filter-group-content">
                  <div className="search-input">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Search indicators..." value={indicatorSearch} onChange={(e) => setIndicatorSearch(e.target.value)} />
                  </div>
                  <div className="options-list">
                    {filteredIndicators.map(indicator => (
                      <label key={indicator.id} className={`option-radio ${selectedIndicator === indicator.id ? 'selected' : ''}`}>
                        <input type="radio" name="indicator" checked={selectedIndicator === indicator.id} onChange={() => handleIndicatorSelect(indicator.id)} />
                        <span className="radio-indicator"></span>
                        <span className="option-text">{indicator.name}</span>
                      </label>
                    ))}
                    {filteredIndicators.length === 0 && !indicatorsLoading && (
                      <div className="no-results-modern">
                        <i className="fas fa-search"></i> No indicators found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Items Section */}
            {selectedIndicator && (
              <div className="filter-group-modern animated-fade">
                <div className="filter-group-header">
                  <i className="fas fa-box group-icon"></i>
                  <span>Items</span>
                  {itemsLoading && <i className="fas fa-spinner fa-spin loading-icon"></i>}
                </div>
                <div className="filter-group-content">
                  <div className="search-input">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Search items..." value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} />
                  </div>
                  <div className="options-list">
                    {filteredItems.map(item => (
                      <label key={item.id} className={`option-radio ${selectedItem === item.id ? 'selected' : ''}`}>
                        <input type="radio" name="item" checked={selectedItem === item.id} onChange={() => handleItemSelect(item.id)} />
                        <span className="radio-indicator"></span>
                        <span className="option-text">{item.name}</span>
                      </label>
                    ))}
                    {filteredItems.length === 0 && !itemsLoading && (
                      <div className="no-results-modern">
                        <i className="fas fa-search"></i> No items found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Time Period */}
            <div className="filter-group-modern">
              <div className="filter-group-header">
                <i className="fas fa-calendar-alt group-icon"></i>
                <span>Time Period</span>
              </div>
              <div className="filter-group-content">
                <div className="range-selector">
                  <select value={timePeriodStart} onChange={(e) => setTimePeriodStart(e.target.value)}>
                    <option value="">From Year</option>
                    {timePeriodYears.map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                  <span className="range-arrow">→</span>
                  <select value={timePeriodEnd} onChange={(e) => setTimePeriodEnd(e.target.value)}>
                    <option value="">To Year</option>
                    {timePeriodYears.map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="filter-actions-modern">
              <button className="btn-show-data-modern" onClick={handleShowData} disabled={!hasFilters || loading}>
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Loading...</> : <><i className="fas fa-chart-line"></i> Show Data</>}
              </button>
              <div className="export-buttons">
                <button className="btn-export-modern csv" onClick={() => exportData('csv')} disabled={!hasFilters || exporting || !showResults}>
                  <i className="fas fa-file-csv"></i> CSV
                </button>
                <button className="btn-export-modern json" onClick={() => exportData('json')} disabled={!hasFilters || exporting || !showResults}>
                  <i className="fas fa-file-code"></i> JSON
                </button>
                <button className="btn-export-modern excel" onClick={() => exportData('excel')} disabled={!hasFilters || exporting || !showResults}>
                  <i className="fas fa-file-excel"></i> Excel
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="modern-results-panel">
            {/* Info Card */}
            <div className="info-card-modern">
              <div className="info-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="info-text">
                <h4>Agricultural Data Explorer</h4>
                <p>Select filters from the left panel to explore Kenya's agricultural statistics. <br /> <br />
               
                </p>
              </div>
            </div>

            {/* Bulk Downloads */}
            <div className="bulk-downloads-modern">
              <h4><i className="fas fa-database"></i>Downloads</h4>
              <div className="bulk-buttons">
                <button onClick={() => exportData('csv')}><i className="fas fa-file-csv"></i> CSV</button>
                <button onClick={() => exportData('json')}><i className="fas fa-file-code"></i> JSON</button>
                <button onClick={() => exportData('excel')}><i className="fas fa-file-excel"></i> Excel</button>
                <button style={{ padding: '8px 20px' }}><Link to="/visualization-tab">
                            <i className="fas fa-chart-line"></i> Visualize </Link></button>

                <button style={{ padding: '8px 20px' }}><Link to="/visualization">
                            <i className="fas fa-chart-line"></i> Trends </Link></button>
              </div>
            </div>

            {/* Results Section */}
            <div className="results-section-modern">
              <div className="results-header-modern">
                <div className="results-title">
                  <i className="fas fa-table"></i>
                  <h4>Data Results</h4>
                  {showResults && <span className="results-badge">{totalCount.toLocaleString()} records</span>}
                </div>
                {showResults && (
                  <button className="refresh-btn" onClick={() => fetchData(currentPage, pageSize)} disabled={loading}>
                    <i className="fas fa-sync-alt"></i>
                  </button>
                )}
              </div>

              {!showResults ? (
                <div className="empty-state-modern">
                  <div className="empty-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <h4>No Data Loaded</h4>
                  <p>Select a subsector, indicator, or item and click "Show Data" to view agricultural statistics.</p>
                  <div className="empty-hint">
                    <i className="fas fa-lightbulb"></i>
                    <span>Start by selecting a subsector from the Items Aggregated section</span>
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
                            <td data-label="Value" className="value-cell">{item.data_value?.toLocaleString()}{item.flag && <span className="flag-badge-modern">{item.flag}</span>}</td>
                            <td data-label="Unit">{item.unit_symbol}</td>
                            <td className="action-cell"><button className="view-details-btn"><i className="fas fa-info-circle"></i></button></td>
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
                      <span className="page-info">Page {currentPage} of {Math.ceil(totalCount / pageSize)}</span>
                      <button onClick={() => fetchData(currentPage + 1, pageSize)} disabled={currentPage === Math.ceil(totalCount / pageSize)}>
                        Next <i className="fas fa-chevron-right"></i>
                      </button>
                      <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); fetchData(1, Number(e.target.value)); }} className="page-size-select">
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
        </div>
      </div>

      {/* Details Modal */}
      {showPreviewDetailsModal && previewDetailsData && (
        <div className="modern-modal-overlay" onClick={() => setShowPreviewDetailsModal(false)}>
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <h3><i className="fas fa-info-circle"></i> Record Details</h3>
              <button className="modal-close-btn" onClick={() => setShowPreviewDetailsModal(false)}><i className="fas fa-times"></i></button>
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