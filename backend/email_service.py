# Email configuration for notifications
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

logger = logging.getLogger(__name__)

# Email settings (can be configured via environment variables)
SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@soveh.com')

async def send_email(to_email: str, subject: str, body: str, html_body: str = None) -> bool:
    """Send email notification"""
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("Email credentials not configured. Email not sent.")
        return False
    
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add plain text part
        msg.attach(MIMEText(body, 'plain'))
        
        # Add HTML part if provided
        if html_body:
            msg.attach(MIMEText(html_body, 'html'))
        
        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

async def send_otp_email(to_email: str, otp: str, phone: str) -> bool:
    """Send OTP via email"""
    subject = "Your SOVEH OTP Code"
    body = f"""Your OTP code is: {otp}
    
This code will expire in 5 minutes.
Phone: {phone}
    
If you didn't request this code, please ignore this email.
    
--
SOVEH Team"""
    
    html_body = f"""<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .otp-code {{ font-size: 32px; font-weight: bold; color: #007AFF; padding: 20px; text-align: center; background: #f5f5f5; border-radius: 8px; margin: 20px 0; }}
        .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>Your SOVEH OTP Code</h2>
        <p>Use this code to complete your login:</p>
        <div class="otp-code">{otp}</div>
        <p>This code will expire in 5 minutes.</p>
        <p>Phone: {phone}</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <div class="footer">
            <p>SOVEH - Retail Supply Network</p>
        </div>
    </div>
</body>
</html>"""
    
    return await send_email(to_email, subject, body, html_body)

async def send_order_notification(to_email: str, order_data: dict) -> bool:
    """Send order confirmation email"""
    subject = f"Order Confirmation - {order_data['order_number']}"
    body = f"""Order Confirmed!
    
Order Number: {order_data['order_number']}
Total Amount: ₹{order_data['total_amount']}
Status: {order_data['order_status']}
    
Thank you for your order!
    
--
SOVEH Team"""
    
    return await send_email(to_email, subject, body)

async def send_admin_notification(subject: str, body: str) -> bool:
    """Send notification to admin"""
    return await send_email(ADMIN_EMAIL, subject, body)
