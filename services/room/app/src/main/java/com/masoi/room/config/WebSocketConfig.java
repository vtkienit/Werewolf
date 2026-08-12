package com.masoi.room.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.*;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final String[] allowedOrigins;
    private final PrivateRoleChannelInterceptor inbound;
    private final PrivateRoleOutboundChannelInterceptor outbound;

    public WebSocketConfig(@Value("${app.websocket.allowed-origins}") String allowedOrigins, PrivateRoleChannelInterceptor inbound, PrivateRoleOutboundChannelInterceptor outbound) {
        this.allowedOrigins = allowedOrigins.split(",");
        this.inbound = inbound;
        this.outbound = outbound;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/broadcast");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOrigins(allowedOrigins).withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(inbound);
    }

    @Override
    public void configureClientOutboundChannel(ChannelRegistration registration) {
        registration.interceptors(outbound);
    }
}
