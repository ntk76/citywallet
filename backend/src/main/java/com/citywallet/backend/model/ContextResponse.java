package com.citywallet.backend.model;

import java.util.List;

public record ContextResponse(
    String time,
    Location location,
    WeatherMock weather,
    int timeslot,
    DemandProxy demandProxy,
    List<ContextEvent> events,
    EventsMeta eventsMeta,
    List<ContextEvent> dining,
    EventsMeta diningMeta
) {
}
