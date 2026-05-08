const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios'); // Dùng để gọi ngược lại Gateway
const { sql, poolPromise } = require('./db');

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

// Dữ liệu người dùng, máy sấy, tòa nhà và lịch trình sẽ được lấy từ Database

// --- 1. Nhận dữ liệu từ Gateway ---
app.post('/api/telemetry', (req, res) => {
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

    // Cập nhật mảng lịch sử (Giới hạn 1000 bản ghi gần nhất để tránh tràn RAM)
    telemetryData.push(telemetryEntry);
    if (telemetryData.length > 1000) telemetryData.shift();

    // Cập nhật trạng thái mới nhất
    latestData[zone_id] = telemetryEntry;

    // Cập nhật trực tiếp vào database (Nếu cần thiết kế bảng riêng cho trạng thái máy sấy)
    const updateMachineInDB = async () => {
      try {
        const pool = await poolPromise;
        await pool.request()
          .input('id', sql.NVarChar, zone_id.toString())
          .input('temp', sql.Float, telemetryEntry.temperature)
          .input('humi', sql.Float, telemetryEntry.humidity)
          .input('fan', sql.Int, telemetryEntry.fan_level)
          .input('door', sql.Bit, telemetryEntry.isDoorOpen ? 1 : 0)
          .input('lastUpdate', sql.DateTime2, new Date())
          .query(`
            UPDATE Machines 
            SET currentTemp = @temp, currentHumidity = @humi, fanLevel = @fan, isDoorOpen = @door, lastUpdate = @lastUpdate
            WHERE machineId = @id
          `);
      } catch (err) {
        console.error('Lỗi cập nhật máy sấy vào DB:', err);
      }
    };
    updateMachineInDB();

    // Gửi dữ liệu thời gian thực qua WebSocket
    broadcast({ type: 'telemetry_update', data: telemetryEntry });

    console.log(`[Gateway] Nhận dữ liệu từ ${zone_name} (ID: ${zone_id}): \n  Temperature: ${telemetryEntry.temperature}\n  Humidity: ${telemetryEntry.humidity}\n  Fan Level: ${telemetryEntry.fan_level}\n  Door Status: ${telemetryEntry.isDoorOpen ? 'Open' : 'Closed'}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Lỗi xử lý telemetry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- 2. Gửi lệnh điều khiển xuống Gateway ---
// Web UI sẽ gọi API này: POST /api/control { "device": "fan", "value": "3", "zone_id": 1 }
app.post('/api/control', async (req, res) => {
  const { device, value, zone_id } = req.body;

  try {
    // Gọi sang Flask Gateway
    const response = await axios.post(GATEWAY_URL, { device, value });

    console.log(`[Control] Gửi lệnh ${device}:${value} tới Gateway thành công`);
    res.json({ success: true, gateway_response: response.data });
  } catch (error) {
    console.error('Không thể kết nối tới Gateway Python:', error.message);
    res.status(502).json({ error: 'Gateway không phản hồi' });
  }
});

// --- 3. Các API lấy dữ liệu cho Frontend ---
app.get('/api/buildings', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT b.buildingId as id, b.buildingName as name, b.location,
      (SELECT COUNT(*) FROM Machines m WHERE m.buildingId = b.buildingId) as machineCount
      FROM Buildings b
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/buildings', async (req, res) => {
  try {
    const { id, name, location } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.NVarChar, id)
      .input('name', sql.NVarChar, name)
      .input('location', sql.NVarChar, location)
      .query('INSERT INTO Buildings (buildingId, buildingName, location) VALUES (@id, @name, @location)');
    res.status(201).json({ id, name, location });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/buildings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    await pool.request().input('id', sql.NVarChar, id).query('DELETE FROM Buildings WHERE buildingId = @id');
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/machines', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT machineId as id, machineName as name, buildingId, currentTemp, currentHumidity, fanLevel, isDoorOpen, lastUpdate, currentFruitType as currentFruit, mode, targetTempMin, targetTempMax, targetHumidityMin, targetHumidityMax FROM Machines');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/machines', async (req, res) => {
  try {
    const { id, name, buildingId } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.NVarChar, id)
      .input('name', sql.NVarChar, name)
      .input('buildingId', sql.NVarChar, buildingId)
      .query('INSERT INTO Machines (machineId, machineName, buildingId, isOn, isDoorOpen, currentTemp, currentHumidity, fanLevel, mode) VALUES (@id, @name, @buildingId, 0, 0, 0, 0, 0, \'manual\')');
    res.status(201).json(req.body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/machines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const pool = await poolPromise;
    let query = 'UPDATE Machines SET ';
    const request = pool.request();
    request.input('id', sql.NVarChar, id);

    const setClauses = [];
    Object.keys(updates).forEach((key, index) => {
      // Map frontend fields to backend DB fields if necessary
      let dbKey = key;
      if (key === 'currentFruit') dbKey = 'currentFruitType';
      
      request.input(`param${index}`, updates[key]);
      setClauses.push(`${dbKey} = @param${index}`);
    });
    
    query += setClauses.join(', ') + ' WHERE machineId = @id';
    await request.query(query);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/machines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    await pool.request().input('id', sql.NVarChar, id).query('DELETE FROM Machines WHERE machineId = @id');
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/telemetry/latest', (req, res) => res.json(latestData));
app.get('/api/logs', (req, res) => {
  // Trả về log định dạng đẹp để vẽ biểu đồ
  const logs = telemetryData.map(e => ({
    time: e.timestamp,
    temp: e.temperature,
    humi: e.humidity,
    zone: e.zone_name
  }));
  res.json(logs);
});

// --- 4. Quản lý Người dùng & OTP ---
app.get('/api/users', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT username, role, firstName, lastName, email, phoneNumber FROM Users');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Yêu cầu OTP
app.post('/api/otp/request', async (req, res) => {
  const { email } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('email', sql.NVarChar, email).query('SELECT * FROM Users WHERE email = @email');
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Không tìm thấy email người dùng' });

    const response = await axios.post(`${OTP_SERVICE_URL}/generate`, { email });
    res.json(response.data);
  } catch (error) {
    console.error('Lỗi gọi OTP Service:', error.response?.data || error.message);
    res.status(500).json({ error: 'Lỗi dịch vụ OTP', details: error.response?.data || error.message });
  }
});

// Xác thực OTP
app.post('/api/otp/verify', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const response = await axios.post(`${OTP_SERVICE_URL}/verify`, { email, otp });
    res.json(response.data);
  } catch (error) {
    res.status(400).json(error.response?.data || { error: 'Xác thực thất bại' });
  }
});

// Đổi mật khẩu (Sau khi đã xác thực OTP)
app.post('/api/users/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, newPassword) // Trong thực tế nên hash password
      .query('UPDATE Users SET passwordHash = @password WHERE email = @email');
    
    console.log(`[Reset] Reset password for ${email} to ${newPassword}`);
    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, role, firstName, lastName, email, phoneNumber, password } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.NVarChar, `USR-${Date.now()}`)
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password || 'Password123')
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .input('email', sql.NVarChar, email)
      .input('phone', sql.NVarChar, phoneNumber)
      .input('role', sql.NVarChar, role)
      .query('INSERT INTO Users (userId, username, passwordHash, firstName, lastName, email, phoneNumber, role) VALUES (@id, @username, @password, @firstName, @lastName, @email, @phone, @role)');
    res.status(201).json(req.body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const updates = req.body;
    const pool = await poolPromise;
    let query = 'UPDATE Users SET ';
    const request = pool.request();
    request.input('username', sql.NVarChar, username);

    const setClauses = [];
    Object.keys(updates).forEach((key, index) => {
      if (key === 'password') {
         request.input(`param${index}`, updates[key]);
         setClauses.push(`passwordHash = @param${index}`);
      } else {
         request.input(`param${index}`, updates[key]);
         setClauses.push(`${key} = @param${index}`);
      }
    });
    
    query += setClauses.join(', ') + ' WHERE username = @username';
    await request.query(query);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const pool = await poolPromise;
    await pool.request().input('username', sql.NVarChar, username).query('DELETE FROM Users WHERE username = @username');
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 5. Quản lý Lịch trình ---
app.get('/api/schedules', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT scheduleId as id, scheduleName as name, fruitTypeId as fruitType, durationMinutes as duration FROM Schedules');
    // Cần lấy thêm các bước (steps) nếu frontend yêu cầu
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/schedules', async (req, res) => {
  try {
    const { id, name, fruitType, duration } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.NVarChar, id)
      .input('name', sql.NVarChar, name)
      .input('fruitType', sql.NVarChar, fruitType)
      .input('duration', sql.Int, duration)
      .query('INSERT INTO Schedules (scheduleId, scheduleName, fruitTypeId, durationMinutes) VALUES (@id, @name, @fruitType, @duration)');
    res.status(201).json(req.body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 4. WebSocket Server ---
const wss = new WebSocket.Server({ port: 3001 });

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('🌐 Client Web đã kết nối WebSocket');
  ws.send(JSON.stringify({ type: 'initial_data', data: latestData }));
});

app.listen(PORT, () => {
  console.log(`Backend chạy tại http://localhost:${PORT}`);
  console.log(`WebSocket chạy tại ws://localhost:3001`);
});