export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Loading bar background
    const barBg = this.add.rectangle(W / 2, H / 2 + 40, 280, 20, 0x222244);
    const bar = this.add.rectangle(W / 2 - 140, H / 2 + 40, 0, 16, 0x005bbb);
    bar.setOrigin(0, 0.5);

    // Loading text
    const title = this.add.text(W / 2, H / 2 - 40, 'FRONTLINE 1943', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffd700',
      stroke: '#003366',
      strokeThickness: 4
    }).setOrigin(0.5);

    const subtitle = this.add.text(W / 2, H / 2, 'UKRAINE SKIES', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#005bbb'
    }).setOrigin(0.5);

    const loadText = this.add.text(W / 2, H / 2 + 70, 'LOADING...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#888888'
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      bar.width = 276 * value;
      loadText.setText(`LOADING... ${Math.floor(value * 100)}%`);
    });

    // Load all assets
    this.load.image('bg_level1', '/assets/backgrounds/level1.png');
    this.load.image('bg_level2', '/assets/backgrounds/level2.png');
    this.load.image('bg_level3', '/assets/backgrounds/level3.png');
    this.load.image('bg_menu',   '/assets/backgrounds/menu_clean.png');

    // Sprites - we treat the big spritesheets as single images for now
    // and crop them dynamically in code using texture frames
    this.load.image('player', '/assets/sprites/player.png');
    this.load.image('bomb_drone', '/assets/player/bomb_drone.png');
    this.load.image('enemy_ka52', '/assets/sprites/enemy_ka52.png');
    this.load.image('enemy_shahed', '/assets/sprites/enemy_shahed.png');
    this.load.image('boss_tu22m', '/assets/sprites/boss_tu22m.png');
    this.load.image('explosion_sheet', '/assets/sprites/explosion.png');
    this.load.image('powerups_sheet', '/assets/sprites/powerups.png');
    // Ground objects (Layer 2)
    this.load.image('aa_gun_img',   '/assets/sprites/aa_gun.png');
    this.load.image('tank_obj_img', '/assets/sprites/tank_obj.png');
    this.load.image('depot_obj_img','/assets/sprites/depot_obj.png');
    this.load.image('ship_obj_img', '/assets/sprites/ship_obj.png');

    // New Enemies & Bosses
    this.load.image('enemy_mi24', '/assets/sprites/enemy_mi24.png');
    this.load.image('enemy_s400', '/assets/sprites/enemy_s400.png');
    this.load.image('boss_submarine', '/assets/sprites/boss_submarine.png');
    this.load.image('boss_fortress', '/assets/sprites/boss_fortress.png');
    this.load.image('boss_core', '/assets/sprites/boss_core.png');

    // New Modular Powerups
    this.load.image('powerup_gun', '/assets/sprites/powerup_gun.png');
    this.load.image('powerup_missile', '/assets/sprites/powerup_missile.png');
    this.load.image('powerup_bomb', '/assets/sprites/powerup_bomb.png');
    this.load.image('powerup_shield', '/assets/sprites/powerup_shield.png');
    this.load.image('powerup_emp', '/assets/sprites/powerup_emp.png');
    this.load.image('powerup_health', '/assets/sprites/powerup_health.png');
    this.load.image('powerup_wingman', '/assets/sprites/powerup_wingman.png');
    // Cloud (Layer 3)
    this.load.image('cloud_img', '/assets/sprites/cloud.png');
    // Stage-complete intermission backgrounds (pixel-art girls)
    this.load.image('stage_clear_bg0', '/assets/backgrounds/stage_clear_0.png');
    this.load.image('stage_clear_bg1', '/assets/backgrounds/stage_clear_1.png');
    this.load.image('stage_clear_bg2', '/assets/backgrounds/stage_clear_2.png');

  }

  create() {
    this.scene.start('MenuScene');
  }
}
