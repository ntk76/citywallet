package com.citywallet.backend.model;

import java.util.List;

public record ContextResponse(
    String time,
    Location location,
    int timeslot,
    List<ContextEvent> events,
    EventsMeta eventsMeta
) {
}
