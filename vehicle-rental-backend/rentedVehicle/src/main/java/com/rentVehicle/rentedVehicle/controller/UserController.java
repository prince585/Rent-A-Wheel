package com.rentVehicle.rentedVehicle.controller;

import com.rentVehicle.rentedVehicle.model.Rental;
import com.rentVehicle.rentedVehicle.model.User;
import com.rentVehicle.rentedVehicle.service.RentalService;
import com.rentVehicle.rentedVehicle.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final RentalService rentalService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        User created = userService.registerUser(user);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/rentals")
    public ResponseEntity<List<Rental>> getUserRentals(@PathVariable String id) {
        return ResponseEntity.ok(rentalService.getRentalsByUser(id));
    }
}
