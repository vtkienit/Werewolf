package com.masoi.room.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public final class InternalRealtimeAuthenticationFilter extends OncePerRequestFilter {
    public static final String HEADER = "X-Internal-Realtime-Token";
    private static final String START = "^/internal/realtime/rooms/[^/]+/players/[^/]+/start-game$", END = "^/internal/realtime/rooms/[^/]+/end-game$", SETUP = "^/internal/realtime/rooms/[^/]+/setup-updated$";
    private final byte[] expected;

    public InternalRealtimeAuthenticationFilter(InternalRealtimeProperties properties) {
        expected = properties.token().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"POST".equals(request.getMethod()) || !(request.getRequestURI().matches(START) || request.getRequestURI().matches(END) || request.getRequestURI().matches(SETUP));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        String supplied = request.getHeader(HEADER);
        if (supplied == null || supplied.isBlank()) {
            deny(response, 401, "INTERNAL_CREDENTIAL_REQUIRED", "Internal credential is required");
            return;
        }
        if (!MessageDigest.isEqual(expected, supplied.getBytes(StandardCharsets.UTF_8))) {
            deny(response, 403, "INTERNAL_CREDENTIAL_INVALID", "Internal credential is invalid");
            return;
        }
        var authentication = UsernamePasswordAuthenticationToken.authenticated("internal-realtime", null, AuthorityUtils.createAuthorityList("INTERNAL_REALTIME"));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        chain.doFilter(request, response);
    }

    private static void deny(HttpServletResponse response, int status, String code, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"code\":\"" + code + "\",\"message\":\"" + message + "\"}");
    }
}
