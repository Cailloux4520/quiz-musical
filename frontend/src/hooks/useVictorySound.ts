/**
 * Hook personnalisé pour jouer un son de victoire
 * Utilise Web Audio API pour générer un son synthétique
 */
export const useVictorySound = () => {
  const playVictorySound = () => {
    try {
      // Créer un contexte audio
      const audioContext = new (window.AudioContext ||
        // @ts-ignore
        window.webkitAudioContext)();

      // Jouer une fanfare de victoire (notes : Do, Mi, Sol, Do aigu)
      const notes = [
        { freq: 261.63, time: 0, duration: 0.15 }, // Do
        { freq: 329.63, time: 0.15, duration: 0.15 }, // Mi
        { freq: 392.0, time: 0.3, duration: 0.15 }, // Sol
        { freq: 523.25, time: 0.45, duration: 0.4 }, // Do aigu (plus long)
      ];

      notes.forEach((note) => {
        // Oscillateur pour la note
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Type de son (triangle pour un son plus doux)
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(
          note.freq,
          audioContext.currentTime + note.time
        );

        // Enveloppe ADSR (Attack, Decay, Sustain, Release)
        const startTime = audioContext.currentTime + note.time;
        const endTime = startTime + note.duration;

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02); // Attack
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05); // Decay
        gainNode.gain.setValueAtTime(0.2, endTime - 0.05); // Sustain
        gainNode.gain.linearRampToValueAtTime(0, endTime); // Release

        oscillator.start(startTime);
        oscillator.stop(endTime);
      });

      // Son de cymballes (bruit blanc filtré) à la fin
      const noiseBuffer = audioContext.createBuffer(
        1,
        audioContext.sampleRate * 0.5,
        audioContext.sampleRate
      );
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        noiseData[i] = Math.random() * 2 - 1;
      }

      const noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = audioContext.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(2000, audioContext.currentTime);

      const noiseGain = audioContext.createGain();
      noiseGain.gain.setValueAtTime(0, audioContext.currentTime + 0.6);
      noiseGain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.65);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.1);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);

      noiseSource.start(audioContext.currentTime + 0.6);
      noiseSource.stop(audioContext.currentTime + 1.1);
    } catch (error) {
      console.error('Erreur lors de la lecture du son:', error);
    }
  };

  return { playVictorySound };
};
