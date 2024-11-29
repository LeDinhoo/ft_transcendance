// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
// import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
// import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
// import { Score3D } from "./Score3D.js";
// import { AI } from "./AI.js";
// import { ModelLoader, ModelCache } from "./ModelLoader.js";
// import { KeyboardManager } from "./KeyboardManager.js";
// import { NeonBorder } from "./NeonBorder.js";
// import { FlashEffect } from "./FlashEffect.js";
// import { InverseShot } from "./InverseShot.js";
// import { ReduceShot } from "./ReduceShot.js";
// import { PowerManager } from "./PowerManager.js";
// import {
//   createCornerSpheres,
//   updateOnResize,
//   adjustCameraToRectangle,
// } from "./BoundariesWithSphere.js";
// import { PaddlePower } from "./PowerBook.js";
// import { AnimationManager } from "./AnimationManager.js";
// import { PaddleController } from "./PaddleController.js";

import * as THREE from "three";
import { OrbitControls } from "./libs/OrbitControls.js";
import { EffectComposer } from "./libs/EffectComposer.js";
import { RenderPass } from "./libs/RenderPass.js";
import { UnrealBloomPass } from "./libs/UnrealBloomPass.js";
import { Score3D } from "./Score3D.js";
import { AI } from "./AI.js";
import { ModelLoader, ModelCache } from "./ModelLoader.js";
import { KeyboardManager } from "./KeyboardManager.js";
import { NeonBorder } from "./NeonBorder.js";
import { FlashEffect } from "./FlashEffect.js";
import { InverseShot } from "./InverseShot.js";
import { ReduceShot } from "./ReduceShot.js";
import { TemporaryCube, PowerManager } from "./PowerManager.js";
import {
  createCornerSpheres,
  updateOnResize,
  adjustCameraToRectangle,
} from "./BoundariesWithSphere.js";
import { PaddlePower } from "./PowerBook.js";
import { AnimationManager } from "./AnimationManager.js";
import { PaddleController } from "./PaddleController.js";

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

export const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  4000
);

const gameAI = new AI();

export const PADDLE_HEIGHT = 135;
const INITIAL_BALL_SPEED = 10;
const SPEED_INCREMENT = 0.75;
const MAX_BALL_SPEED = 27;
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

// export let longestRally = 0;

const keyboard = new KeyboardManager();

scene.background = new THREE.Color(0x111111);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
  precision: "mediump",
  samples: 2,
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
    samples: 2,
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
  originalBloomStrength, // strength
  0.2, // radius
  0.85 // threshold
);

const composer = new EffectComposer(renderer, renderTarget);
composer.addPass(renderScene);
composer.addPass(bloomPass);

scoreSystem = new Score3D(scene, camera, null, null, null);

function resetBall() {
  ball.position.set(0, -100, 0);
  ball.visible = false;
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

  // Ajouter la balle à la scène quand le jeu commence
  scene.add(ball); // Ajout de la balle à la scène
  ball.visible = true; // Rendre la balle visible lorsque le jeu commence
  gameStarted = true;

  const angle = ((Math.random() * 90 - 45) * Math.PI) / 180;
  const direction = Math.random() < 0.5 ? 1 : -1;

  ballVelocity.x = direction * Math.cos(angle) * currentBallSpeed;
  ballVelocity.z = Math.sin(angle) * currentBallSpeed;

  isBallMoving = true;
}

// function centerObject(object) {
//   const box = new THREE.Box3().setFromObject(object);
//   const center = box.getCenter(new THREE.Vector3());

//   object.traverse((child) => {
//     if (child.isMesh) {
//       child.geometry.translate(-center.x, -center.y, -center.z);
//     }
//   });

//   object.position.add(center);
// }

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
  { x: 95, z: 90 }, // Coin 1
  { x: 95, z: 90 }, // Coin 2
  { x: 95, z: 90 }, // Coin 3
  { x: 95, z: 90 }, // Coin 4
];

//A Mettre a jour avec les nouveaux modeles
async function preloadModels() {
  try {
    await modelCache.loadModel("white_sunglasses.glb");
  } catch (error) {
    console.error("Erreur lors du préchargement des modèles : ", error);
  }
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

// function closeWindowGame()
// {
//   window.close();
// }
// function closeWindowGame() {
//   console.log("Jeu terminé, notification envoyée au parent.");
//   const message = {
//     type: "gameComplete",
//     data: { winner: scoreSystem.getWinner() },
//   };
//   console.log("Message envoyé au parent :", message);
//   if (window.parent) {
//     // Vérifiez si le parent est accessible et envoyez un message
//     window.parent.postMessage(message,"*");
//   }
//   window.close();
// }

function closeWindowGame() {
  const message = {
    type: "gameComplete",
    data: { winner: scoreSystem.getWinner() },
  };
  console.log("Message envoyé au parent :", message);

  if (window.parent && window.parent !== window) {
    // Envoyer un message au parent pour lui signaler la fin du jeu
    window.parent.postMessage(message, "*");
  } else {
    console.error(
      "Impossible d'envoyer un message au parent : window.parent inaccessible."
    );
  }
}

keyboard.onSpace(() => {
  if (scoreSystem.isGameOver()) {
    const winner = scoreSystem.getWinner();
    const scoreUser = scoreSystem.score.player1;
    const scoreOpponent = scoreSystem.score.player2;
    const result = scoreUser > scoreOpponent;

    const longestRally = scoreSystem.getLongestRally();
    console.log("Fin du jeu - longestRally :", longestRally);

    console.log("Fin du jeu - maxBallSpeed :", maxBallSpeed);

    // scoreSystem.recordGame(scoreUser, scoreOpponent, result, longestRally);
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
    console.log("Quiting Game");
    closeWindowGame();
    // closeWindowGame();
    // Fonction pour fermer la fenetre
  } else if (!isBallMoving && !gameStarted) {
    resetBall();
    setTimeout(launchBall, 500);
    gameStarted = true;
    powerManager.startGame();
    console.log("Launch First Game");
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

const difficultyDisplay = document.createElement("div");
difficultyDisplay.style.cssText = `
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 8px 16px;
  border-radius: 9999px;
  color: white;
  font-family: Arial, sans-serif;
  font-weight: bold;
  font-size: 16px;
  z-index: 1000;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

document.body.appendChild(difficultyDisplay);

window.addEventListener("keydown", (event) => {
  if (event.key === "c" || event.key === "C") {
    const newDifficulty = gameAI.cycleDifficulty();
    difficultyDisplay.textContent = `AI: ${newDifficulty.name}`;
    difficultyDisplay.style.backgroundColor = newDifficulty.color;
  }
});

const animationManager = new AnimationManager(scene);

const Inverse1 = new InverseShot(
  scene,
  1,
  modelCache,
  "stylized_wooden_tankard.glb",
  modelLoader
);

const Inverse2 = new InverseShot(
  scene,
  2,
  modelCache,
  "stylized_wooden_tankard.glb",
  modelLoader
);

const Reduce1 = new ReduceShot(
  scene,
  1,
  modelCache,
  "capsule_item.glb",
  modelLoader
);
const Reduce2 = new ReduceShot(
  scene,
  2,
  modelCache,
  "capsule_item.glb",
  modelLoader
);

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

// Assignation des touches a ce moment la
const paddle1Controller = new PaddleController(paddle1Speed, {
  up: "w",
  down: "s",
});

// Assignation des touches a ce moment la
const paddle2Controller = new PaddleController(paddle2Speed, {
  up: "arrowup",
  down: "arrowdown",
});

//Switch AI on/off
keyboard.onKey("j", () => {
  if (aiIsActive) {
    aiIsActive = false;
  } else {
    aiIsActive = true;
  }
});

keyboard.onKey("e", () => {
  if (paddle1 && paddlePower1.hasPower("power1")) {
    powerManager.launchGrenade(1);
  } else if (paddle1 && paddlePower1.hasPower("power2")) {
    // Inverse1.startAnimation(paddle1.position);
    powerManager.launchInverseShot(1, paddle2Controller);
    // paddle2Controller.activeReverse();
  } else if (paddle1 && paddlePower1.hasPower("power3")) {
    Reduce1.startAnimation(paddle1.position);
  }
});

keyboard.onKey("arrowleft", () => {
  if (paddle2 && paddlePower2.hasPower("power1")) {
    powerManager.launchGrenade(2);
  } else if (paddle2 && paddlePower2.hasPower("power2")) {
    // Inverse2.startAnimation(paddle2.position);
    powerManager.launchInverseShot(2, paddle1Controller);
    // paddle1Controller.activeReverse();
  } else if (paddle2 && paddlePower2.hasPower("power3")) {
    Reduce2.startAnimation(paddle2.position);
  }
});

// let previousTime = performance.now(); // Temps précédent
// let fps = 0; // Variable pour stocker les FPS

// function calculateFPS() {
//   const currentTime = performance.now(); // Temps actuel
//   const deltaTime = currentTime - previousTime; // Temps écoulé entre les frames
//   fps = 1000 / deltaTime; // Calcul des FPS (1 seconde divisée par le temps entre les frames)
//   previousTime = currentTime; // Mettre à jour le temps précédent
// }

function animate() {
  requestAnimationFrame(animate);
  preloadModels();
  animationManager.update();
  paddle1Controller.assignPaddle(paddle1);
  paddle2Controller.assignPaddle(paddle2);

  if (!scoreSystem.isGameOver()) {
    paddle1Controller.move(boundaries, gameStarted, keyboard, PADDLE_HEIGHT);
    if (!aiIsActive) {
      paddle2Controller.move(boundaries, gameStarted, keyboard, PADDLE_HEIGHT);
    }
  }

  if (paddle1 && paddle2) {
    if (paddlePower1.hasPower("power1")) {
      // Grenade1.update(paddle1, paddlePower1, animationManager);
    }
    if (paddlePower1.hasPower("power2")) {
      // Inverse1.update(paddle1, paddlePower1, paddle2);
    }
    if (paddlePower1.hasPower("power3")) {
      Reduce1.update(paddle1, paddlePower1, paddle2);
    }
    if (paddlePower2.hasPower("power1")) {
      // Grenade2.update(paddle2, paddlePower2);
    }
    if (paddlePower2.hasPower("power2")) {
      // Inverse2.update(paddle2, paddlePower2, paddle1);
    }
    if (paddlePower2.hasPower("power3")) {
      Reduce2.update(paddle2, paddlePower2, paddle1);
    }
  }

  flashEffect.update();

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
      gameAI.updatePowerManager();
    }

    ball.position.x += ballVelocity.x;
    ball.position.z += ballVelocity.z;

    if (Math.abs(ball.position.z) > boundaries.maxZ) {
      ballVelocity.z *= -1;
      ball.position.z = Math.sign(ball.position.z) * boundaries.maxZ;
    }

    if (ballVelocity.x < 0) {
      const paddleLeftX = paddle1.position.x;

      if (
        ball.position.x <= paddleLeftX + 30 &&
        ball.position.x >= paddleLeftX - 30 &&
        Math.abs(ball.position.z - paddle1.position.z) < PADDLE_HEIGHT / 1.8
      ) {
        currentBallSpeed = Math.min(
          currentBallSpeed + SPEED_INCREMENT,
          MAX_BALL_SPEED
        );

        // Mettez à jour la vitesse maximale atteinte
        if (currentBallSpeed > maxBallSpeed) {
          maxBallSpeed = currentBallSpeed;
        }

        const relativeImpactZ =
          (ball.position.z - paddle1.position.z) / (PADDLE_HEIGHT / 2);
        const bounceAngle = (relativeImpactZ * Math.PI) / 3;
        ballVelocity.x = currentBallSpeed * Math.cos(bounceAngle);
        ballVelocity.z = currentBallSpeed * Math.sin(bounceAngle);
        scoreSystem.setLongestRally(scoreSystem.getLongestRally() + 1);
        // longestRally++;
      }
    }

    if (ballVelocity.x > 0) {
      const paddleRightX = paddle2.position.x;

      if (
        ball.position.x >= paddleRightX - 30 &&
        ball.position.x <= paddleRightX + 30 &&
        Math.abs(ball.position.z - paddle2.position.z) < PADDLE_HEIGHT / 1.8
      ) {
        currentBallSpeed = Math.min(
          currentBallSpeed + SPEED_INCREMENT,
          MAX_BALL_SPEED
        );

        if (currentBallSpeed > maxBallSpeed) {
          maxBallSpeed = currentBallSpeed;
        }

        const relativeImpactZ =
          (ball.position.z - paddle2.position.z) / (PADDLE_HEIGHT / 2);
        const bounceAngle = (relativeImpactZ * Math.PI) / 3;
        ballVelocity.x = -currentBallSpeed * Math.cos(bounceAngle);
        ballVelocity.z = currentBallSpeed * Math.sin(bounceAngle);
        // longestRally++;
        scoreSystem.setLongestRally(scoreSystem.getLongestRally() + 1);
        // scoreSystem.setLongestRally(longestRally); // Mettez à jour longestRally dans Score3D
      }
    }

    if (ball.position.x < paddle1.position.x) {
      neonBorder.flashNeonBorder(bloomPass);
      scoreSystem.updateScore(2);
      if (scoreSystem.isGameOver()) {
        powerManager.stopGame();
        isBallMoving = false;
        ball.position.set(0, -100, 0);
        // Grenade1.cleanCube();
        // Grenade2.cleanCube();
        paddlePower1.deactivateAllPowers();
        paddlePower2.deactivateAllPowers();
        //export longestRally;
        console.log("Longest Rally player gauche:", longestRally);
        longestRally = 0;
      } else {
        resetBall();
        setTimeout(launchBall, 500);
        // setTimeout(AI.resetLastUpdate, 100);
      }
    } else if (ball.position.x > paddle2.position.x) {
      neonBorder.flashNeonBorder(bloomPass);
      scoreSystem.updateScore(1);
      if (scoreSystem.isGameOver()) {
        powerManager.stopGame();
        isBallMoving = false;
        ball.position.set(0, -100, 0);
        // Grenade1.cleanCube();
        // Grenade2.cleanCube();
        paddlePower1.deactivateAllPowers();
        paddlePower2.deactivateAllPowers();
        //export longestRally;
        console.log("Longest Rally player droite:", longestRally);
        longestRally = 0;
      } else {
        resetBall();
        setTimeout(launchBall, 500);
        // setTimeout(AI.resetLastUpdate, 550);
      }
    }
  }

  if (!scoreSystem.isGameOver()) {
    powerManager.update(paddle1, paddle2, gameStarted);
  }

  // Calcul des FPS
  // calculateFPS();

  // Vous pouvez afficher les FPS dans la console ou sur l'écran
  // console.clear();
  // console.log(`FPS: ${Math.round(fps)}`);

  composer.render();
}

// export function recordGame(scoreUser, scoreOpponent, result) {
//   console.log("fonction recordGame appele");
//   const data = {
//     score_user: scoreUser,
//     score_opponent: scoreOpponent,
//     result: result, // true pour victoire, false pour défaite
//     // longest_rally: longestRally,
//   };

//   console.log("data :", data.score_user, data.score_opponent, data.result);
//   const csrftoken = getCookie("crsftoken");
//   console.log("CRSF TOKEN: ", csrftoken);
//   fetch("/api/record-game/", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "X-CSRFToken": getCookie("csrftoken"), // Récupère le token CSRF
//     },
//     credentials: "include", // Permet d'envoyer les cookies d'authentification
//     body: JSON.stringify(data),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       if (data.message) {
//         console.log(data.message); // Confirmation
//       } else if (data.error) {
//         console.error(data.error); // Affiche une erreur si présente
//       }
//     })
//     .catch((error) => console.error("Error:", error));
// }

// Fonction utilitaire pour récupérer le token CSRF
// function getCookie(name) {
//   let cookieValue = null;
//   if (document.cookie && document.cookie !== "") {
//     const cookies = document.cookie.split(";");
//     for (let i = 0; i < cookies.length; i++) {
//       const cookie = cookies[i].trim();
//       if (cookie.substring(0, name.length + 1) === name + "=") {
//         cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//         break;
//       }
//     }
//   }
//   return cookieValue;
// }

animate();
