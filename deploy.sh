#!/bin/bash
set -e

VERSION="v0.3.3"
RELEASE_NOTES="v0.3.3 High-Impact Visuals Update:
- **Massive Bomb Animation**: Calling in a bomb strike now summons a massive fleet of Kamikaze drones sweeping the screen in a tight V-formation before triggering a brilliant screen-wiping flash.
- **Improved Economy**: Players now start the game with 2 bombs, and will be gifted 2 bombs every time they respawn after losing a life.
- **Audio Mix**: Greatly reduced the volume of the player's primary rapid-fire bullet sound. This makes the music, hits, and explosions feel much punchier."

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
