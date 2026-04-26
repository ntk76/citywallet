package com.citywallet.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.citywallet.backend.model.EventsResult;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class TavilyServiceTest {

    @Test
    void fetchRelevantEvents_usesFallbackAndThenCacheHitWithoutApiKey() {
        TavilyService service = new TavilyService();
        ReflectionTestUtils.setField(service, "apiKey", "");
        ReflectionTestUtils.setField(service, "cacheTtlMinutes", 20);
        ReflectionTestUtils.setField(service, "timeoutMs", 1000);
        ReflectionTestUtils.setField(service, "eventsCity", "München");
        ReflectionTestUtils.setField(service, "eventsRegion", "Balanstraße");
        ReflectionTestUtils.setField(service, "eventsTimezone", "Europe/Berlin");

        EventsResult first = service.fetchRelevantEvents();
        EventsResult second = service.fetchRelevantEvents();

        assertEquals("fallback", first.source());
        assertFalse(first.cacheHit());
        assertTrue(first.note().contains("TAVILY_API_KEY"));
        assertEquals(5, first.events().size());

        assertEquals("fallback", second.source());
        assertTrue(second.cacheHit());
        assertEquals(5, second.events().size());
    }
}
