import "dotenv/config";
import cors from "cors";
import express from "express";
import { buildContext, parseTimeslot } from "./context-service.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/context", async (req, res) => {
  const timeslot = parseTimeslot(req.header("X-Timeslot") ?? undefined);

  const context = await buildContext({
    timeslot,
    tavilyApiKey: process.env.TAVILY_API_KEY,
    cacheMinutes: Number(process.env.CACHE_TTL_MINUTES ?? "20"),
    timeoutMs: Number(process.env.TAVILY_TIMEOUT_MS ?? "6000"),
  });

  res.status(200).json(context);
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled backend error:", err);
  res.status(500).json({
    error: "internal_error",
    message: "Unerwarteter Fehler.",
  });
});

const port = Number(process.env.PORT ?? "8787");

app.listen(port, () => {
  console.log(`City Wallet backend listening on http://localhost:${port}`);
});
