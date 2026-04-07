// components/VisualizationPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale,
  TooltipItem
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

import { Link, useNavigate } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale
);

const VisualizationPage = () => {
  // State for data
  const [indicators, setIndicators] = useState([]);
  const [items, setItems] = useState([]);
  const [areas, setAreas] = useState([]);
  
  // State for selections
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [timeRange, setTimeRange] = useState({ start: '', end: '' });
  
  // State for chart data
  const [trendChartData, setTrendChartData] = useState(null);
  const [comparisonChartData, setComparisonChartData] = useState(null);
  const [distributionChartData, setDistributionChartData] = useState(null);
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [activeChart, setActiveChart] = useState('trend');
  const [rawData, setRawData] = useState([]);
  
  // State for notifications
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // State for search
  const [indicatorSearch, setIndicatorSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [areaSearch, setAreaSearch] = useState('');
  
  // API Base URL
  const API_BASE_URL = 'https://statistics.kilimo.go.ke/api';
  
  // Kenyan counties coordinates for map
  const countyCoordinates = {
    'BARINGO': { lat: 0.6667, lng: 36.0000 },
    'BOMET': { lat: -0.7833, lng: 35.1167 },
    'BUNGOMA': { lat: 0.5667, lng: 34.5667 },
    'BUSIA': { lat: 0.4667, lng: 34.1000 },
    'ELGEYO-MARAKWET': { lat: 0.5000, lng: 35.5000 },
    'EMBU': { lat: -0.5300, lng: 37.4600 },
    'GARRISA': { lat: -0.4632, lng: 39.6483 },
    'HOMA BAY': { lat: -0.5333, lng: 34.4500 },
    'ISIOLO': { lat: 0.3546, lng: 37.5822 },
    'KAJIADO': { lat: -1.8500, lng: 36.7833 },
    'KAKAMEGA': { lat: 0.2833, lng: 34.7500 },
    'KERICHO': { lat: -0.3667, lng: 35.2833 },
    'KIAMBU': { lat: -1.1667, lng: 36.8333 },
    'KILIFI': { lat: -3.5107, lng: 39.9093 },
    'KIRINYAGA': { lat: -0.5000, lng: 37.2833 },
    'KISII': { lat: -0.6833, lng: 34.7667 },
    'KISUMU': { lat: -0.1000, lng: 34.7500 },
    'KITUI': { lat: -1.3672, lng: 38.0104 },
    'KWALE': { lat: -4.1816, lng: 39.4606 },
    'LAIKIPIA': { lat: 0.3333, lng: 36.6667 },
    'LAMU': { lat: -2.2691, lng: 40.9023 },
    'MACHAKOS': { lat: -1.5177, lng: 37.2634 },
    'MAKUENI': { lat: -1.8169, lng: 37.6268 },
    'MANDERA': { lat: 3.9402, lng: 41.8551 },
    'MARSABIT': { lat: 2.3305, lng: 37.9912 },
    'MERU': { lat: 0.0500, lng: 37.6500 },
    'MIGORI': { lat: -1.0667, lng: 34.4667 },
    'MOMBASA': { lat: -4.0435, lng: 39.6682 },
    'MURANGA': { lat: -0.7167, lng: 37.1500 },
    'NAIROBI': { lat: -1.2864, lng: 36.8172 },
    'NAKURU': { lat: -0.2833, lng: 36.0667 },
    'NANDI': { lat: 0.1667, lng: 35.1333 },
    'NAROK': { lat: -1.0833, lng: 34.9167 },
    'NYAMIRA': { lat: -0.5667, lng: 34.9333 },
    'NYANDARUA': { lat: -0.3500, lng: 36.6500 },
    'NYERI': { lat: -0.4167, lng: 36.9500 },
    'SAMBURU': { lat: 1.1667, lng: 36.5000 },
    'SIAYA': { lat: -0.0667, lng: 34.2833 },
    'TAITA TAVETA': { lat: -3.3168, lng: 38.3790 },
    'TANA RIVER': { lat: -1.3965, lng: 40.0090 },
    'THARAKA NITHI': { lat: -0.3031, lng: 38.0032 },
    'TRANS NZOIA': { lat: 1.0000, lng: 35.0000 },
    'TURKANA': { lat: 3.5000, lng: 35.5000 },
    'UASIN GISHU': { lat: 0.5167, lng: 35.2833 },
    'VIHIGA': { lat: 0.0000, lng: 34.7167 },
    'WAJIR': { lat: 1.7470, lng: 40.0573 },
    'WEST POKOT': { lat: 1.5000, lng: 35.5000 }
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  // Fetch initial data
  useEffect(() => {
    fetchIndicators();
    fetchAreas();
    fetchItems();
  }, []);

  const fetchIndicators = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/indicators/`);
      const indicatorsData = response.data.results || response.data || [];
      setIndicators(indicatorsData);
    } catch (error) {
      console.error('Error fetching indicators:', error);
      showNotification('Failed to load indicators', 'error');
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/items/`);
      const itemsData = response.data.results || response.data || [];
      setItems(itemsData);
    } catch (error) {
      console.error('Error fetching items:', error);
      showNotification('Failed to load items', 'error');
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

  const fetchVisualizationData = async () => {
    if (!selectedIndicator) {
      showNotification('Please select an indicator', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      const params = {};
      
      if (selectedArea) params.area_id = selectedArea;
      if (selectedIndicator) params.indicator_id = selectedIndicator;
      if (selectedItem) params.item_id = selectedItem;
      if (timeRange.start) params.time_period_min = timeRange.start;
      if (timeRange.end) params.time_period_max = timeRange.end;
      
      params.page_size = 5000;
      
      console.log('Fetching visualization data with params:', params);
      
      const response = await axios.get(`${API_BASE_URL}/data/`, { params });
      const results = response.data.results || response.data || [];
      
      if (!results || results.length === 0) {
        showNotification('No data found for selected filters', 'warning');
        setTrendChartData(null);
        setComparisonChartData(null);
        setDistributionChartData(null);
        setMapData([]);
        setRawData([]);
        setLoading(false);
        return;
      }
      
      setRawData(results);
      
      // Process all visualizations
      const trendData = processTrendData(results);
      setTrendChartData(trendData);
      
      const comparisonData = processComparisonData(results);
      setComparisonChartData(comparisonData);
      
      const distributionData = processDistributionData(results);
      setDistributionChartData(distributionData);
      
      const countyData = processMapData(results);
      setMapData(countyData);
      
      showNotification(`Loaded ${results.length} records for visualization`, 'success');
    } catch (error) {
      console.error('Error fetching visualization data:', error);
      showNotification('Failed to load visualization data', 'error');
      setTrendChartData(null);
      setComparisonChartData(null);
      setDistributionChartData(null);
      setMapData([]);
    } finally {
      setLoading(false);
    }
  };

  const processTrendData = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }
    
    const yearMap = new Map();
    
    data.forEach(item => {
      const year = item.time_period;
      if (year) {
        if (!yearMap.has(year)) {
          yearMap.set(year, { sum: 0, count: 0 });
        }
        const entry = yearMap.get(year);
        entry.sum += item.data_value || 0;
        entry.count++;
      }
    });
    
    const sortedYears = Array.from(yearMap.keys()).sort();
    const values = sortedYears.map(year => {
      const entry = yearMap.get(year);
      return entry.count > 0 ? entry.sum / entry.count : 0;
    });
    
    let label = getSelectedLabel();
    
    return {
      labels: sortedYears,
      datasets: [
        {
          label: `${label} - Trend Over Time`,
          data: values,
          borderColor: '#1a472a',
          backgroundColor: 'rgba(26, 71, 42, 0.1)',
          tension: 0.4,
          fill: chartType === 'area',
          pointBackgroundColor: '#2d6a4f',
          pointBorderColor: '#1a472a',
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBorderWidth: 2,
        },
      ],
    };
  };

  const processComparisonData = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }
    
    // Group by area (county) for comparison
    const areaMap = new Map();
    
    data.forEach(item => {
      const areaName = item.area_name;
      if (areaName && areaName !== 'KENYA') {
        if (!areaMap.has(areaName)) {
          areaMap.set(areaName, { sum: 0, count: 0 });
        }
        const entry = areaMap.get(areaName);
        entry.sum += item.data_value || 0;
        entry.count++;
      }
    });
    
    const sortedAreas = Array.from(areaMap.entries())
      .map(([name, data]) => ({ name, value: data.sum / data.count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
    
    let label = getSelectedLabel();
    
    return {
      labels: sortedAreas.map(a => a.name.length > 15 ? a.name.substring(0, 12) + '...' : a.name),
      datasets: [
        {
          label: `${label} - County Comparison`,
          data: sortedAreas.map(a => a.value),
          backgroundColor: 'rgba(26, 71, 42, 0.7)',
          borderColor: '#1a472a',
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };
  };

  const processDistributionData = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }
    
    // Calculate value ranges for distribution
    const values = data.map(d => d.data_value || 0).filter(v => v > 0);
    if (values.length === 0) return null;
    
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = (maxValue - minValue) / 5;
    
    const ranges = [
      { min: minValue, max: minValue + range, label: `${Math.round(minValue)}-${Math.round(minValue + range)}` },
      { min: minValue + range, max: minValue + range * 2, label: `${Math.round(minValue + range)}-${Math.round(minValue + range * 2)}` },
      { min: minValue + range * 2, max: minValue + range * 3, label: `${Math.round(minValue + range * 2)}-${Math.round(minValue + range * 3)}` },
      { min: minValue + range * 3, max: minValue + range * 4, label: `${Math.round(minValue + range * 3)}-${Math.round(minValue + range * 4)}` },
      { min: minValue + range * 4, max: maxValue, label: `${Math.round(minValue + range * 4)}-${Math.round(maxValue)}` }
    ];
    
    const distribution = ranges.map(range => ({ label: range.label, count: 0 }));
    
    values.forEach(value => {
      for (let i = 0; i < ranges.length; i++) {
        if (value >= ranges[i].min && value <= ranges[i].max) {
          distribution[i].count++;
          break;
        }
      }
    });
    
    let label = getSelectedLabel();
    
    return {
      labels: distribution.map(d => d.label),
      datasets: [
        {
          label: `${label} - Value Distribution`,
          data: distribution.map(d => d.count),
          backgroundColor: [
            'rgba(26, 71, 42, 0.3)',
            'rgba(26, 71, 42, 0.45)',
            'rgba(26, 71, 42, 0.6)',
            'rgba(26, 71, 42, 0.75)',
            'rgba(26, 71, 42, 0.9)',
          ],
          borderColor: '#1a472a',
          borderWidth: 1,
        },
      ],
    };
  };

  const processMapData = (data) => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    const countyMap = new Map();
    
    data.forEach(item => {
      const countyName = item.area_name?.toUpperCase();
      if (countyName && countyCoordinates[countyName]) {
        if (!countyMap.has(countyName)) {
          countyMap.set(countyName, { sum: 0, count: 0, values: [] });
        }
        const entry = countyMap.get(countyName);
        entry.sum += item.data_value || 0;
        entry.count++;
        entry.values.push(item.data_value || 0);
      }
    });
    
    const mappedData = Array.from(countyMap.entries()).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
      value: data.count > 0 ? data.sum / data.count : 0,
      coordinates: countyCoordinates[name],
      recordCount: data.count
    }));
    
    return mappedData.sort((a, b) => b.value - a.value);
  };

  const getSelectedLabel = () => {
    if (selectedItem) {
      const item = items.find(i => i.id === selectedItem);
      return item ? item.name : 'Selected Item';
    }
    if (selectedIndicator) {
      const indicator = indicators.find(i => i.id === selectedIndicator);
      return indicator ? indicator.name : 'Selected Indicator';
    }
    return 'Data';
  };

  const getIndicatorName = () => {
    if (!indicators || !Array.isArray(indicators)) return '';
    const indicator = indicators.find(i => i.id === selectedIndicator);
    return indicator ? indicator.name : '';
  };

  const getItemName = () => {
    if (!items || !Array.isArray(items)) return '';
    const item = items.find(i => i.id === selectedItem);
    return item ? item.name : '';
  };

  const handleIndicatorSelect = (indicatorId) => {
    setSelectedIndicator(indicatorId);
    setSelectedItem(null);
    setTrendChartData(null);
    setComparisonChartData(null);
    setDistributionChartData(null);
    setMapData([]);
  };

  const handleItemSelect = (itemId) => {
    setSelectedItem(itemId);
    setTrendChartData(null);
    setComparisonChartData(null);
    setDistributionChartData(null);
    setMapData([]);
  };

  const handleAreaSelect = (areaId) => {
    setSelectedArea(areaId);
    setTrendChartData(null);
    setComparisonChartData(null);
    setDistributionChartData(null);
    setMapData([]);
  };

  const clearFilters = () => {
    setSelectedIndicator(null);
    setSelectedItem(null);
    setSelectedArea(null);
    setTimeRange({ start: '', end: '' });
    setTrendChartData(null);
    setComparisonChartData(null);
    setDistributionChartData(null);
    setMapData([]);
    setIndicatorSearch('');
    setItemSearch('');
    setAreaSearch('');
    showNotification('All filters cleared', 'info');
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 1963; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse();
  };

  const timePeriodYears = generateYears();

  // Filter indicators and items based on search
  const filteredIndicators = indicators.filter(ind => 
    ind.name.toLowerCase().includes(indicatorSearch.toLowerCase())
  );
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );
  
  const filteredAreas = areas.filter(area => 
    area.administrative_level === 'ADMIN_1' && 
    area.name !== 'KENYA' &&
    area.name.toLowerCase().includes(areaSearch.toLowerCase())
  );

  // Get color based on value for map
  const getMapColor = (value, maxValue) => {
    if (!maxValue || maxValue === 0) return '#c8e6c9';
    const intensity = value / maxValue;
    if (intensity < 0.25) return '#c8e6c9';
    if (intensity < 0.5) return '#81c784';
    if (intensity < 0.75) return '#388e3c';
    return '#1b5e20';
  };

  // Render map visualization
  const renderMap = () => {
    const maxValue = mapData.length > 0 ? Math.max(...mapData.map(d => d.value), 1) : 1;
    const sortedMapData = [...mapData].sort((a, b) => b.value - a.value);
    
    return (
      <div className="kenya-map-container">
        <div className="map-stats-summary">
          <div className="map-stat">
            <span className="map-stat-label">Counties with Data:</span>
            <span className="map-stat-value">{mapData.length} / 47</span>
          </div>
          <div className="map-stat">
            <span className="map-stat-label">Highest County:</span>
            <span className="map-stat-value">{sortedMapData[0]?.name || 'N/A'} ({sortedMapData[0]?.value?.toLocaleString() || 0})</span>
          </div>
          <div className="map-stat">
            <span className="map-stat-label">Lowest County:</span>
            <span className="map-stat-value">{sortedMapData[sortedMapData.length - 1]?.name || 'N/A'} ({sortedMapData[sortedMapData.length - 1]?.value?.toLocaleString() || 0})</span>
          </div>
          <div className="map-stat">
            <span className="map-stat-label">Average Value:</span>
            <span className="map-stat-value">{Math.round(sortedMapData.reduce((a,b) => a + b.value, 0) / mapData.length).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="map-visualization">
          <div className="map-grid-layout">
            {mapData.map((county, index) => (
              <div 
                key={county.name}
                className={`map-county-card ${selectedCounty === county.name ? 'active' : ''}`}
                onClick={() => setSelectedCounty(county.name)}
                style={{ 
                  borderLeftColor: getMapColor(county.value, maxValue),
                  backgroundColor: `${getMapColor(county.value, maxValue)}20`
                }}
              >
                <div className="county-card-name">{county.name}</div>
                <div className="county-card-value">{county.value.toLocaleString()}</div>
                <div className="county-card-bar">
                  <div 
                    className="county-card-bar-fill" 
                    style={{ 
                      width: `${(county.value / maxValue) * 100}%`,
                      backgroundColor: getMapColor(county.value, maxValue)
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="map-legend">
          <div className="legend-title">Value Intensity - {getSelectedLabel()}</div>
          <div className="legend-gradient">
            <div className="legend-color" style={{ background: '#c8e6c9' }}></div>
            <div className="legend-color" style={{ background: '#81c784' }}></div>
            <div className="legend-color" style={{ background: '#388e3c' }}></div>
            <div className="legend-color" style={{ background: '#1b5e20' }}></div>
          </div>
          <div className="legend-labels">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
            <span>Very High</span>
          </div>
        </div>
      </div>
    );
  };

  // Render county data list
  const renderCountyList = () => {
    if (!mapData || mapData.length === 0) {
      return (
        <div className="empty-county-stats">
          <i className="fas fa-chart-simple"></i>
          <p>County rankings will appear here</p>
        </div>
      );
    }
    
    return (
      <div className="county-list">
        <h4>County Rankings - {getSelectedLabel()}</h4>
        <div className="county-list-items">
          {mapData.map((county, index) => (
            <div 
              key={county.name} 
              className={`county-list-item ${selectedCounty === county.name ? 'active' : ''}`}
              onClick={() => setSelectedCounty(county.name)}
            >
              <span className="rank">{index + 1}</span>
              <span className="county-name">{county.name}</span>
              <span className="county-value">{county.value.toLocaleString()}</span>
              <span className="county-records">({county.recordCount} records)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render chart based on type
  const renderChart = () => {
    const getChartOptions = (title) => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: { 
          mode: 'index', 
          intersect: false,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) label += ': ';
              label += context.parsed.y.toLocaleString();
              return label;
            }
          }
        },
        title: { display: true, text: title, font: { size: 14 } }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Value' },
          ticks: { callback: (value) => value.toLocaleString() }
        },
        x: { 
          title: { display: true, text: activeChart === 'comparison' ? 'County' : 'Year' },
          ticks: { 
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true
          }
        }
      }
    });
    
    if (activeChart === 'trend' && trendChartData) {
      return <Line data={trendChartData} options={getChartOptions('Trend Analysis Over Time')} />;
    }
    if (activeChart === 'comparison' && comparisonChartData) {
      return <Bar data={comparisonChartData} options={getChartOptions('County Comparison')} />;
    }
    if (activeChart === 'distribution' && distributionChartData) {
      return <Bar data={distributionChartData} options={getChartOptions('Value Distribution')} />;
    }
    return null;
  };

  return (
    <div className="visualization-page">
      {/* Notification */}
      {notification.show && (
        <div className={`viz-notification ${notification.type}`}>
          <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Hero Section */}
      <div className="viz-hero">
        <div className="container">
          <h1>
            <i className="fas fa-chart-line"></i> Data Visualization
          </h1>
          <p><button style={{ padding: '8px 20px' }}><Link to="/national-county-data">
                            <i className="fa-solid fa-arrow-left"></i> Back to Data Download </Link></button></p>
        </div>
      </div>

      <div className="container">
        <div className="viz-layout">
          {/* Left Panel - Filters */}
          <div className="viz-filters-panel">
            <div className="viz-filters-header">
              <h3><i className="fas fa-sliders-h"></i> Data Filters</h3>
              <button className="viz-clear-btn" onClick={clearFilters}>
                <i className="fas fa-times"></i> Clear All
              </button>
            </div>

            {/* Indicator Selection */}
            <div className="viz-filter-group">
              <label><i className="fas fa-chart-line"></i> Indicator <span className="required-star">*</span></label>
              <div className="filter-search">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search indicators..."
                  value={indicatorSearch}
                  onChange={(e) => setIndicatorSearch(e.target.value)}
                />
              </div>
              <div className="options-list">
                {filteredIndicators.map(indicator => (
                  <label key={indicator.id} className={`option-radio ${selectedIndicator === indicator.id ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="indicator"
                      checked={selectedIndicator === indicator.id}
                      onChange={() => handleIndicatorSelect(indicator.id)}
                    />
                    <span className="radio-indicator"></span>
                    <span className="option-text">{indicator.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Item Selection (Optional) */}
            <div className="viz-filter-group">
              <label><i className="fas fa-box"></i> Item (Optional)</label>
              <div className="filter-search">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                />
              </div>
              <select value={selectedItem || ''} onChange={(e) => handleItemSelect(Number(e.target.value) || null)}>
                <option value="">All Items</option>
                {filteredItems.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            {/* Area Selection */}
            <div className="viz-filter-group">
              <label><i className="fas fa-map-marker-alt"></i> County (Optional)</label>
              <div className="filter-search">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search county..."
                  value={areaSearch}
                  onChange={(e) => setAreaSearch(e.target.value)}
                />
              </div>
              <select value={selectedArea || ''} onChange={(e) => handleAreaSelect(Number(e.target.value) || null)}>
                <option value="">All Counties</option>
                {filteredAreas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>

            {/* Time Range */}
            <div className="viz-filter-group">
              <label><i className="fas fa-calendar-alt"></i> Time Range</label>
              <div className="time-range">
                <select value={timeRange.start} onChange={(e) => setTimeRange({ ...timeRange, start: e.target.value })}>
                  <option value="">Start Year</option>
                  {timePeriodYears.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
                <span>to</span>
                <select value={timeRange.end} onChange={(e) => setTimeRange({ ...timeRange, end: e.target.value })}>
                  <option value="">End Year</option>
                  {timePeriodYears.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button 
              className="viz-generate-btn" 
              onClick={fetchVisualizationData}
              disabled={!selectedIndicator || loading}
            >
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Loading Data...</> : <><i className="fas fa-chart-line"></i> Generate Visualizations</>}
            </button>
          </div>

          {/* Right Panel - Visualizations */}
          <div className="viz-results-panel">
            {/* Chart Type Selector */}
            {(trendChartData || comparisonChartData || distributionChartData) && (
              <div className="chart-type-selector">
                <button className={`type-btn ${activeChart === 'trend' ? 'active' : ''}`} onClick={() => setActiveChart('trend')}>
                  <i className="fas fa-chart-line"></i> Trend Analysis
                </button>
                <button className={`type-btn ${activeChart === 'comparison' ? 'active' : ''}`} onClick={() => setActiveChart('comparison')}>
                  <i className="fas fa-chart-bar"></i> County Comparison
                </button>
                <button className={`type-btn ${activeChart === 'distribution' ? 'active' : ''}`} onClick={() => setActiveChart('distribution')}>
                  <i className="fas fa-chart-pie"></i> Value Distribution
                </button>
                <div className="chart-style-selector">
                  <button className={`style-btn ${chartType === 'line' ? 'active' : ''}`} onClick={() => setChartType('line')}>
                    <i className="fas fa-chart-line"></i>
                  </button>
                  <button className={`style-btn ${chartType === 'bar' ? 'active' : ''}`} onClick={() => setChartType('bar')}>
                    <i className="fas fa-chart-bar"></i>
                  </button>
                  <button className={`style-btn ${chartType === 'area' ? 'active' : ''}`} onClick={() => setChartType('area')}>
                    <i className="fas fa-chart-area"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Charts Container */}
            <div className="viz-chart-container">
              <div className="chart-header">
                <h3>
                  <i className="fas fa-chart-line"></i> {activeChart === 'trend' ? 'Trend Analysis' : activeChart === 'comparison' ? 'County Comparison' : 'Value Distribution'}
                  {selectedItem && <span className="chart-subtitle">{getItemName()}</span>}
                  {selectedIndicator && !selectedItem && <span className="chart-subtitle">{getIndicatorName()}</span>}
                </h3>
              </div>
              <div className="chart-wrapper">
                {loading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading visualization data...</p>
                  </div>
                ) : (trendChartData || comparisonChartData || distributionChartData) ? (
                  renderChart()
                ) : (
                  <div className="empty-chart">
                    <i className="fas fa-chart-line"></i>
                    <h4>No Data Loaded</h4>
                    <p>Select an indicator and click "Generate Visualizations"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Map and County Data */}
            <div className="viz-map-section">
              <div className="map-header">
                <h3><i className="fas fa-map-marked-alt"></i> County Distribution</h3>
              </div>
              <div className="map-grid">
                <div className="map-container">
                  {mapData && mapData.length > 0 ? renderMap() : (
                    <div className="empty-map">
                      <i className="fas fa-map"></i>
                      <p>Select filters and generate visualization to see county data</p>
                    </div>
                  )}
                </div>
                <div className="county-stats">
                  {renderCountyList()}
                </div>
              </div>
            </div>

            {/* Statistics Summary */}
            {trendChartData && trendChartData.datasets && trendChartData.datasets[0] && trendChartData.datasets[0].data && trendChartData.datasets[0].data.length > 0 && (
              <div className="viz-stats-summary">
                <h3><i className="fas fa-chart-simple"></i> Statistical Summary</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <i className="fas fa-chart-line"></i>
                    <div>
                      <label>Average Value</label>
                      <span>{(trendChartData.datasets[0].data.reduce((a,b) => a + b, 0) / trendChartData.datasets[0].data.length).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <i className="fas fa-arrow-up"></i>
                    <div>
                      <label>Highest Value</label>
                      <span>{Math.max(...trendChartData.datasets[0].data).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <i className="fas fa-arrow-down"></i>
                    <div>
                      <label>Lowest Value</label>
                      <span>{Math.min(...trendChartData.datasets[0].data).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <i className="fas fa-calendar"></i>
                    <div>
                      <label>Years Range</label>
                      <span>{trendChartData.labels[0]} - {trendChartData.labels[trendChartData.labels.length - 1]}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <i className="fas fa-map-marker-alt"></i>
                    <div>
                      <label>Counties with Data</label>
                      <span>{mapData.length} / 47</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <i className="fas fa-database"></i>
                    <div>
                      <label>Total Records</label>
                      <span>{rawData.length.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationPage;