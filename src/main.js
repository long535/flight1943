import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import GameOverScene from './scenes/GameOverScene.js';

// Responsive sizing for mobile
function getGameSize() {
  const TARGET_W = 360;
  const TARGET_H = 640;
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const scale = Math.min(winW / TARGET_W, winH / TARGET_H);
  return { width: TARGET_W, height: TARGET_H, zoom: scale };
}

const { width, height, zoom } = getGameSize();

const config = {
  type: Phaser.AUTO,
  width,
  height,
  zoom,
  backgroundColor: '#0a0a1a',
  parent: 'game-container',
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, MenuScene, GameScene, UIScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
  game.scale.refresh();
});

export default game;
