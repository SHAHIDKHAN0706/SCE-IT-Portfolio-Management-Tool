# Weather Dashboard

A standalone weather dashboard built with plain HTML, CSS, and vanilla JavaScript (ES modules). It uses Open-Meteo APIs to show current weather, next 24-hour forecast, and a 7-day outlook.

## Features

- City search with autocomplete suggestions
- "Use my location" weather lookup via browser geolocation
- Current weather summary (temperature, feels like, humidity, wind, precipitation, day/night, last updated)
- Horizontal 24-hour forecast strip
- 7-day forecast list
- Weather code to description/icon mapping using emoji
- Unit toggle (°C/km/h and °F/mph) with localStorage persistence
- Light/dark theme with `prefers-color-scheme` support and manual persisted toggle
- Recent searches (last 5 successful city lookups)
- Loading spinner and friendly error states
- Responsive layout for mobile and desktop

## Run locally

From this folder, either:

1. Open `index.html` directly in a modern browser, or
2. Serve it locally:

```bash
cd weather-dashboard
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy via GitHub Pages

1. Push the `weather-dashboard/` folder to your repository branch.
2. In GitHub, go to **Settings → Pages**.
3. Set source to your preferred branch and root (or `/docs` if you later relocate files).
4. Save and open the generated GitHub Pages URL.

## API credit

Weather data powered by [Open-Meteo](https://open-meteo.com/).

No API key is required.

## Screenshots

_Add screenshots here after deployment or local run._
