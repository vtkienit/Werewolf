package com.chat.app.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DistributionRequest {

    @NotBlank(message = "roomCode is required")
    private String roomCode;

    @NotBlank(message = "hostId is required")
    private String hostId;

    @Valid
    @NotEmpty(message = "Players are required")
    private List<DistributionPlayerRequest> players;

    @Valid
    @NotEmpty(message = "Roles are required")
    private List<RoleQuantityRequest> roles;
}