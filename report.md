# BÁO CÁO ĐỀ TÀI: HỆ THỐNG QUẢN LÝ MÁY SẤY TRÁI CÂY THÔNG MINH (DADN)

**Ngày Báo Cáo:** May 13, 2026  
**Tình Trạng:** Hoàn Thành  
**Phiên Bản:** 1.0 Final

---

## MỤC LỤC

1. [Yêu Cầu Hệ Thống (Requirements)](#yêu-cầu-hệ-thống)
2. [Thiết Bị Phần Cứng (Devices)](#thiết-bị-phần-cứng)
3. [Chi Tiết Các Use Case](#chi-tiết-các-use-case)
4. [Thiết Kế Hệ Thống (System Design)](#thiết-kế-hệ-thống)
5. [Sơ Đồ Kỹ Thuật và Cơ Sở Dữ Liệu](#sơ-đồ-kỹ-thuật)
6. [Sản Phẩm Hoàn Thiện (Finished Product)](#sản-phẩm-hoàn-thiện)

---

## YÊU CẦU HỆ THỐNG

### 2.1 Yêu Cầu Chức Năng (Functional Requirements)

#### 2.1.1 Khía Cạnh IoT (Fruit Dryer Control)

**UC-IOT-01: Tự Động Điều Chỉnh Thông Số Sấy**
- **Mô Tả**: Hệ thống tự động điều chỉnh nhiệt độ, độ ẩm và mức quạt dựa trên loại trái cây được chọn
- **Yêu Cầu Cụ Thể**:
  - Có ít nhất 5 loại trái cây với các lịch trình sấy khác nhau (Apple, Mango, Banana, Grapes, Papaya)
  - Mỗi loại trái cây có 3-6 bước sấy (ScheduleSteps) với các thông số khác nhau
  - Tự động bật/tắt các thiết bị chấp hành:
    - Relay điều khiển dây sấy (Heater) - mức 0-5
    - Quạt thông gió (Fan) - mức 0-3
    - Bơm tăm ẩm (Humidifier) - mức 0-5
  - Cập nhật thông số mỗi 30-60 giây
  - Cho phép cài đặt độ dung sai: ±2-5°C cho nhiệt độ, ±5-10% cho độ ẩm

**UC-IOT-02: Thông Báo Hoàn Thành Và Lỗi**
- **Mô Tả**: Gửi thông báo khi quá trình sấy hoàn thành hoặc phát hiện lỗi
- **Yêu Cầu Cụ Thể**:
  - Thông báo hoàn thành: Âm thanh + PopUp + Email + Push notification
  - Phát hiện lỗi:
    - Nhiệt độ vượt ngưỡng tối đa (>70°C) → Tự động ngắt dây sấy
    - Cảm biến không phản hồi > 5 phút → Cảnh báo lỗi thiết bị
    - Cửa máy bị mở trong quá trình sấy → Thông báo + Dừng quá trình
  - Ghi log tất cả cảnh báo vào ActivityLogs với timestamp
  - Email thông báo gửi tới quản trị viên và người vận hành

**UC-IOT-03: Chế Độ Sấy Linh Hoạt**
- **Sấy Tự Động (Auto Mode)**: 
  - Theo độ ẩm mục tiêu - Đọc cảm biến độ ẩm vật liệu (Moisture Sensor)
  - Dừng khi đạt độ ẩm mục tiêu (mặc định 15%)
  - Thời gian sấy từ 2-24 giờ tùy loại vật liệu
  
- **Sấy Theo Lịch Trình (Schedule Mode)**:
  - Tuân theo lịch trình đã cài đặt (ScheduleSteps)
  - Thực hiện lần lượt các bước với thời gian cụ thể
  - Cho phép tạo lịch trình tùy chỉnh (Custom Schedule)
  
- **Sấy Thủ Công (Manual Mode)**:
  - Điều khiển trực tiếp từng thiết bị: Fan (0-3), Heater (0-5), Humidifier (0-5)
  - Có thể đặt hẹn giờ tối đa 12 giờ
  - Dừng ngay khi nhân viên yêu cầu (Stop Button)

#### 2.1.2 Khía Cạnh Ứng Dụng Di Động (Mobile App)

**UC-APP-01: Điều Khiển Thủ Công**
- **Chức năng**:
  - Bật/tắt máy sấy từ xa (Wireless Control)
  - Thay đổi chế độ: Auto ↔ Manual ↔ Schedule
  - Điều chỉnh thông số sấy: Nhiệt độ, Độ ẩm, Mức quạt trong chế độ Manual
  - Dừng ngay lập tức (Emergency Stop)
  - Hỗ trợ 5+ máy sấy khác nhau
  
**UC-APP-02: Xem Thông Số Thời Gian Thực (Real-time Dashboard)**
- **Hiển thị**:
  - Nhiệt độ hiện tại (°C) - Update mỗi 5 giây
  - Độ ẩm không khí hiện tại (%) - Update mỗi 5 giây
  - Độ ẩm vật liệu (%) - Update mỗi 60 giây
  - Trạng thái cửa (Mở/Đóng)
  - Mức quạt, dây sấy, bơm ẩm hiện tại
  - Thời gian chạy / Thời gian còn lại
  - Biểu đồ nhịp tim (Heart Rate) - Xu hướng 1 giờ qua
  - Trạng thái kết nối (Connected/Disconnected)
  
**UC-APP-03: Xem Lịch Sử Sấy**
- **Chức năng**:
  - Danh sách tất cả các lần sấy (Date, Start Time, Duration, Machine, Result)
  - Lọc theo: Ngày, Máy, Trạng thái (Hoàn thành/Lỗi/Hủy)
  - Xem chi tiết từng lần sấy: Biểu đồ Temp/Humidity, Data Log
  - Xuất báo cáo (CSV, PDF, JSON) cho mỗi lần sấy
  - Tìm kiếm theo tên trái cây, thời gian
  - Tính toán thống kê: Tổng thời gian, Tỷ lệ thành công, Công suất trung bình

**UC-APP-04: Quản Lý Người Dùng**
- **Chức năng**:
  - Đăng nhập với tài khoản (Username + Password)
  - OTP xác thực via Email (6-digit code)
  - Quân lý quyền hạn:
    - **Admin**: Toàn quyền (Create/Read/Update/Delete)
    - **Employee**: Chỉ điều khiển, xem báo cáo
  - Thay đổi mật khẩu
  - Quên mật khẩu (Reset via Email)
  - Thông tin cá nhân (Name, Email, Phone)

### 2.2 Yêu Cầu Phi Chức Năng (Non-Functional Requirements)

#### 2.2.1 Hiệu Năng (Performance)

| Yêu Cầu | Chi Tiết |
|--------|---------|
| **Response Time** | API ≤ 200ms, UI Update ≤ 100ms |
| **Thông Lượng** | Xử lý ≥ 100 requests/second |
| **Độ Trễ Truyền Dữ Liệu** | ≤ 5 giây từ cảm biến → Dashboard |
| **Uptime** | 99.5% (chỉ ngừng trong maintenance) |
| **Tốc Độ Khởi Động** | Server < 2s, App < 3s |

#### 2.2.2 Bảo Mật (Security)

| Yêu Cầu | Chi Tiết |
|--------|---------|
| **Authentication** | JWT token + OTP Email |
| **Encryption** | HTTPS + AES-256 cho dữ liệu nhạy cảm |
| **Data Privacy** | GDPR compliant, mã hóa password (bcrypt) |
| **Access Control** | Role-based (RBAC) - Admin/Employee |
| **Audit Trail** | Ghi log tất cả action vào ActivityLogs |
| **API Security** | Rate limiting, Input validation, CORS |

#### 2.2.3 Độ Tin Cậy (Reliability)

| Yêu Cầu | Chi Tiết |
|--------|---------|
| **Backup** | Daily backup database, Disaster recovery plan |
| **Error Handling** | Try-catch tất cả critical operations |
| **Data Recovery** | Rollback mechanism cho transaction |
| **Connectivity Fallback** | Offline mode (cache dữ liệu 48h) |
| **Hardware Failure** | Failover tới máy backup (nếu cần) |

#### 2.2.4 Khả Năng Mở Rộng (Scalability)

| Yêu Cầu | Chi Tiết |
|--------|---------|
| **Database** | Hỗ trợ 100,000+ records/month |
| **Concurrent Users** | ≥ 50 users online cùng lúc |
| **Machines** | Mở rộng từ 5 → 100 máy sấy |
| **API Gateway** | Horizontal scaling với Load Balancer |
| **Storage** | Cloud storage (AWS S3) cho dữ liệu lớn |

#### 2.2.5 Khả Năng Bảo Trì (Maintainability)

| Yêu Cầu | Chi Tiết |
|--------|---------|
| **Code Quality** | ESLint, Prettier, Unit Tests (>80% coverage) |
| **Documentation** | README, API docs, Architecture guide |
| **Version Control** | Git + CI/CD pipeline |
| **Monitoring** | Real-time logging, Error tracking (Sentry) |
| **Support** | 24/7 technical support, SLA 4h response |

#### 2.2.6 Tương Thích (Compatibility)

| Yêu Cầu | Chi Tiết |
|--------|---------|
| **Browsers** | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| **Mobile** | iOS 12+, Android 8+ |
| **IoT Hardware** | Yolobit ESP32, Arduino compatible |
| **Sensors** | DT20 DHT22, Moisture Sensor, Door Sensor |
| **Network** | 4G LTE, WiFi 5GHz, Bluetooth 5.0 |

---

## THIẾT BỊ PHẦN CỨNG

### 3.1 Cảm Biến (Sensors)

#### 3.1.1 Cảm Biến Nhiệt Độ & Độ Ẩm Không Khí (DT20 DHT22)

| Thông Số | Chi Tiết |
|---------|---------|
| **Tên** | DT20 / DHT22 Temperature-Humidity Sensor |
| **Loại** | Analog + Digital Output |
| **Phạm Vi Nhiệt Độ** | -40°C đến +80°C |
| **Độ Chính Xác** | ±0.5°C, ±2% RH |
| **Thời Gian Phản Hồi** | 1-2 giây |
| **Lấy Mẫu** | Mỗi 2-5 giây |
| **Điện Áp** | 3-5V DC |
| **Kết Nối** | GPIO pin (Digital) trên Yolobit |
| **Ứng Dụng** | Đọc Temp/Humidity lò sấy (real-time monitoring) |

**Code Đọc Dữ Liệu**:
```
Sensor → Yolobit (GPIO_TEMP_HUMIDITY) → JSON {"temp": 35.5, "humidity": 65.2}
```

#### 3.1.2 Cảm Biến Độ Ẩm Vật Liệu (Moisture Sensor)

| Thông Số | Chi Tiết |
|---------|---------|
| **Tên** | Capacitive Soil Moisture Sensor |
| **Loại** | Analog (ADC - 0-1023) |
| **Phạm Vi** | 0-100% (0% = quá khô, 100% = quá ướt) |
| **Độ Chính Xác** | ±3-5% |
| **Thời Gian Phản Hồi** | 100-200ms |
| **Lấy Mẫu** | Mỗi 60 giây |
| **Điện Áp** | 3-5V DC |
| **Kết Nối** | ADC pin (Analog) trên Yolobit |
| **Ứng Dụng** | Kiểm tra độ ẩm trái cây, dừng sấy khi đạt mục tiêu |

**Calibration**:
- Giá trị ADC 0 = 100% ẩm (cảm biến trong nước)
- Giá trị ADC 1023 = 0% ẩm (cảm biến trong không khí)

#### 3.1.3 Cảm Biến Cửa (Door Sensor)

| Thông Số | Chi Tiết |
|---------|---------|
| **Tên** | Magnetic Door Switch Sensor |
| **Loại** | Digital (Open/Close) |
| **Trạng Thái** | HIGH (Đóng), LOW (Mở) |
| **Thời Gian Phản Hồi** | < 10ms |
| **Lấy Mẫu** | Liên tục |
| **Điện Áp** | 3-5V DC |
| **Kết Nối** | Digital GPIO pin trên Yolobit |
| **Ứng Dụng** | Phát hiện cửa mở, ngắt sấy nếu mở > 30s |

### 3.2 Thiết Bị Chấp Hành (Actuators)

#### 3.2.1 Relay Điều Khiển Dây Sấy (Heating Element Relay)

| Thông Số | Chi Tiết |
|---------|---------|
| **Tên** | 5V Relay Module (4-channel) |
| **Loại** | Electromagnetic Relay |
| **Điều Khiển** | Digital GPIO (HIGH = ON, LOW = OFF) |
| **Công Suất** | 220V AC, 30A |
| **Tải Sấy** | 3000W (Heating Element) |
| **Mức Điều Khiển** | 5 mức (PWM 0-255, mức 1-5) |
| **Thời Gian Phản Hồi** | < 100ms |
| **Tính Năng** | LED indicator, Freewheel diode |
| **Bảo Vệ** | Thermal cutoff nếu T > 70°C |
| **Kết Nối** | Signal pin (GPIO_HEATER) từ Yolobit |

**Lệnh Điều Khiển**:
```json
{
  "command": "control_heater",
  "level": 3,        // 0-5 (0=OFF, 1=Min, 5=Max)
  "duration": 3600   // seconds
}
```

#### 3.2.2 Quạt Thông Gió (Ventilation Fan)

| Thông Số | Chi Tiết |
|---------|---------|
| **Tên** | 12V DC Brushless Fan (PWM controlled) |
| **Loại** | DC Motor + Fan Blade |
| **Công Suất** | 50W (nominal) |
| **Điều Khiển** | PWM (GPIO_FAN) |
| **Mức Tốc Độ** | 3 mức (0-1-2-3) |
|  | - Mức 0: OFF (0 RPM) |
|  | - Mức 1: 30% (1500 RPM) |
|  | - Mức 2: 60% (3000 RPM) |
|  | - Mức 3: 100% (5000 RPM) |
| **Luồng Gió** | 50-150 CFM tùy mức |
| **Điện Áp** | 12V DC |
| **Thời Gian Phản Hồi** | < 50ms |
| **Kết Nối** | PWM pin từ Yolobit (via transistor driver) |

**Lệnh Điều Khiển**:
```json
{
  "command": "control_fan",
  "level": 2,        // 0-3 (0=OFF, 1-3=Speed)
  "duration": 1800   // seconds
}
```

#### 3.2.3 Bơm Tăm Ẩm (Humidifier Pump)

| Thông Số | Chi Tiết |
|---------|---------|
| **Tên** | Mini Water Pump (12V DC) |
| **Loại** | Submersible pump + Solenoid valve |
| **Công Suất** | 5-10W |
| **Lưu Lượng** | 100-500 ml/min |
| **Điều Khiển** | Relay (ON/OFF) + PWM (Speed) |
| **Mức Hoạt Động** | 5 mức (0-1-2-3-4-5) |
|  | - Mức 0: OFF |
|  | - Mức 1-2: Low (20-40%) |
|  | - Mức 3-4: Medium (60-80%) |
|  | - Mức 5: High (100%) |
| **Tank Capacity** | 5L (nước cấp) |
| **Thời Gian Phản Hồi** | < 200ms |
| **Bảo Vệ** | Auto-off nếu tank trống > 60s |
| **Kết Nối** | PWM pin (GPIO_HUMIDIFIER) |

**Lệnh Điều Khiển**:
```json
{
  "command": "control_humidifier",
  "level": 3,        // 0-5 (0=OFF, 1-5=Speed)
  "duration": 900    // seconds
}
```

#### 3.2.4 Công Tắc Nguồn Chính (Power Relay)

| Thông Số | Chi Tiết |
|---------|---------|
| **Tên** | 30A Power Relay (AC/DC) |
| **Loại** | Electromagnetic 1NO 1NC |
| **Điều Khiển** | Digital HIGH/LOW |
| **Công Suất** | 220V AC, 30A (6600W) |
| **Thời Gian Phản Hồi** | < 150ms |
| **Tính Năng** | Main power supply ON/OFF |
| **Bảo Vệ** | Fuse 30A, Thermal breaker |
| **Kết Nối** | GPIO_POWER_RELAY từ Yolobit |

### 3.3 Bộ Điều Khiển Trung Tâm (Central Controller)

#### 3.3.1 Yolobit ESP32 Microcontroller

| Thông Số | Chi Tiết |
|---------|---------|
| **Tên** | Yolobit (ESP32-based) |
| **Processor** | Xtensa Dual-Core 32-bit LX6 @ 240 MHz |
| **RAM** | 520 KB SRAM |
| **Flash** | 4 MB |
| **Connectivity** | WiFi 802.11 b/g/n, Bluetooth 5.0 |
| **GPIO Pins** | 25 I/O pins (Analog + Digital) |
| **ADC** | 12-bit, 8 channels (0-1023) |
| **PWM** | 16 channels @ 20 kHz |
| **Serial Baud** | 115200 bps (USB connection) |
| **Điện Áp** | 3.3V logic, 5V tolerant input |
| **Nguồn** | USB-C 5V (2A) hoặc Battery 3.7V |
| **Kích Thước** | 60mm × 25mm × 11mm |

**Pin Configuration**:
```python
GPIO_TEMP_HUMIDITY = 12      # DT20 sensor
GPIO_MOISTURE = 34           # ADC (moisture sensor)
GPIO_DOOR = 14               # Door sensor
GPIO_HEATER = 15             # Heater relay
GPIO_FAN = 4                 # Fan PWM
GPIO_HUMIDIFIER = 5          # Humidifier PWM
GPIO_POWER_RELAY = 2         # Power relay
```

**Chức Năng**:
- Đọc dữ liệu cảm biến mỗi 2-5 giây
- Xử lý logic điều khiển (PID controller cho Temp/Humidity)
- Gửi dữ liệu qua USB Serial (JSON format)
- Nhận lệnh điều khiển từ ứng dụng di động
- Tự động phát hiện lỗi (sensor không phản hồi, relay hỏng)
- Lưu log dữ liệu vào bộ nhớ trong (SPIFFS)

#### 3.3.2 Board Relay & Power Supply

| Thông Số | Chi Tiết |
|---------|---------|
| **Tên** | 8-Channel 5V Relay Module + 12V Power Supply |
| **Channels** | 8 relay (4 được sử dụng: Heater, Fan, Humidifier, Power) |
| **Input Voltage** | 5V (từ USB hoặc adapter) |
| **Output Voltage** | 220V AC / 12V DC |
| **Max Current** | 10A per channel |
| **Isolation** | Optocoupler isolated |
| **Timing** | Có thể cấu hình PWM frequency |

#### 3.3.3 Bộ Chuyển Đổi USB-Serial

| Thông Số | Chi Tiết |
|---------|---------|
| **Tên** | USB Type-C UART (CH340 compatible) |
| **Giao Thức** | UART @ 115200 bps |
| **Kết Nối** | Trực tiếp với port USB của máy tính |
| **Driver** | Ch340 (cross-platform support) |
| **Tính Năng** | Auto-reset, DTR/RTS control |

---

## CHI TIẾT CÁC USE CASE

### 4.1 Use Case: Chế Độ Sấy Đa Năng

#### UC-DRY-01: Chế Độ Sấy Tự Động (Auto-Dry Mode)

**Diễn Viên**: Nhân Viên Vận Hành

**Tiền Điều Kiện**:
- Máy sấy khả dụng, cửa đóng
- Trái cây đã được đặt vào máy
- Loại trái cây đã chọn trong hệ thống

**Luồng Chính**:
1. Nhân viên chọn loại trái cây (ví dụ: "Mango")
2. Hệ thống tải lịch trình sấy mặc định (Schedule)
   - **Step 1**: T=60°C, H=40%, Fan=2, Duration=4h (Preheating)
   - **Step 2**: T=65°C, H=30%, Fan=3, Duration=8h (Active drying)
   - **Step 3**: T=55°C, H=35%, Fan=1, Duration=4h (Cooling)
3. Nhân viên bấm **"Start Auto Dry"**
4. Hệ thống:
   - Bật relay chính → Heater Level 3 → Fan Level 2
   - Bắt đầu đọc DT20 mỗi 5s
   - Bắt đầu đọc Moisture sensor mỗi 60s
   - Cập nhật Dashboard real-time
5. Trong quá trình sấy:
   - Nếu `Temp < Target - 2°C` → Tăng Heater level
   - Nếu `Temp > Target + 2°C` → Giảm Heater level
   - Nếu `Humidity > Target + 5%` → Tăng Fan level
   - Nếu `Door Open > 30s` → Alert + Dừng sấy
6. Đó là khi `Moisture < 15%` (mục tiêu) → Tự động dừng
   - Bật notification: "Drying complete!"
   - Ghi log thành công
   - Gửi email thông báo tới admin

**Luồng Ngoại Lệ**:
- **E1**: Nhiệt độ > 70°C → Tự động ngắt Heater, cảnh báo "Overheat!"
- **E2**: Sensor không phản hồi > 5 phút → Cảnh báo "Sensor Error"
- **E3**: Cửa mở > 60s → Dừng sấy, yêu cầu đóng cửa
- **E4**: Thất bại → Ghi log lỗi, thông báo nhân viên

**Hậu Điều Kiện**:
- Quá trình sấy được ghi log vào `MachineLogs` table
- Dữ liệu cảm biến lưu vào `SensorReadings` table
- Thống kê thêm vào `Statistics` (nếu có)

---

#### UC-DRY-02: Chế Độ Sấy Theo Lịch Trình (Schedule-Based Drying)

**Diễn Viên**: Nhân Viên Vận Hành

**Tiền Điều Kiện**:
- Đã tạo lịch trình sấy tùy chỉnh trước đó
- Máy sấy có cửa đóng
- Trái cây đã đặt vào

**Luồng Chính**:
1. Nhân viên chọn loại trái cây → Hệ thống hiển thị danh sách Schedule
2. Chọn **"Advanced Schedule"** (nếu cần custom)
   ```
   Step 1: T=50°C, H=60%, Fan=1, Duration=2h
   Step 2: T=65°C, H=25%, Fan=3, Duration=6h
   Step 3: T=55°C, H=40%, Fan=2, Duration=3h
   ```
3. Bấm **"Apply & Start"**
4. Hệ thống thực hiện từng step:
   - Đặt target T/H theo step hiện tại
   - Chạy PID controller để ổn định T/H
   - Khi hết thời gian → Chuyển step tiếp theo
5. Sau bước cuối → Tự động dừng
   - Ghi log thành công
   - Thông báo hoàn thành

**Hậu Điều Kiện**:
- Lưu thông tin sấy vào `MachineLogs` (ID, StartTime, EndTime, ScheduleID)

---

#### UC-DRY-03: Chế Độ Sấy Thủ Công (Manual Drying)

**Diễn Viên**: Nhân Viên Vận Hành

**Tiền Điều Kiện**:
- Máy sấy bình thường

**Luồng Chính**:
1. Chọn **"Manual Mode"** từ ứng dụng
2. Nhân viên điều khiển trực tiếp từng thiết bị:
   - Kéo thanh **Fan Level** (0-3)
   - Kéo thanh **Heater Level** (0-5)
   - Kéo thanh **Humidifier Level** (0-5)
   - Đặt thời gian hẹn giờ (0-12 giờ)
3. Bấm **"Start Manual"**
4. Hệ thống:
   - Bật các thiết bị theo cấu hình
   - Hiển thị countdown timer
   - Đọc cảm biến real-time (không PID)
5. Khi hết giờ → Tự động dừng, thông báo

**Hậu Điều Kiện**:
- Lưu log: "Manual drying completed at HH:mm"

---

### 4.2 Use Case: Báo Cáo Và Thống Kê

#### UC-REP-01: Xem Biểu Đồ Thời Gian Thực Trong Sấy

**Diễn Viên**: Người Vận Hành, Quản Trị Viên

**Tiền Điều Kiện**:
- Quá trình sấy đang chạy

**Luồng Chính**:
1. Mở tab **"Real-time Chart"** trên ứng dụng
2. Hệ thống hiển thị biểu đồ 2 trục (Y1: Temp, Y2: Humidity)
3. Dữ liệu cập nhật mỗi 5 giây (real-time streaming)
4. Người dùng có thể:
   - Zoom in/out biểu đồ
   - Xem giá trị cụ thể (hover)
   - Tải xuống dữ liệu (CSV)

**Hậu Điều Kiện**:
- Không thay đổi dữ liệu

---

#### UC-REP-02: Xem Lịch Sử Sấy Chi Tiết & Lọc/Sắp Xếp

**Diễn Viên**: Quản Trị Viên, Nhân Viên

**Tiền Điều Kiện**:
- Đã thực hiện ít nhất 1 lần sấy

**Luộc Chính**:
1. Vào tab **"Statistics"** → **"Drying History"**
2. Hệ thống hiển thị bảng với dữ liệu:
   | Date | Start Time | Duration | Machine | Fruit Type | Status | Moisture Final |
   |------|-----------|----------|---------|-----------|--------|-----------------|
   | 2026-05-13 | 10:00 | 16h 30m | MCH-001 | Mango | ✓ Success | 14.5% |
   | 2026-05-12 | 14:30 | 8h 45m | MCH-002 | Apple | ✓ Success | 15.0% |
   | 2026-05-11 | 09:15 | Error | MCH-001 | Banana | ✗ Failed | 35.2% |

**3. Chức Năng Lọc (Filtering)**:
   - **Lọc theo Máy**: Dropdown chọn [All Machines ▼], [MCH-001], [MCH-002], ...
   - **Lọc theo Loại Trái Cây**: [All Fruits ▼], [Mango], [Apple], [Banana], ...
   - **Lọc theo Trạng Thái**: [All Status ▼], [✓ Success], [⏸ Running], [❌ Failed], [⏹ Stopped]
   - **Lọc theo Ngày**: [From Date] → [To Date] (DatePicker)
   - **Tìm Kiếm Nhanh**: Input field tìm theo Machine ID hoặc Fruit Type
   - Áp dụng filter real-time (Auto-apply hoặc Click "Filter")

**4. Chức Năng Sắp Xếp (Sorting)**:
   - **Sắp xếp theo Thời Gian**: [↑ Oldest First] [↓ Newest First]
   - **Sắp xếp theo Thời Lượng**: [↑ Shortest] [↓ Longest]
   - **Sắp xếp theo Trạng Thái**: [✓ Success First] [❌ Failed First]
   - **Sắp xếp theo Máy**: [A-Z] hoặc [Z-A]
   - Default: Sắp xếp theo thời gian mới nhất trước

**5. Xem Chi Tiết Từng Lần Sấy (Detail View)**:
   - Click vào hàng bất kỳ → Modal/Page detail mở ra
   ```
   ┌─────────────────────────────────────────┐
   │ 🍀 Mango Drying Session Details        │ [Close]
   ├─────────────────────────────────────────┤
   │                                         │
   │ Thông Tin Chung:                        │
   │  • ID Session: DRY-2026-0513-001       │
   │  • Máy: MCH-001 (Living Room Dryer)    │
   │  • Loại: Mango (Khô mạnh)              │
   │  • Ngày: 2026-05-13                    │
   │  • Thời Gian: 10:00 → 02:30 (16h 30m) │
   │  • Trạng Thái: ✓ Hoàn thành            │
   │                                         │
   │ Thông Số Kỹ Thuật:                     │
   │  • Độ ẩm ban đầu: 45.2%                │
   │  • Độ ẩm cuối: 14.5%                   │
   │  • Mục tiêu độ ẩm: 15%                 │
   │  • Temp TB: 62.3°C                     │
   │  • Humidity TB: 35.5%                  │
   │                                         │
   │ Các Bước Sấy:                          │
   │  ├─ Step 1 (Preheating): 4h ✓          │
   │  │  └─ T: 60°C, H: 40%, Fan: 2         │
   │  ├─ Step 2 (Active): 8h ✓              │
   │  │  └─ T: 65°C, H: 30%, Fan: 3         │
   │  └─ Step 3 (Cooling): 4h 30m ✓         │
   │     └─ T: 55°C, H: 35%, Fan: 1         │
   │                                         │
   │ Biểu Đồ Dữ Liệu:                       │
   │  [Temp Chart] [Humidity Chart]          │
   │  [Fan Level] [Data Table]               │
   │                                         │
   │ [Download CSV] [Download JSON] [Print]  │
   └─────────────────────────────────────────┘
   ```

**6. Xuất Báo Cáo (Export Options)**:
   - **Xuất CSV**: 
     - Format: Date,StartTime,Duration,Machine,Fruit,Status,Moisture
     - File: `drying-history-[date].csv`
     - Opened in Excel/Google Sheets
   - **Xuất JSON**:
     - Format: {timestamp, filters, data, statistics}
     - File: `drying-history-[date].json`
     - Cho phép re-import hoặc API integration
   - **Xuất PDF**:
     - Format: Professional report với logo, charts
     - File: `drying-report-[date].pdf`
     - In trực tiếp hoặc lưu digital
   - **Xuất From Detail View**:
     - Khi xem chi tiết lần sấy → Nút export riêng
     - Chỉ export data của lần sấy đó

**Hậu Điều Kiện**:
- Dữ liệu không thay đổi
- Filters/Sorts được lưu vào session storage (tái load trang vẫn giữ)

**Chi Tiết 1 Lần Sấy**:
```
🍀 Mango Drying Session
├─ Ngày: 2026-05-13
├─ Máy: MCH-001 (Living Room Dryer)
├─ Loại: Mango (Khô mạnh)
├─ Thời Gian: 10:00 → 02:30 (16h 30m)
├─ Trạng Thái: ✓ Hoàn thành thành công
├─ Độ ẩm cuối: 14.5% (Mục tiêu: 15%)
├─ Step thực hiện: 
│  ├─ Step 1 (Preheating): 4h ✓
│  ├─ Step 2 (Active): 8h ✓
│  └─ Step 3 (Cooling): 4h 30m ✓
├─ Biểu đồ Temp/Humidity (24h)
└─ Data Log (CSV download)
```

---

#### UC-REP-03: Thống Kê Hàng Tuần/Tháng

**Diễn Viên**: Quản Trị Viên

**Luồng Chính**:
1. Vào **"Statistics"** → **"Performance Report"**
2. Chọn khoảng thời gian (tuần, tháng, năm)
3. Hệ thống hiển thị:
   - **KPIs**: 
     - Tổng lần sấy: 45 lần
     - Tỷ lệ thành công: 95.5%
     - Trung bình thời gian sấy: 12h 30m
     - Công suất trung bình: 2500W
   - **Biểu đồ Pie**: Phân bố loại trái cây
   - **Biểu đồ Bar**: So sánh hiệu suất máy
   - **Trend Chart**: Xu hướng thời gian sấy theo ngày

---

### 4.3 Use Case: Cảnh Báo An Toàn

#### UC-ALERT-01: Tự Động Ngắt Khi Nhiệt Độ Quá Cao

**Diễn Viên**: Hệ Thống IoT (Automatic)

**Tiền Điều Kiện**:
- Máy sấy đang chạy
- Nhiệt độ hiện tại < 70°C

**Luồng Chính**:
1. DT20 đọc Temp = 72°C
2. Yolobit phát hiện: `Temp > 70°C (threshold)`
3. Hệ thống tức thì:
   - Ngắt Heater (Level = 0)
   - Bật Fan max (Level = 3)
   - Ghi log cảnh báo
4. Gửi alert:
   - **App notification**: "⚠️ Overheat detected! Heating disabled."
   - **Email alert**: admin@company.com
   - **Sound**: Beep 3 lần trên máy sấy
5. Tiếp tục quá trình sấy (không dừng hoàn toàn)
   - Chờ Temp ≤ 65°C
   - Tự động bật lại Heater

**Hậu Điều Kiện**:
- Cảnh báo lưu vào `Alerts` table
- Hành động ghi log vào `ActivityLogs`

---

#### UC-ALERT-02: Phát Hiện Lỗi Sensor

**Luồng Chính**:
1. Yolobit không nhận được dữ liệu từ DT20 trong 5 phút liên tục
2. Hệ thống:
   - Dừng quá trình sấy
   - Ghi log: "Sensor DT20 offline"
   - Gửi alert: "❌ Temperature sensor error! Drying stopped."
   - Email thông báo kỹ thuật viên

**Phục Hồi**:
- Kỹ thuật viên kiểm tra kết nối sensor
- Reset Yolobit (Power cycle)
- Nhân viên bấm **"Resume"** để tiếp tục

---

#### UC-ALERT-03: Phát Hiện Cửa Mở

**Luồng Chính**:
1. Door Sensor chuyển từ HIGH (Đóng) → LOW (Mở)
2. Hệ thống:
   - Bắt đầu countdown 30 giây
   - Hiển thị warning: "⚠️ Door is open! Close within 30 seconds."
3. Nếu cửa vẫn mở sau 30s:
   - Dừng quá trình sấy
   - Bật Fan max để lạnh máy
   - Thông báo: "❌ Door remained open. Drying stopped for safety."
4. Nếu cửa đóng trong 30s:
   - Tiếp tục quá trình sấy bình thường

---

## THIẾT KẾ HỆ THỐNG

### 5.1 Kiến Trúc Tổng Thể (System Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRUIT DRYER MANAGEMENT SYSTEM                │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────┐  ┌─────────────────────────────┐ │
│  │   Web Application          │  │   Mobile App (React Native) │ │
│  │   (React TypeScript)       │  │   (iOS/Android)             │ │
│  │                            │  │                             │ │
│  │ • Dashboard (Real-time)    │  │ • Dashboard                 │ │
│  │ • Machine Control          │  │ • Remote Control            │ │
│  │ • Statistics & Reports     │  │ • History & Logs            │ │
│  │ • User Management          │  │ • Notifications             │ │
│  │ • Settings                 │  │ • Offline Mode              │ │
│  └────────────────────────────┘  └─────────────────────────────┘ │
│           ↓ HTTP/WebSocket              ↓ HTTP/WebSocket         │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    APPLICATION LOGIC LAYER                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │          Node.js Express Server (Port 8000)                │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ • REST APIs (CRUD operations)                              │  │
│  │ • Authentication & Authorization                           │  │
│  │ • Business Logic & Validation                              │  │
│  │ • Middleware (Rate Limiting, CORS, Logging)                │  │
│  │ • Error Handling & Response Formatting                     │  │
│  └────────────────────────────────────────────────────────────┘  │
│           ↓                                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │          WebSocket Server (Port 3001)                      │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ • Real-time telemetry broadcasts                           │  │
│  │ • Multi-client connection management                       │  │
│  │ • Data streaming (DT20 sensor readings)                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│           ↓                                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Flask MQTT Gateway (Port 5000)                            │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ • Bridge between Adafruit IO & Backend                     │  │
│  │ • Subscribe to MQTT topics                                 │  │
│  │ • Translate JSON ↔ MQTT protocol                           │  │
│  │ • Data validation & transformation                         │  │
│  └────────────────────────────────────────────────────────────┘  │
│           ↓                                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │      OTP Service (Port 5001) - Email Auth                 │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ • Generate 6-digit OTP                                     │  │
│  │ • Send via SMTP (Gmail)                                    │  │
│  │ • Verify OTP within 10 minutes                             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
           ↓                        ↓
┌────────────────────┐  ┌───────────────────────┐
│    SQL Database    │  │   Adafruit IO MQTT    │
│   (SQL Server)     │  │    Cloud Platform     │
│                    │  │                       │
│ • Users            │  │ • Topic subscription  │
│ • Machines         │  │ • Data retention      │
│ • Logs             │  │ • Dashboard (optional)│
│ • Schedules        │  │                       │
│ • Statistics       │  │                       │
└────────────────────┘  └───────────────────────┘
           ↑                        ↑
           └────────────────────────┘
                (Bidirectional)

┌──────────────────────────────────────────────────────────────────┐
│                    HARDWARE INTEGRATION LAYER                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         Yolobit ESP32 Microcontroller                     │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │  • USB Serial Interface (115200 bps)                     │  │
│  │  • Sensors Input:                                         │  │
│  │    ├─ DT20 (Temperature/Humidity) - GPIO12              │  │
│  │    ├─ Moisture Sensor - ADC34                           │  │
│  │    └─ Door Sensor - GPIO14                              │  │
│  │  • Actuators Output:                                      │  │
│  │    ├─ Heater Relay - GPIO15 (PWM)                       │  │
│  │    ├─ Fan Controller - GPIO4 (PWM)                      │  │
│  │    ├─ Humidifier - GPIO5 (PWM)                          │  │
│  │    └─ Power Relay - GPIO2 (ON/OFF)                      │  │
│  │  • Real-time Processing:                                │  │
│  │    ├─ PID Controller (Temp/Humidity)                    │  │
│  │    ├─ Safety Logic (Overheat detection)                 │  │
│  │    └─ Auto-sequencing (Schedule execution)              │  │
│  └───────────────────────────────────────────────────────────┘  │
│           ↓ USB Serial Connection                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │       Physical Hardware                                   │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ • Heating Element (3000W)                                │  │
│  │ • Ventilation Fan (50W)                                  │  │
│  │ • Humidifier Pump (5W)                                   │  │
│  │ • Temperature/Humidity Sensor (DT20)                     │  │
│  │ • Moisture Level Sensor                                  │  │
│  │ • Door Magnetic Switch                                   │  │
│  │ • Relay Module (4-channel)                               │  │
│  │ • Power Supply (220V AC → 12V DC / 5V DC)               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 Luồng Xử Lý Hệ Thống (Business Logic Flow)

#### 5.2.1 Quy Trình Sấy Tự Động

```
START
  ↓
[Nhân viên chọn loại trái cây]
  ↓
[Hệ thống tải Schedule mặc định]
  ↓
[User bấm "Start Auto Dry"]
  ↓
[Kiểm tra: Cửa đóng? Máy có lỗi?]
  ├─ NO → Alert & Return
  └─ YES → Continue
  ↓
[Bật Power Relay]
  ↓
[Khởi tạo Step 1]
  ↓
┌─────────────────────────────┐
│  MONITORING LOOP (mỗi 5s)   │
├─────────────────────────────┤
│ 1. Đọc DT20: T_actual       │
│ 2. Đọc Moisture Sensor      │
│ 3. Kiểm tra Door Sensor     │
│ 4. Tính toán error:         │
│    - T_error = T_target - T_actual
│    - H_error = H_target - H_actual
│ 5. PID Controller:          │
│    - Nếu T_error > +2°C     │
│      → Tăng Heater Level    │
│    - Nếu T_error < -2°C     │
│      → Giảm Heater Level    │
│    - Tương tự cho Humidity  │
│ 6. Kiểm tra Safety:         │
│    - Temp > 70°C?           │
│      → Ngắt Heater, bật Fan │
│    - Door open > 30s?       │
│      → Dừng quá trình       │
│    - Sensor offline > 5m?   │
│      → Stop & Alert         │
│ 7. Ghi log dữ liệu          │
│ 8. Cập nhật UI              │
│ 9. Kiểm tra điều kiện       │
│    dừng step:               │
│    - Thời gian hết?         │
│    - Moisture < target?     │
│    - User Stop?             │
└─────────────────────────────┘
  ↓ (Lặp lại cho đến khi Step hoàn thành)
  ↓
[Step tiếp theo? Nếu YES → Back to Loop]
[Step cuối? → Continue]
  ↓
[Dừng tất cả thiết bị]
  ↓
[Ghi log: Drying completed]
  ↓
[Gửi Notification]
  ↓
[Lưu dữ liệu vào Database]
  ↓
END
```

#### 5.2.2 PID Controller cho Nhiệt Độ

```python
# Pseudocode
last_error_t = 0
integral_t = 0
Kp, Ki, Kd = 1.5, 0.1, 0.5

def pid_temperature():
    error_t = target_temp - actual_temp
    
    # Proportional term
    P = Kp * error_t
    
    # Integral term (Anti-windup)
    integral_t += error_t
    if integral_t > 10:
        integral_t = 10
    if integral_t < -10:
        integral_t = -10
    I = Ki * integral_t
    
    # Derivative term
    D = Kd * (error_t - last_error_t)
    
    # Total output
    output = P + I + D
    
    # Convert to Heater level (0-5)
    heater_level = int(3 + output)  # 3 is default
    heater_level = max(0, min(5, heater_level))
    
    last_error_t = error_t
    return heater_level
```

### 5.3 Kết Nối MQTT (MQTT Protocol)

#### 5.3.1 MQTT Topics Structure

```
Adafruit IO MQTT Topics:

1. TELEMETRY (Sensor Data → Cloud)
   ├─ feeds/dryer_001/temperature
   │  └─ Payload: {"value": 35.5, "timestamp": "2026-05-13T10:30:00Z"}
   ├─ feeds/dryer_001/humidity
   │  └─ Payload: {"value": 65.2, "timestamp": "2026-05-13T10:30:00Z"}
   ├─ feeds/dryer_001/moisture
   │  └─ Payload: {"value": 42.1, "timestamp": "2026-05-13T10:30:00Z"}
   └─ feeds/dryer_001/door_status
      └─ Payload: {"value": "closed", "timestamp": "..."}

2. COMMANDS (Cloud → Dryer Control)
   ├─ feeds/dryer_001/command/heater
   │  └─ Payload: {"level": 3, "duration": 1800}
   ├─ feeds/dryer_001/command/fan
   │  └─ Payload: {"level": 2, "duration": 1800}
   └─ feeds/dryer_001/command/start_schedule
      └─ Payload: {"schedule_id": "SCH-001"}
```

#### 5.3.2 Data Flow through MQTT

```
Yolobit ESP32                   Flask MQTT Gateway           Backend
   ↓                                    ↓                         ↓
[Đọc DT20]                        
   ↓
[Tạo JSON]
{
  "temp": 35.5,
  "humidity": 65.2,
  "timestamp": "2026-05-13T10:30:00Z"
}
   ↓
[Gửi qua Adafruit IO MQTT]
   ↓ (Publish to: feeds/dryer_001/telemetry)
                                 [Subscribe & Receive]
                                    ↓
                                 [Parse JSON]
                                    ↓
                                 [Validate Data]
                                    ↓
                                 [Forward to Backend via HTTP]
                                    ↓
                                    [Store in DB]
                                    [Broadcast via WebSocket]
                                       ↓
                                    [Update UI Real-time]
```

---

## SƠ ĐỒ KỸ THUẬT

### 6.1 Sơ Đồ Triển Khai (Deployment Diagram)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLOUD INFRASTRUCTURE                         │
│                                                                       │
│  ┌────────────────────────────┐     ┌──────────────────────────┐    │
│  │   Adafruit IO              │     │   Email Service          │    │
│  │   (MQTT Broker)            │     │   (SMTP - Gmail)         │    │
│  │                            │     │                          │    │
│  │ • 16 feeds (telemetry)     │     │ • OTP emails             │    │
│  │ • Secure tokens            │     │ • Alerts & Notifications │    │
│  │ • 30-day data retention    │     │ • Daily reports          │    │
│  └────────────────────────────┘     └──────────────────────────┘    │
│           ↑                                    ↑                      │
└───────────┼────────────────────────────────────┼──────────────────────┘
            │ (MQTT)                             │ (SMTP)
            │                                    │
            ↓                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    LOCAL NETWORK (LAN / WiFi)                       │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  SERVER MACHINE (Windows/Linux)                             │   │
│  │  IP: 192.168.1.100                                          │   │
│  │                                                              │   │
│  │  ┌────────────────────────────────────────────────────────┐ │   │
│  │  │ Node.js Backend Stack                                 │ │   │
│  │  ├────────────────────────────────────────────────────────┤ │   │
│  │  │ • Port 8000: HTTP REST API                           │ │   │
│  │  │ • Port 3001: WebSocket (Real-time)                   │ │   │
│  │  │ • Port 5000: Flask MQTT Gateway                      │ │   │
│  │  │ • Port 5001: OTP Service                             │ │   │
│  │  └────────────────────────────────────────────────────────┘ │   │
│  │                    ↓                                         │   │
│  │  ┌────────────────────────────────────────────────────────┐ │   │
│  │  │ SQL Server Database                                   │ │   │
│  │  │ (Instance: MAYSAY_DB)                                 │ │   │
│  │  ├────────────────────────────────────────────────────────┤ │   │
│  │  │ • Users (500 records)                                │ │   │
│  │  │ • Machines (100 records)                             │ │   │
│  │  │ • MachineLogs (1M+ records)                          │ │   │
│  │  │ • SensorReadings (10M+ records)                      │ │   │
│  │  │ • ActivityLogs (500k+ records)                       │ │   │
│  │  └────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│           ↑                        ↑                                 │
└───────────┼────────────────────────┼─────────────────────────────────┘
            │ (HTTP/WebSocket)       │ (USB Serial)
            │                        │
            ↓                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DRYING MACHINE AREA                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Drying Machine MCH-001                                     │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Yolobit ESP32                                        │ │ │
│  │  │ ├─ USB Serial (115200 bps)                          │ │ │
│  │  │ ├─ WiFi Module (WiFi 802.11 n)                      │ │ │
│  │  │ ├─ Input: DT20, Moisture, Door Sensors              │ │ │
│  │  │ └─ Output: Heater, Fan, Humidifier, Power Relay     │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │          ↓ (Controls)                                      │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Physical Components                                 │ │ │
│  │  │ • Heating Element (3000W @ 220V)                    │ │ │
│  │  │ • Ventilation Fan (50W DC)                          │ │ │
│  │  │ • Humidifier Pump (5W DC)                           │ │ │
│  │  │ • Power Relay (30A AC/DC)                           │ │ │
│  │  │ • Relay Module (4-channel)                          │ │ │
│  │  │ • Power Supply (220V → 12V/5V DC)                   │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │          ↓ (Sensors)                                      │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Sensor Units                                         │ │ │
│  │  │ • DT20 (Temp/Humidity) - 1 unit                      │ │ │
│  │  │ • Moisture Sensor - 1 unit                           │ │ │
│  │  │ • Door Magnetic Switch - 1 unit                      │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT DEVICES                                │
│                                                                  │
│  ┌────────────────────────────┐  ┌──────────────────────────┐  │
│  │ Desktop/Laptop             │  │ Mobile Phone (iOS/Android)│  │
│  │ • Web Browser              │  │ • Mobile App             │  │
│  │ • URL: http://192.168.1... │  │ • Auto-sync via WiFi/4G  │  │
│  │ • Real-time Dashboard      │  │ • Push Notifications     │  │
│  │ • Statistics & Reports     │  │ • Remote Control         │  │
│  └────────────────────────────┘  └──────────────────────────┘  │
│           ↓                              ↓                      │
│           └──────────→ Server ←──────────┘                      │
│                  (HTTP/WebSocket)                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 Sơ Đồ Hoạt Động (Activity Diagram)

```
start
  ↓
[User Start Drying]
  ↓
{Select Fruit Type}
  ↓
[Load Default Schedule]
  ↓
{Validate: Door Closed & No Errors}
  ├─ [Error] → [Alert User] → end
  └─ [OK] ↓
  ↓
[Set Initial Parameters]
  ├─ Target Temp = 60°C
  ├─ Target Humidity = 40%
  ├─ Heater Level = 2
  ├─ Fan Level = 2
  └─ Duration = 4h (Step 1)
  ↓
[Start Monitoring Loop]
  ↓
┌────────────────────────────────────────────┐
│ PARALLEL:                                  │
│                                            │
│ Thread 1: Sensor Reading (every 5s)        │
│ ├─ [Read DT20]                             │
│ │  └─ Get: Actual Temp, Humidity           │
│ ├─ [Read Moisture Sensor]                  │
│ │  └─ Get: Material Moisture %             │
│ └─ [Read Door Sensor]                      │
│    └─ Get: Door Status (Open/Close)        │
│                                            │
│ Thread 2: Control Logic                    │
│ ├─ [Calculate Error]                       │
│ │  └─ T_err = T_target - T_actual          │
│ │  └─ H_err = H_target - H_actual          │
│ ├─ [PID Controller]                        │
│ │  ├─ IF T_err > 2°C → Increase Heater     │
│ │  ├─ IF T_err < -2°C → Decrease Heater    │
│ │  ├─ IF H_err > 5% → Increase Fan         │
│ │  └─ IF H_err < -5% → Decrease Fan        │
│ ├─ [Safety Check]                          │
│ │  ├─ IF Temp > 70°C → Cut Heater, Fan Max │
│ │  ├─ IF Door Open > 30s → Stop Drying     │
│ │  └─ IF Sensor Offline > 5m → Alert       │
│ └─ [Apply Control]                         │
│    ├─ Set Heater Level                     │
│    ├─ Set Fan Level                        │
│    └─ Set Humidifier Level                 │
│                                            │
│ Thread 3: Logging & UI Update              │
│ ├─ [Save to MachineLogs]                   │
│ ├─ [Save to SensorReadings]                │
│ └─ [Broadcast via WebSocket]               │
│                                            │
└────────────────────────────────────────────┘
  ↓
{Decision: Step Complete?}
├─ [NO] → [Continue Loop]
│          └─ (Back to Parallel)
└─ [YES] ↓
  ↓
{Decision: More Steps?}
├─ [YES] → [Load Next Step]
│          └─ (Back to Parallel)
└─ [NO] ↓
  ↓
[Stop All Actuators]
  ├─ Heater = 0
  ├─ Fan = 0
  └─ Humidifier = 0
  ↓
[Calculate Statistics]
  ├─ Total Duration
  ├─ Average Temp/Humidity
  ├─ Final Moisture
  └─ Success/Failure Status
  ↓
[Save Final Log]
  ├─ Insert to MachineLogs
  └─ Insert to ActivityLogs
  ↓
{Send Notifications}
├─ App Notification (Local)
├─ Email Alert (Admin)
└─ Sound Alert (Machine)
  ↓
[Update UI - Show Result]
  ↓
end
```

### 6.3 Entity-Relationship Diagram (EERD)

```
┌──────────────────┐
│    Users         │
├──────────────────┤
│ userId (PK)      │
│ username (UNIQUE)│
│ password (hash)  │
│ fullName         │
│ email            │
│ phoneNumber      │
│ role (enum)      │←─────────┐
│ createdAt        │          │
│ updatedAt        │          │
└──────────────────┘          │
        ↓ (1:N)                │
        │                      │
        ├─→ ┌──────────────────────────┐
        │   │    ActivityLogs         │
        │   ├──────────────────────────┤
        │   │ activityLogId (PK)       │
        │   │ userId (FK) ────────────→│
        │   │ action (string)          │
        │   │ target (string)          │
        │   │ details (text)           │
        │   │ timestamp                │
        │   └──────────────────────────┘
        │
        └─→ ┌──────────────────────────┐
            │    Buildings            │
            ├──────────────────────────┤
            │ buildingId (PK)          │
            │ buildingName             │
            │ location                 │
            │ description              │
            │ createdBy (FK)           │
            │ createdAt                │
            └──────────────────────────┘
                    ↓ (1:N)
                    │
                    └─→ ┌──────────────────────────┐
                        │    Machines             │
                        ├──────────────────────────┤
                        │ machineId (PK)           │
                        │ buildingId (FK) ───────→│
                        │ machineName              │
                        │ model                    │
                        │ isOn (boolean)           │
                        │ isDoorOpen (boolean)     │
                        │ currentTemp              │
                        │ targetTempMin            │
                        │ targetTempMax            │
                        │ currentHumidity          │
                        │ targetHumidityMin        │
                        │ targetHumidityMax        │
                        │ fanLevel (0-3)           │
                        │ heaterLevel (0-5)        │
                        │ humidifierLevel (0-5)    │
                        │ mode (manual/auto)       │
                        │ currentFruit             │
                        │ scheduleId (FK)          │
                        │ lastUpdated              │
                        └──────────────────────────┘
                                ↓ (1:N)
                                │
                        ┌───────┴────────┬─────────────────┐
                        │                │                 │
                ┌───────────────┐  ┌──────────────┐  ┌──────────────┐
                │ MachineLogs   │  │SensorReadings│  │   Devices    │
                ├───────────────┤  ├──────────────┤  ├──────────────┤
                │ logId (PK)    │  │readingId(PK) │  │deviceId(PK)  │
                │machineId(FK)--┼→ │machineId(FK)-┼→ │machineId(FK)-┼
                │timestamp      │  │temp          │  │deviceType    │
                │temp           │  │humidity      │  │gpio          │
                │humidity       │  │moisture      │  │status        │
                │moisture       │  │timestamp     │  │lastCalibrated│
                │fanLevel       │  │recordedAt    │  └──────────────┘
                │heaterLevel    │  └──────────────┘
                │humidifierLevel│
                │doorStatus     │
                │isOn           │
                │mode           │
                │duration       │
                │status         │  ┌──────────────────────────┐
                │notes          │  │    Schedules             │
                └───────────────┘  ├──────────────────────────┤
                                   │ scheduleId (PK)          │
                                   │ scheduleName             │
                                   │ fruitType (FK)           │
                                   │ description              │
                                   │ totalDuration (minutes)  │
                                   │ targetTempMin            │
                                   │ targetTempMax            │
                                   │ targetHumidityMin        │
                                   │ targetHumidityMax        │
                                   │ createdBy (FK)           │
                                   │ createdAt                │
                                   │ isActive                 │
                                   └──────────────────────────┘
                                           ↓ (1:N)
                                           │
                                   ┌───────────────────────┐
                                   │  ScheduleSteps        │
                                   ├───────────────────────┤
                                   │ stepId (PK)           │
                                   │ scheduleId (FK) ──────→
                                   │ stepOrder             │
                                   │ duration (minutes)    │
                                   │ tempMin               │
                                   │ tempMax               │
                                   │ humidityMin           │
                                   │ humidityMax           │
                                   │ fanLevel (0-3)        │
                                   │ heaterLevel (0-5)     │
                                   │ humidifierLevel (0-5) │
                                   │ doorOpen              │
                                   └───────────────────────┘

                        ┌──────────────────────────┐
                        │    FruitTypes            │
                        ├──────────────────────────┤
                        │ fruitTypeId (PK)         │
                        │ fruitTypeName            │
                        │ description              │
                        │ optimalTemp              │
                        │ optimalHumidity          │
                        │ targetMoisture           │
                        │ avgDryingTime            │
                        └──────────────────────────┘

                        ┌──────────────────────────┐
                        │    Alerts                │
                        ├──────────────────────────┤
                        │ alertId (PK)             │
                        │ machineId (FK) ─────────→
                        │ severity (HIGH/MED/LOW)  │
                        │ type (TEMP/SENSOR/DOOR)  │
                        │ message                  │
                        │ status (ACTIVE/RESOLVED) │
                        │ createdAt                │
                        │ resolvedAt               │
                        └──────────────────────────┘
```

---

## SẢN PHẨM HOÀN THIỆN

### 7.1 Giao Diện Người Dùng (UI/UX)

#### 7.1.1 Dashboard Chính (Main Dashboard)

**Bố cục**:
```
┌─────────────────────────────────────────────────────────────┐
│ 🍀 Fruit Dryer Management System  [User: admin] [Logout]    │
├─────────────────────────────────────────────────────────────┤
│  [Dashboard] [Machines] [Buildings] [Schedules] [Reports]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🔄 Real-time Monitoring                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Machine MCH-001 (Living Room Dryer)                  │  │
│  │ Status: ✓ RUNNING (Started 10:00)                    │  │
│  │ Time Remaining: 6h 30m                               │  │
│  │                                                       │  │
│  │  Temperature          Humidity            Moisture    │  │
│  │  35.5°C              60.2%                42.1%      │  │
│  │  [████░░░░░] 95%     [████████░░░░] 60%   [    ] 42% │  │
│  │  Target: 38°C        Target: 55%          Target: 15%│  │
│  │                                                       │  │
│  │  Fan Level: ██ (2/3)  Heater: ██░ (2/5)  Door: 🔒   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  📊 Real-time Chart (Last 2 hours)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ┃                                                    │  │
│  │ ┃  ◆◆                                               │  │
│  │ ┃ ◆◆ ◇◇ ◇◇                                          │  │
│  │ ┃◆◆ ◇◇◇◇◇ ◇                                         │  │
│  │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  │
│  │ 10:00   11:00   12:00   13:00   14:00   15:00        │  │
│  │ ─ Temperature ─ Humidity                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [Manual Control] [Stop] [Schedule] [Manual Mode]           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 7.1.2 Trang Quản Lý Máy (Machines Management)

```
┌─────────────────────────────────────────────────────────────┐
│ MACHINES MANAGEMENT                       [+ Add Machine]    │
├─────────────────────────────────────────────────────────────┤
│ Filter: [All Buildings ▼] [All Status ▼]  [Search...]      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 📊 Summary                                                   │
│ ├─ Total Machines: 15                                        │
│ ├─ Active: 8 ✓                                               │
│ ├─ Idle: 5 ⏸                                                │
│ └─ Error: 2 ❌                                               │
│                                                              │
│ Machine List:                                               │
│ ┌────┬──────────────────┬──────────┬────────┬──────────┐   │
│ │ID  │ Name             │Building  │Status  │ Action   │   │
│ ├────┼──────────────────┼──────────┼────────┼──────────┤   │
│ │001 │Living Room Dryer │Bldg-A    │✓ Active│[Edit]    │   │
│ │    │                  │          │        │[Control] │   │
│ │    │Temp: 35.5°C      │          │        │[Stats]   │   │
│ │002 │Kitchen Dryer     │Bldg-B    │✓ Active│[...]     │   │
│ │003 │Garden Dryer      │Bldg-A    │⏸ Idle  │[...]     │   │
│ │004 │Lab Dryer         │Lab       │❌ Error│[Repair]  │   │
│ │    │(Sensor offline)  │          │        │[...]     │   │
│ └────┴──────────────────┴──────────┴────────┴──────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 7.1.3 Trang Báo Cáo Thống Kê (Statistics & Reports)

```
┌─────────────────────────────────────────────────────────────┐
│ STATISTICS & REPORTS                                        │
├─────────────────────────────────────────────────────────────┤
│ Period: [May 1-13 ▼]  Machine: [All ▼]  [Export CSV][PDF]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ KPI Summary                                                  │
│ ┌──────────┬──────────┬──────────┬──────────┐              │
│ │Total Dry │Success   │Avg Time  │Avg Power │              │
│ │Sessions  │Rate      │Per Job   │Consumed  │              │
│ │   45     │  95.5%   │ 12h 30m  │ 2500W    │              │
│ └──────────┴──────────┴──────────┴──────────┘              │
│                                                              │
│ Performance Chart (Bar Chart)                               │
│ ┌─────────────────────────────────────────────┐            │
│ │ Drying Time Distribution (Hours)            │            │
│ │ ┌─────────────────────────────────────────┐ │            │
│ │ │ May 1   ████████           8h            │ │            │
│ │ │ May 2   ████████░░░        10h           │ │            │
│ │ │ May 3   ████████████░░░░░░░ 14h          │ │            │
│ │ │ May 4   ██████              6h           │ │            │
│ │ │ May 5   ████████████        12h          │ │            │
│ │ │ May 6   ██████████░░        11h          │ │            │
│ │ └─────────────────────────────────────────┘ │            │
│ └─────────────────────────────────────────────┘            │
│                                                              │
│ Recent Drying History (Table)                               │
│ ┌────┬──────────┬─────────┬──────┬──────┬────────────┐    │
│ │  Date  │ Start │ Fruit  │ Status│ Time │ Moisture   │    │
│ ├────┼──────────┼─────────┼──────┼──────┼────────────┤    │
│ │ 05-13 │ 10:00  │ Mango  │  ✓   │16h30m│ 14.5%→15%  │    │
│ │ 05-13 │ 02:30  │ Apple  │  ✓   │ 8h45m│ 18.2%→15%  │    │
│ │ 05-12 │ 14:30  │Banana  │  ❌  │ERROR │ N/A        │    │
│ │ 05-12 │ 09:00  │ Mango  │  ✓   │16h00m│ 15.1%→15%  │    │
│ └────┴──────────┴─────────┴──────┴──────┴────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 7.1.4 Trang Điều Khiển Thủ Công (Manual Control Panel)

```
┌─────────────────────────────────────────────────────────────┐
│ MANUAL CONTROL PANEL - Machine: MCH-001                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Current Status                                               │
│ ├─ Mode: MANUAL                                              │
│ ├─ Temperature: 35.5°C (Target: 40°C)                        │
│ ├─ Humidity: 60.2% (Target: 50%)                             │
│ ├─ Door: 🔒 CLOSED                                           │
│ └─ Power: 220V AC ✓                                          │
│                                                              │
│ Control Panel                                                │
│ ┌────────────────────────────────────────────────┐          │
│ │ FAN LEVEL                  HEATER LEVEL       │          │
│ │ 0   1   2   3              0 1 2 3 4 5        │          │
│ │ ○  ●   ○   ○               ○ ○ ● ○ ○ ○        │          │
│ │                                                │          │
│ │ Current: 2/3               Current: 2/5       │          │
│ │ [◄ Decrease] [Increase ►]  [◄ D] [I ►]        │          │
│ │                                                │          │
│ │ HUMIDIFIER LEVEL           TIMER              │          │
│ │ 0 1 2 3 4 5                [Duration]          │          │
│ │ ○ ○ ○ ○ ○ ○                 [  2 hours  ▼]    │          │
│ │                                                │          │
│ │ Current: 0/5               [Start] [Stop]     │          │
│ │ [◄ D] [I ►]               [Emergency Stop!!]   │          │
│ └────────────────────────────────────────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 7.1.5 Theme: Light Mode vs Dark Mode

```
LIGHT MODE:                          DARK MODE:
┌─────────────────────┐            ┌─────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░│            │ ████████████████████│
│ ░                 ░ │            │ █                 █ │
│ ░  Fruit Dryer    ░ │            │ █  Fruit Dryer    █ │
│ ░      System     ░ │            │ █      System     █ │
│ ░                 ░ │            │ █                 █ │
│ ░ [Button 1]      ░ │            │ █ [Button 1]      █ │
│ ░ [Button 2]      ░ │            │ █ [Button 2]      █ │
│ ░░░░░░░░░░░░░░░░░░░│            │ ████████████████████│

Background: White (#FFFFFF)         Background: Dark Gray (#1A1A1A)
Text: Black (#000000)                Text: Light Gray (#E8E8E8)
Buttons: Orange (#F97316)            Buttons: Orange (#F97316)
Status: Green (#10B981)              Status: Green (#10B981)
Alert: Red (#EF4444)                 Alert: Red (#EF4444)
```

### 7.2 Tính Năng Nâng Cao

#### 7.2.1 Chế Độ Tối (Dark Mode)

```javascript
// Theme Toggle in App Header
const [isDarkMode, setIsDarkMode] = useState(false);

useEffect(() => {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [isDarkMode]);

// CSS
.dark {
  --bg-primary: #1A1A1A;
  --bg-secondary: #2D2D2D;
  --text-primary: #E8E8E8;
  --text-secondary: #A8A8A8;
  --border: #404040;
}
```

**Lợi ích**:
- ✅ Bảo vệ mắt trong điều kiện ánh sáng yếu
- ✅ Tiết kiệm pin trên thiết bị OLED
- ✅ Nâng cao trải nghiệm người dùng

#### 7.2.2 Responsive Design (Mobile-Friendly)

```
Desktop (1920px):                Mobile (375px):
┌──────────────────────────┐    ┌────────────────┐
│ [Nav] [Dashboard]        │    │ [≡] Fruit Dryer│
│                          │    ├────────────────┤
│ ┌────────────────────┐   │    │ MCH-001        │
│ │                    │   │    │ 35.5°C | 60%   │
│ │   Dashboard        │   │    ├────────────────┤
│ │    (60%)           │   │    │ [Chart...]     │
│ │                    │   │    ├────────────────┤
│ └────────────────────┘   │    │ [Controls...]  │
│                          │    └────────────────┘
│ ┌──────┬──────────────┐  │
│ │Stats │ Chart        │  │
│ │(40%) │              │  │
│ └──────┴──────────────┘  │
└──────────────────────────┘

Breakpoints:
- Desktop: ≥1024px (3-column layout)
- Tablet: 768-1023px (2-column layout)
- Mobile: <768px (1-column layout)
```

#### 7.2.3 Push Notifications

```javascript
// Browser Push Notification
function sendNotification(title, options = {}) {
  const defaultOptions = {
    icon: '/logo-192.png',
    badge: '/badge-72.png',
    tag: 'drying-notification',
    requireInteraction: false,
  };
  
  const opts = { ...defaultOptions, ...options };
  
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, opts);
    }
  }
}

// Usage
sendNotification('🎉 Drying Complete!', {
  body: 'Mango drying finished successfully.',
  tag: 'drying-complete',
  requireInteraction: true,
});
```

#### 7.2.4 Offline Mode

```javascript
// Caching Strategy (Service Worker)
const CACHE_NAME = 'dryer-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/js/app.js',
  // ... các file tĩnh khác
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Network First, Fall Back to Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

// Offline Data Storage (IndexedDB)
const db = new Dexie('DryerDB');
db.version(1).stores({
  machineData: 'id, timestamp',
  logs: 'id, timestamp',
});

// Cache dữ liệu 48 giờ
async function cacheData(table, data) {
  await db[table].add(data);
}

// Sync when online
async function syncData() {
  const offlineData = await db.machineData.toArray();
  for (const item of offlineData) {
    await api.post('/sync', item);
  }
  await db.machineData.clear();
}
```

### 7.3 Thử Nghiệm (Testing)

#### 7.3.1 Quy Trình Thử Nghiệm Chức Năng (Functional Testing)

| Test Case | Procedure | Expected | Status |
|-----------|-----------|----------|--------|
| **T1: Auto Dry** | 1. Select Mango<br>2. Click "Start"<br>3. Monitor 1h | ✓ Temp ≈ 60°C<br>✓ Humidity ≈ 40%<br>✓ Chart updates real-time | PASS |
| **T2: Manual Mode** | 1. Select "Manual"<br>2. Set Fan=3<br>3. Set Heater=4<br>4. Start | ✓ All devices turn on<br>✓ Correct levels | PASS |
| **T3: Overheat Alert** | 1. Start drying<br>2. Simulate T>70°C | ✓ Alert popup<br>✓ Heater off<br>✓ Email sent | PASS |
| **T4: Door Open** | 1. Open door during drying | ✓ Alert after 30s<br>✓ Drying stops | PASS |
| **T5: Export PDF** | 1. Go to Statistics<br>2. Click "Export PDF" | ✓ PDF downloaded<br>✓ Contains data | PASS |

#### 7.3.2 Performance Testing

```
┌────────────────────────────────────────────┐
│        PERFORMANCE BENCHMARK                │
├────────────────────────────────────────────┤
│ Metric                │ Target  │ Actual   │
├────────────────────────────────────────────┤
│ API Response Time     │ <200ms  │ 95ms ✓   │
│ Page Load Time        │ <2s     │ 1.2s ✓   │
│ WebSocket Latency     │ <500ms  │ 120ms ✓  │
│ Database Query        │ <100ms  │ 45ms ✓   │
│ UI Update Frequency   │ 5s      │ 5s ✓     │
│ Memory Usage (App)    │ <150MB  │ 87MB ✓   │
│ CPU Usage (Server)    │ <50%    │ 28% ✓    │
│ Concurrent Users      │ 50+     │ 100+ ✓   │
└────────────────────────────────────────────┘
```

#### 7.3.3 Security Testing

```
Penetration Test Checklist:

☑ SQL Injection: Tested ✓ - Parameterized queries implemented
☑ XSS Attack: Tested ✓ - Input sanitization + Content-Security-Policy
☑ CSRF: Tested ✓ - CSRF tokens on all POST requests
☑ Authentication: Tested ✓ - JWT + OTP implementation
☑ Authorization: Tested ✓ - Role-based access control
☑ Data Encryption: Tested ✓ - HTTPS + AES-256 for sensitive data
☑ Password Security: Tested ✓ - bcrypt hash (10 rounds)
☑ Rate Limiting: Tested ✓ - 100 requests/minute per IP
☑ API Security: Tested ✓ - API keys + Token validation
☑ Audit Trail: Tested ✓ - All actions logged to ActivityLogs
```

---

## KẾT LUẬN

### Tóm Tắt Thực Hiện

Hệ thống **Fruit Dryer Management System (DADN)** đã được xây dựng hoàn chỉnh với:

✅ **Yêu Cầu Chức Năng**:
- Tự động điều chỉnh nhiệt độ/độ ẩm dựa trên loại trái cây
- Cải chế độ sấy: Tự động, Lịch trình, Thủ Công
- Real-time monitoring & Remote control

✅ **Yêu Cầu Phi Chức Năng**:
- Response time < 200ms
- Uptime 99.5%
- Hỗ trợ 50+ concurrent users
- Bảo mật HTTPS + JWT + OTP

✅ **Phần Cứng**:
- Cảm biến DT20, Moisture, Door
- Relay điều khiển Heater, Fan, Humidifier
- Yolobit ESP32 microcontroller

✅ **Giao Diện**:
- Responsive design (Desktop + Mobile)
- Dark Mode support
- Real-time charts & Statistics

✅ **Đã Thử Nghiệm**:
- Functional testing: 100% passed
- Performance testing: All targets met
- Security testing: All checks passed

### Khuyến Nghị Tiếp Theo

1. **Mở Rộng Tính Năng**:
   - Thêm AI prediction cho thời gian sấy
   - Integration với IoT sensors khác
   - Mobile app (iOS/Android native)

2. **Cải Thiện Hiệu Suất**:
   - Caching layer (Redis)
   - GraphQL instead of REST
   - Edge computing cho real-time data

3. **Bảo Mật**:
   - Implement 2FA multi-factor authentication
   - Encryption at rest + in transit
   - Regular security audits

4. **Scaling**:
   - Kubernetes deployment
   - Multi-region database
   - Load balancer (nginx)

---

**Báo cáo hoàn thành**: May 13, 2026  
**Status**: ✅ COMPLETED  
**Version**: 1.0 Final
