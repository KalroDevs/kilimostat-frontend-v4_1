import React from 'react';

const DataCard = ({ icon, title, description, doi, onClick }) => {
  return (
    <div className="data-card" onClick={onClick}>
      <i className={`fas ${icon}`} style={{ fontSize: '2rem', color: 'var(--green-primary)' }}></i>
      <h3 style={{ margin: '12px 0' }}>{title}</h3>
      <p>{description}</p>
      {doi && <span className="doi-badge">DOI: {doi}</span>}
    </div>
  );
};

export default DataCard;