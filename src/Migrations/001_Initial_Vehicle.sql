CREATE TABLE Vehicles (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    VIN NVARCHAR(17) NOT NULL,
    Brand NVARCHAR(100),
    Model NVARCHAR(100),
    Version NVARCHAR(100),
    Year INT,
    Color NVARCHAR(50),
    BatteryCapacityKwh FLOAT,
    BatteryLevelPercentage INT,
    EstimatedRangeKm INT,
    OdometerKm INT,
    Status INT,
    CreatedAt DATETIME2,
    UpdatedAt DATETIME2
);
