import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Try to read the sample data file
    const filePath = join(process.cwd(), 'public', 'data', 'ai-act', 'changes.sample.json');
    
    try {
      const fileContent = readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      // Validate the data structure
      if (data && typeof data.week === 'string' && Array.isArray(data.items)) {
        return NextResponse.json(data, {
          headers: {
            'Cache-Control': 'no-store',
          },
        });
      }
    } catch (fileError) {
      // File doesn't exist or is invalid, fall through to fallback
      console.warn('Failed to read changes.sample.json:', fileError);
    }
    
    // Fallback data with the same structure
    const fallbackData = {
      week: "fallback",
      items: [
        {
          type: "guidance",
          title: "Sample guidance document",
          date: "2025-01-15",
          topic: "sample-topic",
          link: "#"
        },
        {
          type: "note",
          title: "Sample note for testing",
          date: "2025-01-14",
          topic: "sample-topic",
          link: "#"
        }
      ]
    };
    
    return NextResponse.json(fallbackData, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
    
  } catch (error) {
    console.error('Error in /api/ai-act/changes:', error);
    
    // Return fallback data even on error to ensure page still renders
    const fallbackData = {
      week: "fallback",
      items: [
        {
          type: "guidance",
          title: "Sample guidance document",
          date: "2025-01-15",
          topic: "sample-topic",
          link: "#"
        },
        {
          type: "note",
          title: "Sample note for testing",
          date: "2025-01-14",
          topic: "sample-topic",
          link: "#"
        }
      ]
    };
    
    return NextResponse.json(fallbackData, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
}
