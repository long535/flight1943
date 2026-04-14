#!/bin/bash
set -e

VERSION="v0.3.0"
RELEASE_NOTES="v0.3.0 — Major gameplay update: 3 new enemy types (MiG-29, Bomber, Drone swarm), 4 new bullet patterns (Ring, Cannon, Laser, Wave), fully redesigned Boss AI with unique per-stage movement and attacks, Stage-Complete intermission screen with pixel-art backgrounds and S/A/B/C/D rating system, combo border glow, powerup attraction, and rubber-band difficulty system."

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
