// components/NationalCountyData.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import SubsectorDataView from './SubsectorDataView';

const API_BASE_URL = '/api';

const getSectorIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('crop') || n.includes('cereal') || n.includes('horticulture') || n.includes('production')) return 'fa-seedling';
  if (n.includes('livestock') || n.includes('animal') || n.includes('dairy')) return 'fa-horse';
  if (n.includes('market') || n.includes('price') || n.includes('trade')) return 'fa-chart-line';
  if (n.includes('climate') || n.includes('weather') || n.includes('rainfall')) return 'fa-cloud-sun';
  if (n.includes('water') || n.includes('irrigation')) return 'fa-tint';
  if (n.includes('food') || n.includes('nutrition')) return 'fa-utensils';
  if (n.includes('fish') || n.includes('aqua')) return 'fa-fish';
  if (n.includes('forest') || n.includes('tree')) return 'fa-tree';
  if (n.includes('land') || n.includes('soil')) return 'fa-map';
  if (n.includes('employ') || n.includes('labour') || n.includes('labor')) return 'fa-users';
  if (n.includes('invest') || n.includes('finance')) return 'fa-coins';
  if (n.includes('agro') || n.includes('input') || n.includes('tractor')) return 'fa-tractor';
  return 'fa-database';
};

const NationalCountyData = () => {
  // view: 'sectors' | 'subsector-select'
  const [view, setView] = useState('sectors');
  const [selectedSubsector, setSelectedSubsector] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);

  // Sector browser
  const [sectors, setSectors] = useState([]);
  const [subsectorsBySector, setSubsectorsBySector] = useState({});
  const [sectorsLoading, setSectorsLoading] = useState(true);
  const [expandedSectors, setExpandedSectors] = useState({});

  // Shared filter options
  const [filterOptions, setFilterOptions] = useState({ areas: [], subgroupDimensions: [], subgroups: [] });
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);

  useEffect(() => {
    fetchSectorsAndSubsectors();
    fetchSharedFilterOptions();
  }, []); // eslint-disable-line

  const fetchSectorsAndSubsectors = async () => {
    setSectorsLoading(true);
    const [sectorsRes, subsectorsRes] = await Promise.allSettled([
      axios.get(`${API_BASE_URL}/sectors/`,    { timeout: 15000 }),
      axios.get(`${API_BASE_URL}/subsectors/`, { timeout: 15000 }),
    ]);
    const sectorsData    = sectorsRes.status    === 'fulfilled' ? sectorsRes.value.data.results    || sectorsRes.value.data    || [] : [];
    const subsectorsData = subsectorsRes.status === 'fulfilled' ? subsectorsRes.value.data.results || subsectorsRes.value.data || [] : [];
    setSectors(sectorsData);
    const grouped = {};
    subsectorsData.forEach(sub => {
      const sectorId = typeof sub.sector === 'object' ? sub.sector?.id : sub.sector;
      if (sectorId != null) {
        if (!grouped[sectorId]) grouped[sectorId] = [];
        grouped[sectorId].push(sub);
      }
    });
    setSubsectorsBySector(grouped);
    setSectorsLoading(false);
  };

  const fetchSharedFilterOptions = async () => {
    setFilterOptionsLoading(true);
    const [areasRes, dimsRes, subgroupsRes] = await Promise.allSettled([
      axios.get(`${API_BASE_URL}/areas/`,               { timeout: 15000 }),
      axios.get(`${API_BASE_URL}/subgroup-dimensions/`,  { timeout: 15000 }),
      axios.get(`${API_BASE_URL}/subgroups/`,            { timeout: 15000 }),
    ]);
    const pick = r => r.status === 'fulfilled' ? r.value.data.results || r.value.data || [] : [];
    setFilterOptions({ areas: pick(areasRes), subgroupDimensions: pick(dimsRes), subgroups: pick(subgroupsRes) });
    setFilterOptionsLoading(false);
  };

  const handleSubsectorClick = (sub, sector) => {
    setSelectedSubsector(sub);
    setSelectedSector(sector);
    setView('subsector-select');
    window.scrollTo(0, 0);
  };

  const renderSectorItem = (sector) => {
    const subs = subsectorsBySector[sector.id] || [];
    const isExpanded = !!expandedSectors[sector.id];
    return (
      <div key={sector.id} className="sector-item">
        <div className="sector-item-header" onClick={() => setExpandedSectors(prev => ({ ...prev, [sector.id]: !prev[sector.id] }))}>
          <i className={`fas fa-caret-${isExpanded ? 'down' : 'right'} sector-caret`}></i>
          <i className={`fas ${getSectorIcon(sector.name)} sector-icon`}></i>
          <span className="sector-name">{sector.name}</span>
        </div>
        {isExpanded && (
          <div className="subsector-list">
            {subs.length > 0 ? subs.map(sub => (
              <a key={sub.id} href="#" className="subsector-link"
                onClick={e => { e.preventDefault(); handleSubsectorClick(sub, sector); }}>
                {sub.name}
              </a>
            )) : (
              <span className="no-subsectors">No subsectors available</span>
            )}
          </div>
        )}
        <div className="sector-divider"></div>
      </div>
    );
  };

  const renderSectorsBrowser = () => {
    if (sectorsLoading) return (
      <div className="sectors-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading sectors...</p>
      </div>
    );
    if (sectors.length === 0) return (
      <div className="sectors-empty">
        <i className="fas fa-inbox"></i>
        <p>No sectors available.</p>
      </div>
    );
    const half = Math.ceil(sectors.length / 2);
    return (
      <div className="sectors-browser">
        <div className="sectors-grid">
          <div className="sectors-col">{sectors.slice(0, half).map(renderSectorItem)}</div>
          <div className="sectors-col">{sectors.slice(half).map(renderSectorItem)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="national-county-data">

      {view !== 'subsector-select' && (
        <div className="data-page-header">
          <h1 className="data-page-title">National and County Data</h1>
          <div className="data-page-tabs">
            <button className="data-tab active">SECTORS</button>
          </div>
        </div>
      )}

      {view === 'sectors' && renderSectorsBrowser()}

      {view === 'subsector-select' && selectedSubsector && (
        <SubsectorDataView
          subsector={selectedSubsector}
          sector={selectedSector}
          filterOptions={filterOptions}
          filterOptionsLoading={filterOptionsLoading}
          onBack={() => setView('sectors')}
        />
      )}

    </div>
  );
};

export default NationalCountyData;
