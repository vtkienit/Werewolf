package com.masoi.room.utils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.masoi.room.config.CreateRoomProperties;
import org.junit.jupiter.api.Test;

class QrUrlFactoryTest {
    @Test
    void acceptsSupportedAbsoluteOriginsAndNormalizesTrailingSlash() {
        assertThat(factory("http://localhost").create("A7K9Q2")).isEqualTo("http://localhost/join/A7K9Q2");
        assertThat(factory("http://localhost:5173/").create("A7K9Q2")).isEqualTo("http://localhost:5173/join/A7K9Q2");
        assertThat(factory("https://masoi.example.com").create("A7K9Q2")).isEqualTo("https://masoi.example.com/join/A7K9Q2");
        assertThat(factory("https://masoi.example.com:8443").create("A7 K9")).isEqualTo("https://masoi.example.com:8443/join/A7%20K9");
    }

    @Test
    void rejectsInvalidOrNonOriginConfiguration() {
        assertThatThrownBy(() -> factory("/join")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> factory("localhost")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> factory("room-service:8081")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> factory("ftp://example.com")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> factory("http:///broken")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> factory("http://")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> factory("https://user@example.com")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> factory("https://example.com/app")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> factory("https://example.com?x=1")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> factory("https://example.com#fragment")).isInstanceOf(IllegalArgumentException.class);
    }

    private QrUrlFactory factory(String origin) {
        return new QrUrlFactory(new CreateRoomProperties(origin));
    }
}
