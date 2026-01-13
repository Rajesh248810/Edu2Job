import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
val = CORS(app)  # Enable CORS for all routes

# Configuration
SMTP_HOST = os.getenv('EMAIL_HOST', 'smtp.hostinger.com')
SMTP_PORT = int(os.getenv('EMAIL_PORT', 465))
SMTP_USER = os.getenv('EMAIL_HOST_USER')
SMTP_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
API_SECRET = os.getenv('API_SECRET', 'default-dev-secret') # Simple security

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "Online", 
        "service": "Edu2Job Email Service",
        "host": SMTP_HOST,
        "port": SMTP_PORT
    })

@app.route('/send-email', methods=['POST'])
def send_email():
    # 1. Security Check
    auth_header = request.headers.get('Authorization')
    if not auth_header or auth_header != f"Bearer {API_SECRET}":
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    recipient = data.get('to')
    subject = data.get('subject')
    body = data.get('body')
    content_type = data.get('type', 'html') # 'html' or 'text'

    if not all([recipient, subject, body]):
        return jsonify({"error": "Missing required fields: to, subject, body"}), 400

    try:
        # Create Message
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = recipient
        msg['Subject'] = subject

        # Attach Body
        msg.attach(MIMEText(body, content_type))

        # Send via SMTP_SSL (Port 465) or STARTTLS (Port 587)
        if SMTP_PORT == 465:
            # SSL Connection
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, recipient, msg.as_string())
        else:
            # TLS Connection
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, recipient, msg.as_string())

        return jsonify({"status": "Success", "message": f"Email sent to {recipient}"}), 200

    except Exception as e:
        print(f"EMAIL ERROR: {e}")
        return jsonify({"error": str(e), "type": type(e).__name__}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
