import React from 'react';

const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border-light)', padding: '48px 0 32px', marginTop: '40px' }}>
      <div className="container">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '40px' }}>
          <div>
            <i className="fas fa-chart-line" style={{ fontSize: '1.8rem', color: 'var(--green-primary)' }}></i>
            <p style={{ marginTop: '12px' }}>
              KilimoSTAT is an official open data platform by the Ministry of Agriculture and Livestock Development, 
              providing trusted data and statistics on Kenya's agricultural sector to support informed decision-making, 
              research, and innovation.
            </p>
          </div>
          <div>
            <h4>FAIR Principles</h4>
            <a href="#" style={{ display: 'block', color: 'var(--gray-light)', textDecoration: 'none' }}>Findable</a>
            <a href="#" style={{ display: 'block' }}>Accessible</a>
            <a href="#" style={{ display: 'block' }}>Interoperable</a>
            <a href="#" style={{ display: 'block' }}>Reusable</a>
          </div>
          <div>
            <h4>Resources</h4>
            <a href="https://statistics.kilimo.go.ke/api/redoc/" style={{ display: 'block' }}>API Documentation</a>
            <a href="https://statistics.kilimo.go.ke/api/swagger/" style={{ display: 'block' }}>API Console</a>
            <a href="#" style={{ display: 'block' }}>FAQ</a>
          </div>
          <div>
            <h4>Connect</h4>
            <a href="https://x.com/kilimoKE" style={{ display: 'block' }}><i className="fab fa-twitter"></i> Twitter</a>
            <a href="https://www.facebook.com/profile.php?id=100064454481570&sk=about" style={{ display: 'block' }}><i className="fab fa-facebook"></i> Facebook</a>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border-light)', fontSize: '0.75rem' }}>
          © 2026 KilimoSTAT | CC BY 4.0 | <a href="https://kilimo.go.ke/">Ministry of Agriculture and Livestock Development</a> | version 4.1
        </div>
      </div>
    </footer>
  );
};

export default Footer;