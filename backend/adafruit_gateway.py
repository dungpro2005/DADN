import time
import os
import paho.mqtt.client as mqtt
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import threading

load_dotenv()

# --- Config ---
AIO_KEY       = os.getenv('ADAFRUIT_IO_KEY')
AIO_USERNAME  = os.getenv('ADAFRUIT_IO_USERNAME')
AIO_BROKER    = "io.adafruit.com"
PORT          = 1883
TELEMETRY_URL = os.getenv('TELEMETRY_URL')

# --- State ---
ZONES = {
    "toa-a": {
        "id": "MCH-001",
        "name": "Tòa A",
        "temp": None,
        "humi": None,
        "fan": None,
        "door": None,
        "auto": None,
        "heater": None,
        "humidifier": None,
        "pineapple": None,
        "has_new_data": False
    }
}

FEED_MAP = {
    # --- Sensor feeds (device -> Adafruit -> gateway -> backend) ---
    f"{AIO_USERNAME}/f/temperature": {"zone": "toa-a", "type": "temp"},
    f"{AIO_USERNAME}/f/humidity":    {"zone": "toa-a", "type": "humi"},
    f"{AIO_USERNAME}/f/fan":         {"zone": "toa-a", "type": "fan"},
    f"{AIO_USERNAME}/f/door":        {"zone": "toa-a", "type": "door"},
    # --- Command feeds (gateway -> Adafruit -> device) ---
    # Subscribe để xác nhận lệnh đã đến Adafruit và log trạng thái
    f"{AIO_USERNAME}/f/auto":        {"zone": "toa-a", "type": "auto"},
    f"{AIO_USERNAME}/f/heater":      {"zone": "toa-a", "type": "heater"},
    f"{AIO_USERNAME}/f/humidifier":  {"zone": "toa-a", "type": "humidifier"},
    f"{AIO_USERNAME}/f/pineapple":   {"zone": "toa-a", "type": "pineapple"},
}

mqtt_connected = False  # Trạng thái kết nối MQTT thực tế

# --- MQTT Callbacks ---
def on_connect(client, userdata, flags, rc, properties=None):
    global mqtt_connected
    if rc == 0:
        mqtt_connected = True
        print("[Connected] Connected to Adafruit IO successfully!")
        for topic in FEED_MAP.keys():
            client.subscribe(topic, qos=1)
            print(f"[Subscribe] Subscribed to {topic}")
    else:
        mqtt_connected = False
        print(f"[Error] Failed to connect. Code: {rc}")

def on_disconnect(client, userdata, rc, properties=None, reasonCode=None):
    global mqtt_connected
    mqtt_connected = False
    if rc != 0:
        print(f"[Disconnect] MQTT bị ngắt đột ngột (rc={rc}). Đang tự kết nối lại...")
    else:
        print("[Disconnect] MQTT ngắt kết nối bình thường.")

def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode('utf-8')

    if topic in FEED_MAP:
        info = FEED_MAP[topic]
        zone_key = info["zone"]
        data_type = info["type"]

        try:
            val = float(payload)
            if ZONES[zone_key][data_type] != val:
                ZONES[zone_key][data_type] = val
                ZONES[zone_key]["has_new_data"] = True
                print(f"[MQTT] {ZONES[zone_key]['name']} updated {data_type}: {val}")
        except ValueError:
            pass

# --- Telemetry ---
def send_telemetry_to_backend(zone_key):
    zone = ZONES[zone_key]

    if not zone["has_new_data"]:
        return

    payload = {
        "zone_id":     zone["id"],
        "zone_name":   zone["name"],
        "temperature": zone["temp"],
        "humidity":    zone["humi"],
        "fan_level":   zone["fan"],
        "door_status": zone["door"],
        "timestamp":   datetime.now(timezone.utc).isoformat()
    }

    try:
        response = requests.post(TELEMETRY_URL, json=payload, timeout=5)
        if response.status_code in [200, 201]:
            zone["has_new_data"] = False
            t = f"{zone['temp']}C"      if zone['temp'] is not None else "N/A"
            h = f"{zone['humi']}%"      if zone['humi'] is not None else "N/A"
            f = f"Level {zone['fan']}"  if zone['fan']  is not None else "N/A"
            d = "Open" if zone['door'] == 1 else "Closed" if zone['door'] == 0 else "N/A"
            print(f"[Backend] Pushed: Temp={t} Humi={h} Fan={f} Door={d}")
        else:
            print(f"[Backend] Error: {response.status_code}")
    except Exception as e:
        print(f"[Backend] Connection failed: {e}")

# --- Flask Control API ---
app = Flask(__name__)

@app.route('/api/control', methods=['POST'])
def control_device():
    data   = request.json
    device = data.get('device')
    value  = data.get('value')

    allowed_devices = [
        "fan", "door", "auto", "heater", "humidifier",
        "xoai", "chuoi", "thanh-long", "pineapple", "nhan"
    ]

    if device not in allowed_devices:
        return jsonify({"status": "error", "message": f"Device '{device}' not supported"}), 400

    if not mqtt_connected:
        print(f"[Control] ✗ MQTT chưa kết nối! Không thể gửi {device}={value}")
        return jsonify({"status": "error", "message": "MQTT chưa kết nối với Adafruit IO"}), 503

    # Publish QoS=1 (at least once delivery), retry tối đa 3 lần
    topic = f"{AIO_USERNAME}/f/{device}"
    for attempt in range(1, 4):
        result = client.publish(topic, str(value), qos=1)
        if result.rc == mqtt.MQTT_ERR_SUCCESS:
            print(f"[Control] ✓ Sent {device} -> {value} (attempt {attempt})")
            return jsonify({"status": "success"}), 200
        else:
            print(f"[Control] ✗ Publish thất bại (attempt {attempt}, rc={result.rc}), thử lại sau 300ms...")
            time.sleep(0.3)

    print(f"[Control] ✗ Gửi {device}={value} thất bại sau 3 lần thử!")
    return jsonify({"status": "error", "message": "Publish thất bại sau 3 lần thử"}), 500

@app.route('/api/status', methods=['GET'])
def get_status():
    """Kiểm tra trạng thái kết nối MQTT từ BE hoặc debug"""
    return jsonify({
        "mqtt_connected": mqtt_connected,
        "broker": AIO_BROKER,
        "username": AIO_USERNAME
    })

def run_flask():
    app.run(host='0.0.0.0', port=5000, use_reloader=False)

# --- MQTT Setup ---
client = mqtt.Client(
    callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
    client_id="PythonGateway_Main"
)
client.username_pw_set(AIO_USERNAME, AIO_KEY)
client.on_connect    = on_connect
client.on_disconnect = on_disconnect
client.on_message    = on_message

# Tự động kết nối lại sau 2-30s khi mất kết nối
client.reconnect_delay_set(min_delay=2, max_delay=30)

def main():
    try:
        client.connect(AIO_BROKER, PORT, keepalive=60)
        client.loop_start()

        threading.Thread(target=run_flask, daemon=True).start()
        print("Gateway is running and watching for data changes...")

        while True:
            for zone_key in ZONES.keys():
                send_telemetry_to_backend(zone_key)
            time.sleep(0.5)

    except KeyboardInterrupt:
        print("Stopping Gateway...")
    finally:
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    main()