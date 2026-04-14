// UIScene – HUD overlay running in parallel with GameScene
export default class UIScene extends Phaser.Scene {
  constructor() { super({ key: 'UIScene' }); }

  init(data) {
    this.difficulty = data.difficulty || 'normal';
  }

  create() {
    const W = 360, H = 640;

    // ── Top HUD bar ──────────────────────────────────────────
    this.add.rectangle(W / 2, 22, W, 44, 0x000022, 0.85).setDepth(19);

    // Ukraine flag accent lines
    this.add.rectangle(W / 2, 0, W, 4, 0x005bbb).setDepth(20);
    this.add.rectangle(W / 2, 4, W, 4, 0xffd700).setDepth(20);

    // Score
    this.add.text(10, 10, 'SCORE', {
      fontFamily: 'monospace', fontSize: '9px', color: '#888888'
    }).setDepth(20);
    this.scoreTxt = this.add.text(10, 20, '00000000', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffd700'
    }).setDepth(20);

    // Hi-Score
    const hi = parseInt(localStorage.getItem('frontline_hiscore') || '0');
    this.add.text(W / 2, 10, 'HI', {
      fontFamily: 'monospace', fontSize: '9px', color: '#888888'
    }).setOrigin(0.5, 0).setDepth(20);
    this.hiTxt = this.add.text(W / 2, 20, hi.toString().padStart(8, '0'), {
      fontFamily: 'monospace', fontSize: '11px', color: '#aaaaaa'
    }).setOrigin(0.5, 0).setDepth(20);

    // Combo
    this.comboTxt = this.add.text(W - 10, 10, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#ff8800'
    }).setOrigin(1, 0).setDepth(20);

    // ── Bottom HUD bar ───────────────────────────────────────
    this.add.rectangle(W / 2, H - 30, W, 60, 0x000022, 0.85).setDepth(19);

    // Lives (aircraft icons)
    this.add.text(10, H - 50, 'LIVES', {
      fontFamily: 'monospace', fontSize: '8px', color: '#888888'
    }).setDepth(20);
    this.livesGroup = this.add.group();
    this.updateLivesIcons(3);

    // Energy bar
    this.add.text(80, H - 50, 'ENERGY', {
      fontFamily: 'monospace', fontSize: '8px', color: '#888888'
    }).setDepth(20);
    this.energyBarBg = this.add.rectangle(160, H - 38, 140, 12, 0x333355).setDepth(20);
    this.energyBar   = this.add.rectangle(90, H - 38, 140, 10, 0x005bbb).setOrigin(0, 0.5).setDepth(21);

    // Weapon level
    this.wepLabel = this.add.text(10, H - 18, 'WPN: 1', {
      fontFamily: 'monospace', fontSize: '10px', color: '#00ccff'
    }).setDepth(20);

    // Subweapons Status
    this.subWpnLabel = this.add.text(W / 2 - 20, H - 18, '---', {
      fontFamily: 'monospace', fontSize: '10px', color: '#00ff88'
    }).setOrigin(0.5, 0).setDepth(20);

    // Bombs (stored)
    this.bombLabel = this.add.text(W / 2 + 42, H - 18, '💣 x0', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ff8800'
    }).setOrigin(0.5, 0).setDepth(20);

    // Status icons (shield, emp, wingman)
    this.statusTxt = this.add.text(W - 10, H - 18, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffffff'
    }).setOrigin(1, 0).setDepth(20);

    // ── Boss HP bar (hidden until boss spawns) ────────────────
    this.bossBarBg   = this.add.rectangle(W / 2, 60, W - 20, 14, 0x330000, 0.9).setDepth(20).setAlpha(0);
    this.bossBar     = this.add.rectangle(W / 2 - (W - 20) / 2, 60, W - 20, 10, 0xcc0000).setOrigin(0, 0.5).setDepth(21).setAlpha(0);
    this.bossTxt     = this.add.text(W / 2, 50, '', {
      fontFamily: 'monospace', fontSize: '9px', color: '#ff4444'
    }).setOrigin(0.5, 1).setDepth(22).setAlpha(0);

    // Difficulty badge
    const diffColor = this.difficulty === 'hard' ? '#ff4400' : '#00ccff';
    this.add.text(W - 10, H - 50, this.difficulty.toUpperCase(), {
      fontFamily: 'monospace', fontSize: '8px', color: diffColor
    }).setOrigin(1, 0).setDepth(20);

    // ── Registry listeners ──────────────────────────────────
    this.registry.events.on('changedata', this.onRegistryChange, this);
    this.events.on('shutdown', this.shutdown, this); // Clean up on stop
    // Initial state
    this.onRegistryChange(null, 'score', 0);
  }

  onRegistryChange(parent, key, value) {
    switch (key) {
      case 'score':
        this.scoreTxt.setText(value.toString().padStart(8, '0'));
        break;
      case 'lives':
        this.updateLivesIcons(value);
        break;
      case 'energy': {
        const pct = Math.max(0, value) / this.registry.get('maxEnergy');
        this.energyBar.width = 138 * pct;
        const col = pct > 0.5 ? 0x005bbb : pct > 0.25 ? 0xffd700 : 0xff2200;
        this.energyBar.setFillStyle(col);
        break;
      }
      case 'combo':
        if (value > 1) {
          this.comboTxt.setText(`×${value} COMBO`);
          this.comboTxt.setColor(value >= 5 ? '#ff8800' : '#ffff00');
        } else {
          this.comboTxt.setText('');
        }
        break;
      case 'weapon':
        this.wepLabel.setText(`WPN: ${value}`);
        break;
      case 'subWpn':
        if(value.includes('WGM')) this.subWpnLabel.setColor('#88ccff');
        else if(value.includes('MSL')) this.subWpnLabel.setColor('#00ff88');
        else this.subWpnLabel.setColor('#888888');
        this.subWpnLabel.setText(value);
        break;
      case 'bombs':
        this.bombLabel.setText(`💣 x${value}`);
        this.bombLabel.setColor(value > 0 ? '#ff8800' : '#555555');
        break;
      case 'bossActive':
        if (value) {
          this.bossBarBg.setAlpha(1);
          this.bossBar.setAlpha(1);
          this.bossTxt.setAlpha(1).setText('⚠ BOSS INCOMING ⚠');
        } else {
          this.bossBarBg.setAlpha(0);
          this.bossBar.setAlpha(0);
          this.bossTxt.setAlpha(0);
        }
        break;
      case 'bossHP': {
        const maxHP = this.registry.get('bossMaxHP') || 1;
        const pct = Math.max(0, value) / maxHP;
        this.bossBar.width = (360 - 20) * pct;
        const phase2 = pct < 0.4;
        this.bossBar.setFillStyle(phase2 ? 0xff6600 : 0xcc0000);
        break;
      }
    }

    // Status icons
    const statusParts = [];
    if (this.registry.get('shieldActive'))  statusParts.push('🛡');
    if (this.registry.get('wingmanActive')) statusParts.push('✈');
    if (this.statusTxt) this.statusTxt.setText(statusParts.join(' '));

    // Hi-score update
    const hi = parseInt(localStorage.getItem('frontline_hiscore') || '0');
    if (this.hiTxt) this.hiTxt.setText(hi.toString().padStart(8, '0'));
  }

  updateLivesIcons(count) {
    this.livesGroup.clear(true, true);
    for (let i = 0; i < count; i++) {
      const icon = this.add.text(10 + i * 16, H - 36, '✈', {
        fontFamily: 'monospace', fontSize: '13px', color: '#005bbb'
      }).setDepth(20);
      this.livesGroup.add(icon);
    }
  }

  shutdown() {
    this.registry.events.off('changedata', this.onRegistryChange, this);
  }
}

const H = 640;
