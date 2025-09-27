# Deployment Guide - Where's My MEP?

## Step 1: Complete Vercel Authentication
1. Open browser to: https://vercel.com/oauth/device?user_code=MFBT-RNVP
2. Sign in to Vercel account
3. Authorize CLI access
4. Return to terminal and press ENTER

## Step 2: Set Up Database
We need to set up a PostgreSQL database. Options:

### Option A: Neon (Recommended - Free tier available)
1. Go to https://neon.tech
2. Create account and new project
3. Copy the connection string
4. We'll add it to Vercel environment variables

### Option B: Supabase (Alternative)
1. Go to https://supabase.com
2. Create new project
3. Get connection string from Settings > Database

### Option C: Railway/Render (Other options)
- Similar process, get PostgreSQL connection string

## Step 3: Deploy to Vercel
Once authenticated, we'll run:
```bash
npx vercel --prod
```

## Step 4: Configure Environment Variables
In Vercel dashboard, add these environment variables:

### Required Variables:
```
DATABASE_URL=postgresql://...
DATABASE_PROVIDER=postgresql
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
INGESTION_TOKEN=your-secure-random-token
NEXTAUTH_SECRET=your-secure-random-secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

### Alert System Variables:
```
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=your-resend-key
EMAIL_FROM=alerts@wheresmymep.eu
RESEND_API_KEY=your-resend-api-key
CRON_SECRET=your-secure-cron-secret
```

### API System Variables:
```
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### Stripe Integration Variables:
```
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Step 5: Run Database Migrations
After deployment, we'll run:
```bash
npx vercel env pull .env.local
npm run db:push
```

## Step 6: Verify Deployment
Check these endpoints:
- `/` - Homepage
- `/meps` - MEP listing
- `/committees` - Committees
- `/api/v1/meps` - API endpoint
- `/sitemap.xml` - Sitemap
- `/robots.txt` - Robots file

## Step 7: Set Up Alert Cron Job
To enable real-time alert processing, set up a Vercel Cron job:

1. In Vercel dashboard, go to Functions tab
2. Add a new Cron Job with:
   - **Path**: `/api/cron/process-alerts`
   - **Schedule**: `*/15 * * * *` (every 15 minutes)
   - **Headers**: `Authorization: Bearer YOUR_CRON_SECRET`

## Step 8: Set Up Custom Domain (Optional)
1. In Vercel dashboard, go to Domains
2. Add your custom domain
3. Update DNS records as instructed

## Current Status:
✅ Prisma schema fixed and client generated
✅ Vercel configuration created
✅ Alert system implemented
✅ API system implemented
✅ Stripe integration implemented
⏳ Waiting for Vercel authentication
⏳ Need to set up database
⏳ Ready to deploy

Let me know when you've completed the Vercel authentication!
