export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
    this.buffers = {}; // Store loaded audio buffers
    this.activeSources = {}; // Track currently playing sources by square index
    this.padModes = {}; // Track mode for each pad (true = one-shot, false = touch)
  }

  // Initialize audio context (must be called after user interaction on iOS)
  async init() {
    if (this.initialized) return;
    
    try {
      // Create audio context with iOS 12 compatibility
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      console.log('Audio context created, state:', this.audioContext.state);
      
      // iOS requires resuming the context after user interaction
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('Audio context resumed, state:', this.audioContext.state);
      }
      
      // Load all 8 sound files
      await this.loadSounds();
      
      this.initialized = true;
      console.log('AudioEngine initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  async loadSounds() {
    const soundFiles = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
    
    for (let i = 0; i < soundFiles.length; i++) {
      const soundName = soundFiles[i];
      const url = `/sounds/${soundName}.mp3`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        
        // iOS 12 may need the callback version of decodeAudioData
        const audioBuffer = await new Promise((resolve, reject) => {
          this.audioContext.decodeAudioData(
            arrayBuffer,
            (buffer) => resolve(buffer),
            (error) => reject(error)
          );
        });
        
        this.buffers[i] = audioBuffer;
        console.log(`Loaded sound ${i + 1}: ${soundName}`);
      } catch (error) {
        console.error(`Failed to load ${soundName}:`, error);
      }
    }
    
    console.log('All sounds loaded. Total buffers:', Object.keys(this.buffers).length);
  }

  playSound(squareIndex) {
    if (!this.audioContext || !this.initialized) {
      console.warn('Audio not ready');
      return;
    }

    // Stop any existing sound for this square
    this.stopSound(squareIndex);

    // Get the audio buffer for this square
    const buffer = this.buffers[squareIndex];
    if (!buffer) {
      console.warn('No buffer for square', squareIndex);
      return;
    }

    // Create a new source node
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    
    // Track this source
    this.activeSources[squareIndex] = source;
    
    // Remove from active sources when it finishes playing
    source.onended = () => {
      if (this.activeSources[squareIndex] === source) {
        delete this.activeSources[squareIndex];
        console.log('Sound finished for square', squareIndex + 1);
      }
    };
    
    // Start playing
    source.start(0);
    console.log('Playing sound for square', squareIndex + 1);
  }

  stopSound(squareIndex) {
    // Don't stop if this pad is in one-shot mode
    if (this.padModes[squareIndex]) {
      console.log('Pad', squareIndex + 1, 'is in one-shot mode, letting sound finish');
      return;
    }
    
    const source = this.activeSources[squareIndex];
    if (source) {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
      delete this.activeSources[squareIndex];
      console.log('Stopped sound for square', squareIndex + 1);
    }
  }

  // Check if a sound is currently playing
  isPlaying(squareIndex) {
    return !!this.activeSources[squareIndex];
  }

  // Stop all sounds
  panic() {
    console.log('PANIC: Stopping all sounds');
    Object.keys(this.activeSources).forEach(index => {
      this.stopSound(parseInt(index));
    });
  }

  // Set whether a pad is in one-shot mode
  setPadMode(squareIndex, isOneShot) {
    this.padModes[squareIndex] = isOneShot;
    console.log(`Pad ${squareIndex + 1} mode set to:`, isOneShot ? 'one-shot' : 'touch');
  }

  // Get pad mode
  getPadMode(squareIndex) {
    return this.padModes[squareIndex] || false;
  }
}