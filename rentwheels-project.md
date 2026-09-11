# RentWheels — Car Rental System

## Project Overview

RentWheels is a full-stack vehicle rental application where users can
rent an available car or bike. The core feature is time-based billing:
when a user rents a vehicle, the system records the rental start time
and continuously calculates the payable amount based on the hourly rate
of the selected vehicle.

When the vehicle is returned, the system records the end time,
calculates the total rental duration, generates the final bill, and
makes the vehicle available for another rental.

The project demonstrates core Java OOP concepts, basic collections,
exception handling, date/time handling, and a simple REST-based
full-stack architecture.

---

## Main Features

- View available cars and bikes.
- Add and manage vehicles.
- Register and manage users.
- Rent an available vehicle.
- Record the exact rental start time.
- View the current estimated rental cost while the rental is active.
- Return a rented vehicle.
- Record the rental end time.
- Calculate the final payable amount based on rental duration and
  vehicle hourly rate.
- View rental history (per user, per vehicle, or across all rentals).
- Handle invalid operations with custom exceptions.
- Store application data in MongoDB Atlas.
- Provide REST APIs through Spring Boot.
- Use a plain HTML, CSS, and JavaScript frontend.

---

## Rental Flow

```text
Vehicle Available
       |
       v
User Selects Vehicle
       |
       v
Rental Created
       |
       v
Start Time Recorded
       |
       v
Vehicle Becomes Unavailable
       |
       v
Rental Continues
       |
       v
Current Bill Can Be Viewed
       |
       v
User Returns Vehicle
       |
       v
End Time Recorded
       |
       v
Rental Duration Calculated
       |
       v
Final Bill Generated
       |
       v
Vehicle Becomes Available
```

---

## Time-Based Billing

Each vehicle has its own hourly rental rate.

Example:

```text
Vehicle: Royal Enfield Classic 350
Hourly Rate: ₹120

Start Time: 10:30 AM
End Time:   2:45 PM

Rental Duration: 4 hours 15 minutes
```

Per-minute billing calculation:

```text
Duration in minutes = 255
Hourly rate = ₹120

Per-minute rate = ₹120 / 60
               = ₹2

Total = 255 × ₹2
      = ₹510
```

The frontend may display a live estimated bill for an active rental
(computed client-side from elapsed time × rate), but the **backend
remains the authoritative source** for the final billing calculation.

---

## Vehicle Types

Common `Vehicle` abstraction with specialized vehicle types:

```text
              Vehicle
              /      \
            Car      Bike
```

### Vehicle (base)
- Vehicle ID
- Brand
- Model
- Hourly rate
- Availability status

### Car
- Number of seats
- Fuel type

### Bike
- Engine capacity
- Bike type

*(Exact fields can be adjusted during implementation.)*

---

## Core Java Concepts Demonstrated

### OOP
- Classes and objects
- Encapsulation
- Abstraction
- Inheritance
- Polymorphism
- Interfaces where appropriate
- Composition

Domain classes: `Vehicle`, `Car`, `Bike`, `User`, `Rental`

### Collections
```java
List<Vehicle>
Map<String, User>
Set<String>
```
- `ArrayList` for collections of vehicles or rentals.
- `HashMap` for quick lookup by ID.
- `HashSet` for unique values such as registered IDs.

*(Once MongoDB is wired in, these collections are primarily used for
in-memory processing, not as a replacement for the database.)*

### Exception Handling

Custom exceptions:
```text
VehicleNotFoundException
VehicleNotAvailableException
UserNotFoundException
RentalNotFoundException
InvalidRentalException
InvalidAmountException
```

Example:
```text
User attempts to rent an already-rented vehicle.
→ VehicleNotAvailableException
→ "Vehicle B102 is currently unavailable."
```

Each custom exception should map to an HTTP status via a global
`@ControllerAdvice` handler, e.g.:
- `VehicleNotFoundException` → 404
- `VehicleNotAvailableException` → 409
- `UserNotFoundException` → 404
- `RentalNotFoundException` → 404
- `InvalidRentalException` / `InvalidAmountException` → 400

### Date and Time

```java
LocalDateTime startTime;
LocalDateTime endTime;
```

Used to calculate rental duration and final bill on the backend.

---

## Technology Stack

### Frontend
- HTML
- CSS
- Vanilla JavaScript
*(No framework — kept intentionally simple.)*

### Backend
- Java 21
- Spring Boot
- Spring Web
- Spring Data MongoDB
- Spring Boot Validation
- Lombok
- Spring Boot DevTools

### Database
- MongoDB Atlas (cloud-hosted, free M0 tier, AWS, Mumbai `ap-south-1` region)

### Build Tool
- Maven

---

## Application Architecture

```text
                Frontend
        HTML + CSS + JavaScript
                    |
                    | HTTP / JSON
                    v
          Spring Boot REST API
                    |
                    v
               Controller
                    |
                    v
                Service
                    |
                    v
              Repository
                    |
                    v
             MongoDB Atlas
```

---

## Backend Structure (Spring Boot)

```text
src/main/java/
└── com.example.carrental/
    ├── controller/
    │   ├── VehicleController
    │   ├── UserController
    │   └── RentalController
    │
    ├── service/
    │   ├── VehicleService
    │   ├── UserService
    │   └── RentalService
    │
    ├── repository/
    │   ├── VehicleRepository
    │   ├── UserRepository
    │   └── RentalRepository
    │
    ├── model/
    │   ├── Vehicle
    │   ├── Car
    │   ├── Bike
    │   ├── User
    │   ├── Rental
    │   └── RentalStatus (enum)
    │
    └── exception/
        ├── VehicleNotFoundException
        ├── VehicleNotAvailableException
        ├── UserNotFoundException
        ├── RentalNotFoundException
        ├── InvalidRentalException
        ├── InvalidAmountException
        └── GlobalExceptionHandler (@ControllerAdvice)
```

Generated via Spring Initializr with dependencies: Spring Web, Spring
Data MongoDB, Validation, Lombok, DevTools.

---

## Frontend Structure (Plain HTML/CSS/JS)

```text
vehicle-rental-frontend/
├── index.html          → landing page / available vehicles list
├── vehicles.html        → vehicle management page
├── rental.html           → active rental view (elapsed time, live bill)
├── history.html          → rental history
├── css/
│   └── style.css
├── js/
│   ├── api.js            → fetch wrapper for calling the Spring Boot REST API
│   ├── vehicles.js        → vehicle listing/rent actions
│   ├── rental.js           → active rental + live bill logic
│   └── history.js           → fetching/displaying rental history
└── assets/
    └── (images/icons if needed)
```

Keep `api.js` as a single place with fetch functions (`getVehicles()`,
`rentVehicle()`, `returnVehicle()`, etc.) so other JS files stay clean.

---

## Suggested REST API

### Vehicles
```text
GET    /api/vehicles
GET    /api/vehicles/available
GET    /api/vehicles/{id}
POST   /api/vehicles
PUT    /api/vehicles/{id}
DELETE /api/vehicles/{id}
```

### Users
```text
GET  /api/users
GET  /api/users/{id}
POST /api/users
```

### Rentals
```text
POST /api/rentals
GET  /api/rentals
GET  /api/rentals/{id}
POST /api/rentals/{id}/return
GET  /api/rentals/{id}/bill
GET  /api/rentals/{id}/current-bill      (live estimate for active rental)
GET  /api/users/{id}/rentals             (a user's rental history)
GET  /api/vehicles/{id}/rentals          (a vehicle's rental history)
```

---

## Rental Status

Rental statuses:
```text
ACTIVE
COMPLETED
```

Vehicle statuses:
```text
AVAILABLE
RENTED
```

The system must prevent an unavailable vehicle from being rented again
until its active rental is completed. (Note: for v1, availability is
checked at the service layer before creating a rental — this is not
fully race-condition-proof under concurrent requests, but acceptable
for the initial scope. A future improvement would use atomic
`findAndModify`-style updates or optimistic locking.)

---

## Example User Flow

```text
1. User opens the website.
2. Available vehicles are displayed.
3. User selects: Royal Enfield Classic 350, ₹120/hour
4. User clicks "Rent".
5. Backend creates a rental and records:
   - User ID
   - Vehicle ID
   - Start time
   - Hourly rate
   - ACTIVE status
6. Vehicle status changes: AVAILABLE → RENTED
7. User can view the active rental.
8. Frontend displays: Start time, Elapsed time, Current estimated bill
9. User clicks "Return Vehicle".
10. Backend records the end time.
11. Backend calculates the final bill.
12. Rental status changes: ACTIVE → COMPLETED
13. Vehicle status changes: RENTED → AVAILABLE
```

---

## Initial Scope (v1)

- No authentication system initially.
- No payment gateway.
- No maps or GPS.
- No external vehicle APIs.
- No frontend framework.
- No complicated pricing engine.
- No unnecessary microservices.

Focus: a complete rental lifecycle using Java fundamentals correctly.

---

## Future Improvements

- User authentication.
- Admin dashboard.
- Different pricing rules.
- Discounts.
- Late-return charges.
- Vehicle maintenance status.
- Rental cancellation.
- Online payments.
- Email notifications.
- Rental analytics.
- Deployment of the Spring Boot backend and frontend.
- Concurrency-safe rental creation (atomic status checks).

---

## Project Goal

```text
Core Java
    ↓
OOP
    ↓
Collections
    ↓
Exception Handling
    ↓
Date/Time
    ↓
Spring Boot REST API
    ↓
MongoDB Atlas
    ↓
HTML/CSS/JavaScript Frontend
```

Prioritize clean object-oriented design and correct rental/billing
logic over simply implementing CRUD operations.

---

## Setup Status (Prerequisites)

| Item | Status |
|---|---|
| Java 21 (JDK) | ✅ Installed |
| Maven | ✅ Available |
| Spring Boot project | ✅ Generated via Spring Initializr (Web, Data MongoDB, Validation, Lombok, DevTools) |
| MongoDB Atlas cluster | ✅ Created — `rentwheels` cluster, AWS, Mumbai (`ap-south-1`), free M0 tier |
| MongoDB database user | ✅ Created |
| MongoDB network access | ✅ Current IP whitelisted |
| Connection verified | ✅ Backend starts cleanly, connects to Atlas |
| Frontend skeleton | ✅ Created (html/css/js files and folders) |
| Backend package structure | ⏳ To do — create `controller/`, `service/`, `repository/`, `model/`, `exception/` packages |
| Model classes | ⏳ Not yet written |

> **Connection string note:** Your MongoDB URI (with username/password)
> goes in `src/main/resources/application.properties`. Do **not** commit
> this file with real credentials to a public Git repo — add it to
> `.gitignore` or move the URI to an environment variable / a separate
> `application-local.properties` file before pushing.

---

## Implementation Prompt

Use this prompt (with an AI coding assistant, or as your own build
checklist) to implement the project step by step, in order:

```text
You are helping me build "RentWheels," a Java Spring Boot + MongoDB
Atlas + vanilla HTML/CSS/JS car and bike rental system. Follow this
exact plan and build it incrementally, one layer at a time, explaining
each file as you create it. Do not skip ahead to later layers before
earlier ones are complete and correct.

Tech stack:
- Backend: Java 21, Spring Boot, Spring Web, Spring Data MongoDB,
  Validation, Lombok
- Database: MongoDB Atlas
- Frontend: Plain HTML, CSS, vanilla JavaScript (no framework)
- Build tool: Maven

Package base: com.example.carrental

Step 1 — Model layer (model/):
- Create an abstract `Vehicle` class: vehicleId, brand, model,
  hourlyRate, boolean available (or an AVAILABLE/RENTED enum).
- Create `Car` extends `Vehicle`: numberOfSeats, fuelType.
- Create `Bike` extends `Vehicle`: engineCapacity, bikeType.
- Create `User`: userId, name, email, phone.
- Create `RentalStatus` enum: ACTIVE, COMPLETED.
- Create `Rental`: rentalId, userId, vehicleId, hourlyRateAtBooking,
  startTime (LocalDateTime), endTime (LocalDateTime, nullable),
  status (RentalStatus), finalAmount (nullable until completed).
- Annotate MongoDB documents correctly (@Document, @Id). Since Car and
  Bike both extend Vehicle, decide and implement a clear strategy for
  persisting polymorphic types (e.g., a discriminator field via
  @TypeAlias, or separate collections) — explain the tradeoff you
  chose.

Step 2 — Custom exceptions (exception/):
- VehicleNotFoundException, VehicleNotAvailableException,
  UserNotFoundException, RentalNotFoundException,
  InvalidRentalException, InvalidAmountException.
- Create a GlobalExceptionHandler with @ControllerAdvice mapping each
  exception to the correct HTTP status (404, 409, 400 as appropriate),
  returning a clean JSON error body.

Step 3 — Repository layer (repository/):
- VehicleRepository, UserRepository, RentalRepository extending
  MongoRepository<T, String>, with any needed derived query methods
  (e.g., findByAvailableTrue, findByUserId, findByVehicleId,
  findByStatus).

Step 4 — Service layer (service/):
- VehicleService: CRUD + list available vehicles.
- UserService: register/list/find users.
- RentalService: create rental (checking vehicle availability first
  and throwing VehicleNotAvailableException if not free), return
  rental (compute duration and final bill using per-minute billing
  from the vehicle's hourly rate at time of booking), get current
  estimated bill for an active rental, list rental history (all /
  by user / by vehicle).
- Billing logic must live in the service layer, not the controller,
  and must be the authoritative calculation.

Step 5 — Controller layer (controller/):
- VehicleController, UserController, RentalController implementing
  the REST endpoints listed in the project's "Suggested REST API"
  section, including GET /api/rentals/{id}/current-bill,
  GET /api/users/{id}/rentals, and GET /api/vehicles/{id}/rentals.
- Use proper HTTP verbs/status codes and DTOs with @Valid validation
  on request bodies where appropriate.

Step 6 — Verify backend:
- Confirm the app starts cleanly and connects to MongoDB Atlas.
- Walk through the full rental lifecycle using Postman or curl: add a
  vehicle, register a user, rent it, view current bill, return it,
  view final bill, confirm vehicle becomes available again.

Step 7 — Frontend (plain HTML/CSS/JS):
- index.html: list available vehicles (car/bike), fetched from
  GET /api/vehicles/available, with a "Rent" button per vehicle.
- rental.html: show the active rental's start time, live elapsed
  time, and a client-side estimated bill (recomputed every few
  seconds from elapsed time × hourly rate), with a "Return Vehicle"
  button calling POST /api/rentals/{id}/return.
- history.html: fetch and display past rentals (GET /api/rentals or
  a user-scoped endpoint), showing vehicle, duration, and final
  amount.
- js/api.js: a single fetch wrapper module used by all pages.
- Keep styling clean and simple in css/style.css — no framework.

Build one step at a time. After each step, pause and let me review
before continuing to the next.
```

---

## Notes / Decisions Log

- Frontend and backend are in **separate folders** under a shared
  parent (`rentwheels/`), not a single combined project.
- MongoDB Atlas free tier (M0), AWS, Mumbai region — chosen for
  proximity/low latency.
- "Preload sample dataset" was **declined** during cluster creation to
  avoid unrelated demo collections.
- Rental history is **not** a separate collection — it's simply the
  `Rental` collection queried by status/user/vehicle. No separate
  audit log for v1.
- Concurrency-safe double-booking prevention is explicitly deferred to
  "Future Improvements" — v1 uses a straightforward availability check
  in the service layer.
