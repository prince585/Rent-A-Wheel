package com.rentVehicle.rentedVehicle.repository;

import com.rentVehicle.rentedVehicle.model.Rental;
import com.rentVehicle.rentedVehicle.model.RentalStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RentalRepository extends MongoRepository<Rental, String> {

    List<Rental> findByUserId(String userId);

    List<Rental> findByVehicleId(String vehicleId);

    List<Rental> findByStatus(RentalStatus status);

    Optional<Rental> findFirstByVehicleIdAndStatus(String vehicleId, RentalStatus status);

    Optional<Rental> findFirstByUserIdAndStatus(String userId, RentalStatus status);
}
