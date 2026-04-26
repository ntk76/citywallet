package com.citywallet.backend.service;

import com.citywallet.backend.model.ContextResponse;
import com.citywallet.backend.model.EventsMeta;
import com.citywallet.backend.model.EventsResult;
import com.citywallet.backend.model.Location;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ContextService {

    private final TavilyService tavilyService;
    private final String eventsCity;
    private final String eventsRegion;

    @Autowired
    public ContextService(
        TavilyService tavilyService,
        @Value("${citywallet.events.city:Munich}") String eventsCity,
        @Value("${citywallet.events.region:Balanstrasse}") String eventsRegion
    ) {
        this.tavilyService = tavilyService;
        this.eventsCity = eventsCity;
        this.eventsRegion = eventsRegion;
    }

    public ContextService(TavilyService tavilyService) {
        this(tavilyService, "Munich", "Balanstrasse");
    }

    public int parseTimeslot(String value) {
        if ("15".equals(value) || "30".equals(value) || "60".equals(value)) {
            return Integer.parseInt(value);
        }
        return 30;
    }

    public ContextResponse buildContext(int timeslot) {
        ZonedDateTime now = ZonedDateTime.now();
        EventsResult eventsResult = tavilyService.fetchRelevantEvents();
        EventsResult diningResult = tavilyService.fetchRelevantDining();

        return new ContextResponse(
            now.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
            new Location(eventsCity, eventsRegion),
            timeslot,
            eventsResult.events().stream().limit(5).toList(),
            new EventsMeta(eventsResult.source(), eventsResult.cacheHit(), eventsResult.note(), eventsResult.searchQuery()),
            diningResult.events().stream().limit(5).toList(),
            new EventsMeta(diningResult.source(), diningResult.cacheHit(), diningResult.note(), diningResult.searchQuery())
        );
    }
}
