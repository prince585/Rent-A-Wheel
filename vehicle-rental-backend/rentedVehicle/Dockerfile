# Multi-Stage Build Dockerfile for RentWheels Spring Boot Backend
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Package application without running tests during image build
RUN mvn clean package -DskipTests

# Production Run Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy built jar
COPY --from=build /app/target/*.jar app.jar

# Expose port (Render/Cloud providers map $PORT to this)
EXPOSE 8080

# Run Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
