# Comprehensive Vote Data Solution

## Problem
- Full HowTheyVote.eu dataset: 2,424 votes, 1.7M individual records
- JSON file size: 736MB (uncompressed) or 79MB (60 days)
- GitHub limit: 100MB per file
- Browser loading: Too large to load all at once

## Recommended Solution: Hybrid Approach

### Phase 1: Immediate (Use Current Data)
✅ **DEPLOYED**: 1,170 votes from May-October 2024 (157 days)
- File size: ~13MB (manageable)
- Covers most of current term
- Already working in production

### Phase 2: API-Based Comprehensive Data (Recommended)

#### Option A: Vercel Blob Storage + Edge Functions
**Best for: Quick implementation, serverless**

1. **Store compressed data in Vercel Blob**
   - Upload `notable-votes.json.gz` (19MB compressed)
   - Store full HowTheyVote dataset
   - Update weekly via GitHub Actions

2. **Create Edge API endpoint**
   ```typescript
   // /api/votes/comprehensive
   - Fetch from Vercel Blob
   - Decompress on-the-fly
   - Filter by date range, MEP, etc.
   - Return paginated results
   ```

3. **Update Vote Explorer**
   - Keep current data for fast initial load
   - Add "Load More History" button
   - Fetch older votes on demand

**Pros:**
- No database needed
- Serverless (scales automatically)
- Simple to implement
- Low cost (Vercel Blob: $0.15/GB/month)

**Cons:**
- Still need to decompress data
- Limited query flexibility

#### Option B: Supabase PostgreSQL Database
**Best for: Complex queries, long-term solution**

1. **Set up Supabase project** (free tier: 500MB)
   - Create tables: `votes`, `member_votes`, `members`
   - Import HowTheyVote data
   - Create indexes for fast queries

2. **Create API routes**
   ```typescript
   // /api/votes/search
   - Query Supabase directly
   - Server-side filtering
   - Pagination
   - Full-text search
   ```

3. **Scheduled updates**
   - GitHub Action runs weekly
   - Downloads latest HowTheyVote data
   - Updates Supabase

**Pros:**
- Proper database queries
- Fast filtering and search
- Scalable
- Can add more features (analytics, etc.)

**Cons:**
- More complex setup
- Need to manage database
- Migration required

#### Option C: Split Files by Month
**Best for: Simple, no backend changes**

1. **Split data into monthly files**
   - `votes-2024-07.json` (July 2024)
   - `votes-2024-08.json` (August 2024)
   - etc.

2. **Load on demand**
   - Show last 2 months by default
   - "Load more" button fetches older months

**Pros:**
- Simple implementation
- No database needed
- Works with current architecture

**Cons:**
- Still large files per month (~40MB each)
- Manual file management
- Less flexible queries

## Recommendation: Option A (Vercel Blob + Edge Functions)

**Why:**
- Quick to implement (1-2 hours)
- Serverless (no infrastructure to manage)
- Cost-effective
- Scales automatically
- Can migrate to database later if needed

## Implementation Plan

### Step 1: Set up Vercel Blob
```bash
npm install @vercel/blob
```

### Step 2: Upload compressed data
```typescript
// scripts/upload-comprehensive-data.ts
import { put } from '@vercel/blob';

const blob = await put('votes/comprehensive.json.gz', file, {
  access: 'public',
  addRandomSuffix: false,
});
```

### Step 3: Create API endpoint
```typescript
// app/api/votes/comprehensive/route.ts
import { get } from '@vercel/blob';
import { gunzip } from 'zlib';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mep_id = searchParams.get('mep_id');
  const date_from = searchParams.get('date_from');
  
  // Fetch compressed data
  const blob = await get('votes/comprehensive.json.gz');
  const compressed = await blob.arrayBuffer();
  
  // Decompress
  const data = JSON.parse(gunzip(compressed).toString());
  
  // Filter and return
  // ... filtering logic ...
  
  return Response.json(filtered);
}
```

### Step 4: Update Vote Explorer
- Add "Show full history" toggle
- Fetch from `/api/votes/comprehensive` when enabled
- Cache results in browser

## Next Steps

1. ✅ Deploy current data (1,170 votes) - DONE
2. Set up Vercel Blob storage
3. Upload compressed comprehensive dataset
4. Create API endpoint
5. Update Vote Explorer UI
6. Test and deploy

## Cost Estimate

**Vercel Blob:**
- Storage: 19MB × $0.15/GB = ~$0.003/month
- Bandwidth: ~1GB/month × $0.15/GB = ~$0.15/month
- **Total: ~$0.15/month**

**Alternative (Supabase):**
- Free tier: 500MB database, 2GB bandwidth
- Paid: $25/month for more resources

