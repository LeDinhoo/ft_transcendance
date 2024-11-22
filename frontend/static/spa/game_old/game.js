import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { Score3D } from "./Score3D.js";

// Ajouter avec les autres variables globales
let scoreSystem;
const PADDLE_HEIGHT = 135;

// export const gui = new lil.GUI();
// Configuration de base
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

export const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);

// Au début de game.js
if (window.gameCleanup) {
  window.gameCleanup();
}


// Ajouter près du début de game.js
window.dispatchGameEnd = function(winner) {
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'gameComplete',
      data: { winner: winner - 1 }  // -1 car le tournament attend 0 ou 1
    }, '*');
  }
};

window.gameCleanup = function() {
  if (typeof renderer !== 'undefined') {
    renderer.dispose();
  }
  if (typeof scene !== 'undefined') {
    scene.traverse(object => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
  if (typeof composer !== 'undefined') {
    composer.dispose();
  }

  // Supprimer les event listeners
  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('keydown', null);
  window.removeEventListener('keyup', null);

  // Nettoyer les variables globales
  window.scene = undefined;
  window.camera = undefined;
  window.renderer = undefined;
  window.composer = undefined;
  window.controls = undefined;
}

// Modifier la création du renderer
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

// Créer un render target avec MSAA
const renderTarget = new THREE.WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight,
  {
    samples: 2,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    colorSpace: THREE.SRGBColorSpace, // Remplace encoding
  }
);

camera.position.set(0, 1000, 0);

// Variables pour l'effet de glow du néon
let neonMaterial;
let originalNeonColor = 0xffffff;
let scoringFlashColor = 0xffffff;
let isFlashing = false;
let flashDuration = 300;
let originalBloomStrength = 0.4;
let flashBloomStrength = 1.5;
const INITIAL_BALL_SPEED = 8; // Vitesse initiale de la balle
const SPEED_INCREMENT = 1; // Augmentation de la vitesse à chaque rebond
const MAX_BALL_SPEED = 30; // Vitesse maximale de la balle
let currentBallSpeed = INITIAL_BALL_SPEED; // Variable pour suivre la vitesse actuelle

// Post-processing
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  originalBloomStrength, // strength
  0.2, // radius
  0.85 // threshold
);

// Modifier la création du composer
const composer = new EffectComposer(renderer, renderTarget);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Après la création de la scène et de la caméra, initialiser le système de score
scoreSystem = new Score3D(scene, camera);

// Variables pour les objets et le jeu
let paddle1, paddle2, gamePlane, border;
let ballVelocity = new THREE.Vector3(0, 0, 0);
let isBallMoving = false;
const BALL_SPEED = 8;

// Modifier la fonction resetBall
function resetBall() {
  ball.position.set(0, -100, 0);
  isBallMoving = false;
  ballVelocity.set(0, 0, 0);
  currentBallSpeed = INITIAL_BALL_SPEED;

  // Cacher la trajectoire et le point d'impact
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

  const angle = ((Math.random() * 90 - 45) * Math.PI) / 180;
  const direction = Math.random() < 0.5 ? 1 : -1;

  ballVelocity.x = direction * Math.cos(angle) * currentBallSpeed;
  ballVelocity.z = Math.sin(angle) * currentBallSpeed;

  isBallMoving = true;
}
// Gestionnaire d'événements pour la touche espace
window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    resetBall();
    setTimeout(launchBall, 500);
  }
});

// Fonction pour créer le contour néon
function createNeonBorder() {
  const borderGroup = new THREE.Group();

  // Utiliser MeshBasicMaterial pour un meilleur effet de glow
  neonMaterial = new THREE.MeshBasicMaterial({
    color: originalNeonColor,
    toneMapped: false,
  });

  function createBorderSegment(width, height, depth, x, y, z) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const segment = new THREE.Mesh(geometry, neonMaterial);
    segment.position.set(x, y, z);
    return segment;
  }

  const width = 2000;
  const height = 5;
  const depth = 1000;
  const borderWidth = 5;

  const leftBorder = createBorderSegment(
    borderWidth,
    height,
    depth,
    -width / 2,
    10,
    0
  );
  const rightBorder = createBorderSegment(
    borderWidth,
    height,
    depth,
    width / 2,
    10,
    0
  );
  const topBorder = createBorderSegment(
    width + borderWidth,
    height,
    borderWidth,
    0,
    10,
    -depth / 2
  );
  const bottomBorder = createBorderSegment(
    width + borderWidth,
    height,
    borderWidth,
    0,
    10,
    depth / 2
  );

  borderGroup.add(leftBorder);
  borderGroup.add(rightBorder);
  borderGroup.add(topBorder);
  borderGroup.add(bottomBorder);

  return borderGroup;
}

function flashNeonBorder() {
  if (!isFlashing) {
    isFlashing = true;

    let startTime = performance.now();

    function animateFlash() {
      const elapsed = performance.now() - startTime;
      const progress = elapsed / flashDuration;

      if (progress < 1) {
        // Utiliser une courbe en cloche pour une seule pulsation
        const pulseIntensity =
          flashBloomStrength * Math.sin(progress * Math.PI); // Un seul cycle de 0 à π

        bloomPass.strength = originalBloomStrength + pulseIntensity;

        // Transition de couleur progressive
        const colorMix = Math.sin(progress * Math.PI);
        neonMaterial.color
          .setHex(scoringFlashColor)
          .lerp(new THREE.Color(originalNeonColor), 1 - colorMix);

        requestAnimationFrame(animateFlash);
      } else {
        // Réinitialiser les paramètres
        bloomPass.strength = originalBloomStrength;
        neonMaterial.color.setHex(originalNeonColor);
        isFlashing = false;
      }
    }

    animateFlash();
  }
}

// Fonction pour centrer la géométrie d'un objet
function centerObject(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());

  object.traverse((child) => {
    if (child.isMesh) {
      child.geometry.translate(-center.x, -center.y, -center.z);
    }
  });

  object.position.add(center);
}

// Fonction pour calculer la position des paddles
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

// Fonction pour mettre à jour la position des paddles
function updatePaddlePositions() {
  const positions = calculatePaddlePosition();
  if (paddle1) paddle1.position.x = positions.leftPaddleX;
  if (paddle2) paddle2.position.x = positions.rightPaddleX;
}

// Fonction pour mettre à jour la taille du contour
function updateBorderSize() {
  if (border) {
    const fov = (camera.fov * Math.PI) / 180;
    const heightAtZero = 2 * Math.tan(fov / 2) * camera.position.y;
    const widthAtZero = heightAtZero * camera.aspect;

    const scale = (widthAtZero / 2000) * 0.97;
    border.scale.set(scale, 1, scale * 0.9);
  }
}

// Loader GLTF
const loader = new GLTFLoader();

// Chargement du plan
loader.load("./plan.glb", function (gltf) {
  gamePlane = gltf.scene;
  gamePlane.rotation.y = Math.PI / 2;
  scene.add(gamePlane);
  gamePlane.scale.set(30, 30, 30);
  gamePlane.position.set(0, 6, 0);

  gamePlane.traverse((child) => {
    if (child.isMesh) {
      child.receiveShadow = true;
      child.castShadow = false;
      child.material.color.setHex(0x000000);
      child.material.roughness = 0.330709;
      child.material.metalness = 0;
    }
  });
});

// Chargement du paddle1
loader.load("./paddle1.glb", function (gltf) {
  paddle1 = gltf.scene;
  centerObject(paddle1);
  paddle1.rotation.y = Math.PI;
  paddle1.scale.set(20, 20, 20);

  paddle1.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = false;
      child.material.color.setHex(0xff4500);
      child.material.roughness = 0.3;
      child.material.metalness = 0.5;
    }
  });

  scene.add(paddle1);
  updatePaddlePositions();
});

// Chargement du paddle2
loader.load("./paddle1.glb", function (gltf) {
  paddle2 = gltf.scene;
  centerObject(paddle2);
  paddle2.rotation.y = Math.PI;
  paddle2.scale.set(20, 20, 20);

  paddle2.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = false;
      child.material.color.setHex(0x0d9bff);
      child.material.roughness = 0.3;
      child.material.metalness = 0.5;
    }
  });

  scene.add(paddle2);
  updatePaddlePositions();
});

// Création du contour néon
border = createNeonBorder();
scene.add(border);

// Création de la balle
const ballGeometry = new THREE.SphereGeometry(10, 32, 32);

const ballMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xffffff,
  emissiveIntensity: 0.5, // réduit de 2 à 0.5
  roughness: 0.3,
  metalness: 1,
  toneMapped: false,
});

const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(0, 15, 0);
ball.castShadow = true;
ball.receiveShadow = true;
scene.add(ball);

// Contrôles
export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
controls.enableRotate = false;
controls.enableZoom = false;
controls.enablePan = false;

// Event Listeners
controls.addEventListener("change", () => {
  updatePaddlePositions();
  updateBorderSize();
});

// Mettre à jour la fonction de redimensionnement
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  // Mettre à jour aussi le render target
  renderTarget.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);

  if (scoreSystem) {
    scoreSystem.updatePosition();
  }

  updatePaddlePositions();
  updateBorderSize();
}

window.addEventListener("resize", onWindowResize, false);

// Ajouter cette fonction pour calculer les limites du terrain
function calculateBoundaries() {
  const fov = (camera.fov * Math.PI) / 180;
  const heightAtZero = 2 * Math.tan(fov / 2) * camera.position.y;
  const widthAtZero = heightAtZero * camera.aspect;

  // Utiliser les mêmes facteurs d'échelle que le contour néon
  const scaleX = (widthAtZero / 2000) * 0.97;
  const scaleZ = scaleX * 0.9;

  // La largeur et profondeur de base du contour néon est 2000 et 1000
  return {
    maxX: (2000 / 2) * scaleX - 15, // -20 pour éviter que la balle touche le néon
    maxZ: (1000 / 2) * scaleZ - 10,
  };
}

// Ajouter ces variables en haut du fichier avec les autres
const paddle1Speed = 10; // Vitesse de déplacement du paddle
// Modifier la structure des keys pour inclure les flèches
const keys = {
  w: false,
  s: false,
  arrowleft: false,
  arrowright: false,
};

// Modifier l'event listener de la touche espace
window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    if (scoreSystem.isGameOver()) {
      resetBall();
    } else if (!isBallMoving) {
      resetBall();
      setTimeout(launchBall, 500);
    }
  }
});

// Modifier les event listeners pour inclure les nouvelles touches
window.addEventListener("keydown", (event) => {
  switch (event.key.toLowerCase()) {
    case "w":
      keys.w = true;
      break;
    case "s":
      keys.s = true;
      break;
    case "arrowleft":
      keys.arrowleft = true;
      break;
    case "arrowright":
      keys.arrowright = true;
      break;
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.key.toLowerCase()) {
    case "w":
      keys.w = false;
      break;
    case "s":
      keys.s = false;
      break;
    case "arrowleft":
      keys.arrowleft = false;
      break;
    case "arrowright":
      keys.arrowright = false;
      break;
  }
});
function movePaddle1() {
  if (!paddle1) return;

  const boundaries = calculateBoundaries();
  const paddleLimit = boundaries.maxZ - PADDLE_HEIGHT / 2; // On soustrait la moitié de la hauteur du paddle

  // Monter avec D
  if (keys.w && paddle1.position.z > -paddleLimit) {
    paddle1.position.z -= paddle1Speed;
  }
  // Descendre avec A
  if (keys.s && paddle1.position.z < paddleLimit) {
    paddle1.position.z += paddle1Speed;
  }

  // S'assurer que le paddle ne dépasse pas les limites
  paddle1.position.z = Math.max(
    -paddleLimit,
    Math.min(paddleLimit, paddle1.position.z)
  );
}

// Ajouter la fonction pour le paddle2
function movePaddle2() {
  if (!paddle2) return;

  const boundaries = calculateBoundaries();
  const paddleLimit = boundaries.maxZ - PADDLE_HEIGHT / 2;

  // Monter avec flèche haut
  if (keys.arrowleft && paddle2.position.z > -paddleLimit) {
    paddle2.position.z -= paddle1Speed;
  }
  // Descendre avec flèche bas
  if (keys.arrowright && paddle2.position.z < paddleLimit) {
    paddle2.position.z += paddle1Speed;
  }

  // S'assurer que le paddle ne dépasse pas les limites
  paddle2.position.z = Math.max(
    -paddleLimit,
    Math.min(paddleLimit, paddle2.position.z)
  );
}

// Ajouter après la création de la balle
// Création de la ligne de trajectoire
const trajectoryMaterial = new THREE.LineBasicMaterial({
  color: 0x00ff00,
  transparent: true,
  opacity: 0,
});
const trajectoryGeometry = new THREE.BufferGeometry();
const trajectoryLine = new THREE.Line(trajectoryGeometry, trajectoryMaterial);
scene.add(trajectoryLine);

// Ajouter après la création de la ligne de trajectoire
// Création du point d'impact
const impactGeometry = new THREE.SphereGeometry(5, 16, 16);
const impactMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  transparent: true,
  opacity: 0,
});
const impactPoint = new THREE.Mesh(impactGeometry, impactMaterial);
scene.add(impactPoint);
impactPoint.visible = false;

// Ajouter après les autres variables globales
let lastLogTime = 0;
const LOG_INTERVAL = 1000; // 1 seconde en millisecondes

function updateTrajectory() {
  if (!isBallMoving) {
    trajectoryLine.visible = false;
    impactPoint.visible = false;
    return;
  }

  trajectoryLine.visible = true;
  impactPoint.visible = true; // Force le point à rester visible

  const points = [];
  const boundaries = calculateBoundaries();
  let finalPosition = null;

  let tempPos = new THREE.Vector3(
    ball.position.x,
    ball.position.y,
    ball.position.z
  );
  let tempVel = new THREE.Vector3(ballVelocity.x, 0, ballVelocity.z);
  let lastValidPosition = tempPos.clone();

  const maxPoints = Math.floor(170 * (INITIAL_BALL_SPEED / currentBallSpeed));
  const numPoints = Math.max(5, maxPoints);

  for (let i = 0; i < numPoints; i++) {
    points.push(tempPos.clone());
    lastValidPosition.copy(tempPos);

    tempPos.x += tempVel.x;
    tempPos.z += tempVel.z;

    // Vérifier si la balle sort des limites (but)
    if (tempPos.x < paddle1.position.x || tempPos.x > paddle2.position.x) {
      finalPosition = lastValidPosition.clone();
      break;
    }

    // Rebonds sur les murs
    if (Math.abs(tempPos.z) > boundaries.maxZ) {
      tempVel.z *= -1;
      tempPos.z = Math.sign(tempPos.z) * boundaries.maxZ;
    }

    // Vérifier collision avec paddle1
    if (tempVel.x < 0) {
      const paddleLeftX = paddle1.position.x;
      if (
        tempPos.x <= paddleLeftX + 30 &&
        tempPos.x >= paddleLeftX - 30 &&
        Math.abs(tempPos.z - paddle1.position.z) < PADDLE_HEIGHT / 2
      ) {
        const relativeImpactZ =
          (tempPos.z - paddle1.position.z) / (PADDLE_HEIGHT / 2);
        const bounceAngle = (relativeImpactZ * Math.PI) / 3;
        const speed = Math.sqrt(tempVel.x * tempVel.x + tempVel.z * tempVel.z);

        tempVel.x = speed * Math.cos(bounceAngle);
        tempVel.z = speed * Math.sin(bounceAngle);
      }
    }

    // Vérifier collision avec paddle2
    if (tempVel.x > 0) {
      const paddleRightX = paddle2.position.x;
      if (
        tempPos.x >= paddleRightX - 30 &&
        tempPos.x <= paddleRightX + 30 &&
        Math.abs(tempPos.z - paddle2.position.z) < PADDLE_HEIGHT / 2
      ) {
        const relativeImpactZ =
          (tempPos.z - paddle2.position.z) / (PADDLE_HEIGHT / 2);
        const bounceAngle = (relativeImpactZ * Math.PI) / 3;
        const speed = Math.sqrt(tempVel.x * tempVel.x + tempVel.z * tempVel.z);

        tempVel.x = -speed * Math.cos(bounceAngle);
        tempVel.z = speed * Math.sin(bounceAngle);
      }
    }
  }

  if (finalPosition) {
    // Retiré la condition sur impactPoint.visible
    impactPoint.position.set(finalPosition.x, 15, finalPosition.z);
  }

  trajectoryGeometry.setFromPoints(points);
}

// Add these variables at the top of your file
let aiEnabled = true;
let aiPaddleSpeed = 8;

const AI_POSITIONS = {
  TOP: "top",
  TOP_CENTER: "topCenter",
  CENTER: "center",
  BOTTOM_CENTER: "bottomCenter",
  BOTTOM: "bottom",
};

const AI_UPDATE_INTERVAL = 1000;
const ERROR_DURATION = 170;
const ERROR_CHANCE = 0.1;
const MIN_FOLLOW_DURATION = 230;
const MAX_FOLLOW_DURATION = 530;
const MIN_PAUSE_DURATION = 230;
const MAX_PAUSE_DURATION = 500;
const FOLLOW_MODE_DELAY = 700; // Délai avant activation du mode suivi

let lastAIUpdate = 0;
let currentAITarget = AI_POSITIONS.CENTER;
const ERROR_MARGIN = 0;
let targetOffset = 0;
let lastTargetZ = 0;
let isInError = false;
let errorStartTime = 0;
let correctDirection = 1;

let isFollowing = false;
let followStartTime = 0;
let currentFollowDuration = 0;
let currentPauseDuration = 0;
let lastDirectionChangeTime = 0; // Nouveau: moment du dernier changement de direction
let previousBallDirectionX = 0; // Nouveau: mémorisation de la direction précédente

function getRandomDuration(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function moveAI() {
  if (!aiEnabled || !paddle2) return;

  const currentTime = performance.now();

  // Détecter le changement de direction
  if (Math.sign(ballVelocity.x) !== Math.sign(previousBallDirectionX)) {
    if (ballVelocity.x < 0) {
      // Si la balle commence à aller vers la gauche
      lastDirectionChangeTime = currentTime;
    }
    previousBallDirectionX = ballVelocity.x;
  }

  // Si la balle va de gauche à droite (mode interception)
  if (ballVelocity.x > 0) {
    // Réinitialiser les variables de suivi intermittent
    isFollowing = false;
    followStartTime = 0;

    if (currentTime - lastAIUpdate >= AI_UPDATE_INTERVAL) {
      if (ball.position.x < 0) {
        const positions = Object.values(AI_POSITIONS);
        currentAITarget =
          positions[Math.floor(Math.random() * positions.length)];
        targetOffset = (Math.random() - 0.5) * ERROR_MARGIN;
      }

      let targetZ = impactPoint.position.z;

      const offsetDot = 5; 

      switch (currentAITarget) {
        case AI_POSITIONS.TOP:
          targetZ += PADDLE_HEIGHT / 2 - offsetDot;
          break;
        case AI_POSITIONS.TOP_CENTER:
          targetZ += PADDLE_HEIGHT / 4;
          break;
        case AI_POSITIONS.CENTER:
          break;
        case AI_POSITIONS.BOTTOM_CENTER:
          targetZ -= PADDLE_HEIGHT / 4;
          break;
        case AI_POSITIONS.BOTTOM:
          targetZ -= PADDLE_HEIGHT / 2 - offsetDot;
          break;
      }

      lastTargetZ = targetZ + targetOffset;
      lastAIUpdate = currentTime;

      if (Math.random() < ERROR_CHANCE && !isInError) {
        isInError = true;
        errorStartTime = currentTime;
        correctDirection = Math.sign(lastTargetZ - paddle2.position.z);
      }
    }
  }
  // Mode suivi intermittent (balle va de droite à gauche)
  else {
    // Vérifier si on a dépassé le délai d'activation du mode suivi
    const canFollow =
      currentTime - lastDirectionChangeTime >= FOLLOW_MODE_DELAY;

    if (canFollow) {
      lastTargetZ = ball.position.z;
      isInError = false;

      // Gestion du cycle suivi/pause
      if (!isFollowing) {
        if (
          followStartTime === 0 ||
          currentTime - followStartTime >= currentPauseDuration
        ) {
          isFollowing = true;
          followStartTime = currentTime;
          currentFollowDuration = getRandomDuration(
            MIN_FOLLOW_DURATION,
            MAX_FOLLOW_DURATION
          );
          currentPauseDuration = getRandomDuration(
            MIN_PAUSE_DURATION,
            MAX_PAUSE_DURATION
          );
        }
      } else {
        if (currentTime - followStartTime >= currentFollowDuration) {
          isFollowing = false;
          followStartTime = currentTime;
        }
      }
    }
  }

  // Application du mouvement
  const paddleZ = paddle2.position.z;
  const distanceToTarget = lastTargetZ - paddleZ;

  if (Math.abs(distanceToTarget) > 5) {
    let direction = Math.sign(distanceToTarget);
    let shouldMove = true;

    // En mode suivi, ne bouger que pendant les périodes de suivi et après le délai
    if (ballVelocity.x <= 0) {
      const canFollow =
        currentTime - lastDirectionChangeTime >= FOLLOW_MODE_DELAY;
      shouldMove = canFollow && isFollowing;
    }

    // En mode interception avec erreur
    if (isInError) {
      if (currentTime - errorStartTime < ERROR_DURATION) {
        direction = -correctDirection;
      } else {
        isInError = false;
      }
    }

    if (shouldMove) {
      paddle2.position.z += direction * aiPaddleSpeed;

      // Limites du terrain
      const boundaries = calculateBoundaries();
      const paddleLimit = boundaries.maxZ - PADDLE_HEIGHT / 2;
      paddle2.position.z = Math.max(
        -paddleLimit,
        Math.min(paddleLimit, paddle2.position.z)
      );
    }
  }
}

const DOT_OPACITY = 0.5;

// Ajouter après la création du point vert, avec les autres créations d'objets globaux
const paddleTopGeometry = new THREE.SphereGeometry(5, 16, 16);
const paddleTopMaterial = new THREE.MeshBasicMaterial({
  color: 0xffff00, // jaune
  transparent: true,
  opacity: DOT_OPACITY,
});
const paddleTopPoint = new THREE.Mesh(paddleTopGeometry, paddleTopMaterial);
scene.add(paddleTopPoint);

const paddleBottomGeometry = new THREE.SphereGeometry(5, 16, 16);
const paddleBottomMaterial = new THREE.MeshBasicMaterial({
  color: 0x0000ff, // bleu
  transparent: true,
  opacity: DOT_OPACITY,
});
const paddleBottomPoint = new THREE.Mesh(
  paddleBottomGeometry,
  paddleBottomMaterial
);
scene.add(paddleBottomPoint);

// Ajouter après la création du point d'impact, avec les autres créations d'objets globaux
const paddleCenterGeometry = new THREE.SphereGeometry(5, 16, 16);
const paddleCenterMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  transparent: true,
  opacity: DOT_OPACITY,
});
const paddleCenterPoint = new THREE.Mesh(
  paddleCenterGeometry,
  paddleCenterMaterial
);
scene.add(paddleCenterPoint);

// Ajouter avec les autres créations de points
const topBoundaryGeometry = new THREE.SphereGeometry(5, 16, 16);
const topBoundaryMaterial = new THREE.MeshBasicMaterial({
  color: 0x800080, // violet
  transparent: true,
  opacity: DOT_OPACITY,
});
const topBoundaryPoint = new THREE.Mesh(
  topBoundaryGeometry,
  topBoundaryMaterial
);
scene.add(topBoundaryPoint);

const bottomBoundaryGeometry = new THREE.SphereGeometry(5, 16, 16);
const bottomBoundaryMaterial = new THREE.MeshBasicMaterial({
  color: 0xffa500, // orange
  transparent: true,
  opacity: DOT_OPACITY,
});
const bottomBoundaryPoint = new THREE.Mesh(
  bottomBoundaryGeometry,
  bottomBoundaryMaterial
);
scene.add(bottomBoundaryPoint);

// Modifier la fonction animate pour la vérification des points
function animate() {
  requestAnimationFrame(animate);

  // Mettre à jour tous les points
  if (paddle2) {
    const boundaries = calculateBoundaries();

    // Points du paddle2 (existants)
    paddleCenterPoint.position.set(paddle2.position.x, 15, paddle2.position.z);
    paddleTopPoint.position.set(
      paddle2.position.x,
      15,
      paddle2.position.z - PADDLE_HEIGHT / 2
    );
    paddleBottomPoint.position.set(
      paddle2.position.x,
      15,
      paddle2.position.z + PADDLE_HEIGHT / 2
    );

    // Points aux extrémités du terrain côté joueur
    topBoundaryPoint.position.set(
      paddle1.position.x, // Position X du paddle joueur
      15,
      -boundaries.maxZ // Limite haute du terrain
    );
    bottomBoundaryPoint.position.set(
      paddle1.position.x, // Position X du paddle joueur
      15,
      boundaries.maxZ // Limite basse du terrain
    );
  }

  // Ne mettre à jour les paddles que si le jeu n'est pas terminé
  if (!scoreSystem.isGameOver()) {
    movePaddle1();
    // movePaddle2();
  }

  if (isBallMoving && !scoreSystem.isGameOver()) {
    updateTrajectory();
    moveAI();
    ball.position.x += ballVelocity.x;
    ball.position.z += ballVelocity.z;

    const boundaries = calculateBoundaries();

    if (Math.abs(ball.position.z) > boundaries.maxZ) {
      ballVelocity.z *= -1;
      ball.position.z = Math.sign(ball.position.z) * boundaries.maxZ;
    }

    // Collisions avec les paddles
    if (ballVelocity.x < 0) {
      const paddleLeftX = paddle1.position.x;

      if (
        ball.position.x <= paddleLeftX + 30 &&
        ball.position.x >= paddleLeftX - 30 &&
        Math.abs(ball.position.z - paddle1.position.z) < PADDLE_HEIGHT / 2
      ) {
        currentBallSpeed = Math.min(
          currentBallSpeed + SPEED_INCREMENT,
          MAX_BALL_SPEED
        );

        const relativeImpactZ =
          (ball.position.z - paddle1.position.z) / (PADDLE_HEIGHT / 2);
        const bounceAngle = (relativeImpactZ * Math.PI) / 3;
        ballVelocity.x = currentBallSpeed * Math.cos(bounceAngle);
        ballVelocity.z = currentBallSpeed * Math.sin(bounceAngle);
      }
    }

    if (ballVelocity.x > 0) {
      const paddleRightX = paddle2.position.x;

      if (
        ball.position.x >= paddleRightX - 30 &&
        ball.position.x <= paddleRightX + 30 &&
        Math.abs(ball.position.z - paddle2.position.z) < PADDLE_HEIGHT / 2
      ) {
        currentBallSpeed = Math.min(
          currentBallSpeed + SPEED_INCREMENT,
          MAX_BALL_SPEED
        );

        const relativeImpactZ =
          (ball.position.z - paddle2.position.z) / (PADDLE_HEIGHT / 2);
        const bounceAngle = (relativeImpactZ * Math.PI) / 3;
        ballVelocity.x = -currentBallSpeed * Math.cos(bounceAngle);
        ballVelocity.z = currentBallSpeed * Math.sin(bounceAngle);
      }
    }

    if (ball.position.x < paddle1.position.x) {
      flashNeonBorder();
      scoreSystem.updateScore(2); // Point pour joueur 2
      if (scoreSystem.isGameOver()) {
        isBallMoving = false;
        ball.position.set(0, -100, 0);
        // Enlever l'appel à dispatchGameEnd ici car il est déjà dans Score3D
      } else {
        resetBall();
        setTimeout(launchBall, 500);
      }
    } else if (ball.position.x > paddle2.position.x) {
      flashNeonBorder();
      scoreSystem.updateScore(1); // Point pour joueur 1
      if (scoreSystem.isGameOver()) {
        isBallMoving = false;
        ball.position.set(0, -100, 0);
        // Enlever l'appel à dispatchGameEnd ici car il est déjà dans Score3D
      } else {
        resetBall();
        setTimeout(launchBall, 500);
      }
    }
  }

  controls.update();
  composer.render();
}
// Initialiser la taille du contour
updateBorderSize();

animate();
