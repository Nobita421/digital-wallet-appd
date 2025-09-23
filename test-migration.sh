#!/bin/bash

echo "Starting migration testing..."

# Test Spring Boot backend
echo "Testing Spring Boot backend..."
cd digital-wallet-backend

# Run Spring Boot tests
mvn test

# Start Spring Boot application in background
mvn spring-boot:run &
SPRING_PID=$!

# Wait for Spring Boot to start
sleep 30

# Test API endpoints
echo "Testing API endpoints..."

# Test wallet endpoint
curl -X GET "http://localhost:8080/api/wallet?userId=1" \
  -H "Content-Type: application/json"

# Test transactions endpoint
curl -X GET "http://localhost:8080/api/transactions?userId=1&page=0&limit=10" \
  -H "Content-Type: application/json"

# Test transfer endpoint
curl -X POST "http://localhost:8080/api/transfers" \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": 1,
    "receiverId": 2,
    "amount": 100.00,
    "currency": "USD",
    "description": "Test transfer"
  }'

# Stop Spring Boot
kill $SPRING_PID

echo "Backend testing completed."

# Test Next.js frontend
echo "Testing Next.js frontend..."
cd ../digital_wallet_app

# Install dependencies
npm install

# Run Next.js tests
npm test

# Start Next.js in background
npm run dev &
NEXTJS_PID=$!

# Wait for Next.js to start
sleep 15

# Test frontend API routes
curl -X GET "http://localhost:3000/api/wallet?userId=1"
curl -X GET "http://localhost:3000/api/transactions?userId=1"

# Stop Next.js
kill $NEXTJS_PID

echo "Migration testing completed successfully!"