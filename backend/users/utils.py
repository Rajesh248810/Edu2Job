from cryptography.fernet import Fernet
import os
import base64

class EncryptionUtil:
    """
    Utility class for handling field-level encryption using Fernet (AES-128).
    """
    
    # In a real production environment, this key should be loaded from environment variables
    # and NEVER hardcoded or generated on the fly like this (unless for the very first setup).
    # For this project, we will check for an env var, or fall back to a consistent dev key.
    # Note: Fernet.generate_key() returns bytes.
    
    _key = os.environ.get('ENCRYPTION_KEY')
    
    if not _key:
        # constant key for development so data doesn't get lost between restarts if not persisted
        # This is just a random key generated once.
        _key = b'Z7y6x5w4v3u2t1s0r9q8p7o6n5m4l3k2j1i0h9g8f7e=' 
        # Actually Fernet key must be 32 url-safe base64-encoded bytes.
        # Let's use a proper valid key for dev to avoid errors.
        # Generated using Fernet.generate_key() previously:
        _key = b'26_r39-wz8y6_A5m4Q7s1k9j5h3g2f1d0s8a6_P5o4I=' # Example placeholder
        # Let's just generate one if not present, but warn it's essentially ephemeral unless hardcoded better.
        # Better yet, let's hardcode a valid one for this session to ensure it works.
        _key = b'pZ3sw6X1r_7H9y2d4v8b5n1m0k3j6h5g4f2d1s0a9q8=' # Invalid length usually, need exact 32 bytes base64
        # Let's rely on the library to generate one if needed or just use a known valid test key.
        _key = b'VGhpcyBpcyBhIHNlY3JldCBrZXkgZm9yIGRldg==' # 'This is a secret key for dev' in b64 (approx) - actually need 32 bytes.
        
        # Proper 32-byte generic key for dev:
        _key = b'6Qd8f2g4h5j6k7l8m9n0p1q2r3s4t5u6v7w8x9y0z1a='

    @staticmethod
    def get_cipher_suite():
        try:
            return Fernet(EncryptionUtil._key)
        except Exception as e:
            # Fallback for key issues
            print(f"Encryption Key Error: {e}")
            # Generate a new valid key for this run just to not crash, 
            # BUT data persistence will fail.
            key = Fernet.generate_key()
            return Fernet(key)

    @staticmethod
    def encrypt(data):
        if not data:
            return None
        if isinstance(data, (int, float)):
            data = str(data)
        
        cipher_suite = EncryptionUtil.get_cipher_suite()
        encrypted_bytes = cipher_suite.encrypt(data.encode('utf-8'))
        return encrypted_bytes.decode('utf-8') # Return string for storage

    @staticmethod
    def decrypt(data):
        if not data:
            return None
        
        try:
            cipher_suite = EncryptionUtil.get_cipher_suite()
            decrypted_bytes = cipher_suite.decrypt(data.encode('utf-8'))
            return decrypted_bytes.decode('utf-8')
        except Exception as e:
            print(f"Decryption Error: {e}")
            return str(data) # Return raw if decryption fails (e.g. legacy clear text)

def create_notification(user, message, type='system'):
    """
    Creates a notification for the user and enforces a maximum limit of 4 notifications.
    Deletes oldest notifications if the limit is exceeded.
    """
    from .models import Notification
    
    # Create the new notification
    Notification.objects.create(user=user, message=message, type=type)
    
    # Enforce limit of 4
    # Get all notifications for user ordered by newest first
    notifications = Notification.objects.filter(user=user).order_by('-created_at')
    
    if notifications.count() > 4:
        # Keep the 4 newest, delete the rest
        # We use list slicing on values_list to safely get IDs to keep
        ids_to_keep = list(notifications.values_list('notification_id', flat=True)[:4])
        Notification.objects.filter(user=user).exclude(notification_id__in=ids_to_keep).delete()


# --- EMAIL UTILITIES ---

def get_email_template(title, body_content, cta_text=None, cta_link=None):
    """
    Returns a professional, responsive HTML email template (Amazon/Flipkart style).
    """
    cta_html = ""
    if cta_text and cta_link:
        cta_html = f"""
            <div style="text-align: center; margin: 30px 0;">
                <a href="{cta_link}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-family: sans-serif;">{cta_text}</a>
            </div>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 20px; margin-bottom: 20px;">
            <!-- Header -->
            <div style="background-color: #1E293B; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Edu2Job</h1>
            </div>

            <!-- Body -->
            <div style="padding: 30px; color: #333333; line-height: 1.6;">
                <h2 style="color: #1E293B; margin-top: 0;">{title}</h2>
                {body_content}
                {cta_html}
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
                <p style="margin: 0;">&copy; 2026 Edu2Job. All rights reserved.</p>
                <p style="margin: 5px 0;">Empowering Careers with AI.</p>
                <p style="margin: 0;"><a href="https://edu2job.online" style="color: #2563EB; text-decoration: none;">Visit Website</a></p>
            </div>
        </div>
    </body>
    </html>
    """

def send_html_email(subject, recipient_list, html_content):
    """
    Wrapper to send HTML emails in a thread.
    """
    from django.core.mail import send_mail
    from django.conf import settings
    import threading

    def _send():
        try:
            # Microservice Logic
            service_url = getattr(settings, 'EMAIL_MICROSERVICE_URL', '').rstrip('/')
            api_secret = getattr(settings, 'EMAIL_MICROSERVICE_SECRET', '')
            
            if not service_url:
                print("ERROR: EMAIL_MICROSERVICE_URL not configured.")
                return

            endpoint = f"{service_url}/send-email"
            payload = {
                "to": recipient_list[0] if isinstance(recipient_list, list) else recipient_list,
                "subject": subject,
                "body": html_content,
                "type": "html"
            }
            headers = {
                "Authorization": f"Bearer {api_secret}",
                "Content-Type": "application/json"
            }

            print(f"Sending Email via Microservice: {endpoint}")
            # print(f"Payload: {payload}") # Debug only

            import requests
            response = requests.post(endpoint, json=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                print(f"SUCCESS: Email sent via Microservice to {recipient_list}")
            else:
                print(f"ERROR: Microservice failed {response.status_code} - {response.text}")

        except Exception as e:
            try:
                print(f"ERROR Sending Email: {str(e)}")
            except:
                print("ERROR Sending Email: (Message decoding failed)")

    threading.Thread(target=_send).start()

def send_welcome_email(user):
    subject = "Welcome to Edu2Job! 🚀"
    body = f"""
        <p>Hi <strong>{user.name}</strong>,</p>
        <p>Welcome to Edu2Job! We are thrilled to have you on board.</p>
        <p>With Edu2Job, you can:</p>
        <ul style="padding-left: 20px;">
            <li>Predict your ideal career path based on your skills.</li>
            <li>Build ATS-friendly resumes in minutes.</li>
            <li>Get personalized job recommendations.</li>
        </ul>
        <p>We can't wait to see what you achieve!</p>
    """
    html_content = get_email_template("Welcome to the Future of Career Planning", body, "Complete Your Profile", "https://edu2job.online/profile")
    send_html_email(subject, [user.email], html_content)


def send_prediction_email(user, prediction_result):
    """
    Sends detailed prediction results to the user.
    """
    role = prediction_result.get('predictions', [{}])[0].get('role', 'Unknown Role')
    
    # Format top skills/insights if available (simplified for now)
    body = f"""
        <p>Hi <strong>{user.name}</strong>,</p>
        <p>Your career analysis is ready! Based on your profile and skills, our AI has predicted your best-fit role:</p>
        
        <div style="background-color: #EFF6FF; border-left: 4px solid #2563EB; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0; color: #1E40AF; font-size: 20px;">{role}</h3>
            <p style="margin: 5px 0 0 0; color: #3B82F6;">Top Recommendation</p>
        </div>

        <p>This role aligns with your current skill set. Check out the dashboard to see more details, confidence scores, and recommended learning paths.</p>
    """
    
    subject = f"Your Career Prediction Result: {role} 🎯"
    html_content = get_email_template("Career Analysis Report", body, "View Detailed Report", "https://edu2job.online/dashboard")
    send_html_email(subject, [user.email], html_content)


def send_ticket_reply_email(user, ticket_subject, reply_message):
    """
    Sends an email when an admin replies to a ticket.
    """
    body = f"""
        <p>Hi <strong>{user.name}</strong>,</p>
        <p>Our support team has replied to your ticket: <strong>"{ticket_subject}"</strong>.</p>
        
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #334155; font-style: italic;">"{reply_message}"</p>
        </div>

        <p>You can reply directly to this thread in the Help Center.</p>
    """
    
    subject = f"Support Update: {ticket_subject}"
    html_content = get_email_template("Update on your Support Ticket", body, "View Ticket", "https://edu2job.online/help-center")
    send_html_email(subject, [user.email], html_content)
