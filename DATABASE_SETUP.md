# Database Setup Guide

## Option 1: Neon (Recommended - Free Tier)

1. **Go to**: https://neon.tech
2. **Sign up** with GitHub/Google
3. **Create new project**:
   - Name: `wheresmymep`
   - Region: Choose closest to your users
   - Database: PostgreSQL
4. **Get connection string**:
   - Go to Dashboard → Connection Details
   - Copy the connection string (looks like: `postgresql://username:password@host:5432/database`)
5. **Add to Vercel**:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add: `DATABASE_URL` = your connection string

## Option 2: Supabase (Alternative)

1. **Go to**: https://supabase.com
2. **Create new project**
3. **Get connection string** from Settings → Database
4. **Add to Vercel** environment variables

## Option 3: Railway/Render (Other options)

Similar process - get PostgreSQL connection string and add to Vercel.

## After Database Setup

Once you have the database URL in Vercel:

1. **Redeploy** the project (or push a new commit)
2. **Run migrations** (we'll do this via Vercel CLI or API)
3. **Test the endpoints**

## Required Environment Variables

```
DATABASE_URL=postgresql://username:password@host:5432/database
DATABASE_PROVIDER=postgresql
NEXT_PUBLIC_SITE_URL=https://wheresmymep.vercel.app
INGESTION_TOKEN=your-secure-random-token
NEXTAUTH_SECRET=your-secure-random-secret
NEXTAUTH_URL=https://wheresmymep.vercel.app
```

## Optional (for full functionality)

```
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=your-resend-key
EMAIL_FROM=noreply@wheresmymep.eu
STRIPE_PUBLIC_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
RESEND_API_KEY=re_...
```

## Next Steps

1. Wait for current build to complete
2. Set up database (Neon recommended)
3. Add environment variables to Vercel
4. Redeploy
5. Run database migrations
6. Test all endpoints
