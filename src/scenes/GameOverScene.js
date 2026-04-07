export default class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  init(data) {
    this.finalScore = data.score || 0;
    this.difficulty = data.difficulty || 'normal';
  }

  create() {
    const W = 360, H = 640;

    // Dark overlay
    this.add.rectangle(W / 2, H / 2, W, H, 0x000011);

    // Ukraine flag stripes
    this.add.rectangle(W / 2, 0,  W, 6, 0x005bbb);
    this.add.rectangle(W / 2, 6,  W, 6, 0xffd700);
    this.add.rectangle(W / 2, H,  W, 6, 0xffd700);
    this.add.rectangle(W / 2, H-6,W, 6, 0x005bbb);

    // Skull / dead icon
    this.add.text(W / 2, H * 0.18, '💥', {
      fontFamily: 'monospace', fontSize: '52px'
    }).setOrigin(0.5);

    // GAME OVER text
    const goText = this.add.text(W / 2, H * 0.33, 'MISSION FAILED', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ff2200',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: goText, alpha: 1, duration: 600, ease: 'Power2' });

    // Score display
    const hiScore = parseInt(localStorage.getItem('frontline_hiscore') || '0');
    const isNewHi = this.finalScore >= hiScore && this.finalScore > 0;

    this.add.text(W / 2, H * 0.44, 'SCORE', {
      fontFamily: 'monospace', fontSize: '11px', color: '#888888'
    }).setOrigin(0.5);
    this.add.text(W / 2, H * 0.5, this.finalScore.toString().padStart(8, '0'), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '22px',
      color: '#ffd700'
    }).setOrigin(0.5);

    if (isNewHi) {
      const newHiBadge = this.add.text(W / 2, H * 0.57, '★ NEW RECORD ★', {
        fontFamily: 'monospace', fontSize: '14px', color: '#ffd700'
      }).setOrigin(0.5);
      this.tweens.add({
        targets: newHiBadge, alpha: 0, duration: 600, yoyo: true, repeat: -1
      });
    }

    this.add.text(W / 2, H * 0.64, `BEST:  ${hiScore.toString().padStart(8, '0')}`, {
      fontFamily: 'monospace', fontSize: '11px', color: '#aaaaaa'
    }).setOrigin(0.5);

    // Difficulty
    const diffColor = this.difficulty === 'hard' ? '#ff6600' : '#00aaff';
    this.add.text(W / 2, H * 0.7, `DIFFICULTY: ${this.difficulty.toUpperCase()}`, {
      fontFamily: 'monospace', fontSize: '10px', color: diffColor
    }).setOrigin(0.5);

    // Buttons
    this.createBtn(W / 2, H * 0.85, '⌂ MENU', () => {
      this.time.delayedCall(80, () => {
        this.scene.stop('UIScene');
        this.scene.stop('GameScene');
        this.scene.start('MenuScene');
      });
    });

    // Floating particles
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H);
      const c = Phaser.Utils.Array.GetRandom([0xff2200, 0xff8800, 0xffd700]);
      const sq = this.add.rectangle(x, y, 3, 3, c);
      this.tweens.add({
        targets: sq, y: y + H,
        duration: Phaser.Math.Between(4000, 8000),
        repeat: -1
      });
    }
  }

  createBtn(x, y, label, cb) {
    const btn = this.add.text(x, y, label, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#000022',
      backgroundColor: '#ffd700',
      padding: { x: 24, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', cb);
    btn.on('pointerover',  () => btn.setScale(1.06));
    btn.on('pointerout',   () => btn.setScale(1));
    return btn;
  }
}
