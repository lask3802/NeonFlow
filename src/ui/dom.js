export const elements = {
  score: document.getElementById("score"),
  combo: document.getElementById("combo"),
  judgement: document.getElementById("judgement"),
  focusCombo: document.getElementById("focus-combo"),
  focusHud: document.getElementById("focus-hud"),
  hud: document.getElementById("hud"),
  speedInput: document.getElementById("speed"),
  speedValue: document.getElementById("speed-value"),
  comboGoal: document.getElementById("combo-goal"),
  startScreen: document.getElementById("start-screen"),
  summaryScreen: document.getElementById("summary-screen"),
  finalScore: document.getElementById("final-score"),
  finalCombo: document.getElementById("final-combo"),
  finalSpeed: document.getElementById("final-speed"),
  startButton: document.getElementById("start-button"),
  restartButton: document.getElementById("restart-button"),
};

export const toggleScreen = (screenEl, isVisible) => {
  if (!screenEl) {
    return;
  }
  screenEl.classList.toggle("visible", isVisible);
};

export const setHudVisible = (isVisible) => {
  if (!elements.hud || !elements.focusHud) {
    return;
  }
  elements.hud.classList.toggle("is-hidden", !isVisible);
  elements.focusHud.classList.toggle("is-hidden", !isVisible);
};
