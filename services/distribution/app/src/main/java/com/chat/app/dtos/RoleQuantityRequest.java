package com.chat.app.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleQuantityRequest {

    @NotBlank(message = "roleId is required")
    private String roleId;

    @Min(value = 0, message = "Role quantity must be at least 0")
    private int quantity;
}
