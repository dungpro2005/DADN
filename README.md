# Fruit Dryer Management System

This is a code bundle for Fruit Dryer Management System. The original project is available at https://www.figma.com/design/MwyhdsTAfPTETGiqQD5DaH/Fruit-Dryer-Management-System.

## Features

- User authentication and role management
- Building and machine management
- Schedule management for drying processes
- Real-time monitoring and control
- **Yolobit Integration**: Connect to Yolobit board with DT20 sensor and fan control

## Yolobit Integration

The system supports connection to Yolobit microcontroller board for real-time sensor monitoring and hardware control.

### Hardware Requirements

- Yolobit board
- DT20 temperature and humidity sensor
- Fan connected to PWM output
- USB connection to computer

### Software Setup

1. Program your Yolobit board using the example code in `yolobit_example.py`
2. The code supports dynamic device configuration
3. Send sensor data as JSON via serial: `{"temp": 25.5, "humidity": 60.0, "fan": 3, "door_open": false, "power_on": true}`
4. Receive commands as JSON:
   - `{"command": "set_fan", "level": 4}` - Set fan speed (0-5)
   - `{"command": "set_power", "state": true}` - Control power relay
   - `{"command": "configure_devices", "config": {"sensorPin": 4, "fanPin": 2, "doorPin": 3, "powerPin": 4}}` - Configure GPIO pins
5. Go to Machines page
6. Click "Cấu hình thiết bị" button to configure GPIO pins for sensors and actuators
7. Select appropriate pins for:
   - DT20 sensor (I2C pins)
   - Fan control (PWM pin)
   - Door sensor (optional digital input)
   - Power control (optional digital output)
8. Click "Lưu cấu hình" to send configuration to Yolobit
9. Click the WiFi icon to connect to Yolobit board
10. Allow browser to access serial port
11. Sensor data will update in real-time
12. Fan control buttons will send commands to hardware
    Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Documentation

- `CONFIG_GUIDE.md` - Detailed guide for configuring Yolobit devices
- `yolobit_example.py` - Example MicroPython code for Yolobit
