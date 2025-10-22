import fs from 'fs/promises';
import path from 'path';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface WatchEntry {
  userId: string;
  mepId: string;
  createdAt: string;
  email: string;
}

interface WhoFundsChange {
  mepId: string;
  mepName: string;
  changes: string[];
  oldData?: any;
  newData?: any;
}

// Load watched MEPs
async function loadWatches(): Promise<WatchEntry[]> {
  try {
    const watchFile = path.join(process.cwd(), 'data/whofunds-watches.json');
    const content = await fs.readFile(watchFile, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

// Get watchers for a specific MEP
export async function getWatchersForMEP(mepId: string): Promise<WatchEntry[]> {
  const watches = await loadWatches();
  return watches.filter(watch => watch.mepId === mepId);
}

// Send notification email for WhoFunds changes
export async function sendWhoFundsChangeNotification(
  change: WhoFundsChange,
  watchers: WatchEntry[]
): Promise<void> {
  if (watchers.length === 0) return;

  const subject = `WhoFunds Alert: Changes detected for ${change.mepName}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f2937;">WhoFunds Alert</h2>
      
      <p>We detected changes in the financial interests declaration for <strong>${change.mepName}</strong> (MEP ID: ${change.mepId}).</p>
      
      <h3 style="color: #374151; margin-top: 24px;">Changes detected:</h3>
      <ul style="color: #4b5563;">
        ${change.changes.map(changeItem => `<li>${changeItem}</li>`).join('')}
      </ul>
      
      <div style="margin-top: 24px; padding: 16px; background-color: #f3f4f6; border-radius: 8px;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          <strong>Note:</strong> This is an automated alert based on changes to official declarations. 
          Always refer to the official source for authoritative information.
        </p>
      </div>
      
      <div style="margin-top: 24px; text-align: center;">
        <a href="https://wheresmymep.eu/mep/${change.mepId}" 
           style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
          View MEP Profile
        </a>
      </div>
      
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
        <p>You're receiving this because you're watching this MEP for funding changes.</p>
        <p>To stop watching, visit the MEP's profile page and click "Stop watching".</p>
      </div>
    </div>
  `;

  const textContent = `
WhoFunds Alert: Changes detected for ${change.mepName}

We detected changes in the financial interests declaration for ${change.mepName} (MEP ID: ${change.mepId}).

Changes detected:
${change.changes.map(changeItem => `- ${changeItem}`).join('\n')}

Note: This is an automated alert based on changes to official declarations. Always refer to the official source for authoritative information.

View MEP Profile: https://wheresmymep.eu/mep/${change.mepId}

You're receiving this because you're watching this MEP for funding changes.
To stop watching, visit the MEP's profile page and click "Stop watching".
  `;

  // Send emails to all watchers
  const emailPromises = watchers.map(async (watcher) => {
    try {
      await resend.emails.send({
        from: process.env.ALERT_FROM || 'alerts@wheresmymep.eu',
        to: watcher.email,
        subject,
        html: htmlContent,
        text: textContent,
      });
      console.log(`✅ Sent WhoFunds alert to ${watcher.email} for MEP ${change.mepId}`);
    } catch (error) {
      console.error(`❌ Failed to send WhoFunds alert to ${watcher.email}:`, error);
    }
  });

  await Promise.all(emailPromises);
}

// Process WhoFunds changes and send notifications
export async function processWhoFundsChanges(changes: WhoFundsChange[]): Promise<void> {
  for (const change of changes) {
    const watchers = await getWatchersForMEP(change.mepId);
    if (watchers.length > 0) {
      await sendWhoFundsChangeNotification(change, watchers);
    }
  }
}

