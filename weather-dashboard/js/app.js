/**
 * Main app entry point: wires events, coordinates API calls, and triggers UI rendering.
 */
import { fetchForecast, reverseGeocode, searchCities } from './api.js';
import {
  addRecentSearch,
  getRecentSearches,
  getThemePreference,
  getUnitPreference,
  setThemePreference,
  setUnitPreference
} from './storage.js';
import {
  renderCurrentWeather,
  renderDailyForecast,
  renderHourlyForecast,
  renderRecentSearches,
  renderSuggestions,
  setError,
  setLoading
} from './ui.js';

const elements = {
  cityInput: document.getElementById('city-input'),
  suggestions: document.getElementById('suggestions'),
  locationButton: document.getElementById('location-btn'),
  errorMessage: document.getElementById('error-message'),
  loadingOverlay: document.getElementById('loading-overlay'),
  currentWeather: document.getElementById('current-weather'),
  hourlyForecast: document.getElementById('hourly-forecast'),
  dailyForecast: document.getElementById('daily-forecast'),
  recentSearches: document.getElementById('recent-searches'),
  unitToggle: document.getElementById('unit-toggle'),
  themeToggle: document.getElementById('theme-toggle')
};

const state = {
  forecast: null,
  location: null,
  unit: getUnitPreference(),
  debounceTimer: null
};

const GEOLOCATION_TIMEOUT_MS = 10000;

function applyTheme(preference) {
  if (preference === 'dark' || preference === 'light') {
    document.documentElement.dataset.theme = preference;
    elements.themeToggle.checked = preference === 'dark';
    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  delete document.documentElement.dataset.theme;
  elements.themeToggle.checked = prefersDark;
}

function showWeather() {
  if (!state.forecast || !state.location) {
    return;
  }

  renderCurrentWeather(elements.currentWeather, state.location, state.forecast, state.unit);
  renderHourlyForecast(elements.hourlyForecast, state.forecast, state.unit);
  renderDailyForecast(elements.dailyForecast, state.forecast, state.unit);
}

async function loadForecast(location, saveAsRecent) {
  try {
    setLoading(elements.loadingOverlay, true);
    setError(elements.errorMessage, '');

    const forecast = await fetchForecast(location.latitude, location.longitude);
    state.location = location;
    state.forecast = forecast;
    showWeather();

    if (saveAsRecent) {
      const recent = addRecentSearch(location);
      renderRecentSearches(elements.recentSearches, recent);
    }
  } catch {
    setError(elements.errorMessage, 'Unable to fetch weather right now. Please try again.');
  } finally {
    setLoading(elements.loadingOverlay, false);
  }
}

async function fetchSuggestions(query) {
  try {
    setError(elements.errorMessage, '');

    const suggestions = await searchCities(query);

    if (!suggestions.length && query.trim().length >= 2) {
      setError(elements.errorMessage, 'No city results found. Try another search.');
    }

    renderSuggestions(elements.suggestions, suggestions);
  } catch {
    setError(elements.errorMessage, 'Could not load city suggestions. Check your connection.');
  }
}

function handleCityTyping(event) {
  const query = event.target.value;

  if (state.debounceTimer) {
    window.clearTimeout(state.debounceTimer);
  }

  state.debounceTimer = window.setTimeout(() => {
    if (query.trim().length < 2) {
      renderSuggestions(elements.suggestions, []);
      return;
    }

    fetchSuggestions(query);
  }, 300);
}

function parseButtonLocation(button) {
  return {
    name: button.dataset.name || 'Unknown',
    country: button.dataset.country || 'Unknown',
    admin1: button.dataset.admin1 || '',
    latitude: Number(button.dataset.latitude),
    longitude: Number(button.dataset.longitude)
  };
}

function handleSuggestionClick(event) {
  const button = event.target.closest('button');

  if (!button) {
    return;
  }

  const location = parseButtonLocation(button);
  elements.cityInput.value = `${location.name}, ${location.country}`;
  renderSuggestions(elements.suggestions, []);
  loadForecast(location, true);
}

async function resolveRecentSearchLocation(search) {
  const candidates = await searchCities(search.name);
  const normalizedName = search.name.toLowerCase();
  const normalizedCountry = search.country.toLowerCase();
  const normalizedAdmin1 = (search.admin1 || '').toLowerCase();

  const match = candidates.find((candidate) => {
    const sameName = candidate.name?.toLowerCase() === normalizedName;
    const sameCountry = (candidate.country || '').toLowerCase() === normalizedCountry;
    const sameAdmin1 =
      !normalizedAdmin1 || (candidate.admin1 || '').toLowerCase() === normalizedAdmin1;
    return sameName && sameCountry && sameAdmin1;
  });

  if (!match) {
    throw new Error('Search location not found');
  }

  return {
    name: match.name,
    country: match.country || 'Unknown',
    admin1: match.admin1 || '',
    latitude: match.latitude,
    longitude: match.longitude
  };
}

async function handleRecentClick(event) {
  const button = event.target.closest('button');

  if (!button) {
    return;
  }

  const search = {
    name: button.dataset.name || 'Unknown',
    country: button.dataset.country || 'Unknown',
    admin1: button.dataset.admin1 || ''
  };

  try {
    const location = await resolveRecentSearchLocation(search);
    elements.cityInput.value = `${location.name}, ${location.country}`;
    await loadForecast(location, true);
  } catch {
    setError(elements.errorMessage, 'Could not reload that saved city. Please search again.');
  }
}

function handleUnitToggle() {
  state.unit = elements.unitToggle.checked ? 'imperial' : 'metric';
  setUnitPreference(state.unit);
  showWeather();
}

function handleThemeToggle() {
  const nextTheme = elements.themeToggle.checked ? 'dark' : 'light';
  setThemePreference(nextTheme);
  applyTheme(nextTheme);
}

function loadRecentSearches() {
  const recents = getRecentSearches();
  renderRecentSearches(elements.recentSearches, recents);
}

async function handleUseMyLocation() {
  if (!navigator.geolocation) {
    setError(elements.errorMessage, 'Geolocation is not supported by your browser.');
    return;
  }

  setError(elements.errorMessage, '');

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      try {
        setLoading(elements.loadingOverlay, true);
        const place = await reverseGeocode(latitude, longitude);
        const location = {
          name: place?.name || 'Current Location',
          country: place?.country || 'Unknown',
          latitude,
          longitude
        };
        elements.cityInput.value = `${location.name}, ${location.country}`;
        await loadForecast(location, false);
      } catch {
        setError(elements.errorMessage, 'Could not resolve your location name. Showing nearby weather.');
        const fallbackLocation = {
          name: 'Current Location',
          country: 'Unknown',
          latitude,
          longitude
        };
        await loadForecast(fallbackLocation, false);
      } finally {
        setLoading(elements.loadingOverlay, false);
      }
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        setError(elements.errorMessage, 'Location access was denied. Please search for a city instead.');
      } else {
        setError(elements.errorMessage, 'Unable to determine your location right now.');
      }
    },
    { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS }
  );
}

function hideSuggestionsOnOutsideClick(event) {
  if (!event.target.closest('.search-input-wrap')) {
    renderSuggestions(elements.suggestions, []);
  }
}

function initialize() {
  const savedTheme = getThemePreference();
  applyTheme(savedTheme);

  elements.unitToggle.checked = state.unit === 'imperial';
  elements.cityInput.addEventListener('input', handleCityTyping);
  elements.suggestions.addEventListener('click', handleSuggestionClick);
  elements.locationButton.addEventListener('click', handleUseMyLocation);
  elements.recentSearches.addEventListener('click', handleRecentClick);
  elements.unitToggle.addEventListener('change', handleUnitToggle);
  elements.themeToggle.addEventListener('change', handleThemeToggle);
  document.addEventListener('click', hideSuggestionsOnOutsideClick);

  loadRecentSearches();
}

initialize();
