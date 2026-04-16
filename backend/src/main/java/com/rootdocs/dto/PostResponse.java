package com.rootdocs.dto;

import java.time.Instant;

public record PostResponse(
        Long id,
        String title,
        String category,
        String content,
        String author,
        Instant createdAt
) {}