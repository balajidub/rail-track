# RailTrack

RailTrack is a railway operations command-center prototype built with Next.js. Its train, station, alert, prediction, occupancy, and route data are simulated; it does not connect to live railway systems or booking services.

## Features

The dashboard includes train tracking on an OpenStreetMap/Leaflet map, timetable search, journey planning, station and network analytics, plus V2 panels for rule-based delay-risk estimates, station congestion scenarios, incident workflow management, coach-level occupancy estimates, and route scenario comparisons. Incident edits remain in shared application state for the browser session.

## Live site

https://balajidub.github.io/rail-track/

## Run locally

```bash
npm ci
npm run dev
```

Open [http://localhost:3000/rail-track/](http://localhost:3000/rail-track/).

## Deployment

The GitHub Actions workflow builds a static export and deploys it to GitHub Pages when changes are pushed to `master`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
