package com.rentVehicle.rentedVehicle.exception;

public class RentalNotFoundException extends RuntimeException {
    public RentalNotFoundException(String message) {
        super(message);
    }
}
