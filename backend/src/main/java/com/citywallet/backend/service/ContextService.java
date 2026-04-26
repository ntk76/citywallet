package com.citywallet.backend.service;

import com.citywallet.backend.model.ContextResponse;
import com.citywallet.backend.model.DemandProxy;
import com.citywallet.backend.model.EventsMeta;
import com.citywallet.backend.model.EventsResult;
import com.citywallet.backend.model.Location;
import com.citywallet.backend.model.WeatherMock;
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
            mockWeather(now.getHour()),
            timeslot,
            mockDemand(now.getHour(), timeslot),
            eventsResult.events().stream().limit(5).toList(),
            new EventsMeta(eventsResult.source(), eventsResult.cacheHit(), eventsResult.note())
        );
    }

    private WeatherMock mockWeather(int hour) {
        if (hour >= 6 && hour < 11) {
            return new WeatherMock("cloudy", 14, "Bedeckt und mild");
        }
        if (hour >= 11 && hour < 17) {
            return new WeatherMock("sunny", 21, "Sonnig");
        }
        if (hour >= 17 && hour < 21) {
            return new WeatherMock("rain", 13, "Leichter Regen");
        }
        return new WeatherMock("cold", 8, "Kuehl am Abend");
    }

    private DemandProxy mockDemand(int hour, int timeslot) {
        double base = (hour >= 17 && hour <= 20) ? 0.78 : ((hour >= 11 && hour <= 13) ? 0.67 : 0.42);
        double slotBoost = timeslot == 15 ? 0.07 : (timeslot == 60 ? -0.05 : 0);
        double score = Math.max(0, Math.min(1, roundTo2Decimals(base + slotBoost)));
        String level = score >= 0.7 ? "high" : (score >= 0.45 ? "medium" : "low");
        String reason = "high".equals(level) ? "Feierabend und hohe Innenstadt-Frequenz" : "Normale Auslastung";
        return new DemandProxy(level, score, reason);
    }

    private double roundTo2Decimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
