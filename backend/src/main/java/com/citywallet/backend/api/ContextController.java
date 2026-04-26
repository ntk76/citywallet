package com.citywallet.backend.api;

import com.citywallet.backend.model.ContextResponse;
import com.citywallet.backend.service.ContextService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ContextController {

    private final ContextService contextService;

    public ContextController(ContextService contextService) {
        this.contextService = contextService;
    }

    @GetMapping("/health")
    public Map<String, Boolean> health() {
        return Map.of("ok", true);
    }

    @GetMapping("/context")
    public ContextResponse context(
        @RequestHeader(value = "X-Timeslot", required = false) String timeslotHeader
    ) {
        int timeslot = contextService.parseTimeslot(timeslotHeader);
        return contextService.buildContext(timeslot);
    }
}
