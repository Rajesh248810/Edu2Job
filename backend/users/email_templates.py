
# Generic Golden Template for Prime Users
GOLDEN_EMAIL_WRAPPER = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #000;
            color: #fff;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1c1c1c 0%, #000 100%);
            border: 2px solid #D4AF37;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
            margin-top: 20px;
            margin-bottom: 20px;
        }}
        .header {{
            background: linear-gradient(to right, #D4AF37, #C5A028, #D4AF37);
            padding: 20px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            color: #000;
            text-transform: uppercase;
            letter-spacing: 4px;
            font-size: 24px;
            font-weight: 800;
        }}
        .content {{
            padding: 40px 30px;
            text-align: center;
            color: #ccc;
            line-height: 1.6;
            font-size: 16px;
        }}
        h2 {{
            color: #D4AF37;
            font-size: 24px;
            margin-bottom: 20px;
            font-weight: 300;
            border-bottom: 1px solid #333;
            padding-bottom: 10px;
            display: inline-block;
        }}
        .vip-tag {{
            background-color: #D4AF37;
            color: #000;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
            letter-spacing: 1px;
        }}
        a {{
            color: #D4AF37;
            text-decoration: none;
            font-weight: bold;
        }}
        .cta-button {{
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(to right, #D4AF37, #F2D06B);
            color: #000 !important;
            text-decoration: none;
            font-weight: bold;
            border-radius: 50px;
            margin-top: 30px;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
        }}
        .footer {{
            background-color: #0a0a0a;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #333;
        }}
    </style>
</head>
<body>
    <div style="padding: 20px;">
        <div class="container">
            <div class="header">
                <h1>Edu2Job Prime</h1>
            </div>
            <div class="content">
                <div class="vip-tag">&#10024; VIP MEMBER EXCLUSIVE &#10024;</div>
                <br>
                <h2>{title}</h2>
                <div style="text-align: left;">
                    {body_content}
                </div>
                {cta_html}
            </div>
            <div class="footer">
                &copy; 2026 Edu2Job. All Rights Reserved.<br>
                Premium Service for Prime Members
            </div>
        </div>
    </div>
</body>
</html>
"""

PRIME_WELCOME_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #111;
            color: #fff;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1c1c1c 0%, #000 100%);
            border: 2px solid #D4AF37;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
        }
        .header {
            background: linear-gradient(to right, #D4AF37, #C5A028, #D4AF37);
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            color: #000;
            text-transform: uppercase;
            letter-spacing: 4px;
            font-size: 24px;
            font-weight: 800;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .icon {
            font-size: 60px;
            margin-bottom: 20px;
            color: #D4AF37;
        }
        h2 {
            color: #D4AF37;
            font-size: 28px;
            margin-bottom: 20px;
            font-weight: 300;
        }
        p {
            color: #ccc;
            line-height: 1.6;
            font-size: 16px;
            margin-bottom: 20px;
        }
        .feature-list {
            text-align: left;
            margin: 30px auto;
            width: 80%;
            border-top: 1px solid #333;
            border-bottom: 1px solid #333;
            padding: 20px 0;
        }
        .feature-item {
            padding: 10px 0;
            color: #fff;
            display: flex;
            align-items: center;
        }
        .feature-item span {
            color: #D4AF37;
            margin-right: 15px;
            font-size: 18px;
        }
        .cta-button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(to right, #D4AF37, #F2D06B);
            color: #000;
            text-decoration: none;
            font-weight: bold;
            border-radius: 50px;
            margin-top: 30px;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
        }
        .footer {
            background-color: #0a0a0a;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #333;
        }
    </style>
</head>
<body>
    <div style="padding: 20px;">
        <div class="container">
            <div class="header">
                <h1>Edu2Job Prime</h1>
            </div>
            <div class="content">
                <div class="icon">&#10024;</div>
                <h2>Welcome to the Elite Circle</h2>
                <p>Dear {name},</p>
                <p>Congratulations! You have successfully upgraded to <strong>Edu2Job Prime</strong>. Your account has been elevated to our premium tier, unlocking exclusive career tools designed to accelerate your success.</p>
                
                <div class="feature-list">
                    <div class="feature-item"><span>&#10003;</span> Exclusive Prime Badge</div>
                    <div class="feature-item"><span>&#10003;</span> View Contact Details</div>
                    <div class="feature-item"><span>&#10003;</span> "Hire Me" Recruiter Tag</div>
                    <div class="feature-item"><span>&#10003;</span> Advanced Career Predictions</div>
                </div>

                <p>We are thrilled to have you with us. Explore your new dashboard and let your profile shine.</p>

                <a href="http://localhost:5173/dashboard" class="cta-button">Go to Dashboard</a>
            </div>
            <div class="footer">
                &copy; 2026 Edu2Job. All Rights Reserved.<br>
                You received this email because you subscribed to Prime Membership.
            </div>
        </div>
    </div>
</body>
</html>
"""
