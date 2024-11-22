import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

export class Score3D {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.score = {
      player1: 0,
      player2: 0,
    };
    this.scoreTextLeft = null;
    this.scoreTextRight = null;
    this.victoryText = null;
    this.gameOver = false;
    this.WINNING_SCORE = 1;
    this.POINT_DIFFERENCE_REQUIRED = 0;
    this.fontLoader = new FontLoader();

    // Matériau pour le score du joueur 1 (Orange)
    this.textMaterialLeft = new THREE.MeshStandardMaterial({
      color: 0xff4500,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });

    // Matériau pour le score du joueur 2 (Bleu)
    this.textMaterialRight = new THREE.MeshStandardMaterial({
      color: 0x0d9bff,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });

    // Matériau pour le texte de victoire (Doré)
    this.victoryMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });

    // Configuration pour le texte des scores
    this.textOptions = {
      size: 50,
      height: 5,
      curveSegments: 10,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 3,
      bevelOffset: 0,
      bevelSegments: 5,
    };

    // Configuration pour le texte de victoire (plus grand)
    this.victoryTextOptions = {
      size: 80,
      height: 8,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 3,
      bevelSize: 4,
      bevelOffset: 0,
      bevelSegments: 6,
    };

    this.init();
    this.setupSpaceListener();
  }

  setupSpaceListener() {
    window.addEventListener("keydown", (event) => {
      if (event.code === "Space" && this.gameOver) {
        this.resetScore();
        this.removeVictoryText();
        this.gameOver = false;
      }
    });
  }

  init() {
    this.fontLoader.load("./Mishmash_Regular.json", (font) => {
      this.font = font;
      this.createScoreText();
    });
  }

  checkWinCondition() {
    console.log("Checking win condition:", {
      player1Score: this.score.player1,
      player2Score: this.score.player2,
      winningScore: this.WINNING_SCORE,
    });

    if (
      this.score.player1 >= this.WINNING_SCORE ||
      this.score.player2 >= this.WINNING_SCORE
    ) {
      const scoreDifference = Math.abs(this.score.player1 - this.score.player2);
      console.log("Score difference:", scoreDifference);

      if (scoreDifference >= this.POINT_DIFFERENCE_REQUIRED) {
        const winner = this.score.player1 > this.score.player2 ? 1 : 2;
        this.gameOver = true;
        this.createVictoryText(winner);
        console.log("Game over, winner:", winner);
        return true;
      }
    }
    return false;
  }

  createVictoryText(winner) {
    if (!this.font) return;

    if (this.victoryText) {
      this.removeVictoryText();
    }

    const victoryMessage = `Player ${winner} Wins!`;
    const geometry = new TextGeometry(victoryMessage, {
      ...this.victoryTextOptions,
      font: this.font,
    });

    geometry.computeBoundingBox();
    geometry.center();

    this.victoryText = new THREE.Mesh(geometry, this.victoryMaterial);
    this.victoryText.rotation.x = -Math.PI / 2;

    const fov = (this.camera.fov * Math.PI) / 180;
    const heightAtZero = 2 * Math.tan(fov / 2) * this.camera.position.y;

    this.victoryText.position.set(0, 5, 0);
    this.scene.add(this.victoryText);
  }

  removeVictoryText() {
    if (this.victoryText) {
      this.scene.remove(this.victoryText);
      this.victoryText.geometry.dispose();
      this.victoryText = null;
    }
  }

  createScoreText() {
    const options = { ...this.textOptions, font: this.font };

    const geometryLeft = new TextGeometry(
      this.score.player1.toString(),
      options
    );
    geometryLeft.computeBoundingBox();
    this.scoreTextLeft = new THREE.Mesh(geometryLeft, this.textMaterialLeft);

    const geometryRight = new TextGeometry(
      this.score.player2.toString(),
      options
    );
    geometryRight.computeBoundingBox();
    this.scoreTextRight = new THREE.Mesh(geometryRight, this.textMaterialRight);

    geometryLeft.center();
    geometryRight.center();

    this.scoreTextLeft.rotation.x = -Math.PI / 2;
    this.scoreTextRight.rotation.x = -Math.PI / 2;

    this.updatePosition();

    this.scene.add(this.scoreTextLeft);
    this.scene.add(this.scoreTextRight);
  }

  updatePosition() {
    if (!this.scoreTextLeft || !this.scoreTextRight) return;

    const fov = (this.camera.fov * Math.PI) / 180;
    const heightAtZero = 2 * Math.tan(fov / 2) * this.camera.position.y;
    const widthAtZero = heightAtZero * this.camera.aspect;

    const scoreY = 5;
    const scoreSpacing = widthAtZero * 0.05;

    this.scoreTextLeft.position.set(-scoreSpacing, scoreY, -320);
    this.scoreTextRight.position.set(scoreSpacing, scoreY, -320);
  }


  // Remplacer la méthode updateScore existante (vers la ligne 178) par :
  updateScore(player) {
    if (this.gameOver) return;

    if (player === 1) {
      this.score.player1++;
    } else {
      this.score.player2++;
    }

    // Vérifier la condition de victoire
    if (this.checkWinCondition()) {
      // Déterminer le gagnant et envoyer l'événement
      const winner = this.score.player1 > this.score.player2 ? 1 : 2;

      // Informer la fenêtre parente avec les scores
      if (window.parent !== window) {
        console.log(
          "Score3D sending gameComplete message with winner:",
          winner
        );
        window.parent.postMessage(
          {
            type: "gameComplete",
            data: {
              winner: winner - 1, // -1 car le tournament attend 0 ou 1
              finalScores: {
                player1: this.score.player1,
                player2: this.score.player2,
              },
            },
          },
          "*"
        );
      }
      return;
    }

    // Mettre à jour les couleurs et le score visuel
    if (this.score.player1 > this.score.player2) {
      this.textMaterialLeft.color.setHex(0xff4500);
      this.textMaterialRight.color.setHex(0xff4500);
    } else if (this.score.player2 > this.score.player1) {
      this.textMaterialLeft.color.setHex(0x0d9bff);
      this.textMaterialRight.color.setHex(0x0d9bff);
    } else {
      this.textMaterialLeft.color.setHex(0xff4500);
      this.textMaterialRight.color.setHex(0x0d9bff);
    }

    // Mettre à jour l'affichage du score
    if (!this.font) return;

    const options = { ...this.textOptions, font: this.font };

    if (this.scoreTextLeft) {
      this.scene.remove(this.scoreTextLeft);
      const geometryLeft = new TextGeometry(
        this.score.player1.toString(),
        options
      );
      geometryLeft.center();
      this.scoreTextLeft = new THREE.Mesh(geometryLeft, this.textMaterialLeft);
      this.scoreTextLeft.rotation.x = -Math.PI / 2;
      this.scene.add(this.scoreTextLeft);
    }

    if (this.scoreTextRight) {
      this.scene.remove(this.scoreTextRight);
      const geometryRight = new TextGeometry(
        this.score.player2.toString(),
        options
      );
      geometryRight.center();
      this.scoreTextRight = new THREE.Mesh(
        geometryRight,
        this.textMaterialRight
      );
      this.scoreTextRight.rotation.x = -Math.PI / 2;
      this.scene.add(this.scoreTextRight);
    }

    // Mettre à jour la position
    this.updatePosition();

    // Envoyer la mise à jour du score à la fenêtre parente
    if (window.parent !== window) {
      window.parent.postMessage(
        {
          type: "scoreUpdate",
          data: {
            player1Score: this.score.player1,
            player2Score: this.score.player2,
          },
        },
        "*"
      );
    }
  }

  getScore() {
    return this.score;
  }

  isGameOver() {
    return this.gameOver;
  }

  // Remplacer la méthode resetScore existante (vers la ligne 280) par :
  resetScore() {
    this.score.player1 = 0;
    this.score.player2 = 0;
    this.gameOver = false;

    this.textMaterialLeft.color.setHex(0xff4500);
    this.textMaterialRight.color.setHex(0x0d9bff);

    if (this.font) {
      this.updateScore(1);
      this.updateScore(2);
    }

    if (window !== window.parent) {
      window.parent.postMessage(
        {
          type: "scoreUpdate",
          data: {
            player1Score: this.score.player1,
            player2Score: this.score.player2,
          },
        },
        "*"
      );

      // Si c'est la fin du jeu
      if (this.gameOver) {
        const winner = this.score.player1 > this.score.player2 ? 0 : 1;
        window.parent.postMessage(
          {
            type: "gameComplete",
            data: {
              winner,
              finalScores: {
                player1: this.score.player1,
                player2: this.score.player2,
              },
            },
          },
          "*"
        );
      }
    }
  }

  dispose() {
    if (this.scoreTextLeft) {
      this.scene.remove(this.scoreTextLeft);
      this.scoreTextLeft.geometry.dispose();
    }
    if (this.scoreTextRight) {
      this.scene.remove(this.scoreTextRight);
      this.scoreTextRight.geometry.dispose();
    }
    if (this.victoryText) {
      this.scene.remove(this.victoryText);
      this.victoryText.geometry.dispose();
    }
    if (this.textMaterialLeft) {
      this.textMaterialLeft.dispose();
    }
    if (this.textMaterialRight) {
      this.textMaterialRight.dispose();
    }
    if (this.victoryMaterial) {
      this.victoryMaterial.dispose();
    }
  }
}
