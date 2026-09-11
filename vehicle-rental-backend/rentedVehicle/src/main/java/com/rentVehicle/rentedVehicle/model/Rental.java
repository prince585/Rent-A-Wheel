package com.rentVehicle.rentedVehicle.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "rentals")
public class Rental {

    @Id
    private String rentalId;

    private String userId;

    private String vehicleId;

    private double hourlyRateAtBooking;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private RentalStatus status;

    private Double finalAmount;

    private Long durationInMinutes;
}
