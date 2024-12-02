export class HeightController {
  constructor() {
    this.height = 135;
    this.paddle = null;
    this.isHeight = false;
    this.heightTimeout = null;
    this.remainingHeightTime = 0;
    this.heightStartTime = 0;
  }

  assignPaddle(paddle) {
    if (this.paddle) {
      return;
    }

    this.paddle = paddle;
  }

  reduceHeight(duration = 8000) {
    const now = Date.now();
    const elapsed = this.heightTimeout ? now - this.heightStartTime : 0;

    if (this.isHeight && elapsed < this.remainingHeightTime) {
      this.remainingHeightTime -= elapsed;
      clearTimeout(this.heightTimeout);
    } else {
      this.isHeight = true;
    }

    this.remainingHeightTime += duration;
    this.heightStartTime = now;

    this.heightTimeout = setTimeout(() => {
      this.isHeight = false;
      this.remainingHeightTime = 0;
    }, this.remainingHeightTime);
  }

  updatePaddleModelHeight() {
    if (!this.paddle) {
      return;
    }

    if (this.isHeight) {
      this.height = 67.5;
    } else {
      this.height = 135;
    }

    if (this.height === 67.5) {
      this.paddle.scale.set(20, 20, 10);
    } else {
      this.paddle.scale.set(20, 20, 20);
    }
  }

  getHeight() {
    return this.height;
  }
}
