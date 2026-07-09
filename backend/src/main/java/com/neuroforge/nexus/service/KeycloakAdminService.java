package com.neuroforge.nexus.service;

import com.neuroforge.nexus.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Talks to the Keycloak Admin REST API (NOT the same as the resource-server
 * config in SecurityConfig — this is a separate, admin-scoped credential).
 *
 * Requires a confidential Keycloak client with "Service accounts enabled"
 * turned on, and that service account granted the realm-management client
 * role "view-users" (Keycloak admin console -> Clients -> your client ->
 * Service account roles). Configure its id/secret via the
 * KEYCLOAK_ADMIN_CLIENT_ID / KEYCLOAK_ADMIN_CLIENT_SECRET env vars — see
 * application.yml. Without that setup, syncing users will fail with a
 * clear error rather than silently doing nothing.
 */
@Service
@Slf4j
public class KeycloakAdminService {

    private final RestTemplate restTemplate;

    @Value("${keycloak.admin.server-url}")
    private String serverUrl;

    @Value("${keycloak.admin.realm}")
    private String realm;

    @Value("${keycloak.admin.client-id}")
    private String clientId;

    @Value("${keycloak.admin.client-secret}")
    private String clientSecret;

    public KeycloakAdminService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<KeycloakUserDto> fetchAllUsers() {
        String token = fetchAdminAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        String url = serverUrl + "/admin/realms/" + realm + "/users?max=1000";

        try {
            KeycloakUserDto[] users = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), KeycloakUserDto[].class
            ).getBody();
            return users == null ? List.of() : List.of(users);
        } catch (HttpClientErrorException ex) {
            log.error("Keycloak admin API rejected the users request: {}", ex.getStatusCode());
            throw new BadRequestException(
                    "Keycloak rejected the request to list users (" + ex.getStatusCode() +
                    "). Check that the service account has the 'view-users' realm-management role."
            );
        }
    }

    private String fetchAdminAccessToken() {
        String tokenUrl = serverUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    tokenUrl, new HttpEntity<>(body, headers), Map.class
            );
            if (response == null || response.get("access_token") == null) {
                throw new BadRequestException("Keycloak did not return an admin access token.");
            }
            return (String) response.get("access_token");
        } catch (HttpClientErrorException ex) {
            log.error("Could not obtain a Keycloak admin token: {}", ex.getStatusCode());
            throw new BadRequestException(
                    "Could not authenticate the admin sync client with Keycloak (" + ex.getStatusCode() +
                    "). Check KEYCLOAK_ADMIN_CLIENT_ID / KEYCLOAK_ADMIN_CLIENT_SECRET."
            );
        }
    }
}
