#!/bin/bash
set -e

VERSION="v0.3.6"
RELEASE_NOTES="v0.3.6 Asset Polish Update:
- **Visual Fixes**: Removed the solid background artifacts from the S-400 Anti-Air Missiles, letting them blend more naturally into the ground terrain.
- **Boss Correction**: The Submarine Boss is now properly rotated 180 degrees so it faces the correct combat direction.
- **Scaling Adjustments**: The 'Depot' ground structure has been dramatically scaled down to 0.2x roughly aligning to the background proportions without sacrificing texture quality."

echo "Starting deployment process for $VERSION..."

# Enforce Android SDK Location
export ANDROID_HOME=/home/vibecodingvm/Android/Sdk
echo "sdk.dir=/home/vibecodingvm/Android/Sdk" > android/local.properties

echo "Building Web Assets..."
npm run build
npx cap sync android

echo "Building APK..."
cd android
./gradlew assembleDebug
cd ..

echo "Checking if APK exists..."
if [ ! -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "APK build failed!"
    exit 1
fi
echo "APK successfully built."

echo "Configuring Git..."
git add .
git commit -m "Release Frontline 1943 $VERSION" || true

echo "Deploying to GitHub..."
git push -u origin main || true

echo "Creating GitHub Release..."
gh release create $VERSION \
  android/app/build/outputs/apk/debug/app-debug.apk \
  --title "Frontline 1943 $VERSION" \
  --notes "$RELEASE_NOTES"

echo "Done! Released $VERSION"
