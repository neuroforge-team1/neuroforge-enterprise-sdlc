package com.neuroforge.nexus.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Keycloak puts realm roles under the "realm_access.roles" claim, which
 * Spring's default JwtAuthenticationConverter doesn't understand out of the
 * box (it looks for "scope"/"scp" by default). This converter extracts those
 * roles and prefixes them with "ROLE_" so @PreAuthorize("hasRole('ADMIN')")
 * works the same way it would with any other Spring Security setup.
 */
@Component
public class KeycloakRoleConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private static final String REALM_ACCESS_CLAIM = "realm_access";
    private static final String ROLES_CLAIM = "roles";
    private static final String ROLE_PREFIX = "ROLE_";

    @Override
    @SuppressWarnings("unchecked")
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim(REALM_ACCESS_CLAIM);
        Set<String> roles = Set.of();

        if (realmAccess != null && realmAccess.get(ROLES_CLAIM) != null) {
            roles = ((List<String>) realmAccess.get(ROLES_CLAIM)).stream().collect(Collectors.toSet());
        }

        Collection<GrantedAuthority> authorities = roles.stream()
                .map(role -> new SimpleGrantedAuthority(ROLE_PREFIX + role))
                .collect(Collectors.toList());

        return new JwtAuthenticationToken(jwt, authorities, jwt.getClaimAsString("preferred_username"));
    }
}
