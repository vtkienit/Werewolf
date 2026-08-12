package com.masoi.room.config;

import java.net.URI;
import java.net.URISyntaxException;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record CreateRoomProperties(String publicFrontendUrl) {
    public CreateRoomProperties {
        URI origin;
        try {
            origin = new URI(publicFrontendUrl);
        } catch (NullPointerException | URISyntaxException exception) {
            throw new IllegalArgumentException("app.public-frontend-url must be an absolute HTTP(S) origin", exception);
        }
        String path = origin.getRawPath();
        if (!("http".equals(origin.getScheme()) || "https".equals(origin.getScheme()))
                || origin.getHost() == null || origin.getUserInfo() != null
                || origin.getRawQuery() != null || origin.getRawFragment() != null
                || !(path == null || path.isEmpty() || "/".equals(path))) {
            throw new IllegalArgumentException("app.public-frontend-url must be an absolute HTTP(S) origin without path, query, fragment, or user info");
        }
        publicFrontendUrl = origin.resolve("/").toString();
        if (publicFrontendUrl.endsWith("/")) {
            publicFrontendUrl = publicFrontendUrl.substring(0, publicFrontendUrl.length() - 1);
        }
    }
}
