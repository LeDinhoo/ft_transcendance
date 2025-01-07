export class AI {
  constructor(paddlePower, powerManager, controller) {
    this.enabled = true;
    this.PADDLE_SPEED = 10;
    this.lastUpdate = 0;
    this.currentTarget = "center";
    this.targetOffset = 0;
    this.lastTargetZ = 0;
    this.isInError = false;
    this.errorStartTime = 0;
    this.correctDirection = 1;
    this.isFollowing = false;
    this.followStartTime = 0;
    this.currentFollowDuration = 0;
    this.currentPauseDuration = 0;
    this.lastDirectionChangeTime = 0;
    this.previousBallDirectionX = 0;
    this.lastBallPosition = { x: 0, z: 0 };
    this.lastBallVelocity = { x: 0, z: 0 };
    this.lastBallCheck = 0;
    this.lastResetTime = 0;
    this.RESET_GRACE_PERIOD = 2500;
    this.powerManager = null;
    this.isPowerLoaded = false;
    this.previousStates = [];
    this.isPowerWasNear = false;
    this.Power1NearTop = false;
    this.Power1NearBottom = false;
    this.Power2NearTop = false;
    this.Power2NearBottom = false;
    this.paddlePower = paddlePower;
    this.controller = controller;
    this.powerManager = powerManager;
    this.isErrorApplied = false;

    this.POSITIONS = {
      TOP: "top",
      TOP_CENTER: "topCenter",
      CENTER: "center",
      BOTTOM_CENTER: "bottomCenter",
      BOTTOM: "bottom",
    };

    this.UPDATE_INTERVAL = 1000;
    this.PADDLE_HEIGHT = 135;

    this.DIFFICULTY = {
      EASY: {
        name: "EASY",
        color: "#22c55e",
        errorDuration: 350,
        errorChance: 0.5,
        followDelay: 1000,
        minFollowDuration: 230,
        maxFollowDuration: 530,
        minPauseDuration: 230,
        maxPauseDuration: 500,
        errorMargin: 20,
        errorPanic: 6,
      },
      MEDIUM: {
        name: "MEDIUM",
        color: "#eab308",
        errorDuration: 350,
        errorChance: 0.2,
        followDelay: 700,
        minFollowDuration: 230,
        maxFollowDuration: 530,
        minPauseDuration: 230,
        maxPauseDuration: 500,
        errorMargin: 10,
        errorPanic: 0,
      },
      HARD: {
        name: "HARD",
        color: "#ef4444",
        errorDuration: 200,
        errorChance: 0,
        followDelay: 400,
        minFollowDuration: 230,
        maxFollowDuration: 530,
        minPauseDuration: 230,
        maxPauseDuration: 500,
        errorMargin: 0.01,
        errorPanic: 0.01,
      },
    };

    this.currentDifficulty = this.DIFFICULTY.EASY;
    this.updateDifficultySettings();
  }

  pause(duration) {
    this.enabled = false;
    setTimeout(() => {
      this.enabled = true;
      this.resetLastUpdate();
      this.isMoving = false;
    }, duration);
  }

  setDifficulty(difficulty) {
    if (difficulty === "easy") {
      this.currentDifficulty = this.DIFFICULTY.EASY;
    } else if (difficulty === "medium") {
      this.currentDifficulty = this.DIFFICULTY.MEDIUM;
    } else {
      this.currentDifficulty = this.DIFFICULTY.HARD;
    }
    this.updateDifficultySettings();
  }

  loadPowerManager(powerManager) {
    if (powerManager && !this.isPowerLoaded) {
      this.powerManager = powerManager;
      this.isPowerLoaded = true;
    }
  }

  updateDifficultySettings() {
    const difficulty = this.currentDifficulty;
    this.ERROR_DURATION = difficulty.errorDuration;
    this.ERROR_CHANCE = difficulty.errorChance;
    this.FOLLOW_MODE_DELAY = difficulty.followDelay;
    this.MIN_FOLLOW_DURATION = difficulty.minFollowDuration;
    this.MAX_FOLLOW_DURATION = difficulty.maxFollowDuration;
    this.MIN_PAUSE_DURATION = difficulty.minPauseDuration;
    this.MAX_PAUSE_DURATION = difficulty.maxPauseDuration;
    this.ERROR_MARGIN = difficulty.errorMargin;
    this.ERROR_PANIC = difficulty.errorPanic;
  }

  cycleDifficulty() {
    if (this.currentDifficulty === this.DIFFICULTY.EASY) {
      this.currentDifficulty = this.DIFFICULTY.MEDIUM;
    } else if (this.currentDifficulty === this.DIFFICULTY.MEDIUM) {
      this.currentDifficulty = this.DIFFICULTY.HARD;
    } else {
      this.currentDifficulty = this.DIFFICULTY.EASY;
    }
    this.updateDifficultySettings();
    return this.currentDifficulty;
  }

  getRandomDuration(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  updateBallData(ballPosition, ballVelocity) {
    const currentTime = performance.now();
    if (currentTime - this.lastBallCheck >= this.UPDATE_INTERVAL) {
      this.lastBallPosition = { x: ballPosition.x, z: ballPosition.z };
      this.lastBallVelocity = { x: ballVelocity.x, z: ballVelocity.z };
      this.lastBallCheck = currentTime;
    }
  }

  updatePowerManager(
    paddle,
    paddle2Height,
    paddle1Height,
    paddleTarget,
    controller
  ) {
    const currentTime = performance.now();
    if (!this.lastCubeCheck || currentTime - this.lastCubeCheck >= 1000) {
      const cubes = this.powerManager.getCubeList();

      cubes.forEach((cube, index) => {
        if (cube) {
          const isNear = cube.getIsNear();
          if (index === 0) {
            this.Power1NearTop = isNear.isNearTop;
            this.Power1NearBottom = isNear.isNearBottom;
          }
          if (index === 1) {
            this.Power2NearTop = isNear.isNearTop;
            this.Power2NearBottom = isNear.isNearBottom;
          }
        }
      });

      this.lastCubeCheck = currentTime;
    }

    this.PADDLE_HEIGHT = paddle2Height.getHeight();
    this.usePower(paddle, paddle1Height, paddleTarget);

    if (controller.getIsReversed()) {
      if (!this.isErrorApplied) {
        this.ERROR_CHANCE += 0.3;
        this.ERROR_DURATION += 100;
        this.isErrorApplied = true;
      }
    } else if (this.isErrorApplied) {
      this.ERROR_CHANCE -= 0.3;
      this.ERROR_DURATION -= 100;
      this.isErrorApplied = false;
    }
  }

  calculatePaddleTarget(impactPoint) {
    let targetZ = impactPoint.z;
    const offsetDot = 7;

    if (this.currentDifficulty === this.DIFFICULTY.HARD) {
      switch (this.currentTarget) {
        case this.POSITIONS.TOP:
          targetZ += this.PADDLE_HEIGHT / 2;
          break;
        case this.POSITIONS.TOP_CENTER:
          targetZ += this.PADDLE_HEIGHT / 2;
          break;
        case this.POSITIONS.CENTER:
          break;
        case this.POSITIONS.BOTTOM_CENTER:
          targetZ -= this.PADDLE_HEIGHT / 2;
          break;
        case this.POSITIONS.BOTTOM:
          targetZ -= this.PADDLE_HEIGHT / 2;
          break;
      }
    } else {
      switch (this.currentTarget) {
        case this.POSITIONS.TOP:
          targetZ += this.PADDLE_HEIGHT / 2 - offsetDot;
          break;
        case this.POSITIONS.TOP_CENTER:
          targetZ += this.PADDLE_HEIGHT / 4;
          break;
        case this.POSITIONS.CENTER:
          break;
        case this.POSITIONS.BOTTOM_CENTER:
          targetZ -= this.PADDLE_HEIGHT / 4;
          break;
        case this.POSITIONS.BOTTOM:
          targetZ -= this.PADDLE_HEIGHT / 2 - offsetDot;
          break;
      }
    }

    return targetZ + this.targetOffset;
  }

  whenToUseGrenade(paddleTarget) {
    const currentTime = performance.now();
    const randomTime = Math.floor(Math.random() * (4000 - 1000 + 1) + 1000);
    if (currentTime - this.lastUpdate >= randomTime) {
      this.powerManager.launchGrenade(2, paddleTarget);
      this.lastUpdate = currentTime;
    }
  }

  whenToUseInverseShot(paddle, paddleTarget) {
    const paddleZ = paddle.position.z;
    const targetZ = paddleTarget.position.z;
    const distance = Math.abs(paddleZ - targetZ);
    if (distance < 25) {
      this.powerManager.launchInverseShot(2, this.controller);
    }
  }

  whenToUseReduct(paddleHeight, paddle) {
    const currentTime = performance.now();
    const randomTime = Math.floor(Math.random() * (5000 - 1000 + 1) + 1000);
    if (
      currentTime - this.lastUpdate >= randomTime &&
      paddle.position.z < 150 &&
      paddle.position.z > -150
    ) {
      this.powerManager.launchReductShot(2, paddleHeight);
      this.lastUpdate = currentTime;
    }
  }

  usePower(paddle, paddle1Height, paddleTarget) {
    if (this.paddlePower && this.powerManager) {
      if (this.paddlePower.hasPower("power1")) {
        this.whenToUseGrenade(paddleTarget);
      }
      if (this.paddlePower.hasPower("power2")) {
        this.whenToUseInverseShot(paddle, paddleTarget);
      }
      if (this.paddlePower.hasPower("power3")) {
        this.whenToUseReduct(paddle1Height, paddle);
      }
    }
  }

  move(paddle, ball, ballVelocity, impactPoint, boundaries) {
    if (!this.enabled || !paddle) return;

    const currentTime = performance.now();
    if (this.isMoving) return; 
    this.isMoving = true;

    this.updateBallData(ball, ballVelocity);

    let hasMoved = false;

    if (
      Math.sign(this.lastBallVelocity.x) !==
      Math.sign(this.previousBallDirectionX)
    ) {
      if (this.lastBallVelocity.x < 0) {
        this.lastDirectionChangeTime = currentTime;
      }
      this.previousBallDirectionX = this.lastBallVelocity.x;
    }

    if (this.lastBallVelocity.x > 0) {
      this.handleInterceptionMode(currentTime, ball, impactPoint, paddle);
    } else {
      if (this.Power1NearBottom && !hasMoved) {
        this.movePaddleDown(paddle, boundaries);
        hasMoved = true;
      } else if (this.Power1NearTop && !hasMoved) {
        this.movePaddleUp(paddle, boundaries);
        hasMoved = true;
      } else if (this.Power2NearBottom && !hasMoved) {
        this.movePaddleDown(paddle, boundaries);
        hasMoved = true;
      } else if (this.Power2NearTop && !hasMoved) {
        this.movePaddleUp(paddle, boundaries);
        hasMoved = true;
      } else if (!hasMoved) {
        this.handleFollowMode(currentTime);
      }
    }

    this.applyPaddleMovement(paddle, currentTime, boundaries);

    this.isMoving = false; 
  }


  movePaddleUp(paddle, boundaries) {
    if (!paddle || this.isMovingUp) return;

    this.isMovingUp = true; 
    if (paddle.position.z > boundaries.minZ + this.PADDLE_HEIGHT / 2) {
      paddle.position.z -= this.PADDLE_SPEED;
    }
    this.isMovingUp = false;
  }

  movePaddleDown(paddle, boundaries) {
    if (!paddle || this.isMovingDown) return;

    this.isMovingDown = true; 
    if (paddle.position.z < boundaries.maxZ - this.PADDLE_HEIGHT / 2) {
      paddle.position.z += this.PADDLE_SPEED;
    }
    this.isMovingDown = false;
  }

  resetLastUpdate() {
    this.lastUpdate = 0;
    this.lastResetTime = performance.now();
  }

  handleInterceptionMode(currentTime, ball, impactPoint, paddle) {
    this.isFollowing = false;
    this.followStartTime = 0;

    if (currentTime - this.lastUpdate >= this.UPDATE_INTERVAL) {
      if (ball.x < 0) {
        const positions = Object.values(this.POSITIONS);
        this.currentTarget =
          positions[Math.floor(Math.random() * positions.length)];
      }

      this.lastTargetZ = this.calculatePaddleTarget(impactPoint);
      this.lastUpdate = currentTime;

      if (Math.random() < this.ERROR_CHANCE && !this.isInError) {
        this.isInError = true;
        this.errorStartTime = currentTime;
        this.correctDirection = Math.sign(this.lastTargetZ - paddle.position.z);
      }
    }
  }

  handleFollowMode(currentTime) {
    const canFollow =
      currentTime - this.lastDirectionChangeTime >= this.FOLLOW_MODE_DELAY;

    if (canFollow) {
      this.lastTargetZ = this.lastBallPosition.z;
      this.isInError = false;

      if (!this.isFollowing) {
        if (
          this.followStartTime === 0 ||
          currentTime - this.followStartTime >= this.currentPauseDuration
        ) {
          this.isFollowing = true;
          this.followStartTime = currentTime;
          this.currentFollowDuration = this.getRandomDuration(
            this.MIN_FOLLOW_DURATION,
            this.MAX_FOLLOW_DURATION
          );
          this.currentPauseDuration = this.getRandomDuration(
            this.MIN_PAUSE_DURATION,
            this.MAX_PAUSE_DURATION
          );
        }
      } else {
        if (currentTime - this.followStartTime >= this.currentFollowDuration) {
          this.isFollowing = false;
          this.followStartTime = currentTime;
        }
      }
    }
  }

  resetLastUpdate() {
    this.lastUpdate = performance.now();
    this.lastResetTime = performance.now();
  }

  applyPaddleMovement(paddle, currentTime, boundaries) {
    const paddleZ = paddle.position.z;
    const distanceToTarget = this.lastTargetZ - paddleZ;

    if (Math.abs(distanceToTarget) > 5) {
      let direction = Math.sign(distanceToTarget);
      let shouldMove = true;

      if (this.lastBallVelocity.x <= 0) {
        const canFollow =
          currentTime - this.lastDirectionChangeTime >= this.FOLLOW_MODE_DELAY;
        shouldMove = canFollow && this.isFollowing;
      }

      if (this.isInError) {
        if (currentTime - this.errorStartTime < this.ERROR_DURATION) {
          direction = -this.correctDirection;
        } else {
          this.isInError = false;
        }
      }

      if (shouldMove) {
        const maxMovement = this.PADDLE_SPEED;
        const movement =
          Math.min(Math.abs(distanceToTarget), maxMovement) * direction;

        paddle.position.z += movement;

        const paddleLimit = boundaries.maxZ - this.PADDLE_HEIGHT / 2;
        paddle.position.z = Math.max(
          -paddleLimit,
          Math.min(paddleLimit, paddle.position.z)
        );
      }
    }
  }
}
