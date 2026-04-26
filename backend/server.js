const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios'); // Dùng để gọi ngược lại Gateway

const app = express();
const PORT = 8000;
const GATEWAY_URL = "http://localhost:5000/api/control"; // Địa chỉ Flask Gateway
const OTP_SERVICE_URL = "http://localhost:5001/api/otp"; // Địa chỉ Python OTP Service

// Middleware
app.use(cors());
app.use(express.json());

// Lưu trữ dữ liệu trong bộ nhớ (In-memory)
let telemetryData = [];
let latestData = {};

// Mock dữ liệu máy sấy (từ insertdata.sql)
let machines = [
  { id: 'MCH-001', name: 'Máy sấy xoài 01', buildingId: 'BLD-001', currentTemp: 59, currentHumidity: 35, fanLevel: 3, isDoorOpen: false, lastUpdate: new Date().toISOString(), currentFruit: 'Xoài' },
  { id: 'MCH-002', name: 'Máy sấy chuối 01', buildingId: 'BLD-001', currentTemp: 52, currentHumidity: 37, fanLevel: 3, isDoorOpen: false, lastUpdate: new Date().toISOString(), currentFruit: 'Chuối' },
  { id: 'MCH-003', name: 'Máy sấy thanh long 01', buildingId: 'BLD-002', currentTemp: 56, currentHumidity: 40, fanLevel: 3, isDoorOpen: false, lastUpdate: new Date().toISOString(), currentFruit: 'Thanh long' },
  { id: 'MCH-004', name: 'Máy sấy dứa 01', buildingId: 'BLD-002', currentTemp: 60, currentHumidity: 33, fanLevel: 3, isDoorOpen: true, lastUpdate: new Date().toISOString(), currentFruit: 'Dứa' },
  { id: 'MCH-005', name: 'Máy sấy nhãn thử nghiệm', buildingId: 'BLD-003', currentTemp: 27, currentHumidity: 65, fanLevel: 0, isDoorOpen: false, lastUpdate: new Date().toISOString(), currentFruit: 'Nhãn' }
];

// Dữ liệu người dùng (từ insertdata.sql)
let users = [
  { username: 'admin01', role: 'admin', name: 'Nguyễn An', firstName: 'Nguyễn', lastName: 'An', email: 'an.nguyen@example.com', phoneNumber: '0901000001' },
  { username: 'employee01', role: 'employee', name: 'Trần Bình', firstName: 'Trần', lastName: 'Bình', email: 'binh.tran@example.com', phoneNumber: '0901000002' },
  { username: 'employee02', role: 'employee', name: 'Lê Chi', firstName: 'Lê', lastName: 'Chi', email: 'chi.le@example.com', phoneNumber: '0901000003' },
  { username: 'employee03', role: 'employee', name: 'Phạm Dũng', firstName: 'Phạm', lastName: 'Dũng', email: 'dung.pham@example.com', phoneNumber: '0901000004' },
  { username: 'admin02', role: 'admin', name: 'Võ Hạnh', firstName: 'Võ', lastName: 'Hạnh', email: 'hanh.vo@example.com', phoneNumber: '0901000005' },
  { username: 'employee04', role: 'employee', name: 'Đỗ Khoa', firstName: 'Đỗ', lastName: 'Khoa', email: 'khoa.do@example.com', phoneNumber: '0901000006' }
];

// Dữ liệu lịch trình sấy (từ insertdata.sql)
let schedules = [
  {
    id: 'SCH-MANGO-STD',
    name: 'Xoài tiêu chuẩn',
    fruitType: 'Xoài',
    duration: 720,
    targetTempMin: 50,
    targetTempMax: 60,
    targetHumidityMin: 30,
    targetHumidityMax: 45,
    steps: [
      { id: 'STEP-MANGO-001', order: 1, duration: 120, tempMin: 45, tempMax: 50, humidityMin: 45, humidityMax: 55, fanLevel: 2, doorOpen: false },
      { id: 'STEP-MANGO-002', order: 2, duration: 360, tempMin: 58, tempMax: 62, humidityMin: 30, humidityMax: 40, fanLevel: 3, doorOpen: false },
      { id: 'STEP-MANGO-003', order: 3, duration: 240, tempMin: 52, tempMax: 56, humidityMin: 25, humidityMax: 35, fanLevel: 3, doorOpen: false }
    ]
  },
  {
    id: 'SCH-BANANA-LOW',
    name: 'Chuối nhiệt thấp',
    fruitType: 'Chuối',
    duration: 600,
    targetTempMin: 45,
    targetTempMax: 55,
    targetHumidityMin: 35,
    targetHumidityMax: 50,
    steps: [
      { id: 'STEP-BANANA-001', order: 1, duration: 180, tempMin: 42, tempMax: 48, humidityMin: 45, humidityMax: 55, fanLevel: 2, doorOpen: false },
      { id: 'STEP-BANANA-002', order: 2, duration: 300, tempMin: 50, tempMax: 55, humidityMin: 32, humidityMax: 42, fanLevel: 3, doorOpen: false },
      { id: 'STEP-BANANA-003', order: 3, duration: 120, tempMin: 48, tempMax: 52, humidityMin: 28, humidityMax: 36, fanLevel: 3, doorOpen: false }
    ]
  }
];

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

    // Cập nhật trực tiếp vào danh sách máy sấy
    const machine = machines.find(m => m.id === zone_id.toString());
    if (machine) {
      machine.currentTemp = telemetryEntry.temperature;
      machine.currentHumidity = telemetryEntry.humidity;
      machine.fanLevel = telemetryEntry.fan_level;
      machine.isDoorOpen = telemetryEntry.isDoorOpen;
      machine.lastUpdate = telemetryEntry.received_at;
    }

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
app.get('/api/machines', (req, res) => res.json(machines));
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
app.get('/api/users', (req, res) => res.json(users));

// Yêu cầu OTP
app.post('/api/otp/request', async (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: 'Không tìm thấy email người dùng' });

  try {
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
// Lưu ý: Trong hệ thống thực tế cần token bảo mật, ở đây mock đơn giản.
app.post('/api/users/reset-password', (req, res) => {
  const { email, newPassword } = req.body;
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex === -1) return res.status(404).json({ error: 'Người dùng không tồn tại' });

  // Cập nhật mật khẩu trong bộ nhớ backend
  // Vì hiện tại server.js lưu users không có field password, 
  // ta chỉ trả về thành công để frontend cập nhật context/localStorage.
  console.log(`[Reset] Reset password for ${email} to ${newPassword}`);
  res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
});

app.post('/api/users', (req, res) => {
  const newUser = req.body;
  if (!newUser.username) return res.status(400).json({ error: 'Username là bắt buộc' });
  users.push(newUser);
  res.status(201).json(newUser);
});

app.put('/api/users/:username', (req, res) => {
  const { username } = req.params;
  const updates = req.body;
  const index = users.findIndex(u => u.username === username);
  if (index === -1) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
  users[index] = { ...users[index], ...updates };
  res.json(users[index]);
});

app.delete('/api/users/:username', (req, res) => {
  const { username } = req.params;
  users = users.filter(u => u.username !== username);
  res.status(204).send();
});

// --- 5. Quản lý Lịch trình ---
app.get('/api/schedules', (req, res) => res.json(schedules));

app.post('/api/schedules', (req, res) => {
  const newSchedule = { ...req.body, id: `SCH-${uuidv4().substring(0, 8)}` };
  schedules.push(newSchedule);
  res.status(201).json(newSchedule);
});

app.put('/api/schedules/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const index = schedules.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Không tìm thấy lịch trình' });
  schedules[index] = { ...schedules[index], ...updates };
  res.json(schedules[index]);
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