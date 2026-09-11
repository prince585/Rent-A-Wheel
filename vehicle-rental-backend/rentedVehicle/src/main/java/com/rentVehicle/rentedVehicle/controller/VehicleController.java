package com.rentVehicle.rentedVehicle.controller;

import com.rentVehicle.rentedVehicle.model.Rental;
import com.rentVehicle.rentedVehicle.model.Vehicle;
import com.rentVehicle.rentedVehicle.service.RentalService;
import com.rentVehicle.rentedVehicle.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VehicleController {

    private final VehicleService vehicleService;
    private final RentalService rentalService;

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @GetMapping("/available")
    public ResponseEntity<List<Vehicle>> getAvailableVehicles() {
        return ResponseEntity.ok(vehicleService.getAvailableVehicles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable String id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @PostMapping
    public ResponseEntity<Vehicle> addVehicle(@RequestBody Vehicle vehicle) {
        Vehicle created = vehicleService.addVehicle(vehicle);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable String id, @RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, vehicle));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable String id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/rentals")
    public ResponseEntity<List<Rental>> getVehicleRentals(@PathVariable String id) {
        return ResponseEntity.ok(rentalService.getRentalsByVehicle(id));
    }
}
