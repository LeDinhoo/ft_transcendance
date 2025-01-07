import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { Score3D } from "./Score.js";
import { AI } from "./GameAI.js";
import { ModelLoader, ModelCache } from "./ModelLoader.js";
import { KeyboardManager } from "./KeyboardManager.js";
import { NeonBorder } from "./NeonBorder.js";
import { FlashEffect } from "./FlashEffect.js";
import { PowerManager } from "./PowerManager.js";
import {
  createCornerSpheres,
  updateOnResize,
  adjustCameraToRectangle,
} from "./Boundaries.js";
import { PaddlePower } from "./PowerBook.js";
import { AnimationManager } from "./AnimationManager.js";
import { PaddleController } from "./PaddleController.js";
import { HeightController } from "./HeightModifier.js";
import { GameHostOptions } from "./GameHostOptions.js";

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

export const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  4000
);

export let isPowerActivated = false;
const heightController1 = new HeightController();
const heightController2 = new HeightController();
let INITIAL_BALL_SPEED = 10;
let SPEED_INCREMENT = 0.75;
let MAX_BALL_SPEED = 27;
export const paddle1Speed = 10;
export const paddle2Speed = 10;
const originalBloomStrength = 0.4;
let currentBallSpeed = INITIAL_BALL_SPEED;
let ballVelocity = new THREE.Vector3(0, 0, 0);
let isBallMoving = false;
let scoreSystem;
let gameStarted = false;
let aiIsActive = false;

let maxBallSpeed = INITIAL_BALL_SPEED;

const keyboard = new KeyboardManager();

scene.background = new THREE.Color(0x111111);

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: "high-performance",
  precision: "lowp",
  samples: 1,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
document.getElementById("game").appendChild(renderer.domElement);

const renderTarget = new THREE.WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight,
  {
    samples: 1,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    colorSpace: THREE.SRGBColorSpace,
  }
);

camera.position.set(0, 1000, 0);

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  originalBloomStrength,
  0.2,
  0.3
);

const composer = new EffectComposer(renderer, renderTarget);
composer.addPass(renderScene);
composer.addPass(bloomPass);

scoreSystem = new Score3D(scene, camera, null, null, null);

function resetBall() {
  ball.position.set(0, 0, 0);
  ball.visible = false;

  setTimeout(() => {
    ball.visible = true;
  }, 500);

  isBallMoving = false;
  ballVelocity.set(0, 0, 0);
  currentBallSpeed = INITIAL_BALL_SPEED;

  trajectoryLine.visible = false;
  impactPoint.visible = false;

  setTimeout(() => {
    if (!scoreSystem.isGameOver()) {
      ball.position.set(0, 15, 0);
    }
  }, 500);
}

function launchBall() {
  if (isBallMoving || scoreSystem.isGameOver()) return;

  scene.add(ball);
  ball.visible = true;
  gameStarted = true;

  const angle = ((Math.random() * 90 - 45) * Math.PI) / 180;
  const direction = Math.random() < 0.5 ? 1 : -1;

  ballVelocity.x = direction * Math.cos(angle) * currentBallSpeed;
  ballVelocity.z = Math.sin(angle) * currentBallSpeed;

  isBallMoving = true;
}

function calculatePaddlePosition() {
  const fov = (camera.fov * Math.PI) / 180;
  const heightAtZero = 2 * Math.tan(fov / 2) * camera.position.y;
  const widthAtZero = heightAtZero * camera.aspect;

  const paddleWidth = 40;
  const offset = widthAtZero * 0.03 + paddleWidth / 2;
  const boundary = widthAtZero / 2;

  return {
    leftPaddleX: Math.round(-boundary + offset),
    rightPaddleX: Math.round(boundary - offset),
  };
}

function updatePaddlePositions() {
  const positions = calculatePaddlePosition();
  if (paddle1) paddle1.position.x = positions.leftPaddleX;
  if (paddle2) paddle2.position.x = positions.rightPaddleX;
}

const modelLoader = new ModelLoader(scoreSystem);
const modelCache = new ModelCache();

export let paddle1, paddle2, gamePlane;

modelLoader
  .loadAllModels()
  .then(
    ({
      gamePlane: loadedGamePlane,
      paddle1: loadedPaddle1,
      paddle2: loadedPaddle2,
    }) => {
      gamePlane = loadedGamePlane;
      paddle1 = loadedPaddle1;
      paddle2 = loadedPaddle2;
      updatePaddlePositions();
    }
  );

const percentages = [
  { x: 95, z: 90 },
  { x: 95, z: 90 },
  { x: 95, z: 90 },
  { x: 95, z: 90 },
];

let modelsPreloaded = false;

async function preloadModels() {
  if (modelsPreloaded) {
    return;
  }

  try {
    await modelCache.loadModel("/static/spa/game3D/models/Dynamite.glb");
    await modelCache.loadModel("/static/spa/game3D/models/Beer.glb");
    await modelCache.loadModel("/static/spa/game3D/models/Tornado.glb");
    modelsPreloaded = true;
  } catch (error) {}
}

const cornerSpheres = createCornerSpheres(scene, percentages);
adjustCameraToRectangle(camera);

const neonBorder = new NeonBorder(scene, cornerSpheres, camera);

const ballGeometry = new THREE.SphereGeometry(10, 32, 32);

const ballMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xffffff,
  emissiveIntensity: 1,
  roughness: 0,
  metalness: 1,
  toneMapped: true,
});

const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(0, 15, 0);
ball.castShadow = true;
ball.receiveShadow = true;

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
controls.enableRotate = false;
controls.enableZoom = false;
controls.enablePan = false;

function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderTarget.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);

  updateOnResize(camera, cornerSpheres, percentages);
  neonBorder.updateBorderSize();
  boundaries = getBoundariesFromCorners();
  flashEffect.handleResize();
}

window.addEventListener("resize", onWindowResize, false);

function getBoundariesFromCorners() {
  const minX = Math.min(
    cornerSpheres[0].position.x,
    cornerSpheres[2].position.x
  );
  const maxX = Math.max(
    cornerSpheres[1].position.x,
    cornerSpheres[3].position.x
  );
  const minZ = Math.min(
    cornerSpheres[0].position.z,
    cornerSpheres[1].position.z
  );
  const maxZ = Math.max(
    cornerSpheres[2].position.z,
    cornerSpheres[3].position.z
  );

  return { minX, maxX, minZ, maxZ };
}

let boundaries = getBoundariesFromCorners();

function closeWindowGame() {
  let winner = scoreSystem.getWinner();
  let player1 = scoreSystem.score.player1;
  let player2 = scoreSystem.score.player2;
  const finalScores = {
    player1,
    player2,
  };
  const message = {
    type: "gameComplete",
    data: {
      winner,
      finalScores,
    },
  };

  if (window.parent && window.parent !== window) {
    window.parent.postMessage(message, "*");
  } else {
  }
}

keyboard.onSpace(() => {
  if (scoreSystem.isGameOver()) {
    const winner = scoreSystem.getWinner();
    const scoreUser = scoreSystem.score.player1;
    const scoreOpponent = scoreSystem.score.player2;
    const result = scoreUser > scoreOpponent;

    const longestRally = scoreSystem.getMaxLongestRally();

    scoreSystem.recordGame(
      scoreUser,
      scoreOpponent,
      result,
      longestRally,
      maxBallSpeed
    );

    maxBallSpeed = INITIAL_BALL_SPEED;

    resetBall();
    gameStarted = false;
    powerManager.stopGame();
    closeWindowGame();
  } else if (!isBallMoving && !gameStarted) {
    resetBall();
    setTimeout(launchBall, 500);
    gameStarted = true;
    powerManager.startGame();
  }
});

const flashEffect = new FlashEffect(camera, scene, ball);

const trajectoryMaterial = new THREE.LineBasicMaterial({
  color: 0x00ff00,
  transparent: true,
  opacity: 0,
});

const trajectoryGeometry = new THREE.BufferGeometry();
const trajectoryLine = new THREE.Line(trajectoryGeometry, trajectoryMaterial);
scene.add(trajectoryLine);

const impactGeometry = new THREE.SphereGeometry(5, 16, 16);
const impactMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  transparent: true,
  opacity: 0,
});

const impactPoint = new THREE.Mesh(impactGeometry, impactMaterial);
scene.add(impactPoint);
impactPoint.visible = false;

function updateTrajectory() {
  if (!isBallMoving) {
    trajectoryLine.visible = false;
    impactPoint.visible = false;
    return;
  }

  trajectoryLine.visible = true;
  impactPoint.visible = true;

  const points = [];
  let finalPosition = null;

  let tempPos = new THREE.Vector3(
    ball.position.x,
    ball.position.y,
    ball.position.z
  );
  let tempVel = new THREE.Vector3(ballVelocity.x, 0, ballVelocity.z);

  const maxPoints = Math.floor(170 * (INITIAL_BALL_SPEED / currentBallSpeed));
  const numPoints = Math.max(5, maxPoints);

  for (let i = 0; i < numPoints; i++) {
    points.push(tempPos.clone());

    tempPos.x += tempVel.x;
    tempPos.z += tempVel.z;

    if (tempPos.x < boundaries.minX || tempPos.x > boundaries.maxX) {
      finalPosition = tempPos.clone();
      break;
    }

    if (tempPos.z < boundaries.minZ || tempPos.z > boundaries.maxZ) {
      tempVel.z *= -1;
      tempPos.z = Math.sign(tempPos.z) * boundaries.maxZ;
    }
  }

  if (finalPosition) {
    impactPoint.position.set(finalPosition.x, 15, finalPosition.z);
  }

  trajectoryGeometry.setFromPoints(points);
}

const animationManager = new AnimationManager(scene);
const paddlePower1 = new PaddlePower();
const paddlePower2 = new PaddlePower();

const powerManager = new PowerManager(
  scene,
  boundaries,
  paddlePower1,
  paddlePower2,
  modelCache,
  flashEffect,
  animationManager,
  modelLoader
);

const paddle1Controller = new PaddleController(paddle1Speed, {
  up: "w",
  down: "s",
});

const paddle2Controller = new PaddleController(paddle2Speed, {
  up: "arrowup",
  down: "arrowdown",
});

const gameAI = new AI(paddlePower2, powerManager, paddle1Controller);

export let launchPower1 = "e";
export let launchPower2 = "arrowleft";

function handleMessage(event) {
  if (event.data.type === "setOptions") {
    const { options, isAI, power, languageOption } = event.data.data;
    INITIAL_BALL_SPEED = options.ballSpeedStart;
    SPEED_INCREMENT = options.ballSpeedIncrease;
    MAX_BALL_SPEED = options.ballSpeedMax;
    scoreSystem.setKeyTextForTutorial(options.keyboardSettings, aiIsActive);
    scoreSystem.setLanguage(languageOption);
    scoreSystem.setScoreToWin(options.scoreToWin);
    gameAI.setDifficulty(options.difficulty);
    powerManager.setActivePowers(options.powerups);
    launchPower1 = options.keyboardSettings.player1.launchPower;
    launchPower2 = options.keyboardSettings.player2.launchPower;
    paddle1Controller.changeControlsUp(options.keyboardSettings.player1.moveUp);
    paddle1Controller.changeControlsDown(
      options.keyboardSettings.player1.moveDown
    );
    paddle2Controller.changeControlsUp(options.keyboardSettings.player2.moveUp);
    paddle2Controller.changeControlsDown(
      options.keyboardSettings.player2.moveDown
    );

    aiIsActive = !!isAI;

    if (!power) {
      isPowerActivated = false;
      powerManager.deactivatePowers();
    } else {
      isPowerActivated = true;
      powerManager.activatePowers();
    }

    console.log("Keyboard settings updated", options.keyboardSettings);

    window.removeEventListener("message", handleMessage);
  }
}

window.addEventListener("message", handleMessage);

function animate() {
  requestAnimationFrame(animate);
  preloadModels();

  animationManager.update();

  paddle1Controller.assignPaddle(paddle1);
  paddle2Controller.assignPaddle(paddle2);
  heightController1.assignPaddle(paddle1);
  heightController2.assignPaddle(paddle2);

  heightController1.updatePaddleModelHeight();
  heightController2.updatePaddleModelHeight();

  paddle2Controller.updateColor();
  paddle1Controller.updateColor();

  flashEffect.update();

  if (keyboard.isPressed(launchPower1)) {
    if (paddle1 && paddlePower1.hasPower("power1")) {
      powerManager.launchGrenade(1);
    } else if (paddle1 && paddlePower1.hasPower("power2")) {
      powerManager.launchInverseShot(1, paddle2Controller);
    } else if (paddle1 && paddlePower1.hasPower("power3")) {
      powerManager.launchReductShot(1, heightController2);
    }
  }

  if (keyboard.isPressed(launchPower2)) {
    if (paddle2 && paddlePower2.hasPower("power1")) {
      powerManager.launchGrenade(2);
    } else if (paddle2 && paddlePower2.hasPower("power2")) {
      powerManager.launchInverseShot(2, paddle1Controller);
    } else if (paddle2 && paddlePower2.hasPower("power3")) {
      powerManager.launchReductShot(2, heightController1);
    }
  }

  const ballRadius = 10;

  if (!scoreSystem.isGameOver()) {
    paddle1Controller.move(
      boundaries,
      gameStarted,
      keyboard,
      heightController1.getHeight()
    );
    if (!aiIsActive) {
      paddle2Controller.move(
        boundaries,
        gameStarted,
        keyboard,
        heightController2.getHeight()
      );
    }
  }

  if (isBallMoving && !scoreSystem.isGameOver()) {
    updateTrajectory();

    if (aiIsActive) {
      gameAI.move(
        paddle2,
        ball.position,
        ballVelocity,
        impactPoint.position,
        boundaries
      );
      gameAI.loadPowerManager(powerManager);
      gameAI.updatePowerManager(
        paddle2,
        heightController2,
        heightController1,
        paddle1,
        paddle2Controller
      );
    }

    ball.position.x += ballVelocity.x;
    ball.position.z += ballVelocity.z;

    if (Math.abs(ball.position.z) + ballRadius > boundaries.maxZ) {
      ballVelocity.z *= -1;

      const direction = Math.sign(ball.position.z);
      ball.position.z = direction * (boundaries.maxZ - ballRadius - 0.5);
    }

    if (ballVelocity.x < 0) {
      const paddleLeftX = paddle1.position.x;

      if (
        ball.position.x <= paddleLeftX + 30 &&
        ball.position.x >= paddleLeftX - 30 &&
        Math.abs(ball.position.z - paddle1.position.z) <
          heightController1.getHeight() / 1.8
      ) {
        currentBallSpeed = Math.min(
          currentBallSpeed + SPEED_INCREMENT,
          MAX_BALL_SPEED
        );

        if (currentBallSpeed > maxBallSpeed) {
          maxBallSpeed = currentBallSpeed;
        }

        const relativeImpactZ =
          (ball.position.z - paddle1.position.z) /
          (heightController1.getHeight() / 2);
        const bounceAngle = (relativeImpactZ * (65 * Math.PI)) / 180;
        ballVelocity.x = currentBallSpeed * Math.cos(bounceAngle);
        ballVelocity.z = currentBallSpeed * Math.sin(bounceAngle);
        scoreSystem.setLongestRally(scoreSystem.getLongestRally() + 1);
      }
    }

    if (ballVelocity.x > 0) {
      const paddleRightX = paddle2.position.x;

      if (
        ball.position.x >= paddleRightX - 30 &&
        ball.position.x <= paddleRightX + 30 &&
        Math.abs(ball.position.z - paddle2.position.z) <
          heightController2.getHeight() / 1.8
      ) {
        currentBallSpeed = Math.min(
          currentBallSpeed + SPEED_INCREMENT,
          MAX_BALL_SPEED
        );

        if (currentBallSpeed > maxBallSpeed) {
          maxBallSpeed = currentBallSpeed;
        }

        const relativeImpactZ =
          (ball.position.z - paddle2.position.z) /
          (heightController2.getHeight() / 2);
        const bounceAngle = (relativeImpactZ * (65 * Math.PI)) / 180;
        ballVelocity.x = -currentBallSpeed * Math.cos(bounceAngle);
        ballVelocity.z = currentBallSpeed * Math.sin(bounceAngle);
        scoreSystem.setLongestRally(scoreSystem.getLongestRally() + 1);
      }
    }

    if (ball.position.x < paddle1.position.x - 10) {
      neonBorder.flashNeonBorder(bloomPass, 2);
      setTimeout(() => {
        neonBorder.flashNeonBorder(bloomPass, 2);
      }, 370);
      neonBorder.resetNeonColorToWhite();
      scoreSystem.updateScore(2);
      if (scoreSystem.isGameOver()) {
        powerManager.stopGame();
        isBallMoving = false;
        ball.position.set(0, -100, 0);
        paddlePower1.deactivateAllPowers();
        paddlePower2.deactivateAllPowers();
        scoreSystem.setMaxLongestRally(scoreSystem.getLongestRally());
      } else {
        resetBall();
        scoreSystem.setMaxLongestRally(scoreSystem.getLongestRally());
        scoreSystem.setLongestRally(0);
        setTimeout(launchBall, 1250);
      }
    } else if (ball.position.x > paddle2.position.x + 10) {
      neonBorder.flashNeonBorder(bloomPass, 1);
      setTimeout(() => {
        neonBorder.flashNeonBorder(bloomPass, 1);
      }, 370);
      neonBorder.resetNeonColorToWhite();
      scoreSystem.updateScore(1);
      if (scoreSystem.isGameOver()) {
        powerManager.stopGame();
        isBallMoving = false;
        ball.position.set(0, -100, 0);
        paddlePower1.deactivateAllPowers();
        paddlePower2.deactivateAllPowers();
        scoreSystem.setMaxLongestRally(scoreSystem.getLongestRally());
      } else {
        resetBall();
        scoreSystem.setMaxLongestRally(scoreSystem.getLongestRally());
        scoreSystem.setLongestRally(0);
        setTimeout(launchBall, 1250);
      }
    }
  }

  if (!scoreSystem.isGameOver()) {
    powerManager.update(paddle1, paddle2, gameStarted);
  }

  composer.render();
}

animate();
