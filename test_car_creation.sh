#!/bin/bash

# Test car creation via direct HTTP request
# Usage: Set TEST_ADMIN_TOKEN environment variable before running

API_URL="http://localhost:5001/api/cars"
ADMIN_TOKEN="${TEST_ADMIN_TOKEN:-your-admin-token-here}"

echo "[TEST] Testing car creation..."
echo "[TEST] API URL: $API_URL"
echo "[TEST] Token: ${ADMIN_TOKEN:0:20}..."

# Create a minimal test image
dd if=/dev/zero bs=1 count=100 of=test-image.jpg 2>/dev/null
echo "[TEST] Created test image"

# Send multipart request
curl -X POST "$API_URL" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "title=Test Lamborghini Urus 2021" \
  -F "description=A high-performance luxury SUV for testing" \
  -F "price=300000" \
  -F "originalPrice=450000" \
  -F "make=LAMBORGHINI" \
  -F "model=URUS" \
  -F "year=2021" \
  -F "mileage=25000" \
  -F "fuelType=gasoline" \
  -F "transmission=automatic" \
  -F "bodyType=suv" \
  -F "drivetrain=4WD" \
  -F "color=ORANGE" \
  -F "condition=excellent" \
  -F "location=NEW YORK" \
  -F "features=Air Conditioning" \
  -F "features=Bluetooth" \
  -F "features=GPS Navigation" \
  -F "isFeatured=false" \
  -F "isAvailable=true" \
  -F "contactPhone=+1 28967548765" \
  -F "contactEmail=test@example.com" \
  -F "images=@test-image.jpg" \
  -w "\n[TEST] HTTP Status: %{http_code}\n" \
  -s | tee test-car-response.json

echo "[TEST] Response saved to test-car-response.json"
rm -f test-image.jpg
