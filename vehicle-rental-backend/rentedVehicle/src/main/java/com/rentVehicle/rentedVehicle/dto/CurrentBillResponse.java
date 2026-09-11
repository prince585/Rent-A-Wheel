package com.rentVehicle.rentedVehicle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurrentBillResponse {

    private String rentalId;
    private String userId;
    private String userName;
    private String vehicleId;
    private String vehicleBrand;
    private String vehicleModel;
    private String vehicleType;
    private String imageUrl;
    private LocalDateTime startTime;
    private LocalDateTime currentTime;
    private long elapsedMinutes;
    private double hourlyRate;
    private double estimatedAmount;
}
