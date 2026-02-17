/**
 * Modern SearchBar Component
 * Advanced search with animations and suggestions
 */

import React, { useState, useRef } from 'react';



const SearchBar = ({ onAddCity, loading, searchHistory = [] }) => {
  const [cityInput, setCityInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions] = useState([
    'London', 'Paris', 'Tokyo', 'New York', 'Mumbai', 
    'Sydney', 'Dubai', 'Singapore', 'Moscow', 'Toronto',
    'Berlin', 'Madrid', 'Rome', 'Amsterdam', 'Bangkok'
  ]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cityInput.trim()) {
      return;
    }

    setShowSuggestions(false);

    const result = await onAddCity(cityInput.trim());
    
    if (result.success) {
      setCityInput('');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCityInput(value);
    setShowSuggestions(value.length > 0 || (value.length === 0 && searchHistory.length > 0));
  };

  const handleSuggestionClick = (city) => {
    setCityInput(city);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const filteredSuggestions = cityInput 
    ? suggestions.filter(city => 
        city.toLowerCase().includes(cityInput.toLowerCase())
      ).slice(0, 8)
    : [];

  // Show search history only when input is empty, focused, and no typed suggestions
  const showHistory = isFocused && !cityInput && searchHistory.length > 0 && showSuggestions;

  return (
    <div className="modern-search-container">
      <div className="search-wrapper-flex">
        <div className={`search-glass-wrapper ${isFocused ? 'focused' : ''}`}>
          <form className="modern-search-bar" onSubmit={handleSubmit}>
            <div className="search-icon-wrapper">
              <svg className="search-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2"/>
                <path d="M20 20L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div className="search-pulse"></div>
            </div>
            
            <input
              ref={inputRef}
              type="text"
              className="modern-search-input"
              placeholder="Enter city name to track weather..."
              value={cityInput}
              onChange={handleInputChange}
              onFocus={() => {
                setIsFocused(true);
                if (cityInput || searchHistory.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                setIsFocused(false);
                setTimeout(() => {
                  setShowSuggestions(false);
                }, 200);
              }}
              disabled={loading}
            />
            
            {cityInput && (
              <button
                type="button"
                className="clear-icon-btn"
                onClick={() => {
                  setCityInput('');
                  setShowSuggestions(searchHistory.length > 0);
                  inputRef.current?.focus();
                }}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </form>

          {/* Search History */}
          {showHistory && (
            <div className="modern-suggestions">
            <div className="suggestions-header">
              <span className="suggestions-title">Recent Searches</span>
              <span className="suggestions-count">{searchHistory.length}</span>
            </div>
            <div className="suggestions-list">
              {searchHistory.map((city, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => handleSuggestionClick(city)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <svg className="suggestion-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="suggestion-text">{city}</span>
                  <svg className="suggestion-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Animated suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="modern-suggestions">
            <div className="suggestions-header">
              <span className="suggestions-title">Popular Cities</span>
              <span className="suggestions-count">{filteredSuggestions.length}</span>
            </div>
            <div className="suggestions-list">
              {filteredSuggestions.map((city, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => handleSuggestionClick(city)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <svg className="suggestion-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                  </svg>
                  <span className="suggestion-text">{city}</span>
                  <svg className="suggestion-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Button - Outside Search Card */}
      <button 
        type="submit" 
        className="modern-add-btn-external"
        onClick={handleSubmit}
        disabled={loading || !cityInput.trim()}
      >
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
          </div>
        ) : (
          <>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="btn-label">Add City</span>
          </>
        )}
      </button>
    </div>

    </div>
  );
};

export default SearchBar;
