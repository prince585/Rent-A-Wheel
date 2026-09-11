package com.rentVehicle.rentedVehicle.config;

import com.rentVehicle.rentedVehicle.model.Bike;
import com.rentVehicle.rentedVehicle.model.Car;
import com.rentVehicle.rentedVehicle.model.User;
import com.rentVehicle.rentedVehicle.repository.UserRepository;
import com.rentVehicle.rentedVehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

        private final VehicleRepository vehicleRepository;
        private final UserRepository userRepository;

        @Override
        public void run(String... args) {
                initializeUsers();
                initializeVehicles();
        }

        private void initializeUsers() {
                if (userRepository.count() == 0) {
                        log.info("Initializing sample users...");
                        List<User> users = List.of(
                                        User.builder()
                                                        .name("John Doe")
                                                        .email("john.doe@example.com")
                                                        .phone("+91 98765 43210")
                                                        .build(),
                                        User.builder()
                                                        .name("Priya Sharma")
                                                        .email("priya.sharma@example.com")
                                                        .phone("+91 98123 45678")
                                                        .build(),
                                        User.builder()
                                                        .name("Alex Chen")
                                                        .email("alex.chen@example.com")
                                                        .phone("+91 98456 12378")
                                                        .build());
                        userRepository.saveAll(users);
                        log.info("Successfully seeded {} sample users.", users.size());
                }
        }

        private void initializeVehicles() {
                if (vehicleRepository.count() == 0) {
                        log.info("Initializing sample vehicles with free online images...");
                        List<Car> cars = List.of(
                                        Car.builder()
                                                        .brand("Hyundai")
                                                        .model("i20 Asta")
                                                        .hourlyRate(180.0)
                                                        .available(true)
                                                        .vehicleType("CAR")
                                                        .numberOfSeats(5)
                                                        .fuelType("Petrol")
                                                        .imageUrl("https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80")
                                                        .build(),
                                        Car.builder()
                                                        .brand("Tata")
                                                        .model("Nexon EV Max")
                                                        .hourlyRate(260.0)
                                                        .available(true)
                                                        .vehicleType("CAR")
                                                        .numberOfSeats(5)
                                                        .fuelType("Electric")
                                                        .imageUrl("https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80")
                                                        .build(),
                                        Car.builder()
                                                        .brand("Mahindra")
                                                        .model("Thar 4x4 Hard Top")
                                                        .hourlyRate(380.0)
                                                        .available(true)
                                                        .vehicleType("CAR")
                                                        .numberOfSeats(4)
                                                        .fuelType("Diesel")
                                                        .imageUrl("https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80")
                                                        .build(),
                                        Car.builder()
                                                        .brand("Toyota")
                                                        .model("Innova Crysta")
                                                        .hourlyRate(450.0)
                                                        .available(true)
                                                        .vehicleType("CAR")
                                                        .numberOfSeats(7)
                                                        .fuelType("Diesel")
                                                        .imageUrl("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80")
                                                        .build(),
                                        Car.builder()
                                                        .brand("Tesla")
                                                        .model("Model 3 Long Range")
                                                        .hourlyRate(550.0)
                                                        .available(true)
                                                        .vehicleType("CAR")
                                                        .numberOfSeats(5)
                                                        .fuelType("Electric")
                                                        .imageUrl("https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80")
                                                        .build());

                        List<Bike> bikes = List.of(
                                        Bike.builder()
                                                        .brand("Royal Enfield")
                                                        .model("Classic 350 Stealth Black")
                                                        .hourlyRate(120.0)
                                                        .available(true)
                                                        .vehicleType("BIKE")
                                                        .engineCapacity(349)
                                                        .bikeType("Cruiser")
                                                        .imageUrl("https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80")
                                                        .build(),
                                        Bike.builder()
                                                        .brand("Yamaha")
                                                        .model("MT-15 V2")
                                                        .hourlyRate(110.0)
                                                        .available(true)
                                                        .vehicleType("BIKE")
                                                        .engineCapacity(155)
                                                        .bikeType("Naked Sports")
                                                        .imageUrl("https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80")
                                                        .build(),
                                        Bike.builder()
                                                        .brand("KTM")
                                                        .model("Duke 390")
                                                        .hourlyRate(160.0)
                                                        .available(true)
                                                        .vehicleType("BIKE")
                                                        .engineCapacity(373)
                                                        .bikeType("Sports")
                                                        .imageUrl("https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80")
                                                        .build(),
                                        Bike.builder()
                                                        .brand("Honda")
                                                        .model("Activa 6G DLX")
                                                        .hourlyRate(60.0)
                                                        .available(true)
                                                        .vehicleType("BIKE")
                                                        .engineCapacity(110)
                                                        .bikeType("Scooter")
                                                        .imageUrl("https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=800&q=80")
                                                        .build(),
                                        Bike.builder()
                                                        .brand("Harley-Davidson")
                                                        .model("Iron 883")
                                                        .hourlyRate(300.0)
                                                        .available(true)
                                                        .vehicleType("BIKE")
                                                        .engineCapacity(883)
                                                        .bikeType("Cruiser")
                                                        .imageUrl("https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80")
                                                        .build());

                        vehicleRepository.saveAll(cars);
                        vehicleRepository.saveAll(bikes);
                        log.info("Successfully seeded {} cars and {} bikes.", cars.size(), bikes.size());
                }
        }
}
