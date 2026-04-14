#!/bin/bash
set -e

VERSION="v0.3.1"
RELEASE_NOTES="v0.3.1 Hotfix Details:
- Fixed a bug where game audio loops (shooting) would continue playing during the intermission/stage clear screen.
- Fixed an issue where the background would abruptly flash back to the previous level before transitioning properly.
- Added Haptic Feedback (vibrations) on mobile devices for major events like taking damage, shield breaks, or using bombs.
- Perfected the parallax scrolling algorithm for ground objects (tanks/AA guns) so they stick precisely to the scrolling background seamlessly."

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
