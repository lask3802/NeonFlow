const createTone = (audioContext, { frequency, duration, type, gain }) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = gain;
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
};

export const createAudioManager = () => {
  let audioContext = null;

  const ensureContext = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    return audioContext;
  };

  const playPerfect = () => {
    const context = ensureContext();
    createTone(context, {
      frequency: 880,
      duration: 0.12,
      type: "sine",
      gain: 0.08,
    });
  };

  const playGood = () => {
    const context = ensureContext();
    createTone(context, {
      frequency: 520,
      duration: 0.1,
      type: "triangle",
      gain: 0.06,
    });
  };

  const playBad = () => {
    const context = ensureContext();
    createTone(context, {
      frequency: 180,
      duration: 0.18,
      type: "sawtooth",
      gain: 0.09,
    });
  };

  return {
    playPerfect,
    playGood,
    playBad,
  };
};
