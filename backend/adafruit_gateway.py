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
load_dotenv() # Load dữ liệu từ file .env vào bộ nhớ

AIO_KEY = os.getenv('ADAFRUIT_IO_KEY')
AIO_USERNAME = os.getenv('ADAFRUIT_IO_USERNAME')
OWNER_USERNAME = os.getenv('OWNER_USERNAME')
AIO_BROKER = "io.adafruit.com"
PORT = 1883

# --- State ---
ZONES = {
    "toa-a": {
        "id": 1, 
        "name": "Tòa A", 
        "temp": None, 
        "humi": None, 
        "fan": None,    
        "door": None,
        "has_new_data": False 
    }
}

FEED_MAP = {
    f"{AIO_USERNAME}/f/temperature": {"zone": "toa-a", "type": "temp"},
    f"{AIO_USERNAME}/f/humidity":    {"zone": "toa-a", "type": "humi"},
    f"{AIO_USERNAME}/f/fan":         {"zone": "toa-a", "type": "fan"},
    f"{AIO_USERNAME}/f/door":        {"zone": "toa-a", "type": "door"},
}

def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print("[Connected] Connectec to Adafruit IO successfully!")
        for topic in FEED_MAP.keys():
            client.subscribe(topic)
            print(f"[Subscribe] Subscribed to {topic}")
    else:
        print(f"[Error] Failed to connect. Code: {rc}")

def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode('utf-8')
    
    if topic in FEED_MAP:
        info = FEED_MAP[topic]
        zone_key = info["zone"]
        data_type = info["type"]
        
        try:
            val = float(payload)
            # Chỉ đánh dấu có dữ liệu mới nếu giá trị khác giá trị cũ đang lưu
            if ZONES[zone_key][data_type] != val:
                ZONES[zone_key][data_type] = val
                ZONES[zone_key]["has_new_data"] = True 
                print(f"[MQTT] {ZONES[zone_key]['name']} updated {data_type}: {val}")
        except ValueError:
            pass

def send_telemetry_to_backend(zone_key):
    zone = ZONES[zone_key]
    
    if not zone["has_new_data"]:
        return

    payload = {
        "zone_id": zone["id"],
        "zone_name": zone["name"],
        "temperature": zone["temp"],
        "humidity": zone["humi"],
        "fan_level": zone["fan"],
        "door_status": zone["door"],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    try:
        response = requests.post(TELEMETRY_URL, json=payload, timeout=5)
        if response.status_code in [200, 201]:
            zone["has_new_data"] = False # Reset cờ sau khi gửi thành công
            
            t = f"{zone['temp']}C" if zone['temp'] is not None else "N/A"
            h = f"{zone['humi']}%" if zone['humi'] is not None else "N/A"
            f = f"Level {zone['fan']}" if zone['fan'] is not None else "N/A"
            d = "Open" if zone['door'] == 1 else "Closed" if zone['door'] == 0 else "N/A"
            print(f"[Backend] Pushed new data for {zone['name']}: Temp= {t}\n Humi={h}\n Fan={f}\n Door={d}")
        else:
            print(f"[Backend] Error: {response.status_code}")
    except Exception as e:
        print(f"[Backend] Connection failed: {e}")

# --- Flask Control ---
app = Flask(__name__)
@app.route('/api/control', methods=['POST'])
def control_device():
    data = request.json
    device, value = data.get('device'), data.get('value')
    if device in ["fan", "door"]:
        client.publish(f"{AIO_USERNAME}/f/{device}", value)
        print(f"[Control] Sent command {device} -> {value}")
        return jsonify({"status": "success"}), 200
    return jsonify({"status": "error"}), 400

def run_flask():
    app.run(host='0.0.0.0', port=5000)

# --- MQTT Setup ---
client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2, client_id="PythonGateway_Main")
client.username_pw_set(AIO_USERNAME, AIO_KEY)
client.on_connect = on_connect
client.on_message = on_message

def main():
    try:
        client.connect(AIO_BROKER, PORT, 60)
        client.loop_start()
        
        threading.Thread(target=run_flask, daemon=True).start()
        print("Gateway is running and watching for data changes...")

        while True:
            for zone_key in ZONES.keys():
                send_telemetry_to_backend(zone_key)
            
            # Kiểm tra mỗi 500ms để đảm bảo tính thời gian thực
            time.sleep(0.5) 

    except KeyboardInterrupt:
        print("Stopping Gateway...")
    finally:
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    main()