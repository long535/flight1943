// ══════════════════════════════════════════════════════════
//  levels.js  –  Wave definitions
//  Rule: each stage must run AT LEAST 90 seconds before boss.
//  delay = ms until NEXT wave spawns after current wave clears.
// ══════════════════════════════════════════════════════════
export const WAVES = [

  // ─────────────────────────────────────────────────────────
  //  STAGE 0  —  Donbas Plains  (bg_level1)
  //  Ground stage: helicopters, drones, strafing jets
  // ─────────────────────────────────────────────────────────
  { stage:0, delay:10000, enemy:'ka52',   count:8,  pattern:'line',   spawnGap:500 },
  { stage:0, delay:11000, enemy:'shahed', count:12, pattern:'random', spawnGap:280 },
  { stage:0, delay:12000, enemy:'mig29',  count:4,  pattern:'line',   spawnGap:350,
    warning: true },
  { stage:0, delay:13000, enemy:'mi24',   count:6,  pattern:'vshape', spawnGap:600 },
  { stage:0, delay:12000, enemy:'drone',  count:18, pattern:'random', spawnGap:160,
    warning: true },
  { stage:0, delay:13000, enemy:'ka52',   count:14, pattern:'vshape', spawnGap:380 },
  { stage:0, delay:12000, enemy:'mig29',  count:6,  pattern:'vshape', spawnGap:300 },
  { stage:0, delay:11000, enemy:'su34',   count:9,  pattern:'line',   spawnGap:420,
    warning: true },
  // Boss
  { stage:0, delay:5000,  type:'boss',
    texture:'boss_tu22m', hp:160, sizePx:110,
    name:'⚠  TU-22M BACKFIRE  ⚠',
    bossType: 'tu22m' },

  // ─────────────────────────────────────────────────────────
  //  STAGE 1  —  Black Sea  (bg_level2)
  //  Sea stage: ships, bombers, subs
  // ─────────────────────────────────────────────────────────
  { stage:1, delay:11000, enemy:'su34',   count:9,  pattern:'line',   spawnGap:420 },
  { stage:1, delay:12000, enemy:'shahed', count:20, pattern:'random', spawnGap:200,
    warning: true },
  { stage:1, delay:12000, enemy:'bomber', count:2,  pattern:'random', spawnGap:2000,
    warning: true },
  { stage:1, delay:13000, enemy:'mi24',   count:9,  pattern:'vshape', spawnGap:420 },
  { stage:1, delay:12000, enemy:'mig29',  count:8,  pattern:'line',   spawnGap:320,
    warning: true },
  { stage:1, delay:13000, enemy:'s400',   count:6,  pattern:'line',   spawnGap:650 },
  { stage:1, delay:12000, enemy:'drone',  count:24, pattern:'random', spawnGap:140,
    warning: true },
  // Boss
  { stage:1, delay:5000,  type:'boss',
    phases: 2,
    phaseData: [
      { texture:'boss_tu22m', hp:220, sizePx:130, name:'⚠  MOSKVA CRUISER  ⚠',   bossType:'moskva' },
      { texture:'boss_submarine', hp:280, sizePx:170, name:'⚠  K-329 BELGOROD  ⚠', bossType:'belgorod' }
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  STAGE 2  —  Kharkiv Ruins  (bg_level3)
  //  Urban hell: maximum enemy density, all types
  // ─────────────────────────────────────────────────────────
  { stage:2, delay:11000, enemy:'mi24',   count:12, pattern:'vshape', spawnGap:380 },
  { stage:2, delay:12000, enemy:'s400',   count:9,  pattern:'line',   spawnGap:560 },
  { stage:2, delay:11000, enemy:'bomber', count:3,  pattern:'random', spawnGap:1600,
    warning: true },
  { stage:2, delay:12000, enemy:'drone',  count:36, pattern:'random', spawnGap:110,
    warning: true },
  { stage:2, delay:11000, enemy:'mig29',  count:10, pattern:'vshape', spawnGap:260,
    warning: true },
  { stage:2, delay:12000, enemy:'su34',   count:15, pattern:'vshape', spawnGap:240 },
  { stage:2, delay:11000, enemy:'mi24',   count:18, pattern:'line',   spawnGap:300 },
  // Final wave: bullet hell mix
  { stage:2, delay:10000, enemy:'shahed', count:30, pattern:'random', spawnGap:100,
    warning: true },
  // Final Boss
  { stage:2, delay:5000,  type:'boss',
    phases: 3,
    phaseData: [
      { texture:'boss_tu22m',    hp:280, sizePx:150, name:'⚠  TARGET: GROUND SILO  ⚠', bossType:'silo' },
      { texture:'boss_fortress', hp:360, sizePx:190, name:'⚠  FLYING FORTRESS  ⚠',     bossType:'fortress' },
      { texture:'boss_core',     hp:450, sizePx:120, name:'⚠  EXPOSED CORE  ⚠',        bossType:'core' }
    ]
  },
];
