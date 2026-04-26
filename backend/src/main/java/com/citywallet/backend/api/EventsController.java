package com.citywallet.backend.api;

import com.citywallet.backend.model.EventsApiResponse;
import com.citywallet.backend.model.EventsMeta;
import com.citywallet.backend.model.EventsResult;
import com.citywallet.backend.service.TavilyService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EventsController {

    private final TavilyService tavilyService;

    public EventsController(TavilyService tavilyService) {
        this.tavilyService = tavilyService;
    }

    /**
     * Current events from Tavily (today’s date in {@code citywallet.events.timezone}), with fallback list if Tavily is unavailable.
     */
    @GetMapping("/events")
    public EventsApiResponse events() {
        EventsResult result = tavilyService.fetchRelevantEvents();
        EventsMeta meta = new EventsMeta(
            result.source(),
            result.cacheHit(),
            result.note(),
            result.searchQuery()
        );
        return new EventsApiResponse(result.events(), meta);
    }
}
