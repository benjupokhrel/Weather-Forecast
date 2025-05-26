// src/Weather/WeatherApp.jsx
import React, { useState, useEffect } from 'react';
import './WeatherApp.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WiDaySunny, WiRain, WiSnow, WiCloudy, WiStrongWind,
  WiThermometer, WiHumidity, WiWindy
} from 'react-icons/wi';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
 
console.log("API Key:", API_KEY);

function WeatherApp() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState('metric');
  const [recentSearches, setRecentSearches] = useState(() =>
    JSON.parse(localStorage.getItem('recentSearches')) || []
  );
  const [background, setBackground] = useState('default');

  const getWeatherIcon = (main, size = 80) => {
    const props = { size, color: '#fff' };
    switch (main) {
      case 'Clear': return <WiDaySunny {...props} />;
      case 'Rain': return <WiRain {...props} />;
      case 'Snow': return <WiSnow {...props} />;
      case 'Clouds': return <WiCloudy {...props} />;
      default: return <WiStrongWind {...props} />;
    }
  };

  const getBackgroundClass = (main) => {
    switch (main) {
      case 'Clear': return 'sunny';
      case 'Rain': return 'rainy';
      case 'Snow': return 'snowy';
      case 'Clouds': return 'cloudy';
      default: return 'default';
    }
  };

  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches.slice(0, 5)));
  }, [recentSearches]);

  const fetchWeather = async (searchCity) => {
    const query = searchCity || city;
    if (!query.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');
    setWeather(null);
    setForecast(null);

    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=${unit}&appid=${API_KEY}`
      );
      const weatherData = await weatherRes.json();

      if (weatherData.cod !== 200) {
        setError(weatherData.message);
        setLoading(false);
        return;
      }

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${query}&units=${unit}&appid=${API_KEY}`
      );
      const forecastData = await forecastRes.json();

      if (forecastData.cod === '200') {
        setWeather(weatherData);
        setForecast(forecastData);
        setBackground(getBackgroundClass(weatherData.weather[0].main));

        if (!recentSearches.includes(query)) {
          setRecentSearches([query, ...recentSearches]);
        }
      } else {
        setError(forecastData.message);
      }
    } catch {
      setError('Failed to fetch weather data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUnit = () => {
    const newUnit = unit === 'metric' ? 'imperial' : 'metric';
    setUnit(newUnit);
    if (weather) fetchWeather(weather.name);
  };

  const handleRecentSearch = (searchCity) => {
    setCity(searchCity);
    fetchWeather(searchCity);
  };

  const formatDate = (dt) => {
    return new Date(dt * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      className={`weather-container ${background}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h1 className="title">☁️ Dreamy Weather</h1>

      <motion.div className="input-group" whileHover={{ scale: 1.02 }}>
        <input
          type="text"
          placeholder="Search for a city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchWeather()}
        />
        <button onClick={fetchWeather}>Search</button>
        <button onClick={toggleUnit} className="unit-toggle">
          {unit === 'metric' ? '°F' : '°C'}
        </button>
      </motion.div>

      {recentSearches.length > 0 && (
        <div className="recent-searches">
          <h3>Recent</h3>
          <div className="recent-list">
            {recentSearches.map((search, i) => (
              <motion.button
                key={i}
                onClick={() => handleRecentSearch(search)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {search}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="info">Loading weather data...</p>}
      {error && <p className="error">{error}</p>}

      <AnimatePresence>
        {weather && (
          <motion.div
            className="weather-info"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2>{weather.name}, {weather.sys.country}</h2>
            <div className="icon">{getWeatherIcon(weather.weather[0].main)}</div>
            <p className="description">{weather.weather[0].description}</p>
            <p className="temp">
              <WiThermometer size={30} /> {weather.main.temp}°{unit === 'metric' ? 'C' : 'F'}
            </p>
            <p><WiHumidity size={30} /> Humidity: {weather.main.humidity}%</p>
            <p><WiWindy size={30} /> Wind: {weather.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</p>
            <p>Pressure: {weather.main.pressure} hPa</p>
            <p>Sunrise: {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}</p>
            <p>Sunset: {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {forecast && (
        <motion.div
          className="forecast-container"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h3>5-Day Forecast</h3>
          <div className="forecast-grid">
            {forecast.list
              .filter((_, i) => i % 8 === 0)
              .map((item, i) => (
                <motion.div key={i} className="forecast-card" whileHover={{ scale: 1.05 }}>
                  <p>{formatDate(item.dt)}</p>
                  <div className="forecast-icon">{getWeatherIcon(item.weather[0].main, 50)}</div>
                  <p>{item.main.temp}°{unit === 'metric' ? 'C' : 'F'}</p>
                  <p>{item.weather[0].description}</p>
                </motion.div>
              ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default WeatherApp;
