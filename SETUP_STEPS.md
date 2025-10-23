# Database Setup Steps

Follow these steps to complete the database setup:

## Step 1: Pull Environment Variables

Open your terminal and run:

```bash
cd /Users/alexandre/wheres-my-mep/wheres-my-mep-app
vercel env pull .env.local
```

This will download the `POSTGRES_URL` from Vercel to your local `.env.local` file.

## Step 2: Push Database Schema

Run Prisma to create all the tables in your new database:

```bash
npx prisma db push
```

This will create all the tables (Vote, MEPVote, MEP, Country, Party, etc.) in your Postgres database.

## Step 3: Import Comprehensive Voting Data

Run the import script to load all 2,424 votes:

```bash
npx tsx scripts/import-comprehensive-votes.ts
```

This will take 10-30 minutes and will:
- Import 2,424 unique votes
- Import 1.7M+ individual MEP votes
- Map all MEPs correctly

**Expected output:**
```
🚀 Starting comprehensive vote data import...
📂 Loading comprehensive data files...
📦 Decompressing notable votes...
✅ Loaded data for 732 MEPs
✅ Loaded 2424 votes in catalog
🔍 Building MEP ID mapping...
✅ Mapped XXX MEPs
📥 Importing votes into database...
  ✓ Imported 100 votes...
  ✓ Imported 200 votes...
  ...
✅ Votes imported: 2424, skipped: 0
📥 Importing individual MEP votes...
  ✓ Imported 1000 MEP votes...
  ✓ Imported 2000 MEP votes...
  ...
✅ MEP votes imported: 1,700,000+
🎉 Import complete!
```

## Step 4: Update Vote Explorer

The Vote Explorer needs to use the new database endpoint. This change is already committed to git.

## Step 5: Test Locally

Start your dev server:

```bash
npm run dev
```

Visit http://localhost:3000/vote-explorer and test:
- Search for a specific MEP
- Try date range filters
- Check that you see votes going back to July 2024

## Step 6: Deploy to Production

Once everything works locally:

```bash
git push
```

Vercel will automatically deploy with the database connection.

## Troubleshooting

### "POSTGRES_URL is not defined"
- Make sure you ran `vercel env pull .env.local`
- Check that `.env.local` exists and contains `POSTGRES_URL`

### "Table does not exist"
- Run `npx prisma db push` to create tables

### Import script can't find files
- Make sure you're in the `wheres-my-mep-app` directory
- Check that `../comprehensive_notable_votes.json.gz` exists
- Check that `../comprehensive_votes.json` exists

### No MEPs found in database
You need to import MEPs first! The import script expects MEPs to already be in the database.

**Quick fix:** Let me know and I'll create a script to import MEPs first.

