package com.rootdocs.dto;

public record UserResponse(
        Long id,
        String username,
        String role
) {}