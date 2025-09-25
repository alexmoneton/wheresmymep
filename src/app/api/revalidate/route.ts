import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    const token = process.env.REVALIDATION_TOKEN;
    
    if (!token) {
      return NextResponse.json({ error: 'Revalidation token not configured' }, { status: 500 });
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }
    
    const providedToken = authHeader.substring(7);
    if (providedToken !== token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const body = await request.json();
    const { paths, tags } = body;
    
    if (!paths && !tags) {
      return NextResponse.json({ error: 'No paths or tags provided' }, { status: 400 });
    }
    
    const revalidatedPaths: string[] = [];
    const revalidatedTags: string[] = [];
    
    // Revalidate specific paths
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        try {
          revalidatePath(path);
          revalidatedPaths.push(path);
        } catch (error) {
          console.error(`Failed to revalidate path ${path}:`, error);
        }
      }
    }
    
    // Revalidate specific tags
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        try {
          revalidateTag(tag);
          revalidatedTags.push(tag);
        } catch (error) {
          console.error(`Failed to revalidate tag ${tag}:`, error);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      revalidatedPaths,
      revalidatedTags,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error during revalidation:', error);
    return NextResponse.json(
      { error: 'Revalidation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
