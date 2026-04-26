# City Wallet Backend (MVP)

Leichtgewichtiges Node/TypeScript-Backend mit einem Endpoint `GET /context`.

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

## Setup

1. Abhaengigkeiten installieren:
   ```bash
   npm install
   ```
2. ENV anlegen:
   ```bash
   cp .env.example .env
   ```
3. In `.env` deinen Tavily-Key eintragen:
   - `TAVILY_API_KEY=...`

## Start

- Dev:
  ```bash
  npm run dev
  ```
- Prod-Build:
  ```bash
  npm run build
  npm start
  ```

## Test (curl)

```bash
curl -X GET "http://localhost:8787/context" -H "X-Timeslot: 30"
```

PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:8787/context" -Headers @{"X-Timeslot"="30"} | ConvertTo-Json -Depth 6
```

Beispielantwort:

```json
{
  "time": "2026-04-25T22:00:00.000Z",
  "location": { "city": "Stuttgart", "region": "Mitte" },
  "weather": { "condition": "cloudy", "tempC": 14, "label": "Bedeckt und mild" },
  "timeslot": 30,
  "demandProxy": { "level": "medium", "score": 0.58, "reason": "Normale Auslastung" },
  "events": [
    { "title": "Event 1", "url": "https://...", "snippet": "..." }
  ],
  "eventsMeta": { "source": "tavily", "cacheHit": false }
}
```

## Deploy-Hinweise

- Geeignet fuer Vercel/Render/Railway als Node-Service.
- Wichtig: `TAVILY_API_KEY` nur als Server-Secret setzen, niemals ins Frontend geben.
