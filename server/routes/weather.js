/**
 * Weather Routes
 * Defines API endpoints for weather operations
 */

const express = require('express');
const { body } = require('express-validator');
const {
  getAllCities,
  getWeatherByCity,
  addCity,
  deleteCity,
  refreshCityWeather
} = require('../controllers/weatherController');

const router = express.Router();

/**
 * @route   GET /api/weather
 * @desc    Get all saved cities with weather data
 * @access  Public
 */
router.get('/', getAllCities);

/**
 * @route   GET /api/weather/:city
 * @desc    Get weather for a specific city by name
 * @access  Public
 */
router.get('/:city', getWeatherByCity);

/**
 * @route   POST /api/weather
 * @desc    Add a new city
 * @access  Public
 */
router.post(
  '/',
  [
    body('cityName')
      .trim()
      .notEmpty()
      .withMessage('City name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('City name must be between 2 and 100 characters')
  ],
  addCity
);

/**
 * @route   DELETE /api/weather/:id
 * @desc    Remove a city by ID
 * @access  Public
 */
router.delete('/:id', deleteCity);

/**
 * @route   PUT /api/weather/:id/refresh
 * @desc    Refresh weather data for a city
 * @access  Public
 */
router.put('/:id/refresh', refreshCityWeather);

module.exports = router;
