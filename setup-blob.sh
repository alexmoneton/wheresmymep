#!/bin/bash

# Interactive setup script for Vercel Blob

echo "🚀 Vercel Blob Setup for Comprehensive Voting Data"
echo "=================================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    touch .env.local
fi

# Check if token is already set
if grep -q "BLOB_READ_WRITE_TOKEN" .env.local; then
    echo "✅ BLOB_READ_WRITE_TOKEN already exists in .env.local"
    echo ""
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing token."
    else
        # Remove old token
        sed -i '' '/BLOB_READ_WRITE_TOKEN/d' .env.local
        echo "Old token removed."
    fi
fi

# If no token or updating
if ! grep -q "BLOB_READ_WRITE_TOKEN" .env.local; then
    echo ""
    echo "📝 To get your Vercel Blob token:"
    echo "   1. Go to: https://vercel.com/dashboard"
    echo "   2. Select your project: wheres-my-mep-app"
    echo "   3. Click 'Storage' tab"
    echo "   4. Create a Blob store (if you haven't already)"
    echo "   5. Copy the BLOB_READ_WRITE_TOKEN"
    echo ""
    read -p "Paste your BLOB_READ_WRITE_TOKEN here: " token
    
    if [ -z "$token" ]; then
        echo "❌ No token provided. Exiting."
        exit 1
    fi
    
    echo "BLOB_READ_WRITE_TOKEN=$token" >> .env.local
    echo "✅ Token added to .env.local"
fi

echo ""
echo "=================================================="
echo "✅ Setup complete!"
echo ""
echo "📤 Next step: Upload the comprehensive data"
echo ""
echo "Run this command:"
echo "   npx tsx scripts/upload-comprehensive-votes.ts"
echo ""
echo "This will upload ~39MB of compressed voting data to Vercel Blob."
echo ""

