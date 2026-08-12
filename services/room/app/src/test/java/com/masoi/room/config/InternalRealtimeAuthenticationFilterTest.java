package com.masoi.room.config;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.*;
import org.springframework.security.core.context.SecurityContextHolder;

class InternalRealtimeAuthenticationFilterTest {
    private final InternalRealtimeAuthenticationFilter filter = new InternalRealtimeAuthenticationFilter(new InternalRealtimeProperties("secret"));

    @Test
    void missingIs401() throws Exception {
        var r = req("POST", "/internal/realtime/rooms/A7K9Q2/end-game", null);
        var s = new MockHttpServletResponse();
        filter.doFilter(r, s, mock(FilterChain.class));
        assertThat(s.getStatus()).isEqualTo(401);
        assertThat(s.getContentAsString()).isEqualTo("{\"code\":\"INTERNAL_CREDENTIAL_REQUIRED\",\"message\":\"Internal credential is required\"}");
    }

    @Test
    void wrongIs403() throws Exception {
        var r = req("POST", "/internal/realtime/rooms/A7K9Q2/end-game", "wrong");
        var s = new MockHttpServletResponse();
        filter.doFilter(r, s, mock(FilterChain.class));
        assertThat(s.getStatus()).isEqualTo(403);
        assertThat(s.getContentAsString()).doesNotContain("wrong", "secret");
    }

    @Test
    void validAuthenticatesWithoutSecret() throws Exception {
        for (String path : new String[]{"/internal/realtime/rooms/A7K9Q2/players/p1/start-game", "/internal/realtime/rooms/A7K9Q2/setup-updated"}) {
            var chain = mock(FilterChain.class);
            var r = req("POST", path, "secret");
            var s = new MockHttpServletResponse();
            filter.doFilter(r, s, chain);
            verify(chain).doFilter(r, s);
            var a = SecurityContextHolder.getContext().getAuthentication();
            assertThat(a.getAuthorities()).extracting(Object::toString).containsExactly("INTERNAL_REALTIME");
            assertThat(String.valueOf(a.getCredentials()) + a.getPrincipal() + a.getDetails()).doesNotContain("secret");
            SecurityContextHolder.clearContext();
        }
    }

    @Test
    void bypassesUnrelatedWrongMethodAndSimilarPaths() throws Exception {
        for (String[] x : new String[][]{{"GET", "/internal/realtime/rooms/A7K9Q2/end-game"}, {"POST", "/api/rooms"}, {"POST", "/internal/realtime/rooms/A7K9Q2/end-game/extra"}}) {
            var c = mock(FilterChain.class);
            var r = req(x[0], x[1], null);
            var s = new MockHttpServletResponse();
            filter.doFilter(r, s, c);
            verify(c).doFilter(r, s);
        }
    }

    private MockHttpServletRequest req(String method, String path, String token) {
        var r = new MockHttpServletRequest(method, path);
        if (token != null) r.addHeader("X-Internal-Realtime-Token", token);
        return r;
    }
}
