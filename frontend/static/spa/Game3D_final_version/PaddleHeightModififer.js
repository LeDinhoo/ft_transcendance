export class HeightController {
  constructor() {
    this.height = 135;
    this.paddle = null; // L'objet paddle
    this.isHeight = false; // Indique si les contrôles sont inversés
    this.heightTimeout = null; // Référence au timeout pour le reset
    this.remainingHeightTime = 0; // Temps restant avant le reset des contrôles
    this.heightStartTime = 0; // Temps de démarrage du mode inversé
  }

  assignPaddle(paddle) {
    if (this.paddle) {
      return; // Ne pas réassigner si une raquette est déjà assignée
    }

    this.paddle = paddle;
    // console.log("Paddle assigned:", this.paddle);
  }

  //Methode pour changer la taille a 70 pendant 5 secondes
  //   reduceHeight() {
  //     this.height = 67.5;
  //     setTimeout(() => {
  //       this.height = 135;
  //     }, 10000);
  //   }

  reduceHeight(duration = 8000) {
    // Ajouter le temps restant au total
    const now = Date.now();
    const elapsed = this.heightTimeout ? now - this.heightStartTime : 0;

    if (this.isHeight && elapsed < this.remainingHeightTime) {
      // Si déjà en mode inversé, ajouter au temps restant
      this.remainingHeightTime -= elapsed;
      clearTimeout(this.heightTimeout);
    } else {
      // Sinon, démarrer une nouvelle période inversée
      this.isHeight = true;
      // console.log("Controls are now reversed!");
    }

    // Ajouter la nouvelle durée au temps restant
    this.remainingHeightTime += duration;
    this.heightStartTime = now;

    // Redémarrer le timeout avec le nouveau temps restant
    this.heightTimeout = setTimeout(() => {
      this.isHeight = false;
      this.remainingHeightTime = 0;
      // console.log("Controls are now back to normal!");
      //   this.changePaddleColor(this.paddle); // Remettre la couleur d'origine
    }, this.remainingHeightTime);
  }

  updatePaddleModelHeight() {
    if (!this.paddle) {
      // console.error("Le paddle spécifié est null ou non chargé.");
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
