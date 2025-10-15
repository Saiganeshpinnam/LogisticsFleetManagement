# Logistics & Fleet Management - Backend Starter

## Overview
Minimal backend starter using Node.js, Express, Sequelize (Postgres), and Socket.io.
Provides:
- JWT auth (Admin/Driver/Customer)
- Vehicles API (POST /vehicles)
- Deliveries API (POST /deliveries, PUT /deliveries/:id/status, GET /deliveries/:id/track)
- Real-time driver location via Socket.io

## Quick start
1. Copy `.env.example` to `.env` and fill values.
2. `npm install`
3. Ensure PostgreSQL is running and DB exists (or create it).
4. `npm run dev` (requires nodemon) or `npm start`

The server will call `sequelize.sync()` and create tables automatically for development.

## Notes
- This is a starter. Extend validation, error handling, and production hardening as needed.


=> Admin:

Register:
{
  "name": "Admin",
  "email": "admin@test.com",
  "password": "123456",
  "role": "admin"
}

Login:
=> inputs:
1. Method - POST
2. url - 
3. Headers - Content-Type: application/json
4. Body - {
  "email": "admin@test.com",
  "password": "123456"
}
5. scripts - 
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.token);
console.log("Admin token saved:", jsonData.token);

=> output:
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwNDE5NjIzLCJleHAiOjE3NjEwMjQ0MjN9.fz_zgv8mEjipwNA8tzC0nKQ4XnOpUrq_t-FiDefm3gU",
    "user": {
        "id": 1,
        "name": "Admin",
        "email": "admin@test.com",
        "role": "admin"
    }
}

Add Vehicle:
{
    "status": "available",
    "id": 1,
    "plateNumber": "MH12AB1234",
    "model": "Tata Ace",
    "updatedAt": "2025-10-12T16:09:17.039Z",
    "createdAt": "2025-10-12T16:09:17.039Z"
}

Create Delivery:
{
    "status": "pending",
    "id": 8,
    "pickupAddress": "Warehouse A",
    "dropAddress": "Customer B",
    "driverId": 1,
    "vehicleId": 1,
    "scheduledStart": "2025-10-12T04:30:00.000Z",
    "scheduledEnd": "2025-10-12T08:30:00.000Z",
    "customerId": 1,
    "updatedAt": "2025-10-12T16:24:13.522Z",
    "createdAt": "2025-10-12T16:24:13.522Z"
}

Reports: pending




Driver:

Register Driver : 
{
    "id": 2,
    "email": "driver1@test.com",
    "role": "driver"
}

Login Driver:
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6ImRyaXZlciIsImlhdCI6MTc2MDM1ODY0MSwiZXhwIjoxNzYwOTYzNDQxfQ.NJrA7DqZVR4X-97lSx1Soq8ogt18kKQ5668Xq410EfE",
    "user": {
        "id": 2,
        "name": "Driver 1",
        "email": "driver1@test.com",
        "role": "driver"
    }
}

Update Delivery Status : pending



Customer:

Register:
{ "name": "Customer 3", "email": "customer3@test.com", "password": "custpass", "role": "customer" }
Response:
{
    "id": 6,
    "email": "customer3@test.com",
    "role": "customer"
}

Login:
{"email": "customer1@test.com","password": "custpass"}
Response:
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYwMzY0NzI5LCJleHAiOjE3NjA5Njk1Mjl9.OkNqASt1tPisrBoxCjqlIAeqG4htakKEqG96i18-WYY",
    "user": {
        "id": 3,
        "name": "Customer 1",
        "email": "customer1@test.com",
        "role": "customer"
    }
}
