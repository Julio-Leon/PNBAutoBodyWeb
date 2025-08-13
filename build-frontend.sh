#!/bin/bash

echo "🔧 Building PNB Auto Body Frontend..."

# Navigate to frontend directory
cd pnb-front-end

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🚀 Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully!"
    echo "📁 Build output in: pnb-front-end/dist/"
    ls -la dist/
else
    echo "❌ Build failed!"
    exit 1
fi
