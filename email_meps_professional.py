#!/usr/bin/env python3
"""
Professional Email Campaign for MEPs - Celebrating Good Performance
This script sends congratulatory emails to MEPs with 85%+ attendance records,
encouraging them to share their achievements and promote transparency.
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

# Professional email templates
EMAIL_TEMPLATES = {
    'en': {
        'subject': 'Your European Parliament Attendance Record - Congratulations',
        'body': '''Dear {name},

I hope this email finds you well. I am writing to congratulate you on your excellent attendance record in the European Parliament.

Your Performance Statistics:
• Total votes in the last 180 days: {total_votes}
• Votes you participated in: {votes_cast}
• Your attendance rate: {attendance_pct}%

{special_message}

Transparency and Accountability
This data comes from "Where's My MEP?" (wheresmymep.eu), a transparency platform that tracks MEP attendance to promote democratic accountability. Your excellent record is publicly visible and demonstrates your commitment to representing your constituents.

Sharing Your Success
Feel free to share this achievement with your constituents and on social media. They should know about your dedication to representing them in Brussels.

If you would like to discuss this data or have any questions, please do not hesitate to reach out.

Best regards,
The Where's My MEP? Team

---
This is a positive transparency initiative celebrating democratic participation.
Visit wheresmymep.eu to see your full profile and share your achievements.'''
    },
    'de': {
        'subject': 'Ihre Anwesenheitsstatistik im Europäischen Parlament - Herzlichen Glückwunsch',
        'body': '''Sehr geehrte/r {name},

ich hoffe, diese E-Mail erreicht Sie bei bester Gesundheit. Ich schreibe Ihnen, um Sie zu Ihrer ausgezeichneten Anwesenheitsstatistik im Europäischen Parlament zu gratulieren.

Ihre Leistungsstatistiken:
• Gesamtstimmen in den letzten 180 Tagen: {total_votes}
• Stimmen, an denen Sie teilgenommen haben: {votes_cast}
• Ihre Anwesenheitsrate: {attendance_pct}%

{special_message}

Transparenz und Rechenschaftspflicht
Diese Daten stammen von "Where's My MEP?" (wheresmymep.eu), einer Transparenzplattform, die die Anwesenheit von MdEPs verfolgt.

Mit freundlichen Grüßen,
Das Where's My MEP? Team'''
    },
    'fr': {
        'subject': 'Votre dossier de présence au Parlement européen - Félicitations',
        'body': '''Cher/Chère {name},

J'espère que ce courriel vous trouve en bonne santé. Je vous écris pour vous féliciter de votre excellent dossier de présence au Parlement européen.

Vos statistiques de performance:
• Total des votes des 180 derniers jours: {total_votes}
• Votes auxquels vous avez participé: {votes_cast}
• Votre taux de présence: {attendance_pct}%

{special_message}

Transparence et Responsabilité
Ces données proviennent de "Where's My MEP?" (wheresmymep.eu), une plateforme de transparence.

Cordialement,
L'équipe Where's My MEP?'''
    },
    'es': {
        'subject': 'Su registro de asistencia al Parlamento Europeo - Felicidades',
        'body': '''Estimado/a {name},

Espero que este correo le encuentre bien. Le escribo para felicitarle por su excelente registro de asistencia en el Parlamento Europeo.

Sus estadísticas de rendimiento:
• Total de votos en los últimos 180 días: {total_votes}
• Votos en los que participó: {votes_cast}
• Su tasa de asistencia: {attendance_pct}%

{special_message}

Transparencia y Responsabilidad
Estos datos provienen de "Where's My MEP?" (wheresmymep.eu), una plataforma de transparencia.

Saludos cordiales,
El equipo de Where's My MEP?'''
    },
    'it': {
        'subject': 'Il tuo record di presenza al Parlamento europeo - Congratulazioni',
        'body': '''Caro/a {name},

Spero che questa email ti trovi in buona salute. Ti scrivo per congratularmi con te per il tuo eccellente record di presenza al Parlamento europeo.

Le tue statistiche di performance:
• Totale voti negli ultimi 180 giorni: {total_votes}
• Voti a cui hai partecipato: {votes_cast}
• Il tuo tasso di presenza: {attendance_pct}%

{special_message}

Trasparenza e Responsabilità
Questi dati provengono da "Where's My MEP?" (wheresmymep.eu), una piattaforma di trasparenza.

Cordiali saluti,
Il team di Where's My MEP?'''
    },
    'nl': {
        'subject': 'Uw aanwezigheidsrecord in het Europees Parlement - Gefeliciteerd',
        'body': '''Beste {name},

Ik hoop dat deze e-mail u in goede gezondheid bereikt. Ik schrijf u om u te feliciteren met uw uitstekende aanwezigheidsrecord in het Europees Parlement.

Uw prestatiestatistieken:
• Totaal stemmen in de laatste 180 dagen: {total_votes}
• Stemmen waaraan u heeft deelgenomen: {votes_cast}
• Uw aanwezigheidspercentage: {attendance_pct}%

{special_message}

Transparantie en Verantwoording
Deze gegevens komen van "Where's My MEP?" (wheresmymep.eu), een transparantieplatform.

Met vriendelijke groet,
Het Where's My MEP? Team'''
    }
}

# Professional celebratory messages
SPECIAL_MESSAGES = {
    'excellent': {
        'en': 'Outstanding performance! You are among the top-performing MEPs with exceptional attendance. Your constituents can be proud of your dedication to democratic participation.',
        'de': 'Hervorragende Leistung! Sie gehören zu den Spitzenreitern der MdEPs mit außergewöhnlicher Anwesenheit.',
        'fr': 'Performance exceptionnelle! Vous faites partie des meilleurs députés européens avec une présence exceptionnelle.',
        'es': '¡Rendimiento excepcional! Está entre los mejores eurodiputados con una asistencia excepcional.',
        'it': 'Prestazione eccezionale! Sei tra i migliori eurodeputati con una presenza eccezionale.',
        'nl': 'Uitstekende prestatie! U behoort tot de top van Europarlementariërs met uitzonderlijke aanwezigheid.'
    },
    'very_good': {
        'en': 'Excellent work! You are performing well above average. Your consistent participation demonstrates real commitment to your role as an MEP.',
        'de': 'Ausgezeichnete Arbeit! Sie liegen deutlich über dem Durchschnitt.',
        'fr': 'Excellent travail! Vous performez bien au-dessus de la moyenne.',
        'es': '¡Excelente trabajo! Está actuando muy por encima del promedio.',
        'it': 'Lavoro eccellente! Stai performando ben al di sopra della media.',
        'nl': 'Uitstekend werk! U presteert ver boven het gemiddelde.'
    },
    'good': {
        'en': 'Well done! You are maintaining solid attendance and showing good commitment to parliamentary duties.',
        'de': 'Gut gemacht! Sie halten eine solide Anwesenheit aufrecht.',
        'fr': 'Bien fait! Vous maintenez une présence solide.',
        'es': '¡Bien hecho! Está manteniendo una asistencia sólida.',
        'it': 'Ben fatto! Stai mantenendo una presenza solida.',
        'nl': 'Goed gedaan! U houdt een solide aanwezigheid aan.'
    }
}

def get_language_for_country(country: str) -> str:
    """Get the appropriate language code for a country."""
    return LANGUAGE_MAPPINGS.get(country, 'en')

def get_special_message(attendance_pct: float, language: str) -> str:
    """Get appropriate celebratory message based on attendance percentage."""
    if attendance_pct >= 95:
        return SPECIAL_MESSAGES['excellent'].get(language, SPECIAL_MESSAGES['excellent']['en'])
    elif attendance_pct >= 90:
        return SPECIAL_MESSAGES['very_good'].get(language, SPECIAL_MESSAGES['very_good']['en'])
    else:
        return SPECIAL_MESSAGES['good'].get(language, SPECIAL_MESSAGES['good']['en'])

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
    """Load MEP data and filter for good performers (85%+ attendance)."""
    try:
        # Load attendance data
        df = pd.read_csv('data/meps_attendance.csv')
        
        # Filter for MEPs with 85%+ attendance
        good_performers = df[df['attendance_pct'] >= 85].copy()
        
        # Create placeholder emails
        good_performers['email'] = good_performers['mep_id'].apply(
            lambda x: f"mep-{x}@europarl.europa.eu" if pd.notna(x) else None
        )
        
        return good_performers
    except Exception as e:
        logger.error(f"Failed to load MEP data: {str(e)}")
        return pd.DataFrame()

def main():
    """Main function to send professional emails to high-performing MEPs."""
    logger.info("Starting PROFESSIONAL MEP email campaign...")
    
    # Load MEP data (85%+ attendance)
    meps_df = load_mep_data()
    if meps_df.empty:
        logger.error("No MEP data loaded. Exiting.")
        return
    
    logger.info(f"Loaded data for {len(meps_df)} high-performing MEPs (85%+ attendance)")
    
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
    
    # Process each MEP (limit to first 3 for demo)
    for index, mep in meps_df.head(3).iterrows():
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
            
            # Print email content (for testing)
            print(f"\n{'='*60}")
            print(f"PROFESSIONAL EMAIL FOR HIGH PERFORMER")
            print(f"{'='*60}")
            print(f"TO: {mep['email']}")
            print(f"SUBJECT: {subject}")
            print(f"LANGUAGE: {language}")
            print(f"ATTENDANCE: {mep['attendance_pct']}% (85%+ PERFORMER)")
            print(f"{'='*60}")
            print(body)
            print(f"{'='*60}\n")
            
            # Uncomment to actually send emails
            # if send_email(mep['email'], subject, body, smtp_config):
            #     sent_count += 1
            #     logger.info(f"✅ Sent professional email to {mep['name']} ({mep['country']}) - {mep['attendance_pct']}% attendance")
            # else:
            #     failed_count += 1
            #     logger.error(f"❌ Failed to send email to {mep['name']}")
            
            # Rate limiting
            time.sleep(0.5)
            
        except Exception as e:
            logger.error(f"Error processing {mep['name']}: {str(e)}")
            failed_count += 1
    
    # Summary
    logger.info(f"\nPROFESSIONAL Email Campaign Summary:")
    logger.info(f"✅ Professional emails would be sent: {len(meps_df.head(3))}")
    logger.info(f"❌ Emails failed: {failed_count}")
    logger.info(f"📊 Total high performers (85%+): {len(meps_df)}")

if __name__ == "__main__":
    main()
