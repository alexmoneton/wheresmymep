import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { AlertSchema } from '@/lib/alert-types';

const prisma = new PrismaClient();

// GET /api/alerts - Get user's alerts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alerts = await prisma.alert.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/alerts - Create new alert
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const alertData = {
      ...body,
      userId: session.user.id,
    };

    // Validate the alert data
    const validatedAlert = AlertSchema.parse(alertData);

    // Check user's subscription limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscriptions: { where: { status: 'active' } } },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check alert limits based on subscription
    const currentAlertCount = await prisma.alert.count({
      where: { userId: session.user.id, active: true },
    });

    const maxAlerts = user.subscriptions.length > 0 ? 
      (user.subscriptions[0].plan === 'individual' ? 3 : 
       user.subscriptions[0].plan === 'team' ? 10 : 50) : 1;

    if (currentAlertCount >= maxAlerts) {
      return NextResponse.json({ 
        error: `You have reached the maximum number of alerts (${maxAlerts}). Upgrade your plan to create more alerts.` 
      }, { status: 403 });
    }

    const alert = await prisma.alert.create({
      data: validatedAlert,
    });

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid alert data', details: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

