import { paddle1, paddle2 } from "./main.js";

export class PaddleController {
  constructor(paddleSpeed, controls) {
    this.paddle = null; // L'objet paddle
    this.paddleSpeed = paddleSpeed; // La vitesse du paddle
    this.controls = controls; // Objets contenant les touches "up" et "down"
    this.isReversed = false; // Indique si les contrôles sont inversés
    this.reverseTimeout = null; // Référence au timeout pour le reset
    this.remainingReverseTime = 0; // Temps restant avant le reset des contrôles
  }

  assignPaddle(paddle) {
    if (this.paddle) {
      return; // Ne pas réassigner si une raquette est déjà assignée
    }

    this.paddle = paddle;
    console.log("Paddle assigned:", this.paddle);
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
      console.error("Le paddle spécifié est null ou non chargé.");
      return;
    }

    // Si la couleur d'origine n'est pas spécifiée, la déterminer dynamiquement
    const defaultOriginalColor = this.paddle == paddle2 ? 0x0d9bff : 0xff4500;
    const targetColorHex = this.isReversed
      ? reverseColorHex
      : originalColorHex || defaultOriginalColor;

    paddle.traverse((child) => {
      if (child.isMesh && child.material && child.material.color) {
        child.material.color.set(targetColorHex); // Changer la couleur
      }
    });

    // if (this.isReversed) {
    //   console.log(reverseColorHex.toString(16));
    // } else {
    //   console.log((originalColorHex || defaultOriginalColor).toString(16));
    // }
  }

  activeReverse(duration = 3000) {
    // Ajouter le temps restant au total
    const now = Date.now();
    const elapsed = this.reverseTimeout ? now - this.reverseStartTime : 0;

    if (this.isReversed && elapsed < this.remainingReverseTime) {
      // Si déjà en mode inversé, ajouter au temps restant
      this.remainingReverseTime -= elapsed;
      clearTimeout(this.reverseTimeout);
    } else {
      // Sinon, démarrer une nouvelle période inversée
      this.isReversed = true;
      // console.log("Controls are now reversed!");
    }

    // Ajouter la nouvelle durée au temps restant
    this.remainingReverseTime += duration;
    this.reverseStartTime = now;

    // Redémarrer le timeout avec le nouveau temps restant
    this.reverseTimeout = setTimeout(() => {
      this.isReversed = false;
      this.remainingReverseTime = 0;
      // console.log("Controls are now back to normal!");
      this.changePaddleColor(this.paddle); // Remettre la couleur d'origine
    }, this.remainingReverseTime);
  }

  getPaddlePosition() {
    return this.paddle.position.z;
  }

  move(boundaries, gameStarted, keyboard, PADDLE_HEIGHT) {
    if (!this.paddle || !gameStarted) return;

    this.changePaddleColor(this.paddle);
    // console.log("Remaining reverse time:", this.remainingReverseTime);

    const paddleLimit = boundaries.maxZ - PADDLE_HEIGHT / 2;
    const upKey = this.isReversed ? this.controls.down : this.controls.up;
    const downKey = this.isReversed ? this.controls.up : this.controls.down;

    if (
      keyboard.isPressed(upKey) &&
      this.paddle.position.z > boundaries.minZ + PADDLE_HEIGHT / 2
    ) {
      this.paddle.position.z -= this.paddleSpeed;
    }

    if (keyboard.isPressed(downKey) && this.paddle.position.z < paddleLimit) {
      this.paddle.position.z += this.paddleSpeed;
    }
  }
}
