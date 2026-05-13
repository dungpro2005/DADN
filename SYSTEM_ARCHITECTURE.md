# DADN System Architecture Overview

## Project Name
**Fruit Dryer Management System** - IoT-based system for managing industrial fruit drying operations with real-time monitoring, automated control, and multi-user management.

---

## 1. SYSTEM OVERVIEW

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React/Vite)                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Pages: Dashboard, Machines, Buildings, Schedules, etc. │   │
│  │  WebSocket Real-time Updates                            │   │
│  │  Web Serial API for Yolobit Connection                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (HTTP/WebSocket)
┌─────────────────────────────────────────────────────────────────┐
│                    NODEJS EXPRESS BACKEND                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Server (Port 8000)                                  │   │
│  │  - Telemetry Management                                  │   │
│  │  - User & Schedule Management                            │   │
│  │  - Control Commands Routing                              │   │
│  │  - WebSocket Server (Port 3001)                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
     ↓ (HTTP)              ↓ (HTTP)                ↓ (Serial/MQTT)
┌──────────────────┐ ┌──────────────────┐  ┌─────────────────────┐
│ Flask Gateway    │ │ OTP Service      │  │  Yolobit Board      │
│ (Port 5000)      │ │ (Port 5001)      │  │  (Serial/USB)       │
│ - MQTT Client    │ │ - Email Sending  │  │  - DT20 Sensor      │
│ - Adafruit IO    │ │ - OTP Generation │  │  - Fan PWM Control  │
└──────────────────┘ └──────────────────┘  │  - Power Control    │
     ↓                                      └─────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│                    SQL SERVER DATABASE                            │
│  - Users, Buildings, Machines, Schedules, Logs, Activity Logs    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. FRONTEND ARCHITECTURE

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with Hot Module Replacement
- **Styling**: Tailwind CSS + shadcn/ui Components
- **UI Components**: @radix-ui (Accessibility)
- **Icons**: lucide-react
- **Charts**: @mui/material, recharts
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Real-time**: WebSocket

### Project Structure
```
src/
├── main.tsx                 # React entry point
├── app/
│   ├── App.tsx             # Root component with router & context provider
│   ├── routes.ts           # Browser router configuration
│   ├── types.ts            # TypeScript interfaces for all data types
│   ├── components/
│   │   ├── Layout.tsx      # Main layout wrapper with sidebar/navbar
│   │   ├── AdvancedCharts.tsx    # Chart components for statistics
│   │   ├── DateRangePicker.tsx   # Date range selection
│   │   ├── ReportCustomization.tsx # Report generation
│   │   ├── figma/
│   │   │   └── ImageWithFallback.tsx # Image loading with fallback
│   │   └── ui/             # shadcn/ui component library (30+ components)
│   ├── context/
│   │   └── AppContext.tsx  # Global state management (users, machines, schedules, logs)
│   ├── hooks/
│   │   ├── useYolobit.ts   # Web Serial API hook for direct hardware connection
│   │   └── useYolobitServer.ts # Connection via backend server
│   ├── pages/
│   │   ├── LoginPage.tsx   # Authentication with OTP support
│   │   ├── DashboardPage.tsx # Overview dashboard with KPIs
│   │   ├── BuildingsPage.tsx # Building management
│   │   ├── MachinesPage.tsx # Machine control & monitoring
│   │   ├── SchedulesPage.tsx # Drying schedule management
│   │   ├── StatisticsPage.tsx # Analytics & charts
│   │   ├── ActivityLogsPage.tsx # User activity tracking
│   │   └── UsersPage.tsx   # User management
│   └── utils/
│       └── reportExport.ts # PDF/Excel report generation
├── styles/
│   ├── index.css
│   ├── tailwind.css
│   ├── theme.css
│   └── fonts.css
```

### Key Pages & Features

#### **LoginPage** (`pages/LoginPage.tsx`)
- Username/email & password authentication
- OTP (One-Time Password) support via email
- Password reset flow
- Role-based login (employee vs admin)

#### **DashboardPage** (`pages/DashboardPage.tsx`)
- KPI cards: Buildings, Total Machines, Active Machines, Alerts
- Building overview with machine status
- Real-time machine status updates
- Alert indicators for temperature/humidity deviations

#### **MachinesPage** (`pages/MachinesPage.tsx`)
- Machine list with real-time sensor data
- Filter by building
- Manual/automatic mode control
- Fan, heater, humidifier level adjustments
- Device configuration dialog for GPIO pins
- Direct Yolobit connection via Web Serial API
- Add/remove machines (admin only)

#### **SchedulesPage** (`pages/SchedulesPage.tsx`)
- Create/edit/delete drying schedules
- Multi-step schedule definition
- Temperature & humidity targets per step
- Fan level and heater configuration
- Assign schedules to machines

#### **StatisticsPage** (`pages/StatisticsPage.tsx`)
- Charts: Temperature trends, humidity trends
- Date range filtering
- Machine comparison
- Downtime analysis

#### **ActivityLogsPage** (`pages/ActivityLogsPage.tsx`)
- User action history
- Timestamp tracking
- Action types: login, control changes, etc.

#### **UsersPage** (`pages/UsersPage.tsx`)
- User management (admin only)
- Role assignment (employee/admin)
- Add/edit/delete users

### Core Data Types (`types.ts`)
```typescript
User {
  username, role (employee|admin), name, firstName, lastName, email, phoneNumber
}

Machine {
  id, name, buildingId, isOn, isDoorOpen
  currentTemp, targetTempMin, targetTempMax
  currentHumidity, targetHumidityMin, targetHumidityMax
  fanLevel (0-3), heaterLevel (0-5), humidifierLevel (0-5)
  mode (manual|automatic), currentFruit, scheduleId
}

Building { id, name, location, machineCount }

Schedule {
  id, name, fruitType, steps[], duration, targetTemp*, targetHumidity*
}

ScheduleStep {
  id, order, duration, temp*, humidity*, fanLevel, doorOpen
}

MachineLog {
  id, machineId, buildingId, timestamp, temp, humidity, fanLevel, isOn, isDoorOpen
}

ActivityLog {
  id, timestamp, user, userRole, action, target, details
}
```

### Global Context (`AppContext.tsx`)
**State Management:**
- `user`: Current logged-in user
- `users`: User database
- `buildings`: Building list
- `machines`: Machine list with live data
- `schedules`: Drying schedules
- `logs`: Machine telemetry logs
- `activityLogs`: User action history

**Key Methods:**
- `login(username, password)` - Authentication
- `requestOTP(email)` - OTP generation
- `verifyOTP(email, otp)` - OTP validation
- `addMachine/removeMachine/updateMachine` - Machine management
- `addSchedule/updateSchedule` - Schedule management
- `logActivity(action, target, details)` - Activity tracking

### Custom Hooks

#### `useYolobit.ts` - Direct Hardware Connection
```typescript
interface SensorData {
  temp, humidity, fan, heater?, humidifier?
  door_open?, power_on?
}

Methods:
- connect()          // Open Web Serial port (baudrate: 115200)
- disconnect()       // Close port
- sendCommand(cmd)   // Send JSON command
- readData()         // Listen for sensor updates (runs in background)
```

**Command Format** (JSON over serial):
```json
// Outgoing commands to device:
{ "command": "set_fan", "level": 4 }
{ "command": "set_power", "state": true }
{ "command": "set_heater", "level": 3 }
{ "command": "configure_devices", "config": { "sensorPin": 4, ... } }
```

#### `useYolobitServer.ts` - Backend Server Connection
- Connects via HTTP API instead of direct serial
- Same sensor data structure
- Suitable for remote monitoring

---

## 3. BACKEND ARCHITECTURE

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **API Protocol**: RESTful HTTP + WebSocket
- **Real-time**: WebSocket (ws library)
- **Gateway Communication**: Axios HTTP
- **Data Storage**: In-memory (mock) - can connect to SQL Server

### Backend Server (`server.js`) - Port 8000

#### **Telemetry Collection**
```
POST /api/telemetry
├── Receives sensor data from Flask Gateway
├── Stores last 1000 records (RAM limit)
├── Updates latestData object
├── Broadcasts to WebSocket clients
└── Updates machine state in memory
```

**Payload Structure:**
```json
{
  "zone_id": 1,
  "zone_name": "Tòa A",
  "temperature": 58.5,
  "humidity": 42.3,
  "fan_level": 3,
  "door_status": 0,
  "timestamp": "2026-05-13T10:30:00Z"
}
```

#### **Control Command Routing**
```
POST /api/control
├── Receives command from frontend
├── Forwards to Flask Gateway (port 5000)
├── Returns gateway response
└── Commands: set_fan, set_power, configure_devices
```

#### **Data Retrieval APIs**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/machines` | GET | Get all machines |
| `/api/telemetry/latest` | GET | Get latest sensor readings |
| `/api/logs` | GET | Get formatted telemetry history |
| `/api/users` | GET | Get all users |
| `/api/schedules` | GET | Get all schedules |
| `/api/schedules` | POST | Create new schedule |
| `/api/schedules/:id` | PUT | Update schedule |

#### **User Management**
```
GET  /api/users                 - List all users
POST /api/users                 - Create new user
PUT  /api/users/:username       - Update user
DELETE /api/users/:username     - Delete user
```

#### **OTP Service Integration**
```
POST /api/otp/request           - Request OTP from Python service
POST /api/otp/verify            - Verify OTP code
POST /api/users/reset-password  - Change password
```

#### **WebSocket Server** - Port 3001
```javascript
Connection Flow:
1. Client connects to ws://localhost:3001
2. Server sends initial telemetry data
3. Server broadcasts updates from:
   - /api/telemetry events
   - Machine state changes
4. Messages: { type: 'telemetry_update', data: {...} }
```

### Mock Data

#### **Machines** (In-memory)
```
MCH-001: "Máy sấy xoài 01" (Building BLD-001)
MCH-002: "Máy sấy chuối 01" (Building BLD-001)
MCH-003: "Máy sấy thanh long 01" (Building BLD-002)
MCH-004: "Máy sấy dứa 01" (Building BLD-002)
MCH-005: "Máy sấy nhãn thử nghiệm" (Building BLD-003)
```

#### **Sample Schedules**
```
SCH-MANGO-STD: Xoài tiêu chuẩn (720 min total)
  - Step 1: 120 min, 45-50°C, 45-55% humidity
  - Step 2: 360 min, 58-62°C, 30-40% humidity
  - Step 3: 240 min, 52-56°C, 25-35% humidity

SCH-BANANA-LOW: Chuối nhiệt thấp (600 min total)
  - Similar structure with different parameters
```

#### **Sample Users**
```
admin01: role=admin, name=Nguyễn An
employee01-04: role=employee, various names
```

---

## 4. PYTHON BACKEND SERVICES

### Flask Gateway (`backend/adafruit_gateway.py`) - Port 5000

**Purpose**: Bridge between Adafruit IO (MQTT) and Node.js backend

**MQTT Connection**:
- **Broker**: io.adafruit.com (Adafruit IO)
- **Port**: 1883
- **Authentication**: AIO_USERNAME + AIO_KEY (from .env)

**Feed Mapping** (Adafruit IO topics):
```
f"{AIO_USERNAME}/f/temperature" → zone data (temp)
f"{AIO_USERNAME}/f/humidity"    → zone data (humidity)
f"{AIO_USERNAME}/f/fan"         → zone data (fan level)
f"{AIO_USERNAME}/f/door"        → zone data (door status)
```

**Data Flow**:
```
Adafruit IO (MQTT)
        ↓ (MQTT Subscribe)
MQTT Client receives new data
        ↓ (Check if data changed)
Mark zone as "has_new_data"
        ↓ (HTTP POST)
Send to Node.js /api/telemetry
        ↓
Node.js broadcasts via WebSocket
        ↓
Frontend receives real-time update
```

**Payload Sent to Backend**:
```json
{
  "zone_id": 1,
  "zone_name": "Tòa A",
  "temperature": 58.5,
  "humidity": 42.3,
  "fan_level": 3,
  "door_status": 0
}
```

**Configuration (.env)**:
```
ADAFRUIT_IO_KEY=...
ADAFRUIT_IO_USERNAME=...
OWNER_USERNAME=...
TELEMETRY_URL=http://localhost:8000/api/telemetry
```

### OTP Service (`backend/otp_service.py`) - Port 5001

**Purpose**: Handle password reset with One-Time Password verification

**Endpoints**:
```
POST /api/otp/generate
  ├── Input: { "email": "user@example.com" }
  ├── Generates 4-digit OTP
  ├── Sends via SMTP email
  ├── Stores in memory with 5-min expiry
  └── Response: { "success": true }

POST /api/otp/verify
  ├── Input: { "email": "...", "otp": "1234" }
  ├── Validates OTP and expiry
  └── Response: { "success": true }
```

**Email Configuration (.env)**:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Email Template**:
```
Subject: Mã xác thực (OTP) đặt lại mật khẩu
Body: 
  Chào bạn,
  Mã xác thực (OTP) để đặt lại mật khẩu của bạn là: [OTP]
  Mã này sẽ hết hạn trong vòng 5 phút...
```

---

## 5. DATABASE SCHEMA (SQL Server)

### Database: `DryingManagementDB`

#### **Users Table**
```sql
CREATE TABLE Users (
    userId NVARCHAR(50) PRIMARY KEY,
    username NVARCHAR(50) UNIQUE NOT NULL,
    passwordHash NVARCHAR(255) NOT NULL,
    firstName, lastName NVARCHAR(100),
    fullName (COMPUTED: firstName + ' ' + lastName),
    email NVARCHAR(255) UNIQUE,
    phoneNumber NVARCHAR(20),
    role NVARCHAR(20) CHECK (role IN ('employee', 'admin')),
    passwordResetToken, passwordResetTokenExpiration
);
```

#### **Buildings Table**
```sql
CREATE TABLE Buildings (
    buildingId NVARCHAR(50) PRIMARY KEY,
    buildingName NVARCHAR(100) NOT NULL,
    location NVARCHAR(255) NOT NULL
);
```

#### **FruitTypes Table**
```sql
CREATE TABLE FruitTypes (
    fruitTypeId NVARCHAR(50) PRIMARY KEY,
    fruitTypeName NVARCHAR(100) NOT NULL,
    description NVARCHAR(255)
);
```

#### **Schedules & ScheduleSteps Tables**
```sql
CREATE TABLE Schedules (
    scheduleId NVARCHAR(50) PRIMARY KEY,
    scheduleName NVARCHAR(100) NOT NULL,
    fruitTypeId NVARCHAR(50) FK → FruitTypes,
    durationMinutes INT,
    createdAt DATETIME2
);

CREATE TABLE ScheduleSteps (
    stepId NVARCHAR(50) PRIMARY KEY,
    scheduleId NVARCHAR(50) FK → Schedules,
    stepOrder INT,
    durationMinutes INT,
    tempMin, tempMax DECIMAL(5,2),
    humidityMin, humidityMax DECIMAL(5,2),
    fanLevel INT (0-3),
    heaterLevel INT (0-5),
    doorOpen BIT
);
```

#### **Machines Table**
```sql
CREATE TABLE Machines (
    machineId NVARCHAR(50) PRIMARY KEY,
    machineName NVARCHAR(100) NOT NULL,
    buildingId NVARCHAR(50) FK → Buildings,
    managerUserId NVARCHAR(50) FK → Users,
    scheduleId NVARCHAR(50) FK → Schedules,
    
    -- Status
    isOn BIT,
    isDoorOpen BIT,
    mode NVARCHAR(20) ('manual', 'automatic'),
    lastUpdate DATETIME2,
    
    -- Telemetry
    currentTemp, targetTempMin, targetTempMax DECIMAL(5,2),
    currentHumidity, targetHumidityMin, targetHumidityMax DECIMAL(5,2),
    
    -- Control
    fanLevel INT (0-3),
    heaterLevel INT (0-5),
    humidifierLevel INT (0-5),
    
    currentFruitType NVARCHAR(50) FK → FruitTypes,
    position NVARCHAR(50),
    machineType NVARCHAR(50)
);
```

#### **MachineLogs Table** (Telemetry History)
```sql
CREATE TABLE MachineLogs (
    machineLogId NVARCHAR(50) PRIMARY KEY,
    machineId NVARCHAR(50) FK → Machines,
    buildingId NVARCHAR(50) FK → Buildings,
    loggedAt DATETIME2,
    temp, humidity DECIMAL(5,2),
    fanLevel INT,
    isOn, isDoorOpen BIT,
    mode NVARCHAR(20)
);
```

#### **ActivityLogs Table**
```sql
CREATE TABLE ActivityLogs (
    activityLogId NVARCHAR(50) PRIMARY KEY,
    userId NVARCHAR(50) FK → Users,
    timestamp DATETIME2,
    username, userRole NVARCHAR(20),
    action, target, details NVARCHAR(255)
);
```

#### **Devices Table** (For advanced device management)
```sql
CREATE TABLE Devices (
    deviceId NVARCHAR(50) PRIMARY KEY,
    deviceName, machineId NVARCHAR(50) FK → Machines,
    deviceType NVARCHAR(50),
    description NVARCHAR(255),
    isActive BIT
);
```

### Relationships
```
Users ──┬─→ Machines (as manager)
        └─→ ActivityLogs

Buildings ──┬─→ Machines
            └─→ MachineLogs

FruitTypes ──┬─→ Schedules
             └─→ Machines (currentFruit)

Schedules ──┬─→ ScheduleSteps
            └─→ Machines

Machines ──┬─→ MachineLogs (history)
           └─→ Devices
```

---

## 6. IOT DEVICE INTEGRATION (Yolobit)

### Yolobit Microcontroller (`yolobit_example.py`)

**Hardware**:
- Yolobit ESP32-based board
- DT20 temperature/humidity sensor (I2C)
- PWM fan control
- Digital door sensor (optional)
- Power relay control

**Configuration** (Dynamic GPIO mapping):
```python
config = {
    'sensorPin': 0,       # I2C SDA for DT20
    'fanPin': 2,          # PWM pin for fan
    'doorPin': 3,         # Door sensor digital input
    'powerPin': 4,        # Power relay output
    'heaterPin': 5,       # Heater PWM
    'humidifierPin': 6    # Humidifier PWM
}
```

**Features**:
1. **Sensor Reading** (I2C - DT20)
   - Temperature: 0-80°C
   - Humidity: 0-100%

2. **Fan Control** (PWM)
   ```python
   fan_levels = [0, 200, 400, 600, 800, 1023]  # 0-5 speed levels
   ```

3. **Heater Control** (PWM)
   - 0 = off, 1-5 = heating levels

4. **Humidifier Control** (PWM)
   - 0 = off, 1-5 = humidity levels

5. **Serial Communication** (JSON format)

### Data Exchange Protocol

#### **Sensor Data (Device → Backend)**
```json
{
  "temp": 58.5,
  "humidity": 42.3,
  "fan": 3,
  "heater": 2,
  "humidifier": 1,
  "door_open": false,
  "power_on": true
}
```

#### **Commands (Backend → Device)**
```json
// Set fan speed (0-5)
{ "command": "set_fan", "level": 4 }

// Control power relay
{ "command": "set_power", "state": true }

// Set heater level
{ "command": "set_heater", "level": 3 }

// Set humidifier level
{ "command": "set_humidifier", "level": 2 }

// Configure GPIO pins dynamically
{
  "command": "configure_devices",
  "config": {
    "sensorPin": 4,
    "fanPin": 2,
    "doorPin": 3,
    "powerPin": 4,
    "heaterPin": 5,
    "humidifierPin": 6
  }
}
```

### Connection Methods

#### **Method 1: Direct Web Serial API (useYolobit.ts)**
```
Frontend ← USB Cable → Yolobit
  ↓ Web Serial API
  ↓ Direct JSON commands & sensor reads
  ✓ No backend required
  ✓ Real-time response
  ✗ Browser security restrictions
```

#### **Method 2: Backend Bridge (useYolobitServer.ts)**
```
Frontend → Backend (HTTP) → Yolobit (Serial/MQTT)
  ✓ Remote operation
  ✓ Better security
  ✗ Slight latency
```

### Machine Configuration Workflow
```
User navigates to Machines Page
        ↓
Clicks "Cấu hình thiết bị" button
        ↓
Opens device config dialog
        ↓
Selects GPIO pins for each device:
  - DT20 sensor (I2C pins)
  - Fan PWM pin
  - Door sensor pin (optional)
  - Power relay pin (optional)
        ↓
Clicks "Lưu cấu hình"
        ↓
Frontend sends JSON command via useYolobit:
  { "command": "configure_devices", "config": {...} }
        ↓
Yolobit reinitializes devices with new pins
        ↓
Success: Real-time sensor data starts flowing
```

---

## 7. DATA FLOW & API ENDPOINTS

### Authentication Flow
```
Frontend: Login
  ↓ POST /api/login (if direct)
  └ or Manual validation in AppContext
  
If password reset:
  ↓ POST /api/otp/request → OTP Service
  ↓ OTP Service sends email
  ↓ POST /api/otp/verify
  ↓ POST /api/users/reset-password
```

### Real-time Telemetry Flow
```
Yolobit (Serial)
  ↓ DT20 sensor readings
  
[Two paths exist]

Path A: Direct Frontend Connection
  ↓ useYolobit.ts (Web Serial API)
  ↓ Frontend reads JSON directly
  ↓ Updates AppContext immediately

Path B: Via MQTT Gateway
  ↓ Yolobit sends to Adafruit IO (MQTT)
  ↓ Flask Gateway subscribes to feeds
  ↓ POST /api/telemetry (to Node.js)
  ↓ Node.js broadcasts via WebSocket
  ↓ Frontend receives update
  ↓ Updates AppContext
```

### Machine Control Flow
```
User adjusts fan slider in UI
  ↓ onChange event
  ↓ sendCommand("set_fan", level)
  
[Via useYolobit - direct]
  ↓ Write to serial port
  ↓ Yolobit receives JSON
  ↓ Updates PWM duty cycle
  ↓ Fan speed changes immediately

[Via useYolobitServer - backend]
  ↓ POST /api/control
  ↓ Backend forwards to Flask Gateway
  ↓ Gateway sends to Adafruit/Yolobit
  ↓ Device responds
```

### Schedule Execution Flow
```
Machine assigned to schedule
  ↓ Schedule has multiple steps
  ↓ Current step: target temp 50-60°C, humidity 30-40%
  ↓
Automatic mode: System monitors current values
  ↓ If temp < 50: Heater ON
  ↓ If temp > 60: Heater OFF, Fan increase
  ↓ If humidity < 30: Humidifier ON
  ↓ If humidity > 40: Humidifier OFF, Fan increase
  ↓
Step duration expires → Next step activates
  ↓ Update target ranges
  ↓ Continue monitoring
```

### Activity Logging
```
User performs action (login, control change, etc.)
  ↓ logActivity(action, target, details) in AppContext
  ↓ ActivityLog entry created with:
     - userId, username, userRole
     - timestamp
     - action type (e.g., "CONTROL_FAN")
     - target (e.g., "MCH-001")
     - details (e.g., "Fan level changed from 2 to 4")
  ↓ Stored in database
  ↓ Available in ActivityLogsPage
```

---

## 8. KEY COMPONENTS INTERACTIONS

### Component Dependency Map
```
App.tsx (Root)
  ├── AppProvider (Context)
  │   └── Provides global state
  │
  ├── RouterProvider
  │   ├── LoginPage
  │   │   └── Uses: AppContext.login(), AppContext.requestOTP()
  │   │
  │   └── Layout (Protected Routes)
  │       ├── DashboardPage
  │       │   └── Reads: buildings, machines
  │       │
  │       ├── MachinesPage
  │       │   ├── Uses: useYolobit or useYolobitServer
  │       │   ├── Reads: machines, buildings, schedules
  │       │   ├── Actions: updateMachine, sendControl commands
  │       │   └── UI: Slider for fan/heater/humidifier control
  │       │
  │       ├── SchedulesPage
  │       │   ├── Reads: schedules, machines
  │       │   └── Actions: addSchedule, updateSchedule
  │       │
  │       ├── StatisticsPage
  │       │   ├── Reads: logs, machines
  │       │   └── Charts: AdvancedCharts component
  │       │
  │       ├── BuildingsPage
  │       │   ├── Reads: buildings, machines
  │       │   └── Actions: addBuilding, removeBuilding
  │       │
  │       ├── UsersPage
  │       │   ├── Reads: users
  │       │   └── Actions: addUser, updateUser, removeUser
  │       │
  │       └── ActivityLogsPage
  │           └── Reads: activityLogs
  │
  └── UI Component Library
      └── 30+ shadcn/ui components (Button, Dialog, Slider, etc.)
```

### Communication Channels
```
Frontend ↔ Backend (Node.js)
  ├── HTTP GET/POST/PUT/DELETE
  │   ├── /api/machines (GET)
  │   ├── /api/machines (POST, add)
  │   ├── /api/machines/:id (PUT, update)
  │   ├── /api/machines/:id (DELETE, remove)
  │   ├── /api/telemetry (POST, receive from gateway)
  │   ├── /api/telemetry/latest (GET)
  │   ├── /api/control (POST, send commands)
  │   ├── /api/schedules/* (CRUD operations)
  │   ├── /api/users/* (CRUD + password reset)
  │   └── /api/otp/* (OTP flow)
  │
  └── WebSocket (ws://localhost:3001)
      └── Real-time telemetry broadcasts
          ├── Initial connection: Sends latestData
          └── Continuous: { type: 'telemetry_update', data: {...} }

Frontend ↔ Yolobit (Direct)
  ├── Web Serial API (USB)
  ├── Baud rate: 115200
  ├── Send: JSON commands
  └── Receive: JSON sensor data (every 100-200ms)

Backend ↔ Adafruit IO
  ├── MQTT Protocol
  ├── Broker: io.adafruit.com:1883
  ├── Topics: {username}/f/temperature, etc.
  └── Publishes to /api/telemetry

Backend ↔ OTP Service (Python)
  └── HTTP JSON requests/responses

Backend ↔ SQL Server Database
  └── Persistent data storage (optional in this mock system)
```

---

## 9. SYSTEM FEATURES

### User Management
- ✅ Role-based access (employee, admin)
- ✅ Authentication with OTP
- ✅ Password reset via email
- ✅ User CRUD operations (admin only)

### Machine Management
- ✅ Add/remove machines
- ✅ Assign to buildings
- ✅ Assign drying schedules
- ✅ Configure GPIO pins dynamically
- ✅ Manual/automatic operation mode
- ✅ Real-time sensor monitoring
- ✅ Control: Fan, heater, humidifier levels
- ✅ Door status monitoring

### Schedule Management
- ✅ Create multi-step drying schedules
- ✅ Set temperature & humidity targets per step
- ✅ Define step duration
- ✅ Assign to machines
- ✅ Fruit type classification

### Monitoring & Analytics
- ✅ Real-time dashboard with KPIs
- ✅ Temperature/humidity trend charts
- ✅ Machine status visualization
- ✅ Alert system (deviation from targets)
- ✅ Statistics by building/machine
- ✅ Activity log tracking

### Hardware Integration
- ✅ Yolobit microcontroller support
- ✅ DT20 sensor (temperature/humidity)
- ✅ PWM fan control
- ✅ Heater and humidifier control
- ✅ Door sensor input
- ✅ Power relay control
- ✅ Direct Web Serial API connection
- ✅ Adafruit IO (MQTT) integration

### Reporting
- ✅ PDF/Excel export (reportExport.ts)
- ✅ Custom date range reports
- ✅ Machine performance reports
- ✅ Activity summary reports

---

## 10. DEPLOYMENT & CONFIGURATION

### Environment Variables (.env - Backend)
```bash
# Adafruit IO (Gateway)
ADAFRUIT_IO_KEY=your_aio_key
ADAFRUIT_IO_USERNAME=your_username
OWNER_USERNAME=your_owner_username
TELEMETRY_URL=http://localhost:8000/api/telemetry

# OTP Service Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Flask Gateway
GATEWAY_URL=http://localhost:5000/api/control
OTP_SERVICE_URL=http://localhost:5001/api/otp
```

### Running the System

#### **Development Setup**
```bash
# Terminal 1: Frontend (Vite dev server)
npm install
npm run dev
# → Runs on http://localhost:5173

# Terminal 2: Node.js Backend
cd backend
npm install
npm start
# → Runs on http://localhost:8000
# → WebSocket on ws://localhost:3001

# Terminal 3: Flask Gateway (if using MQTT)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python adafruit_gateway.py
# → Runs on http://localhost:5000

# Terminal 4: OTP Service
python otp_service.py
# → Runs on http://localhost:5001

# Terminal 5: Yolobit (separate USB connection)
# Upload yolobit_example.py to board using IDE
# Device communicates via USB serial at 115200 baud
```

#### **Build for Production**
```bash
npm run build
# → Generates dist/ folder with optimized frontend
```

---

## 11. TECH STACK SUMMARY

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, TypeScript, Vite | UI/UX, State management |
| **Frontend Build** | Tailwind CSS, shadcn/ui, Radix UI | Styling & components |
| **Frontend Charts** | Recharts, MUI | Data visualization |
| **HTTP Client** | Axios | API communication |
| **Real-time** | WebSocket (ws), Web Serial API | Live updates & device control |
| **Backend Runtime** | Node.js | JavaScript runtime |
| **Backend Framework** | Express.js | HTTP server & routing |
| **Backend Real-time** | WebSocket (ws) | Broadcast telemetry |
| **Gateway (Python)** | Flask, paho-mqtt | MQTT to HTTP bridge |
| **OTP Service (Python)** | Flask, smtplib | Email OTP generation |
| **Database** | SQL Server | Data persistence |
| **IoT Device** | Yolobit (ESP32), DT20, Python | Hardware sensors & control |
| **IoT Cloud** | Adafruit IO (optional) | IoT cloud platform |

---

## 12. KEY FILES REFERENCE

```
Frontend:
  src/main.tsx                          # Entry point
  src/app/App.tsx                       # Root component
  src/app/routes.ts                     # Route definitions
  src/app/types.ts                      # Data type definitions
  src/app/context/AppContext.tsx        # Global state
  src/app/pages/*.tsx                   # Page components
  src/app/hooks/useYolobit.ts           # Hardware hook
  src/app/hooks/useYolobitServer.ts     # Backend bridge hook
  src/app/components/Layout.tsx         # Main layout
  src/styles/*.css                      # Styling

Backend:
  backend/server.js                     # Main Express server
  backend/package.json                  # Node dependencies
  backend/adafruit_gateway.py          # MQTT gateway
  backend/otp_service.py               # OTP service
  backend/requirement.txt               # Python dependencies

Database:
  database/Create table.sql             # Schema definition
  database/insertdata.sql               # Sample data
  database/TESTDB.sql                   # Test database
  database/Triggers.sql                 # Database triggers

IoT:
  yolobit_example.py                    # Microcontroller code
  connect_serial.py                     # Serial connection utility

Config:
  vite.config.ts                        # Frontend build config
  postcss.config.mjs                    # PostCSS config
  package.json                          # Frontend dependencies
  CONFIG_GUIDE.md                       # Configuration documentation
  INTEGRATION_GUIDE.md                  # Integration guide
```

---

## 13. SYSTEM LIMITATIONS & CONSIDERATIONS

### Current State
- ✅ Fully functional frontend UI
- ✅ Mock backend with in-memory data
- ✅ Direct hardware integration working
- ⚠️ Database connection not yet implemented (uses mock data)
- ⚠️ MQTT integration optional (can work with direct serial)

### Scalability
- In-memory telemetry limited to 1000 recent records
- WebSocket broadcasts to all connected clients (no filtering)
- Single-server deployment (no clustering)

### Security
- OTP implemented but limited SMTP validation
- Password stored as hash in mock (real DB needed)
- No JWT tokens (relies on session storage)
- Frontend stores user in context (no secure storage)

### Future Enhancements
- Connect to actual SQL Server database
- Implement JWT authentication
- Add role-based access control (RBAC) on backend
- Database connection pooling
- Multi-tenant support
- Data archival & cleanup
- Advanced alerting system
- Machine learning for predictive maintenance

---

This comprehensive overview provides a complete understanding of the DADN Fruit Dryer Management System architecture, data flows, component interactions, and integration points.
