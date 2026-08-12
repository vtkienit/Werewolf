package com.chat.app.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient roomRestClient(@Value("${app.room-service-url}") String roomServiceUrl) {
        return RestClient.builder()
                .baseUrl(roomServiceUrl)
                .build();
    }
}