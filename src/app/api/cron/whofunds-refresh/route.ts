import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { WhoFundsData, ChangelogEntry, validateChangelogEntry } from '@/lib/zod/whofunds';
import { processWhoFundsChanges } from '@/lib/whofunds-notifications';

// Validate cron secret
function validateCronSecret(request: NextRequest): boolean {
  const cronSecret = request.headers.get('x-cron-secret');
  const expectedSecret = process.env.CRON_SECRET;
  
  if (!expectedSecret) {
    console.error('CRON_SECRET environment variable not set');
    return false;
  }
  
  return cronSecret === expectedSecret;
}

// Check if MEP data needs refresh (older than 30 days or declaration URL changed)
async function needsRefresh(mepId: string, currentDeclarationUrl?: string): Promise<boolean> {
  try {
    const dataPath = path.join(process.cwd(), 'public/data/whofunds', `${mepId}.json`);
    const data = JSON.parse(await fs.readFile(dataPath, 'utf-8')) as WhoFundsData;
    
    // Check if older than 30 days
    const lastUpdated = new Date(data.last_updated_utc);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (lastUpdated < thirtyDaysAgo) {
      return true;
    }
    
    // Check if declaration URL changed
    if (currentDeclarationUrl && data.sources.declaration_url !== currentDeclarationUrl) {
      return true;
    }
    
    return false;
  } catch (error) {
    // File doesn't exist or is invalid, needs refresh
    return true;
  }
}

// Append to changelog
async function appendToChangelog(entry: ChangelogEntry): Promise<void> {
  const changelogPath = path.join(process.cwd(), 'public/data/whofunds/changelog.ndjson');
  
  try {
    await fs.access(changelogPath);
  } catch {
    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(changelogPath), { recursive: true });
  }
  
  const logLine = JSON.stringify(entry) + '\n';
  await fs.appendFile(changelogPath, logLine);
}

// Simulate processing a single MEP (in production, this would call the actual ETL)
async function processMEP(mepId: string): Promise<{ success: boolean; changes?: string[]; error?: string }> {
  try {
    // In production, this would:
    // 1. Fetch the MEP profile page
    // 2. Discover declaration URL
    // 3. Parse the declaration
    // 4. Compare with existing data
    // 5. Return changes
    
    // For demo, simulate some changes
    const hasChanges = Math.random() > 0.7; // 30% chance of changes
    
    if (hasChanges) {
      const changes = [
        'Updated board membership compensation',
        'Added new consulting engagement',
        'Updated travel disclosure'
      ].slice(0, Math.floor(Math.random() * 3) + 1);
      
      return { success: true, changes };
    }
    
    return { success: true, changes: [] };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Get list of MEPs that need refresh
async function getMEPsToRefresh(): Promise<Array<{ mepId: string; reason: string }>> {
  try {
    const indexPath = path.join(process.cwd(), 'public/data/whofunds/index.json');
    const indexData = JSON.parse(await fs.readFile(indexPath, 'utf-8'));
    
    const mepsToRefresh: Array<{ mepId: string; reason: string }> = [];
    
    for (const mep of indexData.meps) {
      const needsUpdate = await needsRefresh(mep.mep_id);
      if (needsUpdate) {
        mepsToRefresh.push({
          mepId: mep.mep_id,
          reason: 'Data older than 30 days'
        });
      }
    }
    
    return mepsToRefresh;
  } catch (error) {
    console.error('Error getting MEPs to refresh:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate cron secret
    if (!validateCronSecret(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('🔄 Starting WhoFunds refresh cron job...');
    
    // Get MEPs that need refresh
    const mepsToRefresh = await getMEPsToRefresh();
    
    if (mepsToRefresh.length === 0) {
      console.log('✅ No MEPs need refresh');
      return NextResponse.json({
        success: true,
        message: 'No MEPs need refresh',
        processed: 0
      });
    }
    
    console.log(`📋 Found ${mepsToRefresh.length} MEPs to refresh`);
    
    const results = {
      processed: 0,
      updated: 0,
      errors: 0,
      changes: [] as string[]
    };
    
    // Process each MEP
    for (const { mepId, reason } of mepsToRefresh) {
      try {
        console.log(`🔍 Processing MEP ${mepId} (${reason})`);
        
        const result = await processMEP(mepId);
        results.processed++;
        
        if (result.success) {
          if (result.changes && result.changes.length > 0) {
            results.updated++;
            results.changes.push(...result.changes);
            
            // Log to changelog
            const changelogEntry: ChangelogEntry = {
              timestamp: new Date().toISOString(),
              mep_id: mepId,
              action: 'updated',
              changes: result.changes
            };
            
            await appendToChangelog(changelogEntry);
            console.log(`✅ Updated MEP ${mepId}: ${result.changes.join(', ')}`);
          } else {
            console.log(`ℹ️  No changes for MEP ${mepId}`);
          }
        } else {
          results.errors++;
          
          // Log error to changelog
          const changelogEntry: ChangelogEntry = {
            timestamp: new Date().toISOString(),
            mep_id: mepId,
            action: 'error',
            error: result.error
          };
          
          await appendToChangelog(changelogEntry);
          console.error(`❌ Error processing MEP ${mepId}: ${result.error}`);
        }
        
        // Add delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        results.errors++;
        console.error(`💥 Fatal error processing MEP ${mepId}:`, error);
        
        // Log fatal error to changelog
        const changelogEntry: ChangelogEntry = {
          timestamp: new Date().toISOString(),
          mep_id: mepId,
          action: 'error',
          error: error instanceof Error ? error.message : 'Fatal error'
        };
        
        await appendToChangelog(changelogEntry);
      }
    }
    
    // Update index timestamp
    try {
      const indexPath = path.join(process.cwd(), 'public/data/whofunds/index.json');
      const indexData = JSON.parse(await fs.readFile(indexPath, 'utf-8'));
      
      indexData.meta.last_full_refresh = new Date().toISOString();
      
      await fs.writeFile(indexPath, JSON.stringify(indexData, null, 2));
    } catch (error) {
      console.error('Error updating index:', error);
    }

    // Send notifications for changes
    if (results.changes.length > 0) {
      try {
        const changes = results.changes.map(change => ({
          mepId: 'unknown', // In production, track which MEP had changes
          mepName: 'Unknown MEP',
          changes: [change]
        }));
        
        await processWhoFundsChanges(changes);
        console.log(`📧 Sent notifications for ${changes.length} changes`);
      } catch (error) {
        console.error('Error sending notifications:', error);
      }
    }
    
    console.log('📊 Refresh completed:', results);
    
    return NextResponse.json({
      success: true,
      message: 'WhoFunds refresh completed',
      ...results
    });
    
  } catch (error) {
    console.error('💥 Fatal error in cron job:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'whofunds-refresh'
  });
}
