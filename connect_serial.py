import serial
import paho.mqtt.client as mqtt

ser = serial.Serial('/dev/ttyUSB0', 115200)

client = mqtt.Client()
client.username_pw_set("username", "aio_key")
client.connect("io.adafruit.com", 1883)

while True:
    data = ser.readline().decode().strip()
    client.publish("username/feeds/temperature", data)
    