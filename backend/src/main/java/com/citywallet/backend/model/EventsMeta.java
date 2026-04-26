package com.citywallet.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record EventsMeta(String source, boolean cacheHit, String note) {
}
