import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ENV_DEFAULTS } from '@/lib/flags';

interface WatchRequest {
  mepId: string;
  action: 'watch' | 'unwatch';
}

interface WatchEntry {
  userId: string;
  mepId: string;
  createdAt: string;
  email: string;
}

// Simple file-based storage for MVP (in production, use database)
const WATCH_FILE = path.join(process.cwd(), 'data/whofunds-watches.json');

async function loadWatches(): Promise<WatchEntry[]> {
  try {
    await fs.mkdir(path.dirname(WATCH_FILE), { recursive: true });
    const content = await fs.readFile(WATCH_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function saveWatches(watches: WatchEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(WATCH_FILE), { recursive: true });
  await fs.writeFile(WATCH_FILE, JSON.stringify(watches, null, 2));
}

export async function POST(request: NextRequest) {
  // Feature flag guard
  if (!ENV_DEFAULTS.whofunds) {
    return NextResponse.json(
      { error: 'Feature not available' },
      { status: 404 }
    );
  }

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: WatchRequest = await request.json();
    const { mepId, action } = body;

    if (!mepId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate MEP ID format
    if (!/^\d+$/.test(mepId)) {
      return NextResponse.json(
        { error: 'Invalid MEP ID format' },
        { status: 400 }
      );
    }

    // Load existing watches
    const watches = await loadWatches();
    const userId = session.user.email;

    if (action === 'watch') {
      // Check if already watching
      const existingWatch = watches.find(w => w.userId === userId && w.mepId === mepId);
      if (existingWatch) {
        return NextResponse.json({
          success: true,
          message: 'Already watching this MEP',
          watching: true
        });
      }

      // Add new watch
      const newWatch: WatchEntry = {
        userId,
        mepId,
        createdAt: new Date().toISOString(),
        email: session.user.email
      };

      watches.push(newWatch);
      await saveWatches(watches);

      return NextResponse.json({
        success: true,
        message: 'Now watching this MEP',
        watching: true
      });

    } else if (action === 'unwatch') {
      // Remove watch
      const filteredWatches = watches.filter(w => !(w.userId === userId && w.mepId === mepId));
      await saveWatches(filteredWatches);

      return NextResponse.json({
        success: true,
        message: 'Stopped watching this MEP',
        watching: false
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error managing watch:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Feature flag guard
  if (!ENV_DEFAULTS.whofunds) {
    return NextResponse.json(
      { error: 'Feature not available' },
      { status: 404 }
    );
  }

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.email;
    const watches = await loadWatches();
    const userWatches = watches.filter(w => w.userId === userId);

    return NextResponse.json({
      watches: userWatches.map(w => ({
        mepId: w.mepId,
        createdAt: w.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching watches:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
