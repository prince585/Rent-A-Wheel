package com.rentVehicle.rentedVehicle.service;

import com.rentVehicle.rentedVehicle.exception.VehicleNotFoundException;
import com.rentVehicle.rentedVehicle.model.Car;
import com.rentVehicle.rentedVehicle.model.Bike;
import com.rentVehicle.rentedVehicle.model.Vehicle;
import com.rentVehicle.rentedVehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public List<Vehicle> getAvailableVehicles() {
        return vehicleRepository.findByAvailableTrue();
    }

    public Vehicle getVehicleById(String id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with ID: " + id));
    }

    public Vehicle addVehicle(Vehicle vehicle) {
        vehicle.setAvailable(true);
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(String id, Vehicle updatedVehicle) {
        Vehicle existing = getVehicleById(id);
        existing.setBrand(updatedVehicle.getBrand());
        existing.setModel(updatedVehicle.getModel());
        existing.setHourlyRate(updatedVehicle.getHourlyRate());
        existing.setImageUrl(updatedVehicle.getImageUrl());
        existing.setAvailable(updatedVehicle.isAvailable());

        if (existing instanceof Car existingCar && updatedVehicle instanceof Car updatedCar) {
            existingCar.setNumberOfSeats(updatedCar.getNumberOfSeats());
            existingCar.setFuelType(updatedCar.getFuelType());
        } else if (existing instanceof Bike existingBike && updatedVehicle instanceof Bike updatedBike) {
            existingBike.setEngineCapacity(updatedBike.getEngineCapacity());
            existingBike.setBikeType(updatedBike.getBikeType());
        }

        return vehicleRepository.save(existing);
    }

    public void deleteVehicle(String id) {
        Vehicle existing = getVehicleById(id);
        vehicleRepository.delete(existing);
    }
}
