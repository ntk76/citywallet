package com.citywallet.backend.service;

import com.citywallet.backend.model.ContextResponse;
import com.citywallet.backend.model.EventsMeta;
import com.citywallet.backend.model.EventsResult;
import com.citywallet.backend.model.Location;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Service;

@Service
public class ContextService {

    private final TavilyService tavilyService;

    public ContextService(TavilyService tavilyService) {
        this.tavilyService = tavilyService;
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

        return new ContextResponse(
            now.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
            new Location("Stuttgart", "Mitte"),
            timeslot,
            eventsResult.events().stream().limit(5).toList(),
            new EventsMeta(eventsResult.source(), eventsResult.cacheHit(), eventsResult.note())
        );
    }
}
