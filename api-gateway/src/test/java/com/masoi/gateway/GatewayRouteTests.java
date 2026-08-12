package com.masoi.gateway;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import reactor.core.publisher.Mono;
import reactor.netty.DisposableServer;
import reactor.netty.http.server.HttpServer;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GatewayRouteTests {

    private static final AtomicReference<String> ROOM_POST_BODY = new AtomicReference<>();
    private static final AtomicReference<String> PATCH_METHOD_URI = new AtomicReference<>();
    private static final AtomicReference<String> PATCH_BODY = new AtomicReference<>();
    private static final AtomicReference<String> PATCH_HOST_ID = new AtomicReference<>();
    private static final AtomicReference<String> PATCH_CONTENT_TYPE = new AtomicReference<>();

    private static final DisposableServer ROOM_UPSTREAM = startUpstream();
    private static final DisposableServer DISTRIBUTION_UPSTREAM = startUpstream();
    private static final DisposableServer WEBSOCKET_UPSTREAM = startUpstream();

    @LocalServerPort
    private int gatewayPort;

    @DynamicPropertySource
    static void upstreamProperties(DynamicPropertyRegistry registry) {
        registry.add("ROOM_SERVICE_URL", () -> upstreamUrl(ROOM_UPSTREAM));
        registry.add("DISTRIBUTION_SERVICE_URL", () -> upstreamUrl(DISTRIBUTION_UPSTREAM));
        registry.add("WEBSOCKET_SERVICE_URL", () -> upstreamUrl(WEBSOCKET_UPSTREAM));
    }

    @AfterAll
    static void stopUpstreams() {
        ROOM_UPSTREAM.disposeNow();
        DISTRIBUTION_UPSTREAM.disposeNow();
        WEBSOCKET_UPSTREAM.disposeNow();
    }

    @Test
    void forwardsRoomPathAndQueryWithoutRewriting() throws Exception {
        assertThat(get("/api/rooms/test?source=gateway"))
                .isEqualTo("GET /api/rooms/test?source=gateway");
    }

    @Test
    void forwardsDistributionPathWithoutRewriting() throws Exception {
        assertThat(get("/api/distribution/test"))
                .isEqualTo("GET /api/distribution/test");
    }

    @Test
    void forwardsSockJsHttpPathWithoutClaimingWebSocketUpgrade() throws Exception {
        assertThat(get("/ws/info"))
                .isEqualTo("GET /ws/info");
    }

    @Test
    void preservesExactlyOneSockJsCorsOriginHeaderFromRoomService() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + gatewayPort + "/ws/info"))
                .header("Origin", "http://localhost")
                .GET()
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.headers().allValues("access-control-allow-origin"))
                .containsExactly("http://localhost");
    }

    @Test
    void proxiesBodylessCreateRoomPostWithoutChangingTheCreatedResponse() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + gatewayPort + "/api/rooms"))
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.noBody())
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(ROOM_POST_BODY).hasValue("");
        assertThat(response.statusCode()).isEqualTo(201);
        assertThat(response.headers().firstValue("content-type")).hasValue("application/json");
        assertThat(response.body()).isEqualTo("{\"roomCode\":\"A7K9Q2\",\"hostId\":\"host\",\"qrUrl\":\"http://localhost/join/A7K9Q2\"}");
    }

    @Test
    void proxiesPatchMaxPlayersWithoutChangingMethodPathHeadersOrBody() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + gatewayPort + "/api/rooms/A7K9Q2/max-players"))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("X-Host-Id", "mP5cYgYNGxa2-WPNnTMR1Q")
                .method("PATCH", HttpRequest.BodyPublishers.ofString("{\"maxPlayers\":9}"))
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(PATCH_METHOD_URI).hasValue("PATCH /api/rooms/A7K9Q2/max-players");
        assertThat(PATCH_BODY).hasValue("{\"maxPlayers\":9}");
        assertThat(PATCH_HOST_ID).hasValue("mP5cYgYNGxa2-WPNnTMR1Q");
        assertThat(PATCH_CONTENT_TYPE).hasValue("application/json");
        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.headers().firstValue("content-type")).hasValue("application/json");
        assertThat(response.body()).isEqualTo("{\"maxPlayers\":9}");
    }

    @Test
    void preservesPatchErrorStatusAndExactErrorJson() throws Exception {
        // The room upstream stub answers 409 for this room code to exercise error passthrough.
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + gatewayPort + "/api/rooms/B8M2P4/max-players"))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("X-Host-Id", "mP5cYgYNGxa2-WPNnTMR1Q")
                .method("PATCH", HttpRequest.BodyPublishers.ofString("{\"maxPlayers\":9}"))
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(409);
        assertThat(response.headers().firstValue("content-type")).hasValue("application/json");
        assertThat(response.body()).isEqualTo("{\"code\":\"ROOM_UPDATE_BUSY\",\"message\":\"Room is currently being updated\"}");
    }

    @Test
    void allowsApprovedCorsPreflightForPatch() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + gatewayPort + "/api/rooms/A7K9Q2/max-players"))
                .header("Origin", "http://localhost")
                .header("Access-Control-Request-Method", "PATCH")
                .header("Access-Control-Request-Headers", "Content-Type,X-Host-Id")
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody())
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.headers().firstValue("access-control-allow-origin")).hasValue("http://localhost");
        assertThat(response.headers().firstValue("access-control-allow-methods")).hasValueSatisfying(value -> assertThat(value).contains("PATCH"));
        assertThat(response.headers().firstValue("access-control-allow-headers")).hasValueSatisfying(value -> assertThat(value).doesNotContainIgnoringCase("Internal-Realtime"));
    }

    @Test
    void rejectsUnapprovedCorsOrigin() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + gatewayPort + "/api/rooms"))
                .header("Origin", "https://evil.example")
                .header("Access-Control-Request-Method", "POST")
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody())
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(403);
        assertThat(response.headers().firstValue("access-control-allow-origin")).isEmpty();
    }

    @Test
    void doesNotRouteInternalRoomEndpoints() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + gatewayPort + "/internal/realtime/rooms/A7K9Q2/end-game"))
                .POST(HttpRequest.BodyPublishers.noBody())
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(404);
    }

    private String get(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + gatewayPort + path))
                .GET()
                .build();

        return HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString())
                .body();
    }

    private static DisposableServer startUpstream() {
        return HttpServer.create()
                .port(0)
                .handle((request, response) -> request.receive().aggregate().asString().defaultIfEmpty("")
                        .flatMap(body -> {
                            String method = request.method().name();
                            String uri = request.uri();
                            if (method.equals("POST") && uri.equals("/api/rooms")) {
                                ROOM_POST_BODY.set(body);
                                response.status(201);
                                response.header("Content-Type", "application/json");
                                return response.sendString(Mono.just("{\"roomCode\":\"A7K9Q2\",\"hostId\":\"host\",\"qrUrl\":\"http://localhost/join/A7K9Q2\"}")).then();
                            }
                            if (method.equals("PATCH") && uri.startsWith("/api/rooms/") && uri.endsWith("/max-players")) {
                                PATCH_METHOD_URI.set(method + " " + uri);
                                PATCH_BODY.set(body);
                                PATCH_HOST_ID.set(request.requestHeaders().get("X-Host-Id"));
                                PATCH_CONTENT_TYPE.set(request.requestHeaders().get("Content-Type"));
                                if (uri.equals("/api/rooms/B8M2P4/max-players")) {
                                    response.status(409);
                                    response.header("Content-Type", "application/json");
                                    return response.sendString(Mono.just("{\"code\":\"ROOM_UPDATE_BUSY\",\"message\":\"Room is currently being updated\"}")).then();
                                }
                                response.status(200);
                                response.header("Content-Type", "application/json");
                                return response.sendString(Mono.just("{\"maxPlayers\":9}")).then();
                            }
                            if (uri.equals("/ws/info")) {
                                response.header("Access-Control-Allow-Origin", "http://localhost");
                            }
                            return response.sendString(Mono.just(method + " " + uri)).then();
                        }))
                .bindNow();
    }

    private static String upstreamUrl(DisposableServer server) {
        return "http://localhost:" + server.port();
    }
}
