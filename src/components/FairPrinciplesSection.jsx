import React from 'react';
import FairCard from './FairCard';

const FairPrinciplesSection = ({ showToast }) => {
  const handleFairClick = (principle, message) => {
    showToast(message);
  };

  return (
    <section>
      <div className="container">
        <h2 style={{ textAlign: 'center' }}>🌍 FAIR Data Principles</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: '40px' }}>
          <FairCard
            icon="fa-search"
            title="Findable"
            description="Persistent identifiers & rich metadata"
            onClick={() => handleFairClick('Findable', 'Findable: All datasets have persistent DOIs and rich metadata')}
          />
          <FairCard
            icon="fa-unlock-alt"
            title="Accessible"
            description="Open APIs & standard protocols"
            onClick={() => handleFairClick('Accessible', 'Accessible: Open APIs with standard protocols (HTTPS, OAuth)')}
          />
          <FairCard
            icon="fa-exchange-alt"
            title="Interoperable"
            description="Multiple formats & vocabularies"
            onClick={() => handleFairClick('Interoperable', 'Interoperable: CSV, JSON, GeoJSON, RDF formats available')}
          />
          <FairCard
            icon="fa-recycle"
            title="Reusable"
            description="Clear licensing & provenance"
            onClick={() => handleFairClick('Reusable', 'Reusable: CC BY 4.0 license with clear provenance')}
          />
        </div>
      </div>
    </section>
  );
};

export default FairPrinciplesSection;