# 🛩️ Flight 1943 

A modern hardware-accelerated, retro-styled top-down arcade shooter.  
Built with **Phaser 3**, powered by **Vite**, and seamlessly deployed to Android using **Capacitor**.

![Version](https://img.shields.io/badge/Version-v0.3.6-blue)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Android-brightgreen)

---

## 🌟 Core Features

- **Endless Arcade Multi-Stage Gameplay**: Seamless transitions between 3 intense combat zones (Donbas Plains, Black Sea, Kharkiv Ruins).
- **Extreme Bullet Hell**: Dynamically scaled difficulty modes (Normal @ 200% frequency / Hard @ 400% frequency).
- **Procedural Audio Engine**: A completely zero-byte footprint sound architecture! All SFX (Explosions, Lasers, Powerups) and multi-stage background music loops are generated purely mathematically in real-time via Web Audio API `Oscillators`.
- **Intelligent Boss Logic**: Multi-phase engagements featuring heavily armed entities (K-329 Submarines, Moskva Cruisers, Flying Fortresses).
- **Multi-Touch Support**: Natively optimized for Android APKs, supporting fluid joystick drags while enabling secondary finger-taps for immediate Bomb drops.

## 📜 Update Roadmap & History

### v0.3.6 (Latest)
* **Visual Polish & Asset Finalization**: Removed checkerboard backgrounds from the Su-57 and Kamikaze Bomb drones. Re-scaled `depot_obj` and properly rotated the `boss_submarine` to match the exact in-game top-down combat orientation.

### v0.3.5 (Bullet Hell Update)
* **Massive Swarms**: Enemy counts strictly multiplied by 10x! Lowered `spawnGap` thresholds dramatically across Stage 1 and 2 to push bullet hell density to the actual rendering limits.
* **New Enemy (Su-57)**: A highly agile stealth fighter with a horizontal entry (lateral) and a deadly 5-way shotgun spread.
* **Memory & Lifecycle Fixes**: Eliminated the cross-scene 'Start Battle' freeze by un-registering deeply rooted UI event listeners when a game over sequence transitions.

### v0.2.3
* **Enemy Volume 300%**: Globally tripled the wave array spawns for maximum visual chaos.
* **Ground Unit Static Locking**: Adjusted speed models to strictly bolt Tanks, Ships, and Turrets to the scrolling terrain beneath them, eliminating unnatural lateral floating.

### v0.2.1
* **APK Multi-touch Hotfix**: Enabled Phaser's `addPointer(2)` to restore two-finger screen tapping for special attacks.
* Refactored Game Over Scene interactions cleanly to central elements.

### v0.2.0
* **Visual Polish**: Synthesized a completely loop-less deep sea gradient for Stage 2.
* **S-400 Rework**: Embedded physically sized, immobile Missile Batteries in Stage 1 that physically rotate to track the player's movement loop.

### v0.1.0
* Base Android release orchestrated via Capacitor `cap sync android` and `.gradlew` wrappers. Built out infinitely looping parallax stages and the structural framework of the game.

## 🛠️ How to Build & Deploy

### For Web (Local Development)
```bash
npm install
npm run dev
```

### For Android (APK Deployment Wrapper)
A bundled automated DevOps script exists to compile the Vite web package, sync to Capacitor, construct the Gradle configuration, and automatically map release tags directly back to GitHub.
```bash
# Deploys web bundles, generates the Android APK, 
# and automatically creates a new GitHub Release page with the artifact.
./deploy.sh
```

---
*Created by Chris Lou (@2026)*
