package com.rentVehicle.rentedVehicle.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Document(collection = "vehicles")
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXISTING_PROPERTY, property = "vehicleType", visible = true)
@JsonSubTypes({
                @JsonSubTypes.Type(value = Car.class, name = "CAR"),
                @JsonSubTypes.Type(value = Bike.class, name = "BIKE")
})
public abstract class Vehicle {

        @Id
        private String vehicleId;

        private String brand;

        private String model;

        private double hourlyRate;

        @lombok.Builder.Default
        private boolean available = true;

        private String imageUrl;

        private String vehicleType; // "CAR" or "BIKE"
}
