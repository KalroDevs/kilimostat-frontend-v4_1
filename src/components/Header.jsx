// components/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({
  language,
  notificationCount,
  isDarkMode,
  onToggleDarkMode,
  onNotification,
  onLanguageChange,
  onOpenModal,
  onOpenMobileMenu,
  onFoodSystemsClick,
  currentPage,
  onPageChange
}) => {
  const navigate = useNavigate();

  const handleNavigation = (path, page) => {
    navigate(path);
    if (onPageChange) onPageChange(page);
  };

  return (
    <div className="header-wrapper">
      <div className="container">
        <div className="logo-section">
          <div className="logo-area">
            <div className="logo-icon" onClick={() => handleNavigation('/', 'home')} style={{ cursor: 'pointer' }}>
              
              <img src='/img/gok-logo-flag.png' />
            </div>
            <div className="logo-text" onClick={() => handleNavigation('/', 'home')} style={{ cursor: 'pointer' }}>
              <h3>KilimoSTAT</h3>
              <p>Kenya's Agricultural Open Data Platform</p>
            </div>
          </div>
          
          <div className="top-actions">
            <div className="toolbar-icons">
              <button className="icon-btn" onClick={onToggleDarkMode} title="Dark Mode">
                <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>
              <button className="icon-btn" onClick={onNotification} title="Notifications">
                <i className="fas fa-bell"></i>
                {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
              </button>
              <div className="lang-selector">
                <div className="lang-btn">
                  <i className="fas fa-globe"></i> <span>{language}</span> <i className="fas fa-chevron-down"></i>
                </div>
                <div className="lang-dropdown">
                  <a href="#" onClick={(e) => { e.preventDefault(); onLanguageChange('EN', 'English'); }}>
                    <i className="fas fa-flag-usa"></i> English
                  </a>
                  <a href="#" onClick={(e) => { e.preventDefault(); onLanguageChange('SW', 'Kiswahili'); }}>
                    <i className="fas fa-flag-kenya"></i> Kiswahili
                  </a>
                </div>
              </div>
            </div>
            <div className="auth-buttons">
              <button className="btn-outline" style={{ padding: '8px 20px' }} onClick={onOpenModal}>
                <i className="fas fa-sign-in-alt"></i> Log in
              </button>
              <button className="btn" style={{ padding: '8px 20px' }} onClick={onOpenModal}>
                <i className="fas fa-user-plus"></i> Register
              </button>
            </div>
            <div className="mobile-toggle" onClick={onOpenMobileMenu}>
              <i className="fas fa-bars"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div className="main-menu-section">
        <div className="container">
          <ul className="main-nav">
            <li className="nav-item">
              <Link 
                to="/" 
                className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
                onClick={() => onPageChange('home')}
              >
                <i className="fas fa-home"></i> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/national-county-data" 
                className={`nav-link ${currentPage === 'national-county-data' ? 'active' : ''}`}
                onClick={() => onPageChange('national-county-data')}
              >
                <i className="fas fa-database"></i> Data <i className="fas fa-chevron-down"></i>
              </Link>
              <div className="dropdown-menu">
                <Link to="/national-county-data">
                  <i className="fas fa-table"></i> National and County
                </Link>
                <a href="#"><i className="fas fa-chart-line"></i> Kenya CAADP</a>
                <a href="#"><i className="fas fa-map-marker-alt"></i> Geospatial Data</a>
                <a href="#"><i className="fas fa-code"></i> API Access</a>
                <a href="#"><i className="fas fa-download"></i> Bulk Downloads</a>
              </div>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="fas fa-chart-pie"></i> Dashboards <i className="fas fa-chevron-down"></i>
              </a>
              <div className="dropdown-menu">
                <a href="#"><i className="fas fa-chart-line"></i> KIAMIS</a>
                <a href="#"><i className="fas fa-chart-line"></i> KAMIS</a>
                <a href="#"><i className="fas fa-tractor"></i> Crop Production</a>
                <a href="#"><i className="fas fa-paw"></i> Livestock Monitor</a>
                <a href="#"><i className="fas fa-chart-pie"></i> Market Prices</a>
                <a href="#"><i className="fas fa-water"></i> Irrigation Index</a>
                <a href="#"><i className="fas fa-chart-bar"></i> Trade Analytics</a>
              </div>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="fas fa-file-alt"></i> Reports <i className="fas fa-chevron-down"></i>
              </a>
              <div className="dropdown-menu">
                <a href="#"><i className="fas fa-file-pdf"></i> Publications</a>
                <a href="#"><i className="fas fa-file-pdf"></i> Annual Reports</a>
                <a href="#"><i className="fas fa-chart-column"></i> Economic Reviews</a>
                <a href="#"><i className="fas fa-chart-line"></i> Policy Outlook</a>
              </div>
            </li>
            <li className="nav-item">
              <a 
                href="#" 
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  onFoodSystemsClick(e);
                }}
              >
                <i className="fas fa-utensils"></i> Food Systems 
                <i className="fas fa-external-link-alt" style={{ fontSize: '0.7rem', marginLeft: '4px' }}></i>
              </a>
            </li>
            <li className="nav-item">
              <Link 
                to="/about" 
                className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
                onClick={() => onPageChange('about')}
              >
                <i className="fas fa-info-circle"></i> About
              </Link>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="fas fa-book"></i> Definitions
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="fas fa-question-circle"></i> FAQ
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;