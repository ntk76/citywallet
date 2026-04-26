package com.citywallet.backend.service;

import com.citywallet.backend.model.ContextEvent;
import com.citywallet.backend.model.EventsResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.json.JsonMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TavilyService {

    private static final String QUERY = "Stuttgart Mitte heute events highlights";
    private static final int MIN_CACHE_MINUTES = 10;
    private static final int MAX_CACHE_MINUTES = 30;
    private static final String TAVILY_URL = "https://api.tavily.com/search";

    private final HttpClient httpClient = HttpClient.newBuilder().build();
    private final JsonMapper jsonMapper = new JsonMapper();
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    @Value("${TAVILY_API_KEY:}")
    private String apiKey;

    @Value("${CACHE_TTL_MINUTES:20}")
    private int cacheTtlMinutes;

    @Value("${TAVILY_TIMEOUT_MS:6000}")
    private int timeoutMs;

    public EventsResult fetchRelevantEvents() {
        int ttlMinutes = clampCacheMinutes(cacheTtlMinutes);
        long now = System.currentTimeMillis();
        CacheEntry cached = cache.get(QUERY);
        if (cached != null && cached.expiresAt > now) {
            return new EventsResult(cached.value.events(), cached.value.source(), true, cached.value.note());
        }

        String effectiveApiKey = sanitizeApiKey(apiKey);
        if (effectiveApiKey.isBlank()) {
            return new EventsResult(List.of(), "tavily", false, "TAVILY_API_KEY fehlt.");
        }

        try {
            String body = jsonMapper.writeValueAsString(Map.of(
                "api_key", effectiveApiKey,
                "query", QUERY,
                "search_depth", "basic",
                "max_results", 5,
                "include_answer", false,
                "include_raw_content", false
            ));

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(TAVILY_URL))
                .timeout(Duration.ofMillis(timeoutMs))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + effectiveApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return new EventsResult(
                    List.of(),
                    "tavily",
                    false,
                    "Tavily HTTP " + response.statusCode() + formatErrorDetail(response.body())
                );
            }

            JsonNode root = jsonMapper.readTree(response.body());
            List<ContextEvent> events = parseEvents(root);
            EventsResult success = new EventsResult(events.subList(0, Math.min(5, events.size())), "tavily", false, null);
            putCache(now, ttlMinutes, success);
            return success;
        } catch (Exception ex) {
            return new EventsResult(List.of(), "tavily", false, "Tavily Timeout oder Netzfehler.");
        }
    }

    private String sanitizeApiKey(String value) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        if (
            (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))
        ) {
            return trimmed.substring(1, trimmed.length() - 1).trim();
        }
        return trimmed;
    }

    private String formatErrorDetail(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return ".";
        }
        String compact = responseBody.replaceAll("\\s+", " ").trim();
        String snippet = compact.substring(0, Math.min(140, compact.length()));
        return ": " + snippet;
    }

    private void putCache(long now, int ttlMinutes, EventsResult result) {
        cache.put(QUERY, new CacheEntry(result, now + ttlMinutes * 60_000L));
    }

    private int clampCacheMinutes(int value) {
        return Math.max(MIN_CACHE_MINUTES, Math.min(MAX_CACHE_MINUTES, value));
    }

    private List<ContextEvent> parseEvents(JsonNode root) {
        List<ContextEvent> events = new ArrayList<>();
        JsonNode results = root.path("results");
        if (!results.isArray()) {
            return events;
        }

        for (JsonNode item : results) {
            String title = item.path("title").asText("").trim();
            String url = item.path("url").asText("").trim();
            String content = item.path("content").asText("").trim();
            if (title.isBlank() || url.isBlank()) {
                continue;
            }
            String snippet = content.isBlank()
                ? "Weitere Details direkt auf der Quelle."
                : content.substring(0, Math.min(220, content.length()));
            events.add(new ContextEvent(title, url, snippet));
        }
        return events;
    }

    private record CacheEntry(EventsResult value, long expiresAt) {
    }
}
