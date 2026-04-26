import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

app = Flask(__name__)

# Temporary in-memory storage for OTPs
# Format: { email: { "otp": "1234", "expiry": datetime_object } }
otp_store = {}

EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USER = os.getenv('EMAIL_USER')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')

def send_email(target_email, otp):
    if not all([EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD]):
        print("[Error] Missing SMTP configuration in .env")
        return False
    
    try:
        msg = MIMEMultipart()
        msg['From'] = f"Drying Management Admin <{EMAIL_USER}>"
        msg['To'] = target_email
        msg['Subject'] = "Mã xác thực (OTP) đặt lại mật khẩu"

        body = f"""
        Chào bạn,

        Mã xác thực (OTP) để đặt lại mật khẩu của bạn là: {otp}

        Mã này sẽ hết hạn trong vòng 5 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.

        Trân trọng,
        Hệ thống quản lý máy sấy
        """
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"[Error] Failed to send email: {e}")
        return False

@app.route('/api/otp/generate', methods=['POST'])
def generate_otp():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    otp = str(random.randint(1000, 9999))
    expiry = datetime.now() + timedelta(minutes=5)
    
    success = send_email(email, otp)
    
    if success:
        otp_store[email] = {"otp": otp, "expiry": expiry}
        print(f"[OTP] Generated {otp} for {email}")
        return jsonify({"success": True, "message": "OTP sent successfully"}), 200
    else:
        # For development/debugging, if email fails, we might want to return the OTP 
        # but in production we should just return an error.
        # However, to help the user if they haven't configured SMTP yet:
        print(f"[OTP] Email failed, but generated OTP {otp} for {email} (Check server logs)")
        return jsonify({"error": "Failed to send email. Check SMTP configuration.", "debug_otp": otp}), 500

@app.route('/api/otp/verify', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')

    if not email or not otp:
        return jsonify({"error": "Email and OTP are required"}), 400

    record = otp_store.get(email)
    if not record:
        return jsonify({"error": "No OTP found for this email"}), 404

    if datetime.now() > record['expiry']:
        del otp_store[email]
        return jsonify({"error": "OTP has expired"}), 400

    if record['otp'] == str(otp):
        # In a real system, we'd provide a verified token. For now, just success.
        return jsonify({"success": True, "message": "OTP verified"}), 200
    else:
        return jsonify({"error": "Invalid OTP"}), 400

if __name__ == '__main__':
    # Running on 5001 to avoid conflict with adafruit gateway on 5000
    app.run(host='0.0.0.0', port=5001)
