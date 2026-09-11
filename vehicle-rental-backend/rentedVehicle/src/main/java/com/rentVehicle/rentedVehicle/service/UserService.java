package com.rentVehicle.rentedVehicle.service;

import com.rentVehicle.rentedVehicle.exception.UserNotFoundException;
import com.rentVehicle.rentedVehicle.model.User;
import com.rentVehicle.rentedVehicle.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
    }

    public User registerUser(User user) {
        return userRepository.save(user);
    }
}
