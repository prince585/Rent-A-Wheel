package com.rentVehicle.rentedVehicle.repository;

import com.rentVehicle.rentedVehicle.model.Vehicle;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends MongoRepository<Vehicle, String> {

    List<Vehicle> findByAvailableTrue();

    List<Vehicle> findByVehicleType(String vehicleType);
}
