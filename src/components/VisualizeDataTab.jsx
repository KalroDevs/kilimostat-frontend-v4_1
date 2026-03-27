import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const API_BASE_URL = '/api';

const serializeParams = (params) => {
  const parts = [];
  Object.entries(params).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      val.forEach(v => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`));
    } else if (val !== undefined && val !== null) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
    }
  });
  return parts.join('&');
};

const stripCounty = (name = '') => name.replace(/\s*county$/i, '').trim();

const COLORS = [
  '#1f6e43', '#2196F3', '#e74c3c', '#9b59b6',
  '#f39c12', '#16a085', '#e91e63', '#3498db',
  '#795548', '#607D8B',
];

const tickFmt = v =>
  v >= 1e9 ? `${(v / 1e9).toFixed(1)}B`
  : v >= 1e6 ? `${(v / 1e6).toFixed(1)}M`
  : v >= 1e3 ? `${(v / 1e3).toFixed(1)}K`
  : v;

// ─── Card wrapper ─────────────────────────────────────────────────────────────
const VizCard = ({ title, subtitle, children, wide, full }) => (
  <div className={`viz-card${wide ? ' viz-card-wide' : ''}${full ? ' viz-card-full' : ''}`}>
    <div className="viz-card-header">
      <h4>{title}</h4>
      <p>{subtitle}</p>
    </div>
    {children}
  </div>
);

// ─── Share by county — ranked proportional bars ───────────────────────────────
const ShareBars = ({ data, itemName }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return <div className="viz-empty" style={{ padding: 20 }}>No data</div>;
  return (
    <div className="share-bars">
      {data.slice(0, 12).map((d, i) => {
        const pct = (d.value / total) * 100;
        return (
          <div key={d.name} className="share-bar-row">
            <span className="share-bar-rank">{i + 1}</span>
            <span className="share-bar-name" title={d.name}>{d.name}</span>
            <div className="share-bar-track">
              <div
                className="share-bar-fill"
                style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
              />
            </div>
            <span className="share-bar-pct">{pct.toFixed(1)}%</span>
            <span className="share-bar-val">{tickFmt(d.value)}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const VisualizeDataTab = ({ subsector, sector, filterOptions, subsectorItems, subsectorYears }) => {
  const sortedYears = useMemo(() => [...subsectorYears].sort(), [subsectorYears]);

  const [selectedItem, setSelectedItem] = useState('');
  const [focusArea, setFocusArea]       = useState('');
  const [fromYear, setFromYear]         = useState('');
  const [toYear, setToYear]             = useState('');
  const [aggregation, setAggregation]   = useState('average');

  const [rawData, setRawData]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [geoJson, setGeoJson]   = useState(null);

  useEffect(() => {
    if (sortedYears.length) {
      setFromYear(sortedYears[0]);
      setToYear(sortedYears[sortedYears.length - 1]);
    }
  }, [sortedYears]);

  useEffect(() => {
    if (subsectorItems.length && !selectedItem)
      setSelectedItem(String(subsectorItems[0].id));
  }, [subsectorItems]); // eslint-disable-line

  useEffect(() => {
    fetch('/ke_county.geojson')
      .then(r => r.json())
      .then(setGeoJson)
      .catch(() => setError('Could not load county map.'));
  }, []);

  useEffect(() => {
    if (selectedItem && fromYear && toYear && subsector?.id) fetchData();
  }, [selectedItem, fromYear, toYear, subsector?.id]); // eslint-disable-line

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/data/`, {
        params: { subsector: subsector.id, item: parseInt(selectedItem), page_size: 5000 },
        paramsSerializer: { serialize: serializeParams },
      });
      const all = res.data.results || res.data || [];
      const fy = parseInt(fromYear), ty = parseInt(toYear);
      setRawData(all.filter(r => {
        const y = parseInt(r.time_period);
        return !isNaN(y) && y >= fy && y <= ty;
      }));
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Aggregated value per county ───────────────────────────────────────────
  const areaAggregated = useMemo(() => {
    const map = {};
    rawData.forEach(r => {
      if (!r.area_name || r.data_value == null) return;
      if (!map[r.area_name]) map[r.area_name] = { name: r.area_name, areaId: r.area, vals: [] };
      map[r.area_name].vals.push(r.data_value);
    });
    return Object.values(map).map(a => {
      let value;
      if (aggregation === 'sum')       value = a.vals.reduce((s, v) => s + v, 0);
      else if (aggregation === 'last') value = a.vals[a.vals.length - 1];
      else                             value = a.vals.reduce((s, v) => s + v, 0) / a.vals.length;
      return { ...a, value: Math.round(value * 100) / 100 };
    }).sort((a, b) => b.value - a.value);
  }, [rawData, aggregation]);

  // ── Time-series ───────────────────────────────────────────────────────────
  const timeSeriesData = useMemo(() => {
    const yMap = {};
    rawData.forEach(r => {
      if (!r.time_period || r.data_value == null) return;
      if (!yMap[r.time_period]) yMap[r.time_period] = { year: r.time_period };
      yMap[r.time_period][r.area_name] = (yMap[r.time_period][r.area_name] || 0) + r.data_value;
    });
    return Object.values(yMap).sort((a, b) => String(a.year).localeCompare(String(b.year)));
  }, [rawData]);

  // Which areas to show on the line chart
  const lineAreas = useMemo(() => {
    if (focusArea) {
      const match = areaAggregated.find(a =>
        stripCounty(a.name).toLowerCase() === stripCounty(focusArea).toLowerCase() ||
        a.name.toLowerCase().includes(focusArea.toLowerCase())
      );
      if (match) return [match, ...areaAggregated.filter(a => a !== match).slice(0, 2)];
    }
    return areaAggregated.slice(0, 3);
  }, [areaAggregated, focusArea]);

  // ── Map style: only highlight selected county ─────────────────────────────
  const isSelectedCounty = (countyProp) => {
    if (!focusArea) return false;
    const geo = countyProp.toLowerCase();
    const sel = focusArea.toLowerCase();
    return geo === stripCounty(sel).toLowerCase() ||
           geo === sel ||
           sel.includes(geo) ||
           geo.includes(stripCounty(sel).toLowerCase());
  };

  const geoJsonStyle = (feature) => {
    const selected = isSelectedCounty(feature.properties.COUNTY || '');
    return {
      fillColor: selected ? '#c0392b' : '#4a9e6b',
      weight: selected ? 2.5 : 1,
      color: selected ? '#7b241c' : '#2d6a47',
      fillOpacity: selected ? 0.55 : 0.15,
    };
  };

  const onEachFeature = (feature, layer) => {
    const geoCty = feature.properties.COUNTY;
    const match = areaAggregated.find(a =>
      stripCounty(a.name).toLowerCase() === geoCty.toLowerCase() ||
      a.name.toLowerCase() === geoCty.toLowerCase()
    );
    layer.bindTooltip(
      `<strong>${geoCty}</strong>${match ? `<br/>${match.value.toLocaleString()}` : ''}`,
      { sticky: true }
    );
    layer.on({ click: () => setFocusArea(geoCty) });
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const top10     = areaAggregated.slice(0, 10);
  const shareData = top10.map(a => ({ name: stripCounty(a.name), value: a.value }));
  const top8horiz = areaAggregated.slice(0, 8).map(a => ({ name: stripCounty(a.name), value: a.value }));

  const selectedItemName = subsectorItems.find(i => String(i.id) === selectedItem)?.name || '';
  const aggrLabel = aggregation.charAt(0).toUpperCase() + aggregation.slice(1);
  const yearLabel = fromYear === toYear ? String(fromYear) : `${fromYear} – ${toYear}`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="viz-tab">

      {/* Filter bar */}
      <div className="viz-filter-bar">
        <div className="viz-filter-group">
          <label>Item</label>
          <select value={selectedItem} onChange={e => setSelectedItem(e.target.value)}>
            {subsectorItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div className="viz-filter-group">
          <label>Area</label>
          <select value={focusArea} onChange={e => setFocusArea(e.target.value)}>
            <option value="">All Counties</option>
            {filterOptions.areas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
        </div>
        <div className="viz-filter-group">
          <label>From Year</label>
          <select value={fromYear} onChange={e => setFromYear(e.target.value)}>
            {sortedYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="viz-filter-group">
          <label>To Year</label>
          <select value={toYear} onChange={e => setToYear(e.target.value)}>
            {sortedYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="viz-filter-group">
          <label>Aggregation</label>
          <select value={aggregation} onChange={e => setAggregation(e.target.value)}>
            <option value="average">Average</option>
            <option value="sum">Sum</option>
            <option value="last">Last Value</option>
          </select>
        </div>
        <button className="viz-apply-btn" onClick={fetchData} disabled={loading}>
          {loading
            ? <><i className="fas fa-spinner fa-spin"></i> Loading…</>
            : <><i className="fas fa-sync-alt"></i> Apply</>}
        </button>
      </div>

      {error && <div className="viz-error"><i className="fas fa-exclamation-triangle"></i> {error}</div>}

      {loading ? (
        <div className="viz-loading">
          <i className="fas fa-spinner fa-spin fa-2x"></i>
          <p>Loading visualization data…</p>
        </div>
      ) : rawData.length === 0 && !error ? (
        <div className="viz-empty">
          <i className="fas fa-chart-bar"></i>
          <p>No data available for the selected filters.</p>
        </div>
      ) : (
        <>
          {/* Row 1: Map */}
          {geoJson && (
            <VizCard
              full
              title={`${selectedItemName} — ${focusArea ? stripCounty(focusArea) : 'All counties'}`}
              subtitle={`${aggrLabel} ${yearLabel}${focusArea ? '' : ' · Click a county to focus'}`}
            >
              <MapContainer
                key={`map-${subsector.id}`}
                center={[0.45, 37.9]}
                zoom={6}
                style={{ height: 440, width: '100%', borderRadius: 6 }}
                scrollWheelZoom={true}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <GeoJSON
                  key={`geo-${selectedItem}-${focusArea}-${aggregation}-${rawData.length}`}
                  data={geoJson}
                  style={geoJsonStyle}
                  onEachFeature={onEachFeature}
                />
              </MapContainer>

              <div className="viz-map-legend">
                <span className="viz-legend-swatch" style={{ background: '#c0392b', width: 20, height: 14 }} />
                <span className="viz-legend-label">{focusArea ? stripCounty(focusArea) : 'Selected county'}</span>
                <span className="viz-legend-swatch" style={{ background: '#4a9e6b', opacity: 0.4, width: 20, height: 14, marginLeft: 16 }} />
                <span className="viz-legend-label">Other counties</span>
                {focusArea && (
                  <button
                    className="viz-clear-area"
                    onClick={() => setFocusArea('')}
                  >
                    <i className="fas fa-times"></i> Clear selection
                  </button>
                )}
              </div>
            </VizCard>
          )}

          {/* Row 2: Line chart + Share bars */}
          <div className="viz-row">
            <VizCard
              wide
              title={`${selectedItemName} over time${focusArea ? ` — ${stripCounty(focusArea)}` : ' (top 3 counties)'}`}
              subtitle={yearLabel}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={65} tickFormatter={tickFmt} />
                  <Tooltip formatter={(v, n) => [v?.toLocaleString(), n]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {lineAreas.map((a, i) => (
                    <Line
                      key={a.name}
                      type="monotone"
                      dataKey={a.name}
                      stroke={COLORS[i % COLORS.length]}
                      dot={{ r: 3 }}
                      strokeWidth={2}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </VizCard>

            <VizCard
              title={`Share of ${selectedItemName} by county`}
              subtitle={`Top 12 · ${aggrLabel} ${yearLabel}`}
            >
              <ShareBars data={shareData} itemName={selectedItemName} />
            </VizCard>
          </div>

          {/* Row 3: Top-10 vertical bar + horizontal comparison */}
          <div className="viz-row">
            <VizCard
              wide
              title={`Top 10 counties — ${selectedItemName}`}
              subtitle={`${aggrLabel} ${yearLabel}`}
            >
              <ResponsiveContainer width="100%" height={270}>
                <BarChart
                  data={top10.map(a => ({ name: stripCounty(a.name), value: a.value }))}
                  margin={{ top: 5, right: 10, left: 0, bottom: 55 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11 }} width={65} tickFormatter={tickFmt} />
                  <Tooltip formatter={v => v.toLocaleString()} />
                  <Bar dataKey="value" name={selectedItemName} fill="#1f6e43" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </VizCard>

            <VizCard title="County comparison" subtitle={`${aggrLabel} ${yearLabel}`}>
              <ResponsiveContainer width="100%" height={270}>
                <BarChart
                  layout="vertical"
                  data={top8horiz}
                  margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={tickFmt} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={65} />
                  <Tooltip formatter={v => v.toLocaleString()} />
                  <Bar dataKey="value" name={selectedItemName} fill="#c0392b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </VizCard>
          </div>
        </>
      )}
    </div>
  );
};

export default VisualizeDataTab;
