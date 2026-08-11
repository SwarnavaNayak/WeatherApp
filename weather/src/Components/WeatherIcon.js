import React from 'react';
import {
  WiDaySunny, WiNightClear,
  WiDayCloudy, WiNightAltCloudy,
  WiCloud,
  WiCloudy,
  WiDayShowers, WiNightAltShowers,
  WiDayRain, WiNightAltRain,
  WiDayThunderstorm, WiNightAltThunderstorm,
  WiDaySnow, WiNightAltSnow,
  WiDayFog, WiNightFog,
} from 'react-icons/wi';

// Maps OpenWeatherMap's icon codes to a matching Weather Icons glyph so the
// icon language stays consistent with the rest of the UI instead of mixing
// in OWM's own raster PNGs.
const ICON_MAP = {
  '01d': WiDaySunny, '01n': WiNightClear,
  '02d': WiDayCloudy, '02n': WiNightAltCloudy,
  '03d': WiCloud, '03n': WiCloud,
  '04d': WiCloudy, '04n': WiCloudy,
  '09d': WiDayShowers, '09n': WiNightAltShowers,
  '10d': WiDayRain, '10n': WiNightAltRain,
  '11d': WiDayThunderstorm, '11n': WiNightAltThunderstorm,
  '13d': WiDaySnow, '13n': WiNightAltSnow,
  '50d': WiDayFog, '50n': WiNightFog,
};

const WeatherIcon = ({ code, className = '' }) => {
  const IconComponent = ICON_MAP[code] || WiCloud;
  return <IconComponent className={`weather-icon-glyph ${className}`} aria-hidden="true" focusable="false" />;
};

export default WeatherIcon;
