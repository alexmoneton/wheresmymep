#!/usr/bin/env python3
"""
Test Email Script - Send one test email to alex.moneton@gmail.com
"""

import pandas as pd
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def send_test_email():
    """Send a test email to alex.moneton@gmail.com"""
    
    # Test MEP data (using Abir Al-Sahlani as example)
    mep_data = {
        'name': 'Abir Al-Sahlani',
        'attendance_pct': 94.7,
        'votes_total_period': 1215,
        'votes_cast': 1150,
        'country': 'Sweden'
    }
    
    # Email content
    subject = "Your European Parliament Attendance Record - Congratulations"
    body = f"""Dear {mep_data['name']},

I hope this email finds you well. I am writing to congratulate you on your excellent attendance record in the European Parliament.

Your Performance Statistics:
• Total votes in the last 180 days: {mep_data['votes_total_period']}
• Votes you participated in: {mep_data['votes_cast']}
• Your attendance rate: {mep_data['attendance_pct']}%

Excellent work! You are performing well above average. Your consistent participation demonstrates real commitment to your role as an MEP.

Transparency and Accountability
This data comes from "Where's My MEP?" (wheresmymep.eu), a transparency platform that tracks MEP attendance to promote democratic accountability. Your excellent record is publicly visible and demonstrates your commitment to representing your constituents.

Sharing Your Success
Feel free to share this achievement with your constituents and on social media. They should know about your dedication to representing them in Brussels.

If you would like to discuss this data or have any questions, please do not hesitate to reach out.

Best regards,
The Where's My MEP? Team

---
This is a positive transparency initiative celebrating democratic participation.
Visit wheresmymep.eu to see your full profile and share your achievements.

---
TEST EMAIL: This is a test email sent to alex.moneton@gmail.com to demonstrate the MEP email campaign."""
    
    # SMTP configuration - YOU NEED TO SET THESE UP
    smtp_config = {
        'smtp_server': 'smtp.gmail.com',
        'smtp_port': 587,
        'username': 'your-email@gmail.com',  # Replace with your email
        'password': 'your-app-password',     # Replace with your app password
        'from_email': 'your-email@gmail.com'  # Replace with your email
    }
    
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_config['from_email']
        msg['To'] = 'alex.moneton@gmail.com'
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        print("="*60)
        print("TEST EMAIL PREVIEW")
        print("="*60)
        print(f"TO: alex.moneton@gmail.com")
        print(f"FROM: {smtp_config['from_email']}")
        print(f"SUBJECT: {subject}")
        print("="*60)
        print(body)
        print("="*60)
        
        # Uncomment the following lines to actually send the email
        # server = smtplib.SMTP(smtp_config['smtp_server'], smtp_config['smtp_port'])
        # server.starttls()
        # server.login(smtp_config['username'], smtp_config['password'])
        # 
        # text = msg.as_string()
        # server.sendmail(smtp_config['from_email'], 'alex.moneton@gmail.com', text)
        # server.quit()
        # 
        # print("✅ Test email sent successfully to alex.moneton@gmail.com!")
        
        print("\n⚠️  To actually send this email, you need to:")
        print("1. Set up your Gmail app password")
        print("2. Update the smtp_config with your credentials")
        print("3. Uncomment the sending code above")
        
    except Exception as e:
        logger.error(f"Failed to send test email: {str(e)}")

if __name__ == "__main__":
    send_test_email()
