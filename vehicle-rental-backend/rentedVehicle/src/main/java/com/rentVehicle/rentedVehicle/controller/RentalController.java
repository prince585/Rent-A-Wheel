package com.rentVehicle.rentedVehicle.controller;

import com.rentVehicle.rentedVehicle.dto.CurrentBillResponse;
import com.rentVehicle.rentedVehicle.dto.RentalRequest;
import com.rentVehicle.rentedVehicle.model.Rental;
import com.rentVehicle.rentedVehicle.service.RentalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RentalController {

    private final RentalService rentalService;

    @PostMapping
    public ResponseEntity<Rental> rentVehicle(@Valid @RequestBody RentalRequest request) {
        Rental created = rentalService.rentVehicle(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Rental>> getAllRentals() {
        return ResponseEntity.ok(rentalService.getAllRentals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rental> getRentalById(@PathVariable String id) {
        return ResponseEntity.ok(rentalService.getRentalById(id));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<Rental> returnVehicle(@PathVariable String id) {
        Rental returned = rentalService.returnVehicle(id);
        return ResponseEntity.ok(returned);
    }

    @GetMapping("/{id}/bill")
    public ResponseEntity<Rental> getFinalBill(@PathVariable String id) {
        Rental rental = rentalService.getRentalById(id);
        return ResponseEntity.ok(rental);
    }

    @GetMapping("/{id}/current-bill")
    public ResponseEntity<CurrentBillResponse> getCurrentBill(@PathVariable String id) {
        return ResponseEntity.ok(rentalService.getCurrentBill(id));
    }
}
