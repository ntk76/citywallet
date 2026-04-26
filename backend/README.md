# City Wallet Backend (Java 21 + Gradle)

Leichtgewichtiges Spring-Boot-Backend mit `GET /context` und `GET /events`.

## Features

- `GET /events` — aktuelle Events (Tavily-Suche mit **heutigem Datum** in `Europe/Berlin`, siehe `citywallet.events.*` in `application.properties`), Antwort: `events[]` + `eventsMeta` (`source`, `cacheHit`, `note`, optional `searchQuery`).
- `GET /context` liefert:
  - `time` (ISO)
  - `location` (`city=Stuttgart`, `region=Mitte`)
  - `weather` (zeitbasiertes Mock)
  - `timeslot` aus Header `X-Timeslot: 30|60|120|720|1440` (Default `30`, Werte in Minuten)
  - `demandProxy` (Mock)
  - `events[]` (3-5 Eintraege aus Tavily oder Fallback; optional `imageUrl` wenn Tavily `include_images` liefert)
  - `eventsMeta.source` (`tavily` oder `fallback`) + `cacheHit` + optional `searchQuery` (verwendete Suchphrase)
- Tavily-Key nur serverseitig via ENV.
- In-Memory-Cache (5 Minuten) zur Credit-Schonung.
- Robuste Fehlerbehandlung: Bei Tavily-Fehler/Timeout immer `200` mit Fallback-Events.

## Voraussetzungen

- Java 21
- Gradle (oder Gradle Wrapper)

## Setup

1. ENV anlegen:
   ```bash
   cp .env.example .env
   ```
2. In `.env` deinen Tavily-Key eintragen:
   - `TAVILY_API_KEY=...`
3. Optional: `EVENTS_SEARCH_CITY`, `EVENTS_SEARCH_REGION`, `EVENTS_TIMEZONE` (siehe `application.properties`).

## Start

- Dev/Run:
  ```bash
  gradle bootRun
  ```
- Build:
  ```bash
  gradle build
  ```
- Jar starten:
  ```bash
  java -jar build/libs/citywallet-backend-1.0.0.jar
  ```

## Test (curl)

```bash
curl -X GET "http://localhost:8787/context" -H "X-Timeslot: 30"
curl -s "http://localhost:8787/events"
```

PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:8787/context" -Headers @{"X-Timeslot"="30"} | ConvertTo-Json -Depth 6
```
