import { AlertNotification, AlertChannel } from './alert-types';
import { Resend } from 'resend';

// Initialize Resend only when needed
function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export class NotificationService {
  /**
   * Send notification to the specified channel
   */
  static async sendNotification(notification: AlertNotification, channel: AlertChannel): Promise<boolean> {
    try {
      switch (channel.type) {
        case 'email':
          return await this.sendEmailNotification(notification, channel);
        case 'slack':
          return await this.sendSlackNotification(notification, channel);
        case 'webhook':
          return await this.sendWebhookNotification(notification, channel);
        default:
          console.error('Unknown channel type:', channel);
          return false;
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(notification: AlertNotification, channel: AlertChannel): Promise<boolean> {
    if (channel.type !== 'email') return false;

    const subject = `🔔 Alert: ${notification.alertName}`;
    const html = this.generateEmailHTML(notification);

    try {
      const resend = getResend();
      await resend.emails.send({
        from: 'alerts@wheresmymep.eu',
        to: channel.email,
        subject,
        html,
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send Slack notification
   */
  private static async sendSlackNotification(notification: AlertNotification, channel: AlertChannel): Promise<boolean> {
    if (channel.type !== 'slack') return false;

    const payload = {
      text: `🔔 Alert: ${notification.alertName}`,
      blocks: this.generateSlackBlocks(notification),
      channel: channel.channel,
    };

    try {
      const response = await fetch(channel.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      return false;
    }
  }

  /**
   * Send webhook notification
   */
  private static async sendWebhookNotification(notification: AlertNotification, channel: AlertChannel): Promise<boolean> {
    if (channel.type !== 'webhook') return false;

    try {
      const response = await fetch(channel.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...channel.headers,
        },
        body: JSON.stringify(notification),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send webhook notification:', error);
      return false;
    }
  }

  /**
   * Generate HTML email content
   */
  private static generateEmailHTML(notification: AlertNotification): string {
    const { alertName, triggerReason, data, timestamp } = notification;
    
    let mepsHTML = '';
    if (data.meps.length > 0) {
      mepsHTML = `
        <h3>MEPs Involved</h3>
        <ul>
          ${data.meps.map(mep => `
            <li>
              <strong>${mep.name}</strong> (${mep.country}${mep.party ? `, ${mep.party}` : ''})
            </li>
          `).join('')}
        </ul>
      `;
    }

    let votesHTML = '';
    if (data.votes && data.votes.length > 0) {
      votesHTML = `
        <h3>Recent Votes</h3>
        <ul>
          ${data.votes.map(vote => `
            <li>
              <strong>${vote.title}</strong><br>
              <small>${new Date(vote.date).toLocaleDateString()}</small>
              ${vote.result ? `<br><em>${vote.result}</em>` : ''}
            </li>
          `).join('')}
        </ul>
      `;
    }

    let attendanceHTML = '';
    if (data.attendance && data.attendance.length > 0) {
      attendanceHTML = `
        <h3>Attendance Changes</h3>
        <ul>
          ${data.attendance.map(att => `
            <li>
              <strong>${att.mepName}</strong><br>
              ${att.oldAttendance !== undefined ? 
                `Attendance: ${att.oldAttendance}% → ${att.newAttendance}%` : 
                `New attendance: ${att.newAttendance}%`
              }
            </li>
          `).join('')}
        </ul>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${alertName}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { background: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
            h1 { color: #2c3e50; margin: 0; }
            h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            h3 { color: #2c3e50; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px; }
            .timestamp { color: #7f8c8d; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 ${alertName}</h1>
              <p class="timestamp">${new Date(timestamp).toLocaleString()}</p>
            </div>
            
            <div class="content">
              <h2>${triggerReason}</h2>
              
              ${mepsHTML}
              ${votesHTML}
              ${attendanceHTML}
              
              <p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/alerts" style="color: #3498db;">
                  Manage your alerts →
                </a>
              </p>
            </div>
            
            <div class="footer">
              <p>This alert was sent by Where's My MEP?</p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}">Visit our website</a> |
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/alerts">Manage alerts</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate Slack blocks
   */
  private static generateSlackBlocks(notification: AlertNotification) {
    const { alertName, triggerReason, data, timestamp } = notification;
    
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🔔 ${alertName}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${triggerReason}*\n${new Date(timestamp).toLocaleString()}`,
        },
      },
    ];

    if (data.meps.length > 0) {
      const mepsText = data.meps
        .map(mep => `• *${mep.name}* (${mep.country}${mep.party ? `, ${mep.party}` : ''})`)
        .join('\n');
      
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*MEPs Involved:*\n${mepsText}`,
        },
      });
    }

    if (data.votes && data.votes.length > 0) {
      const votesText = data.votes
        .map(vote => `• *${vote.title}* (${new Date(vote.date).toLocaleDateString()})`)
        .join('\n');
      
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Recent Votes:*\n${votesText}`,
        },
      });
    }

    if (data.attendance && data.attendance.length > 0) {
      const attendanceText = data.attendance
        .map(att => `• *${att.mepName}*: ${att.oldAttendance !== undefined ? `${att.oldAttendance}% → ${att.newAttendance}%` : `${att.newAttendance}%`}`)
        .join('\n');
      
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Attendance Changes:*\n${attendanceText}`,
        },
      });
    }

    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Manage Alerts',
          },
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/alerts`,
        },
      ],
    });

    return blocks;
  }
}

