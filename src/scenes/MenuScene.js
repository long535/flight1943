import { RetroAudio } from '../audio/RetroAudio';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
    this.selectedDifficulty = 'normal';
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    const bg = this.add.image(W / 2, H / 2, 'bg_menu');
    const scaleX = W / bg.width;
    const scaleY = H / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));

    // Dark overlay for readability
    this.add.rectangle(W / 2, H / 2, W, H, 0x000022, 0.5);

    // Ukraine flag stripe at top
    this.add.rectangle(W / 2, 6, W, 12, 0x005bbb);
    this.add.rectangle(W / 2, 18, W, 12, 0xffd700);

    // Title
    const titleShadow = this.add.text(W / 2 + 2, H * 0.18 + 2, 'FRONTLINE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#000033'
    }).setOrigin(0.5);
    const titleText = this.add.text(W / 2, H * 0.18, 'FRONTLINE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ffd700'
    }).setOrigin(0.5);

    const yearShadow = this.add.text(W / 2 + 2, H * 0.26 + 2, '1943', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '26px',
      color: '#000033'
    }).setOrigin(0.5);
    const yearText = this.add.text(W / 2, H * 0.26, '1943', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '26px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const subText = this.add.text(W / 2, H * 0.33, 'UKRAINE SKIES', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#005bbb',
      letterSpacing: 0
    }).setOrigin(0.5);

    // Pulsing animation on title
    this.tweens.add({
      targets: [titleText, yearText],
      alpha: { from: 1, to: 0.85 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Difficulty selection
    const diffLabel = this.add.text(W / 2, H * 0.46, 'SELECT DIFFICULTY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#aaaaaa',
      letterSpacing: 0
    }).setOrigin(0.5);

    this.normalBtn = this.createDiffButton(W / 2 - 60, H * 0.53, 'NORMAL', 'normal');
    this.hardBtn = this.createDiffButton(W / 2 + 60, H * 0.53, 'HARD', 'hard');
    this.updateDiffButtons();

    // Start button
    const startBtn = this.createMenuButton(W / 2, H * 0.65, '▶  START BATTLE');
    startBtn.on('pointerdown', () => {
      this.cameras.main.flash(300, 255, 215, 0);
      this.time.delayedCall(300, () => {
        RetroAudio.init();
        RetroAudio.playShoot(); // small UI click confirm
        this.scene.stop('UIScene');
        this.scene.stop('GameOverScene');
        this.scene.start('GameScene', { difficulty: this.selectedDifficulty });
        this.scene.launch('UIScene',  { difficulty: this.selectedDifficulty });
      });
    });

    // High score display
    const hiScore = parseInt(localStorage.getItem('frontline_hiscore') || '0');
    this.add.text(W / 2, H * 0.78, `HI-SCORE: ${hiScore.toString().padStart(8, '0')}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffd700'
    }).setOrigin(0.5);

    // Bottom credits
    this.add.text(W / 2, H - 20, '@2026 Chris Lou', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#444466'
    }).setOrigin(0.5);

    // Version String
    this.add.text(W / 2, H - 32, 'v0.2.3', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#555577'
    }).setOrigin(0.5);

    // Floating particles (stars)
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H);
      const size = Phaser.Math.FloatBetween(1, 2);
      const star = this.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.3, 0.9));
      this.tweens.add({
        targets: star,
        alpha: 0,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  createDiffButton(x, y, label, diff) {
    const btn = this.add.text(x, y, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffffff',
      backgroundColor: diff === 'normal' ? '#003388' : '#880000',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      this.selectedDifficulty = diff;
      this.updateDiffButtons();
    });

    btn.diffKey = diff;
    return btn;
  }

  updateDiffButtons() {
    [this.normalBtn, this.hardBtn].forEach(btn => {
      const isSelected = btn.diffKey === this.selectedDifficulty;
      btn.setAlpha(isSelected ? 1 : 0.5);
      btn.setScale(isSelected ? 1.05 : 1);
    });
  }

  createMenuButton(x, y, label) {
    const btn = this.add.text(x, y, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#000022',
      backgroundColor: '#ffd700',
      padding: { x: 18, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    btn.on('pointerout', () => {
      this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 });
    });

    return btn;
  }
}
