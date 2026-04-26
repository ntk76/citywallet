package com.citywallet.backend.api;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception exception, HttpServletRequest request) {
        if (!acceptsJson(request)) {
            return ResponseEntity.internalServerError().build();
        }

        return ResponseEntity.internalServerError().contentType(MediaType.APPLICATION_JSON).body(Map.of(
            "error", "internal_error",
            "message", "Unerwarteter Fehler."
        ));
    }

    private boolean acceptsJson(HttpServletRequest request) {
        String accept = request.getHeader("Accept");
        if (accept == null || accept.isBlank()) {
            return true;
        }
        String normalized = accept.toLowerCase();
        return normalized.contains("*/*") || normalized.contains(MediaType.APPLICATION_JSON_VALUE);
    }
}
