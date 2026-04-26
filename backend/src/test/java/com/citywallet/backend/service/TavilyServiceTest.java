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
        ReflectionTestUtils.setField(service, "eventsCity", "Munich");
        ReflectionTestUtils.setField(service, "eventsRegion", "Balanstrasse");
        ReflectionTestUtils.setField(service, "eventsTimezone", "Europe/Berlin");

        EventsResult first = service.fetchRelevantEvents();
        EventsResult second = service.fetchRelevantEvents();

        assertEquals("tavily", first.source());
        assertFalse(first.cacheHit());
        assertTrue(first.note().contains("TAVILY_API_KEY"));
        assertEquals(0, first.events().size());

        assertEquals("tavily", second.source());
        assertFalse(second.cacheHit());
        assertEquals(0, second.events().size());
    }
}
