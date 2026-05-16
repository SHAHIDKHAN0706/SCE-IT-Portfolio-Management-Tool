/**
 * Provides localStorage helpers for preferences and recent searches.
 */
const RECENT_SEARCHES_KEY = 'weatherDashboardRecentSearches';
const UNIT_PREF_KEY = 'weatherDashboardUnitPreference';
const THEME_PREF_KEY = 'weatherDashboardThemePreference';

function safeParse(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function getRecentSearches() {
  return safeParse(localStorage.getItem(RECENT_SEARCHES_KEY), []);
}

export function addRecentSearch(searchItem) {
  const current = getRecentSearches();
  const deduped = current.filter(
    (item) =>
      !(
        item.name?.toLowerCase() === searchItem.name?.toLowerCase() &&
        item.country?.toLowerCase() === searchItem.country?.toLowerCase()
      )
  );

  const next = [searchItem, ...deduped].slice(0, 5);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  return next;
}

export function getUnitPreference() {
  const stored = localStorage.getItem(UNIT_PREF_KEY);
  return stored === 'imperial' ? 'imperial' : 'metric';
}

export function setUnitPreference(unit) {
  localStorage.setItem(UNIT_PREF_KEY, unit === 'imperial' ? 'imperial' : 'metric');
}

export function getThemePreference() {
  const stored = localStorage.getItem(THEME_PREF_KEY);
  return stored === 'dark' || stored === 'light' ? stored : null;
}

export function setThemePreference(theme) {
  localStorage.setItem(THEME_PREF_KEY, theme === 'dark' ? 'dark' : 'light');
}
