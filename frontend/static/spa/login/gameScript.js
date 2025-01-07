
const PADDLE_WIDTH = 100;
const BALL_SIZE = 20;
const PADDLE_SPEED = 10;
const AI_REACTION_SPEED = 10;
const SPEED_INCREASE = 1;
const MAX_SPEED = 30;
const MIN_SPEED = 5;
const AI_TAKEOVER_DELAY = 2500;
const MAX_TRAIL_LENGTH = 5;


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

let gameElements = {
    gameSection: null,
    topPaddle: null,
    bottomPaddle: null,
    ball: null,
    speedDisplay: null,
    scoreDisplay: null
};

function initializeGameElements() {
    gameElements.gameSection = document.getElementById('gameSection');
    gameElements.topPaddle = document.getElementById('topPaddle');
    gameElements.bottomPaddle = document.getElementById('bottomPaddle');
    gameElements.ball = document.getElementById('ball');
    gameElements.speedDisplay = document.getElementById('speedDisplay');
    gameElements.scoreDisplay = document.getElementById('scoreDisplay');

    

    
    
    gameState.gameWidth = gameElements.gameSection.offsetWidth;
    gameState.gameHeight = gameElements.gameSection.offsetHeight;
}



function setupEventListeners() {
    gameElements.gameSection.addEventListener('mouseenter', () => gameState.isMouseInGame = true);
    gameElements.gameSection.addEventListener('mouseleave', () => gameState.isMouseInGame = false);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);
}


function handleResize() {
    gameState.gameWidth = gameElements.gameSection.offsetWidth;
    gameState.gameHeight = gameElements.gameSection.offsetHeight;
    resetBall();
}


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


function updateLastTopKeyPressTime() {
    gameState.lastTopKeyPressTime = Date.now();
    gameState.isTopPaddleControlledByKeyboard = true;
}


function updateLastBottomKeyPressTime() {
    gameState.lastBottomKeyPressTime = Date.now();
    gameState.isBottomPaddleControlledByKeyboard = true;
}


function calculateBallColor(normalizedSpeed) {
    let red = 255;
    let green = Math.floor(255 - (255 - 165) * normalizedSpeed);
    let blue = Math.floor(255 - 255 * normalizedSpeed);
    return `rgb(${red}, ${green}, ${blue})`;
}


function calculateGlowEffect(normalizedSpeed) {
    let glowIntensity = Math.floor(normalizedSpeed * 20);
    let glowColor = calculateBallColor(normalizedSpeed);
    return `0 0 ${glowIntensity}px ${glowColor}`;
}


function updateBallAppearance() {
    let currentSpeed = Math.sqrt(gameState.ballSpeedX ** 2 + gameState.ballSpeedY ** 2);
    let normalizedSpeed = Math.pow((currentSpeed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED), 1 / gameState.colorSensitivity);
    normalizedSpeed = Math.max(0, Math.min(1, normalizedSpeed));

    let ballColor = calculateBallColor(normalizedSpeed);
    let glowEffect = calculateGlowEffect(normalizedSpeed);

    gameElements.ball.style.backgroundColor = ballColor;
    gameElements.ball.style.boxShadow = glowEffect;
}


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


function moveBall() {
    gameState.ballX += gameState.ballSpeedX;
    gameState.ballY += gameState.ballSpeedY;

    
    if (gameState.ballX <= 0 || gameState.ballX >= gameState.gameWidth - BALL_SIZE) {
        gameState.ballSpeedX = -gameState.ballSpeedX;
    }

    
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

const maxBounceAngle = 75 * (Math.PI / 180); 

function calculateReflectionAngle(ballX, paddleX, paddleWidth) {
    const paddleCenterX = paddleX + paddleWidth / 2;
    const relativeIntersectX = (ballX - paddleCenterX) / (paddleWidth / 2);
    
    const clampedIntersectX = Math.max(-1, Math.min(1, relativeIntersectX));
    const reflectionAngle = clampedIntersectX * maxBounceAngle;
    return reflectionAngle;
}

function updateBallVelocity(reflectionAngle, speed) {
    ballSpeedX = speed * Math.sin(reflectionAngle);
    ballSpeedY = speed * Math.cos(reflectionAngle);
}




function checkPaddleCollisions() {
    let topPaddlePosition = gameElements.topPaddle.getBoundingClientRect();
    let bottomPaddlePosition = gameElements.bottomPaddle.getBoundingClientRect();

   
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


function resetBall() {
    gameState.ballX = gameState.gameWidth / 2 - BALL_SIZE / 2;
    gameState.ballY = gameState.gameHeight / 2 - BALL_SIZE / 2;
    gameState.ballSpeedX = 5;
    gameState.ballSpeedY = 5;
    gameState.ballTrail = [];
    updateBallAppearance();
}


function increaseSpeed() {
    let currentSpeed = Math.sqrt(gameState.ballSpeedX ** 2 + gameState.ballSpeedY ** 2);
    if (currentSpeed < MAX_SPEED) {
        let factor = (currentSpeed + SPEED_INCREASE) / currentSpeed;
        gameState.ballSpeedX *= factor;
        gameState.ballSpeedY *= factor;
    }
}


function updateSpeedDisplay() {
    let speed = Math.sqrt(gameState.ballSpeedX ** 2 + gameState.ballSpeedY ** 2).toFixed(2);
    gameElements.speedDisplay.textContent = `Vitesse: ${speed}`;
}


function updateScoreDisplay() {
    gameElements.scoreDisplay.textContent = `${gameState.topScore} - ${gameState.bottomScore}`;
}


function updateColorSensitivity(newSensitivity) {
    gameState.colorSensitivity = newSensitivity;
}


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


function initGame() {
    initializeGameElements();
    setupEventListeners();
    resetBall();
    updateScoreDisplay();
    gameLoop();
}


window.onload = initGame;