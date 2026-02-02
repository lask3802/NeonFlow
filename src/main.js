import * as THREE from "../three.module.js";
import { createPointerControls } from "./game/controls.js";
import { createGameState } from "./game/state.js";
import { createTunnel } from "./game/tunnel.js";
import { createPlayer } from "./game/player.js";
import { createStars } from "./game/stars.js";
import { createJudgementParticles } from "./effects/particles.js";
import { createAudioManager } from "./effects/audio.js";
import { elements, setHudVisible, toggleScreen } from "./ui/dom.js";

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05000f, 0.035);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
if (renderer.domElement.parentElement !== document.body) {
  document.body.appendChild(renderer.domElement);
}

scene.add(camera);

const ambient = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambient);

const tunnelData = createTunnel();
scene.add(tunnelData.tunnel);

const player = createPlayer();
scene.add(player.playerGroup);

const stars = createStars();
camera.add(stars.stars);

const particles = createJudgementParticles();
scene.add(particles.group);

const audio = createAudioManager();

const controls = createPointerControls();

const game = createGameState({
  defaultSpeed: 0.01,
  minSpeed: 0.001,
  maxSpeed: 0.02,
  speedStep: 0.001,
  speedStepPerfects: 10,
  comboGoal: 500,
});

const maxOffset = 2.4;
const perfectThreshold = 0.6;
const goodThreshold = 1.6;
const cameraDistance = 8;
const lookAheadDistance = 50;
const playerForward = 4;
const baseFov = 75;
const maxDelta = 0.05;
const inputSmoothing = 0.08;
const fovSmoothing = 0.08;
const comboStep = 0.15;
const perfectScoreRate = 600;
const goodScoreRate = 120;

const speedDisplayPrecision = 3;

const setSpeedDisplay = (value) => {
  if (elements.speedValue) {
    elements.speedValue.textContent = value.toFixed(speedDisplayPrecision);
  }
  if (elements.speedInput) {
    elements.speedInput.setAttribute("aria-valuenow", value.toFixed(speedDisplayPrecision));
  }
};

const syncSpeedControl = () => {
  if (!elements.speedInput) {
    return;
  }
  elements.speedInput.value = game.state.speed.toString();
  setSpeedDisplay(game.state.speed);
};

const updateSummary = () => {
  if (elements.finalScore) {
    elements.finalScore.textContent = Math.floor(game.state.score).toString();
  }
  if (elements.finalCombo) {
    elements.finalCombo.textContent = game.state.combo.toString();
  }
  if (elements.finalSpeed) {
    elements.finalSpeed.textContent = game.state.speed.toFixed(speedDisplayPrecision);
  }
};

const updateComboGoal = () => {
  if (elements.comboGoal) {
    elements.comboGoal.textContent = `GOAL ${game.state.comboGoal} COMBO`;
  }
};

const enableSpeedControl = (enabled) => {
  if (!elements.speedInput) {
    return;
  }
  elements.speedInput.disabled = !enabled;
  elements.speedInput.classList.toggle("is-disabled", !enabled);
};

const clock = new THREE.Clock();
const smoothedUp = new THREE.Vector3(0, 1, 0);

let lastJudgement = "";
let lastComboStep = 0;

const resetGame = () => {
  game.reset();
  lastJudgement = "";
  lastComboStep = 0;
  syncSpeedControl();
  updateComboGoal();
  if (elements.score) {
    elements.score.textContent = "0";
  }
  if (elements.combo) {
    elements.combo.textContent = "0";
  }
  if (elements.judgement) {
    elements.judgement.textContent = "READY";
  }
  if (elements.focusCombo) {
    elements.focusCombo.textContent = "x0";
  }
};

const startGame = () => {
  resetGame();
  game.state.isRunning = true;
  toggleScreen(elements.startScreen, false);
  toggleScreen(elements.summaryScreen, false);
  setHudVisible(true);
  enableSpeedControl(true);
};

const endGame = () => {
  game.state.isRunning = false;
  game.state.isFinished = true;
  updateSummary();
  toggleScreen(elements.summaryScreen, true);
  setHudVisible(false);
  enableSpeedControl(false);
};

const maybeFinish = () => {
  if (!game.state.isFinished && game.state.combo >= game.state.comboGoal) {
    endGame();
  }
};

if (elements.startButton) {
  elements.startButton.addEventListener("click", () => {
    audio.playPerfect();
    startGame();
  });
}

if (elements.restartButton) {
  elements.restartButton.addEventListener("click", () => {
    audio.playGood();
    startGame();
  });
}

if (elements.speedInput) {
  elements.speedInput.min = game.state.minSpeed.toString();
  elements.speedInput.max = game.state.maxSpeed.toString();
  elements.speedInput.step = game.state.speedStep.toString();
  elements.speedInput.addEventListener("input", (event) => {
    const nextValue = parseFloat(event.target.value);
    if (Number.isFinite(nextValue)) {
      game.setSpeed(nextValue);
      setSpeedDisplay(game.state.speed);
    }
  });
}

resetGame();
setHudVisible(false);
enableSpeedControl(false);
toggleScreen(elements.startScreen, true);

const applyJudgementFeedback = (judgement) => {
  if (judgement === lastJudgement) {
    return;
  }
  lastJudgement = judgement;
  if (judgement === "PERFECT") {
    audio.playPerfect();
    particles.createPerfect();
    particles.group.position.copy(player.playerGroup.position);
  } else if (judgement === "GOOD") {
    audio.playGood();
    particles.createGood();
    particles.group.position.copy(player.playerGroup.position);
  } else if (judgement === "BAD") {
    audio.playBad();
    particles.createBad();
    particles.group.position.copy(player.playerGroup.position);
  }
};

const handleComboSpeedUps = () => {
  if (game.state.combo <= 0) {
    lastComboStep = 0;
    return;
  }
  const comboSteps = Math.floor(game.state.combo / game.state.speedStepPerfects);
  if (comboSteps > lastComboStep) {
    const steps = comboSteps - lastComboStep;
    game.registerPerfect(steps * game.state.speedStepPerfects);
    lastComboStep = comboSteps;
  }
};

const animate = () => {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), maxDelta);

  if (!game.state.isRunning) {
    renderer.render(scene, camera);
    return;
  }

  game.state.progress = (game.state.progress + game.state.speed * delta) % 1;

  const frameIndex = Math.min(
    tunnelData.frames.tangents.length - 1,
    Math.floor(game.state.progress * tunnelData.tubularSegments)
  );
  const position = tunnelData.curve.getPointAt(game.state.progress);
  const tangent = tunnelData.frames.tangents[frameIndex].clone();
  const normal = tunnelData.frames.normals[frameIndex].clone();
  const binormal = tunnelData.frames.binormals[frameIndex].clone();

  const lookAheadT =
    (game.state.progress + lookAheadDistance / tunnelData.curveLength) % 1;
  const lookAhead = tunnelData.curve.getPointAt(lookAheadT);

  controls.smoothedInput.lerp(controls.targetInput, inputSmoothing);
  const offset = controls.smoothedInput.clone().multiplyScalar(maxOffset);
  const distanceFromCenter = offset.length();

  let targetFov = baseFov;
  let tunnelOpacity = 0.4;
  let tunnelColor = 0x00ffff;
  let trailScale = 1;
  let trailOpacity = 0.5;
  let shakeIntensity = 0;
  let judgement = "READY";
  let judgementClass = "";

  if (distanceFromCenter < perfectThreshold) {
    player.playerMaterial.color.setHex(0xffffff);
    tunnelColor = 0xffffff;
    tunnelOpacity = 0.7;
    trailScale = 2.1;
    trailOpacity = 0.8;
    targetFov = 90;
    game.state.score += perfectScoreRate * delta;
    game.state.comboTimer += delta;
    judgement = "PERFECT";
    judgementClass = "state-perfect";
    if (game.state.comboTimer >= comboStep) {
      const comboSteps = Math.floor(game.state.comboTimer / comboStep);
      game.state.combo += comboSteps;
      game.state.comboTimer -= comboSteps * comboStep;
    }
  } else if (distanceFromCenter < goodThreshold) {
    player.playerMaterial.color.setHex(0xffcc66);
    tunnelOpacity = 0.5;
    tunnelColor = 0x00ffff;
    trailScale = 1.3;
    trailOpacity = 0.55;
    targetFov = 78;
    game.state.score += goodScoreRate * delta;
    game.state.comboTimer = 0;
    judgement = "GOOD";
    judgementClass = "state-good";
  } else {
    player.playerMaterial.color.setHex(0xff3344);
    tunnelOpacity = 0.3;
    tunnelColor = 0x8844ff;
    trailScale = 0.9;
    trailOpacity = 0.3;
    game.state.combo = 0;
    game.state.comboTimer = 0;
    shakeIntensity = 0.12;
    judgement = "BAD";
    judgementClass = "state-bad";
  }

  if (judgement !== lastJudgement) {
    applyJudgementFeedback(judgement);
    if (judgement === "BAD") {
      game.registerBad();
    }
  }

  handleComboSpeedUps();
  syncSpeedControl();

  tunnelData.tunnelMaterial.color.setHex(tunnelColor);
  tunnelData.tunnelMaterial.opacity = tunnelOpacity;
  player.trailMesh.scale.set(1, 1, trailScale);
  player.trailMaterial.opacity = trailOpacity;

  if (Math.abs(camera.fov - targetFov) > 0.01) {
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, fovSmoothing);
    camera.updateProjectionMatrix();
  }

  const cameraPosition = position
    .clone()
    .add(tangent.clone().multiplyScalar(-cameraDistance));
  if (shakeIntensity > 0) {
    cameraPosition.add(
      normal.clone().multiplyScalar((Math.random() - 0.5) * shakeIntensity)
    );
    cameraPosition.add(
      binormal
        .clone()
        .multiplyScalar((Math.random() - 0.5) * shakeIntensity)
    );
  }
  camera.position.copy(cameraPosition);

  smoothedUp.lerp(binormal, 0.05).normalize();
  camera.up.copy(smoothedUp);
  camera.lookAt(lookAhead);

  const playerPosition = position
    .clone()
    .add(tangent.clone().multiplyScalar(playerForward))
    .add(normal.clone().multiplyScalar(offset.x))
    .add(binormal.clone().multiplyScalar(offset.y));
  player.playerGroup.position.copy(playerPosition);
  player.playerGroup.quaternion.copy(camera.quaternion);

  particles.group.position.copy(playerPosition);
  particles.update(delta);
  stars.update(delta);

  if (elements.score) {
    elements.score.textContent = Math.floor(game.state.score).toString();
  }
  if (elements.combo) {
    elements.combo.textContent = game.state.combo.toString();
  }
  if (elements.judgement) {
    elements.judgement.textContent = judgement;
  }
  if (elements.focusCombo) {
    elements.focusCombo.textContent = `x${game.state.combo}`;
  }
  if (elements.focusHud) {
    elements.focusHud.className = judgementClass;
  }

  maybeFinish();
  renderer.render(scene, camera);
};

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
