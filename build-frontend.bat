@echo off
echo Building PNB Auto Body Frontend...
cd pnb-front-end
npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    exit /b %errorlevel%
)
echo Frontend built successfully!
echo Build output in: pnb-front-end/dist
