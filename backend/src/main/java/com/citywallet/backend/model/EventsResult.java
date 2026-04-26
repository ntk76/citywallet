package com.citywallet.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record EventsResult(
    List<ContextEvent> events,
    String source,
    boolean cacheHit,
    String note,
    String searchQuery
) {
    public EventsResult(List<ContextEvent> events, String source, boolean cacheHit, String note) {
        this(events, source, cacheHit, note, null);
    }
}
