# MEP Email Campaign Script

This script sends personalized attendance reports to MEPs in their respective languages, promoting transparency and accountability.

## Features

- **Multi-language support**: Emails sent in the MEP's country's primary language
- **Personalized content**: Each email includes the MEP's specific attendance statistics
- **Smart filtering**: Automatically skips MEPs on sick leave or with special roles
- **Rate limiting**: Prevents spam filter issues
- **Comprehensive logging**: Tracks success/failure rates

## Setup

### 1. Install Dependencies
```bash
pip install pandas
```

### 2. Configure Email Settings
Edit `email_config.json`:
```json
{
  "smtp": {
    "server": "smtp.gmail.com",
    "port": 587,
    "username": "your-email@gmail.com",
    "password": "your-app-password",
    "from_email": "your-email@gmail.com"
  }
}
```

### 3. Gmail Setup (if using Gmail)
1. Enable 2-factor authentication
2. Generate an "App Password" for this script
3. Use the app password (not your regular password)

### 4. Get Real Email Addresses
The script currently uses placeholder emails (`mep-{id}@europarl.europa.eu`). You'll need to:
1. Research actual MEP email addresses
2. Update the `load_mep_data()` function
3. Or create a separate CSV with email mappings

## Usage

### Test Mode (Recommended First)
```bash
python email_meps.py
```
This will print all emails to console without sending them.

### Production Mode
1. Edit `email_meps.py` and uncomment the actual sending lines
2. Set `test_mode: false` in `email_config.json`
3. Run: `python email_meps.py`

## Supported Languages

- English (en) - Ireland, Malta
- German (de) - Austria, Germany
- French (fr) - France, Luxembourg
- Spanish (es) - Spain
- Italian (it) - Italy
- Dutch (nl) - Belgium, Netherlands
- And more...

## Email Content

Each email includes:
- Personalized greeting in the MEP's language
- Attendance statistics (total votes, votes cast, percentage)
- Contextual message based on performance level
- Link to the transparency platform
- Professional, respectful tone

## Safety Features

- **Rate limiting**: 2-second delay between emails
- **Error handling**: Continues processing if individual emails fail
- **Logging**: Comprehensive logs of all activities
- **Filtering**: Automatically skips inappropriate recipients

## Legal Considerations

- Ensure compliance with GDPR and email regulations
- Consider sending from an official transparency organization
- Include proper unsubscribe mechanisms
- Respect MEPs' privacy and professional communication standards

## Example Output

```
2024-01-15 10:30:15 - INFO - Starting MEP email campaign...
2024-01-15 10:30:16 - INFO - Loaded data for 638 MEPs
2024-01-15 10:30:16 - INFO - ✅ Sent email to Roberta Metsola (Malta) - 95.2% attendance
2024-01-15 10:30:18 - INFO - ✅ Sent email to Manfred Weber (Germany) - 87.3% attendance
...
2024-01-15 10:45:30 - INFO - 📊 Email Campaign Summary:
2024-01-15 10:45:30 - INFO - ✅ Emails sent successfully: 635
2024-01-15 10:45:30 - INFO - ❌ Emails failed: 3
```

## Customization

You can customize:
- Email templates in `EMAIL_TEMPLATES`
- Language mappings in `LANGUAGE_MAPPINGS`
- Special messages in `SPECIAL_MESSAGES`
- Filtering criteria in the main function
- Rate limiting and batch sizes

## Troubleshooting

- **Authentication errors**: Check your email credentials and app password
- **SMTP errors**: Verify server settings and port numbers
- **Rate limiting**: Increase delays if hitting spam filters
- **Missing emails**: Update the email address mapping function
