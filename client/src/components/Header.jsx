/**
 * Header Component
 * Modern animated header with logo and live weather stats
 */

import React, { useState, useEffect } from 'react';

const Header = ({ lastRefresh }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [temperature, setTemperature] = useState(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get user's location weather
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=metric`
            );
            const data = await response.json();
            setTemperature(Math.round(data.main.temp));
          } catch (error) {
            console.error('Error fetching location weather:', error);
          }
        },
        (error) => {
          console.log('Geolocation not available:', error);
        }
      );
    }
  }, []);

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = () => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return currentTime.toLocaleDateString('en-US', options);
  };

  return (
    <header className="modern-header">
      <div className="header-glass-container">
        {/* Left Side - Brand Section */}
        <div className="brand-section">
          <div className="logo-container">
            <svg className="logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              {/* Sun */}
              <circle className="logo-sun" cx="50" cy="35" r="15" fill="#FFD700"/>
              <g className="logo-rays">
                <line x1="50" y1="10" x2="50" y2="5" stroke="#FFD700" strokeWidth="3"/>
                <line x1="67" y1="18" x2="71" y2="14" stroke="#FFD700" strokeWidth="3"/>
                <line x1="75" y1="35" x2="80" y2="35" stroke="#FFD700" strokeWidth="3"/>
                <line x1="33" y1="18" x2="29" y2="14" stroke="#FFD700" strokeWidth="3"/>
                <line x1="25" y1="35" x2="20" y2="35" stroke="#FFD700" strokeWidth="3"/>
              </g>
              {/* Cloud */}
              <ellipse className="logo-cloud" cx="45" cy="60" rx="20" ry="12" fill="#FFFFFF"/>
              <ellipse className="logo-cloud" cx="60" cy="60" rx="18" ry="12" fill="#FFFFFF"/>
              <ellipse className="logo-cloud" cx="52" cy="52" rx="15" ry="10" fill="#FFFFFF"/>
              {/* Rain */}
              <line className="logo-rain rain-1" x1="40" y1="70" x2="38" y2="80" stroke="#06ffa5" strokeWidth="2"/>
              <line className="logo-rain rain-2" x1="50" y1="70" x2="48" y2="80" stroke="#06ffa5" strokeWidth="2"/>
              <line className="logo-rain rain-3" x1="60" y1="70" x2="58" y2="80" stroke="#06ffa5" strokeWidth="2"/>
            </svg>
          </div>
          
          <div className="brand-text">
            <h1 className="brand-title">
              <span className="title-letter">W</span>
              <span className="title-letter">e</span>
              <span className="title-letter">a</span>
              <span className="title-letter">t</span>
              <span className="title-letter">h</span>
              <span className="title-letter">e</span>
              <span className="title-letter">r</span>
              <span className="title-space"> </span>
              <span className="title-letter">H</span>
              <span className="title-letter">u</span>
              <span className="title-letter">b</span>
            </h1>
            <p className="brand-tagline">
              <span className="tagline-icon">⚡</span>
              Live Weather Tracking
            </p>
          </div>
        </div>

        {/* Right Side - Time Box */}
        <div className="time-box">
          <div className="time-display">
            <span className="time-icon">🕐</span>
            <div className="time-content">
              <span className="time-value">{formatTime()}</span>
              <span className="time-date">{formatDate()}</span>
            </div>
          </div>
          {temperature !== null && (
            <div className="location-badge">
              <span className="location-icon">📍</span>
              <span className="location-temp">{temperature}°C</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
