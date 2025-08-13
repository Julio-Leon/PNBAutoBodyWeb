#!/bin/bash
echo "🚀 Deploying PNB Auto Body to Firebase..."

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo "❌ Error: firebase.json not found. Run this script from the project root."
    exit 1
fi

echo "📦 Building frontend..."
cd pnb-front-end
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi
cd ..

echo "🔥 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment complete!"
echo "🌐 Your website is now live at:"
echo "   Frontend: https://pnbautobody-33725.web.app"
echo "   API: https://us-central1-pnbautobody-33725.cloudfunctions.net/api"
