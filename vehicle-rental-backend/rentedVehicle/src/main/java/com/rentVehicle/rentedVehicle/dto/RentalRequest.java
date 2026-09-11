package com.rentVehicle.rentedVehicle.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Vehicle ID is required")
    private String vehicleId;
}
