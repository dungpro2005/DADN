const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function initializeDatabase() {
  const db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  console.log('✓ Connected to SQLite database');

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      userId TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE,
      phoneNumber TEXT,
      role TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Buildings (
      buildingId TEXT PRIMARY KEY,
      buildingName TEXT NOT NULL,
      location TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS FruitTypes (
      fruitTypeId TEXT PRIMARY KEY,
      fruitTypeName TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS Schedules (
      scheduleId TEXT PRIMARY KEY,
      scheduleName TEXT NOT NULL,
      fruitTypeId TEXT NOT NULL,
      description TEXT,
      durationMinutes INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (fruitTypeId) REFERENCES FruitTypes(fruitTypeId)
    );

    CREATE TABLE IF NOT EXISTS Machines (
      machineId TEXT PRIMARY KEY,
      machineName TEXT NOT NULL,
      buildingId TEXT NOT NULL,
      managerUserId TEXT,
      scheduleId TEXT,
      currentFruitType TEXT,
      isOn INTEGER DEFAULT 0,
      isDoorOpen INTEGER DEFAULT 0,
      lastUpdate DATETIME DEFAULT CURRENT_TIMESTAMP,
      currentTemp REAL DEFAULT 0,
      targetTempMin REAL DEFAULT 0,
      targetTempMax REAL DEFAULT 0,
      currentHumidity REAL DEFAULT 0,
      targetHumidityMin REAL DEFAULT 0,
      targetHumidityMax REAL DEFAULT 0,
      fanLevel INTEGER DEFAULT 0,
      mode TEXT DEFAULT 'manual',
      FOREIGN KEY (buildingId) REFERENCES Buildings(buildingId),
      FOREIGN KEY (scheduleId) REFERENCES Schedules(scheduleId)
    );
  `);

  // Seed initial data if empty
  const userCount = await db.get('SELECT COUNT(*) as count FROM Users');
  if (userCount.count === 0) {
    console.log(' Seeding initial data...');
    
    // Seed Users
    await db.run(`INSERT INTO Users (userId, username, passwordHash, firstName, lastName, email, phoneNumber, role) VALUES 
      ('USR-ADMIN-001', 'admin01', '$2a$10$mocked_hash', 'Nguyễn', 'An', 'an.nguyen@example.com', '0901000001', 'admin'),
      ('USR-EMP-001', 'employee01', '$2a$10$mocked_hash', 'Trần', 'Bình', 'binh.tran@example.com', '0901000002', 'employee')
    `);

    // Seed Buildings
    await db.run(`INSERT INTO Buildings (buildingId, buildingName, location) VALUES 
      ('BLD-001', 'Xưởng sấy A', 'Khu công nghiệp Long Hậu, Long An'),
      ('BLD-002', 'Xưởng sấy B', 'Khu công nghiệp Tân Bình, TP.HCM')
    `);

    // Seed FruitTypes
    await db.run(`INSERT INTO FruitTypes (fruitTypeId, fruitTypeName, description) VALUES 
      ('FT-MANGO', 'Xoài', 'Quy trình sấy xoài lát dẻo'),
      ('FT-BANANA', 'Chuối', 'Quy trình sấy chuối giòn/dẻo')
    `);

    // Seed Schedules
    await db.run(`INSERT INTO Schedules (scheduleId, scheduleName, fruitTypeId, description, durationMinutes) VALUES 
      ('SCH-MANGO-STD', 'Xoài tiêu chuẩn', 'FT-MANGO', 'Sấy xoài lát dẻo', 720),
      ('SCH-BANANA-LOW', 'Chuối nhiệt thấp', 'FT-BANANA', 'Sấy chuối nhiệt thấp', 600)
    `);

    // Seed Machines
    await db.run(`INSERT INTO Machines (machineId, machineName, buildingId, managerUserId, scheduleId, currentFruitType, isOn, isDoorOpen, currentTemp, targetTempMin, targetTempMax, currentHumidity, targetHumidityMin, targetHumidityMax, fanLevel, mode) VALUES 
      ('MCH-001', 'Máy sấy xoài 01', 'BLD-001', 'USR-EMP-001', 'SCH-MANGO-STD', 'FT-MANGO', 1, 0, 59.0, 50.0, 60.0, 35.0, 30.0, 45.0, 3, 'automatic'),
      ('MCH-002', 'Máy sấy chuối 01', 'BLD-001', 'USR-EMP-001', 'SCH-BANANA-LOW', 'FT-BANANA', 1, 0, 52.0, 45.0, 55.0, 37.0, 35.0, 50.0, 3, 'automatic')
    `);
  }

  return db;
}

const dbPromise = initializeDatabase();

module.exports = {
  dbPromise
};
