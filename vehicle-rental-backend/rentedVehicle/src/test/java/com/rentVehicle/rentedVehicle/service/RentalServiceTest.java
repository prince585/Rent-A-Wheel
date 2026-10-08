package com.rentVehicle.rentedVehicle.service;

import com.rentVehicle.rentedVehicle.dto.RentalRequest;
import com.rentVehicle.rentedVehicle.exception.InvalidRentalException;
import com.rentVehicle.rentedVehicle.exception.RentalNotFoundException;
import com.rentVehicle.rentedVehicle.exception.VehicleNotAvailableException;
import com.rentVehicle.rentedVehicle.model.Car;
import com.rentVehicle.rentedVehicle.model.Rental;
import com.rentVehicle.rentedVehicle.model.RentalStatus;
import com.rentVehicle.rentedVehicle.model.User;
import com.rentVehicle.rentedVehicle.model.Vehicle;
import com.rentVehicle.rentedVehicle.repository.RentalRepository;
import com.rentVehicle.rentedVehicle.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RentalServiceTest {

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserService userService;

    @Mock
    private VehicleService vehicleService;

    @InjectMocks
    private RentalService rentalService;

    private User sampleUser;
    private Vehicle sampleVehicle;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .userId("user-101")
                .name("Prince Verma")
                .email("prince@example.com")
                .phone("9999999999")
                .build();

        sampleVehicle = Car.builder()
                .vehicleId("car-201")
                .brand("Hyundai")
                .model("i20")
                .hourlyRate(120.0)
                .available(true)
                .vehicleType("CAR")
                .numberOfSeats(5)
                .fuelType("Petrol")
                .build();
    }

    @Test
    @DisplayName("Should successfully rent an available vehicle")
    void rentVehicle_Success() {
        RentalRequest request = new RentalRequest();
        request.setUserId("user-101");
        request.setVehicleId("car-201");

        when(userService.getUserById("user-101")).thenReturn(sampleUser);
        when(vehicleService.getVehicleById("car-201")).thenReturn(sampleVehicle);
        when(rentalRepository.save(any(Rental.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Rental result = rentalService.rentVehicle(request);

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo("user-101");
        assertThat(result.getVehicleId()).isEqualTo("car-201");
        assertThat(result.getStatus()).isEqualTo(RentalStatus.ACTIVE);
        assertThat(sampleVehicle.isAvailable()).isFalse();

        verify(vehicleRepository).save(sampleVehicle);
        verify(rentalRepository).save(any(Rental.class));
    }

    @Test
    @DisplayName("Should throw VehicleNotAvailableException when vehicle is already rented")
    void rentVehicle_ThrowsException_WhenUnavailable() {
        sampleVehicle.setAvailable(false);

        RentalRequest request = new RentalRequest();
        request.setUserId("user-101");
        request.setVehicleId("car-201");

        when(userService.getUserById("user-101")).thenReturn(sampleUser);
        when(vehicleService.getVehicleById("car-201")).thenReturn(sampleVehicle);

        assertThatThrownBy(() -> rentalService.rentVehicle(request))
                .isInstanceOf(VehicleNotAvailableException.class)
                .hasMessageContaining("currently unavailable");

        verify(rentalRepository, never()).save(any(Rental.class));
    }

    @Test
    @DisplayName("Should successfully return vehicle and compute billing")
    void returnVehicle_Success() {
        Rental activeRental = Rental.builder()
                .rentalId("rental-301")
                .userId("user-101")
                .vehicleId("car-201")
                .hourlyRateAtBooking(120.0)
                .startTime(LocalDateTime.now().minusMinutes(30))
                .status(RentalStatus.ACTIVE)
                .build();

        sampleVehicle.setAvailable(false);

        when(rentalRepository.findById("rental-301")).thenReturn(Optional.of(activeRental));
        when(vehicleRepository.findById("car-201")).thenReturn(Optional.of(sampleVehicle));
        when(rentalRepository.save(any(Rental.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Rental result = rentalService.returnVehicle("rental-301");

        assertThat(result.getStatus()).isEqualTo(RentalStatus.COMPLETED);
        assertThat(result.getEndTime()).isNotNull();
        assertThat(result.getFinalAmount()).isGreaterThan(0.0);
        assertThat(sampleVehicle.isAvailable()).isTrue();

        verify(vehicleRepository).save(sampleVehicle);
        verify(rentalRepository).save(activeRental);
    }

    @Test
    @DisplayName("Should throw InvalidRentalException when returning already completed rental")
    void returnVehicle_ThrowsException_WhenAlreadyCompleted() {
        Rental completedRental = Rental.builder()
                .rentalId("rental-301")
                .status(RentalStatus.COMPLETED)
                .build();

        when(rentalRepository.findById("rental-301")).thenReturn(Optional.of(completedRental));

        assertThatThrownBy(() -> rentalService.returnVehicle("rental-301"))
                .isInstanceOf(InvalidRentalException.class)
                .hasMessageContaining("already been completed");

        verify(rentalRepository, never()).save(any(Rental.class));
    }

    @Test
    @DisplayName("Should throw RentalNotFoundException when rental ID does not exist")
    void getRentalById_ThrowsException_WhenNotFound() {
        when(rentalRepository.findById("non-existent")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> rentalService.getRentalById("non-existent"))
                .isInstanceOf(RentalNotFoundException.class)
                .hasMessageContaining("Rental not found with ID");
    }
}
