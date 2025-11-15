<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  // Current pad modes (true = one-shot, false = touch)
  let padModes = {
    0: false,
    1: false,
    2: true,
    3: false,
    4: false,
    5: true,
    6: true,
    7: true
  };
  
  // Load saved preferences on mount
  onMount(() => {
    var savedModes = localStorage.getItem('soundmakers-pad-modes');
    
    if (savedModes) {
      try {
        padModes = JSON.parse(savedModes);
        console.log('Loaded pad modes in options:', padModes);
      } catch (e) {
        console.error('Failed to parse saved pad modes:', e);
      }
    }
    
    window.addEventListener('keydown', handleKeydown);
  });
  
  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
  
  function handleSave() {
    // Dispatch save event with the pad modes
    dispatch('save', {
      padModes: padModes
    });
  }
  
  function handleKeydown(e) {
    // Save on Enter or Escape
    if (e.key === 'Enter' || e.key === 'Escape') {
      handleSave();
    }
  }
  
  function togglePadMode(padIndex) {
    padModes[padIndex] = !padModes[padIndex];
    console.log(`Pad ${padIndex + 1} mode toggled to:`, padModes[padIndex] ? 'one-shot' : 'touch');
  }
  
  function getModeLabel(padIndex) {
    return padModes[padIndex] ? 'One-Shot' : 'Touch';
  }
</script>

<div class="options-screen">
  <div class="content">
    <h1>Options</h1>
    
    <div class="options-wrapper">
      <div class="option-section">
        <h2>Pad Playback Modes</h2>
        <p class="description">Touch: sound stops when released | One-Shot: sound plays to end</p>
        
        <div class="pad-grid">
          {#each Array(8) as _, i}
            <button 
              class="pad-button {padModes[i] ? 'one-shot' : 'touch'}"
              on:click={() => togglePadMode(i)}
            >
              <span class="pad-number">Pad {i + 1}</span>
              <span class="pad-mode">{getModeLabel(i)}</span>
            </button>
          {/each}
        </div>
      </div>
    </div>
    
    <button class="save-button" on:click={handleSave}>
      Save
    </button>
  </div>
</div>

<style>
  .options-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    box-sizing: border-box;
    z-index: 9999;
    overflow: hidden;
  }
  
  .content {
    max-width: 700px;
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: flex-start;  /* CHANGE from space-between to flex-start */
    gap: 1rem;  /* ADD THIS - creates consistent spacing */
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #333;
    flex-shrink: 0;
  }
  
  .options-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow-y: auto;
    /* REMOVE: flex: 1; */
  }
  
  .option-section {
    margin-bottom: 1rem;
  }
  
  h2 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    color: #555;
    font-weight: 600;
  }
  
  .description {
    font-size: 0.9rem;
    color: #777;
    margin-bottom: 1.5rem;
    line-height: 1.4;
  }
  
  .pad-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    max-width: 500px;
    margin: 0 auto;
  }
  
  .pad-button {
    background-color: #f5f5f5;
    color: #333;
    border: 3px solid #ddd;
    padding: 1.2rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
  }
  
  .pad-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .pad-button:active {
    transform: translateY(0);
  }
  
  .pad-button.touch {
    background-color: #E8F4F8;
    border-color: #06C0F0;
  }
  
  .pad-button.one-shot {
    background-color: #FFF4E6;
    border-color: #FBAC2E;
  }
  
  .pad-number {
    font-size: 0.9rem;
    font-weight: 700;
  }
  
  .pad-mode {
    font-size: 0.85rem;
    font-weight: 500;
    opacity: 0.8;
  }
  
  .save-button {
    background-color: #06C0F0;
    color: white;
    border: none;
    padding: 1rem 3rem;
    font-size: 1.2rem;
    font-weight: 600;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(6, 192, 240, 0.3);
    margin-top: 1rem;
    flex-shrink: 0;
  }
  
  .save-button:hover {
    background-color: #05A8D6;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(6, 192, 240, 0.4);
  }
  
  .save-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(6, 192, 240, 0.3);
  }

  /* Tablet Portrait (iPad) */
  @media (min-width: 481px) and (max-width: 1024px) and (orientation: portrait) {
    .options-screen {
      padding: 1.5rem;
    }
    
    h1 {
      font-size: 2.2rem;
      margin-bottom: 0.8rem;
    }
    
    h2 {
      font-size: 1.2rem;
    }
    
    .description {
      font-size: 0.85rem;
      margin-bottom: 1.2rem;
    }
    
    .pad-grid {
      gap: 0.8rem;
    }
    
    .save-button {
      margin-top: 0.5rem;  /* ADD/CHANGE THIS - reduce from 1.5rem */
      max-width: 50%;
      align-self: center;
    }
  }
  
  /* Mobile Portrait */
  @media (max-width: 480px) {
    .options-screen {
      padding: 1rem;
    }
    
    h1 {
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
    }
    
    h2 {
      font-size: 1rem;
      margin-bottom: 0.4rem;
    }
    
    .description {
      font-size: 0.75rem;
      margin-bottom: 1rem;
    }
    
    .pad-grid {
      gap: 0.6rem;
    }
    
    .pad-button {
      padding: 1rem 0.8rem;
      font-size: 0.9rem;
    }
    
    .pad-number {
      font-size: 0.85rem;
    }
    
    .pad-mode {
      font-size: 0.75rem;
    }
    
    .save-button {
      padding: 0.8rem 2rem;
      font-size: 1rem;
      margin-top: 0.5rem;   
    }
  }
  
  /* Landscape mode - Horizontal layout */
  @media (orientation: landscape) {
    .options-screen {
      padding: 1rem 2rem;
      justify-content: flex-start;
    }
    
    .content {
      max-width: 100%;
      justify-content: flex-start;
      gap: 0.5rem;
      height: auto;
      margin-top: 1rem;
    }
    
    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    h2 {
      font-size: 1.1rem;
      margin-bottom: 0.3rem;
    }
    
    .description {
      font-size: 0.8rem;
      margin-bottom: 1rem;
    }
    
    .pad-grid {
      grid-template-columns: repeat(4, 1fr);
      max-width: 90%;
      gap: 0.8rem;
    }
    
    .pad-button {
      padding: 1rem 0.5rem;
      font-size: 0.85rem;
    }
    
    .save-button {
      padding: 0.9rem 2.5rem;
      font-size: 1.1rem;
      max-width: 300px;
      align-self: center;
      margin-top: 1rem;
    }
  }
  
  /* Very short landscape (iPhone landscape) */
  @media (orientation: landscape) and (max-height: 450px) {
    .options-screen {
      padding: 0.3rem 1rem;  /* CHANGE - reduce from 0.5rem 1rem */
    }
    
    .content {
      margin-top: 0.3rem;  /* ADD THIS - reduce from 1rem */
      gap: 0.3rem;  /* ADD THIS - reduce spacing between elements */
    }
    
    h1 {
      font-size: 1.4rem;
      margin-bottom: 0.2rem;  /* CHANGE - reduce from 0.3rem */
    }
    
    h2 {
      font-size: 0.9rem;
      margin-bottom: 0.1rem;
    }
    
    .description {
      font-size: 0.65rem;
      margin-bottom: 0.3rem;  /* CHANGE - reduce from 0.5rem */
    }
    
    .pad-grid {
      gap: 0.5rem;
    }
    
    .pad-button {
      padding: 0.7rem 0.4rem;
      font-size: 0.75rem;
    }
    
    .pad-number {
      font-size: 0.7rem;
    }
    
    .pad-mode {
      font-size: 0.65rem;
    }
    
    .save-button {
      padding: 0.7rem 2rem;
      font-size: 0.9rem;
      margin-top: 0.3rem;  /* CHANGE - reduce from 0.5rem */
    }
  }
</style>