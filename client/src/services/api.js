/**
 * API Service
 * Handles all HTTP requests to backend
 */

import axios from "axios";

/* ===============================
   Axios Instance
================================= */

const api = axios.create({
  baseURL: "/api", // 🔥 IMPORTANT (uses proxy)
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

/* ===============================
   Storage Config
================================= */

const CITIES_STORAGE_KEY = "weatherAppCities";

/* ===============================
   Utility
================================= */

const safeParse = (value, fallback = []) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const generateId = () =>
  `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

/* ===============================
   Storage Functions
================================= */

const getCitiesFromStorage = () => {
  const stored = sessionStorage.getItem(CITIES_STORAGE_KEY);
  return stored ? safeParse(stored) : [];
};

const saveCitiesToStorage = (cities) => {
  sessionStorage.setItem(CITIES_STORAGE_KEY, JSON.stringify(cities));
};

/* ===============================
   Backend Weather Fetch
================================= */

const fetchWeatherFromBackend = async (cityName) => {
  try {
    const response = await api.get(
      `/weather/${encodeURIComponent(cityName)}`
    );

    return response.data.data;
  } catch (error) {
    console.error("Weather API Error:", error);

    if (error.response?.status === 404) {
      throw new Error("City not found");
    }

    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch weather data"
    );
  }
};

/* ===============================
   Public API Functions
================================= */

export const getAllCities = async () => {
  const cities = getCitiesFromStorage();

  if (!cities.length) return [];

  const weatherData = await Promise.all(
    cities.map(async (city) => {
      try {
        const freshData = await fetchWeatherFromBackend(
          city.cityName
        );

        return {
          ...city,
          ...freshData,
        };
      } catch {
        return {
          ...city,
          error: "Unable to fetch weather data",
        };
      }
    })
  );

  return weatherData;
};

export const getWeatherByCity = async (cityName) => {
  return await fetchWeatherFromBackend(cityName);
};

export const addCity = async (cityName) => {
  const weatherData = await fetchWeatherFromBackend(cityName);

  const cities = getCitiesFromStorage();

  const exists = cities.find(
    (city) =>
      city.cityName.toLowerCase() ===
      weatherData.cityName.toLowerCase()
  );

  if (exists) {
    throw new Error("City already exists in your list");
  }

  const newCity = {
    _id: generateId(),
    ...weatherData,
    savedAt: new Date().toISOString(),
  };

  const updatedCities = [...cities, newCity];
  saveCitiesToStorage(updatedCities);

  return newCity;
};

export const deleteCity = async (cityId) => {
  const cities = getCitiesFromStorage();
  const updatedCities = cities.filter(
    (city) => city._id !== cityId
  );

  saveCitiesToStorage(updatedCities);

  return {
    success: true,
  };
};

export const refreshCityWeather = async (cityId) => {
  const cities = getCitiesFromStorage();
  const city = cities.find((c) => c._id === cityId);

  if (!city) throw new Error("City not found");

  const freshData = await fetchWeatherFromBackend(
    city.cityName
  );

  const updatedCities = cities.map((c) =>
    c._id === cityId ? { ...c, ...freshData } : c
  );

  saveCitiesToStorage(updatedCities);

  return { ...city, ...freshData };
};

export const clearAllCities = async () => {
  sessionStorage.removeItem(CITIES_STORAGE_KEY);

  return { success: true };
};

export default {
  getAllCities,
  getWeatherByCity,
  addCity,
  deleteCity,
  refreshCityWeather,
  clearAllCities,
};
