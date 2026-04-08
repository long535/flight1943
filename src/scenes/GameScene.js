// GameScene.js  v5  – TileSprite BG + manual coord collision (guaranteed to work)
import { ENEMY_DATA } from '../data/enemies.js';
import { WAVES }       from '../data/levels.js';
import { RetroAudio }  from '../audio/RetroAudio.js';

const GAME_W = 360;
const GAME_H = 640;
const STAGE_BG    = { 0:'bg_level1', 1:'bg_level2', 2:'bg_level3' };
const STAGE_NAMES = { 0:['STAGE 1','DONBAS PLAINS'], 1:['STAGE 2','BLACK SEA'], 2:['STAGE 3','KHARKIV RUINS'] };

export default class GameScene extends Phaser.Scene {
  constructor() { super({ key:'GameScene' }); }

  init(data) {
    this.difficulty   = data.difficulty || 'normal';
    this.diffMult     = this.difficulty === 'hard' ? 1.6 : 1.0;
    this.score=0; this.combo=1; this.lives=3;
    this.energy=100; this.maxEnergy=100;
    this.weaponLevel=1; this.bombCount=0;
    this.subWeaponType=null; this.subWeaponLevel=0;
    this.shieldActive=false; this.isInvincible=false; this.gamePaused=false;
    this.playerDead=false; this.bossActive=false;
    this.stageIndex=-1; this.killCount=0;
    this.waveIndex=0; this.waveTimer=0; this.waveDelay=2500;
    // Bullet arrays (plain Image objects – no physics)
    this.pBullets=[]; this.eBullets=[];
    // Ground objects (middle layer)
    this.groundObjs=[]; this._groundObjTimer=5000; this._groundObjInterval=9000;
    // Clouds (top layer)
    this.clouds=[]; this._cloudTimer=0;
    // Touch
    this.dragActive=false; this.primaryPointerId=-1;
    this.touchStartX=0; this.touchStartY=0;
    this.playerStartX=0; this.playerStartY=0;
    this._twoFingerBombFired=false;
    // Boss
    this.boss=null; this.bossHP=0; this.bossMaxHPFull=1;
    this.bossPhase=1; this.bossMovDir=1; this.bossFireTimer=0;
  }

  create() {
    // ── Bullet textures ──────────────────────────────────────
    const pg = this.make.graphics({x:0,y:0,add:false});
    // Create a long glowing gradient tracer tail
    pg.fillStyle(0xffbb00,0.5); pg.fillRect(1,0,2,24);
    pg.fillStyle(0xffff44,0.9); pg.fillRect(1,4,2,14);
    pg.fillStyle(0xffffff,1.0); pg.fillRect(1,6,2,6);
    pg.generateTexture('pb',4,24); pg.destroy();

    const eg = this.make.graphics({x:0,y:0,add:false});
    eg.fillStyle(0xff2200,1); eg.fillCircle(6,6,6);
    eg.fillStyle(0xff8800,0.6); eg.fillCircle(6,6,3);
    eg.generateTexture('eb',12,12); eg.destroy();

    const mg = this.make.graphics({x:0,y:0,add:false});
    mg.fillStyle(0x00ff88,1); mg.fillTriangle(4,0,0,12,8,12);
    mg.fillStyle(0xffff00,0.7); mg.fillRect(3,8,2,5);
    mg.generateTexture('mb',8,14); mg.destroy();

    // ── Procedural textures for ground objects & clouds ───────
    this._makeGroundTextures();

    // ── LAYER 1: Terrain TileSprite (depth 0) ─────────────────
    this.bg = this.add.tileSprite(GAME_W/2, GAME_H/2, GAME_W, GAME_H, 'bg_level1').setDepth(0);
    this.bgSpeed = 1.8;
    this.currentBgKey = 'bg_level1';

    // ── LAYER 2: Ground objects spawn (depth 1) ───────────────
    // (Spawned dynamically in _spawnGroundObj)

    // ── LAYER 3: Clouds (depth 3, above ground below planes) ──
    this._spawnInitialClouds();

    // ── Enemy group (still uses physics for movement) ─────────
    this.enemies      = this.physics.add.group();
    this.powerUpGroup = this.physics.add.group();

    // ── Player (physics image for setCollideWorldBounds) ──────
    const pTexW = this.textures.get('player').getSourceImage().width;
    const pScale = 52 / pTexW;
    this.player = this.physics.add.image(GAME_W/2, GAME_H*0.82, 'player')
      .setScale(pScale).setDepth(5).setCollideWorldBounds(true);
    this.player.body.allowGravity = false;

    // ── Shield ring ─────────────────────────────────────────
    this.shieldRing = this.add.circle(0,0,34,0x00aaff,0.18)
      .setStrokeStyle(2,0x00ddff,0.9).setDepth(6).setVisible(false);

    // ── Wingmen (plain images) ────────────────────────────────
    const wScale = 36/pTexW;
    this.wingmanL = this.add.image(-500,-500,'player').setScale(wScale).setDepth(4).setAlpha(0.75).setVisible(false);
    this.wingmanR = this.add.image(-500,-500,'player').setScale(wScale).setDepth(4).setAlpha(0.75).setVisible(false);

    // ── Input ──────────────────────────────────────────────
    this.input.addPointer(2); // enable 2-touch functionality for APK
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup',   this.onPointerUp,   this);
    this.input.keyboard.on('keydown-SPACE', ()=>this._useBomb());
    this.input.keyboard.on('keydown-B',     ()=>this._useBomb());

    // ── Timers ───────────────────────────────────────────────
    this.time.addEvent({delay:155, callback:this._firePlayer,   callbackScope:this, loop:true});
    this.time.addEvent({delay:700, callback:this._fireMissile,  callbackScope:this, loop:true});
    this.time.addEvent({delay:40,  callback:this._emitThrust,   callbackScope:this, loop:true});
    this.time.addEvent({delay:12000, callback:this._ambientSpawn, callbackScope:this, loop:true});
    this.time.addEvent({delay:75000, callback:()=>{
      if(!this.gamePaused&&!this.bossActive)
        this._spawnPU(Phaser.Math.Between(50,GAME_W-50), 20);
    }, loop:true});

    // ── Screen flash overlay ──────────────────────────────────
    this.screenFlash = this.add.rectangle(GAME_W/2,GAME_H/2,GAME_W,GAME_H,0,0).setDepth(28);

    // ── Registry ─────────────────────────────────────────────
    const reg={score:0,lives:3,energy:100,maxEnergy:100,combo:1,weapon:1,missiles:0,bombs:0,bossHP:0,bossMaxHP:1,bossActive:false};
    Object.entries(reg).forEach(([k,v])=>this.registry.set(k,v));

    this._transitionStage(0);
  }

  // ─────────────────────────────────────────────────────────
  //  STAGE / BG
  // ─────────────────────────────────────────────────────────
  _transitionStage(idx) {
    if(idx===this.stageIndex) return;
    this.stageIndex=idx;
    const bgKey = STAGE_BG[idx]||'bg_level1';
    this.bg.setTexture(bgKey);
    const [lbl,name]=STAGE_NAMES[idx]||['STAGE',''];
    RetroAudio.startBGM(idx);
    this.gamePaused=true;
    const colors=[0x004488,0x003366,0x441100];
    const bar=this.add.rectangle(GAME_W/2,GAME_H/2,GAME_W,72,colors[idx]||0x003399,0.94).setDepth(30);
    const t1=this.add.text(GAME_W/2,GAME_H/2-16,lbl,{fontFamily:'monospace',fontSize:'13px',color:'#000',backgroundColor:'#ffd700',padding:{x:12,y:4}}).setOrigin(0.5).setDepth(31);
    const t2=this.add.text(GAME_W/2,GAME_H/2+14,name,{fontFamily:'monospace',fontSize:'12px',color:'#fff'}).setOrigin(0.5).setDepth(31);
    [bar,t1,t2].forEach(o=>o.setAlpha(0));
    this.tweens.add({targets:[bar,t1,t2],alpha:1,duration:350,onComplete:()=>{
      this.time.delayedCall(1800,()=>{
        this.tweens.add({targets:[bar,t1,t2],alpha:0,duration:350,
          onComplete:()=>{bar.destroy();t1.destroy();t2.destroy();this.gamePaused=false;}});
      });
    }});
  }

  _emitThrust() {
    if(!this.player?.active) return;
    const px=this.player.x, py=this.player.y+this.player.displayHeight*0.4;
    for(let i=0;i<3;i++){
      const c=[0xff8800,0xff4400,0xffcc00][Phaser.Math.Between(0,2)];
      const p=this.add.circle(px+Phaser.Math.Between(-3,3),py,Phaser.Math.Between(2,4),c).setDepth(4).setAlpha(0.85);
      this.tweens.add({targets:p,y:py+Phaser.Math.Between(10,22),alpha:0,scaleX:0,scaleY:0,
        duration:Phaser.Math.Between(100,200),onComplete:()=>p.destroy()});
    }
  }

  // ─────────────────────────────────────────────────────────
  //  UPDATE
  // ─────────────────────────────────────────────────────────
  update(time, delta) {
    if(this.gamePaused||this.playerDead) return;
    const dt = delta/1000;

    // Background seamless scroll
    this.bg.tilePositionY -= this.bgSpeed + this.waveIndex*0.04;

    // Shield ring
    if(this.shieldActive){
      this.shieldRing.setPosition(this.player.x,this.player.y).setVisible(true);
      this.shieldRing.setAlpha(0.18+Math.sin(time*0.007)*0.12);
    } else this.shieldRing.setVisible(false);

    // Wingmen visuals based on subweapon rank
    if(this.subWeaponType === 'wingman' && this.subWeaponLevel > 0){
      this.wingmanL.setPosition(this.player.x-46,this.player.y+8).setVisible(true);
      this.wingmanR.setPosition(this.player.x+46,this.player.y+8).setVisible(true);
    } else { this.wingmanL.setVisible(false); this.wingmanR.setVisible(false); }

    // Cull enemies
    this.enemies.getChildren().forEach(e=>{
      if(e.y>GAME_H+80) {
        e.destroy();
      } else if (e.active && e.eType === 's400' && this.player?.active) {
        e.rotation = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y) + Math.PI/2;
      }
    });

    // Update Power-ups (Manual Coordinate Math for Perfect 4-Wall Bounce)
    this.powerUpGroup.getChildren().forEach(p => {
      if(!p.active) return;
      p.x += p._vx * dt;
      p.y += p._vy * dt;
      if (p.x <= 11) { p.x = 11; p._vx *= -1; }
      if (p.x >= GAME_W - 11) { p.x = GAME_W - 11; p._vx *= -1; }
      if (p.y <= 11) { p.y = 11; p._vy *= -1; }
      if (p.y >= GAME_H - 11) { p.y = GAME_H - 11; p._vy *= -1; }
    });

    // Ground objects & clouds update
    this._updateGroundObjs(delta);
    this._updateClouds(delta);

    // Wave manager
    if(!this.bossActive){ this.waveTimer+=delta; if(this.waveTimer>=this.waveDelay){this.waveTimer=0;this._spawnNextWave();} }

    // Boss movement
    if(this.bossActive&&this.boss?.active) this._updateBoss(delta);

    // ════════════════════════════════════════════════════════
    //  COLLISION  –  pure coordinate math, no Phaser physics
    // ════════════════════════════════════════════════════════
    const px=this.player.x, py=this.player.y;

    // 1. Move & check PLAYER BULLETS
    for(let i=this.pBullets.length-1;i>=0;i--){
      const b=this.pBullets[i];
      if(!b||!b.scene){this.pBullets.splice(i,1);continue;}
      // Homing update for missiles
      if(b._target&&b._target.active){
        const ang=Math.atan2(b._target.y-b.y,b._target.x-b.x);
        b._vx=Math.cos(ang)*560; b._vy=Math.sin(ang)*560;
      }
      b.x+=b._vx*dt; b.y+=b._vy*dt;
      if(b.y<-30||b.x<-30||b.x>GAME_W+30){b.destroy();this.pBullets.splice(i,1);continue;}

      let hit=false;
      // vs Boss
      if(!hit&&this.bossActive&&this.boss?.active){
        const r=Math.min(this.boss.displayWidth,this.boss.displayHeight)*0.38;
        if(this._dist(b.x,b.y,this.boss.x,this.boss.y)<r+5){
          const dmg=b._type==='missile'?10:1;
          b.destroy();this.pBullets.splice(i,1);
          this.bossHP-=dmg; this.boss.hp=this.bossHP;
          RetroAudio.playHit();
          this.flashTint(this.boss,0xff0000);
          this._checkBossDeath();
          hit=true;
        }
      }
      // vs Enemies
      if(!hit){
        const enArr=this.enemies.getChildren();
        for(let j=0;j<enArr.length;j++){
          const e=enArr[j];
          if(!e.active)continue;
          const r=Math.min(e.displayWidth,e.displayHeight)*0.42;
          if(this._dist(b.x,b.y,e.x,e.y)<r+5){
            const dmg=b._type==='missile'?8:1;
            b.destroy();this.pBullets.splice(i,1);
            e.hp-=dmg; this.flashTint(e,0xffffff);
            RetroAudio.playHit();
            if(e.hp<=0)this.destroyEnemy(e,true);
            hit=true;break;
          }
        }
      }
      // vs Ground objects (炮台/Tank/Depot)
      if(!hit){
        for(let j=this.groundObjs.length-1;j>=0;j--){
          const go=this.groundObjs[j];
          if(!go||!go.scene){this.groundObjs.splice(j,1);continue;}
          if(this._dist(b.x,b.y,go.x,go.y)<20){
            const dmg=b._type==='missile'?8:1;
            b.destroy();this.pBullets.splice(i,1);
            go._hp-=dmg;
            RetroAudio.playHit();
            this.flashTint(go,0xffffff);
            if(go._hp<=0){
              // Depot chain-explosion
              if(go._type==='depot_obj'){
                for(let k=0;k<4;k++)this.time.delayedCall(k*120,()=>{
                  this._explode(go.x+Phaser.Math.Between(-22,22),go.y+Phaser.Math.Between(-12,12),1.1);
                });
              }
              this._explode(go.x,go.y,1.4);
              const pts=go._points*this.combo;
              this._scoreAdd(pts);
              this.showFloatingText(go.x,go.y-15,`+${pts}`,0xffaa00);
              if(Math.random()<0.08)this._spawnPU(go.x,go.y-10);
              go.destroy();this.groundObjs.splice(j,1);
            }
            hit=true;break;
          }
        }
      }
    }

    // 2. Move & check ENEMY BULLETS  ← enemy bullets vs player
    if(!this.playerDead&&!this.isInvincible){
      for(let i=this.eBullets.length-1;i>=0;i--){
        const b=this.eBullets[i];
        if(!b||!b.scene){this.eBullets.splice(i,1);continue;}
        b.x+=b._vx*dt; b.y+=b._vy*dt;
        if(b.y>GAME_H+30||b.y<-30||b.x<-30||b.x>GAME_W+30){b.destroy();this.eBullets.splice(i,1);continue;}
        // HIT CHECK vs player (16px radius hitbox)
        if(this._dist(b.x,b.y,px,py)<16){
          b.destroy();this.eBullets.splice(i,1);
          this._damagePlayer(false);
          continue;
        }
      }
    } else {
      // still move but don't check collision while invincible/dead
      for(let i=this.eBullets.length-1;i>=0;i--){
        const b=this.eBullets[i];
        if(!b||!b.scene){this.eBullets.splice(i,1);continue;}
        b.x+=b._vx*dt; b.y+=b._vy*dt;
        if(b.y>GAME_H+30||b.y<-30||b.x<-30||b.x>GAME_W+30){b.destroy();this.eBullets.splice(i,1);}
      }
    }

    // 3. Enemy BODY vs player
    if(!this.playerDead&&!this.isInvincible){
      const enArr=this.enemies.getChildren();
      for(let j=0;j<enArr.length;j++){
        const e=enArr[j]; if(!e.active)continue;
        const r=(e.displayWidth+this.player.displayWidth)*0.22;
        if(this._dist(e.x,e.y,px,py)<r){this.destroyEnemy(e,false);this._damagePlayer(true);break;}
      }
      // Boss body vs player
      if(this.bossActive&&this.boss?.active){
        const r=(this.boss.displayWidth+this.player.displayWidth)*0.28;
        if(this._dist(this.boss.x,this.boss.y,px,py)<r)this._damagePlayer(true);
      }
    }

    // 4. Power-ups vs player
    const puArr=this.powerUpGroup.getChildren();
    for(let j=0;j<puArr.length;j++){
      const pu=puArr[j]; if(!pu.active)continue;
      if(this._dist(pu.x,pu.y,px,py)<24){this.collectPowerUp(pu);break;}
    }

    // Registry sync
    this.registry.set('score',this.score);this.registry.set('combo',this.combo);
    this.registry.set('energy',Math.floor(this.energy));this.registry.set('weapon',this.weaponLevel);
    this.registry.set('subWpn', this.subWeaponType ? (this.subWeaponType==='missile'?'🚀 MSL': '✈ WGM') + ' LV.' + this.subWeaponLevel : '---');
    this.registry.set('bombs',this.bombCount);
    if(this.boss?.active){this.registry.set('bossHP',this.bossHP);this.registry.set('bossMaxHP',this.bossMaxHPFull);}
  }

  // Distance helper
  _dist(ax,ay,bx,by){const dx=ax-bx,dy=ay-by;return Math.sqrt(dx*dx+dy*dy);}

  // ─────────────────────────────────────────────────────────
  //  LAYER 2 &3: Procedural textures
  // ─────────────────────────────────────────────────────────
  _makeGroundTextures(){
    // Ground object & cloud textures are loaded via BootScene from AI images.
    // Only keep any procedural textures not covered by AI images here.
    // (Currently nothing needed – aa_gun_img/tank_obj_img/depot_obj_img/cloud_img all loaded)
  }

  // ─────────────────────────────────────────────────────────
  //  LAYER 2: Ground objects (炮台 / Tank / Depot)
  // ─────────────────────────────────────────────────────────
  _spawnGroundObj(){
    if(this.gamePaused||this.bossActive||this.playerDead)return;
    // Stage 1 is the sea stage -> exclusively spawn ships
    let types;
    if (this.stageIndex === 1) {
      types = [['ship','ship_obj_img']];
    } else {
      types = [['aa_gun','aa_gun_img'],['tank','tank_obj_img'],['depot','depot_obj_img']];
    }
    const [type,texKey]=Phaser.Utils.Array.GetRandom(types);
    const x=Phaser.Math.Between(22,GAME_W-22);
    const go=this.add.image(x,-60,texKey).setDepth(1).setFlipY(true);
    // scale sprites to reasonable game size (tank and ship shrank 50%)
    const sizes={aa_gun:48, tank:26, depot:56, ship:35};
    const s=sizes[type]||48;
    const tw=this.textures.get(texKey).getSourceImage().width;
    go.setScale(s/tw);
    go._type=type;
    go._hp   = type==='aa_gun'?3:type==='tank'?5:type==='ship'?12:2;
    go._points= type==='aa_gun'?200:type==='tank'?350:type==='ship'?800:150;
    go._fireTimer   = Phaser.Math.Between(1500,3000);
    go._fireInterval= (type==='aa_gun'||type==='ship')?2200:3500;
    this.groundObjs.push(go);
    // Completely static ground presence (no horizontal drifting)
    if(type==='tank'||type==='ship'){
      // They will rigidly match the background scroll speed
    }
    return go;
  }

  _updateGroundObjs(delta){
    if(this.gamePaused)return;
    const dt=delta/1000;
    const spd=(this.bgSpeed+this.waveIndex*0.04)*62; // match terrain scroll in px/s
    for(let i=this.groundObjs.length-1;i>=0;i--){
      const go=this.groundObjs[i];
      if(!go||!go.scene){this.groundObjs.splice(i,1);continue;}
      go.y+=spd*dt;
      if(go.y>GAME_H+70){go.destroy();this.groundObjs.splice(i,1);continue;}
      // Ground fire at player
      if(!this.playerDead&&go._type!=='depot'){
        go._fireTimer-=delta;
        if(go._fireTimer<=0){
          go._fireTimer=go._fireInterval+Phaser.Math.Between(-300,300);
          const ang=Math.atan2(this.player.y-go.y,this.player.x-go.x)*180/Math.PI;
          this._makeEBullet(go.x,go.y,ang,170); // slower ground fire
        }
      }
    }
    // Spawn timer
    this._groundObjTimer-=delta;
    if(!this.bossActive&&this._groundObjTimer<=0){
      this._groundObjTimer=this._groundObjInterval+Phaser.Math.Between(-2000,2000);
      const cnt=Phaser.Math.Between(1,3);
      for(let i=0;i<cnt;i++)this.time.delayedCall(i*700,()=>this._spawnGroundObj());
    }
  }

  // ─────────────────────────────────────────────────────────
  //  LAYER 3: Clouds
  // ─────────────────────────────────────────────────────────
  _spawnInitialClouds(){
    for(let i=0;i<5;i++){
      this._spawnCloud(Phaser.Math.Between(0,GAME_H));
    }
  }
  _spawnCloud(startY=-50){
    const x=Phaser.Math.Between(-30,GAME_W+30);
    const scale=Phaser.Math.FloatBetween(0.35,1.0);
    const spd=Phaser.Math.FloatBetween(50,130);
    const alpha=Phaser.Math.FloatBetween(0.3,0.75);
    const c=this.add.image(x,startY,'cloud_img').setScale(scale).setDepth(3).setAlpha(alpha);
    c._spd=spd;
    this.clouds.push(c);
  }
  _updateClouds(delta){
    if(this.gamePaused)return;
    const dt=delta/1000;
    for(let i=this.clouds.length-1;i>=0;i--){
      const c=this.clouds[i];
      if(!c||!c.scene){this.clouds.splice(i,1);continue;}
      c.y+=c._spd*dt;
      if(c.y>GAME_H+80){c.destroy();this.clouds.splice(i,1);}
    }
    this._cloudTimer-=delta;
    if(this._cloudTimer<=0){
      this._cloudTimer=Phaser.Math.Between(2500,5500);
      if(this.clouds.length<7)this._spawnCloud();
    }
  }



  // ─────────────────────────────────────────────────────────
  //  TOUCH CONTROLS
  // ─────────────────────────────────────────────────────────
  onPointerDown(p){
    const cnt=this.input.manager.pointers.filter(pt=>pt.isDown).length;
    if(cnt>=2){if(!this._twoFingerBombFired){this._twoFingerBombFired=true;this._useBomb();}return;}
    this._twoFingerBombFired=false;this.dragActive=true;this.primaryPointerId=p.id;
    this.touchStartX=p.x;this.touchStartY=p.y;this.playerStartX=this.player.x;this.playerStartY=this.player.y;
  }
  onPointerMove(p){
    if(!this.dragActive||this.playerDead||p.id!==this.primaryPointerId)return;
    const hw=this.player.displayWidth/2,hh=this.player.displayHeight/2;
    this.player.setPosition(
      Phaser.Math.Clamp(this.playerStartX+p.x-this.touchStartX,hw,GAME_W-hw),
      Phaser.Math.Clamp(this.playerStartY+p.y-this.touchStartY,hh,GAME_H-hh)
    );
  }
  onPointerUp(p){
    const still=this.input.manager.pointers.filter(pt=>pt.isDown).length;
    if(still===0){this.dragActive=false;this._twoFingerBombFired=false;}
    if(p.id===this.primaryPointerId)this.dragActive=false;
  }

  // ─────────────────────────────────────────────────────────
  //  FIRING  – plain this.add.image, stored in pBullets[]
  // ─────────────────────────────────────────────────────────
  _makePBullet(x,y,vx,vy,type){
    const b=this.add.image(x,y,type==='missile'?'mb':'pb').setDepth(6);
    b._vx=vx;b._vy=vy;b._type=type||'bullet';b._target=null;
    this.pBullets.push(b);return b;
  }
  _makeEBullet(x,y,angleDeg,speed,scale=1){
    const a=angleDeg*Math.PI/180;
    const b=this.add.image(x,y,'eb').setDepth(6).setScale(scale);
    b._vx=Math.cos(a)*speed;b._vy=Math.sin(a)*speed;
    this.eBullets.push(b);return b;
  }

  _firePlayer(){
    if(this.playerDead)return;
    RetroAudio.playShoot();
    const px=this.player.x,py=this.player.y-this.player.displayHeight*0.44;
    const s=(ox=0, vx=0)=>this._makePBullet(px+ox,py,vx,-750,'bullet');
    const lv=Math.min(this.weaponLevel,7);
    if(lv>=1)s(0);
    if(lv>=2){s(-10);s(10);}
    if(lv>=3){s(-18);s(18);}
    if(lv>=4){s(-28);s(28);}
    if(lv>=5){s(-38);s(38);}
    if(lv>=6){s(-10, -200);s(10, 200);}
    if(lv>=7){s(-20, -400);s(20, 400);}
    
    // Subweapon: Wingman fires with primary
    if(this.subWeaponType === 'wingman' && this.subWeaponLevel > 0){
      const wl = this.subWeaponLevel;
      [this.wingmanL,this.wingmanR].forEach(w=>{
        if(!w.visible)return;
        this._makePBullet(w.x,w.y-16,0,-700,'bullet');
        if(wl >= 2) { this._makePBullet(w.x-8,w.y-12,-150,-680,'bullet'); this._makePBullet(w.x+8,w.y-12,150,-680,'bullet'); }
        if(wl >= 3) { this._makePBullet(w.x-16,w.y-8,-300,-650,'bullet'); this._makePBullet(w.x+16,w.y-8,300,-650,'bullet'); }
      });
    }
  }

  _fireMissile(){
    if(this.playerDead || this.subWeaponType !== 'missile' || this.subWeaponLevel <= 0) return;
    const targets = this.enemies.getChildren().filter(e=>e.active).concat(this.boss?.active ? [this.boss] : []);
    const fire = (ox) => {
        const b=this._makePBullet(this.player.x+ox,this.player.y-30,0,-650,'missile');
        if(targets.length) b._target = Phaser.Utils.Array.GetRandom(targets);
    };
    fire(0);
    if(this.subWeaponLevel >= 2) { fire(-25); fire(25); }
    if(this.subWeaponLevel >= 3) { fire(-50); fire(50); }
  }

  // ─────────────────────────────────────────────────────────
  //  WAVES & ENEMIES
  // ─────────────────────────────────────────────────────────
  _spawnNextWave(){
    if(this.waveIndex>=WAVES.length) {
      // Loop the entire game for infinite play, increasing difficulty
      this.waveIndex = 0;
      this.diffMult += 0.2; 
    }
    const wave=WAVES[this.waveIndex];this.waveDelay=wave.delay;this.waveIndex++;
    if(wave.stage!==undefined&&wave.stage!==this.stageIndex)this._transitionStage(wave.stage);
    if(wave.type==='boss'){this._spawnBoss(wave);return;}
    const cnt=Math.ceil((wave.count||3)*this.diffMult*1.5);
    for(let i=0;i<cnt;i++)this.time.delayedCall(i*(wave.spawnGap||350),()=>{
      if(this.scene.isActive('GameScene'))this._spawnEnemy(wave.enemy||'ka52',wave.pattern||'line',i,cnt);
    });
    // Spawn ambient powerup INSIDE bounds so it bounces properly
    if(Math.random()<0.1)this.time.delayedCall(2200,()=>this._spawnPU(Phaser.Math.Between(40,GAME_W-40), 20));
  }

  _ambientSpawn(){
    if(this.gamePaused||this.bossActive||this.playerDead)return;
    const types=['ka52','shahed'];
    const cnt=Phaser.Math.Between(1,3);
    for(let i=0;i<cnt;i++)this.time.delayedCall(i*500,()=>{
      if(this.scene.isActive('GameScene'))this._spawnEnemy(Phaser.Utils.Array.GetRandom(types),'random',0,1);
    });
  }

  _spawnEnemy(type,pattern,idx,total){
    const data=ENEMY_DATA[type]||ENEMY_DATA.ka52;
    let x,sy=-55;
    if(pattern==='line')x=(GAME_W/(total+1))*(idx+1);
    else if(pattern==='vshape'){x=GAME_W/2+(idx-total/2)*55;sy=-55-Math.abs(idx-total/2)*28;}
    else x=Phaser.Math.Between(30,GAME_W-30);
    const texW=this.textures.get(data.texture||'enemy_ka52').getSourceImage().width;
    const sc=(data.sizePx||44)/texW;
    const e=this.physics.add.image(x,sy,data.texture||'enemy_ka52').setScale(sc).setDepth(5).setFlipY(true);
    e.body.allowGravity=false;e.body.setVelocityY(data.speed||120);
    e.hp=Math.ceil((data.hp||2)*this.diffMult);e.maxHp=e.hp;
    e.points=data.points||100;e.eType=type;e.dropChance=0.25;
    if(data.zigzag)this.tweens.add({targets:e,x:x+(idx%2===0?55:-55),duration:1100,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    if(type==='shahed'){
      this.time.delayedCall(600,()=>{
        if(!e.active||!this.player?.active)return;
        const ang=Math.atan2(this.player.y-e.y,this.player.x-e.x)*180/Math.PI;
        this.physics.velocityFromAngle(ang,240,e.body.velocity);
      });
    } else {
      const fireDelayMult = this.difficulty === 'hard' ? 0.25 : 0.5;
      const fd = (data.fireDelay||2500) * fireDelayMult;
      this.time.addEvent({delay:fd+Phaser.Math.Between(0,600),callback:()=>this._enemyFire(e,type),callbackScope:this,loop:true,startAt:Phaser.Math.Between(200,800)});
    }
    this.enemies.add(e);
  }

  _enemyFire(enemy,type){
    if(!enemy?.active||this.playerDead)return;
    const data=ENEMY_DATA[type]||ENEMY_DATA.ka52;
    const spd=(data.bulletSpeed||260)*this.diffMult;
    const ex=enemy.x,ey=enemy.y+enemy.displayHeight*0.38;
    switch(data.bulletPattern||'straight'){
      case 'straight':this._makeEBullet(ex,ey,90,spd);break;
      case 'spread3':[-14,0,14].forEach(o=>this._makeEBullet(ex,ey,90+o,spd));break;
      case 'aimed':
      case 'spiral':{
        const a=Math.atan2(this.player.y-ey,this.player.x-ex)*180/Math.PI;
        if(data.bulletPattern==='spiral')[-18,0,18].forEach(o=>this._makeEBullet(ex,ey,a+o,spd));
        else this._makeEBullet(ex,ey,a,spd);
        break;
      }
    }
  }

  // ─────────────────────────────────────────────────────────
  //  BOSS
  // ─────────────────────────────────────────────────────────
  _spawnBoss(wave){
    this.bossActive=true;this.registry.set('bossActive',true);
    this.bossWaveData=wave;
    const pd = wave.phases ? wave.phaseData[0] : wave;
    this._bossWarn(pd.name||'⚠ BOSS ⚠');
    this.time.delayedCall(2200,()=>{
      this.cameras.main.flash(500,255,0,0);
      const hp=Math.ceil(pd.hp*this.diffMult);
      this.bossHP=hp;this.bossMaxHPFull=hp;this.bossPhase=1;this.bossMovDir=1;this.bossFireTimer=0;
      const bTexW=this.textures.get(pd.texture||'boss_tu22m').getSourceImage().width;
      this.boss=this.physics.add.image(GAME_W/2,-130,pd.texture||'boss_tu22m')
        .setScale((pd.sizePx||110)/bTexW).setDepth(5).setFlipY(true);
      this.boss.body.allowGravity=false;this.boss.hp=hp;
      this.tweens.add({targets:this.boss,y:GAME_H*0.2,duration:1800,ease:'Back.easeOut'});
    });
  }
  _bossWarn(name){
    const bar=this.add.rectangle(GAME_W/2,GAME_H*0.44,GAME_W,52,0x220000,0.95).setDepth(30);
    const lbl=this.add.text(GAME_W/2,GAME_H*0.44,name,{fontFamily:'"Press Start 2P", monospace',fontSize:'8px',color:'#ff4444',stroke:'#000',strokeThickness:3}).setOrigin(0.5).setDepth(31);
    this.tweens.add({targets:[bar,lbl],alpha:{from:0,to:1},duration:200,yoyo:true,repeat:5,onComplete:()=>{bar.destroy();lbl.destroy();}});
  }
  _updateBoss(delta){
    if(!this.boss?.active)return;
    this.bossFireTimer+=delta;
    
    // speed modifiers base on phase
    let spd = 1.2;
    if(this.bossWaveData.phases) {
        spd += (this.bossPhase-1)*0.7; 
    }
    this.boss.x+=this.bossMovDir*spd;
    if(this.boss.x>GAME_W-70||this.boss.x<70)this.bossMovDir*=-1;
    
    const iv=Math.max(200, 1100 - (this.bossPhase-1)*300 - (this.stageIndex*80));
    if(this.bossFireTimer>=iv){this.bossFireTimer=0;this._bossFire();}
  }
  _bossFire(){
    if(!this.boss?.active)return;
    const bx=this.boss.x,by=this.boss.y+this.boss.displayHeight*0.4;
    
    if(this.stageIndex===1 && this.bossPhase===2) { // Nuclear submarine
       // 1. Slow, brutal straight laser beam barrage downward
       for(let i=-5;i<=5;i+=2)this._makeEBullet(bx+i*6,by,90, 520, 1.8);
       // 2. Slow aimed spread shots
       const a=Math.atan2(this.player.y-by,this.player.x-bx)*180/Math.PI;
       [-20,0,20].forEach(o=>this._makeEBullet(bx,by,a+o,260,1.3));
    } else if(this.stageIndex===2 && this.bossPhase===2) { // Fortress
       for(let i=0;i<10;i++)this._makeEBullet(bx,by,(i/10)*360 + this.boss.x,215,1.3);
       for(let i=-2;i<=2;i++)this._makeEBullet(bx+i*50,by,90, 300, 1.2);
    } else if(this.stageIndex===2 && this.bossPhase===3) { // Core
       for(let i=0;i<12;i++)this._makeEBullet(bx,by,(i/12)*360 - this.boss.x,315,1.5);
       const a=Math.atan2(this.player.y-by,this.player.x-bx)*180/Math.PI;
       [-15,0,15].forEach(o=>this._makeEBullet(bx,by,a+o,335,1.3));
    } else { // Generic patterns Phase 1
      if(this.bossPhase===1){
        for(let i=-2;i<=2;i++)this._makeEBullet(bx,by,90+i*16,290+i*8,1.3);
      } else {
        for(let i=0;i<8;i++)this._makeEBullet(bx,by,(i/8)*360,215,1.3);
        const a=Math.atan2(this.player.y-by,this.player.x-bx)*180/Math.PI;
        [-10,10].forEach(o=>this._makeEBullet(bx,by,a+o,335,1.3));
      }
    }
  }

  _checkBossDeath() {
    if(this.bossHP<=0){
      if(this.bossWaveData.phases && this.bossPhase < this.bossWaveData.phases) {
        this.bossPhase++;
        const pd = this.bossWaveData.phaseData[this.bossPhase-1];
        this.bossHP=Math.ceil(pd.hp*this.diffMult); this.bossMaxHPFull=this.bossHP;
        this.boss.setTexture(pd.texture);
        const bTexW=this.textures.get(pd.texture).getSourceImage().width;
        this.boss.setScale((pd.sizePx||110)/bTexW);
        this.cameras.main.shake(600,0.02);
        this._bossWarn(pd.name);
        this._explode(this.boss.x, this.boss.y, 2.0);
      } else {
        this._defeatBoss();
      }
    }
  }
  _defeatBoss(){
    if(!this.boss)return;
    this._scoreAdd(5000+1000*this.stageIndex);
    this.cameras.main.shake(750,0.026);
    this.showFloatingText(this.boss.x,this.boss.y-30,'BOSS DOWN!',0xffd700);
    for(let i=0;i<14;i++)this.time.delayedCall(i*110,()=>{
      if(this.boss)this._explode(this.boss.x+Phaser.Math.Between(-50,50),this.boss.y+Phaser.Math.Between(-35,35),2.2);
    });
    this.time.delayedCall(1700,()=>{
      this.boss?.destroy();this.boss=null;this.bossActive=false;this.registry.set('bossActive',false);
      
      // Clear ALL remaining enemies and enemy bullets precisely upon boss victory
      this.enemies.getChildren().slice().forEach(e=>this.destroyEnemy(e,false));
      this.eBullets.forEach(b=>{if(b.scene)b.destroy();});this.eBullets=[];
      
      // Spawn 2 powerups randomly
      for(let i=0;i<2;i++){
        this.time.delayedCall(i*120, () => {
          this._spawnPU(Phaser.Math.Between(40, GAME_W-40), Phaser.Math.Between(80, GAME_H*0.4));
        });
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  //  PLAYER DAMAGE
  // ─────────────────────────────────────────────────────────
  _damagePlayer(bodily=false){
    if(this.isInvincible||this.playerDead)return;
    if(this.shieldActive){
      this.shieldActive=false;this._explode(this.player.x,this.player.y,0.7);
      this.flashTint(this.player,0x00ccff);
      this.showFloatingText(this.player.x,this.player.y-35,'SHIELD BREAK!',0x00ccff);
      this.isInvincible=true;this.time.delayedCall(800,()=>this.isInvincible=false);
      return;
    }
    this.energy-=bodily?28:20;
    RetroAudio.playExplosion();
    this.cameras.main.shake(200,0.01);this.flashScreen(0xff0000,0.32);this.flashTint(this.player,0xff4400);
    this.combo=1;this.isInvincible=true;this.time.delayedCall(600,()=>this.isInvincible=false);
    if(this.energy<=0){
      this.energy=0;this.lives--;this.registry.set('lives',this.lives);
      if(this.lives<=0)this._gameOver();else this._respawn();
    }
    this.registry.set('energy',Math.floor(this.energy));
  }

  destroyEnemy(e,score=true){
    if(!e.active)return;
    RetroAudio.playExplosion();
    this._explode(e.x,e.y);
    if(score){
      const pts=Math.round(e.points*this.combo);
      this._scoreAdd(pts);this.combo=Math.min(this.combo+1,8);this.killCount++;
      this.showFloatingText(e.x,e.y-12,`+${pts}`,this.combo>3?0xff8800:0xffffff);
      if(this.killCount%30===0)this._spawnPU(e.x,e.y-20);
    }
    if(score && Math.random()<e.dropChance)this._spawnPU(e.x,e.y);
    e.destroy();
  }

  // ─────────────────────────────────────────────────────────
  //  POWER-UPS
  // ─────────────────────────────────────────────────────────
  _spawnPU(x,y){
    const types=['gun','missile','bomb','shield','emp','health','wingman'];
    const type=Phaser.Utils.Array.GetRandom(types);
    const cols={gun:0xffd700,missile:0x00ff88,bomb:0xff4400,shield:0x00aaff,emp:0xcc00ff,health:0x00ff44,wingman:0x88ccff};
    
    // Create soft underglow for the powerup
    const glow=this.add.circle(x, y, 16, cols[type], 0.35).setDepth(6);
    this.tweens.add({targets:glow, scale:1.3, alpha:0.1, duration:600, yoyo:true, repeat:-1});

    // Create the dedicated custom graphic item
    const p=this.add.image(x,y,'powerup_'+type).setDepth(7);
    this.physics.add.existing(p);
    
    // Manual Coordinate Math properties (so it flawlessly bounces every frame)
    p._vx = Phaser.Utils.Array.GetRandom([-160, -120, -90, 90, 120, 160]);
    p._vy = Phaser.Math.Between(80, 150);
    p.powerType=type;
    this.powerUpGroup.add(p);
    
    // Sync UI glow to physics body
    this.time.addEvent({delay:25,loop:true,callback:()=>{
      if(!p.active){glow.destroy();return;}
      glow.setPosition(p.x,p.y);
    }});
    
    // Item lifetime: Blinks after 10s, destroys at 13s to prevent clutter
    this.time.delayedCall(10000, () => {
      if(!p.active) return;
      this.tweens.add({targets:[p,glow], alpha:0.1, duration:150, yoyo:true, repeat:-1});
      this.time.delayedCall(3000, () => {
        if(p.active) p.destroy();
      });
    });
  }

  collectPowerUp(pu){
    if(!pu.active)return;const type=pu.powerType;pu.destroy();
    RetroAudio.playPowerup();
    this.flashScreen(0xffffff,0.15);this.cameras.main.shake(80,0.003);
    const px=this.player.x,py=this.player.y;
    switch(type){
      case 'gun':this.weaponLevel=Math.min(this.weaponLevel+1,7);this.showFloatingText(px,py-40,`WPN LV.${this.weaponLevel}!`,0xffd700);break;
      case 'missile':
        if(this.subWeaponType !== 'missile'){ this.subWeaponType = 'missile'; this.subWeaponLevel = 1; }
        else { this.subWeaponLevel = Math.min(this.subWeaponLevel+1, 3); }
        this.showFloatingText(px,py-40,`🚀 MSL LV.${this.subWeaponLevel}`,0x00ff88);
        break;
      case 'wingman':
        if(this.subWeaponType !== 'wingman'){ this.subWeaponType = 'wingman'; this.subWeaponLevel = 1; }
        else { this.subWeaponLevel = Math.min(this.subWeaponLevel+1, 3); }
        this.showFloatingText(px,py-40,`✈ WGM LV.${this.subWeaponLevel}`,0x88ccff);
        break;
      case 'bomb':this.bombCount=Math.min(this.bombCount+1,5);this.showFloatingText(px,py-40,`💣 BOMB x${this.bombCount}`,0xff8800);break;
      case 'shield':this.shieldActive=true;this.showFloatingText(px,py-40,'🛡 SHIELD ON',0x00aaff);break;
      case 'emp':
        this.showFloatingText(GAME_W/2,GAME_H/2,'⚡ EMP!',0xcc00ff);this.flashScreen(0xcc00ff,0.35);
        this.enemies.getChildren().forEach(e=>{e.body.setVelocity(0,0);this.tweens.add({targets:e,alpha:0.3,duration:180,yoyo:true,repeat:10});this.time.delayedCall(2400,()=>{if(e.active)e.body.setVelocityY(110);});});
        this.eBullets.forEach(b=>{if(b.scene)b.destroy();});this.eBullets=[];break;
      case 'health':this.energy=Math.min(this.energy+30,this.maxEnergy);this.showFloatingText(px,py-40,'+30 ENERGY',0x00ff44);break;
    }
  }

  // ─────────────────────────────────────────────────────────
  //  BOMB
  // ─────────────────────────────────────────────────────────
  _useBomb(){
    if(this.playerDead||this.gamePaused)return;
    if(this.bombCount<=0){this.showFloatingText(GAME_W/2,GAME_H/2-20,'NO BOMBS!',0xff4444);return;}
    this.bombCount--;
    this.showFloatingText(GAME_W/2,GAME_H/2,'💥 BOMB!',0xff8800);
    this.flashScreen(0xff8800,0.70);this.cameras.main.shake(500,0.020);
    this.enemies.getChildren().slice().forEach(e=>{this._explode(e.x,e.y,1.4);this.destroyEnemy(e,true);});
    this.eBullets.forEach(b=>{if(b.scene)b.destroy();});this.eBullets=[];
    // Also destroy ground objects
    this.groundObjs.slice().forEach(go=>{
      if(!go||!go.scene)return;
      this._explode(go.x,go.y,1.2);
      this._scoreAdd(go._points);
      this.showFloatingText(go.x,go.y-10,`+${go._points}`,0xffaa00);
      go.destroy();
    });
    this.groundObjs=[];
    if(this.bossActive&&this.boss?.active){
      const dmg=Math.floor(this.bossMaxHPFull*0.18);
      this.bossHP=Math.max(0,this.bossHP-dmg);this.boss.hp=this.bossHP;
      this.flashTint(this.boss,0xff8800);this.showFloatingText(this.boss.x,this.boss.y-30,`-${dmg}`,0xff8800);
      this._checkBossDeath();
    }
  }


  // ─────────────────────────────────────────────────────────
  //  HELPERS
  // ─────────────────────────────────────────────────────────
  _explode(x,y,s=1){
    const cols=[0xff8800,0xff4400,0xffcc00,0xffffff,0xff6600];
    for(let i=0;i<10;i++){
      const c=cols[Phaser.Math.Between(0,cols.length-1)];
      const p=this.add.circle(x,y,Phaser.Math.Between(3,9)*s,c).setDepth(10);
      const ang=Phaser.Math.Between(0,360),dst=Phaser.Math.Between(18,65)*s;
      this.tweens.add({targets:p,x:x+Math.cos(ang*Math.PI/180)*dst,y:y+Math.sin(ang*Math.PI/180)*dst,alpha:0,scaleX:0,scaleY:0,duration:Phaser.Math.Between(270,570),onComplete:()=>p.destroy()});
    }
    const f=this.add.circle(x,y,20*s,0xffffff).setDepth(11);
    this.tweens.add({targets:f,alpha:0,scaleX:2.5,scaleY:2.5,duration:220,onComplete:()=>f.destroy()});
  }
  flashTint(o,c){if(!o?.active)return;o.setTint(c);this.time.delayedCall(130,()=>{if(o?.active)o.clearTint();});}
  flashScreen(c,a){
    this.screenFlash.setFillStyle(c,a);this.tweens.killTweensOf(this.screenFlash);
    this.tweens.add({targets:this.screenFlash,alpha:0,duration:320,onComplete:()=>this.screenFlash.setAlpha(0)});
  }
  showFloatingText(x,y,msg,color=0xffffff){
    const hex='#'+color.toString(16).padStart(6,'0');
    const t=this.add.text(x,y,msg,{fontFamily:'monospace',fontSize:'13px',color:hex,stroke:'#000',strokeThickness:3}).setOrigin(0.5).setDepth(18);
    this.tweens.add({targets:t,y:y-55,alpha:0,duration:1300,ease:'Cubic.easeOut',onComplete:()=>t.destroy()});
  }
  _scoreAdd(pts){
    this.score+=Math.round(pts);
    const hi=parseInt(localStorage.getItem('frontline_hiscore')||'0');
    if(this.score>hi)localStorage.setItem('frontline_hiscore',this.score.toString());
  }
  _respawn(){
    this.playerDead=true;this.isInvincible=true;
    this.energy=this.maxEnergy;this.weaponLevel=Math.max(1,this.weaponLevel-1);
    this.wingmanActive=false;this.shieldActive=false;this.player.setAlpha(0);
    this.time.delayedCall(1500,()=>{
      this.player.setPosition(GAME_W/2,GAME_H*0.82).setAlpha(1);this.playerDead=false;
      this.tweens.add({targets:this.player,alpha:0.3,duration:100,yoyo:true,repeat:22,
        onComplete:()=>{this.player.setAlpha(1);this.isInvincible=false;}});
    });
  }
  _gameOver(){
    this.playerDead=true;
    RetroAudio.stopBGM();this.gamePaused=true;
    // Remove all input listeners so they don't interfere with GameOverScene
    this.input.keyboard.removeAllListeners();
    this.input.removeAllListeners();
    this._explode(this.player.x,this.player.y,2.8);this.player.setVisible(false);
    this.cameras.main.shake(900,0.022);
    this.time.delayedCall(2200,()=>{
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('GameOverScene',{score:this.score,difficulty:this.difficulty});
    });
  }
}
