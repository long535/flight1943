// Enemy data config – all sizes in px relative to natural texture width
export const ENEMY_DATA = {
  ka52: {
    texture: 'enemy_ka52',
    sizePx: 48,
    hp: 2,
    speed: 115,
    points: 150,
    bulletPattern: 'spread3',
    bulletColor: 0xff4400,
    bulletSpeed: 220,
    fireDelay: 2200,
    zigzag: true,
    dropChance: 0.04
  },
  mi24: {
    texture: 'enemy_mi24',
    sizePx: 56,
    hp: 5,
    speed: 75,
    points: 400,
    bulletPattern: 'laser',
    bulletColor: 0x00ffff,
    bulletSpeed: 500,
    fireDelay: 2000,
    zigzag: true,
    dropChance: 0.12
  },
  su34: {
    texture: 'enemy_ka52',
    sizePx: 44,
    hp: 3,
    speed: 145,
    points: 220,
    bulletPattern: 'wave',
    bulletColor: 0xff6600,
    bulletSpeed: 240,
    fireDelay: 1800,
    zigzag: false,
    dropChance: 0.05
  },
  shahed: {
    texture: 'enemy_shahed',
    sizePx: 36,
    hp: 1,
    speed: 135,
    points: 80,
    bulletPattern: null,   // kamikaze – no bullets
    dropChance: 0.02
  },
  s400: {
    texture: 'enemy_s400',
    sizePx: 26,
    hp: 6,
    speed: 0,
    points: 500,
    bulletPattern: 'spiral',
    bulletColor: 0xff2222,
    bulletSpeed: 310,
    fireDelay: 900,
    zigzag: false,
    dropChance: 0.10
  },

  // ── NEW ENEMY TYPES ──────────────────────────────────────

  // MiG-29: High-speed strafing fighter – dashes across screen then loops back
  mig29: {
    texture: 'enemy_ka52',
    sizePx: 42,
    hp: 2,
    speed: 280,          // very fast vertical entry
    points: 300,
    bulletPattern: 'aimed',
    bulletColor: 0xff2200,
    bulletSpeed: 380,
    fireDelay: 1400,
    zigzag: false,
    dash: true,          // custom flag: triggers horizontal dash behaviour
    dropChance: 0.06
  },

  // Heavy Bomber: slow, tanky, enters from the side, drops cannon shells
  bomber: {
    texture: 'enemy_mi24',
    sizePx: 72,
    hp: 14,
    speed: 0,            // doesn't descend – moves horizontally
    points: 800,
    bulletPattern: 'cannon',
    bulletColor: 0xff8800,
    bulletSpeed: 180,
    fireDelay: 2600,
    zigzag: false,
    lateral: true,       // custom flag: side-entry horizontal movement
    dropChance: 0.22
  },

  // Drone Swarm: sin-wave kamikaze cluster – explodes in ring on death
  drone: {
    texture: 'enemy_shahed',
    sizePx: 30,
    hp: 1,
    speed: 100,
    points: 120,
    bulletPattern: null,  // kamikaze + death ring
    dropChance: 0.03,
    deathRing: true,      // custom flag: fires ring burst on destroy
    sinWave: true         // custom flag: sin-wave movement
  }
};
