package com.citywallet.backend.api;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.citywallet.backend.model.ContextEvent;
import com.citywallet.backend.model.EventsResult;
import com.citywallet.backend.service.TavilyService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureMockMvc
class ContextControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TavilyService tavilyService;

    @Test
    void health_returnsOkTrue() throws Exception {
        mockMvc.perform(get("/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok", is(true)));
    }

    @Test
    void events_returnsEventsPayload() throws Exception {
        when(tavilyService.fetchRelevantEvents()).thenReturn(
            new EventsResult(
                List.of(new ContextEvent("E1", "https://example.com/e1", "S1", null)),
                "tavily",
                false,
                null,
                "Munich Balanstrasse heute 2026-01-01 Events Veranstaltungen Konzerte Highlights"
            )
        );

        mockMvc.perform(get("/events"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.eventsMeta.source", is("tavily")))
            .andExpect(jsonPath("$.eventsMeta.searchQuery", is("Munich Balanstrasse heute 2026-01-01 Events Veranstaltungen Konzerte Highlights")))
            .andExpect(jsonPath("$.events.length()", is(1)));
    }

    @Test
    void context_returnsPayloadWithProvidedTimeslotHeader() throws Exception {
        when(tavilyService.fetchRelevantEvents()).thenReturn(
            new EventsResult(
                List.of(
                    new ContextEvent("Event 1", "https://example.com/1", "Snippet 1", null),
                    new ContextEvent("Event 2", "https://example.com/2", "Snippet 2", null),
                    new ContextEvent("Event 3", "https://example.com/3", "Snippet 3", null)
                ),
                "tavily",
                false,
                null,
                null
            )
        );

        mockMvc.perform(get("/context").header("X-Timeslot", "60"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.timeslot", is(60)))
            .andExpect(jsonPath("$.location.city", is("Munich")))
            .andExpect(jsonPath("$.location.region", is("Balanstrasse")))
            .andExpect(jsonPath("$.eventsMeta.source", is("tavily")))
            .andExpect(jsonPath("$.events.length()", is(3)));
    }
}
