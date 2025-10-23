# How to Get Your BLOB_READ_WRITE_TOKEN

## Method 1: From Vercel Dashboard (Easiest)

1. **You're already on the Storage page** ✅
2. Look for one of these sections on the same page:
   - **"Environment Variables"** section (scroll down)
   - **"Quickstart"** or **"Getting Started"** section
   - **"Connect to your Project"** section

3. You should see code snippets with the token, like:
   ```
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_XXXXXXXXXX"
   ```

4. **Copy the entire token** (starts with `vercel_blob_rw_`)

## Method 2: From Project Settings

1. Go to your project: https://vercel.com/alexs-projects-aee7358e/wheres-my-mep-app
2. Click **"Settings"** tab (top navigation)
3. Click **"Environment Variables"** in the left sidebar
4. Look for `BLOB_READ_WRITE_TOKEN`
5. Click "Show" or "Reveal" to see the token
6. Copy it

## Method 3: From Vercel CLI (Alternative)

```bash
cd /Users/alexandre/wheres-my-mep/wheres-my-mep-app
npx vercel env pull .env.local
```

This will automatically download all environment variables including the blob token.

---

## Once You Have the Token:

### Option A: Use the Interactive Script
```bash
cd /Users/alexandre/wheres-my-mep/wheres-my-mep-app
./setup-blob.sh
```

### Option B: Add Manually
```bash
cd /Users/alexandre/wheres-my-mep/wheres-my-mep-app
echo "BLOB_READ_WRITE_TOKEN=vercel_blob_rw_YOUR_TOKEN_HERE" >> .env.local
```

### Then Upload the Data:
```bash
npx tsx scripts/upload-comprehensive-votes.ts
```

---

## 🔍 Where to Look on Your Current Page

On the Storage page you're viewing, scroll down and look for:
- **"Environment Variables"** heading
- **"Integration"** section
- **"Connect"** or **"Quickstart"** section

The token should be displayed there with a copy button!

