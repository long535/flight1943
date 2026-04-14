#!/bin/bash
set -e

VERSION="v0.3.2"
RELEASE_NOTES="v0.3.2 Gameplay Balance & Polish Update:
- Increased overall enemy density by 30-50% in Stages 1 and 2 for a more intense bullet-hell experience.
- Diversified early stages by mixing in Heavy Bombers and S-400 tanks earlier.
- Upgraded enemy bullet patterns: SU-34 now fires 'Wave' patterns, MI-24 fires 'Laser' patterns, and S-400 firing rate increased.
- Shrank the size of Anti-Air ground turrets by 50% for better visual scale mapping.
- Replaced the sharp stage transition with a smooth, cinematic 800ms crossfade into the pixel-art intermission screens."

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
