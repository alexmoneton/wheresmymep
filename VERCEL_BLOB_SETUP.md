# Vercel Blob Setup Guide

## Step 1: Get Your Vercel Blob Token

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `wheres-my-mep-app`

2. **Navigate to Storage**
   - Click on the "Storage" tab in your project
   - Click "Create Database" or "Create Store"
   - Select "Blob" from the options
   - Click "Continue"

3. **Create Blob Store**
   - Name it: `vote-data` (or any name you prefer)
   - Region: Choose closest to your users (e.g., `iad1` for US East)
   - Click "Create"

4. **Get the Token**
   - After creating, go to the "Settings" tab of your Blob store
   - Under "Environment Variables", you'll see:
     - `BLOB_READ_WRITE_TOKEN` - This is what we need!
   - Click "Copy" next to the token

5. **Add to Local Environment**
   ```bash
   # In your terminal:
   cd /Users/alexandre/wheres-my-mep/wheres-my-mep-app
   
   # Add to .env.local (I'll do this for you in the next step)
   echo "BLOB_READ_WRITE_TOKEN=your_token_here" >> .env.local
   ```

## Step 2: Upload Comprehensive Data

Once you have the token, run:

```bash
cd /Users/alexandre/wheres-my-mep/wheres-my-mep-app
npx tsx scripts/upload-comprehensive-votes.ts
```

This will:
- Compress the comprehensive voting data
- Upload to Vercel Blob (~39MB)
- Return a public URL for the data

## Step 3: Create API Endpoint

I'll create an API endpoint that:
- Fetches data from Vercel Blob
- Decompresses it
- Filters by date range, MEP, etc.
- Returns paginated results

## Step 4: Update Vote Explorer

Add a "Load Full History" toggle that:
- Shows last 60 days by default (current data)
- Fetches comprehensive data when enabled
- Caches results in browser

---

## Quick Start (After Getting Token)

```bash
# 1. Add token to .env.local
echo "BLOB_READ_WRITE_TOKEN=vercel_blob_..." >> .env.local

# 2. Upload data
npx tsx scripts/upload-comprehensive-votes.ts

# 3. Deploy
git add .
git commit -m "Enable comprehensive voting data via Vercel Blob"
git push
```

---

## Alternative: Manual Token Setup

If you prefer to add the token manually:

1. Open `.env.local`:
   ```bash
   nano .env.local
   ```

2. Add this line:
   ```
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX
   ```

3. Save and exit (Ctrl+X, then Y, then Enter)

---

## Troubleshooting

**Error: "BLOB_READ_WRITE_TOKEN is not set"**
- Make sure you added the token to `.env.local`
- Restart your terminal/IDE after adding

**Error: "Failed to upload"**
- Check your Vercel account has Blob storage enabled
- Verify the token is correct
- Make sure you're on a paid Vercel plan (Blob requires Pro plan)

**Blob Storage Pricing**
- Free tier: Not available
- Pro plan: $20/month + $0.15/GB storage + $0.15/GB bandwidth
- Our usage: ~39MB storage + ~1GB/month bandwidth = ~$0.30/month

---

## Need Help?

If you run into issues:
1. Check Vercel dashboard for Blob store status
2. Verify token in `.env.local`
3. Run with verbose logging: `DEBUG=* npx tsx scripts/upload-comprehensive-votes.ts`

