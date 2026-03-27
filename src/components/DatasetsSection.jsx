import React from 'react';
import DataCard from './DataCard';

const DatasetsSection = ({ showToast }) => {
  const handleDatasetInfo = (name) => {
    showToast(`📊 Dataset: ${name} - DOI available. Click to view full metadata.`);
  };

  return (
    <section style={{ background: 'var(--bg-white)' }}>
      <div className="container">
        <h2>📦 FAIR-Compliant Datasets</h2>
        <p className="section-subhead">Each dataset includes persistent DOI, rich metadata, and multiple formats</p>
        <div className="data-cards-grid">
          <DataCard
            icon="fa-corn"
            title="Crop Production"
            description="Maize, beans, wheat, rice yields by county"
            doi="In Maintenance Mode"
            onClick={() => handleDatasetInfo('Kenya Crop Production 2020-2025')}
          />
          <DataCard
            icon="fa-chart-line"
            title="Market Intelligence"
            description="Daily wholesale & retail prices across 47 counties"
            doi="In Maintenance Mode"
            onClick={() => handleDatasetInfo('Kenya Market Prices 2025')}
          />
          <DataCard
            icon="fa-water"
            title="Climate & Irrigation"
            description="Rainfall patterns, water usage, drought indices"
            doi="In Maintenance Mode"
            onClick={() => handleDatasetInfo('Climate & Irrigation Data')}
          />
        </div>
      </div>
    </section>
  );
};

export default DatasetsSection;