package com.citywallet.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

import com.citywallet.backend.model.ContextEvent;
import com.citywallet.backend.model.ContextResponse;
import com.citywallet.backend.model.EventsResult;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ContextServiceTest {

    @Mock
    private TavilyService tavilyService;

    @Test
    void parseTimeslot_defaultsTo30ForInvalidValues() {
        ContextService service = new ContextService(tavilyService);

        assertEquals(30, service.parseTimeslot(null));
        assertEquals(30, service.parseTimeslot("5"));
        assertEquals(30, service.parseTimeslot("abc"));
    }

    @Test
    void parseTimeslot_acceptsSupportedValues() {
        ContextService service = new ContextService(tavilyService);

        assertEquals(15, service.parseTimeslot("15"));
        assertEquals(30, service.parseTimeslot("30"));
        assertEquals(60, service.parseTimeslot("60"));
    }

    @Test
    void buildContext_returnsExpectedStructure() {
        EventsResult result = new EventsResult(
            List.of(
                new ContextEvent("e1", "https://example.com/1", "s1"),
                new ContextEvent("e2", "https://example.com/2", "s2"),
                new ContextEvent("e3", "https://example.com/3", "s3")
            ),
            "tavily",
            false,
            "note"
        );
        when(tavilyService.fetchRelevantEvents()).thenReturn(result);
        when(tavilyService.fetchRelevantDining()).thenReturn(result);

        ContextService service = new ContextService(tavilyService);
        ContextResponse response = service.buildContext(30);

        assertNotNull(response.time());
        assertEquals("Munich", response.location().city());
        assertEquals("Balanstrasse", response.location().region());
        assertEquals(30, response.timeslot());
        assertEquals("tavily", response.eventsMeta().source());
        assertFalse(response.eventsMeta().cacheHit());
        assertEquals(3, response.events().size());
        assertEquals(3, response.dining().size());
    }
}
