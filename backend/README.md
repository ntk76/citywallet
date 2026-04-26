# City Wallet Backend (Java 21 + Gradle)

Leichtgewichtiges Spring-Boot-Backend mit `GET /health`, `GET /context` und `GET /events`.

**Tavily erkennen:** `GET /health` liefert `tavilyApiKeyConfigured: true/false` (ohne Key). Liefern `GET /events` bzw. `eventsMeta.source` und `diningMeta.source` den Wert **`tavily`**, kam die Antwort aus der Tavily-API (ggf. mit weniger strengem Filter); bei **`fallback`** nicht.

## Features

- `GET /events` — Events + Dining (zwei Tavily-Suchen, **heutiges Datum** in `Europe/Berlin`, siehe `citywallet.events.*` in `application.properties`): `events[]`, `eventsMeta`, `dining[]`, `diningMeta`.
- `GET /context` liefert:
  - `time` (ISO)
  - `location` (`city=Munich`, `region=Balanstrasse` — per `EVENTS_SEARCH_*`, Standard wie in `application.properties`)
  - `weather` (zeitbasiertes Mock)
  - `timeslot` aus Header `X-Timeslot: 30|60|120|720|1440` (Default `30`, Werte in Minuten)
  - `demandProxy` (Mock)
  - `events[]` (3-5 Eintraege aus Tavily oder Fallback; optional `imageUrl` wenn Tavily `include_images` liefert)
  - `eventsMeta.source` (`tavily` oder `fallback`) + `cacheHit` + optional `searchQuery` (verwendete Suchphrase)
- Tavily-Key serverseitig: **`backend/.env` wird beim Start eingelesen** (gleiche Keys wie unter Windows/Linux per `export`). Ohne gültigen Key: `eventsMeta.source` / `diningMeta.source` = `fallback`. Im Log: `Tavily enabled` vs. Warnung zu `TAVILY_API_KEY`.
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
2. In `backend/.env` einen **echten** Tavily-Key eintragen (kein Platzhalter `your-tavily-api-key`):
   - `TAVILY_API_KEY=tvly-...`
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
