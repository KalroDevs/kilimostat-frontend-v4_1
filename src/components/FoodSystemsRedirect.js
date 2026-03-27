// components/FoodSystemsRedirect.js (Enhanced with auto-close)
import React, { useEffect, useState } from 'react';

const FoodSystemsRedirect = () => {
  const [countdown, setCountdown] = useState(3);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    // Open the external link in a new tab after a short delay
    const redirectTimer = setTimeout(() => {
      const newWindow = window.open('https://fsd.kilimo.go.ke/', '_blank', 'noopener,noreferrer');
      setRedirected(true);
      
      // Optional: Automatically close the redirect page after opening
      // setTimeout(() => {
      //   window.close();
      // }, 2000);
    }, 1500);

    // Countdown timer
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup timers
    return () => {
      clearTimeout(redirectTimer);
      clearInterval(countdownTimer);
    };
  }, []);

  const handleContinueManually = () => {
    window.open('https://fsd.kilimo.go.ke/', '_blank', 'noopener,noreferrer');
    setRedirected(true);
  };

  const handleGoBack = () => {
    window.location.href = '/';
  };

  return (
    <div className="redirect-container">
      <div className="redirect-content">
        <div className="redirect-icon">
          {redirected ? (
            <i className="fas fa-check-circle"></i>
          ) : (
            <i className="fas fa-external-link-alt"></i>
          )}
        </div>
        
        <h2>
          {redirected 
            ? 'Food Systems Dashboard Opened!' 
            : 'Opening Kenya Food Systems Dashboard'}
        </h2>
        
        <p className="redirect-message">
          {redirected 
            ? 'The dashboard has been opened in a new tab. You can continue browsing KilimoSTAT.'
            : `You are being redirected to the external Food Systems Dashboard.
               This will open in a new tab in ${countdown} seconds.`}
        </p>
        
        {!redirected && (
          <div className="countdown-wrapper">
            <div className="countdown-circle">
              <span className="countdown-number">{countdown}</span>
              <span className="countdown-label">seconds</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${((3 - countdown) / 3) * 100}%`,
                  transition: 'width 1s linear'
                }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="redirect-actions">
          {!redirected && (
            <button 
              className="btn btn-primary"
              onClick={handleContinueManually}
            >
              <i className="fas fa-external-link-alt"></i> Open Dashboard Now
            </button>
          )}
          
          <button 
            className="btn-outline"
            onClick={handleGoBack}
          >
            <i className="fas fa-arrow-left"></i> {redirected ? 'Return to Home' : 'Go Back'}
          </button>
        </div>
        
        {!redirected && (
          <p className="redirect-note">
            The dashboard will open automatically in a new tab.
          </p>
        )}
      </div>
    </div>
  );
};

export default FoodSystemsRedirect;