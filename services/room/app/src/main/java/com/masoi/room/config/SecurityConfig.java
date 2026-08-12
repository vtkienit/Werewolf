package com.masoi.room.config;

import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.*;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.util.matcher.RequestMatcher;

@Configuration
public class SecurityConfig {
    private static final RequestMatcher CREATE = request -> HttpMethod.POST.matches(request.getMethod()) && "/api/rooms".equals(request.getRequestURI());
    private static final RequestMatcher UPDATE = request -> HttpMethod.PATCH.matches(request.getMethod()) && request.getRequestURI().matches("/api/rooms/[^/]+/max-players");
    private static final RequestMatcher JOIN = request -> HttpMethod.POST.matches(request.getMethod()) && request.getRequestURI().matches("/api/rooms/[^/]+/players");
    private static final RequestMatcher READY = request -> HttpMethod.PATCH.matches(request.getMethod()) && request.getRequestURI().matches("/api/rooms/[^/]+/players/[^/]+/ready");
    private static final RequestMatcher WS = request -> request.getRequestURI().startsWith("/ws/") || "/ws".equals(request.getRequestURI());
    private static final RequestMatcher INTERNAL_START = request -> HttpMethod.POST.matches(request.getMethod()) && request.getRequestURI().matches("/internal/realtime/rooms/[^/]+/players/[^/]+/start-game");
    private static final RequestMatcher INTERNAL_END = request -> HttpMethod.POST.matches(request.getMethod()) && request.getRequestURI().matches("/internal/realtime/rooms/[^/]+/end-game");
    private static final RequestMatcher INTERNAL_SETUP = request -> HttpMethod.POST.matches(request.getMethod()) && request.getRequestURI().matches("/internal/realtime/rooms/[^/]+/setup-updated");

    @Bean
    InternalRealtimeAuthenticationFilter internalRealtimeAuthenticationFilter(InternalRealtimeProperties properties) {
        return new InternalRealtimeAuthenticationFilter(properties);
    }

    @Bean
    SecurityFilterChain createRoomSecurityFilterChain(HttpSecurity http, InternalRealtimeAuthenticationFilter internalFilter) throws Exception {
        return http.csrf(csrf -> csrf.ignoringRequestMatchers(CREATE, UPDATE, JOIN, READY, WS, INTERNAL_START, INTERNAL_END, INTERNAL_SETUP)).authorizeHttpRequests(auth -> auth.requestMatchers(INTERNAL_START, INTERNAL_END, INTERNAL_SETUP).hasAuthority("INTERNAL_REALTIME").requestMatchers(UPDATE, JOIN, READY).permitAll().requestMatchers(HttpMethod.POST, "/api/rooms").permitAll().requestMatchers("/ws/**", "/actuator/health", "/actuator/health/**").permitAll().anyRequest().authenticated()).addFilterBefore(internalFilter, AnonymousAuthenticationFilter.class).build();
    }
}
