/**
 * CityCarousel Component
 * Grid layout for weather cards
 */

import React, { useMemo } from 'react';
import WeatherCard from './WeatherCard';

const CityCarousel = ({ cities, onDeleteCity, onRefresh }) => {
  const [sortBy, setSortBy] = React.useState('default'); // 'default', 'temp', 'name'

  // Memoized sorted cities
  const sortedCities = useMemo(() => {
    const citiesCopy = [...cities];
    switch (sortBy) {
      case 'temp':
        return citiesCopy.sort((a, b) => parseFloat(b.temperature) - parseFloat(a.temperature));
      case 'name':
        return citiesCopy.sort((a, b) => a.cityName.localeCompare(b.cityName));
      default:
        return citiesCopy;
    }
  }, [cities, sortBy]);

  return (
    <div className="carousel-container-modern">
      {/* Header */}
      <div className="carousel-header-modern">
        <div className="carousel-title-modern">
          <h2 className="title-gradient">Your Cities</h2>
          <span className="city-count-modern">
            {cities.length} {cities.length === 1 ? 'city' : 'cities'}
          </span>
        </div>
        
        <div className="carousel-controls-modern">
          {/* Sort dropdown */}
          <select 
            className="sort-select-modern"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Default Order</option>
            <option value="temp">By Temperature</option>
            <option value="name">By Name</option>
          </select>

          {/* Refresh button */}
          <button 
            className="refresh-button-modern"
            onClick={onRefresh}
            title="Refresh weather data"
          >
            <span className="refresh-icon-modern">🔄</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Grid view */}
      <div className="cards-grid-modern">
        {sortedCities.map((city, index) => (
          <WeatherCard 
            key={city._id} 
            city={city}
            index={index}
            onDelete={onDeleteCity}
          />
        ))}
      </div>
    </div>
  );
};

export default CityCarousel;
