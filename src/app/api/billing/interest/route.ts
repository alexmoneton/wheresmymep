import { NextRequest, NextResponse } from 'next/server'
import { incrementDailyCounter, incrementDailyZSet } from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, reason, path } = body
    
    if (!email || !reason) {
      return NextResponse.json(
        { error: 'Email and reason are required' },
        { status: 400 }
      )
    }
    
    // Log to server console
    console.log('Billing interest captured:', {
      email,
      reason,
      path: path || 'unknown',
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })

    // Increment metrics counters
    try {
      await Promise.all([
        incrementDailyCounter('billing_interest'),
        incrementDailyZSet('billing_interest')
      ]);
    } catch (metricsError) {
      console.error('Failed to increment metrics:', metricsError);
      // Don't fail the request if metrics fail
    }
    
    // Send email if ALERT_FORWARD_EMAIL is set
    if (process.env.ALERT_FORWARD_EMAIL) {
      try {
        // Simple email sending (you can replace with your preferred email service)
        const emailContent = `
New billing interest captured:

Email: ${email}
Reason: ${reason}
Path: ${path || 'unknown'}
Timestamp: ${new Date().toISOString()}
User Agent: ${request.headers.get('user-agent')}
IP: ${request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')}
        `.trim()
        
        // For now, just log the email content
        // In production, you'd send this via SendGrid, Resend, etc.
        console.log('Email to send:', {
          to: process.env.ALERT_FORWARD_EMAIL,
          subject: 'New Billing Interest - Where\'s My MEP',
          content: emailContent
        })
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Don't fail the request if email fails
      }
    }
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error processing billing interest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
