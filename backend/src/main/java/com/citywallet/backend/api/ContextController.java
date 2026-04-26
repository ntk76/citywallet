package com.citywallet.backend.api;

import com.citywallet.backend.model.ContextResponse;
import com.citywallet.backend.service.ContextService;
import com.citywallet.backend.service.TavilyService;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ContextController {

    private final ContextService contextService;
    private final TavilyService tavilyService;

    public ContextController(ContextService contextService, TavilyService tavilyService) {
        this.contextService = contextService;
        this.tavilyService = tavilyService;
    }

    /**
     * Liveness plus Tavily-Konfiguration (ohne Key): {@code tavilyApiKeyConfigured}
     * ist nur dann {@code true}, wenn ein nicht-leerer Key aus Umgebung / {@code .env} / System-Property kommt.
     */
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("ok", true);
        body.put("tavilyApiKeyConfigured", tavilyService.isTavilyApiKeyConfigured());
        return body;
    }

    @GetMapping("/context")
    public ContextResponse context(
        @RequestHeader(value = "X-Timeslot", required = false) String timeslotHeader
    ) {
        int timeslot = contextService.parseTimeslot(timeslotHeader);
        return contextService.buildContext(timeslot);
    }
}
