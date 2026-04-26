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
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TavilyService {

    private static final Logger log = LoggerFactory.getLogger(TavilyService.class);

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
    @Value("${citywallet.events.city:Munich}")
    private String eventsCity;

    /** Region / neighbourhood for the query, e.g. Balanstrasse, Obergiesing. */
    @Value("${citywallet.events.region:Balanstrasse}")
    private String eventsRegion;

    /** Time zone used for “today” in the search query. */
    @Value("${citywallet.events.timezone:Europe/Berlin}")
    private String eventsTimezone;

    /** Exposed for {@code GET /health} — never log or return the raw key. */
    public boolean isTavilyApiKeyConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    @PostConstruct
    void logTavilyConfiguration() {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn(
                "TAVILY_API_KEY is not set — events and dining use static fallback. "
                    + "Add a real key to backend/.env (see .env.example) or export TAVILY_API_KEY before bootRun."
            );
        } else {
            log.info("Tavily enabled (API key length {}).", apiKey.length());
        }
    }

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
            bodyMap.put("search_depth", "advanced");
            bodyMap.put("max_results", 15);
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
            List<ContextEvent> events = widenTavilyListIfSparse(parseAndFilterEvents(root), parseEvents(root), 3);

            if (events.isEmpty()) {
                EventsResult fallback = withFallback("Tavily lieferte keine nutzbaren Treffer.", false, query);
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
     * Restaurants, cafés and bars near the configured area (second Tavily query, own cache key).
     */
    public EventsResult fetchRelevantDining() {
        String query = buildDiningSearchQuery();
        int ttlMinutes = clampCacheMinutes(cacheTtlMinutes);
        long now = System.currentTimeMillis();
        CacheEntry cached = cache.get(query);
        if (cached != null && cached.expiresAt > now) {
            EventsResult v = cached.value;
            return new EventsResult(v.events(), v.source(), true, v.note(), v.searchQuery());
        }

        if (apiKey == null || apiKey.isBlank()) {
            EventsResult fallback = withDiningFallback("TAVILY_API_KEY fehlt.", false, query);
            putCache(query, now, ttlMinutes, fallback);
            return fallback;
        }

        try {
            Map<String, Object> bodyMap = new LinkedHashMap<>();
            bodyMap.put("api_key", apiKey);
            bodyMap.put("query", query);
            bodyMap.put("search_depth", "advanced");
            bodyMap.put("max_results", 15);
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
                EventsResult fallback = withDiningFallback("Tavily HTTP " + response.statusCode() + ".", false, query);
                putCache(query, now, ttlMinutes, fallback);
                return fallback;
            }

            JsonNode root = jsonMapper.readTree(response.body());
            List<ContextEvent> places = widenTavilyListIfSparse(parseAndFilterDining(root), parseEvents(root), 2);

            if (places.isEmpty()) {
                EventsResult fallback = withDiningFallback("Tavily lieferte keine nutzbaren Restaurant-Treffer.", false, query);
                putCache(query, now, ttlMinutes, fallback);
                return fallback;
            }

            List<ContextEvent> top = places.subList(0, Math.min(5, places.size()));
            EventsResult success = new EventsResult(top, "tavily", false, null, query);
            putCache(query, now, ttlMinutes, success);
            return success;
        } catch (Exception ex) {
            EventsResult fallback = withDiningFallback("Tavily Timeout oder Netzfehler.", false, query);
            putCache(query, now, ttlMinutes, fallback);
            return fallback;
        }
    }

    public String buildDiningSearchQuery() {
        ZoneId zone = ZoneId.of(eventsTimezone);
        ZonedDateTime today = ZonedDateTime.now(zone);
        String datePart = today.toLocalDate().format(ISO_DATE);
        return eventsCity
            + " near "
            + eventsRegion
            + " Obergiesing "
            + datePart
            + " restaurant cafe bar bistro open today dinner lunch reservations menu walk-in";
    }

    /**
     * Builds a date-stamped query aimed at <strong>single happenings</strong> (shows, gigs, club nights),
     * not generic city event calendars, for {@link #eventsTimezone} “today”.
     */
    public String buildEventsSearchQuery() {
        ZoneId zone = ZoneId.of(eventsTimezone);
        ZonedDateTime today = ZonedDateTime.now(zone);
        String datePart = today.toLocalDate().format(ISO_DATE);
        return eventsCity
            + " near "
            + eventsRegion
            + " Obergiesing on "
            + datePart
            + " tonight live concert theatre comedy DJ club doors open start time tickets one show";
    }

    private void putCache(String cacheKey, long now, int ttlMinutes, EventsResult result) {
        cache.put(cacheKey, new CacheEntry(result, now + ttlMinutes * 60_000L));
    }

    private int clampCacheMinutes(int value) {
        return Math.max(MIN_CACHE_MINUTES, Math.min(MAX_CACHE_MINUTES, value));
    }

    /**
     * If strict filters remove too much, fall back to Tavily hits that only drop obvious calendar URLs,
     * so a valid API key still returns {@code source=tavily} whenever the API returned rows.
     */
    private static List<ContextEvent> widenTavilyListIfSparse(
        List<ContextEvent> filtered,
        List<ContextEvent> rawParsed,
        int preferAtLeast
    ) {
        if (filtered.size() >= preferAtLeast) {
            return filtered;
        }
        List<ContextEvent> soft = new ArrayList<>();
        for (ContextEvent e : rawParsed) {
            if (!isHardCalendarUrl(e.url())) {
                soft.add(e);
            }
        }
        if (soft.size() >= preferAtLeast) {
            return soft;
        }
        if (!soft.isEmpty()) {
            return soft;
        }
        return filtered;
    }

    private List<ContextEvent> parseAndFilterEvents(JsonNode root) {
        List<ContextEvent> raw = parseEvents(root);
        List<ContextEvent> strict = new ArrayList<>();
        for (ContextEvent e : raw) {
            if (!isCalendarOrDirectoryPage(e.title(), e.url())) {
                strict.add(e);
            }
        }
        if (strict.size() >= 3) {
            return strict;
        }
        List<ContextEvent> loose = new ArrayList<>();
        for (ContextEvent e : raw) {
            if (!isHardCalendarUrl(e.url())) {
                loose.add(e);
            }
        }
        return loose.size() > strict.size() ? loose : strict;
    }

    private List<ContextEvent> parseAndFilterDining(JsonNode root) {
        List<ContextEvent> raw = parseEvents(root);
        List<ContextEvent> strict = new ArrayList<>();
        for (ContextEvent e : raw) {
            if (!isCalendarOrDirectoryPage(e.title(), e.url()) && !isRestaurantRankingListicle(e.title(), e.url())) {
                strict.add(e);
            }
        }
        if (strict.size() >= 2) {
            return strict;
        }
        List<ContextEvent> loose = new ArrayList<>();
        for (ContextEvent e : raw) {
            if (!isHardCalendarUrl(e.url()) && !isRestaurantRankingListicle(e.title(), e.url())) {
                loose.add(e);
            }
        }
        return loose.size() > strict.size() ? loose : strict;
    }

    private static boolean isRestaurantRankingListicle(String title, String url) {
        String t = title.toLowerCase(Locale.ROOT);
        String u = url.toLowerCase(Locale.ROOT);
        if (t.contains("top 10") || t.contains("top 15") || t.contains("top 20") || t.contains("top 25")) {
            return true;
        }
        if (t.contains("die besten restaurants") || t.contains("best restaurants in")) {
            return true;
        }
        if (t.contains("10 best") && (t.contains("restaurant") || t.contains("dinner") || t.contains("brunch"))) {
            return true;
        }
        if (u.contains("tripadvisor") && (t.contains("best") || t.contains("top "))) {
            return true;
        }
        return false;
    }

    /** Drop obvious calendar URLs only (fallback if strict title+URL filter removes too much). */
    private static boolean isHardCalendarUrl(String url) {
        String u = url.toLowerCase(Locale.ROOT);
        return u.contains("/kalender")
            || u.contains("kalender.html")
            || u.contains("/calendar")
            || u.contains("veranstaltungskalender")
            || u.contains("eventkalender");
    }

    private static boolean isCalendarOrDirectoryPage(String title, String url) {
        if (isHardCalendarUrl(url)) {
            return true;
        }
        String u = url.toLowerCase(Locale.ROOT);
        String t = title.toLowerCase(Locale.ROOT);
        if (t.contains("veranstaltungskalender") || t.contains("eventkalender")) {
            return true;
        }
        if ((t.contains("kalender") || t.contains("calendar"))
            && (t.contains("\u00fcbersicht") || t.contains("alle events"))) {
            return true;
        }
        if (u.contains("muenchen.de") && u.contains("kalender")) {
            return true;
        }
        if (t.contains("veranstaltungen heute") && (t.contains("marketing") || t.contains("tourist"))) {
            return true;
        }
        return false;
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

    private EventsResult withDiningFallback(String note, boolean cacheHit, String searchQuery) {
        return new EventsResult(FallbackDining.PLACES, "fallback", cacheHit, note, searchQuery);
    }

    private record CacheEntry(EventsResult value, long expiresAt) {
    }
}
