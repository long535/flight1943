#!/bin/bash
set -e

VERSION="v0.3.8"
RELEASE_NOTES="v0.3.8 Hotfix:
- **Submarine Boss Fix**: The boss_submarine sprite now renders in the correct orientation (no longer flipped 180 degrees).
- **Bomb Drone Scale**: Reduced the V-formation kamikaze drones from 0.85x to 0.3x scale so they look like a proper swarm of small drones rather than giant aircraft."

echo "Starting deployment process for $VERSION..."

export ANDROID_HOME=/home/vibecodingvm/Android/Sdk
echo "sdk.dir=/home/vibecodingvm/Android/Sdk" > android/local.properties

echo "Building Web Assets..."
npm run build
npx cap sync android

echo "Building APK..."
cd android
./gradlew assembleDebug
cd ..

if [ ! -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "APK build failed!"
    exit 1
fi
echo "APK successfully built."

git add .
git commit -m "Release Frontline 1943 $VERSION" || true
git push -u origin main || true

gh release create $VERSION \
  android/app/build/outputs/apk/debug/app-debug.apk \
  --title "Frontline 1943 $VERSION" \
  --notes "$RELEASE_NOTES"

echo "Done! Released $VERSION"
