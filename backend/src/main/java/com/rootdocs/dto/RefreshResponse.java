package com.rootdocs.dto;

public record RefreshResponse(
        String accessToken,
        String refreshToken
) {}