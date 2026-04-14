// StageCompleteScene.js  – Intermission screen after each boss defeat
const GAME_W = 360;
const GAME_H = 640;

const STAGE_INFO = [
  { name: 'DONBAS PLAINS',  bgKey: 'stage_clear_bg0', color: 0xff8833 },
  { name: 'BLACK SEA',      bgKey: 'stage_clear_bg1', color: 0x0088ff },
  { name: 'KHARKIV RUINS',  bgKey: 'stage_clear_bg2', color: 0xcc4400 },
];

export default class StageCompleteScene extends Phaser.Scene {
  constructor() { super({ key: 'StageCompleteScene' }); }

  init(data) {
    this.stageIndex   = data.stageIndex   ?? 0;
    this.score        = data.score        ?? 0;
    this.killCount    = data.killCount    ?? 0;
    this.maxCombo     = data.maxCombo     ?? 1;
    this.hitsReceived = data.hitsReceived ?? 0;
    this.bombsUsed    = data.bombsUsed    ?? 0;
    this.livesLost    = data.livesLost    ?? 0;
    this.energy       = data.energy       ?? 100;
    this.difficulty   = data.difficulty   ?? 'normal';
    this.isGameClear  = data.isGameClear  ?? false;
    this._continued   = false;
  }

  create() {
    // ── Background ───────────────────────────────────────────
    const info = STAGE_INFO[this.stageIndex] || STAGE_INFO[0];
    const bgKey = info.bgKey;
    let bgImg;
    try {
      bgImg = this.add.image(GAME_W/2, GAME_H/2, bgKey)
        .setDisplaySize(GAME_W, GAME_H).setDepth(0).setAlpha(0);
    } catch(e) {
      bgImg = this.add.rectangle(GAME_W/2, GAME_H/2, GAME_W, GAME_H, 0x111122).setDepth(0).setAlpha(0);
    }

    // Dark gradient overlay
    const overlay = this.add.rectangle(GAME_W/2, GAME_H/2, GAME_W, GAME_H, 0x000000, 0.62).setDepth(1).setAlpha(0);

    // Subtle scanline effect
    const scanlines = [];
    for(let y=0; y<GAME_H; y+=4) {
      scanlines.push(this.add.rectangle(GAME_W/2, y, GAME_W, 1, 0x000000, 0.18).setDepth(2).setAlpha(0));
    }

    // Crossfade background elements in
    this.tweens.add({ targets: bgImg, alpha: 1, duration: 800 });
    this.tweens.add({ targets: overlay, alpha: 0.62, duration: 800 });
    this.tweens.add({ targets: scanlines, alpha: 0.18, duration: 800 });

    // ── Rating calculation ───────────────────────────────────
    const rating = this._calcRating();

    // ── TOP BANNER ───────────────────────────────────────────
    const bannerColor = this.isGameClear ? 0xffd700 : info.color;
    const bannerBg = this.add.rectangle(GAME_W/2, 52, GAME_W, 72, bannerColor, 0.18).setDepth(3);
    const bannerLine= this.add.rectangle(GAME_W/2, 88, GAME_W, 2, bannerColor, 0.9).setDepth(3);

    const stageLabel = this.isGameClear ? 'ALL STAGES CLEAR!' :
      `STAGE ${this.stageIndex+1} CLEAR!`;
    const stageName  = this.isGameClear ? '⭐ MISSION COMPLETE ⭐' : info.name;

    const t1 = this.add.text(GAME_W/2, 30, stageLabel, {
      fontFamily:'"Press Start 2P", monospace', fontSize:'11px',
      color:'#' + bannerColor.toString(16).padStart(6,'0'),
      stroke:'#000', strokeThickness:3
    }).setOrigin(0.5).setDepth(4).setAlpha(0);

    const t2 = this.add.text(GAME_W/2, 60, stageName, {
      fontFamily:'monospace', fontSize:'12px', color:'#ffffff',
      stroke:'#000', strokeThickness:2
    }).setOrigin(0.5).setDepth(4).setAlpha(0);

    // ── RATING DISPLAY ───────────────────────────────────────
    const ratingHex = '#' + rating.color.toString(16).padStart(6,'0');

    const ratingBg = this.add.rectangle(GAME_W/2, 195, 100, 90, rating.color, 0.15)
      .setStrokeStyle(2, rating.color, 0.9).setDepth(3).setAlpha(0);

    const ratingLetter = this.add.text(GAME_W/2, 188, rating.grade, {
      fontFamily:'"Press Start 2P", monospace', fontSize:'52px',
      color: ratingHex, stroke:'#000', strokeThickness:5
    }).setOrigin(0.5).setDepth(4).setAlpha(0).setScale(0.3);

    const ratingLabel = this.add.text(GAME_W/2, 240, rating.label, {
      fontFamily:'monospace', fontSize:'13px', color: ratingHex,
      stroke:'#000', strokeThickness:2
    }).setOrigin(0.5).setDepth(4).setAlpha(0);

    // ── STATS PANEL ──────────────────────────────────────────
    const panelY = 390;
    const panelH = 210;
    this.add.rectangle(GAME_W/2, panelY, GAME_W-40, panelH, 0x000000, 0.72)
      .setStrokeStyle(1, 0x445566, 0.8).setDepth(3);

    const statsData = [
      { label:'SCORE',       value: this.score.toLocaleString(),      color:'#ffd700' },
      { label:'ENEMIES DOWN',value: this.killCount,                    color:'#ff8833' },
      { label:'BEST COMBO',  value: `×${this.maxCombo}`,              color:'#ff4488' },
      { label:'HITS TAKEN',  value: this.hitsReceived,                 color:'#ff4444' },
      { label:'ENERGY LEFT', value: `${Math.floor(this.energy)}%`,    color:'#00ff88' },
    ];

    const statTexts = [];
    const rowH = 34;
    const startY = panelY - panelH/2 + 26;
    statsData.forEach((s, i) => {
      const y = startY + i * rowH;
      this.add.text(28, y, s.label, {
        fontFamily:'monospace', fontSize:'10px', color:'#aabbcc', stroke:'#000', strokeThickness:2
      }).setDepth(4).setAlpha(0).setName(`sl${i}`);

      const vt = this.add.text(GAME_W-28, y, String(s.value), {
        fontFamily:'"Press Start 2P", monospace', fontSize:'10px',
        color: s.color, stroke:'#000', strokeThickness:2
      }).setOrigin(1, 0).setDepth(4).setAlpha(0).setName(`sv${i}`);

      // Separator line
      this.add.rectangle(GAME_W/2, y+20, GAME_W-50, 1, 0x334455, 0.6).setDepth(3);
      statTexts.push(vt);
    });

    // ── COUNTDOWN ────────────────────────────────────────────
    this.countNum = 5;
    this._countText = this.add.text(GAME_W/2, GAME_H-48, 'CONTINUE IN 5...', {
      fontFamily:'monospace', fontSize:'12px', color:'#88aacc',
      stroke:'#000', strokeThickness:2
    }).setOrigin(0.5).setDepth(4).setAlpha(0);

    const tapText = this.add.text(GAME_W/2, GAME_H-24, 'TAP TO SKIP', {
      fontFamily:'monospace', fontSize:'9px', color:'#445566'
    }).setOrigin(0.5).setDepth(4).setAlpha(0);

    // ── ANIMATE IN ───────────────────────────────────────────
    const fadeAll = [t1, t2, bannerBg, bannerLine];
    // Delay text UI slightly to wait for background to fade in
    this.tweens.add({targets:fadeAll, alpha:1, duration:500, delay:600});

    // Rating pops in
    this.time.delayedCall(600, () => {
      this.tweens.add({targets:ratingBg, alpha:1, duration:300});
      this.tweens.add({
        targets: ratingLetter, alpha:1, scaleX:1, scaleY:1,
        duration:550, ease:'Back.easeOut'
      });
      this.tweens.add({targets:ratingLabel, alpha:1, duration:400, delay:200});
      // Pulsing glow
      this.tweens.add({
        targets: ratingLetter, scaleX:1.06, scaleY:1.06,
        duration:700, yoyo:true, repeat:-1, ease:'Sine.easeInOut', delay:900
      });
    });

    // Stats appear staggered
    this.getChildren ? null : null; // no-op
    const allStatItems = this.children.list.filter(c => c.name&&(c.name.startsWith('sl')||c.name.startsWith('sv')));
    allStatItems.forEach((item, i) => {
      this.tweens.add({targets:item, alpha:1, x: item.name.startsWith('sl')? 28 : GAME_W-28,
        duration:300, delay:700 + i*80, ease:'Cubic.easeOut'});
    });

    // Countdown & tap text
    this.time.delayedCall(900, () => {
      this.tweens.add({targets:[this._countText, tapText], alpha:1, duration:400});
    });

    // ── COUNTDOWN TIMER ──────────────────────────────────────
    this._countdownEvent = this.time.addEvent({
      delay:1000, repeat:4,
      callback: () => {
        this.countNum--;
        if(this._countText) this._countText.setText(`CONTINUE IN ${this.countNum}...`);
        if(this.countNum <= 0) this._continue();
      }
    });

    // ── INPUT: tap to skip ───────────────────────────────────
    this.input.once('pointerdown', () => this._continue());
  }

  // ── Rating formula ───────────────────────────────────────────
  _calcRating() {
    const killPts   = Math.min(this.killCount * 8, 35);
    const comboPts  = Math.min((this.maxCombo - 1) * 4, 20);
    const hitPts    = Math.max(0, 30 - this.hitsReceived * 6);
    const energyPts = Math.round((this.energy / 100) * 15);
    const total = killPts + comboPts + hitPts + energyPts;

    if(total >= 80) return { grade:'S', label:'PERFECT!',      color:0xffd700 };
    if(total >= 65) return { grade:'A', label:'EXCELLENT!',    color:0x00ff88 };
    if(total >= 45) return { grade:'B', label:'GOOD JOB!',     color:0x88ccff };
    if(total >= 25) return { grade:'C', label:'AVERAGE',       color:0xffaa00 };
    return             { grade:'D', label:'KEEP TRAINING', color:0xff4444 };
  }

  // ── Continue ─────────────────────────────────────────────────
  _continue() {
    if(this._continued) return;
    this._continued = true;
    this._countdownEvent?.remove();

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if(this.isGameClear) {
        this.scene.stop('UIScene');
        this.scene.stop('GameScene');
        this.scene.start('GameOverScene', {
          score: this.score, difficulty: this.difficulty, win: true
        });
        this.scene.stop('StageCompleteScene');
      } else {
        // Resume the GameScene
        const gs = this.scene.get('GameScene');
        if(gs && gs._resumeFromStageComplete) gs._resumeFromStageComplete();
        this.scene.stop('StageCompleteScene');
      }
    });
  }
}
