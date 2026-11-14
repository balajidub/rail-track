# RailTrack

RailTrack is a DEMO SIMULATION railway operations command center built with Next.js and a Spring Boot API. Its train, station, alert, prediction, occupancy, and route data are fictional; it does not connect to Indian Railways, live railway systems, or booking services.

## Features

The dashboard includes train tracking on an OpenStreetMap/Leaflet map, timetable search, journey planning, station and network analytics, plus V2 panels for rule-based delay-risk estimates, station congestion scenarios, incident workflow management, coach-level occupancy estimates, and route scenario comparisons. When the API is configured, supported V1 and V2 reads use backend data and incident changes are persisted; bundled fictional data remains as a partial/offline fallback.

## Live site

https://balajidub.github.io/rail-track/

## Run locally

```bash
npm ci
npm run dev
```

Open [http://localhost:3000/rail-track/](http://localhost:3000/rail-track/).
To connect a local backend, copy `.env.example` to `.env.local` (PowerShell: `Copy-Item .env.example .env.local`).
The public API origin is embedded at build time from `NEXT_PUBLIC_RAILTRACK_API_URL`. Without that value, the existing
bundled fictional data remains available.

## Run the backend

The Spring Boot API requires Java 21, Maven, and a MySQL database. Create a local `railtrack` database:

```sql
CREATE DATABASE railtrack CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

Set the connection variables in your shell; the password is never stored in the repository. Flyway applies the schema
and fictional seed records at startup, and Hibernate validates the migrated schema.

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/railtrack?serverTimezone=UTC"
$env:DB_USERNAME = "your-local-mysql-user"
$env:DB_PASSWORD = "your-local-mysql-password"
cd backend
mvn spring-boot:run
```

The demo health endpoint is available at [http://localhost:8080/api/health](http://localhost:8080/api/health).
Set `RAILTRACK_CORS_ALLOWED_ORIGINS` to a comma-separated list of trusted frontend origins when deploying.
The frontend is a static GitHub Pages export, so the backend must be hosted separately; configure the frontend API URL
at build time. For GitHub Pages builds, set the repository Actions variable `RAILTRACK_API_URL` to the backend origin.

Train and station reads are available at `GET /api/trains`, `GET /api/trains/{id}`,
`GET /api/trains/search?q=...`, `GET /api/trains/{id}/stops`, `GET /api/stations`, and
`GET /api/stations/{id}`. The V2 simulation APIs include:

- Delay estimates: `GET /api/predictions` and `GET /api/predictions/{trainId}`.
- Station congestion snapshots and history: `GET /api/stations/{stationId}/congestion` and
  `GET /api/stations/{stationId}/congestion/history`.
- Incident lifecycle: `GET`/`POST /api/incidents`, `GET`/`PUT`/`DELETE /api/incidents/{id}`, and
  `PATCH /api/incidents/{id}/status`.
- Coach occupancy: `GET /api/trains/{trainId}/coaches` and `GET /api/coaches/{id}/occupancy`.
- Route scenarios: `POST /api/routes/compare` and `GET /api/routes/{id}`. Results are illustrative and
  explicitly not officially approved routes or dispatch guidance.
- Simulation controls: `GET /api/simulation/status` and `POST` to `/api/simulation/start`,
  `/api/simulation/pause`, or `/api/simulation/reset`.

Responses use the existing frontend field names where applicable. These calculations are transparent,
rule-based simulations and are not trained AI predictions or live railway information.

## Deployment

The GitHub Actions workflow builds a static export and deploys it to GitHub Pages when changes are pushed to `master`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
