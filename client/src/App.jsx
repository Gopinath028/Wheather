/**
 * Main App Component
 * Manages the application state and orchestrates all components
 */

import React, { useState, useEffect, useCallback, useMemo, useReducer, createContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CityCarousel from './components/CityCarousel';
import AnimatedBackground from './components/AnimatedBackground';
import SplashScreen from './components/SplashScreen';
import { getAllCities, addCity, deleteCity } from './services/api';
import './styles/App.css';
import './styles/ModernCards.css';

// Create Weather Context for global state management
export const WeatherContext = createContext();

// Action types for useReducer
const ACTION_TYPES = {
  SET_CITIES: 'SET_CITIES',
  ADD_CITY: 'ADD_CITY',
  REMOVE_CITY: 'REMOVE_CITY',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SEARCH_LOADING: 'SET_SEARCH_LOADING',
  SET_LAST_REFRESH: 'SET_LAST_REFRESH',
};

// Reducer function for state management
const weatherReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_CITIES:
      return { ...state, cities: action.payload };
    case ACTION_TYPES.ADD_CITY:
      return { ...state, cities: [...state.cities, action.payload] };
    case ACTION_TYPES.REMOVE_CITY:
      return { ...state, cities: state.cities.filter(city => city._id !== action.payload) };
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTION_TYPES.SET_SEARCH_LOADING:
      return { ...state, searchLoading: action.payload };
    case ACTION_TYPES.SET_LAST_REFRESH:
      return { ...state, lastRefresh: action.payload };
    default:
      return state;
  }
};

function App() {
  // Splash screen state
  const [showSplash, setShowSplash] = useState(true);
  
  // New Features State
  const [temperatureUnit, setTemperatureUnit] = useState('C'); // 'C' or 'F'
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('weatherSearchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('weatherTheme');
    return saved || 'dark';
  });
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [refreshProgress, setRefreshProgress] = useState(0);
  
  // Use useReducer for complex state management
  const [state, dispatch] = useReducer(weatherReducer, {
    cities: [],
    loading: true,
    error: null,
    searchLoading: false,
    lastRefresh: new Date(),
  });

  // Memoized weather statistics
  const weatherStats = useMemo(() => {
    if (state.cities.length === 0) return null;

    const temps = state.cities.map(city => parseFloat(city.temperature));
    const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);

    return {
      total: state.cities.length,
      avgTemp,
      maxTemp,
      minTemp,
    };
  }, [state.cities]);

  // Convert temperature based on unit
  const convertTemp = useCallback((tempC) => {
    if (temperatureUnit === 'F') {
      return ((parseFloat(tempC) * 9/5) + 32).toFixed(1);
    }
    return parseFloat(tempC).toFixed(1);
  }, [temperatureUnit]);

  // Toggle temperature unit
  const toggleTemperatureUnit = useCallback(() => {
    setTemperatureUnit(prev => prev === 'C' ? 'F' : 'C');
  }, []);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('weatherTheme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, [theme]);

  // Toggle comparison mode
  const toggleComparisonMode = useCallback(() => {
    setComparisonMode(prev => !prev);
    if (!comparisonMode) {
      setSelectedForComparison([]);
    }
  }, [comparisonMode]);

  // Select city for comparison
  const toggleCityComparison = useCallback((cityId) => {
    setSelectedForComparison(prev => {
      if (prev.includes(cityId)) {
        return prev.filter(id => id !== cityId);
      } else if (prev.length < 3) {
        return [...prev, cityId];
      }
      return prev;
    });
  }, []);

  // Add to search history
  const addToSearchHistory = useCallback((cityName) => {
    setSearchHistory(prev => {
      const newHistory = [cityName, ...prev.filter(name => name !== cityName)].slice(0, 5);
      localStorage.setItem('weatherSearchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  // Export cities data
  const exportCitiesData = useCallback(() => {
    const data = state.cities.map(city => ({
      name: city.cityName,
      country: city.country,
      temperature: `${convertTemp(city.temperature)}°${temperatureUnit}`,
      condition: city.condition,
      humidity: city.humidity,
      windSpeed: city.windSpeed,
    }));
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weather-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Weather data exported! 📥', {
      position: 'top-right',
      autoClose: 2500,
    });
  }, [state.cities, convertTemp, temperatureUnit]);

  /**
   * Fetch all saved cities from the backend
   */
  const fetchCities = useCallback(async (showToast = false) => {
    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: null });
      const data = await getAllCities();
      dispatch({ type: ACTION_TYPES.SET_CITIES, payload: data });
      dispatch({ type: ACTION_TYPES.SET_LAST_REFRESH, payload: new Date() });
      if (showToast) {
        toast.success('Weather data refreshed successfully! 🌤️', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
      toast.error('Failed to load cities. Please try again.', {
        position: 'top-right',
        autoClose: 4000,
      });
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: 'Failed to load cities. Please try again.' });
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
    }
  }, []);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch all cities on component mount
  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  // Auto-refresh every 10 minutes with progress
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      console.log('Auto-refreshing weather data...');
      fetchCities();
    }, 10 * 60 * 1000); // 10 minutes

    // Update progress every second
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - state.lastRefresh.getTime();
      const progress = (elapsed / (10 * 60 * 1000)) * 100;
      setRefreshProgress(Math.min(progress, 100));
    }, 1000);

    return () => {
      clearInterval(autoRefreshInterval);
      clearInterval(progressInterval);
    };
  }, [state.lastRefresh, fetchCities]);

  /**
   * Handle adding a new city
   */
  const handleAddCity = useCallback(async (cityName) => {
    try {
      dispatch({ type: ACTION_TYPES.SET_SEARCH_LOADING, payload: true });
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: null });
      
      const newCity = await addCity(cityName);
      
      // Check if city already exists
      const cityExists = state.cities.some(city => city._id === newCity._id);
      
      if (!cityExists) {
        dispatch({ type: ACTION_TYPES.ADD_CITY, payload: newCity });
        addToSearchHistory(cityName);
        toast.success(`${cityName} added successfully! 🌤️`, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.info(`${cityName} is already in your list!`, {
          position: 'top-right',
          autoClose: 5000,
        });
      }
      
      return { success: true, message: 'City added successfully!' };
    } catch (err) {
      console.error('Error adding city:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add city. Please check the name and try again.';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      dispatch({ type: ACTION_TYPES.SET_SEARCH_LOADING, payload: false });
    }
  }, [state.cities, addToSearchHistory]);

  /**
   * Handle removing a city
   */
  const handleDeleteCity = useCallback(async (cityId, cityName) => {
    try {
      await deleteCity(cityId);
      dispatch({ type: ACTION_TYPES.REMOVE_CITY, payload: cityId });
      toast.success(`${cityName} removed successfully! 🗑️`, {
        position: 'top-right',
        autoClose: 2500,
      });
    } catch (err) {
      console.error('Error deleting city:', err);
      toast.error('Failed to remove city. Please try again.', {
        position: 'top-right',
        autoClose: 4000,
      });
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: 'Failed to remove city. Please try again.' });
    }
  }, []);

  /**
   * Handle refreshing city data
   */
  const handleRefresh = useCallback(() => {
    toast.info('Refreshing weather data... 🔄', {
      position: 'top-right',
      autoClose: 1500,
    });
    fetchCities(true);
  }, [fetchCities]);

  // Context value for WeatherContext
  // Context value for WeatherContext
  const contextValue = useMemo(() => ({
    cities: state.cities,
    loading: state.loading,
    error: state.error,
    searchLoading: state.searchLoading,
    lastRefresh: state.lastRefresh,
    weatherStats,
    temperatureUnit,
    searchHistory,
    theme,
    comparisonMode,
    selectedForComparison,
    refreshProgress,
    convertTemp,
    toggleTemperatureUnit,
    toggleTheme,
    toggleComparisonMode,
    toggleCityComparison,
    exportCitiesData,
    fetchCities,
    handleAddCity,
    handleDeleteCity,
    handleRefresh,
  }), [state, weatherStats, temperatureUnit, searchHistory, theme, comparisonMode, 
      selectedForComparison, refreshProgress, convertTemp, toggleTemperatureUnit, toggleTheme, 
      toggleComparisonMode, toggleCityComparison, exportCitiesData, 
      fetchCities, handleAddCity, handleDeleteCity, handleRefresh]);

  // Handle splash screen completion
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Show splash screen
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <WeatherContext.Provider value={contextValue}>
      <div className="app">
        {/* Toast Notification Container */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          style={{ zIndex: 9999 }}
          toastClassName="custom-toast"
          progressClassName="custom-toast-progress"
        />

        {/* Animated particle background */}
        <AnimatedBackground />

        {/* Animated background shapes */}
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        <div className="app-container">
          {/* Header with live date and time */}
          <Header lastRefresh={state.lastRefresh} />

          {/* Search bar for adding cities */}
          <SearchBar 
            onAddCity={handleAddCity} 
            loading={state.searchLoading}
            searchHistory={searchHistory}
          />

          {/* Error message display */}
          {state.error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {state.error}
              <button 
                className="error-close"
                onClick={() => dispatch({ type: ACTION_TYPES.SET_ERROR, payload: null })}
              >
                ✕
              </button>
            </div>
          )}

          {/* Loading state */}
          {state.loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading weather data...</p>
            </div>
          )}

          {/* Empty state */}
          {!state.loading && state.cities.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🌍</div>
              <h2>No Cities Added Yet</h2>
              <p>Start tracking weather by adding your favorite cities!</p>
              <div className="example-cities">
                <p className="example-title">Popular Cities:</p>
                <div className="city-chips">
                  <span className="city-chip">🇬🇧 London</span>
                  <span className="city-chip">🇫🇷 Paris</span>
                  <span className="city-chip">🇯🇵 Tokyo</span>
                  <span className="city-chip">🇺🇸 New York</span>
                  <span className="city-chip">🇮🇳 Mumbai</span>
                  <span className="city-chip">🇦🇺 Sydney</span>
                </div>
              </div>
            </div>
          )}

          {/* City carousel with weather cards */}
          {!state.loading && state.cities.length > 0 && (
            <>
              <CityCarousel 
                cities={state.cities}
                onDeleteCity={handleDeleteCity}
                onRefresh={handleRefresh}
              />

              {/* Comparison Panel */}
              {comparisonMode && selectedForComparison.length > 0 && (
                <div className="comparison-panel">
                  <div className="comparison-header">
                    <h3>🔍 Comparing {selectedForComparison.length} {selectedForComparison.length === 1 ? 'City' : 'Cities'}</h3>
                    <button className="close-comparison" onClick={() => setSelectedForComparison([])}>
                      Clear Selection
                    </button>
                  </div>
                  <div className="comparison-grid">
                    {state.cities.filter(city => selectedForComparison.includes(city._id)).map(city => (
                      <div key={city._id} className="comparison-item">
                        <h4>{city.cityName}, {city.country}</h4>
                        <div className="comparison-stat">
                          <span className="stat-label">Temperature</span>
                          <span className="stat-value">{convertTemp(city.temperature)}°{temperatureUnit}</span>
                        </div>
                        <div className="comparison-stat">
                          <span className="stat-label">Condition</span>
                          <span className="stat-value">{city.condition}</span>
                        </div>
                        <div className="comparison-stat">
                          <span className="stat-label">Humidity</span>
                          <span className="stat-value">{city.humidity}%</span>
                        </div>
                        <div className="comparison-stat">
                          <span className="stat-label">Wind Speed</span>
                          <span className="stat-value">{city.windSpeed} m/s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <footer className="app-footer">
            <p>🌤️ Powered by OpenWeatherMap API</p>
            <p>Built with ❤️ using MERN Stack | © 2026 WeatherHub</p>
          </footer>
        </div>
      </div>
    </WeatherContext.Provider>
  );
}

export default App;
