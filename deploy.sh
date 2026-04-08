#!/bin/bash
set -e

echo "Starting deployment process..."

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
git commit -m "Release Flight 1943 v0.2.3" || true

echo "Deploying to GitHub..."
git push -u origin main || true

echo "Creating GitHub Release..."
gh release create v0.2.3 android/app/build/outputs/apk/debug/app-debug.apk --title "Flight 1943 v0.2.3" --notes "Introduced the WebAudio Procedural Synth Engine for SFX and per-stage dynamic BGM."

echo "Done!"
