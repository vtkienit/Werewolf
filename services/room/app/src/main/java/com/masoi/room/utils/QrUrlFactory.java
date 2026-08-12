package com.masoi.room.utils;

import com.masoi.room.config.CreateRoomProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class QrUrlFactory {
    private final String publicFrontendUrl;

    public QrUrlFactory(CreateRoomProperties properties) {
        this.publicFrontendUrl = properties.publicFrontendUrl();
    }

    public String create(String roomCode) {
        return UriComponentsBuilder.fromUriString(publicFrontendUrl)
                .pathSegment("join", roomCode)
                .build()
                .encode()
                .toUriString();
    }
}
