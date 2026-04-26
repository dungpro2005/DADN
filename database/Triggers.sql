USE DryingManagementDB;
GO

-- 1) Dashboard tổng quan hệ thống.
CREATE OR ALTER PROCEDURE dbo.usp_GetDashboardSummary
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        (SELECT COUNT(*) FROM Users) AS totalUsers,
        (SELECT COUNT(*) FROM Buildings) AS totalBuildings,
        (SELECT COUNT(*) FROM Machines) AS totalMachines,
        (SELECT COUNT(*) FROM Machines WHERE isOn = 1) AS runningMachines,
        (SELECT COUNT(*) FROM Devices) AS totalDevices,
        (SELECT COUNT(*) FROM Devices WHERE isActive = 0) AS inactiveDevices,
        (SELECT COUNT(*) FROM Alerts WHERE isResolved = 0) AS activeAlerts,
        (SELECT COUNT(*) FROM DeviceFailures WHERE isResolved = 0) AS openFailures,
        (SELECT COUNT(*) FROM SensorReadings) AS totalSensorReadings,
        (SELECT COUNT(*) FROM Predictions) AS totalPredictions;
END;
GO

-- 2) Lấy danh sách máy kèm thông tin xưởng, quản lý, lịch sấy, loại trái cây và cảnh báo mở.
CREATE OR ALTER PROCEDURE dbo.usp_GetMachineOverview
    @BuildingId NVARCHAR(50) = NULL,
    @OnlyRunning BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        m.machineId,
        m.machineName,
        b.buildingName,
        b.location,
        u.fullName AS managerName,
        u.username AS managerUsername,
        ft.fruitTypeName AS currentFruitName,
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
        m.position,
        m.machineType,
        latestReading.timestamp AS latestReadingAt,
        latestReading.energyConsumption AS latestEnergyConsumption,
        ISNULL(activeAlerts.activeAlertCount, 0) AS activeAlertCount
    FROM Machines m
    INNER JOIN Buildings b ON m.buildingId = b.buildingId
    INNER JOIN Users u ON m.managerUserId = u.userId
    INNER JOIN Schedules s ON m.scheduleId = s.scheduleId
    LEFT JOIN FruitTypes ft ON m.currentFruitType = ft.fruitTypeId
    OUTER APPLY (
        SELECT TOP 1 sr.timestamp, sr.energyConsumption
        FROM SensorReadings sr
        WHERE sr.machineId = m.machineId
        ORDER BY sr.timestamp DESC, sr.readingId DESC
    ) latestReading
    OUTER APPLY (
        SELECT COUNT(*) AS activeAlertCount
        FROM Alerts a
        WHERE a.machineId = m.machineId
          AND a.isResolved = 0
    ) activeAlerts
    WHERE (@BuildingId IS NULL OR m.buildingId = @BuildingId)
      AND (@OnlyRunning IS NULL OR m.isOn = @OnlyRunning)
    ORDER BY b.buildingName, m.machineName;
END;
GO

-- 3) Lấy lịch sử sensor readings của một máy.
CREATE OR ALTER PROCEDURE dbo.usp_GetMachineReadings
    @MachineId NVARCHAR(50),
    @FromTime DATETIME2 = NULL,
    @ToTime DATETIME2 = NULL,
    @Top INT = 50
AS
BEGIN
    SET NOCOUNT ON;

    IF @Top IS NULL OR @Top <= 0 SET @Top = 50;

    IF NOT EXISTS (SELECT 1 FROM Machines WHERE machineId = @MachineId)
    BEGIN
        THROW 50010, N'MachineId không tồn tại.', 1;
    END;

    SELECT TOP (@Top)
        sr.readingId,
        sr.machineId,
        m.machineName,
        sr.deviceId,
        d.deviceName,
        sr.timestamp,
        sr.temp,
        sr.humidity,
        sr.energyConsumption,
        sr.information
    FROM SensorReadings sr
    INNER JOIN Machines m ON sr.machineId = m.machineId
    INNER JOIN Devices d ON sr.deviceId = d.deviceId
    WHERE sr.machineId = @MachineId
      AND (@FromTime IS NULL OR sr.timestamp >= @FromTime)
      AND (@ToTime IS NULL OR sr.timestamp <= @ToTime)
    ORDER BY sr.timestamp DESC, sr.readingId DESC;
END;
GO

-- 4) Thêm sensor reading. Trigger sẽ tự cập nhật Machines, MachineLogs và Alerts nếu vượt ngưỡng.
CREATE OR ALTER PROCEDURE dbo.usp_AddSensorReading
    @ReadingId NVARCHAR(50) = NULL OUTPUT,
    @DeviceId NVARCHAR(50),
    @MachineId NVARCHAR(50),
    @Temp DECIMAL(5,2),
    @Humidity DECIMAL(5,2),
    @EnergyConsumption DECIMAL(10,2),
    @Information NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @ReadingId IS NULL
    BEGIN
        SET @ReadingId = N'RD-' + REPLACE(CONVERT(NVARCHAR(36), NEWID()), N'-', N'');
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM Devices
        WHERE deviceId = @DeviceId
          AND machineId = @MachineId
    )
    BEGIN
        THROW 50011, N'DeviceId không tồn tại hoặc không thuộc MachineId đã truyền vào.', 1;
    END;

    INSERT INTO SensorReadings (
        readingId, deviceId, machineId, timestamp, temp, humidity, energyConsumption, information
    )
    VALUES (
        @ReadingId, @DeviceId, @MachineId, SYSDATETIME(), @Temp, @Humidity, @EnergyConsumption, @Information
    );

    SELECT *
    FROM SensorReadings
    WHERE readingId = @ReadingId;
END;
GO

-- 5) Cập nhật trạng thái điều khiển máy. Trigger sẽ tự ghi MachineLogs và cảnh báo cửa mở khi máy đang bật.
CREATE OR ALTER PROCEDURE dbo.usp_UpdateMachineControl
    @MachineId NVARCHAR(50),
    @IsOn BIT = NULL,
    @IsDoorOpen BIT = NULL,
    @FanLevel INT = NULL,
    @HeaterLevel INT = NULL,
    @HumidifierLevel INT = NULL,
    @Mode NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Machines WHERE machineId = @MachineId)
    BEGIN
        THROW 50012, N'MachineId không tồn tại.', 1;
    END;

    IF @FanLevel IS NOT NULL AND (@FanLevel < 0 OR @FanLevel > 3)
    BEGIN
        THROW 50013, N'FanLevel phải nằm trong khoảng 0 đến 3.', 1;
    END;

    IF @HeaterLevel IS NOT NULL AND (@HeaterLevel < 0 OR @HeaterLevel > 5)
    BEGIN
        THROW 50014, N'HeaterLevel phải nằm trong khoảng 0 đến 5.', 1;
    END;

    IF @HumidifierLevel IS NOT NULL AND (@HumidifierLevel < 0 OR @HumidifierLevel > 5)
    BEGIN
        THROW 50015, N'HumidifierLevel phải nằm trong khoảng 0 đến 5.', 1;
    END;

    IF @Mode IS NOT NULL AND @Mode NOT IN (N'manual', N'automatic')
    BEGIN
        THROW 50016, N'Mode chỉ được là manual hoặc automatic.', 1;
    END;

    UPDATE Machines
    SET
        isOn = COALESCE(@IsOn, isOn),
        isDoorOpen = COALESCE(@IsDoorOpen, isDoorOpen),
        fanLevel = COALESCE(@FanLevel, fanLevel),
        heaterLevel = COALESCE(@HeaterLevel, heaterLevel),
        humidifierLevel = COALESCE(@HumidifierLevel, humidifierLevel),
        mode = COALESCE(@Mode, mode),
        lastUpdate = SYSDATETIME()
    WHERE machineId = @MachineId;

    SELECT *
    FROM Machines
    WHERE machineId = @MachineId;
END;
GO

-- 6) Lấy danh sách cảnh báo đang mở hoặc lọc theo máy / loại ngưỡng.
CREATE OR ALTER PROCEDURE dbo.usp_GetActiveAlerts
    @MachineId NVARCHAR(50) = NULL,
    @ThresholdExceeded NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        a.alertId,
        a.machineId,
        m.machineName,
        b.buildingName,
        a.message,
        a.thresholdExceeded,
        a.createdAt,
        a.isResolved,
        a.resolvedAt
    FROM Alerts a
    INNER JOIN Machines m ON a.machineId = m.machineId
    INNER JOIN Buildings b ON m.buildingId = b.buildingId
    WHERE a.isResolved = 0
      AND (@MachineId IS NULL OR a.machineId = @MachineId)
      AND (@ThresholdExceeded IS NULL OR a.thresholdExceeded = @ThresholdExceeded)
    ORDER BY a.createdAt DESC, a.alertId DESC;
END;
GO

-- 7) Resolve cảnh báo và ghi ActivityLogs nếu truyền UserId hợp lệ.
CREATE OR ALTER PROCEDURE dbo.usp_ResolveAlert
    @AlertId NVARCHAR(50),
    @UserId NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Alerts WHERE alertId = @AlertId)
    BEGIN
        THROW 50017, N'AlertId không tồn tại.', 1;
    END;

    UPDATE Alerts
    SET isResolved = 1
    WHERE alertId = @AlertId;

    IF @UserId IS NOT NULL AND EXISTS (SELECT 1 FROM Users WHERE userId = @UserId)
    BEGIN
        INSERT INTO ActivityLogs (activityLogId, userId, username, userRole, action, target, details)
        SELECT
            N'ACT-' + REPLACE(CONVERT(NVARCHAR(36), NEWID()), N'-', N''),
            u.userId,
            u.username,
            u.role,
            N'RESOLVE_ALERT',
            @AlertId,
            N'Đánh dấu cảnh báo đã xử lý'
        FROM Users u
        WHERE u.userId = @UserId;
    END;

    SELECT *
    FROM Alerts
    WHERE alertId = @AlertId;
END;
GO

-- 8) Ghi nhận lỗi thiết bị. Trigger sẽ tự tắt thiết bị và tạo Alerts.
CREATE OR ALTER PROCEDURE dbo.usp_ReportDeviceFailure
    @FailureId NVARCHAR(50) = NULL OUTPUT,
    @DeviceId NVARCHAR(50),
    @FailureType NVARCHAR(100),
    @Description NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MachineId NVARCHAR(50);

    SELECT @MachineId = machineId
    FROM Devices
    WHERE deviceId = @DeviceId;

    IF @MachineId IS NULL
    BEGIN
        THROW 50018, N'DeviceId không tồn tại.', 1;
    END;

    IF @FailureId IS NULL
    BEGIN
        SET @FailureId = N'FAIL-' + REPLACE(CONVERT(NVARCHAR(36), NEWID()), N'-', N'');
    END;

    INSERT INTO DeviceFailures (
        failureId, deviceId, machineId, failureType, description, occurredAt, isResolved
    )
    VALUES (
        @FailureId, @DeviceId, @MachineId, @FailureType, @Description, SYSDATETIME(), 0
    );

    SELECT *
    FROM DeviceFailures
    WHERE failureId = @FailureId;
END;
GO

-- 9) Resolve lỗi thiết bị và ghi ActivityLogs nếu truyền UserId hợp lệ.
CREATE OR ALTER PROCEDURE dbo.usp_ResolveDeviceFailure
    @FailureId NVARCHAR(50),
    @UserId NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM DeviceFailures WHERE failureId = @FailureId)
    BEGIN
        THROW 50019, N'FailureId không tồn tại.', 1;
    END;

    UPDATE DeviceFailures
    SET isResolved = 1
    WHERE failureId = @FailureId;

    IF @UserId IS NOT NULL AND EXISTS (SELECT 1 FROM Users WHERE userId = @UserId)
    BEGIN
        INSERT INTO ActivityLogs (activityLogId, userId, username, userRole, action, target, details)
        SELECT
            N'ACT-' + REPLACE(CONVERT(NVARCHAR(36), NEWID()), N'-', N''),
            u.userId,
            u.username,
            u.role,
            N'RESOLVE_DEVICE_FAILURE',
            @FailureId,
            N'Đánh dấu lỗi thiết bị đã xử lý'
        FROM Users u
        WHERE u.userId = @UserId;
    END;

    SELECT
        df.*,
        d.deviceName,
        d.isActive AS currentDeviceActiveStatus
    FROM DeviceFailures df
    INNER JOIN Devices d ON df.deviceId = d.deviceId
    WHERE df.failureId = @FailureId;
END;
GO

-- 10) Thêm prediction. Trigger sẽ tự thêm SensorReadingModelUsage.
CREATE OR ALTER PROCEDURE dbo.usp_AddPrediction
    @PredictionId NVARCHAR(50) = NULL OUTPUT,
    @ModelId NVARCHAR(50),
    @MachineId NVARCHAR(50),
    @ReadingId NVARCHAR(50),
    @PredictedValue DECIMAL(10,2),
    @DurationMinutes INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @PredictionId IS NULL
    BEGIN
        SET @PredictionId = N'PRED-' + REPLACE(CONVERT(NVARCHAR(36), NEWID()), N'-', N'');
    END;

    IF @DurationMinutes <= 0
    BEGIN
        THROW 50020, N'DurationMinutes phải lớn hơn 0.', 1;
    END;

    IF NOT EXISTS (SELECT 1 FROM ML_Models WHERE modelId = @ModelId AND isActive = 1)
    BEGIN
        THROW 50021, N'ModelId không tồn tại hoặc model không active.', 1;
    END;

    IF NOT EXISTS (SELECT 1 FROM Machines WHERE machineId = @MachineId)
    BEGIN
        THROW 50022, N'MachineId không tồn tại.', 1;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM SensorReadings
        WHERE readingId = @ReadingId
          AND machineId = @MachineId
    )
    BEGIN
        THROW 50023, N'ReadingId không tồn tại hoặc không thuộc MachineId đã truyền vào.', 1;
    END;

    INSERT INTO Predictions (
        predictionId, modelId, machineId, readingId, predictedAt, predictedValue, durationMinutes
    )
    VALUES (
        @PredictionId, @ModelId, @MachineId, @ReadingId, SYSDATETIME(), @PredictedValue, @DurationMinutes
    );

    SELECT *
    FROM Predictions
    WHERE predictionId = @PredictionId;
END;
GO