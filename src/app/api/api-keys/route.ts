import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { APIKeyManager } from '@/lib/api-keys';

// GET /api/api-keys - Get user's API key
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeyData = await APIKeyManager.getUserAPIKey(session.user.id);
    
    if (!apiKeyData) {
      return NextResponse.json({ error: 'No API key found' }, { status: 404 });
    }

    // Don't return the full key for security - just show first and last few characters
    const maskedKey = `${apiKeyData.key.substring(0, 8)}...${apiKeyData.key.substring(apiKeyData.key.length - 4)}`;
    
    return NextResponse.json({
      ...apiKeyData,
      key: maskedKey,
      fullKey: apiKeyData.key, // Only return full key on creation
    });
  } catch (error) {
    console.error('Error fetching API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/api-keys - Create new API key
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, permissions = ['read'], rateLimit = 1000, expiresAt } = body;

    // Check if user already has an API key
    const existingKey = await APIKeyManager.getUserAPIKey(session.user.id);
    if (existingKey) {
      return NextResponse.json({ 
        error: 'User already has an API key. Use PUT to regenerate.' 
      }, { status: 400 });
    }

    const apiKeyData = await APIKeyManager.createAPIKey(
      session.user.id,
      name || 'Default API Key',
      permissions,
      rateLimit,
      expiresAt ? new Date(expiresAt) : undefined
    );

    return NextResponse.json({
      ...apiKeyData,
      message: 'API key created successfully. Store it securely - it will not be shown again.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/api-keys - Regenerate API key
export async function PUT() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeyData = await APIKeyManager.regenerateAPIKey(session.user.id);

    return NextResponse.json({
      ...apiKeyData,
      message: 'API key regenerated successfully. Store it securely - it will not be shown again.',
    });
  } catch (error) {
    console.error('Error regenerating API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/api-keys - Delete API key
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await APIKeyManager.deleteAPIKey(session.user.id);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
    }

    return NextResponse.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

