import { paddle1, paddle2 } from "./main.js";

export class PaddleController {
  constructor(paddleSpeed, controls) {
    this.paddle = null; 
    this.paddleSpeed = paddleSpeed; 
    this.controls = controls; 
    this.isReversed = false; 
    this.reverseTimeout = null; 
    this.remainingReverseTime = 0; 
  }

  changeControlsUp(newKey) {
    this.controls.up = newKey;
  }

  changeControlsDown(newKey) {
    this.controls.down = newKey;
  }

  assignPaddle(paddle) {
    if (this.paddle) {
      return; 
    }

    this.paddle = paddle;

  }

  getRemainingReverseTime() {
    return this.remainingReverseTime;
  }

  changePaddleColor(
    paddle,
    reverseColorHex = 0x797509,
    originalColorHex = null
  ) {
    if (!paddle) {
     
      return;
    }

    
    const defaultOriginalColor = this.paddle == paddle2 ? 0x0d9bff : 0xff5500;
    const targetColorHex = this.isReversed
      ? reverseColorHex
      : originalColorHex || defaultOriginalColor;

    paddle.traverse((child) => {
      if (child.isMesh && child.material && child.material.color) {
        child.material.color.set(targetColorHex); 
      }
    });

  }

  activeReverse(duration = 3000) {
    
    const now = Date.now();
    const elapsed = this.reverseTimeout ? now - this.reverseStartTime : 0;

    if (this.isReversed && elapsed < this.remainingReverseTime) {
      
      this.remainingReverseTime -= elapsed;
      clearTimeout(this.reverseTimeout);
    } else {
      this.isReversed = true;
    }

    this.remainingReverseTime += duration;
    this.reverseStartTime = now;

    this.reverseTimeout = setTimeout(() => {
      this.isReversed = false;
      this.remainingReverseTime = 0;
     
      this.changePaddleColor(this.paddle); 
    }, this.remainingReverseTime);
  }

  getPaddlePosition() {
    return this.paddle.position.z;
  }

  getIsReversed() {
    return this.isReversed;
  }

  updateColor() {
    this.changePaddleColor(this.paddle);
  }

  move(boundaries, gameStarted, keyboard, PADDLE_HEIGHT) {
    if (!this.paddle || !gameStarted) return;


    let paddleLimitBot, paddleLimitTop;

    if (PADDLE_HEIGHT === 67.5) {
      paddleLimitBot = boundaries.maxZ - (PADDLE_HEIGHT + 13) / 2;
      paddleLimitTop = boundaries.minZ + (PADDLE_HEIGHT + 13) / 2;
    } else {
      paddleLimitBot = boundaries.maxZ - (PADDLE_HEIGHT + 9) / 2;
      paddleLimitTop = boundaries.minZ + (PADDLE_HEIGHT + 9) / 2;
    }
    const upKey = this.isReversed ? this.controls.down : this.controls.up;
    const downKey = this.isReversed ? this.controls.up : this.controls.down;

    if (keyboard.isPressed(upKey) && this.paddle.position.z > paddleLimitTop) {
      this.paddle.position.z -= this.paddleSpeed;
    }

    if (
      keyboard.isPressed(downKey) &&
      this.paddle.position.z < paddleLimitBot
    ) {
      this.paddle.position.z += this.paddleSpeed;
    }

    
    if (PADDLE_HEIGHT === 135) {
      if (this.paddle.position.z > paddleLimitBot) {
        this.paddle.position.z = paddleLimitBot;
      }
      if (this.paddle.position.z < paddleLimitTop) {
        this.paddle.position.z = paddleLimitTop;
      }
    } else {
      if (this.paddle.position.z > paddleLimitBot) {
        this.paddle.position.z = paddleLimitBot;
      }
      if (this.paddle.position.z < paddleLimitTop) {
        this.paddle.position.z = paddleLimitTop;
      }
    }
  }
}
