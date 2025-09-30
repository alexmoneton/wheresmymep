import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { incrementDailyCounter, incrementDailyZSet } from '@/lib/redis';

// Validation schema
const interestSchema = z.object({
  email: z.string().email('Invalid email address'),
  topic: z.string().min(1, 'Topic is required'),
  path: z.string().min(1, 'Path is required'),
});

// Initialize Resend only when needed
function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validationResult = interestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Invalid request data',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { email, topic, path } = validationResult.data;

    // Log the interest submission
    console.log('Alert interest submission:', {
      email,
      topic,
      path,
      timestamp: new Date().toISOString(),
    });

    // Increment metrics counters
    try {
      await Promise.all([
        incrementDailyCounter('alerts_created'),
        incrementDailyZSet('alerts_created')
      ]);
    } catch (metricsError) {
      console.error('Failed to increment metrics:', metricsError);
      // Don't fail the request if metrics fail
    }

    // If ALERT_FORWARD_EMAIL is configured, send an email
    if (process.env.ALERT_FORWARD_EMAIL) {
      try {
        const resend = getResend();
        
        await resend.emails.send({
          from: 'alerts@wheresmymep.eu',
          to: process.env.ALERT_FORWARD_EMAIL,
          subject: 'New Alert Interest Submission',
          html: `
            <h2>New Alert Interest Submission</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Topic:</strong> ${topic}</p>
            <p><strong>Page:</strong> ${path}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>User Agent:</strong> ${request.headers.get('user-agent') || 'Unknown'}</p>
          `,
        });
        
        console.log('Alert interest email sent to:', process.env.ALERT_FORWARD_EMAIL);
      } catch (emailError) {
        console.error('Failed to send alert interest email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error processing alert interest:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}