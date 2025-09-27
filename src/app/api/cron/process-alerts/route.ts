import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AlertEngine } from '@/lib/alert-engine';
import { NotificationService } from '@/lib/notifications';

const prisma = new PrismaClient();

// This endpoint processes pending alerts
// It should be called by a cron job or triggered by vote/attendance updates
export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if required environment variables are present
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping alert processing');
      return NextResponse.json({ message: 'Alert processing skipped - email not configured' });
    }

    console.log('🔄 Processing alerts...');

    // Get all active alerts that need processing
    const alerts = await prisma.alert.findMany({
      where: { active: true },
      include: { user: true },
    });

    let processedCount = 0;
    let notificationCount = 0;

    for (const alert of alerts) {
      try {
        // Check if alert should be triggered based on recent activity
        const shouldTrigger = await checkAlertTrigger(alert);
        
        if (shouldTrigger) {
          // Create notification
          const notification = await createAlertNotification(alert);
          
          // Send notification
          const success = await NotificationService.sendNotification(
            notification,
            alert.channel as any
          );

          if (success) {
            // Update last triggered time
            await prisma.alert.update({
              where: { id: alert.id },
              data: { lastTriggered: new Date() },
            });
            
            notificationCount++;
          }
        }
        
        processedCount++;
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error);
      }
    }

    console.log(`✅ Processed ${processedCount} alerts, sent ${notificationCount} notifications`);

    return NextResponse.json({
      success: true,
      processed: processedCount,
      notifications: notificationCount,
    });
  } catch (error) {
    console.error('Error processing alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Check if an alert should be triggered based on recent activity
 */
async function checkAlertTrigger(alert: any): Promise<boolean> {
  const criteria = alert.criteria;
  const lastTriggered = alert.lastTriggered;
  
  // If frequency is not immediate, check if enough time has passed
  if (alert.frequency !== 'immediate') {
    const now = new Date();
    const lastTrigger = lastTriggered ? new Date(lastTriggered) : new Date(0);
    
    if (alert.frequency === 'daily') {
      const hoursSinceLastTrigger = (now.getTime() - lastTrigger.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastTrigger < 24) {
        return false;
      }
    } else if (alert.frequency === 'weekly') {
      const daysSinceLastTrigger = (now.getTime() - lastTrigger.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastTrigger < 7) {
        return false;
      }
    }
  }

  // Check for recent votes that match criteria
  const recentVotes = await prisma.vote.findMany({
    where: {
      date: {
        gte: lastTriggered || new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours or since last trigger
      },
    },
    include: {
      mepVotes: {
        include: {
          mep: {
            include: {
              country: true,
              party: true,
            },
          },
        },
      },
      dossier: {
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      },
    },
    take: 10, // Limit to recent votes
  });

  // Check if any recent votes match the alert criteria
  for (const vote of recentVotes) {
    if (await AlertEngine['matchesVoteCriteria'](vote, criteria)) {
      return true;
    }
  }

  // Check for attendance changes that match criteria
  const recentMEPs = await prisma.mEP.findMany({
    where: {
      updatedAt: {
        gte: lastTriggered || new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      attendancePct: { not: null },
    },
    include: {
      country: true,
      party: true,
    },
    take: 20, // Limit to recently updated MEPs
  });

  // Check if any attendance changes match the alert criteria
  for (const mep of recentMEPs) {
    if (await AlertEngine['matchesAttendanceCriteria'](mep, 0, mep.attendancePct || 0, criteria)) {
      return true;
    }
  }

  return false;
}

/**
 * Create a notification for an alert
 */
async function createAlertNotification(alert: any) {
  // This is a simplified version - in a real implementation,
  // you'd gather the specific data that triggered the alert
  
  return {
    alertId: alert.id,
    alertName: alert.name,
    triggerReason: 'Recent activity detected',
    data: {
      meps: [],
      votes: [],
      attendance: [],
    },
    timestamp: new Date().toISOString(),
  };
}

