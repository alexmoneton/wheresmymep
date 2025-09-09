import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request: NextRequest) {
  try {
    const { email, country } = await request.json();

    // Validate input
    if (!email || !country) {
      return NextResponse.json(
        { error: 'Email and country are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create a unique key for this signup
    const signupId = `${email}-${country}-${Date.now()}`;
    
    // Store the signup data
    const signupData = {
      email,
      country,
      signupDate: new Date().toISOString(),
      id: signupId
    };

    // Store in KV with the signup ID as key
    await kv.set(signupId, signupData);
    
    // Also add to a list for easy retrieval
    await kv.lpush('notification_signups', signupId);

    // Store by country for easy filtering
    await kv.lpush(`signups_by_country:${country}`, signupId);

    return NextResponse.json({
      success: true,
      message: `You'll be notified when MEPs from ${country} have low attendance!`,
      signupId
    });

  } catch (error) {
    console.error('Error storing notification signup:', error);
    return NextResponse.json(
      { error: 'Failed to store signup. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve signups (for admin purposes)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');

    let signupIds: string[] = [];

    if (country) {
      // Get signups for specific country
      signupIds = await kv.lrange(`signups_by_country:${country}`, 0, -1);
    } else {
      // Get all signups
      signupIds = await kv.lrange('notification_signups', 0, -1);
    }

    // Fetch the actual signup data
    const signups = await Promise.all(
      signupIds.map(async (id) => {
        const data = await kv.get(id);
        return data;
      })
    );

    return NextResponse.json({
      signups: signups.filter(Boolean),
      count: signups.length
    });

  } catch (error) {
    console.error('Error retrieving signups:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve signups' },
      { status: 500 }
    );
  }
}
