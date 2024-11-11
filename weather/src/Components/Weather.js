import React, { useState } from 'react';
import './Weather.css';
import { FaSearch, FaWind } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import { WiHumidity } from 'react-icons/wi';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');

  const WEATHER_API_KEY = '5945053d54edcb60aadbcf4aa6396bc7';
  const PEXELS_API_KEY = '9YIeI45zjS2s3Td8scu4pQbRnaySEnMKAryP8SiuGbeVW2QAJvKsUOP1';

  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${WEATHER_API_KEY}`;
  const fetchWeatherData = async () => {
    try {
      const response = await fetch(weatherUrl);
      const data = await response.json();
      if (response.ok) {
        setWeather(data);
        setError('');
        fetchBackgroundImage(data.name);
      } else {
        setError('City not found. Please enter a valid city name.');
        setWeather(null);
      }
    } catch (err) {
      setError('Error fetching weather data');
    }
  };


  const fetchBackgroundImage = async (cityName) => {
    const pexelsUrl = `https://api.pexels.com/v1/search?query=${cityName}&per_page=1`;
    try {
      const response = await fetch(pexelsUrl, {
        headers: { Authorization: PEXELS_API_KEY },
      });
      const result = await response.json();
      if (result.photos && result.photos.length > 0) {
        setBackgroundImage(result.photos[0].src.landscape);
      }
    } catch (err) {
      console.error('Error fetching background image', err);
    }
  };

  return (
    <div
      className='app'
      style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : '' }}
    >
      <div className='overlay'></div>
      <div className='container'>
        <div className='city'>
          <input
            type='text'
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder='Enter city name'
          />
          <button onClick={fetchWeatherData}>
            <FaSearch />
          </button>
        </div>

        {error && <p className='error-message'>{error}</p>}

        {weather && weather.weather && (
          <div className='content'>
            <div className='weather-image'>
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
              />
              <h3 className='desc'>{weather.weather[0].description}</h3>
            </div>
            <div className='weather-temp'>
              {weather.main.temp}&deg;C
            </div>
            <div className='weather-city'>
              <MdLocationOn /> {weather.name}, {weather.sys.country}
            </div>
            <div className='weather-stats'>
              <div className='wind'>
                <FaWind className='wind-icon' />
                <h3>{weather.wind.speed} Km/h</h3>
              </div>
              <div className='humidity'>
                <WiHumidity className='humidity-icon' />
                <h3>{weather.main.humidity}%</h3>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
