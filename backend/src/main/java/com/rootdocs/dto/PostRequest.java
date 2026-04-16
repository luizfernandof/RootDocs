package com.rootdocs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostRequest(
        @NotBlank @Size(min = 3, max = 200) String title,
        @NotBlank String category,
        @NotBlank String content
) {}