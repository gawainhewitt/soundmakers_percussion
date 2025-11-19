<script>
  import { onMount } from 'svelte';
  import ResponsiveContainer from './lib/ResponsiveContainer.svelte';
  import GridContainer from './lib/GridContainer.svelte';
  import SplashScreen from './lib/SplashScreen.svelte';
  import IconButton from './lib/IconButton.svelte';
  import OptionsScreen from './lib/OptionsScreen.svelte';
  import { AudioEngine } from './lib/AudioEngine.js';

  let currentScreen = 'splash'; // 'splash', 'play', 'about', 'options'
  let audioEngine = null;
  let audioInitialized = false;
  
  // Pad mode configuration (true = one-shot, false = touch)
  let padModes = {
    0: false, // pad 1 - touch mode
    1: false, // pad 2 - touch mode
    2: true,  // pad 3 - one-shot mode
    3: false, // pad 4 - touch mode
    4: false, // pad 5 - touch mode
    5: true,  // pad 6 - one-shot mode
    6: true,  // pad 7 - one-shot mode
    7: true   // pad 8 - one-shot mode
  };

  onMount(() => {
    // Create audio engine immediately (but don't initialize yet)
    audioEngine = new AudioEngine();
    
    // Load saved pad mode preferences
    loadPadModes();
  });
  
 function loadPadModes() {
    var savedModes = localStorage.getItem('soundmakers-pad-modes');
    
    if (savedModes) {
      try {
        padModes = JSON.parse(savedModes);
        console.log('Loaded pad modes:', padModes);
      } catch (e) {
        console.error('Failed to parse saved pad modes:', e);
      }
    } else {
      console.log('Using default pad modes:', padModes);
    }
  }

  async function handleSplashClick() {
    document.body.style.setProperty('background-color', 'rgb(170, 174, 182)', 'important');
    
    // Initialize audio context on user interaction (required for iOS)
    if (audioEngine && !audioInitialized) {
      await audioEngine.init();
      
      // Apply pad modes to audio engine
      Object.keys(padModes).forEach(function(index) {
        audioEngine.setPadMode(parseInt(index), padModes[index]);
      });
      
      audioInitialized = true;
      console.log('Audio initialized from splash screen');
    }
    
    // Show play screen
    currentScreen = 'play';
    
    // CHROME iOS FIX: Wait for layout to settle after transition
    setTimeout(() => {
      window.scrollTo(0, 0);
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  function gracefullyStopAllNotes() {
    // Stop all currently playing sounds
    if (audioEngine) {
      audioEngine.panic();
      console.log('Gracefully stopped all sounds');
    }
  }

  function handleAboutClick() {
    gracefullyStopAllNotes();
    document.body.style.setProperty('background-color', 'white', 'important');
    currentScreen = 'about';
  }

  function handleOptionsClick() {
    gracefullyStopAllNotes();
    document.body.style.setProperty('background-color', 'white', 'important');
    currentScreen = 'options';
  }

  function handleAboutClose() {
    document.body.style.setProperty('background-color', 'rgb(170, 174, 182)', 'important');
    currentScreen = 'play';

    // CHROME iOS FIX: Wait for layout to settle after transition
    setTimeout(() => {
      window.scrollTo(0, 0);
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  function handleOptionsSave(event) {
    // Update pad modes with new selections
    if (event.detail) {
      padModes = event.detail.padModes;
      
      // Save to localStorage
      localStorage.setItem('soundmakers-pad-modes', JSON.stringify(padModes));
      
      // Apply to audio engine
      Object.keys(padModes).forEach(function(index) {
        audioEngine.setPadMode(parseInt(index), padModes[index]);
      });
      
      console.log('Pad modes updated:', padModes);
    }
    
    document.body.style.setProperty('background-color', 'rgb(170, 174, 182)', 'important');
    currentScreen = 'play';
    
    // CHROME iOS FIX: Wait for layout to settle after transition
    setTimeout(() => {
      window.scrollTo(0, 0);
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }
</script>

{#if currentScreen === 'splash'}
  <SplashScreen 
    title="Percussion"
    instructions="To play: touch or click screen or use ZXCVBNM, keys on a keyboard"
    footerNote="On Apple devices, turn off silent mode"
    on:click={handleSplashClick}
  />
{:else if currentScreen === 'about'}
  <SplashScreen 
    title="Percussion"
    instructions="To play: touch or click screen or use ZXCVBNM, keys on a keyboard"
    footerNote="On Apple devices, turn off silent mode"
    on:click={handleAboutClose}
  />
{:else if currentScreen === 'options'}
  <OptionsScreen on:save={handleOptionsSave} />
{:else if currentScreen === 'play'}
  <!-- Icon buttons positioned in top corners -->
  <div style="position: fixed; top: 20px; left: 20px; z-index: 1000;">
    <IconButton 
      type="info" 
      ariaLabel="About"
      on:click={handleAboutClick}
    />
  </div>
  
  <div style="position: fixed; top: 20px; right: 65px; z-index: 1000;">
    <IconButton 
      type="settings" 
      ariaLabel="Options"
      on:click={handleOptionsClick}
    />
  </div>

  <main>
    <ResponsiveContainer>
      <GridContainer {audioEngine} />
    </ResponsiveContainer>
  </main>
{/if}

<style>
  main {
    text-align: center;
    padding: 1em;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    margin: 0;
  }


  @media (orientation: landscape) and (max-height: 500px) {
    main {
        padding: 0.5em;
      }
    }
</style>
