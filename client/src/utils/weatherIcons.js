/**
 * Weather Icons and Utilities
 * Maps weather conditions to emoji icons and gradients
 */

/**
 * Get weather icon based on condition
 * @param {string} condition - Weather condition (Clear, Clouds, Rain, etc.)
 * @returns {string} Emoji icon
 */
export const getWeatherIcon = (condition) => {
  const icons = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️',
    'Smoke': '💨',
    'Dust': '💨',
    'Sand': '💨',
    'Ash': '🌋',
    'Squall': '💨',
    'Tornado': '🌪️'
  };

  return icons[condition] || '🌍';
};

/**
 * Get gradient background based on weather condition
 * @param {string} condition - Weather condition
 * @returns {string} CSS gradient string
 */
export const getWeatherGradient = (condition) => {
  const gradients = {
    'Clear': 'linear-gradient(135deg, rgba(255, 183, 77, 0.2), rgba(255, 152, 0, 0.2))',
    'Clouds': 'linear-gradient(135deg, rgba(158, 158, 158, 0.2), rgba(117, 117, 117, 0.2))',
    'Rain': 'linear-gradient(135deg, rgba(66, 165, 245, 0.2), rgba(33, 150, 243, 0.2))',
    'Drizzle': 'linear-gradient(135deg, rgba(100, 181, 246, 0.2), rgba(66, 165, 245, 0.2))',
    'Thunderstorm': 'linear-gradient(135deg, rgba(94, 53, 177, 0.2), rgba(63, 81, 181, 0.2))',
    'Snow': 'linear-gradient(135deg, rgba(224, 242, 254, 0.3), rgba(187, 222, 251, 0.3))',
    'Mist': 'linear-gradient(135deg, rgba(189, 189, 189, 0.2), rgba(158, 158, 158, 0.2))',
    'Fog': 'linear-gradient(135deg, rgba(189, 189, 189, 0.2), rgba(158, 158, 158, 0.2))',
    'Haze': 'linear-gradient(135deg, rgba(255, 224, 178, 0.2), rgba(255, 204, 128, 0.2))',
    'Smoke': 'linear-gradient(135deg, rgba(120, 120, 120, 0.2), rgba(90, 90, 90, 0.2))',
    'Dust': 'linear-gradient(135deg, rgba(215, 204, 200, 0.2), rgba(188, 170, 164, 0.2))',
    'Sand': 'linear-gradient(135deg, rgba(255, 224, 130, 0.2), rgba(255, 213, 79, 0.2))',
    'Ash': 'linear-gradient(135deg, rgba(120, 144, 156, 0.2), rgba(96, 125, 139, 0.2))',
    'Squall': 'linear-gradient(135deg, rgba(144, 164, 174, 0.2), rgba(120, 144, 156, 0.2))',
    'Tornado': 'linear-gradient(135deg, rgba(84, 110, 122, 0.2), rgba(69, 90, 100, 0.2))'
  };

  return gradients[condition] || 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(147, 51, 234, 0.15))';
};

/**
 * Get weather condition color
 * @param {string} condition - Weather condition
 * @returns {string} Color hex code
 */
export const getWeatherColor = (condition) => {
  const colors = {
    'Clear': '#FFB74D',
    'Clouds': '#9E9E9E',
    'Rain': '#42A5F5',
    'Drizzle': '#64B5F6',
    'Thunderstorm': '#5E35B1',
    'Snow': '#E0F2FE',
    'Mist': '#BDBDBD',
    'Fog': '#BDBDBD',
    'Haze': '#FFE0B2',
    'Smoke': '#787878',
    'Dust': '#D7CCC8',
    'Sand': '#FFE082',
    'Ash': '#78909C',
    'Squall': '#90A4AE',
    'Tornado': '#546E7A'
  };

  return colors[condition] || '#7C3AED';
};

/**
 * Convert temperature between Celsius and Fahrenheit
 * @param {number} temp - Temperature value
 * @param {string} from - Current unit ('C' or 'F')
 * @returns {number} Converted temperature
 */
export const convertTemperature = (temp, from = 'C') => {
  if (from === 'C') {
    return Math.round((temp * 9/5) + 32); // Celsius to Fahrenheit
  } else {
    return Math.round((temp - 32) * 5/9); // Fahrenheit to Celsius
  }
};

/**
 * Get wind direction from degrees
 * @param {number} degrees - Wind direction in degrees
 * @returns {string} Cardinal direction
 */
export const getWindDirection = (degrees) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

/**
 * Format Unix timestamp to readable time
 * @param {number} timestamp - Unix timestamp
 * @param {string} timezone - Timezone offset in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (timestamp, timezone = 0) => {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};
