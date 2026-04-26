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
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TavilyService {

    private static final int MIN_CACHE_MINUTES = 5;
    private static final int MAX_CACHE_MINUTES = 6;
    private static final String TAVILY_URL = "https://api.tavily.com/search";
    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    private final HttpClient httpClient = HttpClient.newBuilder().build();
    private final JsonMapper jsonMapper = new JsonMapper();
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    @Value("${TAVILY_API_KEY:}")
    private String apiKey;

    @Value("${CACHE_TTL_MINUTES:20}")
    private int cacheTtlMinutes;

    @Value("${TAVILY_TIMEOUT_MS:6000}")
    private int timeoutMs;

    /** City name for the “events today” Tavily query (aligned with {@link com.citywallet.backend.model.Location} by default). */
    @Value("${citywallet.events.city:München}")
    private String eventsCity;

    /** Region / neighbourhood for the query, e.g. Balanstraße, Obergiesing. */
    @Value("${citywallet.events.region:Balanstraße}")
    private String eventsRegion;

    /** Time zone used for “today” in the search query. */
    @Value("${citywallet.events.timezone:Europe/Berlin}")
    private String eventsTimezone;

    public EventsResult fetchRelevantEvents() {
        String query = buildEventsSearchQuery();
        int ttlMinutes = clampCacheMinutes(cacheTtlMinutes);
        long now = System.currentTimeMillis();
        CacheEntry cached = cache.get(query);
        if (cached != null && cached.expiresAt > now) {
            EventsResult v = cached.value;
            return new EventsResult(v.events(), v.source(), true, v.note(), v.searchQuery());
        }

        if (apiKey == null || apiKey.isBlank()) {
            EventsResult fallback = withFallback("TAVILY_API_KEY fehlt.", false, query);
            putCache(query, now, ttlMinutes, fallback);
            return fallback;
        }

        try {
            Map<String, Object> bodyMap = new LinkedHashMap<>();
            bodyMap.put("api_key", apiKey);
            bodyMap.put("query", query);
            bodyMap.put("search_depth", "basic");
            bodyMap.put("max_results", 8);
            bodyMap.put("include_answer", false);
            bodyMap.put("include_raw_content", false);
            bodyMap.put("include_images", true);

            String body = jsonMapper.writeValueAsString(bodyMap);

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(TAVILY_URL))
                .timeout(Duration.ofMillis(timeoutMs))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                EventsResult fallback = withFallback("Tavily HTTP " + response.statusCode() + ".", false, query);
                putCache(query, now, ttlMinutes, fallback);
                return fallback;
            }

            JsonNode root = jsonMapper.readTree(response.body());
            List<ContextEvent> events = parseEvents(root);
            if (events.size() < 3) {
                EventsResult fallback = withFallback("Zu wenige Tavily-Treffer.", false, query);
                putCache(query, now, ttlMinutes, fallback);
                return fallback;
            }

            List<ContextEvent> top = events.subList(0, Math.min(5, events.size()));
            EventsResult success = new EventsResult(top, "tavily", false, null, query);
            putCache(query, now, ttlMinutes, success);
            return success;
        } catch (Exception ex) {
            EventsResult fallback = withFallback("Tavily Timeout oder Netzfehler.", false, query);
            putCache(query, now, ttlMinutes, fallback);
            return fallback;
        }
    }

    /**
     * Builds a date-stamped query so Tavily returns sources relevant to <strong>today</strong> in {@link #eventsTimezone}.
     */
    public String buildEventsSearchQuery() {
        ZoneId zone = ZoneId.of(eventsTimezone);
        ZonedDateTime today = ZonedDateTime.now(zone);
        String datePart = today.toLocalDate().format(ISO_DATE);
        return eventsCity
            + " "
            + eventsRegion
            + " heute "
            + datePart
            + " Events Veranstaltungen Konzerte Highlights";
    }

    private void putCache(String cacheKey, long now, int ttlMinutes, EventsResult result) {
        cache.put(cacheKey, new CacheEntry(result, now + ttlMinutes * 60_000L));
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
            String imageUrl = firstImageUrl(item);
            events.add(new ContextEvent(title, url, snippet, imageUrl));
        }
        return events;
    }

    private String firstImageUrl(JsonNode item) {
        JsonNode images = item.path("images");
        if (!images.isArray()) {
            return null;
        }
        for (JsonNode img : images) {
            if (img.isTextual()) {
                String u = img.asText("").trim();
                if (u.startsWith("http://") || u.startsWith("https://")) {
                    return u;
                }
            } else if (img.isObject()) {
                String u = img.path("url").asText("").trim();
                if (u.startsWith("http://") || u.startsWith("https://")) {
                    return u;
                }
            }
        }
        return null;
    }

    private EventsResult withFallback(String note, boolean cacheHit, String searchQuery) {
        return new EventsResult(FallbackEvents.EVENTS.subList(0, 5), "fallback", cacheHit, note, searchQuery);
    }

    private record CacheEntry(EventsResult value, long expiresAt) {
    }
}
