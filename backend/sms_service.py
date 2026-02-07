# SMS Service for OTP delivery
import os
import logging
from twilio.rest import Client
from typing import Optional

logger = logging.getLogger(__name__)

# Twilio Configuration
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', '')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER', '')
TWILIO_VERIFY_SERVICE = os.getenv('TWILIO_VERIFY_SERVICE', '')

# Test mode flag - if True, OTP is just logged instead of sending SMS
TEST_MODE = os.getenv('SMS_TEST_MODE', 'True').lower() == 'true'

class SMSService:
    def __init__(self):
        self.client = None
        if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and not TEST_MODE:
            try:
                self.client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
                logger.info("Twilio SMS client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Twilio client: {str(e)}")
                self.client = None
    
    async def send_otp_sms(self, phone: str, otp: str) -> tuple[bool, str]:
        """Send OTP via SMS using Twilio
        
        Args:
            phone: Phone number in format +91XXXXXXXXXX
            otp: 6-digit OTP code
            
        Returns:
            tuple: (success: bool, message: str)
        """
        # Ensure phone has country code
        if not phone.startswith('+'):
            phone = f"+91{phone}"  # Default to India
        
        # Test mode - just log the OTP
        if TEST_MODE or not self.client:
            logger.info(f"[TEST MODE] OTP for {phone}: {otp}")
            return True, f"OTP sent successfully. (Test OTP: {otp})"
        
        # Production mode - send real SMS
        try:
            if TWILIO_VERIFY_SERVICE:
                # Use Twilio Verify API (recommended)
                verification = self.client.verify.v2.services(
                    TWILIO_VERIFY_SERVICE
                ).verifications.create(
                    to=phone,
                    channel='sms'
                )
                logger.info(f"Twilio Verify OTP sent to {phone}: {verification.status}")
                return True, "OTP sent successfully via SMS"
            else:
                # Use direct SMS API
                message = self.client.messages.create(
                    body=f"Your SOVEH verification code is: {otp}. Valid for 5 minutes.",
                    from_=TWILIO_PHONE_NUMBER,
                    to=phone
                )
                logger.info(f"SMS sent to {phone}: {message.sid}")
                return True, "OTP sent successfully via SMS"
        
        except Exception as e:
            logger.error(f"Failed to send SMS to {phone}: {str(e)}")
            # Fallback to test mode
            logger.info(f"[FALLBACK] OTP for {phone}: {otp}")
            return True, f"OTP sent successfully. (Test OTP: {otp})"
    
    async def verify_otp_twilio(self, phone: str, otp: str) -> tuple[bool, str]:
        """Verify OTP using Twilio Verify API
        
        Only used if TWILIO_VERIFY_SERVICE is configured.
        Otherwise, verification is done locally against database.
        """
        if TEST_MODE or not self.client or not TWILIO_VERIFY_SERVICE:
            return False, "Verify locally against database"
        
        try:
            if not phone.startswith('+'):
                phone = f"+91{phone}"
            
            verification_check = self.client.verify.v2.services(
                TWILIO_VERIFY_SERVICE
            ).verification_checks.create(
                to=phone,
                code=otp
            )
            
            if verification_check.status == 'approved':
                return True, "OTP verified successfully"
            else:
                return False, "Invalid OTP"
        
        except Exception as e:
            logger.error(f"Twilio verification failed: {str(e)}")
            return False, "Verify locally against database"

# Global SMS service instance
sms_service = SMSService()
