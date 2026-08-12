package com.masoi.room.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class PublicRoomSummaryMapperTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void aggregatesApprovedRolesAndIgnoresMalformedOrAssignmentShapedEntries() throws Exception {
        var roles = mapper.readTree("[{\"roleId\":\"seer\",\"quantity\":1},{\"roleId\":\"seer\",\"quantity\":2},{\"roleId\":\"unknown\",\"quantity\":9},{\"roleId\":\"werewolf\",\"quantity\":1,\"playerId\":\"secret\"}]");
        assertThat(PublicRoomSummaryMapper.roles(roles)).containsExactly(new com.masoi.room.dto.response.PublicRoleSummary("seer", 3));
    }

    @Test
    void keepsCurrentAndCompletedRolesSeparate() throws Exception {
        var room = mapper.readTree("{\"activeRoles\":[{\"roleId\":\"seer\",\"quantity\":1}],\"lastCompletedGame\":{\"winningSide\":\"WEREWOLF\",\"roles\":[{\"roleId\":\"werewolf\",\"quantity\":2}]}}");
        assertThat(PublicRoomSummaryMapper.roles(room.path("activeRoles"))).extracting("roleId").containsExactly("seer");
        assertThat(PublicRoomSummaryMapper.completed(room.path("lastCompletedGame")).roles()).extracting("roleId").containsExactly("werewolf");
    }
}
