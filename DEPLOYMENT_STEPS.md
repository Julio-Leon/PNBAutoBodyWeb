# Step-by-step Firebase Deployment Guide

## Current Issue
The Firebase Functions SDK location error suggests the functions directory needs to be properly configured for Firebase deployment.

## Deployment Steps

### 1. Build Frontend First
Since there were path issues with WSL, let's build the frontend:

```bash
cd pnb-front-end
npm install  # if needed
npm run build
```

This should create `pnb-front-end/dist/` directory.

### 2. Deploy Hosting Only (First)
Let's deploy just the frontend first:

```bash
firebase deploy --only hosting
```

### 3. Fix Functions Directory
The functions directory needs proper Firebase Functions structure:

```bash
cd functions
npm install firebase-functions@latest firebase-admin@latest
```

### 4. Deploy Functions
Once functions are fixed:

```bash
firebase deploy --only functions
```

### 5. Deploy Everything
```bash
firebase deploy
```

## Alternative: Use Cloud Run Instead
If Firebase Functions continues to have issues, we could deploy the backend to Google Cloud Run instead:

1. Build Docker container
2. Deploy to Cloud Run
3. Update frontend API URLs

## Current Status
- ✅ Firebase CLI installed and logged in
- ✅ Project connected (pnbautobody-33725)
- ✅ Frontend configured for hosting
- ❌ Functions need debugging (SDK location error)
- ❌ Frontend needs to be built (WSL path issues)

Try building the frontend first, then deploy hosting only.
