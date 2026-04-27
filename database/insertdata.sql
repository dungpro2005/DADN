USE DryingManagementDB;
GO

INSERT INTO Users (userId, username, passwordHash, firstName, lastName, email, phoneNumber, role)
VALUES
(N'USR-ADMIN-001', N'admin01', N'$2a$10$mocked_hash_admin_001', N'Nguyễn', N'An', N'an.nguyen@example.com', N'0901000001', N'admin'),
(N'USR-EMP-001', N'employee01', N'$2a$10$mocked_hash_employee_001', N'Trần', N'Bình', N'binh.tran@example.com', N'0901000002', N'employee'),
(N'USR-EMP-002', N'employee02', N'$2a$10$mocked_hash_employee_002', N'Lê', N'Chi', N'chi.le@example.com', N'0901000003', N'employee'),
(N'USR-EMP-003', N'employee03', N'$2a$10$mocked_hash_employee_003', N'Phạm', N'Dũng', N'dung.pham@example.com', N'0901000004', N'employee'),
(N'USR-ADMIN-002', N'admin02', N'$2a$10$mocked_hash_admin_002', N'Võ', N'Hạnh', N'hanh.vo@example.com', N'0901000005', N'admin'),
(N'USR-EMP-004', N'employee04', N'$2a$10$mocked_hash_employee_004', N'Đỗ', N'Khoa', N'khoa.do@example.com', N'0901000006', N'employee');
GO

INSERT INTO Buildings (buildingId, buildingName, location)
VALUES
(N'BLD-001', N'Xưởng sấy A', N'Khu công nghiệp Long Hậu, Long An'),
(N'BLD-002', N'Xưởng sấy B', N'Khu công nghiệp Tân Bình, TP.HCM'),
(N'BLD-003', N'Kho thử nghiệm R&D', N'Quận 9, TP.HCM'),
(N'BLD-004', N'Xưởng sấy C', N'Khu công nghiệp VSIP, Bình Dương'),
(N'BLD-005', N'Kho thành phẩm', N'Huyện Củ Chi, TP.HCM');
GO

INSERT INTO FruitTypes (fruitTypeId, fruitTypeName, description)
VALUES
(N'FT-MANGO', N'Xoài', N'Quy trình sấy xoài lát dẻo'),
(N'FT-BANANA', N'Chuối', N'Quy trình sấy chuối giòn/dẻo'),
(N'FT-DRAGON', N'Thanh long', N'Quy trình sấy thanh long cắt lát'),
(N'FT-PINEAPPLE', N'Dứa', N'Quy trình sấy dứa lát'),
(N'FT-LONGAN', N'Nhãn', N'Quy trình sấy nhãn nguyên cùi');
GO

INSERT INTO Schedules (scheduleId, scheduleName, fruitTypeId, description, durationMinutes)
VALUES
(N'SCH-MANGO-STD', N'Xoài tiêu chuẩn', N'FT-MANGO', N'Sấy xoài lát ở nhiệt độ trung bình, giữ độ dẻo', 720),
(N'SCH-BANANA-LOW', N'Chuối nhiệt thấp', N'FT-BANANA', N'Sấy chuối ở nhiệt thấp để giữ màu', 600),
(N'SCH-DRAGON-STD', N'Thanh long tiêu chuẩn', N'FT-DRAGON', N'Sấy thanh long cắt lát mỏng', 480),
(N'SCH-PINEAPPLE-STD', N'Dứa tiêu chuẩn', N'FT-PINEAPPLE', N'Sấy dứa lát, độ ẩm đầu ra thấp', 540),
(N'SCH-LONGAN-STD', N'Nhãn tiêu chuẩn', N'FT-LONGAN', N'Sấy nhãn giữ mùi thơm tự nhiên', 660);
GO

INSERT INTO ScheduleSteps (stepId, scheduleId, stepOrder, durationMinutes, tempMin, tempMax, humidityMin, humidityMax, fanLevel, heaterLevel, doorOpen)
VALUES
-- Mango: total 720
(N'STEP-MANGO-001', N'SCH-MANGO-STD', 1, 120, 45.00, 50.00, 45.00, 55.00, 2, 2, 0),
(N'STEP-MANGO-002', N'SCH-MANGO-STD', 2, 360, 58.00, 62.00, 30.00, 40.00, 4, 4, 0),
(N'STEP-MANGO-003', N'SCH-MANGO-STD', 3, 240, 52.00, 56.00, 25.00, 35.00, 3, 3, 0),
-- Banana: total 600
(N'STEP-BANANA-001', N'SCH-BANANA-LOW', 1, 180, 42.00, 48.00, 45.00, 55.00, 2, 2, 0),
(N'STEP-BANANA-002', N'SCH-BANANA-LOW', 2, 300, 50.00, 55.00, 32.00, 42.00, 3, 3, 0),
(N'STEP-BANANA-003', N'SCH-BANANA-LOW', 3, 120, 48.00, 52.00, 28.00, 36.00, 3, 2, 0),
-- Dragon fruit: total 480
(N'STEP-DRAGON-001', N'SCH-DRAGON-STD', 1, 120, 45.00, 50.00, 50.00, 60.00, 2, 2, 0),
(N'STEP-DRAGON-002', N'SCH-DRAGON-STD', 2, 240, 55.00, 60.00, 35.00, 45.00, 4, 4, 0),
(N'STEP-DRAGON-003', N'SCH-DRAGON-STD', 3, 120, 50.00, 55.00, 30.00, 38.00, 3, 3, 0),
-- Pineapple: total 540
(N'STEP-PINE-001', N'SCH-PINEAPPLE-STD', 1, 120, 44.00, 50.00, 45.00, 55.00, 2, 2, 0),
(N'STEP-PINE-002', N'SCH-PINEAPPLE-STD', 2, 300, 57.00, 63.00, 28.00, 38.00, 4, 4, 0),
(N'STEP-PINE-003', N'SCH-PINEAPPLE-STD', 3, 120, 52.00, 56.00, 25.00, 32.00, 3, 3, 0),
-- Longan: total 660
(N'STEP-LONGAN-001', N'SCH-LONGAN-STD', 1, 180, 45.00, 52.00, 45.00, 55.00, 2, 2, 0),
(N'STEP-LONGAN-002', N'SCH-LONGAN-STD', 2, 360, 60.00, 65.00, 25.00, 35.00, 4, 4, 0),
(N'STEP-LONGAN-003', N'SCH-LONGAN-STD', 3, 120, 55.00, 60.00, 22.00, 30.00, 3, 3, 0);
GO

INSERT INTO Machines (
    machineId, machineName, buildingId, managerUserId, scheduleId, currentFruitType,
    isOn, isDoorOpen, currentTemp, targetTempMin, targetTempMax,
    currentHumidity, targetHumidityMin, targetHumidityMax,
    fanLevel, heaterLevel, humidifierLevel, mode, position, machineType
)
VALUES
(N'MCH-001', N'Máy sấy xoài 01', N'BLD-001', N'USR-EMP-001', N'SCH-MANGO-STD', N'FT-MANGO', 1, 0, 59.00, 58.00, 62.00, 35.00, 30.00, 40.00, 1, 4, 1, N'automatic', N'A-01', N'Heat Pump'),
(N'MCH-002', N'Máy sấy chuối 01', N'BLD-001', N'USR-EMP-002', N'SCH-BANANA-LOW', N'FT-BANANA', 1, 0, 52.00, 50.00, 55.00, 37.00, 32.00, 42.00, 3, 3, 1, N'automatic', N'A-02', N'Convection'),
(N'MCH-003', N'Máy sấy thanh long 01', N'BLD-002', N'USR-EMP-003', N'SCH-DRAGON-STD', N'FT-DRAGON', 1, 0, 56.00, 55.00, 60.00, 40.00, 35.00, 45.00, 2, 3, 1, N'automatic', N'B-01', N'Heat Pump'),
(N'MCH-004', N'Máy sấy dứa 01', N'BLD-002', N'USR-EMP-001', N'SCH-PINEAPPLE-STD', N'FT-PINEAPPLE', 1, 0, 60.00, 57.00, 63.00, 33.00, 28.00, 38.00, 3, 4, 1, N'manual', N'B-02', N'Hybrid'),
(N'MCH-005', N'Máy sấy nhãn thử nghiệm', N'BLD-003', N'USR-EMP-002', N'SCH-LONGAN-STD', N'FT-LONGAN', 0, 0, 27.00, 60.00, 65.00, 65.00, 25.00, 35.00, 0, 0, 0, N'manual', N'R&D-01', N'Prototype');
GO

INSERT INTO Devices (deviceId, deviceName, machineId, deviceType, description, isActive)
VALUES
(N'DEV-TH-001', N'Cảm biến nhiệt ẩm MCH-001', N'MCH-001', N'TEMP_HUMIDITY_SENSOR', N'Đo nhiệt độ và độ ẩm buồng sấy', 1),
(N'DEV-FAN-001', N'Quạt tuần hoàn MCH-001', N'MCH-001', N'FAN', N'Điều khiển lưu lượng gió', 1),
(N'DEV-HEATER-001', N'Bộ gia nhiệt MCH-001', N'MCH-001', N'HEATER', N'Gia nhiệt buồng sấy', 1),
(N'DEV-TH-002', N'Cảm biến nhiệt ẩm MCH-002', N'MCH-002', N'TEMP_HUMIDITY_SENSOR', N'Đo nhiệt độ và độ ẩm buồng sấy', 1),
(N'DEV-FAN-002', N'Quạt tuần hoàn MCH-002', N'MCH-002', N'FAN', N'Điều khiển lưu lượng gió', 1),
(N'DEV-TH-003', N'Cảm biến nhiệt ẩm MCH-003', N'MCH-003', N'TEMP_HUMIDITY_SENSOR', N'Đo nhiệt độ và độ ẩm buồng sấy', 1),
(N'DEV-HEATER-003', N'Bộ gia nhiệt MCH-003', N'MCH-003', N'HEATER', N'Gia nhiệt buồng sấy', 1),
(N'DEV-TH-004', N'Cảm biến nhiệt ẩm MCH-004', N'MCH-004', N'TEMP_HUMIDITY_SENSOR', N'Đo nhiệt độ và độ ẩm buồng sấy', 1),
(N'DEV-TH-005', N'Cảm biến nhiệt ẩm MCH-005', N'MCH-005', N'TEMP_HUMIDITY_SENSOR', N'Đo nhiệt độ và độ ẩm buồng sấy', 1);
GO

-- Trigger trg_SensorReadings_AfterInsert sẽ tự cập nhật Machines, tạo MachineLogs và Alerts nếu vượt ngưỡng.
INSERT INTO SensorReadings (readingId, deviceId, machineId, timestamp, temp, humidity, energyConsumption, information)
VALUES
(N'RD-001', N'DEV-TH-001', N'MCH-001', DATEADD(MINUTE, -90, SYSDATETIME()), 59.40, 35.20, 18.50, N'Ổn định trong ngưỡng'),
(N'RD-002', N'DEV-TH-001', N'MCH-001', DATEADD(MINUTE, -30, SYSDATETIME()), 64.20, 29.10, 31.80, N'Nhiệt cao, độ ẩm thấp, điện năng cao'),
(N'RD-003', N'DEV-TH-002', N'MCH-002', DATEADD(MINUTE, -75, SYSDATETIME()), 52.10, 36.50, 15.20, N'Ổn định trong ngưỡng'),
(N'RD-004', N'DEV-TH-002', N'MCH-002', DATEADD(MINUTE, -20, SYSDATETIME()), 48.60, 45.30, 14.90, N'Nhiệt thấp, độ ẩm cao'),
(N'RD-005', N'DEV-TH-003', N'MCH-003', DATEADD(MINUTE, -70, SYSDATETIME()), 57.20, 39.00, 17.00, N'Ổn định trong ngưỡng'),
(N'RD-006', N'DEV-TH-003', N'MCH-003', DATEADD(MINUTE, -10, SYSDATETIME()), 61.10, 46.80, 19.40, N'Nhiệt và độ ẩm cao'),
(N'RD-007', N'DEV-TH-004', N'MCH-004', DATEADD(MINUTE, -60, SYSDATETIME()), 60.30, 32.50, 20.50, N'Ổn định trong ngưỡng'),
(N'RD-008', N'DEV-TH-004', N'MCH-004', DATEADD(MINUTE, -15, SYSDATETIME()), 58.10, 26.80, 21.00, N'Độ ẩm thấp'),
(N'RD-009', N'DEV-TH-005', N'MCH-005', DATEADD(MINUTE, -40, SYSDATETIME()), 28.00, 64.50, 2.20, N'Máy đang tắt, số đo môi trường'),
(N'RD-010', N'DEV-TH-005', N'MCH-005', DATEADD(MINUTE, -5, SYSDATETIME()), 60.50, 33.20, 16.20, N'Chạy thử sau khi bật máy');
GO

-- Trigger trg_Machines_AfterUpdate sẽ tự ghi log và tạo alert nếu cửa mở khi máy đang bật.
UPDATE Machines
SET isDoorOpen = 1, lastUpdate = SYSDATETIME()
WHERE machineId = N'MCH-004';
GO

UPDATE Machines
SET isDoorOpen = 0, mode = N'automatic', lastUpdate = SYSDATETIME()
WHERE machineId = N'MCH-004';
GO

INSERT INTO ActivityLogs (activityLogId, userId, username, userRole, action, target, details)
VALUES
(N'ACT-001', N'USR-ADMIN-001', N'admin01', N'admin', N'CREATE_SCHEDULE', N'SCH-MANGO-STD', N'Tạo lịch sấy xoài tiêu chuẩn'),
(N'ACT-002', N'USR-EMP-001', N'employee01', N'employee', N'UPDATE_MACHINE_MODE', N'MCH-004', N'Chuyển máy dứa sang automatic'),
(N'ACT-003', N'USR-EMP-002', N'employee02', N'employee', N'CHECK_SENSOR', N'DEV-TH-005', N'Kiểm tra cảm biến ở máy thử nghiệm'),
(N'ACT-004', N'USR-ADMIN-001', N'admin01', N'admin', N'REVIEW_ALERTS', N'Alerts', N'Rà soát các cảnh báo vượt ngưỡng'),
(N'ACT-005', N'USR-ADMIN-002', N'admin02', N'admin', N'CREATE_USER', N'USR-EMP-004', N'Tạo tài khoản nhân viên mới'),
(N'ACT-006', N'USR-EMP-004', N'employee04', N'employee', N'INSPECT_MACHINE', N'MCH-002', N'Kiểm tra nhanh tình trạng máy sấy chuối');
GO

-- Trigger trg_DeviceFailures_AfterInsert sẽ tắt thiết bị và tạo alert.
INSERT INTO DeviceFailures (failureId, deviceId, machineId, failureType, description, occurredAt, isResolved)
VALUES
(N'FAIL-001', N'DEV-FAN-001', N'MCH-001', N'FAN_SPEED_DROP', N'Tốc độ quạt thấp hơn cấu hình trong 5 phút', DATEADD(MINUTE, -25, SYSDATETIME()), 0),
(N'FAIL-002', N'DEV-HEATER-003', N'MCH-003', N'HEATER_OVERLOAD', N'Dòng điện bộ gia nhiệt tăng bất thường', DATEADD(MINUTE, -12, SYSDATETIME()), 0),
(N'FAIL-003', N'DEV-TH-002', N'MCH-002', N'SENSOR_NOISE', N'Tín hiệu cảm biến dao động bất thường trong 10 phút', DATEADD(MINUTE, -18, SYSDATETIME()), 0),
(N'FAIL-004', N'DEV-TH-004', N'MCH-004', N'SENSOR_DISCONNECT', N'Cảm biến mất kết nối tạm thời', DATEADD(MINUTE, -9, SYSDATETIME()), 0),
(N'FAIL-005', N'DEV-TH-005', N'MCH-005', N'CALIBRATION_REQUIRED', N'Cần hiệu chuẩn lại cảm biến trước ca chạy thử tiếp theo', DATEADD(MINUTE, -3, SYSDATETIME()), 0);
GO

-- Trigger trg_DeviceFailures_AfterUpdate sẽ set resolvedAt và bật lại thiết bị nếu đã hết lỗi mở.
UPDATE DeviceFailures
SET isResolved = 1
WHERE failureId = N'FAIL-001';
GO

-- Trigger trg_Alerts_SetResolvedAt sẽ tự điền resolvedAt.
UPDATE Alerts
SET isResolved = 1
WHERE thresholdExceeded IN (N'HUMIDITY_LOW', N'DOOR_OPEN_WHILE_ON');
GO

INSERT INTO ML_Models (modelId, modelName, algorithm, accuracy, isActive)
VALUES
(N'MDL-001', N'Dự báo thời gian sấy v1', N'RandomForest', 91.35, 1),
(N'MDL-002', N'Tối ưu nhiệt độ v1', N'GradientBoosting', 88.70, 1),
(N'MDL-003', N'Phát hiện bất thường cảm biến', N'IsolationForest', 86.20, 1),
(N'MDL-004', N'Dự báo tiêu thụ điện v1', N'XGBoost', 89.45, 1),
(N'MDL-005', N'Phân loại chất lượng mẻ sấy', N'LogisticRegression', 84.80, 1);
GO

-- Trigger trg_Predictions_AfterInsert sẽ tự thêm SensorReadingModelUsage.
INSERT INTO Predictions (predictionId, modelId, machineId, readingId, predictedAt, predictedValue, durationMinutes)
VALUES
(N'PRED-001', N'MDL-001', N'MCH-001', N'RD-002', SYSDATETIME(), 185.00, 180),
(N'PRED-002', N'MDL-002', N'MCH-002', N'RD-004', SYSDATETIME(), 53.50, 120),
(N'PRED-003', N'MDL-003', N'MCH-003', N'RD-006', SYSDATETIME(), 0.92, 30),
(N'PRED-004', N'MDL-001', N'MCH-004', N'RD-008', SYSDATETIME(), 150.00, 150),
(N'PRED-005', N'MDL-002', N'MCH-005', N'RD-010', SYSDATETIME(), 62.00, 90);
GO
