package com.citywallet.backend.model;

import java.util.List;

public record EventsResult(List<ContextEvent> events, String source, boolean cacheHit, String note) {
}
