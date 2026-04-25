DROP DATABASE IF EXISTS DryingManagementDB;
GO

CREATE DATABASE DryingManagementDB;
GO

USE DryingManagementDB;
GO

-- TABLE USERS
CREATE TABLE Users (
    userId NVARCHAR(50) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    passwordHash NVARCHAR(255) NOT NULL,
    firstName NVARCHAR(100) NOT NULL,
    lastName NVARCHAR(100) NOT NULL,
    fullName AS LTRIM(RTRIM(firstName + N' ' + lastName)) PERSISTED,
    email NVARCHAR(255) NULL UNIQUE CHECK (email LIKE N'%@%.%'),
    passwordResetToken NVARCHAR(255) NULL,
    passwordResetTokenExpiration DATETIME2 NULL,
    phoneNumber NVARCHAR(20) NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN (N'employee', N'admin'))
);
GO

-- TABLE BUILDINGS
CREATE TABLE Buildings (
    buildingId NVARCHAR(50) PRIMARY KEY,
    buildingName NVARCHAR(100) NOT NULL,
    location NVARCHAR(255) NOT NULL
);
GO

-- TABLE FRUIT TYPES
CREATE TABLE FruitTypes (
    fruitTypeId NVARCHAR(50) PRIMARY KEY,
    fruitTypeName NVARCHAR(100) NOT NULL,
    description NVARCHAR(255) NULL
);
GO

-- TABLE SCHEDULES
CREATE TABLE Schedules (
    scheduleId NVARCHAR(50) PRIMARY KEY,
    scheduleName NVARCHAR(100) NOT NULL,
    fruitTypeId NVARCHAR(50) NOT NULL,
    description NVARCHAR(255) NULL,
    durationMinutes INT NOT NULL CHECK (durationMinutes > 0),
    createdAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT fk_schedule_fruitType FOREIGN KEY (fruitTypeId) REFERENCES FruitTypes(fruitTypeId)
);
GO

-- TABLE SCHEDULE_STEPS
CREATE TABLE ScheduleSteps (
    stepId NVARCHAR(50) PRIMARY KEY,
    scheduleId NVARCHAR(50) NOT NULL,
    stepOrder INT NOT NULL CHECK (stepOrder > 0),
    durationMinutes INT NOT NULL CHECK (durationMinutes > 0),
    tempMin DECIMAL(5,2) NOT NULL,
    tempMax DECIMAL(5,2) NOT NULL,
    humidityMin DECIMAL(5,2) NOT NULL,
    humidityMax DECIMAL(5,2) NOT NULL,
    fanLevel INT NOT NULL CHECK (fanLevel BETWEEN 0 AND 5),
    heaterLevel INT NOT NULL CHECK (heaterLevel BETWEEN 0 AND 5),
    doorOpen BIT NOT NULL DEFAULT 0,
    CONSTRAINT uq_scheduleSteps_order UNIQUE (scheduleId, stepOrder),
    CONSTRAINT chk_scheduleSteps_temp CHECK (tempMin <= tempMax),
    CONSTRAINT chk_scheduleSteps_humidity CHECK (humidityMin <= humidityMax),
    CONSTRAINT fk_scheduleSteps_schedule FOREIGN KEY (scheduleId) REFERENCES Schedules(scheduleId)
);
GO

-- TABLE MACHINES
CREATE TABLE Machines (
    machineId NVARCHAR(50) PRIMARY KEY,
    machineName NVARCHAR(100) NOT NULL,
    buildingId NVARCHAR(50) NOT NULL,
    managerUserId NVARCHAR(50) NOT NULL,
    scheduleId NVARCHAR(50) NOT NULL,
    currentFruitType NVARCHAR(50) NULL,

    isOn BIT NOT NULL DEFAULT 0,
    isDoorOpen BIT NOT NULL DEFAULT 0,
    lastUpdate DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    currentTemp DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    targetTempMin DECIMAL(5,2) NOT NULL,
    targetTempMax DECIMAL(5,2) NOT NULL,

    currentHumidity DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    targetHumidityMin DECIMAL(5,2) NOT NULL,
    targetHumidityMax DECIMAL(5,2) NOT NULL,

    fanLevel INT NOT NULL DEFAULT 0 CHECK (fanLevel BETWEEN 0 AND 5),
    heaterLevel INT NOT NULL DEFAULT 0 CHECK (heaterLevel BETWEEN 0 AND 5),
    humidifierLevel INT NOT NULL DEFAULT 0 CHECK (humidifierLevel BETWEEN 0 AND 5),

    mode NVARCHAR(20) NOT NULL DEFAULT N'manual' CHECK (mode IN (N'manual', N'automatic')),
    position NVARCHAR(50) NULL,
    machineType NVARCHAR(50) NULL,

    CONSTRAINT chk_machine_temp CHECK (targetTempMin <= targetTempMax),
    CONSTRAINT chk_machine_humidity CHECK (targetHumidityMin <= targetHumidityMax),
    CONSTRAINT fk_machine_building FOREIGN KEY (buildingId) REFERENCES Buildings(buildingId),
    CONSTRAINT fk_machine_manager FOREIGN KEY (managerUserId) REFERENCES Users(userId),
    CONSTRAINT fk_machine_schedule FOREIGN KEY (scheduleId) REFERENCES Schedules(scheduleId),
    CONSTRAINT fk_machine_currentFruitType FOREIGN KEY (currentFruitType) REFERENCES FruitTypes(fruitTypeId)
);
GO

-- TABLE MACHINE_LOGS
CREATE TABLE MachineLogs (
    machineLogId NVARCHAR(50) PRIMARY KEY,
    machineId NVARCHAR(50) NOT NULL,
    buildingId NVARCHAR(50) NOT NULL,
    loggedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    temp DECIMAL(5,2) NOT NULL,
    humidity DECIMAL(5,2) NOT NULL,
    fanLevel INT NOT NULL CHECK (fanLevel BETWEEN 0 AND 5),
    isOn BIT NOT NULL,
    isDoorOpen BIT NOT NULL,
    mode NVARCHAR(20) NOT NULL CHECK (mode IN (N'manual', N'automatic')),
    CONSTRAINT fk_machineLog_machine FOREIGN KEY (machineId) REFERENCES Machines(machineId),
    CONSTRAINT fk_machineLog_building FOREIGN KEY (buildingId) REFERENCES Buildings(buildingId)
);
GO

-- TABLE ACTIVITY_LOGS
CREATE TABLE ActivityLogs (
    activityLogId NVARCHAR(50) PRIMARY KEY,
    userId NVARCHAR(50) NOT NULL,
    timestamp DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    username NVARCHAR(100) NOT NULL,
    userRole NVARCHAR(20) NOT NULL CHECK (userRole IN (N'employee', N'admin')),
    action NVARCHAR(255) NOT NULL,
    target NVARCHAR(255) NULL,
    details NVARCHAR(255) NULL,
    CONSTRAINT fk_activityLog_user FOREIGN KEY (userId) REFERENCES Users(userId)
);
GO

-- TABLE DEVICES
CREATE TABLE Devices (
    deviceId NVARCHAR(50) PRIMARY KEY,
    deviceName NVARCHAR(100) NOT NULL,
    machineId NVARCHAR(50) NOT NULL,
    deviceType NVARCHAR(50) NOT NULL,
    description NVARCHAR(255) NULL,
    isActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT fk_device_machine FOREIGN KEY (machineId) REFERENCES Machines(machineId)
);
GO

-- TABLE SENSOR_READINGS
CREATE TABLE SensorReadings (
    readingId NVARCHAR(50) PRIMARY KEY,
    deviceId NVARCHAR(50) NOT NULL,
    machineId NVARCHAR(50) NOT NULL,
    timestamp DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    temp DECIMAL(5,2) NOT NULL,
    humidity DECIMAL(5,2) NOT NULL,
    energyConsumption DECIMAL(10,2) NOT NULL,
    information NVARCHAR(255) NULL,
    CONSTRAINT fk_sensorReading_device FOREIGN KEY (deviceId) REFERENCES Devices(deviceId),
    CONSTRAINT fk_sensorReading_machine FOREIGN KEY (machineId) REFERENCES Machines(machineId)
);
GO

-- TABLE ALERTS
CREATE TABLE Alerts (
    alertId NVARCHAR(50) PRIMARY KEY,
    machineId NVARCHAR(50) NOT NULL,
    message NVARCHAR(255) NOT NULL,
    thresholdExceeded NVARCHAR(255) NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    isResolved BIT NOT NULL DEFAULT 0,
    resolvedAt DATETIME2 NULL,
    CONSTRAINT fk_alert_machine FOREIGN KEY (machineId) REFERENCES Machines(machineId)
);
GO

-- TABLE DEVICE_FAILURES
CREATE TABLE DeviceFailures (
    failureId NVARCHAR(50) PRIMARY KEY,
    deviceId NVARCHAR(50) NOT NULL,
    machineId NVARCHAR(50) NOT NULL,
    failureType NVARCHAR(100) NOT NULL,
    description NVARCHAR(255) NULL,
    occurredAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    isResolved BIT NOT NULL DEFAULT 0,
    resolvedAt DATETIME2 NULL,
    CONSTRAINT fk_deviceFailure_device FOREIGN KEY (deviceId) REFERENCES Devices(deviceId),
    CONSTRAINT fk_deviceFailure_machine FOREIGN KEY (machineId) REFERENCES Machines(machineId)
);
GO

-- TABLE ML_MODELS
CREATE TABLE ML_Models (
    modelId NVARCHAR(50) PRIMARY KEY,
    modelName NVARCHAR(100) NOT NULL,
    algorithm NVARCHAR(50) NOT NULL,
    accuracy DECIMAL(5,2) NULL CHECK (accuracy BETWEEN 0 AND 100),
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

-- TABLE ML_MODEL_PREDICTIONS
CREATE TABLE Predictions (
    predictionId NVARCHAR(50) PRIMARY KEY,
    modelId NVARCHAR(50) NOT NULL,
    machineId NVARCHAR(50) NOT NULL,
    readingId NVARCHAR(50) NOT NULL,
    predictedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    predictedValue DECIMAL(10,2) NOT NULL,
    durationMinutes INT NOT NULL CHECK (durationMinutes > 0),
    CONSTRAINT fk_prediction_model FOREIGN KEY (modelId) REFERENCES ML_Models(modelId),
    CONSTRAINT fk_prediction_machine FOREIGN KEY (machineId) REFERENCES Machines(machineId),
    CONSTRAINT fk_prediction_reading FOREIGN KEY (readingId) REFERENCES SensorReadings(readingId)
);
GO

-- TABLE SENSOR_READING_MODEL_USAGE
CREATE TABLE SensorReadingModelUsage (
    usageId NVARCHAR(50) PRIMARY KEY,
    readingId NVARCHAR(50) NOT NULL,
    modelId NVARCHAR(50) NOT NULL,
    usedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT uq_SensorReadingModelUsage UNIQUE (readingId, modelId),
    CONSTRAINT fk_usage_reading FOREIGN KEY (readingId) REFERENCES SensorReadings(readingId),
    CONSTRAINT fk_usage_model FOREIGN KEY (modelId) REFERENCES ML_Models(modelId)
);
GO