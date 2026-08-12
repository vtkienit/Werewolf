package com.chat.app.services;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ApprovedRoleIdsTest {
    @Test
    void exactlyMatchesTheCanonicalRoomRoleWireCatalog() throws Exception {
        String source = Files.readString(Path.of("..", "..", "room", "app", "src", "main", "java", "com", "masoi", "room", "model", "RoleId.java"));
        var matcher = Pattern.compile("\\(\"([^\"]+)\"\\)").matcher(source);
        var canonical = new java.util.HashSet<String>();
        while (matcher.find()) canonical.add(matcher.group(1));
        assertThat(ApprovedRoleIds.values()).containsExactlyInAnyOrderElementsOf(canonical);
        assertThat(canonical).hasSize(35);
        assertThat(ApprovedRoleIds.contains("not_a_role")).isFalse();
        assertThat(ApprovedRoleIds.contains(" ")).isFalse();
        assertThat(ApprovedRoleIds.contains(null)).isFalse();
    }
}
