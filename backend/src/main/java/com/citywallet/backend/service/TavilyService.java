package com.citywallet.backend.service;

import com.citywallet.backend.model.ContextEvent;
import com.citywallet.backend.model.EventsResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper = new ObjectMapper();
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

        if (apiKey == null || apiKey.isBlank()) {
            EventsResult fallback = withFallback("TAVILY_API_KEY fehlt.", false);
            putCache(now, ttlMinutes, fallback);
            return fallback;
        }

        try {
            String body = objectMapper.writeValueAsString(Map.of(
                "api_key", apiKey,
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
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                EventsResult fallback = withFallback("Tavily HTTP " + response.statusCode() + ".", false);
                putCache(now, ttlMinutes, fallback);
                return fallback;
            }

            JsonNode root = objectMapper.readTree(response.body());
            List<ContextEvent> events = parseEvents(root);
            if (events.size() < 3) {
                EventsResult fallback = withFallback("Zu wenige Tavily-Treffer.", false);
                putCache(now, ttlMinutes, fallback);
                return fallback;
            }

            EventsResult success = new EventsResult(events.subList(0, Math.min(5, events.size())), "tavily", false, null);
            putCache(now, ttlMinutes, success);
            return success;
        } catch (Exception ex) {
            EventsResult fallback = withFallback("Tavily Timeout oder Netzfehler.", false);
            putCache(now, ttlMinutes, fallback);
            return fallback;
        }
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

    private EventsResult withFallback(String note, boolean cacheHit) {
        return new EventsResult(FallbackEvents.EVENTS.subList(0, 5), "fallback", cacheHit, note);
    }

    private record CacheEntry(EventsResult value, long expiresAt) {
    }
}
