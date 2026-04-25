USE DryingManagementDB;
GO  
/* =========================
   PROCEDURE USAGE EXAMPLES
   Chạy các lệnh bên dưới khi cần test procedure.
   ========================= */

-- EXEC dbo.usp_GetDashboardSummary;
-- EXEC dbo.usp_GetMachineOverview;
-- EXEC dbo.usp_GetMachineOverview @BuildingId = N'BLD-001', @OnlyRunning = 1;
-- EXEC dbo.usp_GetMachineReadings @MachineId = N'MCH-001', @Top = 5;
-- EXEC dbo.usp_GetActiveAlerts;
-- EXEC dbo.usp_UpdateMachineControl @MachineId = N'MCH-002', @IsOn = 1, @FanLevel = 4, @Mode = N'automatic';
-- EXEC dbo.usp_ResolveAlert @AlertId = N'<alert-id-can-resolve>', @UserId = N'USR-ADMIN-001';
-- EXEC dbo.usp_ReportDeviceFailure @DeviceId = N'DEV-TH-001', @FailureType = N'SENSOR_TEST_ERROR', @Description = N'Test procedure báo lỗi thiết bị';
-- EXEC dbo.usp_ResolveDeviceFailure @FailureId = N'<failure-id-can-resolve>', @UserId = N'USR-ADMIN-001';
-- EXEC dbo.usp_AddSensorReading @DeviceId = N'DEV-TH-001', @MachineId = N'MCH-001', @Temp = 60.50, @Humidity = 34.20, @EnergyConsumption = 22.10, @Information = N'Test procedure thêm sensor reading';
-- EXEC dbo.usp_AddPrediction @ModelId = N'MDL-001', @MachineId = N'MCH-001', @ReadingId = N'RD-002', @PredictedValue = 170.00, @DurationMinutes = 120;

/* =========================
   SELECT DATA QUERIES
   ========================= */

-- 1) Kiểm tra số lượng dòng từng bảng.
SELECT N'Users' AS tableName, COUNT(*) AS totalRows FROM Users
UNION ALL SELECT N'Buildings', COUNT(*) FROM Buildings
UNION ALL SELECT N'FruitTypes', COUNT(*) FROM FruitTypes
UNION ALL SELECT N'Schedules', COUNT(*) FROM Schedules
UNION ALL SELECT N'ScheduleSteps', COUNT(*) FROM ScheduleSteps
UNION ALL SELECT N'Machines', COUNT(*) FROM Machines
UNION ALL SELECT N'Devices', COUNT(*) FROM Devices
UNION ALL SELECT N'SensorReadings', COUNT(*) FROM SensorReadings
UNION ALL SELECT N'MachineLogs', COUNT(*) FROM MachineLogs
UNION ALL SELECT N'Alerts', COUNT(*) FROM Alerts
UNION ALL SELECT N'DeviceFailures', COUNT(*) FROM DeviceFailures
UNION ALL SELECT N'ML_Models', COUNT(*) FROM ML_Models
UNION ALL SELECT N'Predictions', COUNT(*) FROM Predictions
UNION ALL SELECT N'SensorReadingModelUsage', COUNT(*) FROM SensorReadingModelUsage
UNION ALL SELECT N'ActivityLogs', COUNT(*) FROM ActivityLogs;
GO

-- 2) SELECT chi tiết từng bảng.
SELECT * FROM Users ORDER BY userId;
GO

SELECT * FROM Buildings ORDER BY buildingId;
GO

SELECT * FROM FruitTypes ORDER BY fruitTypeId;
GO

SELECT * FROM Schedules ORDER BY scheduleId;
GO

SELECT * FROM ScheduleSteps ORDER BY scheduleId, stepOrder;
GO

SELECT * FROM Machines ORDER BY machineId;
GO

SELECT * FROM Devices ORDER BY machineId, deviceType, deviceId;
GO

SELECT * FROM SensorReadings ORDER BY [timestamp] DESC, readingId;
GO

SELECT * FROM MachineLogs ORDER BY loggedAt DESC, machineLogId;
GO

SELECT * FROM Alerts ORDER BY createdAt DESC, alertId;
GO

SELECT * FROM DeviceFailures ORDER BY occurredAt DESC, failureId;
GO

SELECT * FROM ML_Models ORDER BY modelId;
GO

SELECT * FROM Predictions ORDER BY predictedAt DESC, predictionId;
GO

SELECT * FROM SensorReadingModelUsage ORDER BY usedAt DESC, usageId;
GO

SELECT * FROM ActivityLogs ORDER BY [timestamp] DESC, activityLogId;
GO

-- 3) Một số SELECT join dễ xem dữ liệu thực tế.
SELECT
    m.machineId,
    m.machineName,
    b.buildingName,
    b.location,
    u.fullName AS managerName,
    ft.fruitTypeName,
    s.scheduleName,
    m.isOn,
    m.isDoorOpen,
    m.mode,
    m.currentTemp,
    m.targetTempMin,
    m.targetTempMax,
    m.currentHumidity,
    m.targetHumidityMin,
    m.targetHumidityMax,
    m.fanLevel,
    m.heaterLevel,
    m.humidifierLevel,
    m.lastUpdate
FROM Machines m
INNER JOIN Buildings b ON m.buildingId = b.buildingId
INNER JOIN Users u ON m.managerUserId = u.userId
INNER JOIN Schedules s ON m.scheduleId = s.scheduleId
LEFT JOIN FruitTypes ft ON m.currentFruitType = ft.fruitTypeId
ORDER BY m.machineId;
GO

SELECT
    sr.readingId,
    sr.[timestamp],
    m.machineName,
    d.deviceName,
    sr.temp,
    sr.humidity,
    sr.energyConsumption,
    sr.information
FROM SensorReadings sr
INNER JOIN Machines m ON sr.machineId = m.machineId
INNER JOIN Devices d ON sr.deviceId = d.deviceId
ORDER BY sr.[timestamp] DESC, sr.readingId;
GO

SELECT
    a.alertId,
    a.createdAt,
    m.machineName,
    a.thresholdExceeded,
    a.message,
    a.isResolved,
    a.resolvedAt
FROM Alerts a
INNER JOIN Machines m ON a.machineId = m.machineId
ORDER BY a.createdAt DESC, a.alertId;
GO

SELECT
    df.failureId,
    df.occurredAt,
    m.machineName,
    d.deviceName,
    df.failureType,
    df.description,
    df.isResolved,
    df.resolvedAt,
    d.isActive AS currentDeviceActive
FROM DeviceFailures df
INNER JOIN Devices d ON df.deviceId = d.deviceId
INNER JOIN Machines m ON df.machineId = m.machineId
ORDER BY df.occurredAt DESC, df.failureId;
GO

SELECT
    p.predictionId,
    p.predictedAt,
    mdl.modelName,
    mdl.algorithm,
    m.machineName,
    sr.readingId,
    sr.temp,
    sr.humidity,
    p.predictedValue,
    p.durationMinutes
FROM Predictions p
INNER JOIN ML_Models mdl ON p.modelId = mdl.modelId
INNER JOIN Machines m ON p.machineId = m.machineId
INNER JOIN SensorReadings sr ON p.readingId = sr.readingId
ORDER BY p.predictedAt DESC, p.predictionId;
GO
