// Enemy data config – all sizes in px relative to natural texture width
export const ENEMY_DATA = {
  ka52: {
    texture: 'enemy_ka52',
    sizePx: 48,          // rendered width in game pixels
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
    bulletPattern: 'spread3',
    bulletColor: 0xffaa00,
    bulletSpeed: 230,
    fireDelay: 1700,
    zigzag: true,
    dropChance: 0.12
  },
  su34: {
    texture: 'enemy_ka52',  // reuse; unique art in full game
    sizePx: 44,
    hp: 3,
    speed: 145,
    points: 220,
    bulletPattern: 'aimed',
    bulletColor: 0xff6600,
    bulletSpeed: 265,
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
    bulletColor: 0xff00cc,
    bulletSpeed: 310,
    fireDelay: 1100,
    zigzag: false,
    dropChance: 0.10
  }
};
