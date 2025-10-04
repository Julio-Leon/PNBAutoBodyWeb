#!/bin/bash

# Script to fix the deployment errors by updating package-lock.json
# and properly installing all dependencies

echo "=== P&N Auto Body Website Deployment Fix ==="
echo "This script will fix the npm dependency errors"
echo ""

# Navigate to the functions directory
echo "📂 Navigating to functions directory..."
cd "$(dirname "$0")/functions" || {
  echo "❌ Could not navigate to functions directory"
  exit 1
}

# Show current directory for verification
echo "📍 Current directory: $(pwd)"
echo ""

# Install dependencies to update package-lock.json
echo "📦 Installing dependencies..."
npm install

# Make sure twilio is specifically installed
echo ""
echo "📱 Ensuring Twilio is installed..."
npm install twilio

# Other potentially missing packages mentioned in the error
echo ""
echo "🔄 Installing other dependencies mentioned in the error..."
npm install axios@1.12.2
npm install dayjs@1.11.18
npm install https-proxy-agent@5.0.1
npm install scmp@2.1.0

# Verify that packages are installed
echo ""
echo "✅ Verifying installations..."
npm list twilio
npm list axios
npm list dayjs
npm list https-proxy-agent
npm list scmp

echo ""
echo "🚀 Dependencies updated! You can now try deploying again using:"
echo "    ./deploy.sh"
echo ""
