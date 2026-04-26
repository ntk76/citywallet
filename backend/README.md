# City Wallet Backend (Java 25 + Gradle)

Leichtgewichtiges Spring-Boot-Backend mit Endpoint `GET /context`.

## Features

- `GET /context` liefert:
  - `time` (ISO)
  - `location` (`city=Stuttgart`, `region=Mitte`)
  - `weather` (Mock)
  - `timeslot` aus Header `X-Timeslot: 15|30|60` (Default `30`)
  - `demandProxy` (Mock)
  - `events[]` (3-5 Eintraege aus Tavily oder Fallback)
  - `eventsMeta.source` (`tavily` oder `fallback`) + `cacheHit`
- Tavily-Key nur serverseitig via ENV.
- In-Memory-Cache (10-30 Minuten, default 20) zur Credit-Schonung.
- Robuste Fehlerbehandlung: Bei Tavily-Fehler/Timeout immer `200` mit Fallback-Events.

## Voraussetzungen

- Java 25
- Gradle (oder Gradle Wrapper)

## Setup

1. ENV anlegen:
   ```bash
   cp .env.example .env
   ```
2. In `.env` deinen Tavily-Key eintragen:
   - `TAVILY_API_KEY=...`

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
```

PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:8787/context" -Headers @{"X-Timeslot"="30"} | ConvertTo-Json -Depth 6
```
