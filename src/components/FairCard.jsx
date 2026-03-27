
import React from 'react';

const FairCard = ({ icon, title, description, onClick }) => {
  return (
    <div className="data-card" style={{ flex: 1, textAlign: 'center' }} onClick={onClick}>
      <i className={`fas ${icon}`} style={{ fontSize: '2rem' }}></i>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default FairCard;