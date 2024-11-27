export class AI {
  constructor() {
    // AI States
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
    this.RESET_GRACE_PERIOD = 2000;
    this.powerManager = null;
    this.isPowerLoaded = false;
    this.previousStates = [];

    // AI Constants
    this.POSITIONS = {
      TOP: "top",
      TOP_CENTER: "topCenter",
      CENTER: "center",
      BOTTOM_CENTER: "bottomCenter",
      BOTTOM: "bottom",
    };

    this.UPDATE_INTERVAL = 1000;
    this.PADDLE_HEIGHT = 130;

    // Difficulty Settings
    this.DIFFICULTY = {
      EASY: {
        name: "EASY",
        color: "#22c55e",
        errorDuration: 100,
        errorChance: 0.4,
        followDelay: 100,
        minFollowDuration: 230,
        maxFollowDuration: 530,
        minPauseDuration: 230,
        maxPauseDuration: 500,
        errorMargin: 10,
        errorPanic: 6,
      },
      MEDIUM: {
        name: "MEDIUM",
        color: "#eab308",
        errorDuration: 200,
        errorChance: 0.1,
        followDelay: 700,
        minFollowDuration: 230,
        maxFollowDuration: 530,
        minPauseDuration: 230,
        maxPauseDuration: 500,
        errorMargin: 20,
        errorPanic: 0,
      },
      HARD: {
        name: "HARD",
        color: "#ef4444",
        errorDuration: 100,
        errorChance: 0.05,
        followDelay: 400,
        minFollowDuration: 430,
        maxFollowDuration: 830,
        minPauseDuration: 130,
        maxPauseDuration: 300,
        errorMargin: 0,
        errorPanic: 0,
      },
    };

    this.currentDifficulty = this.DIFFICULTY.EASY;
    this.updateDifficultySettings();
  }

  // Nouvelle méthode simple pour mettre en pause l'IA
  pause(duration) {
    this.enabled = false;
    setTimeout(() => {
      this.enabled = true;
    }, duration);
  }

  loadPowerManager(powerManager) {
    if (powerManager && !this.isPowerLoaded) {
      this.powerManager = powerManager;
      this.isPowerLoaded = true;
      console.log("Power Manager loaded:", this.powerManager);
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

  calculatePaddleTarget(impactPoint) {
    let targetZ = impactPoint.z;
    const offsetDot = 7;

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

    return targetZ + this.targetOffset;
  }

  // updatePowerManager() {
  //   const cubes = this.powerManager.getCubeList();
  //   if (cubes[0]) {
  //     const isNear = cubes[0].getIsNear();
  //     if (isNear.isNearTop || isNear.isNearBottom) {
  //       if (isNear.isNearTop) {
  //         console.log("Power 1 near top");
  //       } else {
  //         console.log("Power 1 near bottom");
  //       }
  //     }
  //   }
  //   if (cubes[1]) {
  //     const isNear = cubes[1].getIsNear();
  //     if (isNear.isNearTop || isNear.isNearBottom) {
  //       if (isNear.isNearTop) {
  //         console.log("Power 2 near top");
  //       } else {
  //         console.log("Power 2 near bottom");
  //       }
  //     }
  //   }
  // }

  updatePowerManager() {
    const cubes = this.powerManager.getCubeList();

    cubes.forEach((cube, index) => {
      // Si l'état précédent n'existe pas pour ce cube, initialisez-le
      if (!this.previousStates[index]) {
        this.previousStates[index] = { isNearTop: false, isNearBottom: false };
      }

      const isNear = cube.getIsNear();

      // Vérifiez si l'état actuel de isNearTop diffère de l'état précédent
      if (isNear.isNearTop !== this.previousStates[index].isNearTop) {
        if (isNear.isNearTop) {
          console.log(`Power ${index + 1} near top (true)`);
        } else {
          console.log(`Power ${index + 1} no longer near top (false)`);
        }
        this.previousStates[index].isNearTop = isNear.isNearTop; // Mettez à jour l'état précédent
      }

      // Vérifiez si l'état actuel de isNearBottom diffère de l'état précédent
      if (isNear.isNearBottom !== this.previousStates[index].isNearBottom) {
        if (isNear.isNearBottom) {
          console.log(`Power ${index + 1} near bottom (true)`);
        } else {
          console.log(`Power ${index + 1} no longer near bottom (false)`);
        }
        this.previousStates[index].isNearBottom = isNear.isNearBottom; // Mettez à jour l'état précédent
      }
    });
  }

  move(paddle, ball, ballVelocity, impactPoint, boundaries) {
    if (!this.enabled || !paddle) return;

    const currentTime = performance.now();
    this.updateBallData(ball, ballVelocity);

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
      this.handleFollowMode(currentTime);
    }

    this.applyPaddleMovement(paddle, currentTime, boundaries);
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
        const isInGracePeriod =
          currentTime - this.lastResetTime < this.RESET_GRACE_PERIOD;

        if (isInGracePeriod) {
          this.targetOffset = 0;
        } else {
          const ballSpeed = Math.sqrt(
            this.lastBallVelocity.x * this.lastBallVelocity.x +
              this.lastBallVelocity.z * this.lastBallVelocity.z
          );
          const panicMargin = this.ERROR_MARGIN + ballSpeed * this.ERROR_PANIC;
          this.targetOffset = (Math.random() - 1) * panicMargin;
        }
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
        paddle.position.z += direction * this.PADDLE_SPEED;
        const paddleLimit = boundaries.maxZ - this.PADDLE_HEIGHT / 2;
        paddle.position.z = Math.max(
          -paddleLimit,
          Math.min(paddleLimit, paddle.position.z)
        );
      }
    }
  }
}
