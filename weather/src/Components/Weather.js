import React, { useState, useEffect, useCallback } from 'react';
import './Weather.css';
import { FaSearch, FaWind } from 'react-icons/fa';
import { MdLocationOn, MdMyLocation } from 'react-icons/md';
import { WiHumidity, WiSunrise, WiSunset, WiThermometer } from 'react-icons/wi';
import WeatherIcon from './WeatherIcon';
import { getSkyGradient, isDaytime, formatTemp, formatWind, getLocalTime } from '../theme';

const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const PEXELS_API_KEY = process.env.REACT_APP_PEXELS_API_KEY;
const WEATHER_BASE = 'https://api.openweathermap.org/data/2.5/weather';
const PEXELS_BASE = 'https://api.pexels.com/v1/search';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [photoVisible, setPhotoVisible] = useState(false);
  const [unit, setUnit] = useState('metric');

  const fetchBackground = useCallback((condition) => {
    if (!PEXELS_API_KEY) return;
    const query = `${condition} sky`;
    const url = `${PEXELS_BASE}?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    fetch(url, { headers: { Authorization: PEXELS_API_KEY } })
      .then((res) => res.json())
      .then((result) => {
        const photo = result?.photos?.[0]?.src?.landscape;
        if (!photo) return;
        const img = new Image();
        img.onload = () => {
          setBackgroundImage(photo);
          setPhotoVisible(true);
        };
        img.src = photo;
      })
      .catch(() => {
        // Non-critical: the sky gradient already carries the visual, so a
        // failed photo fetch stays silent instead of surfacing as an error.
      });
  }, []);

  const applyWeatherData = useCallback((data) => {
    setWeather(data);
    setError('');
    setPhotoVisible(false);
    if (data?.weather?.[0]?.main) {
      fetchBackground(data.weather[0].main);
    }
  }, [fetchBackground]);

  const runFetch = useCallback((params, { silent } = {}) => {
    if (!silent) setLoading(true);
    const url = `${WEATHER_BASE}?${params}&units=metric&appid=${WEATHER_API_KEY}`;
    return fetch(url)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          applyWeatherData(data);
        } else if (!silent) {
          const notFound = typeof data?.message === 'string' && data.message.toLowerCase().includes('not found');
          setError(notFound
            ? "We can't find that city. Check the spelling and try again."
            : 'Something went wrong fetching the forecast. Please try again.');
        }
      })
      .catch(() => {
        if (!silent) {
          setError('Something went wrong fetching the forecast. Check your connection and try again.');
        }
      })
      .finally(() => {
        setLoading(false);
        setIsLocating(false);
      });
  }, [applyWeatherData]);

  const fetchWeatherByCity = useCallback((cityName) => {
    if (!cityName.trim()) return;
    runFetch(`q=${encodeURIComponent(cityName.trim())}`);
  }, [runFetch]);

  const fetchWeatherByCoords = useCallback((lat, lon) => {
    runFetch(`lat=${lat}&lon=${lon}`, { silent: true });
  }, [runFetch]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setIsLocating(false);
      return undefined;
    }
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      () => {
        if (!cancelled) setIsLocating(false);
      },
      { timeout: 8000, maximumAge: 600000 }
    );
    return () => {
      cancelled = true;
    };
  }, [fetchWeatherByCoords]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeatherByCity(city);
  };

  const condition = weather?.weather?.[0];
  const isDay = weather ? isDaytime(weather.dt, weather.sys?.sunrise, weather.sys?.sunset) : true;
  const gradient = getSkyGradient(condition?.main, isDay);
  const wind = weather ? formatWind(weather.wind?.speed, unit) : null;

  return (
    <div className="app">
      <div className="sky-layer" style={{ backgroundImage: gradient }} />
      <div
        className={`photo-layer ${photoVisible ? 'is-visible' : ''}`}
        style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}
      />
      <div className="scrim" />

      <div className="container">
        <form className="search-row" onSubmit={handleSubmit}>
          <label htmlFor="city-input" className="sr-only">City name</label>
          <input
            id="city-input"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search for a city"
            autoComplete="off"
          />
          <button type="submit" aria-label="Search" disabled={loading}>
            {loading ? <span className="spinner" aria-hidden="true" /> : <FaSearch />}
          </button>
        </form>

        <div aria-live="polite">
          {error && <p className="error-message" role="alert">{error}</p>}

          {!weather && !error && isLocating && (
            <div className="prompt-state">
              <MdMyLocation className="prompt-icon" aria-hidden="true" />
              <p>Finding the sky above you&hellip;</p>
            </div>
          )}

          {!weather && !error && !isLocating && (
            <div className="prompt-state">
              <WeatherIcon code="01d" />
              <p>Search a city to see what the sky&rsquo;s doing there.</p>
            </div>
          )}

          {weather && condition && (
            <div className="content" key={weather.dt}>
              <div className="weather-hero">
                <WeatherIcon code={condition.icon} className="hero-icon" />
                <h3 className="desc">{condition.description}</h3>
              </div>

              <div className="temp-row">
                <div className="weather-temp">
                  {formatTemp(weather.main.temp, unit)}&deg;
                </div>
                <div className="unit-toggle" role="group" aria-label="Temperature unit">
                  <button
                    type="button"
                    className={unit === 'metric' ? 'is-active' : ''}
                    onClick={() => setUnit('metric')}
                  >
                    C
                  </button>
                  <button
                    type="button"
                    className={unit === 'imperial' ? 'is-active' : ''}
                    onClick={() => setUnit('imperial')}
                  >
                    F
                  </button>
                </div>
              </div>
              <p className="feels-like">
                Feels like {formatTemp(weather.main.feels_like, unit)}&deg;
              </p>

              <div className="weather-city">
                <MdLocationOn /> {weather.name}, {weather.sys.country}
                {weather.timezone != null && (
                  <span className="local-time"> &middot; {getLocalTime(weather.dt, weather.timezone)}</span>
                )}
              </div>

              <div className="weather-stats">
                <div className="stat">
                  <WiHumidity className="stat-icon" />
                  <h3>{weather.main.humidity}%</h3>
                  <span>Humidity</span>
                </div>
                <div className="stat">
                  <FaWind className="stat-icon wind-icon" />
                  <h3>{wind.value} {wind.label}</h3>
                  <span>Wind</span>
                </div>
                <div className="stat">
                  <WiThermometer className="stat-icon" />
                  <h3>{formatTemp(weather.main.temp_max, unit)}&deg; / {formatTemp(weather.main.temp_min, unit)}&deg;</h3>
                  <span>High / Low</span>
                </div>
              </div>

              {weather.sys.sunrise && weather.sys.sunset && (
                <div className="sun-row">
                  <span><WiSunrise className="stat-icon" /> {getLocalTime(weather.sys.sunrise, weather.timezone)}</span>
                  <span><WiSunset className="stat-icon" /> {getLocalTime(weather.sys.sunset, weather.timezone)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Weather;
