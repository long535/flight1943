#!/bin/bash
set -e

VERSION="v0.3.5"
RELEASE_NOTES="v0.3.5 The Bullet Hell Update:
- **Massive Enemy Swarms**: Enemy counts across all waves in Stage 1 and Stage 2 have been multiplied by 10x! The spawn gaps have been incredibly shortened to create a true adrenaline-pumping bullet hell experience.
- **Visual Polish**: Removed solid background artifacts from the new Su-57 aircraft and Kamikaze Bomb drones. They now blend flawlessly with the environment.
- **Bug Fix**: Addressed a missing file path logic loop causing bomb drones to fail rendering."

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
