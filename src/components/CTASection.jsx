import React from 'react';

const CTASection = ({ showToast }) => {
  return (
    <div className="container">
      <div className="cta-flat">
        {/* <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2.8rem', marginBottom: '20px' }}></i> */}
        <h2 style={{ color: 'white' }}>Get API Access Data Feeds</h2>
        <p style={{ color: '#cde2d4' }}>
          Subscribe and get API keys, and integrate with your applications
        </p>
        <div style={{ marginTop: '10px', display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            href="#" 
            className="btn" 
            style={{ background: '#f9c74f', color: 'var(--green-dark)' }} 
            onClick={(e) => {
              e.preventDefault();
              window.open("https://statistics.kilimo.go.ke/api/swagger/", "_blank");
            }}
            // onClick={() => showToast('Click https://statistics.kilimo.go.ke/api/swagger/')}

          >
            <i className="fas fa-key"></i> Get API Key
          </button>
         
        </div>
      </div>
    </div>
  );
};

export default CTASection;