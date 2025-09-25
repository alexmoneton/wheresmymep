#!/usr/bin/env python3
"""
Script to email MEPs their attendance scores in their respective languages.
This promotes transparency and accountability by directly informing MEPs of their performance.
"""

import pandas as pd
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import time
import logging
from typing import Dict

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Language mappings for MEP countries
LANGUAGE_MAPPINGS = {
    'Austria': 'de',
    'Belgium': 'nl',
    'Bulgaria': 'bg',
    'Croatia': 'hr',
    'Cyprus': 'el',
    'Czech Republic': 'cs',
    'Denmark': 'da',
    'Estonia': 'et',
    'Finland': 'fi',
    'France': 'fr',
    'Germany': 'de',
    'Greece': 'el',
    'Hungary': 'hu',
    'Ireland': 'en',
    'Italy': 'it',
    'Latvia': 'lv',
    'Lithuania': 'lt',
    'Luxembourg': 'fr',
    'Malta': 'en',
    'Kingdom of the Netherlands': 'nl',
    'Poland': 'pl',
    'Portugal': 'pt',
    'Romania': 'ro',
    'Slovakia': 'sk',
    'Slovenia': 'sl',
    'Spain': 'es',
    'Sweden': 'sv'
}

# Email templates in different languages
EMAIL_TEMPLATES = {
    'en': {
        'subject': 'Your European Parliament Attendance Score - {name}',
        'body': '''Dear {name},

I hope this email finds you well. I am writing to share your attendance record for European Parliament roll-call votes over the last 180 days.

Your Attendance Statistics:
• Total votes in period: {total_votes}
• Votes you participated in: {votes_cast}
• Attendance rate: {attendance_pct}%

This data is publicly available on our transparency platform "Where's My MEP?" (wheresmymep.eu), which tracks MEP attendance to promote democratic accountability.

{special_message}

If you have any questions about this data or would like to discuss your voting record, please don't hesitate to reach out.

Best regards,
The Where's My MEP? Team

---
This is an automated message from a transparency initiative. For more information, visit wheresmymep.eu'''
    },
    'de': {
        'subject': 'Ihre Anwesenheitsstatistik im Europäischen Parlament - {name}',
        'body': '''Sehr geehrte/r {name},

ich hoffe, diese E-Mail erreicht Sie bei bester Gesundheit. Ich schreibe Ihnen, um Ihre Anwesenheitsstatistik bei namentlichen Abstimmungen im Europäischen Parlament der letzten 180 Tage mitzuteilen.

Ihre Anwesenheitsstatistik:
• Gesamtstimmen im Zeitraum: {total_votes}
• Stimmen, an denen Sie teilgenommen haben: {votes_cast}
• Anwesenheitsrate: {attendance_pct}%

Diese Daten sind öffentlich auf unserer Transparenzplattform "Where's My MEP?" (wheresmymep.eu) verfügbar.

{special_message}

Mit freundlichen Grüßen,
Das Where's My MEP? Team'''
    },
    'fr': {
        'subject': 'Votre score de présence au Parlement européen - {name}',
        'body': '''Cher/Chère {name},

J'espère que ce courriel vous trouve en bonne santé. Je vous écris pour partager votre dossier de présence lors des votes par appel nominal au Parlement européen au cours des 180 derniers jours.

Vos statistiques de présence :
• Total des votes dans la période : {total_votes}
• Votes auxquels vous avez participé : {votes_cast}
• Taux de présence : {attendance_pct}%

Ces données sont publiquement disponibles sur notre plateforme de transparence "Where's My MEP?" (wheresmymep.eu).

{special_message}

Cordialement,
L'équipe Where's My MEP?'''
    },
    'es': {
        'subject': 'Su puntuación de asistencia al Parlamento Europeo - {name}',
        'body': '''Estimado/a {name},

Espero que este correo le encuentre bien. Le escribo para compartir su registro de asistencia a las votaciones nominales del Parlamento Europeo durante los últimos 180 días.

Sus estadísticas de asistencia:
• Total de votos en el período: {total_votes}
• Votos en los que participó: {votes_cast}
• Tasa de asistencia: {attendance_pct}%

Estos datos están disponibles públicamente en nuestra plataforma de transparencia "Where's My MEP?" (wheresmymep.eu).

{special_message}

Saludos cordiales,
El equipo de Where's My MEP?'''
    },
    'it': {
        'subject': 'Il tuo punteggio di presenza al Parlamento europeo - {name}',
        'body': '''Caro/a {name},

Spero che questa email ti trovi in buona salute. Ti scrivo per condividere il tuo record di presenza alle votazioni per appello nominale del Parlamento europeo negli ultimi 180 giorni.

Le tue statistiche di presenza:
• Totale voti nel periodo: {total_votes}
• Voti a cui hai partecipato: {votes_cast}
• Tasso di presenza: {attendance_pct}%

Questi dati sono pubblicamente disponibili sulla nostra piattaforma di trasparenza "Where's My MEP?" (wheresmymep.eu).

{special_message}

Cordiali saluti,
Il team di Where's My MEP?'''
    },
    'nl': {
        'subject': 'Uw aanwezigheidsscore in het Europees Parlement - {name}',
        'body': '''Beste {name},

Ik hoop dat deze e-mail u in goede gezondheid bereikt. Ik schrijf u om uw aanwezigheidsrecord voor hoofdelijke stemmingen in het Europees Parlement van de afgelopen 180 dagen te delen.

Uw aanwezigheidsstatistieken:
• Totaal stemmen in de periode: {total_votes}
• Stemmen waaraan u heeft deelgenomen: {votes_cast}
• Aanwezigheidspercentage: {attendance_pct}%

Deze gegevens zijn openbaar beschikbaar op ons transparantieplatform "Where's My MEP?" (wheresmymep.eu).

{special_message}

Met vriendelijke groet,
Het Where's My MEP? Team'''
    }
}

# Special messages for different attendance levels
SPECIAL_MESSAGES = {
    'high': {
        'en': 'Congratulations on your excellent attendance record! Your consistent participation demonstrates your commitment to representing your constituents.',
        'de': 'Herzlichen Glückwunsch zu Ihrer ausgezeichneten Anwesenheitsstatistik!',
        'fr': 'Félicitations pour votre excellent dossier de présence !',
        'es': '¡Felicidades por su excelente registro de asistencia!',
        'it': 'Congratulazioni per il tuo eccellente record di presenza!',
        'nl': 'Gefeliciteerd met uw uitstekende aanwezigheidsrecord!'
    },
    'medium': {
        'en': 'Your attendance record shows room for improvement. Consider how you can better serve your constituents.',
        'de': 'Ihre Anwesenheitsstatistik zeigt Verbesserungsmöglichkeiten.',
        'fr': 'Votre dossier de présence montre qu\'il y a place à l\'amélioration.',
        'es': 'Su registro de asistencia muestra margen de mejora.',
        'it': 'Il tuo record di presenza mostra margini di miglioramento.',
        'nl': 'Uw aanwezigheidsrecord toont ruimte voor verbetering.'
    },
    'low': {
        'en': 'Your attendance record is concerning. As an elected representative, your constituents expect you to participate in parliamentary votes.',
        'de': 'Ihre Anwesenheitsstatistik ist besorgniserregend.',
        'fr': 'Votre dossier de présence est préoccupant.',
        'es': 'Su registro de asistencia es preocupante.',
        'it': 'Il tuo record di presenza è preoccupante.',
        'nl': 'Uw aanwezigheidsrecord is zorgwekkend.'
    }
}

def get_language_for_country(country: str) -> str:
    """Get the appropriate language code for a country."""
    return LANGUAGE_MAPPINGS.get(country, 'en')

def get_special_message(attendance_pct: float, language: str) -> str:
    """Get appropriate special message based on attendance percentage."""
    if attendance_pct >= 90:
        return SPECIAL_MESSAGES['high'].get(language, SPECIAL_MESSAGES['high']['en'])
    elif attendance_pct >= 70:
        return SPECIAL_MESSAGES['medium'].get(language, SPECIAL_MESSAGES['medium']['en'])
    else:
        return SPECIAL_MESSAGES['low'].get(language, SPECIAL_MESSAGES['low']['en'])

def format_email_content(mep_data: Dict, language: str) -> tuple:
    """Format email content for a specific MEP."""
    template = EMAIL_TEMPLATES.get(language, EMAIL_TEMPLATES['en'])
    special_message = get_special_message(mep_data['attendance_pct'], language)
    
    subject = template['subject'].format(name=mep_data['name'])
    body = template['body'].format(
        name=mep_data['name'],
        total_votes=mep_data['votes_total_period'],
        votes_cast=mep_data['votes_cast'],
        attendance_pct=mep_data['attendance_pct'],
        special_message=special_message
    )
    
    return subject, body

def send_email(to_email: str, subject: str, body: str, smtp_config: Dict) -> bool:
    """Send email using SMTP configuration."""
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_config['from_email']
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        server = smtplib.SMTP(smtp_config['smtp_server'], smtp_config['smtp_port'])
        server.starttls()
        server.login(smtp_config['username'], smtp_config['password'])
        
        text = msg.as_string()
        server.sendmail(smtp_config['from_email'], to_email, text)
        server.quit()
        
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def load_mep_data() -> pd.DataFrame:
    """Load MEP data from CSV files."""
    try:
        # Load attendance data (which already has all the info we need)
        df = pd.read_csv('data/meps_attendance.csv')
        
        # Create placeholder emails (you'll need real email addresses)
        df['email'] = df['mep_id'].apply(
            lambda x: f"mep-{x}@europarl.europa.eu" if pd.notna(x) else None
        )
        
        return df
    except Exception as e:
        logger.error(f"Failed to load MEP data: {str(e)}")
        return pd.DataFrame()

def main():
    """Main function to send emails to all MEPs."""
    logger.info("Starting MEP email campaign...")
    
    # Load MEP data
    meps_df = load_mep_data()
    if meps_df.empty:
        logger.error("No MEP data loaded. Exiting.")
        return
    
    logger.info(f"Loaded data for {len(meps_df)} MEPs")
    
    # SMTP configuration - YOU NEED TO SET THESE UP
    smtp_config = {
        'smtp_server': 'smtp.gmail.com',
        'smtp_port': 587,
        'username': 'your-email@gmail.com',  # Replace with your email
        'password': 'your-app-password',     # Replace with your app password
        'from_email': 'your-email@gmail.com'  # Replace with your email
    }
    
    # Email sending statistics
    sent_count = 0
    failed_count = 0
    
    # Process each MEP (limit to first 5 for demo)
    for index, mep in meps_df.head(5).iterrows():
        try:
            # Skip MEPs without valid data
            if pd.isna(mep['mep_id']) or pd.isna(mep['attendance_pct']):
                logger.warning(f"Skipping {mep['name']} - missing data")
                continue
            
            # Get language for MEP's country
            language = get_language_for_country(mep['country'])
            
            # Format email content
            mep_data = {
                'name': mep['name'],
                'attendance_pct': mep['attendance_pct'],
                'votes_total_period': mep['votes_total_period'],
                'votes_cast': mep['votes_cast']
            }
            
            subject, body = format_email_content(mep_data, language)
            
            # Print email content (for testing - remove this when actually sending)
            print(f"\n{'='*50}")
            print(f"TO: {mep['email']}")
            print(f"SUBJECT: {subject}")
            print(f"LANGUAGE: {language}")
            print(f"ATTENDANCE: {mep['attendance_pct']}%")
            print(f"{'='*50}")
            print(body)
            print(f"{'='*50}\n")
            
            # Uncomment the following lines to actually send emails
            # if send_email(mep['email'], subject, body, smtp_config):
            #     sent_count += 1
            #     logger.info(f"✅ Sent email to {mep['name']} ({mep['country']}) - {mep['attendance_pct']}% attendance")
            # else:
            #     failed_count += 1
            #     logger.error(f"❌ Failed to send email to {mep['name']}")
            
            # Rate limiting
            time.sleep(0.5)
            
        except Exception as e:
            logger.error(f"Error processing {mep['name']}: {str(e)}")
            failed_count += 1
    
    # Summary
    logger.info(f"\n📊 Email Campaign Summary:")
    logger.info(f"✅ Emails would be sent: {len(meps_df.head(5))}")
    logger.info(f"❌ Emails failed: {failed_count}")

if __name__ == "__main__":
    main()
