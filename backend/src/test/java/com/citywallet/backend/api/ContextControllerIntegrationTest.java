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
    void context_returnsPayloadWithProvidedTimeslotHeader() throws Exception {
        when(tavilyService.fetchRelevantEvents()).thenReturn(
            new EventsResult(
                List.of(
                    new ContextEvent("Event 1", "https://example.com/1", "Snippet 1"),
                    new ContextEvent("Event 2", "https://example.com/2", "Snippet 2"),
                    new ContextEvent("Event 3", "https://example.com/3", "Snippet 3")
                ),
                "tavily",
                false,
                null
            )
        );

        mockMvc.perform(get("/context").header("X-Timeslot", "60"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.timeslot", is(60)))
            .andExpect(jsonPath("$.location.city", is("Stuttgart")))
            .andExpect(jsonPath("$.eventsMeta.source", is("tavily")))
            .andExpect(jsonPath("$.events.length()", is(3)));
    }
}
