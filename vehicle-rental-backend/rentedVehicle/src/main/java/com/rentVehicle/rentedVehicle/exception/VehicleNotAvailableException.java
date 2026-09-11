package com.rentVehicle.rentedVehicle.exception;

public class VehicleNotAvailableException extends RuntimeException {
    public VehicleNotAvailableException(String message) {
        super(message);
    }
}
