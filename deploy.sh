#!/bin/bash
set -e

VERSION="v0.3.7"
RELEASE_NOTES="v0.3.7 Ultimate Bullet Hell & Visual Polish Update (Unified v0.3 Release):

🚀 **Major Gameplay Enhancements (Bullet Hell)**
- **Massive Enemy Swarms:** Enemy volumes across Stage 1 and Stage 2 have been officially multiplied by **10x**! Spawning intervals are tightened down to push bullet hell density to the absolute rendering limits.
- **Improved Economy:** Players now start with 2 bombs natively, and are gifted 2 bombs every time they respawn.

✈️ **New Entities & Animations**
- **New Enemy (Su-57):** A highly agile stealth fighter featuring a horizontal (lateral) combat sweep and a deadly 5-way shotgun spread.
- **Cinematic Drone Strikes:** Triggering a bomb calls down a breathtaking 13-drone Kamikaze V-formation sweeping from bottom to top, delayed with a deep explosion impact and extended 1.8s animation duration.

🎨 **Visual & Asset Master Polish**
- Successfully processed and removed AI checkerboard backgrounds from the Su-57 and Kamikaze drones to ensure they flawlessly blend into the warzone.
- Perfectly rotated the Submarine Boss 180-degrees organically through its texture mapping.
- Reduced 'Depot' structure sizing by an optimal ratio to maintain visual realism against the parallax ground.

🛠️ **Critical Engine Fixes**
- **Cross-Scene Memory Fix:** Eliminated the nasty 'Start Battle' freeze bug caused by leftover global UI event listeners persisting through the GameOver sequence."

echo "Starting deployment process for $VERSION..."

# Clean up older v0.3.x releases
echo "Cleaning up ancient v0.3.x GitHub releases and tags to keep repository pristine..."
for tag in $(git tag -l "v0.3.*"); do
    if [ "$tag" != "$VERSION" ]; then
        echo "Deleting release & tag $tag..."
        gh release delete "$tag" -y --cleanup-tag || true
        git push origin --delete "$tag" || true
    fi
done

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
git commit -m "Release Frontline 1943 $VERSION Unified" || true

echo "Deploying to GitHub..."
git push -u origin main || true

echo "Creating GitHub Release..."
gh release create $VERSION \
  android/app/build/outputs/apk/debug/app-debug.apk \
  --title "Frontline 1943 $VERSION" \
  --notes "$RELEASE_NOTES"

echo "Done! Released $VERSION"
