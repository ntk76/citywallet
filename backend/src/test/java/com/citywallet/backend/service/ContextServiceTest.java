package com.citywallet.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
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
        when(tavilyService.fetchRelevantEvents()).thenReturn(
            new EventsResult(
                List.of(
                    new ContextEvent("e1", "https://example.com/1", "s1"),
                    new ContextEvent("e2", "https://example.com/2", "s2"),
                    new ContextEvent("e3", "https://example.com/3", "s3")
                ),
                "fallback",
                false,
                "note"
            )
        );

        ContextService service = new ContextService(tavilyService);
        ContextResponse response = service.buildContext(30);

        assertNotNull(response.time());
        assertEquals("Stuttgart", response.location().city());
        assertEquals("Mitte", response.location().region());
        assertEquals(30, response.timeslot());
        assertEquals("fallback", response.eventsMeta().source());
        assertFalse(response.eventsMeta().cacheHit());
        assertEquals(3, response.events().size());
        assertTrue(
            List.of("low", "medium", "high").contains(response.demandProxy().level()),
            "Demand level should be one of expected values"
        );
    }
}
