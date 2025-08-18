#!/bin/bash

# PNB Auto Body Web Application Deployment Script
# This script provides step-by-step deployment with pause between steps
# to allow checking for errors

# Color codes for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}🚀 PNB Auto Body Web - Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo -e "${RED}❌ Error: firebase.json not found. Run this script from the project root.${NC}"
    exit 1
fi

# Function to prompt for continuation
prompt_continue() {
    echo
    read -p "Continue to next step? (y/n): " choice
    case "$choice" in 
        y|Y ) echo "Continuing...";;
        * ) echo "Deployment paused. Run the script again to continue."; exit 1;;
    esac
    echo
}

# Step 1: Build the frontend
echo -e "${YELLOW}STEP 1: Building the frontend${NC}"
echo "This step builds the React frontend application using Vite..."
cd pnb-front-end
echo "Installing dependencies if needed..."
npm install
echo "Building the frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed! Check the errors above.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Frontend build successful!${NC}"
fi
cd ..
prompt_continue

# Step 2: Deploy hosting only
echo -e "${YELLOW}STEP 2: Deploying frontend to Firebase Hosting${NC}"
echo "This step uploads the built frontend to Firebase Hosting..."
firebase deploy --only hosting
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Hosting deployment failed! Check the errors above.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Hosting deployed successfully!${NC}"
fi
prompt_continue

# Step 3: Update Functions dependencies
echo -e "${YELLOW}STEP 3: Updating Firebase Functions dependencies${NC}"
echo "This step ensures all backend dependencies are installed..."
cd functions
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Functions dependency installation failed! Check the errors above.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Functions dependencies installed successfully!${NC}"
fi
cd ..
prompt_continue

# Step 4: Deploy Functions
echo -e "${YELLOW}STEP 4: Deploying Firebase Functions${NC}"
echo "This step deploys the backend API to Firebase Functions..."
firebase deploy --only functions
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Functions deployment failed! Check the errors above.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Functions deployed successfully!${NC}"
fi
prompt_continue

# Step 5: Deploy Firebase rules if needed
echo -e "${YELLOW}STEP 5: Deploying Firestore and Storage rules${NC}"
echo "This step updates security rules for Firestore and Storage..."
firebase deploy --only firestore,storage
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Rules deployment failed! Check the errors above.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Rules deployed successfully!${NC}"
fi

# Final confirmation
echo
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo -e "${BLUE}========================================${NC}"
echo
echo -e "Your application is now available at:"
echo -e "  ${YELLOW}Frontend:${NC} https://pnbautobody-33725.web.app"
echo -e "  ${YELLOW}API:${NC} https://us-central1-pnbautobody-33725.cloudfunctions.net/api"
echo
echo -e "Remember to test the application to ensure everything works correctly!"
echo -e "${BLUE}========================================${NC}"
