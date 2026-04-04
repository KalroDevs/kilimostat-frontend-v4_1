// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import MobileMenu from './components/MobileMenu';
import Toast from './components/Toast';
import Hero from './components/Hero';
import ChartsSection from './components/ChartsSection';
import DatasetsSection from './components/DatasetsSection';
import FairPrinciplesSection from './components/FairPrinciplesSection';
import CTASection from './components/CTASection';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import FoodSystemsRedirect from './components/FoodSystemsRedirect';
import About from './components/About';
import NationalCountyData from './components/NationalCountyData';
import './styles/App.css';

// Main App Content Component
const AppContent = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState('EN');
  
  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
    showToast(isDarkMode ? 'Light mode activated' : 'Dark mode activated');
  };

  const handleNotification = () => {
    showToast(`🔔 You have ${notificationCount} new notifications: New dataset releases, API updates, and market alerts`);
    setNotificationCount(0);
  };

  const handleLanguageChange = (lang, label) => {
    setLanguage(lang);
    showToast(`🌍 Language switched to ${label} (demo interface)`);
  };

  const handleLogin = (email, password) => {
    showToast('🎉 Welcome to KilimoSTAT! Access granted to FAIR data platform.');
  };

  const handlePageChange = (page) => {
    navigate(page === 'home' ? '/' : `/${page}`);
    window.scrollTo(0, 0);
  };

  const handleFoodSystemsClick = (e) => {
    if (e) e.preventDefault();
    navigate('/food-systems');
    showToast('🔄 Loading Kenya Food Systems Dashboard...');
  };

  // Determine current page from location
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/about') return 'about';
    if (path === '/food-systems') return 'food-systems';
    if (path === '/national-county-data') return 'national-county-data';
    return 'home';
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  useEffect(() => {
    showToast('✨ Welcome to KilimoSTAT - Kenya\'s FAIR open data platform');
  }, []);

  return (
    <>
      <Header
        language={language}
        notificationCount={notificationCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onNotification={handleNotification}
        onLanguageChange={handleLanguageChange}
        onOpenModal={() => setIsModalOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onFoodSystemsClick={handleFoodSystemsClick}
        currentPage={getCurrentPage()}
        onPageChange={handlePageChange}
      />
      
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenModal={() => {
          setIsModalOpen(true);
          setIsMobileMenuOpen(false);
        }}
        onFoodSystemsClick={handleFoodSystemsClick}
        onPageChange={handlePageChange}
      />
      
      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <ChartsSection showToast={showToast} />
              <DatasetsSection showToast={showToast} />
              <FairPrinciplesSection showToast={showToast} />
              <CTASection showToast={showToast} />
            </>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/food-systems" element={<FoodSystemsRedirect />} />
          <Route path="/national-county-data" element={<NationalCountyData />} />
        </Routes>
      </main>
      
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLogin={handleLogin}
      />
      
      <Footer />
    </>
  );
};

// Main App Component with Router
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;