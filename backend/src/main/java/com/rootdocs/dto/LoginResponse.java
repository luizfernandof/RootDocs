package com.rootdocs.dto;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        String username,
        String role
) {}