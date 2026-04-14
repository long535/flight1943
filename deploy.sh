#!/bin/bash
set -e

VERSION="v0.3.4"
RELEASE_NOTES="v0.3.4 SU-57 Stealth Update & Fixes:
- **New Air Force Enemy**: Introducing the Su-57 Stealth Fighter. It slices horizontally through the screen at high speeds and fires a wide shotgun spread.
- **Stage Progression Fix**: Fixed a critical memory leak that caused the game to freeze when clicking 'Start Battle' after returning to the main menu from a game over.
- **Cinematic Bombing Run**: Drastically slowed down the visual sweep of the drone strike (from 0.9s to 1.8s) and added new thruster SFX before the mega explosion for a more epic feel.
- Added various Stage 1 and Stage 2 wave rebalances to include the new Su-57 fighters."

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
