import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

export class Score3D {
  constructor(scene, camera, paddle1, paddle2, gamePlane) {
    this.scene = scene;
    this.camera = camera;
    this.score = {
      player1: 0,
      player2: 0,
    };
    this.paddle1 = paddle1;
    this.paddle2 = paddle2;
    this.gamePlane = gamePlane;
    this.originalPlaneMaterial = null;
    this.scoreTextLeft = null;
    this.scoreTextRight = null;
    this.victoryText = null;
    this.directionalLight = null; // DirectionalLight
    this.lightTarget = null; // Target pour la lumière
    this.gameOver = false;
    this.WINNING_SCORE = 5;
    this.POINT_DIFFERENCE_REQUIRED = 2;
    this.fontLoader = new FontLoader();
    this.pressSpaceText = null;
    // Matériau pour le score du joueur 1 (Orange)
    this.textMaterialLeft = new THREE.MeshStandardMaterial({
      color: 0xff5500,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });

    // Matériau pour le score du joueur 2 (Bleu)
    this.textMaterialRight = new THREE.MeshStandardMaterial({
      color: 0x3db8ff,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });

    // Matériau pour le texte de victoire (Doré)
    this.victoryMaterial = new THREE.MeshStandardMaterial({
      color: 0xf39c12,
      metalness: 0.7,
      roughness: 0.3,
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
      height: 5,
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

  init() {
    this.fontLoader.load("./Mishmash_Regular.json", (font) => {
      this.font = font;
      this.createScoreText();
      this.createPressSpaceText(); // Appel pour afficher "PRESS SPACE"
    });
  }

  // Fonction pour afficher "PRESS SPACE"
  createPressSpaceText() {
    if (!this.font) return;

    const options = { ...this.textOptions, font: this.font };

    const geometry = new TextGeometry("PRESS SPACE", options);
    geometry.computeBoundingBox();
    geometry.center();

    this.pressSpaceText = new THREE.Mesh(geometry, this.textMaterialLeft); // On utilise ici le même matériau que pour le score
    this.pressSpaceText.rotation.x = -Math.PI / 2;
    this.pressSpaceText.position.set(0, 5, 0); // Positionner le texte un peu plus haut dans la scène

    this.scene.add(this.pressSpaceText);
  }

  // Fonction pour supprimer "PRESS SPACE" lorsque le jeu commence
  removePressSpaceText() {
    if (this.pressSpaceText) {
      this.scene.remove(this.pressSpaceText);
      this.pressSpaceText.geometry.dispose();
      this.pressSpaceText = null;
    }
  }

  setupSpaceListener() {
    window.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        if (this.gameOver) {
          // Si la partie est terminée, réinitialiser la partie
          this.resetGame();
        } else {
          // Si la partie n'est pas terminée, commencer la partie
          // Et que le score est a 0
          if (this.score.player1 === 0 && this.score.player2 === 0)
            this.startGame();
        }
      }
    });
  }

  // Fonction pour démarrer le jeu et cacher "PRESS SPACE"
  startGame() {
    this.gameOver = false;
    this.removePressSpaceText(); // Supprime le texte "PRESS SPACE"
    this.resetScore(); // Réinitialise les scores
    this.removeVictoryText(); // Supprime le message de victoire
  }

  // Fonction pour réinitialiser le jeu après la fin d'une partie
  resetGame() {
    // Réinitialiser tous les éléments du jeu
    this.resetScore(); // Réinitialiser le score
    this.removeVictoryText(); // Supprimer le texte de victoire
    this.createPressSpaceText(); // Réafficher "PRESS SPACE"
    this.gameOver = false; // Réinitialiser l'état de fin de partie
  }

  checkWinCondition() {
    if (
      this.score.player1 >= this.WINNING_SCORE ||
      this.score.player2 >= this.WINNING_SCORE
    ) {
      const scoreDifference = Math.abs(this.score.player1 - this.score.player2);

      if (scoreDifference >= this.POINT_DIFFERENCE_REQUIRED) {
        const winner = this.score.player1 > this.score.player2 ? "Orange" : "Blue";
        this.gameOver = true;
        this.createVictoryText(winner);
        return true;
      }
    }
    return false;
  }

  // Ajouter cette fonction dans la classe Score3D
  setScore(score1, score2) {
    // Vérifier que les scores sont des nombres valides
    if (typeof score1 !== "number" || typeof score2 !== "number") {
      console.error("Les scores doivent être des nombres");
      return;
    }

    // Mettre à jour les scores
    this.score.player1 = score1;
    this.score.player2 = score2;

    // Mettre à jour les couleurs en fonction des scores
    if (this.score.player1 === 4 && this.score.player2 === 2) {
      // Condition spéciale pour 4-2
      this.textMaterialLeft.color.setHex(0x1d995b);
      this.textMaterialRight.color.setHex(0x1d995b);
    } else if (this.score.player1 > this.score.player2) {
      this.textMaterialLeft.color.setHex(0xff5500);
      this.textMaterialRight.color.setHex(0xff5500);
    } else if (this.score.player2 > this.score.player1) {
      this.textMaterialLeft.color.setHex(0x3db8ff);
      this.textMaterialRight.color.setHex(0x3db8ff);
    } else {
      this.textMaterialLeft.color.setHex(0xff5500);
      this.textMaterialRight.color.setHex(0x3db8ff);
    }

    if (!this.font) return;

    const options = { ...this.textOptions, font: this.font };

    // Mise à jour de l'affichage du score gauche
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

    // Mise à jour de l'affichage du score droit
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

    this.updatePosition();

    // Vérifier la condition de victoire
    this.checkWinCondition();
  }

  addVictoryLight() {
    // Supprimez l'ancienne lumière si elle existe
    if (this.directionalLight) {
      this.scene.remove(this.directionalLight);
      this.scene.remove(this.lightTarget);
      this.directionalLight = null;
      this.lightTarget = null;
    }

    // Créer la lumière directionnelle
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048; // Résolution des ombres
    this.directionalLight.shadow.mapSize.height = 2048;

    // Position de la lumière
    this.directionalLight.position.set(15, 25, 15);

    // Créer une cible pour la lumière
    this.lightTarget = new THREE.Object3D();
    this.lightTarget.position.copy(this.victoryText.position);
    this.scene.add(this.lightTarget);

    // Associer la cible à la lumière
    this.directionalLight.target = this.lightTarget;

    // Ajouter la lumière à la scène
    this.scene.add(this.directionalLight);
  }

  removeVictoryLight() {
    if (this.directionalLight) {
      this.scene.remove(this.directionalLight);
      this.scene.remove(this.lightTarget);
      this.directionalLight = null;
      this.lightTarget = null;
    }
  }

  createVictoryText(winner) {
    if (!this.font) return;

    if (this.victoryText) {
      this.removeVictoryText();
    }

    const victoryMessage = `${winner} Wins!`;
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

    // Ajouter la lumière directionnelle ciblant le texte de victoire
    // this.addVictoryLight();
  }

  removeVictoryText() {
    if (this.victoryText) {
      this.scene.remove(this.victoryText);
      this.victoryText.geometry.dispose();
      this.victoryText = null;
    }
    this.removeVictoryLight(); // Supprimer la lumière
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

  updateScore(player) {
    if (this.gameOver) return;

    if (player === 1) {
      this.score.player1++;
    } else {
      this.score.player2++;
    }

    // Vérifier que les paddles sont disponibles
    if (this.paddle1 && this.paddle2) {
      // Mettre à jour les couleurs en fonction des scores
      if (this.score.player1 === 4 && this.score.player2 === 2) {
        // Condition spéciale pour 4-2
        this.textMaterialLeft.color.setHex(0x1d995b);
        this.textMaterialRight.color.setHex(0x1d995b);

        // Changer la texture du plan
        if (this.gamePlane && this.specialTexture) {
          this.gamePlane.traverse((child) => {
            if (child.isMesh) {
              // Sauvegarder le matériau original si ce n'est pas déjà fait
              if (!this.originalPlaneMaterial) {
                this.originalPlaneMaterial = child.material.clone();
              }
              child.material.map = this.specialTexture;
              child.material.needsUpdate = true;
            }
          });
        }

        // Changement de la couleur des paddles
        this.paddle1.traverse((child) => {
          if (child.isMesh) {
            child.material.color.setHex(0x1d995b);
          }
        });
        this.paddle2.traverse((child) => {
          if (child.isMesh) {
            child.material.color.setHex(0x1d995b);
          }
        });
      } else {
        // Restaurer la texture originale du plan
        if (this.gamePlane && this.originalPlaneMaterial) {
          this.gamePlane.traverse((child) => {
            if (child.isMesh) {
              child.material = this.originalPlaneMaterial.clone();
              child.material.needsUpdate = true;
            }
          });
        }

        if (this.score.player1 > this.score.player2) {
          this.textMaterialLeft.color.setHex(0xff5500);
          this.textMaterialRight.color.setHex(0xff5500);

          this.paddle1.traverse((child) => {
            if (child.isMesh) {
              child.material.color.setHex(0xff5500);
            }
          });
          this.paddle2.traverse((child) => {
            if (child.isMesh) {
              child.material.color.setHex(0x3db8ff);
            }
          });
        } else if (this.score.player2 > this.score.player1) {
          this.textMaterialLeft.color.setHex(0x3db8ff);
          this.textMaterialRight.color.setHex(0x3db8ff);

          this.paddle1.traverse((child) => {
            if (child.isMesh) {
              child.material.color.setHex(0xff5500);
            }
          });
          this.paddle2.traverse((child) => {
            if (child.isMesh) {
              child.material.color.setHex(0x3db8ff);
            }
          });
        } else {
          this.textMaterialLeft.color.setHex(0xff5500);
          this.textMaterialRight.color.setHex(0x3db8ff);

          this.paddle1.traverse((child) => {
            if (child.isMesh) {
              child.material.color.setHex(0xff5500);
            }
          });
          this.paddle2.traverse((child) => {
            if (child.isMesh) {
              child.material.color.setHex(0x3db8ff);
            }
          });
        }
      }
    }

    if (!this.font) return;

    const options = { ...this.textOptions, font: this.font };

    // Mise à jour de l'affichage du score gauche
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

    // Mise à jour de l'affichage du score droit
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

    this.updatePosition();

    // Vérifier la condition de victoire après avoir mis à jour l'affichage
    this.checkWinCondition();
  }

  getScore() {
    return this.score;
  }

  isGameOver() {
    return this.gameOver;
  }

  resetScore() {
    this.score.player1 = 0;
    this.score.player2 = 0;
    this.gameOver = false;

    this.textMaterialLeft.color.setHex(0xff5500);
    this.textMaterialRight.color.setHex(0x3db8ff);

    // Recréer les textes avec les scores à 0
    if (this.font) {
      const options = { ...this.textOptions, font: this.font };

      // Mettre à jour le score gauche
      if (this.scoreTextLeft) {
        this.scene.remove(this.scoreTextLeft);
        const geometryLeft = new TextGeometry("0", options);
        geometryLeft.center();
        this.scoreTextLeft = new THREE.Mesh(
          geometryLeft,
          this.textMaterialLeft
        );
        this.scoreTextLeft.rotation.x = -Math.PI / 2;
        this.scene.add(this.scoreTextLeft);
      }

      // Mettre à jour le score droit
      if (this.scoreTextRight) {
        this.scene.remove(this.scoreTextRight);
        const geometryRight = new TextGeometry("0", options);
        geometryRight.center();
        this.scoreTextRight = new THREE.Mesh(
          geometryRight,
          this.textMaterialRight
        );
        this.scoreTextRight.rotation.x = -Math.PI / 2;
        this.scene.add(this.scoreTextRight);
      }

      this.updatePosition();
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
