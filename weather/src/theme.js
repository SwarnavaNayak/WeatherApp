// Sky palette + display helpers.
//
// The backdrop is a "living sky": a gradient keyed to the real condition and
// time of day, rather than a single static theme. Colors are drawn from how
// each sky actually looks (dawn/dusk blends, storm slate, snow-light, etc.)
// rather than an arbitrary brand palette.

const GRADIENTS = {
  'Clear-day': ['#6EC6FF', '#8FD3F4', '#FFD68A'],
  'Clear-night': ['#0B1130', '#1B2358', '#3A2B5C'],
  'Clouds-day': ['#7C93A8', '#A9BAC9', '#DCE4EA'],
  'Clouds-night': ['#1B2733', '#2B3B4E', '#435367'],
  'Rain-day': ['#3E5866', '#587485', '#8CA3AD'],
  'Rain-night': ['#060C10', '#0F1B22', '#1C2E36'],
  'Drizzle-day': ['#3E5866', '#587485', '#8CA3AD'],
  'Drizzle-night': ['#060C10', '#0F1B22', '#1C2E36'],
  'Thunderstorm-day': ['#0D0D1A', '#1D1B36', '#33244A'],
  'Thunderstorm-night': ['#0D0D1A', '#1D1B36', '#33244A'],
  'Snow-day': ['#CFE3F0', '#E4EDF5', '#F5F0F8'],
  'Snow-night': ['#202B3A', '#34435A', '#4C5A72'],
  'Atmosphere-day': ['#9C9186', '#B8AFA3', '#DCD5C9'],
  'Atmosphere-night': ['#201D1A', '#332E29', '#4A423A'],
  default: ['#232A4A', '#5C5A7E', '#C99383'],
};

const ATMOSPHERE_CONDITIONS = new Set([
  'Mist', 'Smoke', 'Haze', 'Dust', 'Fog', 'Sand', 'Ash', 'Squall', 'Tornado',
]);

function bucketCondition(main) {
  if (!main) return 'default';
  if (GRADIENTS[`${main}-day`]) return main;
  if (ATMOSPHERE_CONDITIONS.has(main)) return 'Atmosphere';
  return 'Clouds';
}

export function getSkyGradient(main, isDay) {
  const bucket = bucketCondition(main);
  const key = bucket === 'default' ? 'default' : `${bucket}-${isDay ? 'day' : 'night'}`;
  const stops = GRADIENTS[key] || GRADIENTS.default;
  return `linear-gradient(135deg, ${stops[0]} 0%, ${stops[1]} 45%, ${stops[2]} 100%)`;
}

export function isDaytime(dt, sunrise, sunset) {
  if (!dt || !sunrise || !sunset) return true;
  return dt >= sunrise && dt < sunset;
}

export function formatTemp(celsius, unit) {
  if (celsius == null || Number.isNaN(celsius)) return '--';
  const value = unit === 'imperial' ? (celsius * 9) / 5 + 32 : celsius;
  return Math.round(value);
}

export function formatWind(metersPerSecond, unit) {
  const label = unit === 'imperial' ? 'mph' : 'km/h';
  if (metersPerSecond == null || Number.isNaN(metersPerSecond)) return { value: '--', label };
  const value = unit === 'imperial' ? metersPerSecond * 2.23694 : metersPerSecond * 3.6;
  return { value: Math.round(value), label };
}

export function getLocalTime(dt, timezoneOffsetSeconds) {
  if (!dt) return '';
  const shifted = new Date((dt + (timezoneOffsetSeconds || 0)) * 1000);
  return shifted.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}
