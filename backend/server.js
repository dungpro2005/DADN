const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios'); // Dùng để gọi ngược lại Gateway
const { dbPromise } = require('./db');

require('dotenv').config();

const app = express();
const PORT = 8000;
const GATEWAY_URL = "http://localhost:5000/api/control"; // Địa chỉ Flask Gateway
const OTP_SERVICE_URL = "http://localhost:5001/api/otp"; // Địa chỉ Python OTP Service

// Middleware
app.use(cors());
app.use(express.json());

// Lưu trữ dữ liệu trong bộ nhớ (In-memory) - Chỉ dùng cho telemetry tạm thời
let telemetryData = [];
let latestData = {};

// --- 1. Nhận dữ liệu từ Gateway ---
app.post('/api/telemetry', async (req, res) => {
  try {
    const { zone_id, zone_name, temperature, humidity, fan_level, door_status, timestamp } = req.body;

    if (!zone_id) {
      return res.status(400).json({ error: 'zone_id là bắt buộc' });
    }

    const telemetryEntry = {
      id: uuidv4(),
      zone_id,
      zone_name,
      temperature: temperature !== null ? parseFloat(temperature) : null,
      humidity: humidity !== null ? parseFloat(humidity) : null,
      fan_level: fan_level !== null ? parseInt(fan_level) : 0,
      isDoorOpen: door_status === 1, // 1 là mở, 0 là đóng
      timestamp: timestamp || new Date().toISOString(),
      received_at: new Date().toISOString()
    };

    // Cập nhật trạng thái mới nhất
    latestData[zone_id] = telemetryEntry;

    // Cập nhật trực tiếp vào database
    const db = await dbPromise;
    await db.run(`
      UPDATE Machines 
      SET currentTemp = ?, currentHumidity = ?, fanLevel = ?, isDoorOpen = ?, lastUpdate = ?
      WHERE machineId = ?
    `, [
      telemetryEntry.temperature, 
      telemetryEntry.humidity, 
      telemetryEntry.fan_level, 
      telemetryEntry.isDoorOpen ? 1 : 0, 
      new Date().toISOString(), 
      zone_id.toString()
    ]);

    // Gửi dữ liệu thời gian thực qua WebSocket
    broadcast({ type: 'telemetry_update', data: telemetryEntry });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Lỗi nhận telemetry:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// --- 2. Điều khiển thiết bị ---
app.post('/api/control', async (req, res) => {
  const { device, value, zone_id } = req.body;
  
  console.log(`[Control] Device: ${device}, Value: ${value}, Zone: ${zone_id}`);

  try {
    // Gọi sang Gateway để gửi lệnh xuống phần cứng
    const response = await axios.post(GATEWAY_URL, { device, value, zone_id });
    res.json(response.data);
  } catch (error) {
    console.error('Lỗi gọi Gateway:', error.message);
    res.status(500).json({ error: 'Không thể kết nối với Gateway' });
  }
});

// --- 3. Các API lấy dữ liệu cho Frontend ---
app.get('/api/buildings', async (req, res) => {
  try {
    const db = await dbPromise;
    const buildings = await db.all(`
      SELECT b.buildingId as id, b.buildingName as name, b.location,
      (SELECT COUNT(*) FROM Machines m WHERE m.buildingId = b.buildingId) as machineCount
      FROM Buildings b
    `);
    res.json(buildings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/buildings', async (req, res) => {
  try {
    const { id, name, location } = req.body;
    const db = await dbPromise;
    await db.run(
      'INSERT INTO Buildings (buildingId, buildingName, location) VALUES (?, ?, ?)',
      [id, name, location]
    );
    res.status(201).json({ id, name, location });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/buildings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    await db.run('DELETE FROM Buildings WHERE buildingId = ?', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/machines', async (req, res) => {
  try {
    const db = await dbPromise;
    const machines = await db.all('SELECT machineId as id, machineName as name, buildingId, currentTemp, currentHumidity, fanLevel, isDoorOpen, lastUpdate, currentFruitType as currentFruit, mode, targetTempMin, targetTempMax, targetHumidityMin, targetHumidityMax FROM Machines');
    res.json(machines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/machines', async (req, res) => {
  try {
    const { id, name, buildingId } = req.body;
    const db = await dbPromise;
    await db.run(
      'INSERT INTO Machines (machineId, machineName, buildingId, isOn, isDoorOpen, currentTemp, currentHumidity, fanLevel, mode) VALUES (?, ?, ?, 0, 0, 0, 0, 0, \'manual\')',
      [id, name, buildingId]
    );
    res.status(201).json(req.body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/machines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = await dbPromise;
    
    let query = 'UPDATE Machines SET ';
    const params = [];
    const setClauses = [];
    
    Object.keys(updates).forEach((key) => {
      let dbKey = key;
      if (key === 'currentFruit') dbKey = 'currentFruitType';
      
      setClauses.push(`${dbKey} = ?`);
      params.push(updates[key]);
    });
    
    query += setClauses.join(', ') + ' WHERE machineId = ?';
    params.push(id);
    
    await db.run(query, params);

    // --- Gửi lệnh lên Adafruit IO khi thay đổi chế độ ---
    if (updates.mode) {
      // Bảng ánh xạ tên trái cây sang feed key trên Adafruit IO
      const fruitFeedMap = {
        'Chuối':      'chuoi',
        'Dứa':        'dua',
        'Xoài':       'xoai',
        'Thanh long': 'thanh-long',
        'Nhãn':       'nhan'
      };

      const sendToGateway = async (device, value) => {
        try {
          await axios.post(GATEWAY_URL, { device, value });
        } catch (e) {
          console.warn(`[Adafruit] Không thể gửi lệnh ${device}=${value}:`, e.message);
        }
      };

      if (updates.mode === 'automatic') {
        // Lấy loại trái cây của máy từ DB
        const machine = await db.get('SELECT currentFruitType FROM Machines WHERE machineId = ?', [id]);
        const fruitFeed = fruitFeedMap[machine?.currentFruitType];

        // Gửi tên trái cây lên Adafruit IO trước
        if (fruitFeed) {
          await sendToGateway(fruitFeed, 1);
          console.log(`[Adafruit] Gửi ${fruitFeed}=1 lên Adafruit IO`);
        }
        // Sau đó bật chế độ auto
        await sendToGateway('auto', 1);
        console.log(`[Adafruit] Gửi auto=1 lên Adafruit IO`);

      } else if (updates.mode === 'manual') {
        // Tắt chế độ auto
        await sendToGateway('auto', 0);
        console.log(`[Adafruit] Gửi auto=0 lên Adafruit IO`);
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.delete('/api/machines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    await db.run('DELETE FROM Machines WHERE machineId = ?', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/telemetry/latest', (req, res) => res.json(latestData));

// --- 4. Quản lý Người dùng & OTP ---
app.get('/api/users', async (req, res) => {
  try {
    const db = await dbPromise;
    const users = await db.all('SELECT username, role, firstName, lastName, email, phoneNumber FROM Users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, role, firstName, lastName, email, phoneNumber, password } = req.body;
    const db = await dbPromise;
    await db.run(
      'INSERT INTO Users (userId, username, passwordHash, firstName, lastName, email, phoneNumber, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [`USR-${Date.now()}`, username, password || 'Password123', firstName, lastName, email, phoneNumber, role]
    );
    res.status(201).json(req.body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const updates = req.body;
    const db = await dbPromise;
    
    let query = 'UPDATE Users SET ';
    const params = [];
    const setClauses = [];
    
    Object.keys(updates).forEach((key) => {
      let dbKey = key;
      if (key === 'password') dbKey = 'passwordHash';
      
      setClauses.push(`${dbKey} = ?`);
      params.push(updates[key]);
    });
    
    query += setClauses.join(', ') + ' WHERE username = ?';
    params.push(username);
    
    await db.run(query, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const db = await dbPromise;
    await db.run('DELETE FROM Users WHERE username = ?', [username]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 5. Quản lý Lịch trình ---
app.get('/api/schedules', async (req, res) => {
  try {
    const db = await dbPromise;
    const schedules = await db.all('SELECT scheduleId as id, scheduleName as name, fruitTypeId as fruitType, durationMinutes as duration FROM Schedules');
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/schedules', async (req, res) => {
  try {
    const { id, name, fruitType, duration } = req.body;
    const db = await dbPromise;
    await db.run(
      'INSERT INTO Schedules (scheduleId, scheduleName, fruitTypeId, durationMinutes) VALUES (?, ?, ?, ?)',
      [id, name, fruitType, duration]
    );
    res.status(201).json(req.body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 4. WebSocket Server ---
const server = app.listen(PORT, () => {
  console.log(`Backend chạy tại http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  // Gửi trạng thái kết nối hiện tại cho client mới
  ws.send(JSON.stringify({ type: 'connection_status', connected: true }));

  ws.on('close', () => console.log('Client disconnected'));
});