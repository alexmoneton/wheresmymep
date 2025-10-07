import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');

    let signupIds: string[] = [];

    if (country) {
      // Get signups for specific country
      signupIds = await redis.lrange(`signups_by_country:${country}`, 0, -1);
    } else {
      // Get all signups
      signupIds = await redis.lrange('notification_signups', 0, -1);
    }

    // Fetch the actual signup data
    const signups = await Promise.all(
      signupIds.map(async (id) => {
        const data = await redis.get(id);
        return data;
      })
    );

    // Filter out null values and sort by date
    const validSignups = signups
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.signupDate).getTime() - new Date(a.signupDate).getTime());

    return NextResponse.json({
      signups: validSignups,
      count: validSignups.length,
      countries: [...new Set(validSignups.map((s: any) => s.country))].sort()
    });

  } catch (error) {
    console.error('Error retrieving signups:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve signups' },
      { status: 500 }
    );
  }
}
