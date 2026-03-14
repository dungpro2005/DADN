# Hướng dẫn cấu hình thiết bị Yolobit

## Tổng quan

Hệ thống Fruit Dryer Management System hỗ trợ cấu hình động các thiết bị kết nối với mạch Yolobit thông qua giao diện web, không cần sửa đổi code.

## Các thiết bị có thể cấu hình

### 1. Cảm biến DT20 (Temperature & Humidity)

- **Loại**: I2C sensor
- **Chân cần thiết**: SDA và SCL
- **Cấu hình**: Chọn chân SDA (chân SCL sẽ tự động là SDA + 1)

### 2. Quạt (Fan)

- **Loại**: PWM output
- **Chân cần thiết**: 1 chân PWM
- **Điều khiển**: 6 mức tốc độ (0-5)

### 3. Cảm biến cửa (Door Sensor) - Tùy chọn

- **Loại**: Digital input
- **Chân cần thiết**: 1 chân digital
- **Chức năng**: Phát hiện trạng thái mở/đóng cửa

### 4. Điều khiển nguồn (Power Control) - Tùy chọn

- **Loại**: Digital output
- **Chân cần thiết**: 1 chân digital
- **Chức năng**: Bật/tắt nguồn cho hệ thống sấy

## Cách cấu hình

1. **Vào trang "Quản lý máy sấy"**
2. **Click nút "Cấu hình thiết bị"**
3. **Chọn chân GPIO cho từng thiết bị:**
   - DT20 Sensor: Chọn chân SDA (0, 1, 4, hoặc 5)
   - Fan: Chọn chân PWM bất kỳ (0-29)
   - Door Sensor: Chọn chân digital hoặc "Không sử dụng"
   - Power Control: Chọn chân digital hoặc "Không sử dụng"
4. **Click "Lưu cấu hình"**
5. **Kết nối với Yolobit** để áp dụng cấu hình

## Lưu ý kỹ thuật

- **I2C Pins**: Yolobit sử dụng các chân cụ thể cho I2C:
  - SDA: Pin 0, 4
  - SCL: Pin 1, 5
- **PWM Pins**: Tất cả chân digital đều hỗ trợ PWM
- **Digital Pins**: Chân 0-29 có thể dùng làm digital I/O
- **Tránh xung đột**: Đảm bảo không dùng cùng chân cho nhiều thiết bị

## Giao thức giao tiếp

### Dữ liệu cảm biến (từ Yolobit):

```json
{
  "temp": 25.5,
  "humidity": 60.0,
  "fan": 3,
  "door_open": false,
  "power_on": true
}
```

### Lệnh cấu hình (từ Web):

```json
{
  "command": "configure_devices",
  "config": {
    "sensorPin": 4,
    "fanPin": 2,
    "doorPin": 3,
    "powerPin": 4
  }
}
```

### Lệnh điều khiển (từ Web):

```json
{
  "command": "set_fan",
  "level": 4
}
```

```json
{
  "command": "set_power",
  "state": true
}
```

## Khắc phục sự cố

1. **Không thể kết nối**: Kiểm tra USB cable và driver
2. **Cảm biến không hoạt động**: Kiểm tra chân I2C và kết nối vật lý
3. **Quạt không quay**: Kiểm tra chân PWM và nguồn điện
4. **Cấu hình không áp dụng**: Đảm bảo Yolobit đã nhận lệnh configure_devices
