# Yolobit code for Fruit Dryer Management System
# This code reads DT20 sensor and controls fan via PWM
# Send sensor data as JSON over serial
# Receive commands as JSON over serial
# Support dynamic device configuration

import json
import time
from yolobit import *
from machine import Pin, PWM
from dht20 import DHT20

# Default configuration
config = {
    'sensorPin': 0,  # I2C SDA pin for DT20
    'fanPin': 2,     # PWM pin for fan
    'doorPin': 3,    # Digital input for door sensor
    'powerPin': 4,   # Digital output for power control
}

# Initialize devices with default config
dht20 = None
fan_pwm = None
door_pin = None
power_pin = None

def init_devices():
    global dht20, fan_pwm, door_pin, power_pin

    # Initialize I2C for DT20 sensor
    try:
        i2c = machine.I2C(0, sda=Pin(config['sensorPin']), scl=Pin(config['sensorPin'] + 1))
        dht20 = DHT20(i2c)
    except:
        dht20 = None

    # Initialize fan PWM
    try:
        fan_pwm = PWM(Pin(config['fanPin']), freq=1000, duty=0)
    except:
        fan_pwm = None

    # Initialize door sensor
    if config['doorPin'] >= 0:
        try:
            door_pin = Pin(config['doorPin'], Pin.IN, Pin.PULL_UP)
        except:
            door_pin = None

    # Initialize power control
    if config['powerPin'] >= 0:
        try:
            power_pin = Pin(config['powerPin'], Pin.OUT)
            power_pin.value(0)
        except:
            power_pin = None

# Initialize with default config
init_devices()

# Fan levels (0-5)
fan_levels = [0, 200, 400, 600, 800, 1023]  # PWM duty values

def read_sensors():
    data = {}

    # Read temperature and humidity
    if dht20:
        try:
            temp, hum = dht20.read_temp_humd()
            data['temp'] = round(temp, 1)
            data['humidity'] = round(hum, 1)
        except:
            data['temp'] = 25.0
            data['humidity'] = 60.0
    else:
        data['temp'] = 25.0
        data['humidity'] = 60.0

    # Read fan level
    if fan_pwm:
        duty = fan_pwm.duty()
        for i, level in enumerate(fan_levels):
            if duty <= level:
                data['fan'] = i
                break
        else:
            data['fan'] = 5
    else:
        data['fan'] = 0

    # Read door status
    if door_pin:
        data['door_open'] = door_pin.value() == 0  # Assuming active low
    else:
        data['door_open'] = False

    # Read power status
    if power_pin:
        data['power_on'] = power_pin.value() == 1
    else:
        data['power_on'] = False

    return data

def set_fan_level(level):
    if fan_pwm and 0 <= level <= 5:
        fan_pwm.duty(fan_levels[level])

def set_power(state):
    if power_pin:
        power_pin.value(1 if state else 0)

def configure_devices(new_config):
    global config
    config.update(new_config)
    init_devices()
    return {'status': 'configured', 'config': config}

def process_command(cmd):
    if cmd.get('command') == 'set_fan':
        set_fan_level(cmd.get('level', 0))
    elif cmd.get('command') == 'set_power':
        set_power(cmd.get('state', False))
    elif cmd.get('command') == 'configure_devices':
        return configure_devices(cmd.get('config', {}))

# Main loop
last_send = 0
while True:
    # Send sensor data every 2 seconds
    if time.ticks_ms() - last_send > 2000:
        data = read_sensors()
        print(json.dumps(data))
        last_send = time.ticks_ms()

    # Check for incoming commands
    if uart.any():
        try:
            line = uart.readline().decode().strip()
            cmd = json.loads(line)
            response = process_command(cmd)
            if response:
                print(json.dumps(response))
        except:
            pass

    time.sleep(0.1)