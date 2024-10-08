console.log("gameSript en cours...")


// Constants
const PADDLE_WIDTH = 100;
const BALL_SIZE = 20;
const PADDLE_SPEED = 10;
const AI_REACTION_SPEED = 10;
const SPEED_INCREASE = 1;
const MAX_SPEED = 30;
const MIN_SPEED = 5;
const AI_TAKEOVER_DELAY = 2500;
const MAX_TRAIL_LENGTH = 5;

// Game state
let gameState = {
    ballX: 0,
    ballY: 0,
    ballSpeedX: 5,
    ballSpeedY: 5,
    topPaddleX: 0,
    bottomPaddleX: 0,
    topScore: 0,
    bottomScore: 0,
    isMouseInGame: false,
    colorSensitivity: 2,
    isTopPaddleControlledByKeyboard: false,
    isBottomPaddleControlledByKeyboard: false,
    lastTopKeyPressTime: 0,
    lastBottomKeyPressTime: 0,
    leftKeyPressed: false,
    rightKeyPressed: false,
    aKeyPressed: false,
    dKeyPressed: false,
    ballTrail: [],
    gameWidth: 0,
    gameHeight: 0
};

// DOM Elements
let gameElements = {
    gameSection: null,
    topPaddle: null,
    bottomPaddle: null,
    ball: null,
    speedDisplay: null,
    scoreDisplay: null
};

/**
 * Initialise les éléments du jeu en récupérant les références DOM et définit les dimensions du jeu.
 * Cette fonction doit être appelée une fois au début du jeu pour configurer l'environnement initial.
 */
/*function initializeGameElements() {
    gameElements.gameSection = document.getElementById('gameSection');
    gameElements.topPaddle = document.getElementById('topPaddle');
    gameElements.bottomPaddle = document.getElementById('bottomPaddle');
    gameElements.ball = document.getElementById('ball');
    gameElements.speedDisplay = document.getElementById('speedDisplay');
    gameElements.scoreDisplay = document.getElementById('scoreDisplay');

    // Set dynamic game dimensions
    gameState.gameWidth = gameElements.gameSection.offsetWidth;
    gameState.gameHeight = gameElements.gameSection.offsetHeight;
}*/

function initializeGameElements() {
    gameElements.gameSection = document.getElementById('gameSection');
    gameElements.topPaddle = document.getElementById('topPaddle');
    gameElements.bottomPaddle = document.getElementById('bottomPaddle');
    gameElements.ball = document.getElementById('ball');
    gameElements.speedDisplay = document.getElementById('speedDisplay');
    gameElements.scoreDisplay = document.getElementById('scoreDisplay');

    // Log des dimensions pour vérifier si elles sont correctes
    console.log("Dimensions gameSection :", gameElements.gameSection.offsetWidth, gameElements.gameSection.offsetHeight);
    console.log("Dimensions topPaddle :", gameElements.topPaddle.offsetWidth, gameElements.topPaddle.offsetHeight);
    console.log("Dimensions ball :", gameElements.ball.offsetWidth, gameElements.ball.offsetHeight);
    
    // Set dynamic game dimensions
    gameState.gameWidth = gameElements.gameSection.offsetWidth;
    gameState.gameHeight = gameElements.gameSection.offsetHeight;
}


/**
 * Configure tous les écouteurs d'événements nécessaires pour le jeu.
 * Cela inclut les événements de la souris pour le conteneur du jeu, les événements du clavier,
 * et l'événement de redimensionnement de la fenêtre.
 */
function setupEventListeners() {
    gameElements.gameSection.addEventListener('mouseenter', () => gameState.isMouseInGame = true);
    gameElements.gameSection.addEventListener('mouseleave', () => gameState.isMouseInGame = false);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);
}

/**
 * Gère le redimensionnement de la fenêtre en ajustant les dimensions du jeu et en réinitialisant la balle.
 * Cette fonction assure que le jeu s'adapte correctement aux changements de taille de l'écran.
 */
function handleResize() {
    gameState.gameWidth = gameElements.gameSection.offsetWidth;
    gameState.gameHeight = gameElements.gameSection.offsetHeight;
    resetBall();
}

/**
 * Gère les événements de touche enfoncée.
 * Met à jour l'état du jeu en fonction de la touche pressée et met à jour le temps de la dernière pression
 * pour chaque raquette afin de gérer le contrôle par l'IA.
 * @param {KeyboardEvent} e - L'événement clavier
 */
function handleKeyDown(e) {
    switch(e.key) {
        case 'ArrowLeft':
            gameState.leftKeyPressed = true;
            updateLastTopKeyPressTime();
            break;
        case 'ArrowRight':
            gameState.rightKeyPressed = true;
            updateLastTopKeyPressTime();
            break;
        case 'a':
        case 'A':
            gameState.aKeyPressed = true;
            updateLastBottomKeyPressTime();
            break;
        case 'd':
        case 'D':
            gameState.dKeyPressed = true;
            updateLastBottomKeyPressTime();
            break;
    }
}

/**
 * Gère les événements de touche relâchée.
 * Met à jour l'état du jeu pour indiquer que les touches ne sont plus enfoncées.
 * @param {KeyboardEvent} e - L'événement clavier
 */
function handleKeyUp(e) {
    switch(e.key) {
        case 'ArrowLeft':
            gameState.leftKeyPressed = false;
            break;
        case 'ArrowRight':
            gameState.rightKeyPressed = false;
            break;
        case 'a':
        case 'A':
            gameState.aKeyPressed = false;
            break;
        case 'd':
        case 'D':
            gameState.dKeyPressed = false;
            break;
    }
}

/**
 * Met à jour le temps de la dernière pression de touche pour la raquette du haut.
 * Cette fonction est utilisée pour déterminer quand l'IA doit reprendre le contrôle.
 */
function updateLastTopKeyPressTime() {
    gameState.lastTopKeyPressTime = Date.now();
    gameState.isTopPaddleControlledByKeyboard = true;
}

/**
 * Met à jour le temps de la dernière pression de touche pour la raquette du bas.
 * Cette fonction est utilisée pour déterminer quand l'IA doit reprendre le contrôle.
 */
function updateLastBottomKeyPressTime() {
    gameState.lastBottomKeyPressTime = Date.now();
    gameState.isBottomPaddleControlledByKeyboard = true;
}

/**
 * Calcule la couleur de la balle en fonction de sa vitesse normalisée.
 * @param {number} normalizedSpeed - La vitesse normalisée de la balle (entre 0 et 1)
 * @returns {string} La couleur de la balle au format RGB
 */
function calculateBallColor(normalizedSpeed) {
    let red = 255;
    let green = Math.floor(255 - (255 - 165) * normalizedSpeed);
    let blue = Math.floor(255 - 255 * normalizedSpeed);
    return `rgb(${red}, ${green}, ${blue})`;
}

/**
 * Calcule l'effet de lueur de la balle en fonction de sa vitesse normalisée.
 * @param {number} normalizedSpeed - La vitesse normalisée de la balle (entre 0 et 1)
 * @returns {string} L'effet de lueur de la balle au format CSS
 */
function calculateGlowEffect(normalizedSpeed) {
    let glowIntensity = Math.floor(normalizedSpeed * 20);
    let glowColor = calculateBallColor(normalizedSpeed);
    return `0 0 ${glowIntensity}px ${glowColor}`;
}

/**
 * Met à jour l'apparence de la balle en fonction de sa vitesse actuelle.
 * Calcule la couleur et l'effet de lueur de la balle et applique ces styles.
 */
function updateBallAppearance() {
    let currentSpeed = Math.sqrt(gameState.ballSpeedX ** 2 + gameState.ballSpeedY ** 2);
    let normalizedSpeed = Math.pow((currentSpeed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED), 1 / gameState.colorSensitivity);
    normalizedSpeed = Math.max(0, Math.min(1, normalizedSpeed));

    let ballColor = calculateBallColor(normalizedSpeed);
    let glowEffect = calculateGlowEffect(normalizedSpeed);

    gameElements.ball.style.backgroundColor = ballColor;
    gameElements.ball.style.boxShadow = glowEffect;
}

/**
 * Gère le mouvement de la raquette du haut.
 * Détermine si la raquette est contrôlée par le joueur ou l'IA et met à jour sa position en conséquence.
 */
function moveTopPaddle() {
    if (Date.now() - gameState.lastTopKeyPressTime > AI_TAKEOVER_DELAY) {
        gameState.isTopPaddleControlledByKeyboard = false;
    }

    if (gameState.isTopPaddleControlledByKeyboard) {
        if (gameState.leftKeyPressed) {
            gameState.topPaddleX = Math.max(0, gameState.topPaddleX - PADDLE_SPEED);
        }
        if (gameState.rightKeyPressed) {
            gameState.topPaddleX = Math.min(gameState.gameWidth - PADDLE_WIDTH, gameState.topPaddleX + PADDLE_SPEED);
        }
    } else {
        gameState.topPaddleX = moveAIPaddle(gameElements.topPaddle, gameState.topPaddleX, true);
    }

    gameElements.topPaddle.style.left = gameState.topPaddleX + 'px';
}

/**
 * Gère le mouvement de la raquette du bas.
 * Détermine si la raquette est contrôlée par le joueur ou l'IA et met à jour sa position en conséquence.
 */
function moveBottomPaddle() {
    if (Date.now() - gameState.lastBottomKeyPressTime > AI_TAKEOVER_DELAY) {
        gameState.isBottomPaddleControlledByKeyboard = false;
    }

    if (gameState.isBottomPaddleControlledByKeyboard) {
        if (gameState.aKeyPressed) {
            gameState.bottomPaddleX = Math.max(0, gameState.bottomPaddleX - PADDLE_SPEED);
        }
        if (gameState.dKeyPressed) {
            gameState.bottomPaddleX = Math.min(gameState.gameWidth - PADDLE_WIDTH, gameState.bottomPaddleX + PADDLE_SPEED);
        }
    } else {
        gameState.bottomPaddleX = moveAIPaddle(gameElements.bottomPaddle, gameState.bottomPaddleX, false);
    }

    gameElements.bottomPaddle.style.left = gameState.bottomPaddleX + 'px';
}

/**
 * Gère le mouvement de la balle.
 * Met à jour la position de la balle, gère les collisions avec les murs et la logique de score.
 */
function moveBall() {
    gameState.ballX += gameState.ballSpeedX;
    gameState.ballY += gameState.ballSpeedY;

    // Handle wall collisions
    if (gameState.ballX <= 0 || gameState.ballX >= gameState.gameWidth - BALL_SIZE) {
        gameState.ballSpeedX = -gameState.ballSpeedX;
    }

    // Handle scoring
    if (gameState.ballY >= gameState.gameHeight - BALL_SIZE) {
        gameState.topScore++;
        resetBall();
    } else if (gameState.ballY <= 0) {
        gameState.bottomScore++;
        resetBall();
    }

    gameElements.ball.style.left = gameState.ballX + 'px';
    gameElements.ball.style.top = gameState.ballY + 'px';
}

const maxBounceAngle = 75 * (Math.PI / 180); // Convertir en radians si nécessaire

function calculateReflectionAngle(ballX, paddleX, paddleWidth) {
    const paddleCenterX = paddleX + paddleWidth / 2;
    const relativeIntersectX = (ballX - paddleCenterX) / (paddleWidth / 2);
    // Limiter la valeur entre -1 et 1
    const clampedIntersectX = Math.max(-1, Math.min(1, relativeIntersectX));
    const reflectionAngle = clampedIntersectX * maxBounceAngle;
    return reflectionAngle;
}

function updateBallVelocity(reflectionAngle, speed) {
    ballSpeedX = speed * Math.sin(reflectionAngle);
    ballSpeedY = speed * Math.cos(reflectionAngle);
}



/**
 * Vérifie les collisions entre la balle et les raquettes.
 * Gère le rebond de la balle et l'augmentation de la vitesse en cas de collision.
 */
function checkPaddleCollisions() {
    let topPaddlePosition = gameElements.topPaddle.getBoundingClientRect();
    let bottomPaddlePosition = gameElements.bottomPaddle.getBoundingClientRect();

    // Collision with top paddle
    if (gameState.ballX + BALL_SIZE > topPaddlePosition.left && 
        gameState.ballX < topPaddlePosition.right && 
        gameState.ballY <= topPaddlePosition.bottom && 
        gameState.ballY > topPaddlePosition.top) {
        if (gameState.ballSpeedY < 0) {
            gameState.ballSpeedY = -gameState.ballSpeedY;
            gameState.ballY = topPaddlePosition.bottom;
            increaseSpeed();
        }
    }

    // Collision with bottom paddle
    if (gameState.ballX + BALL_SIZE > bottomPaddlePosition.left && 
        gameState.ballX < bottomPaddlePosition.right && 
        gameState.ballY + BALL_SIZE >= bottomPaddlePosition.top && 
        gameState.ballY < bottomPaddlePosition.bottom) {
        if (gameState.ballSpeedY > 0) {
            gameState.ballSpeedY = -gameState.ballSpeedY;
            gameState.ballY = bottomPaddlePosition.top - BALL_SIZE;
            increaseSpeed();
        }
    }
}

/**
 * Calcule le mouvement de la raquette contrôlée par l'IA.
 * @param {HTMLElement} paddle - L'élément DOM de la raquette
 * @param {number} paddleX - La position X actuelle de la raquette
 * @param {boolean} isTopPaddle - Indique s'il s'agit de la raquette du haut
 * @returns {number} La nouvelle position X de la raquette
 */
function moveAIPaddle(paddle, paddleX, isTopPaddle) {
    let targetX;
    
    if ((isTopPaddle && gameState.ballSpeedY < 0) || (!isTopPaddle && gameState.ballSpeedY > 0)) {
        let timeToIntercept = Math.abs((paddle.offsetTop - gameState.ballY) / gameState.ballSpeedY);
        let predictedX = gameState.ballX + gameState.ballSpeedX * timeToIntercept;

        while (predictedX < 0 || predictedX > gameState.gameWidth) {
            if (predictedX < 0) {
                predictedX = -predictedX;
            } else if (predictedX > gameState.gameWidth) {
                predictedX = 2 * gameState.gameWidth - predictedX;
            }
        }

        targetX = predictedX - PADDLE_WIDTH / 2;
    } else {
        targetX = (gameState.gameWidth - PADDLE_WIDTH) / 2;
    }

    targetX = Math.max(0, Math.min(targetX, gameState.gameWidth - PADDLE_WIDTH));

    if (paddleX < targetX) {
        paddleX += Math.min(AI_REACTION_SPEED, targetX - paddleX);
    } else if (paddleX > targetX) {
        paddleX -= Math.min(AI_REACTION_SPEED, paddleX - targetX);
    }

    return paddleX;
}

/**
 * Réinitialise la position et la vitesse de la balle.
 * Cette fonction est appelée après qu'un point a été marqué.
 */
function resetBall() {
    gameState.ballX = gameState.gameWidth / 2 - BALL_SIZE / 2;
    gameState.ballY = gameState.gameHeight / 2 - BALL_SIZE / 2;
    gameState.ballSpeedX = 5;
    gameState.ballSpeedY = 5;
    gameState.ballTrail = [];
    updateBallAppearance();
}

/**
 * Augmente la vitesse de la balle.
 * Cette fonction est appelée après chaque collision avec une raquette.
 */
function increaseSpeed() {
    let currentSpeed = Math.sqrt(gameState.ballSpeedX ** 2 + gameState.ballSpeedY ** 2);
    if (currentSpeed < MAX_SPEED) {
        let factor = (currentSpeed + SPEED_INCREASE) / currentSpeed;
        gameState.ballSpeedX *= factor;
        gameState.ballSpeedY *= factor;
    }
}

/**
 * Met à jour l'affichage de la vitesse de la balle.
 */
function updateSpeedDisplay() {
    let speed = Math.sqrt(gameState.ballSpeedX ** 2 + gameState.ballSpeedY ** 2).toFixed(2);
    gameElements.speedDisplay.textContent = `Vitesse: ${speed}`;
}

/**
 * Met à jour l'affichage du score.
 */
function updateScoreDisplay() {
    gameElements.scoreDisplay.textContent = `${gameState.topScore} - ${gameState.bottomScore}`;
}

/**
 * Met à jour la sensibilité de la couleur de la balle.
 * @param {number} newSensitivity - La nouvelle valeur de sensibilité
 */
function updateColorSensitivity(newSensitivity) {
    gameState.colorSensitivity = newSensitivity;
    console.log(`Sensibilité de couleur mise à jour : ${gameState.colorSensitivity}`);
}

/**
 * La boucle principale du jeu.
 * Cette fonction est appelée à chaque frame pour mettre à jour l'état du jeu et redessiner les éléments.
 */
function gameLoop() {
    moveTopPaddle();
    moveBottomPaddle();
    moveBall();
    checkPaddleCollisions();
    updateBallAppearance();
    updateSpeedDisplay();
    updateScoreDisplay();
    requestAnimationFrame(gameLoop);
}

/**
 * Initialise le jeu.
 * Cette fonction est appelée une fois au chargement de la page pour démarrer le jeu.
 */
function initGame() {
    initializeGameElements();
    setupEventListeners();
    resetBall();
    updateScoreDisplay();
    gameLoop();
}

console.log("Appel à initGame");

window.onload = initGame;