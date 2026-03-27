// components/SubsectorDataView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import VisualizeDataTab from './VisualizeDataTab';
import MetadataTab from './MetadataTab';

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

// ─── Reusable Filter Panel ────────────────────────────────────────────────────

const FilterPanel = ({
  tabs, activeTab, onTabChange,
  searchValue, onSearchChange, searchPlaceholder,
  items, selectedItems, onToggle, onSelectAll, onClearAll,
  loading, badge,
}) => (
  <div className="fao-filter-panel">
    <div className="fao-panel-header">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`fao-panel-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
          {tab.id === activeTab && badge > 0 && (
            <span className="fao-panel-badge">{badge}</span>
          )}
        </button>
      ))}
    </div>

    <div className="fao-panel-search">
      <i className="fas fa-search"></i>
      <input
        type="text"
        placeholder={searchPlaceholder || 'Filter results...'}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        disabled={loading}
      />
    </div>

    <div className="fao-panel-list">
      {loading ? (
        <div className="fao-panel-loading">
          <i className="fas fa-spinner fa-spin"></i> Loading...
        </div>
      ) : items.length === 0 ? (
        <div className="fao-panel-empty">No results found</div>
      ) : (
        items.map((item) => {
          const id = item.id !== undefined ? item.id : item;
          const label = item.name !== undefined ? item.name : String(item);
          const checked = selectedItems.includes(id);
          return (
            <label key={id} className={`fao-panel-item ${checked ? 'is-checked' : ''}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(id)}
              />
              <span className="fao-item-label">{label}</span>
            </label>
          );
        })
      )}
    </div>

    <div className="fao-panel-footer">
      <button className="fao-btn-select-all" onClick={onSelectAll} disabled={loading || items.length === 0}>
        Select All
      </button>
      <button className="fao-btn-clear-all" onClick={onClearAll} disabled={loading}>
        Clear All
      </button>
    </div>
  </div>
);

// ─── Row Detail Modal ─────────────────────────────────────────────────────────

const DetailModal = ({ item, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3><i className="fas fa-chart-line"></i> Data Record</h3>
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      <div className="modal-body">
        <div className="preview-grid">
          <div className="preview-item"><label>Area</label><p>{item.area_name}</p></div>
          <div className="preview-item"><label>Sector</label><p>{item.sector_name}</p></div>
          <div className="preview-item"><label>Subsector</label><p>{item.subsector_name}</p></div>
          <div className="preview-item"><label>Indicator</label><p>{item.indicator_name}</p></div>
          <div className="preview-item"><label>Item</label><p>{item.item_name}</p></div>
          <div className="preview-item"><label>Domain</label><p>{item.domain_name}</p></div>
          <div className="preview-item"><label>Subgroup Dimension</label><p>{item.subgroup_dimension_name}</p></div>
          <div className="preview-item"><label>Subgroup</label><p>{item.subgroup_name}</p></div>
          <div className="preview-item"><label>Time Period</label><p>{item.time_period}</p></div>
          <div className="preview-item">
            <label>Value</label>
            <p className="preview-value">
              {item.data_value?.toLocaleString()} {item.unit_symbol}
              {item.flag && <span className="flag-badge" style={{ marginLeft: 8 }}>{item.flag}</span>}
            </p>
          </div>
          <div className="preview-item"><label>Source</label><p>{item.source_name}</p></div>
          <div className="preview-item"><label>Provider</label><p>{item.provider_name}</p></div>
          <div className="preview-item full-width"><label>Notes</label><p>{item.notes || 'No notes available'}</p></div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn-close" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SubsectorDataView = ({ subsector, sector, filterOptions, filterOptionsLoading, onBack }) => {
  const [mainTab, setMainTab] = useState('download');

  // Panel tab states
  const [areaPanelTab, setAreaPanelTab] = useState('counties');
  const [subgroupPanelTab, setSubgroupPanelTab] = useState('dimension');

  // Selection states
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedIndicators, setSelectedIndicators] = useState([]);
  const [selectedSubgroupDimensions, setSelectedSubgroupDimensions] = useState([]);
  const [selectedSubgroups, setSelectedSubgroups] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);

  // Search states per panel
  const [searchAreas, setSearchAreas] = useState('');
  const [searchIndicators, setSearchIndicators] = useState('');
  const [searchSubgroupDim, setSearchSubgroupDim] = useState('');
  const [searchSubgroup, setSearchSubgroup] = useState('');
  const [searchItems, setSearchItems] = useState('');
  const [searchYears, setSearchYears] = useState('');

  // Contextual data for this subsector
  const [subsectorIndicators, setSubsectorIndicators] = useState([]);
  const [subsectorItems, setSubsectorItems] = useState([]);
  const [subsectorYears, setSubsectorYears] = useState([]);
  const [loadingIndicators, setLoadingIndicators] = useState(false);
  const [loadingItemsYears, setLoadingItemsYears] = useState(false);

  // Inline preview state
  const [previewRows, setPreviewRows] = useState([]);
  const [allFilteredRows, setAllFilteredRows] = useState([]);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewPageSize] = useState(20);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Row detail modal
  const [detailItem, setDetailItem] = useState(null);

  // Download
  const [downloading, setDownloading] = useState(false);

  // ── Fetch contextual data when subsector changes ──────────────────────────

  useEffect(() => {
    if (!subsector?.id) return;
    setShowPreview(false);
    setPreviewRows([]);
    setSelectedAreas([]);
    setSelectedIndicators([]);
    setSelectedSubgroupDimensions([]);
    setSelectedSubgroups([]);
    setSelectedItems([]);
    setSelectedYears([]);
    fetchIndicatorsForSubsector();
    fetchItemsAndYearsForSubsector();
  }, [subsector?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // indicators.subsector FK → filter by subsector
  const fetchIndicatorsForSubsector = async () => {
    setLoadingIndicators(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/indicators/`, {
        params: { subsector: subsector.id },
        timeout: 15000,
      });
      setSubsectorIndicators(res.data.results || res.data || []);
    } catch (err) {
      console.error('Error fetching indicators:', err);
      setSubsectorIndicators([]);
    } finally {
      setLoadingIndicators(false);
    }
  };

  // Extract unique items + years from data records for this subsector
  const fetchItemsAndYearsForSubsector = async () => {
    setLoadingItemsYears(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/data/`, {
        params: { subsector: subsector.id, page_size: 1000 },
        timeout: 20000,
      });
      const records = res.data.results || res.data || [];

      const itemMap = {};
      records.forEach(r => {
        if (r.item && r.item_name) itemMap[r.item] = r.item_name;
      });
      setSubsectorItems(Object.entries(itemMap).map(([id, name]) => ({ id: parseInt(id), name })));

      const years = [...new Set(records.map(r => r.time_period))]
        .filter(Boolean).sort().reverse();
      setSubsectorYears(years);
    } catch (err) {
      console.error('Error fetching items/years:', err);
      setSubsectorItems([]);
      setSubsectorYears([]);
    } finally {
      setLoadingItemsYears(false);
    }
  };

  // ── Cascading: subgroups filter by selected dimensions ───────────────────

  const cascadedSubgroups = useMemo(() => {
    const all = filterOptions.subgroups || [];
    if (selectedSubgroupDimensions.length === 0) return all;
    return all.filter(s => selectedSubgroupDimensions.includes(s.dimension));
  }, [filterOptions.subgroups, selectedSubgroupDimensions]);

  useEffect(() => {
    if (selectedSubgroupDimensions.length > 0) {
      const validIds = cascadedSubgroups.map(s => s.id);
      setSelectedSubgroups(prev => prev.filter(id => validIds.includes(id)));
    }
  }, [selectedSubgroupDimensions]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filtered lists (search) ──────────────────────────────────────────────

  const filteredAreas = useMemo(() =>
    (filterOptions.areas || []).filter(a => a.name.toLowerCase().includes(searchAreas.toLowerCase())),
    [filterOptions.areas, searchAreas]);

  const filteredIndicators = useMemo(() =>
    subsectorIndicators.filter(i => i.name.toLowerCase().includes(searchIndicators.toLowerCase())),
    [subsectorIndicators, searchIndicators]);

  const filteredSubgroupDimensions = useMemo(() =>
    (filterOptions.subgroupDimensions || []).filter(d => d.name.toLowerCase().includes(searchSubgroupDim.toLowerCase())),
    [filterOptions.subgroupDimensions, searchSubgroupDim]);

  const filteredSubgroups = useMemo(() =>
    cascadedSubgroups.filter(s => s.name.toLowerCase().includes(searchSubgroup.toLowerCase())),
    [cascadedSubgroups, searchSubgroup]);

  const filteredItems = useMemo(() =>
    subsectorItems.filter(i => i.name.toLowerCase().includes(searchItems.toLowerCase())),
    [subsectorItems, searchItems]);

  const filteredYears = useMemo(() =>
    subsectorYears.filter(y => String(y).includes(searchYears))
      .map(y => ({ id: y, name: String(y) })),
    [subsectorYears, searchYears]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const toggle = (setList, id) =>
    setList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const buildParams = (extraParams = {}) => {
    const params = { sector: sector.id, subsector: subsector.id, ...extraParams };
    if (selectedAreas.length) params.area = selectedAreas;
    if (selectedIndicators.length) params.indicator = selectedIndicators;
    if (selectedSubgroupDimensions.length) params.subgroup_dimension = selectedSubgroupDimensions;
    if (selectedSubgroups.length) params.subgroup = selectedSubgroups;
    if (selectedItems.length) params.item = selectedItems;
    if (selectedYears.length) params.time_period = selectedYears.map(String);
    return params;
  };

  // ── Inline preview ────────────────────────────────────────────────────────

  const handlePreview = async (page = 1) => {
    setPreviewLoading(true);
    setPreviewError('');
    setShowPreview(true);
    try {
      if (page === 1) {
        // Fetch all records (area filter not supported by API — filter client-side)
        const res = await axios.get(`${API_BASE_URL}/data/`, {
          params: buildParams({ page_size: 5000 }),
          paramsSerializer: { serialize: serializeParams },
        });
        let rows = res.data.results || res.data || [];
        if (selectedAreas.length) {
          rows = rows.filter(r => selectedAreas.includes(r.area));
        }
        setAllFilteredRows(rows);
        setPreviewTotal(rows.length);
        setPreviewRows(rows.slice(0, previewPageSize));
        setPreviewPage(1);
      } else {
        // Paginate already-fetched rows
        const start = (page - 1) * previewPageSize;
        setPreviewRows(allFilteredRows.slice(start, start + previewPageSize));
        setPreviewPage(page);
      }
    } catch (err) {
      console.error('Preview error:', err);
      setPreviewError('Failed to load preview. Please try again.');
    } finally {
      setPreviewLoading(false);
    }
  };

  // ── Download CSV ──────────────────────────────────────────────────────────

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/data/`, {
        params: buildParams({ page_size: 10000 }),
        paramsSerializer: { serialize: serializeParams },
      });
      let records = res.data.results || res.data || [];
      if (selectedAreas.length) {
        records = records.filter(r => selectedAreas.includes(r.area));
      }
      if (!records.length) {
        alert('No data found with the current selection.');
        setDownloading(false);
        return;
      }
      const headers = ['Area', 'Sector', 'Subsector', 'Indicator', 'Item', 'Domain', 'Time Period', 'Value', 'Unit', 'Flag', 'Source'];
      const csvRows = [headers.join(',')];
      records.forEach(r => {
        csvRows.push([
          `"${(r.area_name || '').replace(/"/g, '""')}"`,
          `"${(r.sector_name || '').replace(/"/g, '""')}"`,
          `"${(r.subsector_name || '').replace(/"/g, '""')}"`,
          `"${(r.indicator_name || '').replace(/"/g, '""')}"`,
          `"${(r.item_name || '').replace(/"/g, '""')}"`,
          `"${(r.domain_name || '').replace(/"/g, '""')}"`,
          `"${(r.time_period || '').replace(/"/g, '""')}"`,
          r.data_value || '',
          `"${(r.unit_symbol || '').replace(/"/g, '""')}"`,
          `"${(r.flag || '').replace(/"/g, '""')}"`,
          `"${(r.source_name || '').replace(/"/g, '""')}"`,
        ].join(','));
      });
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kilimostat_${subsector.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const totalSelected = selectedAreas.length + selectedIndicators.length +
    selectedSubgroupDimensions.length + selectedSubgroups.length +
    selectedItems.length + selectedYears.length;

  const totalPages = Math.ceil(previewTotal / previewPageSize);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="subsector-data-view">

      {/* Header */}
      <div className="subsector-view-header">
        <div className="subsector-view-title">
          <div className="subsector-title-icon">
            <i className="fas fa-database"></i>
          </div>
          <h2>{subsector.name}</h2>
        </div>
        <button className="btn-back-to-sectors" onClick={onBack}>
          <i className="fas fa-undo-alt"></i> Back to sectors
        </button>
      </div>

      {/* Tabs */}
      <div className="subsector-main-tabs">
        <button className={`subsector-main-tab ${mainTab === 'download' ? 'active' : ''}`} onClick={() => setMainTab('download')}>
          DOWNLOAD DATA
        </button>
        <button className={`subsector-main-tab ${mainTab === 'visualize' ? 'active' : ''}`} onClick={() => setMainTab('visualize')}>
          VISUALIZE DATA
        </button>
        <button className={`subsector-main-tab ${mainTab === 'metadata' ? 'active' : ''}`} onClick={() => setMainTab('metadata')}>
          METADATA
        </button>
      </div>

      {/* ── DOWNLOAD DATA ── */}
      {mainTab === 'download' && (
        <div className="subsector-download-layout">

          {/* Filter panels */}
          <div className="subsector-panels-area">

            {/* Row 1: Counties | Indicators */}
            <div className="fao-panels-row">
              <FilterPanel
                tabs={[{ id: 'counties', label: 'COUNTIES' }]}
                activeTab={areaPanelTab}
                onTabChange={setAreaPanelTab}
                searchValue={searchAreas}
                onSearchChange={setSearchAreas}
                searchPlaceholder="e.g. Nairobi, Mombasa"
                items={filteredAreas}
                selectedItems={selectedAreas}
                onToggle={(id) => toggle(setSelectedAreas, id)}
                onSelectAll={() => setSelectedAreas(filteredAreas.map(a => a.id))}
                onClearAll={() => setSelectedAreas([])}
                loading={filterOptionsLoading}
                badge={selectedAreas.length}
              />
              <FilterPanel
                tabs={[{ id: 'indicators', label: 'INDICATORS' }]}
                activeTab="indicators"
                onTabChange={() => {}}
                searchValue={searchIndicators}
                onSearchChange={setSearchIndicators}
                searchPlaceholder="e.g. crop yield, production"
                items={filteredIndicators}
                selectedItems={selectedIndicators}
                onToggle={(id) => toggle(setSelectedIndicators, id)}
                onSelectAll={() => setSelectedIndicators(filteredIndicators.map(i => i.id))}
                onClearAll={() => setSelectedIndicators([])}
                loading={loadingIndicators}
                badge={selectedIndicators.length}
              />
            </div>

            {/* Row 2: Subgroup Dimension + Subgroup | Items */}
            <div className="fao-panels-row">
              <FilterPanel
                tabs={[
                  { id: 'dimension', label: 'SUBGROUP DIMENSION' },
                  { id: 'subgroup', label: 'SUBGROUP' },
                ]}
                activeTab={subgroupPanelTab}
                onTabChange={(tab) => {
                  setSubgroupPanelTab(tab);
                  if (tab === 'dimension') setSearchSubgroup('');
                  else setSearchSubgroupDim('');
                }}
                searchValue={subgroupPanelTab === 'dimension' ? searchSubgroupDim : searchSubgroup}
                onSearchChange={subgroupPanelTab === 'dimension' ? setSearchSubgroupDim : setSearchSubgroup}
                searchPlaceholder={
                  subgroupPanelTab === 'subgroup' && selectedSubgroupDimensions.length
                    ? 'Filtered by selected dimension'
                    : subgroupPanelTab === 'subgroup'
                      ? 'Select a dimension first to narrow results'
                      : 'e.g. Crops Productivity'
                }
                items={subgroupPanelTab === 'dimension' ? filteredSubgroupDimensions : filteredSubgroups}
                selectedItems={subgroupPanelTab === 'dimension' ? selectedSubgroupDimensions : selectedSubgroups}
                onToggle={(id) =>
                  subgroupPanelTab === 'dimension'
                    ? toggle(setSelectedSubgroupDimensions, id)
                    : toggle(setSelectedSubgroups, id)
                }
                onSelectAll={() =>
                  subgroupPanelTab === 'dimension'
                    ? setSelectedSubgroupDimensions(filteredSubgroupDimensions.map(d => d.id))
                    : setSelectedSubgroups(filteredSubgroups.map(s => s.id))
                }
                onClearAll={() =>
                  subgroupPanelTab === 'dimension'
                    ? setSelectedSubgroupDimensions([])
                    : setSelectedSubgroups([])
                }
                loading={filterOptionsLoading}
                badge={subgroupPanelTab === 'dimension' ? selectedSubgroupDimensions.length : selectedSubgroups.length}
              />
              <FilterPanel
                tabs={[{ id: 'items', label: 'ITEMS' }]}
                activeTab="items"
                onTabChange={() => {}}
                searchValue={searchItems}
                onSearchChange={setSearchItems}
                searchPlaceholder="e.g. maize, beans"
                items={filteredItems}
                selectedItems={selectedItems}
                onToggle={(id) => toggle(setSelectedItems, id)}
                onSelectAll={() => setSelectedItems(filteredItems.map(i => i.id))}
                onClearAll={() => setSelectedItems([])}
                loading={loadingItemsYears}
                badge={selectedItems.length}
              />
            </div>

            {/* Row 3: Years */}
            <div className="fao-panels-row fao-panels-row-single">
              <FilterPanel
                tabs={[{ id: 'years', label: 'YEARS' }]}
                activeTab="years"
                onTabChange={() => {}}
                searchValue={searchYears}
                onSearchChange={setSearchYears}
                searchPlaceholder="e.g. 2024"
                items={filteredYears}
                selectedItems={selectedYears}
                onToggle={(id) => toggle(setSelectedYears, id)}
                onSelectAll={() => setSelectedYears(filteredYears.map(y => y.id))}
                onClearAll={() => setSelectedYears([])}
                loading={loadingItemsYears}
                badge={selectedYears.length}
              />
            </div>

            {/* Cascade hint */}
            {selectedSubgroupDimensions.length > 0 && subgroupPanelTab === 'subgroup' && (
              <div className="fao-cascade-hint">
                <i className="fas fa-info-circle"></i>
                Showing subgroups for selected dimension(s) only.
                <button onClick={() => setSelectedSubgroupDimensions([])}>Clear dimension filter</button>
              </div>
            )}

            {/* Action buttons */}
            <div className="subsector-actions">
              <button className="btn-download-data" onClick={handleDownload} disabled={downloading}>
                <i className={`fas ${downloading ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
                {downloading ? 'Downloading...' : 'Download Data'}
              </button>
              <button className="btn-preview-results" onClick={() => handlePreview(1)} disabled={previewLoading}>
                <i className={`fas ${previewLoading ? 'fa-spinner fa-spin' : 'fa-table'}`}></i>
                {previewLoading ? 'Loading...' : 'Preview Data'}
              </button>
              {totalSelected > 0 && (
                <span className="fao-selection-summary">
                  {totalSelected} filter{totalSelected !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>

          </div>{/* end panels area */}

          {/* Right sidebar */}
          <div className="subsector-sidebar">
            <div className="sidebar-description">
              <h4>{subsector.name}</h4>
              <p>
                Statistical data for <strong>{subsector.name}</strong> under the{' '}
                <strong>{sector.name}</strong> sector across Kenya's 47 counties.
              </p>
              {subsectorIndicators.length > 0 && (
                <p style={{ marginTop: 10, marginBottom: 0 }}>
                  <strong>{subsectorIndicators.length}</strong> indicator{subsectorIndicators.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
                  <strong>{subsectorItems.length}</strong> item{subsectorItems.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
                  <strong>{subsectorYears.length}</strong> year{subsectorYears.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="sidebar-bulk-downloads">
              <h4><i className="fas fa-download"></i> Bulk Downloads</h4>
              <div className="bulk-download-links">
                <button className="bulk-link" onClick={handleDownload} disabled={downloading}>
                  <span>All {subsector.name} Data</span>
                  <span className="bulk-size">CSV</span>
                </button>
              </div>
              <div className="sidebar-last-update">
                <span className="sidebar-label">Source</span>
                <span>Kenya Ministry of Agriculture</span>
              </div>
              <div className="sidebar-last-update">
                <span className="sidebar-label">API</span>
                <a href="https://statistics.kilimo.go.ke/api/swagger/" target="_blank" rel="noreferrer">
                  API Documentation
                </a>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── VISUALIZE DATA ── */}
      {mainTab === 'visualize' && (
        <VisualizeDataTab
          subsector={subsector}
          sector={sector}
          filterOptions={filterOptions}
          subsectorItems={subsectorItems}
          subsectorYears={subsectorYears}
        />
      )}

      {/* ── METADATA ── */}
      {mainTab === 'metadata' && (
        <MetadataTab subsector={subsector} sector={sector} />
      )}

      {/* Preview modal */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal-content preview-modal" style={{ maxWidth: '90vw', width: 900 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-table"></i> Preview Results
                {previewTotal > 0 && (
                  <span className="inline-preview-count" style={{ marginLeft: 10, fontSize: '0.85rem', fontWeight: 400 }}>
                    {previewTotal.toLocaleString()} record{previewTotal !== 1 ? 's' : ''}
                  </span>
                )}
              </h3>
              <button className="modal-close" onClick={() => setShowPreview(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {previewError && (
                <div className="error-message">
                  <i className="fas fa-exclamation-triangle"></i> {previewError}
                </div>
              )}
              {previewLoading ? (
                <div className="loading-spinner">
                  <i className="fas fa-spinner fa-spin"></i> Loading data...
                </div>
              ) : previewRows.length === 0 ? (
                <div className="no-data">
                  <i className="fas fa-inbox"></i>
                  <p>No records match your current filter selection.</p>
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
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map(row => (
                          <tr key={row.id}>
                            <td>{row.area_name}</td>
                            <td>{row.indicator_name}</td>
                            <td>{row.item_name}</td>
                            <td>{row.time_period}</td>
                            <td className="data-value">
                              {row.data_value?.toLocaleString()}
                              {row.flag && <span className="flag-badge">{row.flag}</span>}
                            </td>
                            <td>{row.unit_symbol}</td>
                            <td>
                              <button
                                className="btn-preview"
                                title="View full details"
                                onClick={() => setDetailItem(row)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button onClick={() => handlePreview(previewPage - 1)} disabled={previewPage === 1}>
                        <i className="fas fa-chevron-left"></i> Previous
                      </button>
                      <span className="page-info">Page {previewPage} of {totalPages}</span>
                      <button onClick={() => handlePreview(previewPage + 1)} disabled={previewPage === totalPages}>
                        Next <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={() => setShowPreview(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Row detail modal — pops on eye icon click */}
      {detailItem && <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />}

    </div>
  );
};

export default SubsectorDataView;
