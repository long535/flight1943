// ══════════════════════════════════════════════════════════
//  levels.js  –  Wave definitions
//  Rule: each stage must run AT LEAST 90 seconds before boss.
//  delay = ms until NEXT wave spawns after current wave clears.
//  6 enemy waves × ~15s each = ~90s minimum per stage.
// ══════════════════════════════════════════════════════════
export const WAVES = [

  // ─────────────────────────────────────────────────────────
  //  STAGE 0  —  Donbas Plains  (bg_level1)
  //  Total time before boss: ~96 seconds
  // ─────────────────────────────────────────────────────────
  { stage:0, delay:14000, enemy:'ka52',   count:9,  pattern:'line',   spawnGap:500 },
  { stage:0, delay:14000, enemy:'ka52',   count:12, pattern:'vshape', spawnGap:400 },
  { stage:0, delay:15000, enemy:'mi24',   count:6,  pattern:'line',   spawnGap:750 },
  { stage:0, delay:15000, enemy:'shahed', count:15, pattern:'random', spawnGap:280 },
  { stage:0, delay:16000, enemy:'ka52',   count:15, pattern:'line',   spawnGap:350 },
  { stage:0, delay:15000, enemy:'su34',   count:9,  pattern:'vshape', spawnGap:500 },
  { stage:0, delay:16000, enemy:'shahed', count:24, pattern:'random', spawnGap:200 },
  // Boss intro pause then fight
  { stage:0, delay:6000,  type:'boss',
    texture:'boss_tu22m', hp:150, sizePx:110,
    name:'⚠  TU-22M BACKFIRE  ⚠' },

  // ─────────────────────────────────────────────────────────
  //  STAGE 1  —  Black Sea  (bg_level2)
  //  Total time before boss: ~102 seconds
  // ─────────────────────────────────────────────────────────
  { stage:1, delay:14000, enemy:'su34',   count:9,  pattern:'line',   spawnGap:450 },
  { stage:1, delay:15000, enemy:'shahed', count:21, pattern:'random', spawnGap:220 },
  { stage:1, delay:16000, enemy:'mi24',   count:9,  pattern:'vshape', spawnGap:450 },
  { stage:1, delay:15000, enemy:'s400',   count:6,  pattern:'line',   spawnGap:700 },
  { stage:1, delay:16000, enemy:'su34',   count:15, pattern:'vshape', spawnGap:300 },
  { stage:1, delay:16000, enemy:'mi24',   count:12, pattern:'line',   spawnGap:600 },
  // Boss
  { stage:1, delay:6000,  type:'boss',
    phases: 2,
    phaseData: [
      { texture:'boss_tu22m', hp:200, sizePx:120, name:'⚠  MOSKVA CRUISER  ⚠' },
      { texture:'boss_submarine', hp:240, sizePx:160, name:'⚠  K-329 BELGOROD SUBMARINE  ⚠' }
    ]
  },

  // ─────────────────────────────────────────────────────────
  //  STAGE 2  —  Kharkiv Ruins  (bg_level3)
  //  Total time before boss: ~108 seconds
  // ─────────────────────────────────────────────────────────
  { stage:2, delay:14000, enemy:'mi24',   count:12, pattern:'vshape', spawnGap:400 },
  { stage:2, delay:15000, enemy:'s400',   count:9,  pattern:'line',   spawnGap:600 },
  { stage:2, delay:16000, enemy:'shahed', count:36, pattern:'random', spawnGap:140 },
  { stage:2, delay:16000, enemy:'su34',   count:15, pattern:'vshape', spawnGap:280 },
  { stage:2, delay:15000, enemy:'mi24',   count:18, pattern:'line',   spawnGap:350 },
  { stage:2, delay:16000, enemy:'s400',   count:12, pattern:'vshape', spawnGap:500 },
  // Final Boss
  { stage:2, delay:6000,  type:'boss',
    phases: 3,
    phaseData: [
      { texture:'boss_tu22m', hp:250, sizePx:150, name:'⚠  TARGET: GROUND SILO  ⚠' },
      { texture:'boss_fortress', hp:300, sizePx:180, name:'⚠  FLYING FORTRESS  ⚠' },
      { texture:'boss_core', hp:400, sizePx:110, name:'⚠  EXPOSED CORE  ⚠' }
    ]
  },
];
