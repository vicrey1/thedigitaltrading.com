# Test car creation with PowerShell

$API_URL = "http://localhost:5001/api/cars"
$ADMIN_TOKEN = $env:TEST_ADMIN_TOKEN -or "your-admin-token-here"

Write-Host "[TEST] Testing car creation..."
Write-Host "[TEST] API URL: $API_URL"

# Create a minimal test image file
$testImagePath = "test-image.jpg"
$jpegHeader = @(0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01)
[byte[]]$bytes = $jpegHeader
[System.IO.File]::WriteAllBytes($testImagePath, $bytes)
Write-Host "[TEST] Created test image: $testImagePath"

# Prepare the multipart form data
$multipartContent = [System.Net.Http.MultipartFormDataContent]::new()

# Add text fields
$multipartContent.Add([System.Net.Http.StringContent]::new("Test Lamborghini Urus 2021"), "title")
$multipartContent.Add([System.Net.Http.StringContent]::new("A high-performance luxury SUV for testing"), "description")
$multipartContent.Add([System.Net.Http.StringContent]::new("300000"), "price")
$multipartContent.Add([System.Net.Http.StringContent]::new("450000"), "originalPrice")
$multipartContent.Add([System.Net.Http.StringContent]::new("LAMBORGHINI"), "make")
$multipartContent.Add([System.Net.Http.StringContent]::new("URUS"), "model")
$multipartContent.Add([System.Net.Http.StringContent]::new("2021"), "year")
$multipartContent.Add([System.Net.Http.StringContent]::new("25000"), "mileage")
$multipartContent.Add([System.Net.Http.StringContent]::new("gasoline"), "fuelType")
$multipartContent.Add([System.Net.Http.StringContent]::new("automatic"), "transmission")
$multipartContent.Add([System.Net.Http.StringContent]::new("suv"), "bodyType")
$multipartContent.Add([System.Net.Http.StringContent]::new("4WD"), "drivetrain")
$multipartContent.Add([System.Net.Http.StringContent]::new("ORANGE"), "color")
$multipartContent.Add([System.Net.Http.StringContent]::new("excellent"), "condition")
$multipartContent.Add([System.Net.Http.StringContent]::new("NEW YORK"), "location")
$multipartContent.Add([System.Net.Http.StringContent]::new("Air Conditioning"), "features")
$multipartContent.Add([System.Net.Http.StringContent]::new("Bluetooth"), "features")
$multipartContent.Add([System.Net.Http.StringContent]::new("GPS Navigation"), "features")
$multipartContent.Add([System.Net.Http.StringContent]::new("false"), "isFeatured")
$multipartContent.Add([System.Net.Http.StringContent]::new("true"), "isAvailable")
$multipartContent.Add([System.Net.Http.StringContent]::new("+1 28967548765"), "contactPhone")
$multipartContent.Add([System.Net.Http.StringContent]::new("test@example.com"), "contactEmail")

# Add file
$fileStream = [System.IO.File]::OpenRead($testImagePath)
$fileContent = [System.Net.Http.StreamContent]::new($fileStream)
$fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("image/jpeg")
$multipartContent.Add($fileContent, "images", (Split-Path $testImagePath -Leaf))

# Create HTTP client
$httpClient = [System.Net.Http.HttpClient]::new()
$httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer $ADMIN_TOKEN")

try {
    Write-Host "[TEST] Sending request..."
    $response = $httpClient.PostAsync($API_URL, $multipartContent).Result
    
    Write-Host "[TEST] Response Status: $($response.StatusCode)"
    
    if ($response.IsSuccessStatusCode) {
        Write-Host "[TEST] ✓ Car created successfully!"
        $content = $response.Content.ReadAsStringAsync().Result
        Write-Host "[TEST] Response: $content"
    } else {
        Write-Host "[TEST] ✗ Car creation failed!"
        $errorContent = $response.Content.ReadAsStringAsync().Result
        Write-Host "[TEST] Error: $errorContent"
    }
} catch {
    Write-Host "[TEST] ✗ Exception: $_"
} finally {
    $fileStream.Dispose()
    $multipartContent.Dispose()
    $httpClient.Dispose()
    
    # Clean up test image
    Remove-Item $testImagePath -Force -ErrorAction SilentlyContinue
    Write-Host "[TEST] Test completed"
}
