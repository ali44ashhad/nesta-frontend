/**
 * Audio context and oscillator refs for collision sound
 */
export interface AudioRefs {
  audioContext: AudioContext | null;
  oscillator: OscillatorNode | null;
}

/**
 * Stop any playing collision sound
 */
export const stopCollisionSound = (refs: AudioRefs): void => {
  if (refs.oscillator) {
    try {
      refs.oscillator.stop();
      refs.oscillator.disconnect();
      refs.oscillator = null;
    } catch {
      // Ignore errors when stopping
    }
  }
  if (refs.audioContext) {
    try {
      refs.audioContext.close();
      refs.audioContext = null;
    } catch {
      // Ignore errors when closing
    }
  }
};

/**
 * Play collision sound effect
 * @param frequency Sound frequency (default: 100 for forward, 1000 for backward)
 * @returns Audio refs for cleanup
 */
export const playCollisionSound = (frequency: number = 100): AudioRefs => {
  const refs: AudioRefs = { audioContext: null, oscillator: null };
  
  try {
    const AudioContextClass = window.AudioContext || 
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();
    refs.audioContext = audioContext;
    const oscillator = audioContext.createOscillator();
    refs.oscillator = oscillator;
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
    
    // Clear refs after sound finishes
    oscillator.onended = () => {
      refs.oscillator = null;
      refs.audioContext = null;
    };
  } catch {
    // Audio context might not be available, ignore
  }
  
  return refs;
};

