# Database Setup for Comprehensive Voting Data

This guide will help you set up Vercel Postgres to store all 2,424 votes and 1.7M individual vote records.

## Step 1: Create Vercel Postgres Database

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (`wheres-my-mep-app`)
3. Go to the **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a name (e.g., `wheresmymep-db`)
7. Select a region (choose one close to your users)
8. Click **Create**

## Step 2: Get Database Connection String

After creating the database:

1. Vercel will automatically add environment variables to your project
2. The main one you need is `DATABASE_URL`
3. Go to **Settings** → **Environment Variables** to verify it's there

## Step 3: Set Up Local Environment

1. Pull the environment variables to your local machine:
   ```bash
   cd /Users/alexandre/wheres-my-mep/wheres-my-mep-app
   vercel env pull .env.local
   ```

2. This will create/update `.env.local` with your `DATABASE_URL`

## Step 4: Run Database Migrations

Apply the Prisma schema to your database:

```bash
cd /Users/alexandre/wheres-my-mep/wheres-my-mep-app
npx prisma migrate dev --name init_votes
```

Or if you just want to push the schema without creating a migration:

```bash
npx prisma db push
```

## Step 5: Import Comprehensive Voting Data

Run the import script to load all 2,424 votes:

```bash
npx tsx scripts/import-comprehensive-votes.ts
```

This will:
- Load the comprehensive data from `comprehensive_notable_votes.json.gz`
- Import all unique votes into the `Vote` table
- Import all individual MEP votes into the `MEPVote` table
- Take approximately 10-30 minutes depending on your connection

**Expected output:**
```
🚀 Starting comprehensive vote data import...
📂 Loading comprehensive data files...
📦 Decompressing notable votes...
✅ Loaded data for 732 MEPs
✅ Loaded 2424 votes in catalog
📥 Importing votes into database...
✅ Votes imported: 2424, skipped: 0
📥 Importing individual MEP votes...
✅ MEP votes imported: 1,700,000+
🎉 Import complete!
```

## Step 6: Update Vote Explorer to Use Database

Once the import is complete, update the Vote Explorer to use the database endpoint:

```bash
# In src/app/vote-explorer/page.tsx, change the API endpoint from:
/api/votes/search
# to:
/api/votes/search-db
```

## Step 7: Test Locally

```bash
npm run dev
```

Visit http://localhost:3000/vote-explorer and test:
- Search should be fast (database indexed queries)
- All 2,424 votes should be available
- Date range filters should work
- MEP-specific searches should show full history

## Step 8: Deploy to Production

```bash
git add .
git commit -m "Add database support for comprehensive voting data"
git push
```

Vercel will automatically deploy with the database connection.

## Troubleshooting

### "DATABASE_URL is not defined"
- Make sure you ran `vercel env pull .env.local`
- Check that `.env.local` exists and contains `DATABASE_URL`

### "Table does not exist"
- Run `npx prisma db push` to create tables
- Or run `npx prisma migrate dev` to create a migration

### Import script fails
- Check that `comprehensive_notable_votes.json.gz` exists in parent directory
- Check that `comprehensive_votes.json` exists in parent directory
- Verify database connection with `npx prisma studio`

### Slow queries
- Make sure indexes are created (they should be from schema)
- Check query performance with `EXPLAIN ANALYZE` in Postgres
- Consider adding more indexes if needed

## Database Schema

The relevant tables for voting data:

- **Vote**: Stores each unique vote (2,424 records)
  - `epVoteId`: European Parliament vote ID
  - `date`: When the vote took place
  - `title`: Vote title/description
  
- **MEPVote**: Stores individual MEP votes (1.7M+ records)
  - `mepId`: Reference to MEP
  - `voteId`: Reference to Vote
  - `choice`: for/against/abstain/absent

- **MEP**: Stores MEP information
  - `epId`: European Parliament MEP ID
  - `firstName`, `lastName`: MEP name
  - Links to Country and Party

## Benefits of Database Approach

✅ **Fast queries**: Indexed database queries are much faster than parsing JSON
✅ **Scalable**: Can handle millions of records
✅ **Flexible**: Easy to add new filters and sorting
✅ **Real-time**: Can update data without redeploying
✅ **Reliable**: No memory limits like Edge Functions

