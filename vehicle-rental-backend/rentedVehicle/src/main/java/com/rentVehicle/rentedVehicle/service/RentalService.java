package com.rentVehicle.rentedVehicle.service;

import com.rentVehicle.rentedVehicle.dto.CurrentBillResponse;
import com.rentVehicle.rentedVehicle.dto.RentalRequest;
import com.rentVehicle.rentedVehicle.exception.InvalidRentalException;
import com.rentVehicle.rentedVehicle.exception.RentalNotFoundException;
import com.rentVehicle.rentedVehicle.exception.VehicleNotAvailableException;
import com.rentVehicle.rentedVehicle.model.Rental;
import com.rentVehicle.rentedVehicle.model.RentalStatus;
import com.rentVehicle.rentedVehicle.model.User;
import com.rentVehicle.rentedVehicle.model.Vehicle;
import com.rentVehicle.rentedVehicle.repository.RentalRepository;
import com.rentVehicle.rentedVehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final VehicleRepository vehicleRepository;
    private final UserService userService;
    private final VehicleService vehicleService;

    public Rental rentVehicle(RentalRequest request) {
        User user = userService.getUserById(request.getUserId());
        Vehicle vehicle = vehicleService.getVehicleById(request.getVehicleId());

        if (!vehicle.isAvailable()) {
            throw new VehicleNotAvailableException("Vehicle " + vehicle.getBrand() + " " + vehicle.getModel() + " (" + vehicle.getVehicleId() + ") is currently unavailable.");
        }

        // Set vehicle to unavailable
        vehicle.setAvailable(false);
        vehicleRepository.save(vehicle);

        Rental rental = Rental.builder()
                .userId(user.getUserId())
                .vehicleId(vehicle.getVehicleId())
                .hourlyRateAtBooking(vehicle.getHourlyRate())
                .startTime(LocalDateTime.now())
                .status(RentalStatus.ACTIVE)
                .build();

        return rentalRepository.save(rental);
    }

    public Rental returnVehicle(String rentalId) {
        Rental rental = getRentalById(rentalId);

        if (rental.getStatus() == RentalStatus.COMPLETED) {
            throw new InvalidRentalException("Rental " + rentalId + " has already been completed.");
        }

        LocalDateTime endTime = LocalDateTime.now();
        long elapsedSeconds = Math.max(60, Duration.between(rental.getStartTime(), endTime).toSeconds());
        double elapsedMinutesFractional = elapsedSeconds / 60.0;
        double perMinuteRate = rental.getHourlyRateAtBooking() / 60.0;
        double finalAmount = Math.round(elapsedMinutesFractional * perMinuteRate * 100.0) / 100.0;
        long durationMinutes = (long) Math.ceil(elapsedSeconds / 60.0);

        rental.setEndTime(endTime);
        rental.setDurationInMinutes(durationMinutes);
        rental.setFinalAmount(finalAmount);
        rental.setStatus(RentalStatus.COMPLETED);

        // Make vehicle available again
        Vehicle vehicle = vehicleRepository.findById(rental.getVehicleId()).orElse(null);
        if (vehicle != null) {
            vehicle.setAvailable(true);
            vehicleRepository.save(vehicle);
        }

        return rentalRepository.save(rental);
    }

    public CurrentBillResponse getCurrentBill(String rentalId) {
        Rental rental = getRentalById(rentalId);
        Vehicle vehicle = vehicleRepository.findById(rental.getVehicleId()).orElse(null);
        User user = userService.getUserById(rental.getUserId());

        LocalDateTime now = LocalDateTime.now();
        long elapsedMinutes;
        double amount;

        if (rental.getStatus() == RentalStatus.COMPLETED) {
            elapsedMinutes = rental.getDurationInMinutes() != null ? rental.getDurationInMinutes() : 0;
            amount = rental.getFinalAmount() != null ? rental.getFinalAmount() : 0.0;
            now = rental.getEndTime();
        } else {
            long elapsedSeconds = Math.max(60, Duration.between(rental.getStartTime(), now).toSeconds());
            double elapsedMinutesFractional = elapsedSeconds / 60.0;
            elapsedMinutes = (long) Math.ceil(elapsedSeconds / 60.0);
            double perMinuteRate = rental.getHourlyRateAtBooking() / 60.0;
            amount = Math.round(elapsedMinutesFractional * perMinuteRate * 100.0) / 100.0;
        }

        return CurrentBillResponse.builder()
                .rentalId(rental.getRentalId())
                .userId(rental.getUserId())
                .userName(user != null ? user.getName() : "Unknown")
                .vehicleId(rental.getVehicleId())
                .vehicleBrand(vehicle != null ? vehicle.getBrand() : "")
                .vehicleModel(vehicle != null ? vehicle.getModel() : "")
                .vehicleType(vehicle != null ? vehicle.getVehicleType() : "")
                .imageUrl(vehicle != null ? vehicle.getImageUrl() : "")
                .startTime(rental.getStartTime())
                .currentTime(now)
                .elapsedMinutes(elapsedMinutes)
                .hourlyRate(rental.getHourlyRateAtBooking())
                .estimatedAmount(amount)
                .build();
    }

    public Rental getRentalById(String rentalId) {
        return rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException("Rental not found with ID: " + rentalId));
    }

    public List<Rental> getAllRentals() {
        return rentalRepository.findAll();
    }

    public List<Rental> getRentalsByUser(String userId) {
        userService.getUserById(userId); // Ensure user exists
        return rentalRepository.findByUserId(userId);
    }

    public List<Rental> getRentalsByVehicle(String vehicleId) {
        vehicleService.getVehicleById(vehicleId); // Ensure vehicle exists
        return rentalRepository.findByVehicleId(vehicleId);
    }
}
