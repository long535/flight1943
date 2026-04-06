#!/bin/bash
set -e

echo "Starting deployment process..."

# Enforce Android SDK Location
export ANDROID_HOME=/home/vibecodingvm/Android/Sdk
echo "sdk.dir=/home/vibecodingvm/Android/Sdk" > android/local.properties

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
git init
git checkout -b main || git branch -M main
git config user.name "long535"
git config user.email "long535@users.noreply.github.com"
git add .
git commit -m "Initialize Flight 1943 v0.1.0 Android Release"

echo "Deploying to GitHub..."
gh repo create flight1943 --public --source=. --remote=origin --push || true

echo "Creating GitHub Release..."
gh release create v0.1.0 android/app/build/outputs/apk/debug/app-debug.apk --title "Flight 1943 v0.1.0" --notes "First Android Release using Capacitor."

echo "Done!"
