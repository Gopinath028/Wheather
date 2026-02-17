 /**
 * WeatherCard Component
 * Displays weather information with vibrant design and advanced React hooks
 */

import React, { useState, useEffect, useMemo, useCallback, memo, useContext } from 'react';
import { WeatherContext } from '../App';

const WeatherCard = memo(({ city, onDelete, index }) => {
  const { 
    temperatureUnit, 
    convertTemp, 
    comparisonMode,
    selectedForComparison,
    toggleCityComparison 
  } = useContext(WeatherContext);
  
  const [isHovered, setIsHovered] = useState(false);
  const [animationDelay, setAnimationDelay] = useState(0);
  const [localTime, setLocalTime] = useState('');
  const [localDate, setLocalDate] = useState('');

  const isSelectedForComparison = selectedForComparison.includes(city._id);

  // Set staggered animation delay based on card index
  useEffect(() => {
    setAnimationDelay(index * 0.1);
  }, [index]);

  // Update local time for the city
  useEffect(() => {
    const updateCityTime = () => {
      if (city.timezone !== undefined) {
        // Get current UTC time
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        
        // Calculate city's local time using timezone offset (in seconds)
        const cityTime = new Date(utcTime + (city.timezone * 1000));
        
        // Format time (HH:MM AM/PM)
        const hours = cityTime.getHours();
        const minutes = cityTime.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
        setLocalTime(`${displayHours}:${displayMinutes} ${ampm}`);
        
        // Format date
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        setLocalDate(cityTime.toLocaleDateString('en-US', options));
      }
    };
    
    updateCityTime();
    const interval = setInterval(updateCityTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [city.timezone]);

  // Memoized temperature color calculation
  const temperatureColor = useMemo(() => {
    const temp = parseFloat(city.temperature);
    if (temp <= 0) return { glow: 'rgba(58, 134, 255, 0.4)', border: '#3a86ff' };
    if (temp <= 15) return { glow: 'rgba(6, 255, 165, 0.4)', border: '#06ffa5' };
    if (temp <= 25) return { glow: 'rgba(255, 190, 11, 0.4)', border: '#ffbe0b' };
    if (temp <= 35) return { glow: 'rgba(255, 107, 53, 0.4)', border: '#ff6b35' };
    return { glow: 'rgba(255, 0, 110, 0.4)', border: '#ff006e' };
  }, [city.temperature]);

  // Memoized condition emoji
  const conditionEmoji = useMemo(() => {
    const emojiMap = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️',
    };
    return emojiMap[city.condition] || '🌤️';
  }, [city.condition]);

  // Handle delete with callback (no confirmation)
  const handleDelete = useCallback(() => {
    onDelete(city._id, city.cityName);
  }, [city._id, city.cityName, onDelete]);

  // Handle comparison toggle
  const handleComparisonToggle = useCallback((e) => {
    e.stopPropagation();
    toggleCityComparison(city._id);
  }, [city._id, toggleCityComparison]);

  // Check for weather alerts
  const hasAlert = useMemo(() => {
    const temp = parseFloat(city.temperature);
    const wind = parseFloat(city.windSpeed);
    return temp > 35 || temp < 0 || wind > 50 || city.condition === 'Thunderstorm';
  }, [city.temperature, city.windSpeed, city.condition]);

  // Error state
  if (city.error) {
    return (
      <div 
        className="weather-card-modern error-card-modern"
        style={{ animationDelay: `${animationDelay}s` }}
      >
        <button className="delete-btn-modern" onClick={handleDelete}>✕</button>
        <div className="card-error-modern">
          <span className="error-icon-modern">⚠️</span>
          <h3>{city.cityName}</h3>
          <p>{city.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`weather-card-modern ${isHovered ? 'card-flipped' : ''}`}
      style={{ 
        animationDelay: `${animationDelay}s`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px ${temperatureColor.glow}`,
        borderColor: temperatureColor.border
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete button */}
      <button 
        className="delete-btn-modern"
        onClick={handleDelete}
        aria-label="Remove city"
      >
        ✕
      </button>

      {/* Comparison button (only in comparison mode) */}
      {comparisonMode && (
        <button 
          className={`compare-btn ${isSelectedForComparison ? 'active' : ''}`}
          onClick={handleComparisonToggle}
          aria-label={isSelectedForComparison ? "Remove from comparison" : "Add to comparison"}
        >
          {isSelectedForComparison ? '✓' : '⚖️'}
        </button>
      )}

      {/* Weather Alert Badge */}
      {hasAlert && (
        <div className="alert-badge" title="Weather Alert!">
          ⚠️
        </div>
      )}

      {/* Card Inner Container for flip effect */}
      <div className="card-inner-modern">
        {/* Front Side - Main Info */}
        <div className="card-front-modern">
          <div className="location-badge-modern">
            <span className="location-icon-modern">📍</span>
            <div>
              <h2 className="city-name-modern">{city.cityName}</h2>
              {city.country && <span className="country-flag-modern">{city.country}</span>}
            </div>
          </div>

          {/* City Local Time and Date */}
          {localTime && (
            <div className="city-time-display">
              <div className="time-value">🕒 {localTime}</div>
              <div className="date-value">📅 {localDate}</div>
            </div>
          )}
          
          <div className="temp-display-large">
            <div className="temp-value-large">{convertTemp(city.temperature)}</div>
            <div className="temp-unit-large">&deg;{temperatureUnit}</div>
          </div>
          
          <div className="condition-display-modern">
            <span className="condition-emoji-modern">{conditionEmoji}</span>
            <div className="condition-text-modern">
              <span className="condition-name-modern">{city.condition}</span>
              <span className="condition-desc-modern">{city.description}</span>
            </div>
          </div>

          <div className="hover-hint-modern">
            <span>Hover for details</span>
            <span className="hover-arrow">→</span>
          </div>
        </div>

        {/* Back Side - Stats Grid */}
        <div className="card-back-modern">
          <div className="back-header-modern">
            <h3 className="back-title-modern">📊 Weather Details</h3>
            <p className="back-subtitle-modern">{city.cityName}</p>
          </div>

          <div className="stats-grid-back">
            <div className="stat-item-back">
              <span className="stat-icon-back">🌡️</span>
              <div className="stat-content-back">
                <span className="stat-label-back">Feels Like</span>
                <span className="stat-value-back">{convertTemp(city.feelsLike)}&deg;{temperatureUnit}</span>
              </div>
            </div>
            
            <div className="stat-item-back">
              <span className="stat-icon-back">💧</span>
              <div className="stat-content-back">
                <span className="stat-label-back">Humidity</span>
                <span className="stat-value-back">{city.humidity}%</span>
              </div>
            </div>
            
            <div className="stat-item-back">
              <span className="stat-icon-back">💨</span>
              <div className="stat-content-back">
                <span className="stat-label-back">Wind Speed</span>
                <span className="stat-value-back">{city.windSpeed} m/s</span>
              </div>
            </div>
            
            <div className="stat-item-back">
              <span className="stat-icon-back">🎚️</span>
              <div className="stat-content-back">
                <span className="stat-label-back">Pressure</span>
                <span className="stat-value-back">{city.pressure} hPa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

WeatherCard.displayName = 'WeatherCard';

export default WeatherCard;
