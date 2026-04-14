class ProceduralAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmOsc = null;
    this.bgmGain = null;
    this.bgmTimer = null;
    this.isMuted = false;
    this.isPlayingBGM = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.6;
    this.masterGain.connect(this.ctx.destination);
    
    // Dedicated channel for background music
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0.25; // Quieter to let SFX pop
    this.bgmGain.connect(this.masterGain);
  }

  _playTone(freq, type, duration, vol=1, slideFreq=null) {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(freq, t);
    if (slideFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideFreq, t + duration);
    }
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
    
    osc.start(t);
    osc.stop(t + duration);
  }

  playShoot() {
    this._playTone(880, 'square', 0.1, 0.08, 440);
  }

  playHit() {
    this._playTone(150, 'triangle', 0.15, 0.6, 50);
  }

  playExplosion() {
    if (!this.ctx || this.isMuted) return;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Lowpass filter to muffle white noise into a "boom"
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    const gain = this.ctx.createGain();
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    
    noise.start(t);
  }

  playPowerup() {
    this._playTone(300, 'square', 0.3, 0.5, 1200);
    setTimeout(() => this._playTone(600, 'square', 0.3, 0.5, 2400), 50);
  }

  startBGM(stageIndex) {
    if (!this.ctx || this.isMuted) return;
    this.stopBGM();
    this.isPlayingBGM = true;

    // Define simple melodic loops per stage (Frequency matrices)
    const stages = {
      0: { root: 110, seq: [0, 7, 0, 12, 0, 7, 3, 5], speed: 120 }, // Punchy Plains
      1: { root: 80,  seq: [0, 0, 12, 12, 7, 7, 10, 10], speed: 180 }, // Sonar Sea
      2: { root: 180, seq: [0, 1, 0, 1, 12, 13, 12, 13], speed: 100 }  // Alert Ruins
    };

    const track = stages[stageIndex] || stages[0];
    let noteIndex = 0;

    const tick = () => {
      if (!this.isPlayingBGM) return;
      const step = track.seq[noteIndex];
      // Convert semitone step to frequency
      const freq = track.root * Math.pow(1.059463, step);
      
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      
      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.3, t);
      env.gain.exponentialRampToValueAtTime(0.01, t + (track.speed / 1000));
      
      osc.connect(env);
      env.connect(this.bgmGain);
      osc.start(t);
      osc.stop(t + (track.speed / 1000));

      noteIndex = (noteIndex + 1) % track.seq.length;
      this.bgmTimer = setTimeout(tick, track.speed);
    };

    tick();
  }

  stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const RetroAudio = new ProceduralAudioEngine();
