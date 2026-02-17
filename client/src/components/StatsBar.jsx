/**
 * StatsBar Component
 * Displays quick statistics about the weather data
 */

import React from 'react';

const StatsBar = ({ cities }) => {
  // Calculate statistics
  const totalCities = cities.length;
  
  const avgTemp = cities.length > 0 
    ? (cities.reduce((sum, city) => sum + parseFloat(city.temperature), 0) / cities.length).toFixed(1)
    : 0;
  
  const hottestCity = cities.length > 0
    ? cities.reduce((max, city) => 
        parseFloat(city.temperature) > parseFloat(max.temperature) ? city : max
      )
    : null;
  
  const coldestCity = cities.length > 0
    ? cities.reduce((min, city) => 
        parseFloat(city.temperature) < parseFloat(min.temperature) ? city : min
      )
    : null;

  if (cities.length === 0) return null;

  return (
    <div className="stats-bar">
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <span className="stat-label">Total Cities</span>
          <span className="stat-value">{totalCities}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">🌡️</div>
        <div className="stat-content">
          <span className="stat-label">Average Temp</span>
          <span className="stat-value">{avgTemp}°C</span>
        </div>
      </div>

      {hottestCity && (
        <div className="stat-card highlight-warm">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <span className="stat-label">Hottest</span>
            <span className="stat-value">{hottestCity.cityName} {hottestCity.temperature}°C</span>
          </div>
        </div>
      )}

      {coldestCity && (
        <div className="stat-card highlight-cold">
          <div className="stat-icon">❄️</div>
          <div className="stat-content">
            <span className="stat-label">Coldest</span>
            <span className="stat-value">{coldestCity.cityName} {coldestCity.temperature}°C</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsBar;
