package com.rentVehicle.rentedVehicle.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.TypeAlias;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@TypeAlias("BIKE")
public class Bike extends Vehicle {

    private int engineCapacity; // in cc, e.g., 350, 150

    private String bikeType; // Cruiser, Sports, Scooter, Commuter
}
