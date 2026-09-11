package com.rentVehicle.rentedVehicle.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(VehicleNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleVehicleNotFound(VehicleNotFoundException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(RentalNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleRentalNotFound(RentalNotFoundException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(VehicleNotAvailableException.class)
    public ResponseEntity<ErrorResponse> handleVehicleNotAvailable(VehicleNotAvailableException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler({InvalidRentalException.class, InvalidAmountException.class, IllegalArgumentException.class})
    public ResponseEntity<ErrorResponse> handleBadRequest(RuntimeException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return buildResponse(HttpStatus.BAD_REQUEST, errorMessage, request.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred: " + ex.getMessage(), request.getRequestURI());
    }

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message, String path) {
        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .build();
        return new ResponseEntity<>(response, status);
    }
}
