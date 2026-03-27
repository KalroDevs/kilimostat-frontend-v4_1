// components/MobileMenu.jsx
import React from 'react';

const MobileMenu = ({ 
  isOpen, 
  onClose, 
  onOpenModal, 
  onFoodSystemsClick,
  onPageChange 
}) => {
  const [openDropdowns, setOpenDropdowns] = React.useState({
    data: false,
    dashboards: false,
    reports: false
  });

  const toggleDropdown = (dropdown) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  return (
    <>
      <div className={`mobile-menu-panel ${isOpen ? 'active' : ''}`}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '32px', 
          paddingBottom: '16px', 
          borderBottom: '1px solid var(--border-light)' 
        }}>
          <h3 style={{ color: 'var(--green-primary)' }}>
            <i className="fas fa-chart-line"></i> KilimoSTAT
          </h3>
          <span className="close-menu" onClick={onClose}>&times;</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Home Link */}
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              onPageChange('home');
              onClose();
            }}
            style={{ textDecoration: 'none', color: 'var(--gray-text)', fontWeight: 600 }}
          >
            <i className="fas fa-home"></i> Home
          </a>

          {/* About Link */}
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              onPageChange('about');
              onClose();
            }}
            style={{ textDecoration: 'none', color: 'var(--gray-text)', fontWeight: 600 }}
          >
            <i className="fas fa-info-circle"></i> About
          </a>
          
          {/* Data Dropdown */}
          <div className="mobile-dropdown">
            <div 
              className="mobile-dropdown-header"
              onClick={() => toggleDropdown('data')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                cursor: 'pointer',
                fontWeight: 600,
                color: 'var(--gray-text)'
              }}
            >
              <span>
                <i className="fas fa-database"></i> Data
              </span>
              <i className={`fas fa-chevron-${openDropdowns.data ? 'up' : 'down'}`}></i>
            </div>
            {openDropdowns.data && (
              <div style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange('national-county-data');
                    onClose();
                  }}
                  style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}
                >
                  <i className="fas fa-table"></i> National and County
                </a>
                <a href="https://www.nepad.org/caadp/countries/kenya" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  <i className="fas fa-chart-line"></i> Kenya CAADP
                </a>
                <a href="#" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  <i className="fas fa-map-marker-alt"></i> Geospatial Data
                </a>
                <a href="https://statistics.kilimo.go.ke/api/redoc/" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  <i className="fas fa-code"></i> API Dcumentation
                </a>
                <a href="https://statistics.kilimo.go.ke/api/swagger/" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  <i className="fas fa-code"></i> API Access
                </a>
                <a href="#" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  <i className="fas fa-download"></i> Bulk Downloads
                </a>
              </div>
            )}
          </div>
          
          {/* Dashboards Dropdown */}
          <div className="mobile-dropdown">
            <div 
              className="mobile-dropdown-header"
              onClick={() => toggleDropdown('dashboards')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                cursor: 'pointer',
                fontWeight: 600,
                color: 'var(--gray-text)'
              }}
            >
              <span>
                <i className="fas fa-chart-pie"></i> Dashboards
              </span>
              <i className={`fas fa-chevron-${openDropdowns.dashboards ? 'up' : 'down'}`}></i>
            </div>
            {openDropdowns.dashboards && (
              <div style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="https://kalro.org/kiamis/dashboard.html" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  <i className="fas fa-chart-line"></i> KIAMIS
                </a>
                <a href="https://kamis.kilimo.go.ke/" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  <i className="fas fa-chart-line"></i> KAMIS
                </a>
                <a href="#" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  <i className="fas fa-tractor"></i> Crop Production
                </a>
                <a href="#" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  <i className="fas fa-paw"></i> Livestock Monitor
                </a>
                <a href="#" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  <i className="fas fa-chart-pie"></i> Market Prices
                </a>
                <a href="#" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  <i className="fas fa-water"></i> Irrigation Index
                </a>
                <a href="#" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  <i className="fas fa-chart-bar"></i> Trade Analytics
                </a>
              </div>
            )}
          </div>
          
          {/* Reports Dropdown */}
          <div className="mobile-dropdown">
            <div 
              className="mobile-dropdown-header"
              onClick={() => toggleDropdown('reports')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                cursor: 'pointer',
                fontWeight: 600,
                color: 'var(--gray-text)'
              }}
            >
              <span>
                <i className="fas fa-file-alt"></i> Reports
              </span>
              <i className={`fas fa-chevron-${openDropdowns.reports ? 'up' : 'down'}`}></i>
            </div>
            {openDropdowns.reports && (
              <div style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="https://kilimo.go.ke/publications" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  <i className="fas fa-file-pdf"></i> Publications
                </a>
                <a href="https://kilimo.go.ke/reports/" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  <i className="fas fa-file-pdf"></i> Annual Reports
                </a>
                <a href="https://www.knbs.or.ke/economic-surveys/" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  <i className="fas fa-chart-column"></i> Economic Surveys
                </a>
                <a href="https://kilimo.go.ke/kenya-crop-conditions/" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  <i className="fas fa-chart-line"></i> Crop Conditions
                </a>
                <a href="https://kilimo.go.ke/ministry-policies/livestock-2/" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                  <i className="fas fa-chart-line"></i> Livestock Policy Outlook
                </a>
              </div>
            )}
          </div>
          
          {/* Food Systems Link */}
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              onFoodSystemsClick(e);
              onClose();
            }}
            style={{ textDecoration: 'none', color: 'var(--gray-text)', fontWeight: 600 }}
          >
            <i className="fas fa-utensils"></i> Food Systems 
            <i className="fas fa-external-link-alt" style={{ fontSize: '0.65rem', marginLeft: '6px', opacity: 0.6 }}></i>
          </a>
          
          
          
          {/* Definitions Link */}
          <a href="#" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontWeight: 600 }}>
            <i className="fas fa-book"></i> Definitions
          </a>
          
          {/* FAQ Link */}
          <a href="#" style={{ textDecoration: 'none', color: 'var(--gray-text)', fontWeight: 600 }}>
            <i className="fas fa-question-circle"></i> FAQ
          </a>
          
          {/* Auth Buttons for Mobile */}
          <div className="mobile-auth">
            <button className="btn-outline" style={{ width: '100%', padding: '12px' }} onClick={onOpenModal}>
              <i className="fas fa-sign-in-alt"></i> Log in
            </button>
            <button className="btn" style={{ width: '100%', padding: '12px', marginTop: '10px' }} onClick={onOpenModal}>
              <i className="fas fa-user-plus"></i> Register
            </button>
          </div>
        </div>
      </div>
      <div className={`overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
    </>
  );
};

export default MobileMenu;