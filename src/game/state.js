const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const createGameState = ({
  defaultSpeed = 0.01,
  minSpeed = 0.001,
  maxSpeed = 0.02,
  speedStep = 0.001,
  speedStepPerfects = 10,
  comboGoal = 500,
} = {}) => {
  const state = {
    progress: 0,
    score: 0,
    combo: 0,
    comboTimer: 0,
    comboGoal,
    speed: defaultSpeed,
    minSpeed,
    maxSpeed,
    speedStep,
    speedStepPerfects,
    speedBoostCounter: 0,
    isRunning: false,
    isFinished: false,
  };

  const setSpeed = (value) => {
    state.speed = clamp(value, state.minSpeed, state.maxSpeed);
  };

  const reset = () => {
    state.progress = 0;
    state.score = 0;
    state.combo = 0;
    state.comboTimer = 0;
    state.speedBoostCounter = 0;
    state.isRunning = false;
    state.isFinished = false;
    setSpeed(defaultSpeed);
  };

  const registerPerfect = (count = 1) => {
    state.speedBoostCounter += count;
    if (state.speedBoostCounter >= state.speedStepPerfects) {
      const steps = Math.floor(state.speedBoostCounter / state.speedStepPerfects);
      state.speedBoostCounter -= steps * state.speedStepPerfects;
      setSpeed(state.speed + steps * state.speedStep);
    }
  };

  const registerBad = () => {
    state.speedBoostCounter = 0;
    setSpeed(state.speed - state.speedStep);
  };

  return {
    state,
    setSpeed,
    reset,
    registerPerfect,
    registerBad,
  };
};
