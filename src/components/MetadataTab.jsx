import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = '/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (str) => {
  if (!str) return '—';
  const d = new Date(str);
  return isNaN(d) ? str : d.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
};

const QualityBadge = ({ category, score }) => {
  const map = {
    high:    { bg: '#d4edda', color: '#1a6b30', label: 'High Quality' },
    medium:  { bg: '#fff3cd', color: '#7d5a00', label: 'Medium Quality' },
    low:     { bg: '#fde2e2', color: '#8b1a1a', label: 'Low Quality' },
  };
  const cat = (category || '').toLowerCase();
  const style = map[cat] || { bg: '#e9ecef', color: '#495057', label: category || 'Unrated' };
  return (
    <span className="meta-quality-badge" style={{ background: style.bg, color: style.color }}>
      {style.label}{score != null ? ` · ${score}` : ''}
    </span>
  );
};

const ReviewBadge = ({ status }) => {
  const map = {
    approved:   { bg: '#d4edda', color: '#1a6b30', icon: 'fa-check-circle' },
    pending:    { bg: '#fff3cd', color: '#7d5a00', icon: 'fa-clock' },
    rejected:   { bg: '#fde2e2', color: '#8b1a1a', icon: 'fa-times-circle' },
    under_review: { bg: '#cce5ff', color: '#004085', icon: 'fa-search' },
  };
  const s = (status || '').toLowerCase();
  const style = map[s] || { bg: '#e9ecef', color: '#495057', icon: 'fa-question-circle' };
  return (
    <span className="meta-review-badge" style={{ background: style.bg, color: style.color }}>
      <i className={`fas ${style.icon}`}></i>
      {' '}{status || 'Unknown'}
    </span>
  );
};

const ScoreBar = ({ label, value }) => {
  const pct = Math.min(100, Math.max(0, parseFloat(value) || 0));
  const color = pct >= 75 ? '#1f6e43' : pct >= 50 ? '#f59e0b' : '#e74c3c';
  return (
    <div className="meta-score-row">
      <span className="meta-score-label">{label}</span>
      <div className="meta-score-track">
        <div className="meta-score-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="meta-score-value">{pct.toFixed(1)}%</span>
    </div>
  );
};

const Field = ({ label, value }) => (
  <div className="meta-field">
    <span className="meta-field-label">{label}</span>
    <span className="meta-field-value">{value || '—'}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const MetadataTab = ({ subsector, sector }) => {
  const [subsectorDetail, setSubsectorDetail] = useState(null);
  const [indicators,      setIndicators]      = useState([]);
  const [metaRecords,     setMetaRecords]     = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [metaLoading,     setMetaLoading]     = useState(true);
  const [expandedMeta,    setExpandedMeta]    = useState(null);

  // ── Fetch subsector detail + indicators in parallel ───────────────────────
  useEffect(() => {
    if (!subsector?.id) return;
    setLoading(true);
    setMetaLoading(true);
    setMetaRecords([]);
    setIndicators([]);

    Promise.allSettled([
      axios.get(`${API_BASE_URL}/subsectors/${subsector.id}/`),
      axios.get(`${API_BASE_URL}/indicators/`, { params: { subsector: subsector.id, page_size: 100 } }),
    ]).then(([subRes, indRes]) => {
      if (subRes.status === 'fulfilled') setSubsectorDetail(subRes.value.data);
      if (indRes.status === 'fulfilled') {
        const d = indRes.value.data;
        setIndicators(d.results || d || []);
      }
      setLoading(false);
    });

    // Fetch metadata — try subsector filter first
    axios.get(`${API_BASE_URL}/metadata/`, {
      params: { subsector: subsector.id, page_size: 50 },
    }).then(res => {
      const records = res.data.results || res.data || [];
      setMetaRecords(records);
    }).catch(() => {
      setMetaRecords([]);
    }).finally(() => setMetaLoading(false));

  }, [subsector?.id]); // eslint-disable-line

  // ── Aggregate quality stats across meta records ───────────────────────────
  const qualityStats = (() => {
    const valid = metaRecords.filter(r => r.quality_score != null);
    if (!valid.length) return null;
    const avg = f => (valid.reduce((s, r) => s + (parseFloat(r[f]) || 0), 0) / valid.length).toFixed(1);
    return {
      avgScore:       avg('quality_score'),
      avgCompleteness: avg('completeness'),
      avgAccuracy:    avg('accuracy'),
      avgConsistency: avg('consistency'),
      total: valid.length,
    };
  })();

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="meta-loading">
        <i className="fas fa-spinner fa-spin fa-2x"></i>
        <p>Loading metadata…</p>
      </div>
    );
  }

  const sub = subsectorDetail || subsector;

  return (
    <div className="meta-tab">

      {/* ── Section 1: Subsector overview ── */}
      <div className="meta-section">
        <div className="meta-overview-header">
          <div className="meta-overview-icon">
            <i className="fas fa-database"></i>
          </div>
          <div className="meta-overview-text">
            <h3>{sub.name}</h3>
            <p className="meta-sector-crumb">
              <i className="fas fa-layer-group"></i> {sector?.name || sub.sector_name}
            </p>
          </div>
          <div className="meta-overview-badges">
            {sub.is_active !== false && (
              <span className="meta-active-badge"><i className="fas fa-circle"></i> Active</span>
            )}
            {sub.code && <span className="meta-code-badge">{sub.code}</span>}
          </div>
        </div>

        {sub.description && (
          <p className="meta-description">{sub.description}</p>
        )}

        <div className="meta-stats-row">
          <div className="meta-stat">
            <span className="meta-stat-value">{indicators.length}</span>
            <span className="meta-stat-label">Indicators</span>
          </div>
          <div className="meta-stat">
            <span className="meta-stat-value">
              {indicators.reduce((s, i) => s + (i.data_count || 0), 0).toLocaleString()}
            </span>
            <span className="meta-stat-label">Data Records</span>
          </div>
          <div className="meta-stat">
            <span className="meta-stat-value">
              {indicators.filter(i => i.is_core_indicator).length}
            </span>
            <span className="meta-stat-label">Core Indicators</span>
          </div>
          {metaRecords.length > 0 && (
            <div className="meta-stat">
              <span className="meta-stat-value">{metaRecords.length}</span>
              <span className="meta-stat-label">Metadata Records</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 2: Quality summary (if metadata available) ── */}
      {!metaLoading && qualityStats && (
        <div className="meta-section">
          <h4 className="meta-section-title">
            <i className="fas fa-star-half-alt"></i> Data Quality Summary
          </h4>
          <div className="meta-quality-grid">
            <div className="meta-quality-overview">
              <div className="meta-quality-score-big">{qualityStats.avgScore}</div>
              <div className="meta-quality-score-label">Average Quality Score</div>
              <div style={{ marginTop: 6 }}>
                <QualityBadge score={null} category={
                  qualityStats.avgScore >= 75 ? 'high'
                  : qualityStats.avgScore >= 50 ? 'medium' : 'low'
                } />
              </div>
            </div>
            <div className="meta-quality-bars">
              <ScoreBar label="Completeness"  value={qualityStats.avgCompleteness} />
              <ScoreBar label="Accuracy"      value={qualityStats.avgAccuracy} />
              <ScoreBar label="Consistency"   value={qualityStats.avgConsistency} />
            </div>
          </div>
        </div>
      )}

      {/* ── Section 3: Indicators ── */}
      {indicators.length > 0 && (
        <div className="meta-section">
          <h4 className="meta-section-title">
            <i className="fas fa-list-ul"></i> Indicators ({indicators.length})
          </h4>
          <div className="meta-indicators-table">
            <div className="meta-ind-header">
              <span>Indicator</span>
              <span>Unit</span>
              <span>Domain</span>
              <span>Records</span>
              <span>Core</span>
            </div>
            {indicators.map(ind => (
              <div key={ind.id} className="meta-ind-row">
                <div className="meta-ind-name">
                  <span>{ind.name}</span>
                  {ind.description && (
                    <span className="meta-ind-desc">{ind.description}</span>
                  )}
                </div>
                <span className="meta-ind-unit">{ind.unit_symbol || ind.unit_name || '—'}</span>
                <span className="meta-ind-domain">{ind.domain_name || '—'}</span>
                <span className="meta-ind-count">{(ind.data_count || 0).toLocaleString()}</span>
                <span className="meta-ind-core">
                  {ind.is_core_indicator
                    ? <i className="fas fa-check-circle meta-icon-yes" title="Core indicator"></i>
                    : <i className="fas fa-minus meta-icon-no" title="Not core"></i>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 4: Metadata records ── */}
      {!metaLoading && metaRecords.length > 0 && (
        <div className="meta-section">
          <h4 className="meta-section-title">
            <i className="fas fa-file-alt"></i> Metadata Records
          </h4>
          <div className="meta-records-list">
            {metaRecords.map((rec, idx) => {
              const info = rec.data_record_info || {};
              const isOpen = expandedMeta === rec.uuid;
              return (
                <div key={rec.uuid || idx} className={`meta-record-card ${isOpen ? 'is-open' : ''}`}>
                  {/* Card header — always visible */}
                  <div
                    className="meta-record-header"
                    onClick={() => setExpandedMeta(isOpen ? null : rec.uuid)}
                  >
                    <div className="meta-record-header-left">
                      <span className="meta-record-id">{rec.record_identifier || `#${idx + 1}`}</span>
                      <span className="meta-record-indicator">
                        {info.indicator || '—'}
                      </span>
                    </div>
                    <div className="meta-record-header-right">
                      {rec.review_status && <ReviewBadge status={rec.review_status} />}
                      {rec.quality_category && (
                        <QualityBadge category={rec.quality_category} score={rec.quality_score} />
                      )}
                      <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} meta-chevron`}></i>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="meta-record-body">

                      {/* Data reference */}
                      <div className="meta-group">
                        <h5>Data Reference</h5>
                        <div className="meta-fields-grid">
                          <Field label="Indicator"    value={info.indicator} />
                          <Field label="Area"         value={info.area} />
                          <Field label="Time Period"   value={info.time_period} />
                          <Field label="Value"         value={info.value != null ? String(info.value) : null} />
                          <Field label="UUID"          value={rec.uuid} />
                          <Field label="Version"       value={rec.metadata_version || rec.version_notes} />
                        </div>
                      </div>

                      {/* Quality */}
                      <div className="meta-group">
                        <h5>Quality Metrics</h5>
                        <div className="meta-fields-grid">
                          <Field label="Quality Score"    value={rec.quality_score != null ? String(rec.quality_score) : null} />
                          <Field label="Category"         value={rec.quality_category} />
                          <Field label="Completeness"     value={rec.completeness != null ? `${rec.completeness}%` : null} />
                          <Field label="Accuracy"         value={rec.accuracy != null ? `${rec.accuracy}%` : null} />
                          <Field label="Consistency"      value={rec.consistency != null ? `${rec.consistency}%` : null} />
                          <Field label="Quality Check"    value={fmtDate(rec.quality_check_date)} />
                        </div>
                        {rec.quality_notes && (
                          <p className="meta-notes">{rec.quality_notes}</p>
                        )}
                      </div>

                      {/* Statistical */}
                      {(rec.mean != null || rec.sample_size != null) && (
                        <div className="meta-group">
                          <h5>Statistical Details</h5>
                          <div className="meta-fields-grid">
                            <Field label="Mean"             value={rec.mean != null ? String(rec.mean) : null} />
                            <Field label="Median"           value={rec.median != null ? String(rec.median) : null} />
                            <Field label="Std Deviation"    value={rec.standard_deviation != null ? String(rec.standard_deviation) : null} />
                            <Field label="Sample Size"      value={rec.sample_size != null ? String(rec.sample_size) : null} />
                            <Field label="Sampling Error"   value={rec.sampling_error} />
                            <Field label="Response Rate"    value={rec.response_rate != null ? `${rec.response_rate}%` : null} />
                            <Field label="Confidence Level" value={rec.confidence_level != null ? `${rec.confidence_level}%` : null} />
                            <Field label="CI Lower"         value={rec.confidence_interval_lower != null ? String(rec.confidence_interval_lower) : null} />
                            <Field label="CI Upper"         value={rec.confidence_interval_upper != null ? String(rec.confidence_interval_upper) : null} />
                          </div>
                        </div>
                      )}

                      {/* Source */}
                      <div className="meta-group">
                        <h5>Source &amp; Provenance</h5>
                        <div className="meta-fields-grid">
                          <Field label="Source"           value={rec.original_source_name} />
                          <Field label="Provenance Level" value={rec.provenance_level} />
                          <Field label="Methodology"      value={rec.methodology_type} />
                          <Field label="Official Stat"
                            value={rec.is_official_statistic != null
                              ? (rec.is_official_statistic ? 'Yes' : 'No')
                              : null} />
                        </div>
                        {rec.original_source_url && (
                          <a className="meta-source-link" href={rec.original_source_url} target="_blank" rel="noreferrer">
                            <i className="fas fa-external-link-alt"></i> View original source
                          </a>
                        )}
                        {rec.processing_notes && (
                          <p className="meta-notes">{rec.processing_notes}</p>
                        )}
                        {rec.methodology_description && (
                          <p className="meta-notes">{rec.methodology_description}</p>
                        )}
                      </div>

                      {/* Temporal & Geographic */}
                      <div className="meta-group">
                        <h5>Temporal &amp; Geographic Coverage</h5>
                        <div className="meta-fields-grid">
                          <Field label="Time Type"         value={rec.time_type} />
                          <Field label="Reference Start"   value={fmtDate(rec.reference_period_start)} />
                          <Field label="Reference End"     value={fmtDate(rec.reference_period_end)} />
                          <Field label="Geographic Level"  value={rec.geographic_level} />
                          <Field label="Geographic Scope"  value={rec.geographic_scope} />
                          <Field label="Spatial Resolution" value={rec.spatial_resolution} />
                        </div>
                      </div>

                      {/* Administrative */}
                      <div className="meta-group">
                        <h5>Administrative</h5>
                        <div className="meta-fields-grid">
                          <Field label="Access Level"   value={rec.access_level} />
                          <Field label="License"        value={rec.license} />
                          <Field label="Review Status"  value={rec.review_status} />
                          <Field label="Reviewed By"    value={rec.reviewed_by} />
                          <Field label="Approved By"    value={rec.approved_by} />
                          <Field label="Approval Date"  value={fmtDate(rec.approval_date)} />
                          <Field label="Published"      value={fmtDate(rec.published_at)} />
                          <Field label="Last Updated"   value={fmtDate(rec.updated_at)} />
                          <Field label="Downloads"      value={rec.download_count != null ? String(rec.download_count) : null} />
                          <Field label="Views"          value={rec.view_count != null ? String(rec.view_count) : null} />
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state for metadata */}
      {!metaLoading && metaRecords.length === 0 && (
        <div className="meta-section">
          <div className="meta-empty">
            <i className="fas fa-file-alt"></i>
            <p>No metadata records available for this subsector yet.</p>
          </div>
        </div>
      )}

      {metaLoading && (
        <div className="meta-section">
          <div className="meta-loading-inline">
            <i className="fas fa-spinner fa-spin"></i> Loading metadata records…
          </div>
        </div>
      )}

    </div>
  );
};

export default MetadataTab;
