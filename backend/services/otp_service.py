import secrets
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class OTPService:
    def __init__(self):
        # In-memory OTP storage: {email: {"code": "123456", "expires_at": datetime, "mfa_session": "session_str"}}
        self._otps: Dict[str, Dict] = {}

    def generate_otp(self, email: str) -> Tuple[str, str]:
        """Generate a 6-digit OTP code and mfa_session token for a given email."""
        otp_code = f"{secrets.randbelow(900000) + 100000}"  # 6-digit string
        mfa_session = secrets.token_hex(16)
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

        self._otps[email.lower()] = {
            "code": otp_code,
            "expires_at": expires_at,
            "mfa_session": mfa_session
        }

        logger.info(f"Generated MFA OTP for {email}: {otp_code} (Session: {mfa_session})")
        print(f"\n==================================================")
        print(f"[MFA OTP GENERATED] Email: {email} | OTP Code: {otp_code} | Session: {mfa_session}")
        print(f"==================================================\n")

        import threading
        # Dispatch email in a background thread so login HTTP response returns INSTANTLY
        thread = threading.Thread(target=self._send_email_otp, args=(email, otp_code), daemon=True)
        thread.start()

        return otp_code, mfa_session

    def verify_otp(self, email: str, code: str, mfa_session: Optional[str] = None) -> bool:
        """Verify 6-digit OTP code for the given email."""
        email_key = email.lower()
        if email_key not in self._otps:
            # Fallback check for demo master OTP '123456'
            if code == "123456":
                return True
            return False

        record = self._otps[email_key]

        # Check expiration
        if datetime.now(timezone.utc) > record["expires_at"]:
            logger.warning(f"OTP expired for {email}")
            del self._otps[email_key]
            return False

        # Allow master OTP '123456' or exact matching generated code
        if code == "123456" or record["code"] == code:
            del self._otps[email_key]
            return True

        return False

    def _send_email_otp(self, email: str, code: str):
        """Send OTP code via SMTP if configured."""
        smtp_server = os.getenv("SMTP_SERVER") or "smtp.gmail.com"
        smtp_port = int(os.getenv("SMTP_PORT") or 587)
        smtp_user = os.getenv("SMTP_USERNAME") or "chandekarsujal884@gmail.com"
        smtp_pass = (os.getenv("SMTP_PASSWORD") or "ylgmgtoenfuvhazo").replace(" ", "")
        sender_email = os.getenv("SENDER_EMAIL") or smtp_user or "chandekarsujal884@gmail.com"

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"VAJRA Security - Your MFA Verification Code [{code}]"
            msg["From"] = f"VAJRA Threat Intelligence <{sender_email}>"
            msg["To"] = email

            text_body = f"Your VAJRA MFA verification code is: {code}\n\nThis code expires in 5 minutes."
            html_body = f"""
            <html>
              <body style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #ffffff; padding: 30px;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; text-align: center;">
                  <h2 style="color: #3b82f6; margin-bottom: 10px;">VAJRA Threat Intelligence</h2>
                  <p style="color: #9ca3af; font-size: 14px;">Multi-Factor Authentication (MFA) Verification</p>
                  <hr style="border: 0; border-top: 1px solid #374151; margin: 20px 0;" />
                  <p style="font-size: 14px; color: #e5e7eb;">Your 6-digit login verification code is:</p>
                  <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #60a5fa; background-color: #1e293b; padding: 15px; border-radius: 8px; margin: 20px 0; display: inline-block;">
                    {code}
                  </div>
                  <p style="font-size: 12px; color: #6b7280;">This code expires in 5 minutes. Do not share this code with anyone.</p>
                </div>
              </body>
            </html>
            """

            msg.attach(MIMEText(text_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            # Try SSL (Port 465) first (preferred on cloud environments like Render), fallback to TLS (Port 587)
            try:
                with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(sender_email, email, msg.as_string())
                logger.info(f"MFA OTP email sent successfully to {email} via SSL:465")
            except Exception as ssl_err:
                logger.warning(f"SSL:465 email dispatch failed ({ssl_err}); trying TLS:587...")
                with smtplib.SMTP(smtp_server, smtp_port, timeout=10) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(sender_email, email, msg.as_string())
                logger.info(f"MFA OTP email sent successfully to {email} via TLS:587")
        except Exception as e:
            logger.error(f"Failed to send MFA email to {email}: {e}")

otp_service = OTPService()
