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
  { stage:0, delay:10000, enemy:'ka52',   count:120, pattern:'line',   spawnGap:100 },
  { stage:0, delay:11000, enemy:'shahed', count:160, pattern:'random', spawnGap:55 },
  { stage:0, delay:12000, enemy:'mig29',  count:60,  pattern:'line',   spawnGap:75, warning: true },
  { stage:0, delay:13000, enemy:'mi24',   count:80,  pattern:'vshape', spawnGap:112 },
  { stage:0, delay:12000, enemy:'drone',  count:240, pattern:'random', spawnGap:35, warning: true },
  { stage:0, delay:13000, enemy:'s400',   count:50,  pattern:'line',   spawnGap:175 }, // Added s400
  { stage:0, delay:11000, enemy:'ka52',   count:200, pattern:'vshape', spawnGap:75 },
  { stage:0, delay:12000, enemy:'bomber', count:20,  pattern:'random', spawnGap:450, warning: true }, // Added bomber
  { stage:0, delay:11000, enemy:'su34',   count:140, pattern:'line',   spawnGap:87, warning: true },
  // Boss
  { stage:0, delay:5000,  type:'boss',
    texture:'boss_tu22m', hp:160, sizePx:110,
    name:'⚠  TU-22M BACKFIRE  ⚠',
    bossType: 'tu22m' },

  // ─────────────────────────────────────────────────────────
  //  STAGE 1  —  Black Sea  (bg_level2)
  //  Sea stage: ships, bombers, subs
  // ─────────────────────────────────────────────────────────
  { stage:1, delay:11000, enemy:'su34',   count:140, pattern:'line',   spawnGap:87 },
  { stage:1, delay:12000, enemy:'shahed', count:260, pattern:'random', spawnGap:40, warning: true },
  { stage:1, delay:12000, enemy:'bomber', count:30,  pattern:'random', spawnGap:450, warning: true },
  { stage:1, delay:11000, enemy:'su57',   count:40,  pattern:'random', spawnGap:250, warning: true }, // Added Su-57
  { stage:1, delay:13000, enemy:'mi24',   count:140, pattern:'vshape', spawnGap:87 },
  { stage:1, delay:12000, enemy:'mig29',  count:120, pattern:'line',   spawnGap:65, warning: true },
  { stage:1, delay:13000, enemy:'s400',   count:100, pattern:'line',   spawnGap:137 },
  { stage:1, delay:12000, enemy:'drone',  count:320, pattern:'random', spawnGap:30, warning: true },
  { stage:1, delay:11000, enemy:'su57',   count:60,  pattern:'random', spawnGap:200, warning: true }, // Added Su-57
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
  { stage:2, delay:11000, enemy:'mi24',   count:120, pattern:'vshape', spawnGap:95 },
  { stage:2, delay:12000, enemy:'s400',   count:90,  pattern:'line',   spawnGap:140 },
  { stage:2, delay:11000, enemy:'bomber', count:30,  pattern:'random', spawnGap:400, warning: true },
  { stage:2, delay:11000, enemy:'su57',   count:60,  pattern:'random', spawnGap:200,  warning: true }, // Added Su-57
  { stage:2, delay:12000, enemy:'drone',  count:360, pattern:'random', spawnGap:30,  warning: true },
  { stage:2, delay:11000, enemy:'mig29',  count:100, pattern:'vshape', spawnGap:65,  warning: true },
  { stage:2, delay:12000, enemy:'su34',   count:150, pattern:'vshape', spawnGap:60 },
  { stage:2, delay:11000, enemy:'mi24',   count:180, pattern:'line',   spawnGap:75 },
  { stage:2, delay:10000, enemy:'su57',   count:100, pattern:'random', spawnGap:150,  warning: true }, // Added Su-57
  // Final wave: bullet hell mix
  { stage:2, delay:10000, enemy:'shahed', count:300, pattern:'random', spawnGap:30,
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
