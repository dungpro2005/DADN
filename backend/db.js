const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  const pool = mysql.createPool({
    host: process.env.DB_SERVER || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
  });

  try {
    const connection = await pool.getConnection();
    console.log('✓ Connected to MySQL database');
    connection.release();

    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Users (
        userId VARCHAR(50) PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        passwordHash VARCHAR(255) NOT NULL,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phoneNumber VARCHAR(20),
        role VARCHAR(20) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS Buildings (
        buildingId VARCHAR(50) PRIMARY KEY,
        buildingName VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS FruitTypes (
        fruitTypeId VARCHAR(50) PRIMARY KEY,
        fruitTypeName VARCHAR(255) NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS Schedules (
        scheduleId VARCHAR(50) PRIMARY KEY,
        scheduleName VARCHAR(255) NOT NULL,
        fruitTypeId VARCHAR(50) NOT NULL,
        description TEXT,
        durationMinutes INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fruitTypeId) REFERENCES FruitTypes(fruitTypeId)
      );

      CREATE TABLE IF NOT EXISTS Machines (
        machineId VARCHAR(50) PRIMARY KEY,
        machineName VARCHAR(255) NOT NULL,
        buildingId VARCHAR(50) NOT NULL,
        managerUserId VARCHAR(50),
        scheduleId VARCHAR(50),
        currentFruitType VARCHAR(50),
        isOn TINYINT(1) DEFAULT 0,
        isDoorOpen TINYINT(1) DEFAULT 0,
        lastUpdate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        currentTemp FLOAT DEFAULT 0,
        targetTempMin FLOAT DEFAULT 0,
        targetTempMax FLOAT DEFAULT 0,
        currentHumidity FLOAT DEFAULT 0,
        targetHumidityMin FLOAT DEFAULT 0,
        targetHumidityMax FLOAT DEFAULT 0,
        fanLevel INT DEFAULT 0,
        mode VARCHAR(50) DEFAULT 'manual',
        FOREIGN KEY (buildingId) REFERENCES Buildings(buildingId),
        FOREIGN KEY (scheduleId) REFERENCES Schedules(scheduleId)
      );
    `);

    // Seed initial data if empty
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM Users');
    if (userRows[0].count === 0) {
      console.log(' Seeding initial data...');
      
      // Seed Users
      await pool.query(`INSERT INTO Users (userId, username, passwordHash, firstName, lastName, email, phoneNumber, role) VALUES 
        ('USR-ADMIN-001', 'admin01', '$2a$10$mocked_hash', 'Nguyễn', 'An', 'an.nguyen@example.com', '0901000001', 'admin'),
        ('USR-EMP-001', 'employee01', '$2a$10$mocked_hash', 'Trần', 'Bình', 'binh.tran@example.com', '0901000002', 'employee'),
        ('USR-EMP-002', 'employee02', '$2a$10$mocked_hash', 'Lê', 'Chi', 'chi.le@example.com', '0901000003', 'employee'),
        ('USR-EMP-003', 'employee03', '$2a$10$mocked_hash', 'Phạm', 'Dũng', 'dung.pham@example.com', '0901000004', 'employee'),
        ('USR-ADMIN-002', 'admin02', '$2a$10$mocked_hash', 'Võ', 'Hạnh', 'hanh.vo@example.com', '0901000005', 'admin'),
        ('USR-EMP-004', 'employee04', '$2a$10$mocked_hash', 'Đỗ', 'Khoa', 'khoa.do@example.com', '0901000006', 'employee')
      `);

      // Seed Buildings
      await pool.query(`INSERT INTO Buildings (buildingId, buildingName, location) VALUES 
        ('BLD-001', 'Xưởng sấy A', 'Khu công nghiệp Long Hậu, Long An'),
        ('BLD-002', 'Xưởng sấy B', 'Khu công nghiệp Tân Bình, TP.HCM'),
        ('BLD-003', 'Kho thử nghiệm R&D', 'Quận 9, TP.HCM'),
        ('BLD-004', 'Xưởng sấy C', 'Khu công nghiệp VSIP, Bình Dương'),
        ('BLD-005', 'Kho thành phẩm', 'Huyện Củ Chi, TP.HCM')
      `);

      // Seed FruitTypes
      await pool.query(`INSERT INTO FruitTypes (fruitTypeId, fruitTypeName, description) VALUES 
        ('FT-MANGO', 'Xoài', 'Quy trình sấy xoài lát dẻo'),
        ('FT-BANANA', 'Chuối', 'Quy trình sấy chuối giòn/dẻo'),
        ('FT-DRAGON', 'Thanh long', 'Quy trình sấy thanh long cắt lát'),
        ('FT-PINEAPPLE', 'Dứa', 'Quy trình sấy dứa lát'),
        ('FT-LONGAN', 'Nhãn', 'Quy trình sấy nhãn nguyên cùi')
      `);

      // Seed Schedules
      await pool.query(`INSERT INTO Schedules (scheduleId, scheduleName, fruitTypeId, description, durationMinutes) VALUES 
        ('SCH-MANGO-STD', 'Xoài tiêu chuẩn', 'FT-MANGO', 'Sấy xoài lát ở nhiệt độ trung bình, giữ độ dẻo', 720),
        ('SCH-BANANA-LOW', 'Chuối nhiệt thấp', 'FT-BANANA', 'Sấy chuối ở nhiệt thấp để giữ màu', 600),
        ('SCH-DRAGON-STD', 'Thanh long tiêu chuẩn', 'FT-DRAGON', 'Sấy thanh long cắt lát mỏng', 480),
        ('SCH-PINEAPPLE-STD', 'Dứa tiêu chuẩn', 'FT-PINEAPPLE', 'Sấy dứa lát, độ ẩm đầu ra thấp', 540),
        ('SCH-LONGAN-STD', 'Nhãn tiêu chuẩn', 'FT-LONGAN', 'Sấy nhãn giữ mùi thơm tự nhiên', 660)
      `);

      // Seed Machines
      await pool.query(`INSERT INTO Machines (machineId, machineName, buildingId, managerUserId, scheduleId, currentFruitType, isOn, isDoorOpen, currentTemp, targetTempMin, targetTempMax, currentHumidity, targetHumidityMin, targetHumidityMax, fanLevel, mode) VALUES 
        ('MCH-001', 'Máy sấy xoài 01', 'BLD-001', 'USR-EMP-001', 'SCH-MANGO-STD', 'FT-MANGO', 0, 0, 59.0, 58.0, 62.0, 35.0, 30.0, 40.0, 0, 'manual'),
        ('MCH-002', 'Máy sấy chuối 01', 'BLD-001', 'USR-EMP-002', 'SCH-BANANA-LOW', 'FT-BANANA', 0, 0, 52.0, 50.0, 55.0, 37.0, 32.0, 42.0, 0, 'manual'),
        ('MCH-003', 'Máy sấy thanh long 01', 'BLD-002', 'USR-EMP-003', 'SCH-DRAGON-STD', 'FT-DRAGON', 0, 0, 56.0, 55.0, 60.0, 40.0, 35.0, 45.0, 0, 'manual'),
        ('MCH-004', 'Máy sấy dứa 01', 'BLD-002', 'USR-EMP-001', 'SCH-PINEAPPLE-STD', 'FT-PINEAPPLE', 0, 0, 60.0, 57.0, 63.0, 33.0, 28.0, 38.0, 0, 'manual'),
        ('MCH-005', 'Máy sấy nhãn thử nghiệm', 'BLD-003', 'USR-EMP-002', 'SCH-LONGAN-STD', 'FT-LONGAN', 0, 0, 27.0, 60.0, 65.0, 65.0, 25.0, 35.0, 0, 'manual')
      `);
    }
  } catch (error) {
    console.error('Lỗi khởi tạo database MySQL:', error);
  }

  return pool;
}

const dbPromise = initializeDatabase();

module.exports = {
  dbPromise
};
