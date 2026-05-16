/**
 * Renders weather dashboard UI elements in the DOM.
 */
import { getWeatherCodeInfo } from './weatherCodes.js';

function celsiusToFahrenheit(value) {
  return (value * 9) / 5 + 32;
}

function kmhToMph(value) {
  return value / 1.609344;
}

function mmToInches(value) {
  return value / 25.4;
}

function isImperialUnit(unit) {
  return unit === 'imperial';
}

function formatTemp(value, unit) {
  if (typeof value !== 'number') {
    return '--';
  }

  const converted = isImperialUnit(unit) ? celsiusToFahrenheit(value) : value;
  const suffix = isImperialUnit(unit) ? '°F' : '°C';
  return `${Math.round(converted)}${suffix}`;
}

function formatSpeed(value, unit) {
  if (typeof value !== 'number') {
    return '--';
  }

  const converted = isImperialUnit(unit) ? kmhToMph(value) : value;
  const suffix = isImperialUnit(unit) ? 'mph' : 'km/h';
  return `${Math.round(converted)} ${suffix}`;
}

function formatPrecipitation(value, unit) {
  if (typeof value !== 'number') {
    return '--';
  }

  const roundedValue = isImperialUnit(unit) ? mmToInches(value) : value;
  const suffix = isImperialUnit(unit) ? 'in' : 'mm';
  return `${roundedValue.toFixed(1)} ${suffix}`;
}

function directionFromDegrees(degrees) {
  if (typeof degrees !== 'number') {
    return '--';
  }

  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return directions[index];
}

function appendStat(container, label, value) {
  const card = document.createElement('div');
  card.className = 'stat';

  const labelEl = document.createElement('div');
  labelEl.className = 'stat-label';
  labelEl.textContent = label;

  const valueEl = document.createElement('div');
  valueEl.className = 'stat-value';
  valueEl.textContent = value;

  card.append(labelEl, valueEl);
  container.appendChild(card);
}

function formatWithTimezone(value, timezone, options) {
  const date = new Date(value);
  return new Intl.DateTimeFormat([], { timeZone: timezone, ...options }).format(date);
}

export function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function setLoading(loadingOverlayElement, isLoading) {
  loadingOverlayElement.hidden = !isLoading;
}

export function setError(errorElement, message) {
  if (message) {
    errorElement.textContent = message;
    errorElement.hidden = false;
    return;
  }

  errorElement.textContent = '';
  errorElement.hidden = true;
}

export function renderCurrentWeather(container, location, forecast, unit) {
  clearElement(container);

  const current = forecast.current;
  const weather = getWeatherCodeInfo(current.weather_code);

  const top = document.createElement('div');
  top.className = 'current-top';

  const left = document.createElement('div');
  const place = document.createElement('h2');
  place.textContent = `${location.name}, ${location.country}`;

  const temp = document.createElement('p');
  temp.className = 'current-temp';
  temp.textContent = `${weather.icon} ${formatTemp(current.temperature_2m, unit)}`;

  const desc = document.createElement('p');
  desc.className = 'current-meta';
  const dayPart = current.is_day ? 'Daytime' : 'Nighttime';
  desc.textContent = `${weather.description} • ${dayPart}`;

  left.append(place, temp, desc);

  const right = document.createElement('div');
  const updated = document.createElement('p');
  updated.className = 'current-meta';
  updated.textContent = `Last updated: ${formatWithTimezone(current.time, forecast.timezone, {
    hour: 'numeric',
    minute: '2-digit',
    weekday: 'short'
  })}`;
  right.appendChild(updated);

  top.append(left, right);
  container.appendChild(top);

  const stats = document.createElement('div');
  stats.className = 'stats-grid';

  appendStat(stats, 'Feels Like', formatTemp(current.apparent_temperature, unit));
  appendStat(stats, 'Humidity', `${Math.round(current.relative_humidity_2m)}%`);
  appendStat(
    stats,
    'Wind',
    `${formatSpeed(current.wind_speed_10m, unit)} ${directionFromDegrees(current.wind_direction_10m)}`
  );
  appendStat(stats, 'Precipitation', formatPrecipitation(current.precipitation, unit));

  container.appendChild(stats);
}

export function renderHourlyForecast(container, forecast, unit) {
  clearElement(container);

  const times = forecast.hourly.time;
  const temps = forecast.hourly.temperature_2m;
  const precipProbabilities = forecast.hourly.precipitation_probability;
  const codes = forecast.hourly.weather_code;

  const startIndex = Math.max(times.indexOf(forecast.current.time), 0);
  const endIndex = Math.min(startIndex + 24, times.length);

  for (let index = startIndex; index < endIndex; index += 1) {
    const card = document.createElement('article');
    card.className = 'hour-card';

    const timeEl = document.createElement('div');
    timeEl.className = 'hour-time';
    timeEl.textContent = formatWithTimezone(times[index], forecast.timezone, {
      hour: 'numeric'
    });

    const icon = document.createElement('div');
    icon.textContent = getWeatherCodeInfo(codes[index]).icon;

    const temp = document.createElement('div');
    temp.textContent = formatTemp(temps[index], unit);

    const precip = document.createElement('div');
    precip.className = 'hour-time';
    precip.textContent = `${Math.round(precipProbabilities[index] || 0)}% 🌧`;

    card.append(timeEl, icon, temp, precip);
    container.appendChild(card);
  }
}

export function renderDailyForecast(container, forecast, unit) {
  clearElement(container);

  const days = forecast.daily.time;
  const maxTemps = forecast.daily.temperature_2m_max;
  const minTemps = forecast.daily.temperature_2m_min;
  const precipSums = forecast.daily.precipitation_sum;
  const codes = forecast.daily.weather_code;

  days.forEach((day, index) => {
    const item = document.createElement('article');
    item.className = 'daily-item';

    const dayLabel = document.createElement('div');
    dayLabel.className = 'daily-day';
    dayLabel.textContent = formatWithTimezone(day, forecast.timezone, { weekday: 'long' });

    const icon = document.createElement('div');
    icon.className = 'daily-icon';
    icon.textContent = getWeatherCodeInfo(codes[index]).icon;

    const temperatures = document.createElement('div');
    temperatures.className = 'daily-temps';
    temperatures.textContent = `${formatTemp(maxTemps[index], unit)} / ${formatTemp(minTemps[index], unit)}`;

    const precipitation = document.createElement('div');
    precipitation.className = 'daily-precip';
    precipitation.textContent = `Precipitation: ${formatPrecipitation(precipSums[index] || 0, unit)}`;

    item.append(dayLabel, icon, temperatures, precipitation);
    container.appendChild(item);
  });
}

export function renderSuggestions(container, suggestions) {
  clearElement(container);

  suggestions.forEach((result) => {
    const listItem = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.latitude = String(result.latitude);
    button.dataset.longitude = String(result.longitude);
    button.dataset.name = result.name;
    button.dataset.country = result.country || '';
    button.dataset.admin1 = result.admin1 || '';
    button.textContent = `${result.name}, ${result.country || 'Unknown'}`;
    listItem.appendChild(button);
    container.appendChild(listItem);
  });
}

export function renderRecentSearches(container, searches) {
  clearElement(container);

  searches.forEach((search) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.name = search.name;
    button.dataset.country = search.country;
    button.dataset.admin1 = search.admin1 || '';
    button.textContent = `${search.name}, ${search.country}`;
    container.appendChild(button);
  });
}
