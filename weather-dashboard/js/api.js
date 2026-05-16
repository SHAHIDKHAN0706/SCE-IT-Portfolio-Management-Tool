/**
 * Wraps Open-Meteo geocoding and forecast API requests.
 */
const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1';
const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function searchCities(query) {
  const normalized = query.trim();

  if (normalized.length < 2) {
    return [];
  }

  const url = `${GEOCODING_BASE}/search?name=${encodeURIComponent(
    normalized
  )}&count=5&language=en&format=json`;

  const data = await fetchJson(url);
  return data.results || [];
}

export async function reverseGeocode(latitude, longitude) {
  const url = `${GEOCODING_BASE}/reverse?latitude=${encodeURIComponent(
    latitude
  )}&longitude=${encodeURIComponent(longitude)}&language=en&format=json`;

  const data = await fetchJson(url);
  return data.results?.[0] || null;
}

export async function fetchForecast(latitude, longitude) {
  const url = `${FORECAST_BASE}?latitude=${encodeURIComponent(
    latitude
  )}&longitude=${encodeURIComponent(
    longitude
  )}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`;

  return fetchJson(url);
}
