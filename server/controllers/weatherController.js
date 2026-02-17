/**
 * Weather Controller
 * Handles all weather-related business logic and API interactions
 */

const axios = require('axios');
const City = require('../models/City');

// OpenWeatherMap API configuration
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

/**
 * Fetch weather data from OpenWeatherMap API
 */
const fetchWeatherData = async (city) => {
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    const url = `${WEATHER_API_BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    console.log('🔍 Fetching weather for:', city);
    console.log('🔑 API Key exists:', !!API_KEY);
    console.log('🔑 API Key value:', API_KEY);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('❌ Weather API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      city: city
    });
    if (error.response?.status === 404) {
      throw new Error('City not found');
    } else if (error.response?.status === 401) {
      throw new Error('Invalid API key');
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch weather data');
  }
};

/**
 * Format weather data for frontend
 */
const formatWeatherData = (data) => {
  return {
    cityName: data.name,
    country: data.sys.country,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    condition: data.weather[0].main,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    tempMax: Math.round(data.main.temp_max),
    tempMin: Math.round(data.main.temp_min),
    pressure: data.main.pressure,
    coordinates: {
      lat: data.coord.lat,
      lon: data.coord.lon
    },
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    timezone: data.timezone,
    timestamp: Date.now()
  };
};

/**
 * @route   GET /api/weather
 * @desc    Get all saved cities with their weather data
 * @access  Public
 */
exports.getAllCities = async (req, res, next) => {
  try {
    // Get all saved cities from database
    const cities = await City.find().sort({ order: 1, createdAt: -1 });

    // Fetch weather data for each city
    const weatherPromises = cities.map(async (city) => {
      try {
        const weatherData = await fetchWeatherData(city.name);
        const formatted = formatWeatherData(weatherData);
        
        return {
          _id: city._id,
          ...formatted,
          savedAt: city.createdAt
        };
      } catch (error) {
        console.error(`Error fetching weather for ${city.name}:`, error.message);
        // Return city with error flag instead of failing completely
        return {
          _id: city._id,
          cityName: city.name,
          country: city.country,
          error: 'Unable to fetch weather data',
          savedAt: city.createdAt
        };
      }
    });

    const weatherData = await Promise.all(weatherPromises);

    res.status(200).json({
      status: 'success',
      results: weatherData.length,
      data: weatherData
    });

  } catch (error) {
    console.error('Get all cities error:', error);
    next(error);
  }
};

/**
 * @route   GET /api/weather/:city
 * @desc    Get weather data for a specific city
 * @access  Public
 */
exports.getWeatherByCity = async (req, res, next) => {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({
        status: 'error',
        message: 'City name is required'
      });
    }

    // Fetch weather data from API
    const weatherData = await fetchWeatherData(city);
    const formatted = formatWeatherData(weatherData);

    res.status(200).json({
      status: 'success',
      data: formatted
    });

  } catch (error) {
    console.error('Get weather by city error:', error);
    
    if (error.message === 'City not found') {
      return res.status(404).json({
        status: 'error',
        message: 'City not found. Please check the spelling and try again.'
      });
    }

    next(error);
  }
};

/**
 * @route   POST /api/weather
 * @desc    Add a new city to saved list
 * @access  Public
 */
exports.addCity = async (req, res, next) => {
  try {
    const { cityName } = req.body;

    // Validation
    if (!cityName || cityName.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'City name is required'
      });
    }

    // Fetch weather data to verify city exists
    const weatherData = await fetchWeatherData(cityName);
    
    // Check if city already exists in database
    const existingCity = await City.findOne({
      name: weatherData.name,
      country: weatherData.sys.country
    });

    if (existingCity) {
      // Return existing city with fresh weather data
      const formatted = formatWeatherData(weatherData);
      return res.status(200).json({
        status: 'success',
        message: 'City already exists',
        data: {
          _id: existingCity._id,
          ...formatted,
          savedAt: existingCity.createdAt
        }
      });
    }

    // Get the highest order number
    const maxOrderCity = await City.findOne().sort({ order: -1 });
    const nextOrder = maxOrderCity ? maxOrderCity.order + 1 : 0;

    // Create new city entry
    const newCity = await City.create({
      name: weatherData.name,
      country: weatherData.sys.country,
      coordinates: {
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon
      },
      cityId: `${weatherData.id}`,
      order: nextOrder
    });

    // Format and return weather data
    const formatted = formatWeatherData(weatherData);

    res.status(201).json({
      status: 'success',
      message: 'City added successfully',
      data: {
        _id: newCity._id,
        ...formatted,
        savedAt: newCity.createdAt
      }
    });

  } catch (error) {
    console.error('Add city error:', error);
    
    if (error.message === 'City not found') {
      return res.status(404).json({
        status: 'error',
        message: 'City not found. Please check the spelling and try again.'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'City already exists in your list'
      });
    }

    next(error);
  }
};

/**
 * @route   DELETE /api/weather/:id
 * @desc    Remove a city from saved list
 * @access  Public
 */
exports.deleteCity = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid city ID format'
      });
    }

    const city = await City.findByIdAndDelete(id);

    if (!city) {
      return res.status(404).json({
        status: 'error',
        message: 'City not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'City removed successfully',
      data: {
        deletedCity: city.name
      }
    });

  } catch (error) {
    console.error('Delete city error:', error);
    next(error);
  }
};

/**
 * @route   PUT /api/weather/:id/refresh
 * @desc    Refresh weather data for a specific city
 * @access  Public
 */
exports.refreshCityWeather = async (req, res, next) => {
  try {
    const { id } = req.params;

    const city = await City.findById(id);

    if (!city) {
      return res.status(404).json({
        status: 'error',
        message: 'City not found'
      });
    }

    // Fetch fresh weather data
    const weatherData = await fetchWeatherData(city.name);
    const formatted = formatWeatherData(weatherData);

    // Update coordinates if changed
    if (city.coordinates.lat !== weatherData.coord.lat || 
        city.coordinates.lon !== weatherData.coord.lon) {
      city.coordinates = {
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon
      };
      await city.save();
    }

    res.status(200).json({
      status: 'success',
      data: {
        _id: city._id,
        ...formatted,
        savedAt: city.createdAt
      }
    });

  } catch (error) {
    console.error('Refresh weather error:', error);
    next(error);
  }
};
