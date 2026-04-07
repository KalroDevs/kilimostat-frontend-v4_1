// components/VisualizeDataTab.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_BASE_URL = 'https://statistics.kilimo.go.ke/api';

const serializeParams = (params) => {
  const parts = [];
  Object.entries(params).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      val.forEach(v => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`));
    } else if (val !== undefined && val !== null && val !== '') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
    }
  });
  return parts.join('&');
};

const stripCounty = (name = '') => name.replace(/\s*county$/i, '').trim();

const COLORS = ['#1f6e43', '#2d8a54', '#3aa66b', '#4bb87a', '#5cc989', '#6dda98', '#7eeba7', '#8ffcb6'];
const CHART_COLORS = ['#1f6e43', '#e74c3c', '#3498db', '#f39c12', '#9b59b6', '#16a085', '#e91e63', '#795548'];

const tickFmt = v =>
  v >= 1e9 ? `${(v / 1e9).toFixed(1)}B`
  : v >= 1e6 ? `${(v / 1e6).toFixed(1)}M`
  : v >= 1e3 ? `${(v / 1e3).toFixed(1)}K`
  : v;

// Animated Counter Component
const AnimatedCounter = ({ value, label, icon }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <div className="stat-card-glass">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{count.toLocaleString()}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="tooltip-title">{label}</div>
        {payload.map((p, idx) => (
          <div key={idx} className="tooltip-item">
            <div className="tooltip-color" style={{ background: p.color || p.fill || '#1f6e43' }}></div>
            <span className="tooltip-label">{p.name}:</span>
            <span className="tooltip-value">{p.value?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Interactive County Map Component
const InteractiveCountyMap = ({ data, focusArea, onCountyClick, geoJson }) => {
  const [hoveredCounty, setHoveredCounty] = useState(null);
  
  const getMapColor = (value, maxValue) => {
    if (!maxValue || maxValue === 0) return '#c8e6c9';
    const intensity = value / maxValue;
    if (intensity < 0.2) return '#c8e6c9';
    if (intensity < 0.4) return '#a5d6a7';
    if (intensity < 0.6) return '#81c784';
    if (intensity < 0.8) return '#66bb6a';
    return '#4caf50';
  };
  
  const isSelectedCounty = (countyProp) => {
    if (!focusArea) return false;
    const geo = countyProp?.toLowerCase() || '';
    const sel = stripCounty(focusArea).toLowerCase();
    return geo === sel || sel.includes(geo) || geo.includes(sel);
  };
  
  const geoJsonStyle = (feature) => {
    const countyName = feature?.properties?.COUNTY || '';
    const match = data.find(d => 
      d.name.toLowerCase() === stripCounty(countyName).toLowerCase()
    );
    const isHovered = hoveredCounty === countyName;
    const isSelected = isSelectedCounty(countyName);
    
    return {
      fillColor: isSelected ? '#c0392b' : (match ? getMapColor(match.value, maxValue) : '#e0e0e0'),
      weight: isSelected ? 3 : (isHovered ? 2 : 1),
      color: isSelected ? '#7b241c' : (isHovered ? '#1f6e43' : '#2d6a47'),
      fillOpacity: 0.7,
      dashArray: isSelected ? '' : '',
    };
  };
  
  const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value), 1) : 1;
  
  const onEachFeature = (feature, layer) => {
    const countyName = feature?.properties?.COUNTY || '';
    const match = data.find(d => 
      d.name.toLowerCase() === stripCounty(countyName).toLowerCase()
    );
    
    layer.bindTooltip(
      `<div class="map-tooltip">
        <strong>${countyName}</strong>
        ${match ? `<div class="tooltip-value">${match.value.toLocaleString()}</div>` : '<div class="tooltip-value">No data</div>'}
      </div>`,
      { sticky: true }
    );
    
    layer.on({
      mouseover: () => setHoveredCounty(countyName),
      mouseout: () => setHoveredCounty(null),
      click: () => onCountyClick(countyName)
    });
  };
  
  if (!geoJson) return <div className="map-loading">Loading map...</div>;
  
  return (
    <div className="interactive-map">
      <MapContainer
        center={[0.45, 37.9]}
        zoom={6}
        style={{ height: 500, width: '100%', borderRadius: 16 }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          data={geoJson}
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
      <div className="map-legend-enhanced">
        <div className="legend-title">Value Intensity</div>
        <div className="legend-gradient">
          <div className="legend-color" style={{ background: '#c8e6c9' }}></div>
          <div className="legend-color" style={{ background: '#a5d6a7' }}></div>
          <div className="legend-color" style={{ background: '#81c784' }}></div>
          <div className="legend-color" style={{ background: '#66bb6a' }}></div>
          <div className="legend-color" style={{ background: '#4caf50' }}></div>
        </div>
        <div className="legend-labels">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

// Main Component
const VisualizeDataTab = ({ filterOptions = { areas: [] }, onLoadingChange }) => {
  const sortedYears = useMemo(() => {
    const years = [];
    for (let year = 2012; year <= 2025; year++) years.push(year);
    return years;
  }, []);

  const [selectedIndicator, setSelectedIndicator] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [fromYear, setFromYear] = useState('2012');
  const [toYear, setToYear] = useState('2025');
  const [aggregation, setAggregation] = useState('average');
  const [chartView, setChartView] = useState('trend');

  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [geoJson, setGeoJson] = useState(null);
  
  const [allIndicators, setAllIndicators] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    fetchIndicators();
    fetchItems();
  }, []);

  useEffect(() => {
    if (selectedIndicator) {
      setFilteredItems(allItems);
      setSelectedItem('');
    }
  }, [selectedIndicator, allItems]);

  useEffect(() => {
    if (allIndicators.length && !selectedIndicator) {
      setSelectedIndicator(String(allIndicators[0].id));
    }
  }, [allIndicators, selectedIndicator]);

  useEffect(() => {
    if (selectedIndicator && fromYear && toYear) {
      fetchData();
    }
  }, [selectedIndicator, selectedItem, fromYear, toYear, aggregation, focusArea]);

  useEffect(() => {
    fetch('/ke_county.geojson')
      .then(r => r.json())
      .then(setGeoJson)
      .catch(() => console.warn('Could not load county map.'));
  }, []);

  const fetchIndicators = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/indicators/`);
      const indicatorsData = response.data.results || response.data || [];
      setAllIndicators(indicatorsData);
    } catch (error) {
      console.error('Error fetching indicators:', error);
      setError('Failed to load indicators');
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/items/`);
      const itemsData = response.data.results || response.data || [];
      setAllItems(itemsData);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchData = async () => {
    if (!selectedIndicator) return;
    
    setLoading(true);
    setError('');
    if (onLoadingChange) onLoadingChange(true);
    
    try {
      const params = {
        indicator_id: parseInt(selectedIndicator),
        page_size: 5000
      };
      
      if (selectedItem) params.item_id = parseInt(selectedItem);
      if (focusArea) {
        const selectedAreaObj = filterOptions?.areas?.find(a => a.name === focusArea);
        if (selectedAreaObj) params.area_id = selectedAreaObj.id;
      }
      if (fromYear) params.time_period_min = fromYear;
      if (toYear) params.time_period_max = toYear;
      
      const res = await axios.get(`${API_BASE_URL}/data/`, {
        params,
        paramsSerializer: { serialize: serializeParams },
        timeout: 30000
      });
      
      const all = res.data.results || res.data || [];
      const fy = parseInt(fromYear);
      const ty = parseInt(toYear);
      const filtered = all.filter(r => {
        const y = parseInt(r.time_period);
        return !isNaN(y) && y >= fy && y <= ty;
      });
      
      setRawData(filtered);
      
      if (filtered.length === 0) {
        setError('No data found for the selected filters.');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  // Process data for charts
  const areaAggregated = useMemo(() => {
    const map = {};
    rawData.forEach(r => {
      if (!r.area_name || r.data_value == null) return;
      const areaName = stripCounty(r.area_name);
      if (!map[areaName]) map[areaName] = { name: areaName, vals: [] };
      map[areaName].vals.push(r.data_value);
    });
    return Object.values(map).map(a => {
      let value;
      if (aggregation === 'sum') value = a.vals.reduce((s, v) => s + v, 0);
      else if (aggregation === 'last') value = a.vals[a.vals.length - 1];
      else value = a.vals.reduce((s, v) => s + v, 0) / a.vals.length;
      return { name: a.name, value: Math.round(value * 100) / 100 };
    }).sort((a, b) => b.value - a.value);
  }, [rawData, aggregation]);

  const timeSeriesData = useMemo(() => {
    const yMap = {};
    rawData.forEach(r => {
      if (!r.time_period || r.data_value == null) return;
      if (!yMap[r.time_period]) yMap[r.time_period] = { year: r.time_period };
      const areaName = stripCounty(r.area_name);
      yMap[r.time_period][areaName] = (yMap[r.time_period][areaName] || 0) + r.data_value;
    });
    return Object.values(yMap).sort((a, b) => String(a.year).localeCompare(String(b.year)));
  }, [rawData]);

  const growthData = useMemo(() => {
    if (timeSeriesData.length < 2) return [];
    const firstYear = timeSeriesData[0];
    const lastYear = timeSeriesData[timeSeriesData.length - 1];
    
    return areaAggregated.slice(0, 10).map(county => {
      const firstVal = firstYear[county.name] || 0;
      const lastVal = lastYear[county.name] || 0;
      const growth = firstVal > 0 ? ((lastVal - firstVal) / firstVal) * 100 : 0;
      return { name: county.name, growth: Math.round(growth * 100) / 100, value: lastVal };
    }).sort((a, b) => b.growth - a.growth);
  }, [timeSeriesData, areaAggregated]);

  const pieData = areaAggregated.slice(0, 8).map((item, idx) => ({
    name: item.name,
    value: item.value,
    color: CHART_COLORS[idx % CHART_COLORS.length]
  }));

  const selectedIndicatorName = allIndicators.find(i => String(i.id) === selectedIndicator)?.name || '';
  const selectedItemName = allItems.find(i => String(i.id) === selectedItem)?.name || '';
  const displayName = selectedItemName || selectedIndicatorName;
  const totalValue = areaAggregated.reduce((sum, a) => sum + a.value, 0);
  const avgValue = totalValue / areaAggregated.length || 0;

  const renderChart = () => {
    const commonProps = {
      data: timeSeriesData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };
    
    switch(chartView) {
      case 'trend':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={timeSeriesData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1f6e43" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1f6e43" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#666' }} />
              <YAxis tick={{ fontSize: 11, fill: '#666' }} tickFormatter={tickFmt} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              {areaAggregated.slice(0, 5).map((area, idx) => (
                <Area
                  key={area.name}
                  type="monotone"
                  dataKey={area.name}
                  stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                  strokeWidth={2}
                  fill="url(#areaGradient)"
                  dot={{ r: 3, fill: CHART_COLORS[idx % CHART_COLORS.length] }}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        );
        
      case 'comparison':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={areaAggregated.slice(0, 15)} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" tickFormatter={tickFmt} tick={{ fontSize: 11, fill: '#666' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#666' }} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#1f6e43" radius={[0, 8, 8, 0]}>
                {areaAggregated.slice(0, 15).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'growth':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#666', angle: -45, textAnchor: 'end', height: 70 }} />
              <YAxis tick={{ fontSize: 11, fill: '#666' }} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="growth" fill="#e74c3c" radius={[8, 8, 0, 0]}>
                {growthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.growth > 0 ? '#2d8a54' : '#e74c3c'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'distribution':
        return (
          <div className="distribution-container">
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={true}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="pie-legend">
              {pieData.map((item, idx) => (
                <div key={idx} className="legend-item">
                  <div className="legend-color" style={{ background: item.color }}></div>
                  <span className="legend-name">{item.name}</span>
                  <span className="legend-value">{item.value.toLocaleString()}</span>
                  <span className="legend-percent">{((item.value / totalValue) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const availableAreas = filterOptions?.areas || [];

  return (
    <div className="visualize-tab-enhanced">
      

      {/* Filter Section */}
      <div className="filter-section-enhanced">
        <div className="filter-header-enhanced">
          <h3>
            <i className="fas fa-sliders-h"></i> Data Explorer
          </h3>
          <div className="filter-badge">
            <i className="fas fa-chart-line"></i> Interactive Visualizations
          </div>
        </div>
        
        <div className="filters-grid-enhanced">
          <div className="filter-group-enhanced">
            <label><i className="fas fa-chart-line"></i> Indicator <span className="required">*</span></label>
            <select value={selectedIndicator} onChange={e => setSelectedIndicator(e.target.value)} className="filter-select">
              {allIndicators.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          
          <div className="filter-group-enhanced">
            <label><i className="fas fa-box"></i> Item (Optional)</label>
            <select value={selectedItem} onChange={e => setSelectedItem(e.target.value)} className="filter-select">
              <option value="">All Items</option>
              {filteredItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          
          <div className="filter-group-enhanced">
            <label><i className="fas fa-map-marker-alt"></i> County</label>
            <select value={focusArea} onChange={e => setFocusArea(e.target.value)} className="filter-select">
              <option value="">All Counties</option>
              {availableAreas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
            </select>
          </div>
          
          <div className="filter-group-enhanced">
            <label><i className="fas fa-calendar"></i> Year Range</label>
            <div className="year-range">
              <select value={fromYear} onChange={e => setFromYear(e.target.value)} className="year-select">
                {sortedYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <span className="range-arrow">→</span>
              <select value={toYear} onChange={e => setToYear(e.target.value)} className="year-select">
                {sortedYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          
          <div className="filter-group-enhanced">
            <label><i className="fas fa-calculator"></i> Aggregation</label>
            <select value={aggregation} onChange={e => setAggregation(e.target.value)} className="filter-select">
              <option value="average">Average</option>
              <option value="sum">Sum</option>
              <option value="last">Latest Value</option>
            </select>
          </div>
          
          <div className="filter-actions-enhanced">
            <button className="btn-generate" onClick={fetchData} disabled={loading || !selectedIndicator}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Loading...</> : <><i className="fas fa-chart-line"></i> Generate Insights</>}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Stats Section */}
      {rawData.length > 0 && !loading && (
        <div className="stats-grid-enhanced">
          <AnimatedCounter value={areaAggregated.length} label="Regions with Data" icon={<i className="fas fa-map-marker-alt"></i>} />
        </div>
      )}

      {error && (
        <div className="error-message-enhanced">
          <i className="fas fa-exclamation-triangle"></i> {error}
          <button onClick={fetchData}><i className="fas fa-redo-alt"></i> Retry</button>
        </div>
      )}

      {loading ? (
        <div className="loading-enhanced">
          <div className="loading-spinner"></div>
          <p>Analyzing agricultural data...</p>
        </div>
      ) : rawData.length === 0 && !error ? (
        <div className="empty-state-enhanced">
          <div className="empty-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <h4>Ready to Explore Data</h4>
          <p>Select an indicator and click "Generate Insights" to visualize agricultural trends across Kenya's counties.</p>
          <div className="empty-hint">
            <i className="fas fa-lightbulb"></i>
            <span>Try selecting "Crop Yield" or "Production Quantity" to get started</span>
          </div>
        </div>
      ) : rawData.length > 0 ? (
        <>
          {/* Chart Navigation */}
          <div className="chart-nav-enhanced">
            <button className={`nav-btn ${chartView === 'trend' ? 'active' : ''}`} onClick={() => setChartView('trend')}>
              <i className="fas fa-chart-line"></i> Trend Analysis
            </button>
            <button className={`nav-btn ${chartView === 'comparison' ? 'active' : ''}`} onClick={() => setChartView('comparison')}>
              <i className="fas fa-chart-bar"></i> County Ranking
            </button>
            <button className={`nav-btn ${chartView === 'growth' ? 'active' : ''}`} onClick={() => setChartView('growth')}>
              <i className="fas fa-chart-line"></i> Growth Rate
            </button>
            <button className={`nav-btn ${chartView === 'distribution' ? 'active' : ''}`} onClick={() => setChartView('distribution')}>
              <i className="fas fa-chart-pie"></i> Distribution
            </button>
          </div>

          {/* Chart Section */}
          <div className="chart-section-enhanced">
            <div className="chart-header-enhanced">
              <div>
                <h4>{displayName} Analysis</h4>
                <p>{aggregation === 'average' ? 'Average values' : aggregation === 'sum' ? 'Total values' : 'Latest values'} • {fromYear} - {toYear}</p>
              </div>
              {focusArea && (
                <div className="active-filter">
                  <i className="fas fa-map-marker-alt"></i> {stripCounty(focusArea)}
                  <button onClick={() => setFocusArea('')}><i className="fas fa-times"></i></button>
                </div>
              )}
              {selectedItem && (
                <div className="active-filter">
                  <i className="fas fa-box"></i> {selectedItemName}
                </div>
              )}
            </div>
            <div className="chart-body">
              {renderChart()}
            </div>
          </div>

          {/* Map Section */}
          <div className="map-section-enhanced">
            <div className="map-header-enhanced">
              <h4><i className="fas fa-map-marked-alt"></i> County Distribution Map</h4>
              <p>Click on any county to filter data • Color intensity represents value magnitude</p>
            </div>
            <InteractiveCountyMap 
              data={areaAggregated}
              focusArea={focusArea}
              onCountyClick={setFocusArea}
              geoJson={geoJson}
            />
          </div>

          {/* Top Counties Table */}
          <div className="ranking-section-enhanced">
            <div className="ranking-header">
              <h4><i className="fas fa-trophy"></i> Top Performing Counties</h4>
              <p>Based on {aggregation} {displayName}</p>
            </div>
            <div className="ranking-table-container">
              <table className="ranking-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>County</th>
                    <th>Value</th>
                    <th>Share</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {areaAggregated.slice(0, 10).map((county, idx) => {
                    const previousRank = areaAggregated.findIndex(c => c.name === county.name);
                    const isImproving = previousRank > idx;
                    return (
                      <tr key={county.name} onClick={() => setFocusArea(county.name)}>
                        <td className="rank-cell">
                          <span className={`rank-badge rank-${idx + 1}`}>{idx + 1}</span>
                        </td>
                        <td>{county.name}</td>
                        <td className="value-cell">{county.value.toLocaleString()}</td>
                        <td>
                          <div className="share-bar">
                            <div className="share-fill" style={{ width: `${(county.value / totalValue) * 100}%`, background: CHART_COLORS[idx % CHART_COLORS.length] }}></div>
                            <span>{((county.value / totalValue) * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td>
                          {isImproving ? <i className="fas fa-arrow-up trend-up"></i> : <i className="fas fa-arrow-down trend-down"></i>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default VisualizeDataTab;