# PowerShell script to launch all EV Delivery services in separate windows
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting EV Delivery Management Platform Services       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$root = "D:\source\repos\EVDeliveryManagement"

# 1. Start Vehicle Service
Write-Host "Starting Vehicle Service on port 5001..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; Write-Host '--- Vehicle Service (5001) ---' -ForegroundColor Cyan; dotnet run --project src/Services/Vehicle/EVDelivery.Vehicle.API"

# 2. Start Customer Service
Write-Host "Starting Customer Service on port 5002..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; Write-Host '--- Customer Service (5002) ---' -ForegroundColor Cyan; dotnet run --project src/Services/Customer/EVDelivery.Customer.API"

# 3. Start Delivery Service
Write-Host "Starting Delivery Service on port 5003..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; Write-Host '--- Delivery Service (5003) ---' -ForegroundColor Cyan; dotnet run --project src/Services/Delivery/EVDelivery.Delivery.API"

# 4. Start YARP Gateway
Write-Host "Starting YARP API Gateway on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; Write-Host '--- YARP API Gateway (5000) ---' -ForegroundColor Cyan; dotnet run --project src/Gateway/EVDelivery.Gateway"

# 5. Start Frontend
Write-Host "Starting Frontend on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend\ev-delivery-web'; Write-Host '--- Frontend Vite (5173) ---' -ForegroundColor Cyan; npm run dev"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "All 5 processes have been launched in separate terminals!" -ForegroundColor Yellow
Write-Host "Frontend will be accessible at: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Gateway Swagger at:            http://localhost:5000/swagger" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
