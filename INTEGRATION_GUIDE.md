# Yolobit Backend Integration Guide

## Overview

This backend server acts as a bridge between your React frontend and the Yolobit microcontroller device. It handles:

- **Serial Communication**: Connects to the Yolobit device via USB serial port
- **Real-time Updates**: Broadcasts sensor data to all connected clients via WebSocket
- **REST API**: Provides HTTP endpoints for commands and status queries
- **Connection Management**: Handles reconnection and error recovery

## Architecture

```
Yolobit Device
     ↓ (Serial)
Backend Server (Node.js/Express)
     ↑ (WebSocket/HTTP)
Frontend (React/TypeScript)
```

## Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Serial Port

Find your Yolobit device:

**Linux/macOS:**
```bash
# List available ports
ls -la /dev/tty*
# Look for /dev/ttyUSB0, /dev/ttyUSB1, or /dev/ttyACM0
```

**Windows:**
- Open Device Manager
- Look under "Ports (COM & LPT)"
- Note the COM port (e.g., COM3)

### 3. Create `.env` File

```bash
# Copy example template
cp .env.example .env

# Edit .env
nano .env  # or use your favorite editor
```

Update with your serial port:

**Linux/macOS example:**
```env
PORT=3001
SERIAL_PORT=/dev/ttyUSB0
BAUD_RATE=115200
NODE_ENV=development
```

**Windows example:**
```env
PORT=3001
SERIAL_PORT=COM3
BAUD_RATE=115200
NODE_ENV=development
```

### 4. Start the Backend

```bash
# Development (auto-reload on changes)
npm run dev

# Production
npm start
```

You should see:
```
✓ Connected to Yolobit on /dev/ttyUSB0
🚀 Server running on http://localhost:3001
📡 WebSocket: ws://localhost:3001
```

### 5. Test the Connection

In a new terminal:

```bash
cd backend
node test-client.js
```

Then try commands:
```
> fan 3
> power on
> heater 2
> status
> exit
```

## Frontend Integration

### Option A: Using the New Hook (Recommended)

Replace your Yolobit hook with the new server-based one:

```typescript
// src/app/hooks/useYolobitServer.ts (already created)

import { useYolobitServer } from './hooks/useYolobitServer';

export function MyComponent() {
  const { 
    isConnected, 
    sensorData, 
    setFan, 
    setPower, 
    setHeater, 
    setHumidifier 
  } = useYolobitServer('ws://localhost:3001');

  return (
    <div>
      <p>Status: {isConnected ? '✓ Connected' : '✗ Disconnected'}</p>
      {sensorData && (
        <div>
          <p>Temp: {sensorData.temp}°C</p>
          <p>Humidity: {sensorData.humidity}%</p>
          <button onClick={() => setFan(3)}>Set Fan to 3</button>
        </div>
      )}
    </div>
  );
}
```

### Option B: Using REST API

```typescript
// Fetch sensor data
const response = await fetch('http://localhost:3001/api/sensors');
const data = await response.json();

// Send fan command
await fetch('http://localhost:3001/api/fan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ level: 3 })
});
```

### Option C: Direct WebSocket

```typescript
const ws = new WebSocket('ws://localhost:3001');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'sensor_data') {
    console.log('Sensor:', data.data);
  }
};

ws.send(JSON.stringify({ command: 'set_fan', level: 2 }));
```

## API Reference

### WebSocket Messages

**Incoming (from server):**

```javascript
// Sensor data update (received ~2 seconds)
{
  type: 'sensor_data',
  data: {
    temp: 25.3,
    humidity: 65.2,
    fan: 2,
    heater: 1,
    humidifier: 0,
    door_open: false,
    power_on: true
  },
  timestamp: '2026-03-22T10:30:45.123Z'
}

// Device connection status
{
  type: 'connection_status',
  connected: true
}

// Command response
{
  type: 'command_status',
  command: 'set_fan',
  success: true
}
```

**Outgoing (to server):**

```javascript
// Set fan level (0-5)
{ command: 'set_fan', level: 3 }

// Control power (true/false)
{ command: 'set_power', state: true }

// Set heater (0-5)
{ command: 'set_heater', level: 2 }

// Set humidifier (0-5)
{ command: 'set_humidifier', level: 1 }

// Configure device pins
{ command: 'configure_devices', config: { fanPin: 2, heaterPin: 5 } }
```

### REST Endpoints

```bash
# Health check
GET http://localhost:3001/health

# Get connection status
GET http://localhost:3001/api/status

# Get current sensor data
GET http://localhost:3001/api/sensors

# Set fan level (0-5)
POST http://localhost:3001/api/fan
Body: { "level": 3 }

# Control power
POST http://localhost:3001/api/power
Body: { "state": true }

# Set heater (0-5)
POST http://localhost:3001/api/heater
Body: { "level": 2 }

# Set humidifier (0-5)
POST http://localhost:3001/api/humidifier
Body: { "level": 1 }

# Configure devices
POST http://localhost:3001/api/configure
Body: { "config": { "fanPin": 2, "heaterPin": 5 } }
```

## Running Both Frontend and Backend

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev  # or yarn dev / pnpm dev
```

Frontend will be at `http://localhost:5173`
Backend will be at `http://localhost:3001`

## Troubleshooting

### Backend won't connect to device

**Error:** `Failed to connect to serial port /dev/ttyUSB0`

**Solution:**
1. Check device is plugged in and powered
2. Verify serial port path: `ls /dev/tty*`
3. On Linux, add user to dialout group:
   ```bash
   sudo usermod -a -G dialout $USER
   newgrp dialout
   ```
4. Update SERIAL_PORT in `.env`

### Frontend can't connect to backend

**Error:** WebSocket connection failed

**Solution:**
1. Verify backend is running: `curl http://localhost:3001/health`
2. Check PORT in `.env` matches frontend URL
3. Disable browser extensions that might block WebSocket
4. Check firewall settings

### No sensor data appearing

**Possible causes:**
1. Yolobit not sending data - verify via serial monitor
2. Baud rate mismatch - check both device and `.env` use 115200
3. USB connection issue - try different cable/port

**Debug:**
```bash
# Linux/macOS - Read raw serial data
screen /dev/ttyUSB0 115200

# macOS
ls /dev/cu.*

# Windows - Use PuTTY or similar
```

### CORS errors

If frontend has CORS issues:
1. Backend already has CORS enabled (all origins)
2. Check WebSocket URL uses `ws://` not `http://`
3. Verify no proxy interfering

## Performance Notes

- Sensor data updates every ~2 seconds (from Yolobit)
- WebSocket broadcasts to all clients simultaneously
- Commands sent immediately over serial
- Graceful reconnection on connection loss

## Security Considerations

For production deployment:
1. Authenticate WebSocket connections
2. Add rate limiting
3. Validate all commands
4. Use HTTPS/WSS
5. Add firewall rules
6. Restrict serial port access

## Next Steps

1. ✅ Backend running and connected to device
2. ✅ Test with `test-client.js`
3. ✅ Update frontend to use `useYolobitServer`
4. ✅ Deploy with proper SSL/security
