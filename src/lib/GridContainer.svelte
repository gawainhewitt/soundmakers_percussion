<script>
  import { onMount, onDestroy } from 'svelte';
  import Square from './Square.svelte';
  
  export let audioEngine;
  
  let squares = Array.from({ length: 8 }, function(_, i) { return i; });
  let orientation = 'portrait';
  let cleanupInterval;
  
  // Map keyboard keys to square indices (0-7)
  var keyMap = {
    'z': 0,
    'x': 1,
    'c': 2,
    'v': 3,
    'b': 4,
    'n': 5,
    'm': 6,
    ',': 7
  };
  
  // Track which squares are currently pressed
  let squareStates = {};
  
  // Initialize square states (all false)
  squares.forEach(function(index) {
    squareStates[index] = false;
  });
  
  // Track which keys are currently held down (prevent key repeat)
  let heldKeys = new Set();
  
  onMount(() => {
    // Periodic cleanup - check for orphaned sounds
    cleanupInterval = setInterval(function() {
      if (audioEngine) {
        smartCleanup();
      }
    }, 1000); // Check every 1 second
    
    // Add keyboard handlers
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);
    
    // Stop all sounds when page loses focus or visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
  });
  
  onDestroy(() => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
    }
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('keyup', handleKeyup);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);
    
    // Panic on unmount
    if (audioEngine) {
      audioEngine.panic();
    }
  });
  
  function handleVisibilityChange() {
    if (document.hidden && audioEngine) {
      console.log('Page hidden - stopping all sounds');
      audioEngine.panic();
      // Reset all square states
      Object.keys(squareStates).forEach(function(index) {
        squareStates[index] = false;
      });
      heldKeys.clear();
    }
  }
  
  function handleWindowBlur() {
    if (audioEngine) {
      console.log('Window blur - stopping all sounds');
      audioEngine.panic();
      // Reset all square states
      Object.keys(squareStates).forEach(function(index) {
        squareStates[index] = false;
      });
      heldKeys.clear();
    }
  }
  
  function smartCleanup() {
    // Check if any sounds are playing but their square is not pressed
    squares.forEach(function(index) {
      if (audioEngine.isPlaying(index) && !squareStates[index]) {
        console.warn('Cleaning up stuck sound for square:', index + 1);
        audioEngine.stopSound(index);
      }
    });
  }
  
  function handleKeydown(e) {
    // Press 'P' key to panic (stop all sounds)
    if (e.key === 'p' || e.key === 'P') {
      if (audioEngine) {
        audioEngine.panic();
        // Reset all square states
        Object.keys(squareStates).forEach(function(index) {
          squareStates[index] = false;
        });
        heldKeys.clear();
      }
      return;
    }
    
    // Handle instrument keys (zxcvbnm,)
    var key = e.key.toLowerCase();
    if (keyMap.hasOwnProperty(key)) {
      // Prevent key repeat - only trigger on first press
      if (heldKeys.has(key)) return;
      heldKeys.add(key);
      
      var squareIndex = keyMap[key];
      
      // Trigger press
      squareStates[squareIndex] = true;
      if (audioEngine) {
        audioEngine.playSound(squareIndex);
      }
      console.log('Key pressed:', key, '→ square', squareIndex + 1);
    }
  }
  
  function handleKeyup(e) {
    var key = e.key.toLowerCase();
    if (keyMap.hasOwnProperty(key)) {
      heldKeys.delete(key);
      
      var squareIndex = keyMap[key];
      
      // Trigger release
      squareStates[squareIndex] = false;
      if (audioEngine) {
        audioEngine.stopSound(squareIndex);
      }
      console.log('Key released:', key, '→ square', squareIndex + 1);
    }
  }
  
  async function initAudio() {
    // Audio should already be initialized from splash screen
    // But we can resume if suspended
    if (audioEngine && audioEngine.audioContext && audioEngine.audioContext.state === 'suspended') {
      await audioEngine.audioContext.resume();
      console.log('Audio context resumed:', audioEngine.audioContext.state);
    }
  }
  
  function updateOrientation() {
    orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }
  
  $: {
    if (typeof window !== 'undefined') {
      updateOrientation();
    }
  }
  
  async function handlePress(event) {
    await initAudio();
    squareStates[event.detail.index] = true;
    if (audioEngine) {
      audioEngine.playSound(event.detail.index);
    }
    console.log('Square pressed:', event.detail.index + 1);
  }
  
  function handleRelease(event) {
    squareStates[event.detail.index] = false;
    if (audioEngine) {
      audioEngine.stopSound(event.detail.index);
    }
    console.log('Square released:', event.detail.index + 1);
  }
</script>

<svelte:window on:resize={updateOrientation} />

<div class="container {orientation}">
  {#each squares as index}
    <Square 
      {index}
      {orientation}
      {audioEngine}
      color="#AD71DD"
      activeColor="rgb(255, 0, 255)"
      isPressed={squareStates[index]}
      on:press={handlePress}
      on:release={handleRelease}
    />
  {/each}
</div>

<style>
  .container {
    display: grid;
    gap: 1vh;
    padding: 5vh 2vh 2vh 2vh;
    height: 100%;
    width: 100%;
    place-items: center;
    place-content: center;
  }

  @media (max-width: 480px) {
    .container {
      padding-top: 9vh;
    }
  }

  @media (orientation: landscape) {
    .container {
      max-width: 100vh;
      margin: 0 auto;
    }
  }

  @media (orientation: portrait) {
    .container {
      gap: 0.5vh;
    }
  }
  
  .container.portrait {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 1fr);
  }
  
  .container.landscape {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }
</style>