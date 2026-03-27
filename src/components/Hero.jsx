import React from 'react';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <h1>Official Agricultural Data for a Food-Secure Kenya</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px' }}>
         KilimoSTAT is an open data platform by the Ministry of Agriculture and Livestock Development, providing trusted data and statistics on Kenya’s agricultural sector to support informed decision-making, research, and innovation. <br /><br /><br />
        </p>
        <div className="hero-stats">
          <div className="stat-item">
            <h4>480+</h4>
            <span>Items</span>
          </div>
          <div className="stat-item">
            <h4>100,000+</h4>
            <span>Data points</span>
          </div>
          <div className="stat-item">
            <h4>100%</h4>
            <span>Open Access</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;