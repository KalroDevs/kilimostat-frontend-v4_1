// components/NationalCountyData.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

const NationalCountyData = () => {
  // State for sectors and subsectors
  const [sectors, setSectors] = useState([]);
  const [expandedSectors, setExpandedSectors] = useState({});
  const [selectedSubsector, setSelectedSubsector] = useState(null); // Single selection
  const [subsectorSearch, setSubsectorSearch] = useState('');
  
  // State for indicators (loaded based on selected subsector)
  const [indicators, setIndicators] = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState(null); // Single selection
  const [indicatorsLoading, setIndicatorsLoading] = useState(false);
  const [indicatorSearch, setIndicatorSearch] = useState('');
  
  // State for areas (counties and national)
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null); // Single selection for area
  const [areaSearch, setAreaSearch] = useState('');
  const [showCounties, setShowCounties] = useState(true);
  
  // State for items (loaded based on selected indicator)
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // Single selection
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
  const [activeTab, setActiveTab] = useState('table');
  
  // State for modals
  const [showPreviewDetailsModal, setShowPreviewDetailsModal] = useState(false);
  const [previewDetailsData, setPreviewDetailsData] = useState(null);
  
  // State for export
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  
  // State for notifications
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // API Base URL
  const API_BASE_URL = 'https://statistics.kilimo.go.ke/api';

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  // Fetch sectors on component mount
  useEffect(() => {
    fetchSectors();
    fetchAreas();
  }, []);

  // Fetch sectors from API
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
      sectorsWithSubsectors.forEach(sector => {
        initialExpanded[sector.id] = false;
      });
      setExpandedSectors(initialExpanded);
    } catch (error) {
      console.error('Error fetching sectors:', error);
      showNotification('Failed to load sectors', 'error');
    }
  };

  // Fetch areas
  const fetchAreas = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/areas/`);
      const areasData = response.data.results || response.data || [];
      setAreas(areasData);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  // Fetch indicators based on selected subsector
  const fetchIndicatorsBySubsector = useCallback(async (subsectorId) => {
    if (!subsectorId) {
      setIndicators([]);
      return;
    }
    
    setIndicatorsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/indicators/`);
      const allIndicators = response.data.results || response.data || [];
      
      const filteredIndicators = allIndicators.filter(
        indicator => indicator.subsector === subsectorId
      );
      setIndicators(filteredIndicators);
    } catch (error) {
      console.error('Error fetching indicators:', error);
      showNotification('Failed to load indicators', 'error');
    } finally {
      setIndicatorsLoading(false);
    }
  }, []);

  // Fetch items based on selected indicator
  const fetchItemsByIndicator = useCallback(async (indicatorId) => {
    if (!indicatorId) {
      setItems([]);
      return;
    }
    
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

  // Handle subsector selection (single selection)
  const handleSubsectorSelect = (subsectorId) => {
    if (selectedSubsector === subsectorId) {
      // Deselect if same item clicked
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

  // Handle indicator selection (single selection)
  const handleIndicatorSelect = (indicatorId) => {
    if (selectedIndicator === indicatorId) {
      // Deselect if same item clicked
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

  // Handle item selection (single selection)
  const handleItemSelect = (itemId) => {
    if (selectedItem === itemId) {
      setSelectedItem(null);
    } else {
      setSelectedItem(itemId);
    }
    setShowResults(false);
  };

  // Handle area selection (single selection)
  const handleAreaSelect = (areaId) => {
    if (selectedArea === areaId) {
      setSelectedArea(null);
    } else {
      setSelectedArea(areaId);
    }
    setShowResults(false);
  };

  // Clear all filters
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

  // Build filter parameters
  const buildFilterParams = (page = 1, pageSizeValue = 20) => {
    const params = {
      page: page,
      page_size: pageSizeValue,
    };

    if (selectedArea) params.area_id = selectedArea;
    if (selectedSubsector) params.subsector_id = selectedSubsector;
    if (selectedIndicator) params.indicator_id = selectedIndicator;
    if (selectedItem) params.item_id = selectedItem;
    if (timePeriodStart) params.time_period_min = timePeriodStart;
    if (timePeriodEnd) params.time_period_max = timePeriodEnd;

    return params;
  };

  // Show Data - Load preview data on the right pane
  const handleShowData = async () => {
    if (!selectedSubsector && !selectedIndicator && !selectedItem) {
      showNotification('Please select at least one Subsector, Indicator, or Item', 'warning');
      return;
    }
    
    setLoading(true);
    setCurrentPage(1);
    
    try {
      const params = buildFilterParams(1, pageSize);
      console.log('Fetching data with params:', params);
      
      const response = await axios.get(`${API_BASE_URL}/data/`, { params });
      const results = response.data.results || response.data;
      const count = response.data.count || 0;
      
      setData(results);
      setTotalCount(count);
      setShowResults(true);
      showNotification(`Loaded ${results.length} records`, 'success');
      
      // Scroll to results section
      setTimeout(() => {
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for pagination
  const fetchData = async (page = 1, pageSizeValue = 20) => {
    if (!selectedSubsector && !selectedIndicator && !selectedItem) {
      showNotification('Please select at least one Subsector, Indicator, or Item', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      const params = buildFilterParams(page, pageSizeValue);
      const response = await axios.get(`${API_BASE_URL}/data/`, { params });
      const results = response.data.results || response.data;
      const count = response.data.count || 0;
      
      setData(results);
      setTotalCount(count);
      setCurrentPage(page);
      showNotification(`Loaded ${results.length} records`, 'success');
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Export data
  const exportData = async (format = 'csv') => {
    if (!selectedSubsector && !selectedIndicator && !selectedItem) {
      showNotification('Please select filters before exporting', 'warning');
      return;
    }
    
    setExporting(true);
    setExportFormat(format);
    try {
      const params = buildFilterParams(1, totalCount || 10000);
      const response = await axios.get(`${API_BASE_URL}/data/`, { params });
      const allData = response.data.results || response.data;
      
      if (allData.length === 0) {
        showNotification('No data to export', 'warning');
        setExporting(false);
        return;
      }
      
      if (format === 'csv') {
        downloadAsCSV(allData);
      } else if (format === 'json') {
        downloadAsJSON(allData);
      } else if (format === 'excel') {
        await downloadAsExcel(allData);
      }
      
      showNotification(`Exported ${allData.length} records as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showNotification('Failed to export data', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Download as CSV
  const downloadAsCSV = (data) => {
    const headers = ['Area', 'Sector', 'Subsector', 'Indicator', 'Item', 'Time Period', 'Value', 'Unit', 'Flag', 'Source', 'Provider'];
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
        `"${(item.flag || '').replace(/"/g, '""')}"`,
        `"${(item.source_name || '').replace(/"/g, '""')}"`,
        `"${(item.provider_name || '').replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kilimostat_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Download as JSON
  const downloadAsJSON = (data) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kilimostat_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Download as Excel
  const downloadAsExcel = async (data) => {
    try {
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
        'Area': item.area_name,
        'Sector': item.sector_name,
        'Subsector': item.subsector_name,
        'Indicator': item.indicator_name,
        'Item': item.item_name,
        'Domain': item.domain_name,
        'Time Period': item.time_period,
        'Value': item.data_value,
        'Unit': item.unit_symbol,
        'Flag': item.flag,
        'Source': item.source_name,
        'Provider': item.provider_name,
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'KilimoSTAT Data');
      XLSX.writeFile(workbook, `kilimostat_data_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      showNotification('Excel export requires xlsx library. Use CSV or JSON format.', 'error');
    }
  };

  // Generate years
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 1963; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse();
  };

  const timePeriodYears = generateYears();

  // Filtered data
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
  
  const nationalArea = areas.find(area => area.name === 'KENYA');
  const hasFilters = selectedSubsector || selectedIndicator || selectedItem;
  const selectedCount = (selectedSubsector ? 1 : 0) + (selectedIndicator ? 1 : 0) + (selectedArea ? 1 : 0) + (selectedItem ? 1 : 0);

  // Get selected names for display
  const getSelectedSubsectorName = () => {
    const subsector = sectors.flatMap(s => s.subsectors || []).find(s => s.id === selectedSubsector);
    return subsector ? subsector.name : '';
  };

  const getSelectedIndicatorName = () => {
    const indicator = indicators.find(i => i.id === selectedIndicator);
    return indicator ? indicator.name : '';
  };

  const getSelectedItemName = () => {
    const item = items.find(i => i.id === selectedItem);
    return item ? item.name : '';
  };

  const getSelectedAreaName = () => {
    const area = areas.find(a => a.id === selectedArea);
    return area ? area.name : '';
  };

  return (
    <div className="national-county-data-faostat">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`notification-toast ${notification.type}`}>
          <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : notification.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`}></i>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="faostat-header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1>
                <i className="fas fa-chart-line"></i> National and County Data
              </h1>
              <p className="header-description">
                This module provides structured, disaggregated datasets covering agricultural indicators at both national and county levels. Data domains include crop production metrics (area, yield, output), livestock statistics, climate variables (rainfall, temperature), soil parameters, input utilization, and market price dynamics.          </p>
            </div>
            <div className="header-stats">
              <div className="stat-badge">
                <i className="fas fa-database"></i>
                <span>278+ Products</span>
              </div>
              <div className="stat-badge">
                <i className="fas fa-calendar"></i>
                <span>1963-2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="faostat-layout">
          {/* Left Panel - Filters */}
          <div className="filters-panel">
            <div className="panel-header">
              <div className="panel-title">
                <i className="fas fa-sliders-h"></i>
                <h3>FILTERS</h3>
                {selectedCount > 0 && <span className="selected-badge">{selectedCount} active</span>}
              </div>
              <button className="btn-clear-all" onClick={clearAllFilters}>
                <i className="fas fa-times"></i> Clear all
              </button>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-label">Subsector:</span>
                <span className="stat-value">{selectedSubsector ? '✓' : '—'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Indicator:</span>
                <span className="stat-value">{selectedIndicator ? '✓' : '—'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Area:</span>
                <span className="stat-value">{selectedArea ? '✓' : '—'}</span>
              </div>
            </div>

            {/* Selected Filters Summary */}
            {(selectedSubsector || selectedIndicator || selectedItem || selectedArea) && (
              <div className="selected-filters-summary">
                <div className="summary-title">Selected Filters:</div>
                <div className="summary-list">
                  {selectedArea && (
                    <span className="summary-badge">
                      <i className="fas fa-map-marker-alt"></i> {getSelectedAreaName()}
                      <button onClick={() => handleAreaSelect(selectedArea)}>×</button>
                    </span>
                  )}
                  {selectedSubsector && (
                    <span className="summary-badge">
                      <i className="fas fa-folder"></i> {getSelectedSubsectorName()}
                      <button onClick={() => handleSubsectorSelect(selectedSubsector)}>×</button>
                    </span>
                  )}
                  {selectedIndicator && (
                    <span className="summary-badge">
                      <i className="fas fa-chart-line"></i> {getSelectedIndicatorName()}
                      <button onClick={() => handleIndicatorSelect(selectedIndicator)}>×</button>
                    </span>
                  )}
                  {selectedItem && (
                    <span className="summary-badge">
                      <i className="fas fa-box"></i> {getSelectedItemName()}
                      <button onClick={() => handleItemSelect(selectedItem)}>×</button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Countries/Areas Section - Single Selection */}
            <div className="filter-section">
              <div className="filter-section-header" onClick={() => setShowCounties(!showCounties)}>
                <i className={`fas fa-chevron-${showCounties ? 'down' : 'right'}`}></i>
                <i className="fas fa-map-marker-alt"></i>
                <h4>COUNTRIES & AREAS</h4>
              </div>
              
              {showCounties && (
                <>
                  <div className="filter-search">
                    <input
                      type="text"
                      placeholder="Search county..."
                      value={areaSearch}
                      onChange={(e) => setAreaSearch(e.target.value)}
                    />
                    <i className="fas fa-search"></i>
                  </div>
                  
                  {nationalArea && (
                    <label className="filter-radio-label national">
                      <input
                        type="radio"
                        name="area"
                        checked={selectedArea === nationalArea.id}
                        onChange={() => handleAreaSelect(nationalArea.id)}
                      />
                      <span className="radio-custom"></span>
                      <span className="radio-text">
                        <strong>{nationalArea.name}</strong>
                        <span className="area-level-badge">National</span>
                      </span>
                    </label>
                  )}
                  
                  <div className="filter-list">
                    {filteredAreasList.map(area => (
                      <label key={area.id} className="filter-radio-label">
                        <input
                          type="radio"
                          name="area"
                          checked={selectedArea === area.id}
                          onChange={() => handleAreaSelect(area.id)}
                        />
                        <span className="radio-custom"></span>
                        <span className="radio-text">{area.name}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Sectors and Subsectors Accordion - Single Selection */}
            <div className="filter-section">
              <div className="filter-section-header">
                <i className="fas fa-chart-pie"></i>
                <h4>ITEMS AGGREGATED</h4>
              </div>
              <div className="filter-search">
                <input
                  type="text"
                  placeholder="Search subsector..."
                  value={subsectorSearch}
                  onChange={(e) => setSubsectorSearch(e.target.value)}
                />
                <i className="fas fa-search"></i>
              </div>
              <div className="sectors-accordion">
                {sectors.map(sector => {
                  const displaySubsectors = sector.subsectors?.filter(s => 
                    !subsectorSearch || s.name.toLowerCase().includes(subsectorSearch.toLowerCase())
                  ) || [];
                  
                  if (displaySubsectors.length === 0 && subsectorSearch) return null;
                  
                  return (
                    <div key={sector.id} className="sector-item">
                      <div 
                        className="sector-header"
                        onClick={() => setExpandedSectors(prev => ({ ...prev, [sector.id]: !prev[sector.id] }))}
                      >
                        <i className={`fas fa-chevron-${expandedSectors[sector.id] ? 'down' : 'right'}`}></i>
                        <span className="sector-name">{sector.name}</span>
                        <span className="sector-count">{displaySubsectors.length}</span>
                      </div>
                      {expandedSectors[sector.id] && (
                        <div className="subsectors-list">
                          {displaySubsectors.map(subsector => (
                            <label key={subsector.id} className="filter-radio-label subsector-item">
                              <input
                                type="radio"
                                name="subsector"
                                checked={selectedSubsector === subsector.id}
                                onChange={() => handleSubsectorSelect(subsector.id)}
                              />
                              <span className="radio-custom"></span>
                              <span className="radio-text">{subsector.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Indicators Section - Single Selection */}
            {selectedSubsector && (
              <div className="filter-section">
                <div className="filter-section-header">
                  <i className="fas fa-chart-line"></i>
                  <h4>INDICATORS</h4>
                  {indicatorsLoading && <i className="fas fa-spinner fa-spin"></i>}
                </div>
                <div className="filter-search">
                  <input
                    type="text"
                    placeholder="Search indicators..."
                    value={indicatorSearch}
                    onChange={(e) => setIndicatorSearch(e.target.value)}
                  />
                  <i className="fas fa-search"></i>
                </div>
                <div className="filter-list">
                  {filteredIndicators.map(indicator => (
                    <label key={indicator.id} className="filter-radio-label">
                      <input
                        type="radio"
                        name="indicator"
                        checked={selectedIndicator === indicator.id}
                        onChange={() => handleIndicatorSelect(indicator.id)}
                      />
                      <span className="radio-custom"></span>
                      <span className="radio-text">{indicator.name}</span>
                    </label>
                  ))}
                  {filteredIndicators.length === 0 && !indicatorsLoading && (
                    <div className="no-results">
                      <i className="fas fa-search"></i> No indicators found
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Items Section - Single Selection */}
            {selectedIndicator && (
              <div className="filter-section">
                <div className="filter-section-header">
                  <i className="fas fa-box"></i>
                  <h4>ITEMS</h4>
                  {itemsLoading && <i className="fas fa-spinner fa-spin"></i>}
                </div>
                <div className="filter-search">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                  />
                  <i className="fas fa-search"></i>
                </div>
                <div className="filter-list">
                  {filteredItems.map(item => (
                    <label key={item.id} className="filter-radio-label">
                      <input
                        type="radio"
                        name="item"
                        checked={selectedItem === item.id}
                        onChange={() => handleItemSelect(item.id)}
                      />
                      <span className="radio-custom"></span>
                      <span className="radio-text">{item.name}</span>
                    </label>
                  ))}
                  {filteredItems.length === 0 && !itemsLoading && (
                    <div className="no-results">
                      <i className="fas fa-search"></i> No items found
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Time Period Section */}
            <div className="filter-section">
              <div className="filter-section-header">
                <i className="fas fa-calendar-alt"></i>
                <h4>YEARS</h4>
              </div>
              <div className="time-range-selector">
                <select value={timePeriodStart} onChange={(e) => setTimePeriodStart(e.target.value)}>
                  <option value="">From year</option>
                  {timePeriodYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <span className="range-separator">→</span>
                <select value={timePeriodEnd} onChange={(e) => setTimePeriodEnd(e.target.value)}>
                  <option value="">To year</option>
                  {timePeriodYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Show Data Button */}
            <div className="filter-actions">
              <button 
                className="btn-show-data" 
                onClick={handleShowData}
                disabled={!hasFilters || loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Loading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-chart-line"></i> Show Data
                  </>
                )}
              </button>
              <button 
                className="btn-download-data" 
                onClick={() => exportData('csv')}
                disabled={!hasFilters || exporting || !showResults}
              >
                <i className={`fas ${exporting && exportFormat === 'csv' ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
                {exporting && exportFormat === 'csv' ? 'Exporting...' : 'Download CSV'}
              </button>
              <div className="download-options">
                <button className="btn-download-option" onClick={() => exportData('json')} disabled={!hasFilters || exporting || !showResults}>
                  JSON
                </button>
                <button className="btn-download-option" onClick={() => exportData('excel')} disabled={!hasFilters || exporting || !showResults}>
                  Excel
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="results-panel">
            {/* Info Card */}
            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-info-circle"></i>
              </div>
              <div className="info-content">
                <h4>National and County Data</h4>
                <p>
                 Access key agricultural statistics across Kenya at national and county levels. Explore trends, compare regions, and download data to support informed decision-making.
                </p>
                <a href="#" className="info-link">Show More <i className="fas fa-arrow-right"></i></a>
              </div>
            </div>

            {/* Bulk Downloads Section */}
            <div className="bulk-downloads">
              <h4>
                <i className="fas fa-database"></i> BULK DOWNLOADS
              </h4>
              <div className="bulk-downloads-grid">
                <div className="bulk-item" onClick={() => exportData('csv')}>
                  <i className="fas fa-file-csv"></i>
                  <span>All Data</span>
                  <span className="bulk-size">CSV</span>
                </div>
                <div className="bulk-item" onClick={() => exportData('json')}>
                  <i className="fas fa-file-code"></i>
                  <span>All Data</span>
                  <span className="bulk-size">JSON</span>
                </div>
                <div className="bulk-item" onClick={() => exportData('excel')}>
                  <i className="fas fa-file-excel"></i>
                  <span>All Data</span>
                  <span className="bulk-size">Excel</span>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="results-section">
              <div className="results-header">
                <div className="results-title">
                  <h4>
                    <i className="fas fa-chart-bar"></i> Results
                    {showResults && <span className="result-count">{totalCount.toLocaleString()} records</span>}
                  </h4>
                  <div className="tab-buttons">
                    <button className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`} onClick={() => setActiveTab('table')}>
                      <i className="fas fa-table"></i> Table
                    </button>
                  </div>
                </div>
                {showResults && (
                  <button className="btn-export" onClick={() => exportData('csv')} disabled={exporting}>
                    <i className="fas fa-download"></i> Export
                  </button>
                )}
              </div>

              {!showResults ? (
                <div className="no-data-preview">
                  <i className="fas fa-chart-line"></i>
                  <h4>No Data Loaded</h4>
                  <p>Select filters and click "Show Data" to view agricultural statistics.</p>
                  <div className="preview-hint">
                    <i className="fas fa-lightbulb"></i>
                    <span>Hint: Start by selecting a subsector from the Items Aggregated section</span>
                  </div>
                </div>
              ) : loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Loading data...</p>
                </div>
              ) : data.length === 0 ? (
                <div className="no-data">
                  <i className="fas fa-inbox"></i>
                  <p>No data found. Try adjusting your filters.</p>
                  <button className="btn-clear-filters-mini" onClick={clearAllFilters}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Area</th>
                          <th>Indicator</th>
                          <th>Item</th>
                          <th>Year</th>
                          <th>Value</th>
                          <th>Unit</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((item) => (
                          <tr key={item.id}>
                            <td data-label="Area">{item.area_name}</td>
                            <td data-label="Indicator">{item.indicator_name}</td>
                            <td data-label="Item">{item.item_name}</td>
                            <td data-label="Year">{item.time_period}</td>
                            <td data-label="Value" className="data-value">
                              {item.data_value?.toLocaleString()}
                              {item.flag && <span className="flag-badge">{item.flag}</span>}
                            </td>
                            <td data-label="Unit">{item.unit_symbol}</td>
                            <td data-label="Actions">
                              <button 
                                className="btn-view-details" 
                                onClick={() => {
                                  setPreviewDetailsData(item);
                                  setShowPreviewDetailsModal(true);
                                }}
                                title="View Details"
                              >
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
                    <div className="pagination">
                      <button
                        onClick={() => fetchData(currentPage - 1, pageSize)}
                        disabled={currentPage === 1}
                      >
                        <i className="fas fa-chevron-left"></i> Previous
                      </button>
                      <div className="pagination-info">
                        <span className="page-info">
                          Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                        </span>
                        <span className="total-info">
                          ({totalCount.toLocaleString()} total records)
                        </span>
                      </div>
                      <button
                        onClick={() => fetchData(currentPage + 1, pageSize)}
                        disabled={currentPage === Math.ceil(totalCount / pageSize)}
                      >
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
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Last Update Info */}
            <div className="last-update">
              <i className="fas fa-clock"></i>
              <span>Last Update: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <a href="#" className="update-link" onClick={(e) => { e.preventDefault(); if (hasFilters) handleShowData(); }}>
                <i className="fas fa-sync-alt"></i> Refresh
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Details Modal */}
      {showPreviewDetailsModal && previewDetailsData && (
        <div className="modal-overlay nested-modal" onClick={() => setShowPreviewDetailsModal(false)}>
          <div className="modal-content preview-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-info-circle"></i> Data Details
              </h3>
              <button className="modal-close" onClick={() => setShowPreviewDetailsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-item full-width">
                  <div className="detail-header">
                    <i className="fas fa-map-marker-alt"></i> Location Information
                  </div>
                  <div className="detail-content">
                    <div className="detail-row">
                      <span className="detail-label">Area:</span>
                      <span className="detail-value">{previewDetailsData.area_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Area Level:</span>
                      <span className="detail-value">{previewDetailsData.area_level}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-item full-width">
                  <div className="detail-header">
                    <i className="fas fa-chart-line"></i> Agricultural Data
                  </div>
                  <div className="detail-content">
                    <div className="detail-row">
                      <span className="detail-label">Sector:</span>
                      <span className="detail-value">{previewDetailsData.sector_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Subsector:</span>
                      <span className="detail-value">{previewDetailsData.subsector_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Indicator:</span>
                      <span className="detail-value">{previewDetailsData.indicator_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Item:</span>
                      <span className="detail-value">{previewDetailsData.item_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Domain:</span>
                      <span className="detail-value">{previewDetailsData.domain_name}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-header">
                    <i className="fas fa-chart-simple"></i> Value Information
                  </div>
                  <div className="detail-content">
                    <div className="detail-row">
                      <span className="detail-label">Time Period:</span>
                      <span className="detail-value">{previewDetailsData.time_period}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Value:</span>
                      <span className="detail-value highlight">
                        {previewDetailsData.data_value?.toLocaleString()} {previewDetailsData.unit_symbol}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Unit:</span>
                      <span className="detail-value">{previewDetailsData.unit_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Flag:</span>
                      <span className="detail-value">{previewDetailsData.flag || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-header">
                    <i className="fas fa-building"></i> Source Information
                  </div>
                  <div className="detail-content">
                    <div className="detail-row">
                      <span className="detail-label">Source:</span>
                      <span className="detail-value">{previewDetailsData.source_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Provider:</span>
                      <span className="detail-value">{previewDetailsData.provider_name}</span>
                    </div>
                  </div>
                </div>

                {previewDetailsData.notes && (
                  <div className="detail-item full-width">
                    <div className="detail-header">
                      <i className="fas fa-sticky-note"></i> Additional Notes
                    </div>
                    <div className="detail-content">
                      <div className="detail-row">
                        <span className="detail-value notes-text">{previewDetailsData.notes}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="detail-item full-width">
                  <div className="detail-header">
                    <i className="fas fa-clock"></i> Metadata
                  </div>
                  <div className="detail-content">
                    <div className="detail-row">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">{new Date(previewDetailsData.created_at).toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Last Updated:</span>
                      <span className="detail-value">{new Date(previewDetailsData.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={() => setShowPreviewDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NationalCountyData;