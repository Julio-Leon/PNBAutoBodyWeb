# Step-by-step Firebase Deployment Guide

## Updates (August 16, 2025)
- Fixed API endpoints in the frontend to correctly handle authentication
- Enhanced error handling for appointment fetching
- Improved response format handling to support different data structures
- Added fallback endpoints to ensure backward compatibility

## Deployment Steps

### 1. Build Frontend First
Build the frontend to create the distribution files:

```bash
cd pnb-front-end
npm install  # if needed
npm run build
```

This will create `pnb-front-end/dist/` directory with optimized production assets.

### 2. Deploy Hosting Only (First)
Deploy just the frontend first to ensure it builds correctly:

```bash
firebase deploy --only hosting
```

### 3. Update Functions Dependencies
Ensure the functions directory has all required dependencies:

```bash
cd functions
npm install
# If you need to update specific packages:
npm install firebase-functions@latest firebase-admin@latest express@latest cors@latest
```

### 4. Deploy Functions
Deploy the backend functions:

```bash
firebase deploy --only functions
```

### 5. Deploy Everything
If individual deployments worked, you can deploy everything at once for future updates:

```bash
firebase deploy
```

### 6. Verify Deployment
After deployment, verify that your application is working by visiting:

- Frontend: https://pnbautobody-33725.web.app
- API: https://us-central1-pnbautobody-33725.cloudfunctions.net/api

## Troubleshooting Common Issues

### API Connection Issues
- Check browser console for CORS errors
- Verify API base URL is correct in the frontend config
- Test API endpoints using tools like Postman or curl

### Authentication Problems
- Ensure token is being correctly sent in Authorization header
- Check token expiration and refresh if needed
- Verify backend is properly parsing and validating tokens

### Function Deployment Errors
If you encounter errors deploying functions:
```bash
firebase deploy --only functions --debug
```
This will provide more detailed error information.

## Current Status
- ✅ Firebase CLI installed and logged in
- ✅ Project connected (pnbautobody-33725)
- ✅ Frontend configured for hosting
- ✅ Functions updated with new authentication handling
- ✅ API endpoints updated for better error handling
