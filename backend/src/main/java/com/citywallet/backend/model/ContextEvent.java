package com.citywallet.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ContextEvent(
    String title,
    String url,
    String snippet,
    String imageUrl
) {
    public ContextEvent(String title, String url, String snippet) {
        this(title, url, snippet, null);
    }
}
