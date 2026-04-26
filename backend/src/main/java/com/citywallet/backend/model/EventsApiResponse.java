package com.citywallet.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record EventsApiResponse(
    List<ContextEvent> events,
    EventsMeta eventsMeta,
    List<ContextEvent> dining,
    EventsMeta diningMeta
) {
}
