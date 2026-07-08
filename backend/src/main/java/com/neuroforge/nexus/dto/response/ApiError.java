package com.neuroforge.nexus.dto.response;

import java.time.Instant;
import java.util.Map;

public record ApiError(
        int status,
        String message,
        Instant timestamp,
        Map<String, String> fieldErrors
) {
    public ApiError(int status, String message) {
        this(status, message, Instant.now(), null);
    }

    public ApiError(int status, String message, Map<String, String> fieldErrors) {
        this(status, message, Instant.now(), fieldErrors);
    }
}
