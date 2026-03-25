const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios'); // Dùng để gọi ngược lại Gateway

const app = express();
const PORT = 8000;
const GATEWAY_URL = "http://localhost:5000/api/control"; // Địa chỉ Flask Gateway

// Middleware
app.use(cors());
app.use(express.json());

// Lưu trữ dữ liệu trong bộ nhớ (In-memory)
let telemetryData = []; 
let latestData = {}; 

// Mock dữ liệu máy sấy
let machines = [
  {
    id: '1',
    name: 'Máy sấy Tòa A',
    buildingId: '1',
    currentTemp: 0,
    currentHumidity: 0,
    fanLevel: 0,
    isDoorOpen: false,
    lastUpdate: null
  },
  {
    id: '2',
    name: 'Máy sấy Tòa B',
    buildingId: '2',
    currentTemp: 0,
    currentHumidity: 0,
    fanLevel: 0,
    isDoorOpen: false,
    lastUpdate: null
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