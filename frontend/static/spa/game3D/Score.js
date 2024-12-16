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
    this.directionalLight = null;
    this.lightTarget = null;
    this.gameOver = false;
    this.WINNING_SCORE = 1;
    this.POINT_DIFFERENCE_REQUIRED = 2;
    this.fontLoader = new FontLoader();
    this.pressSpaceText = null;
    this.longestRally = 0;
    this.maxLongestrally = 0;
    this.player1UpKey = "W";
    this.player1DownKey = "S";
    this.player1LaunchKey = "E";
    this.player2UpKey = "ArrowUp";
    this.player2DownKey = "ArrowDown";
    this.player2LaunchKey = "ArrowLeft";
    this.tutorialP1Text1 = null;
    this.tutorialP1Text2 = null;
    this.tutorialP1text3 = null;
    this.tutorialP2Text1 = null;
    this.tutorialP2Text2 = null;
    this.tutorialP2text3 = null;
    this.isAIisActive = false;

    this.textMaterialLeft = new THREE.MeshStandardMaterial({
      color: 0xff5500,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });

    this.textMaterialRight = new THREE.MeshStandardMaterial({
      color: 0x3db8ff,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });

    this.victoryMaterial = new THREE.MeshStandardMaterial({
      color: 0xf39c12,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });

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

    this.TutorialTextOptions = {
      size: 15,
      height: 5,
      curveSegments: 5,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 2,
      bevelOffset: 0,
      bevelSegments: 3,
    };

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
    this.fontLoader.load("./font/Mishmash_Regular.json", (font) => {
      this.font = font;
      this.createScoreText();
      this.createPressSpaceText();
      this.createTutorialText();
    });
  }

  setKeyTextForTutorial(options, isAIisActive) {
    this.player1UpKey = options.player1.moveUp;
    this.player1DownKey = options.player1.moveDown;
    this.player1LaunchKey = options.player1.launchPower;
    this.player2UpKey = options.player2.moveUp;
    this.player2DownKey = options.player2.moveDown;
    this.player2LaunchKey = options.player2.launchPower;
    this.isAIisActive = isAIisActive;
  }

  createPressSpaceText() {
    if (!this.font) return;

    const options = { ...this.textOptions, font: this.font };

    const geometry = new TextGeometry("PRESS SPACE", options);
    geometry.computeBoundingBox();
    geometry.center();

    this.pressSpaceText = new THREE.Mesh(geometry, this.textMaterialLeft);
    this.pressSpaceText.rotation.x = -Math.PI / 2;
    this.pressSpaceText.position.set(0, 5, 0);

    this.scene.add(this.pressSpaceText);
  }

  createTutorialText() {
    if (!this.font) return;

    const options = { ...this.TutorialTextOptions, font: this.font };

    // Tutorial for Player 1
    const moveString = `${this.player1UpKey} and ${this.player1DownKey} to move`;
    const powerString = `${this.player1LaunchKey} to use power`;

    const geometry1 = new TextGeometry(moveString, options);
    geometry1.computeBoundingBox();
    geometry1.center();

    this.tutorialP1Text1 = new THREE.Mesh(geometry1, this.textMaterialLeft);
    this.tutorialP1Text1.rotation.x = -Math.PI / 2;
    this.tutorialP1Text1.position.set(0, 5, -130);

    const geometry2 = new TextGeometry(powerString, options);
    geometry2.computeBoundingBox();
    geometry2.center();

    this.tutorialP1Text2 = new THREE.Mesh(geometry2, this.textMaterialLeft);
    this.tutorialP1Text2.rotation.x = -Math.PI / 2;
    this.tutorialP1Text2.position.set(0, 5, -100);

    const geometry3 = new TextGeometry("Player 1 :", options);
    geometry3.computeBoundingBox();
    geometry3.center();

    this.tutorialP1text3 = new THREE.Mesh(geometry3, this.textMaterialLeft);
    this.tutorialP1text3.rotation.x = -Math.PI / 2;
    this.tutorialP1text3.position.set(0, 5, -170);

    this.scene.add(this.tutorialP1Text1);
    this.scene.add(this.tutorialP1Text2);
    this.scene.add(this.tutorialP1text3);

    // Tutorial for Player 2
    if (!this.isAIisActive) {
      const moveString2 = `${this.player2UpKey} and ${this.player2DownKey} to move`;
      const powerString2 = `${this.player2LaunchKey} to use power`;

      const geometry4 = new TextGeometry(moveString2, options);
      geometry4.computeBoundingBox();
      geometry4.center();

      this.tutorialP2Text1 = new THREE.Mesh(geometry4, this.textMaterialRight);
      this.tutorialP2Text1.rotation.x = -Math.PI / 2;
      this.tutorialP2Text1.position.set(0, 5, 140);

      const geometry5 = new TextGeometry(powerString2, options);
      geometry5.computeBoundingBox();
      geometry5.center();

      this.tutorialP2Text2 = new THREE.Mesh(geometry5, this.textMaterialRight);
      this.tutorialP2Text2.rotation.x = -Math.PI / 2;
      this.tutorialP2Text2.position.set(0, 5, 170);

      const geometry6 = new TextGeometry("Player 2 :", options);
      geometry6.computeBoundingBox();
      geometry6.center();

      this.tutorialP2text3 = new THREE.Mesh(geometry6, this.textMaterialRight);
      this.tutorialP2text3.rotation.x = -Math.PI / 2;
      this.tutorialP2text3.position.set(0, 5, 100);

      this.scene.add(this.tutorialP2Text1);
      this.scene.add(this.tutorialP2Text2);
      this.scene.add(this.tutorialP2text3);
    }
  }

  removeTutorialText() {
    if (this.tutorialP1Text1) {
      this.scene.remove(this.tutorialP1Text1);
      this.tutorialP1Text1.geometry.dispose();
      this.tutorialP1Text1 = null;
    }

    if (this.tutorialP1Text2) {
      this.scene.remove(this.tutorialP1Text2);
      this.tutorialP1Text2.geometry.dispose();
      this.tutorialP1Text2 = null;
    }

    if (this.tutorialP1text3) {
      this.scene.remove(this.tutorialP1text3);
      this.tutorialP1text3.geometry.dispose();
      this.tutorialP1text3 = null;
    }

    if (this.tutorialP2Text1) {
      this.scene.remove(this.tutorialP2Text1);
      this.tutorialP2Text1.geometry.dispose();
      this.tutorialP2Text1 = null;
    }

    if (this.tutorialP2Text2) {
      this.scene.remove(this.tutorialP2Text2);
      this.tutorialP2Text2.geometry.dispose();
      this.tutorialP2Text2 = null;
    }

    if (this.tutorialP2text3) {
      this.scene.remove(this.tutorialP2text3);
      this.tutorialP2text3.geometry.dispose();
      this.tutorialP2text3 = null;
    }
  }

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
          this.resetGame();
        } else {
          if (this.score.player1 === 0 && this.score.player2 === 0)
            this.startGame();
        }
      }
    });
  }

  startGame() {
    this.gameOver = false;
    this.removePressSpaceText();
    this.resetScore();
    this.removeVictoryText();
    this.removeTutorialText();
  }

  resetGame() {
    this.resetScore();
    this.removeVictoryText();
    this.createPressSpaceText();
    this.gameOver = false;

    // maxBallSpeed = INITIAL_BALL_SPEED;
  }

  checkWinCondition() {
    if (
      this.score.player1 >= this.WINNING_SCORE ||
      this.score.player2 >= this.WINNING_SCORE
    ) {
      const scoreDifference = Math.abs(this.score.player1 - this.score.player2);

      if (scoreDifference >= this.POINT_DIFFERENCE_REQUIRED) {
        const winner =
          this.score.player1 > this.score.player2 ? "Orange" : "Blue";
        this.gameOver = true;
        this.createVictoryText(winner);
        return true;
      }
    }
    return false;
  }

  setScore(score1, score2) {
    if (typeof score1 !== "number" || typeof score2 !== "number") {
      console.error("Les scores doivent être des nombres");
      return;
    }

    this.score.player1 = score1;
    this.score.player2 = score2;

    if (this.score.player1 === 4 && this.score.player2 === 2) {
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

    this.updatePosition();

    this.checkWinCondition();
  }

  addVictoryLight() {
    if (this.directionalLight) {
      this.scene.remove(this.directionalLight);
      this.scene.remove(this.lightTarget);
      this.directionalLight = null;
      this.lightTarget = null;
    }

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.position.set(15, 25, 15);
    this.lightTarget = new THREE.Object3D();
    this.lightTarget.position.copy(this.victoryText.position);
    this.scene.add(this.lightTarget);
    this.directionalLight.target = this.lightTarget;
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

  setScoreToWin(score) {
    if (typeof score === "number" && score > 0) {
      this.WINNING_SCORE = score;
      console.log("Score pour gagner mis à jour :", this.WINNING_SCORE);
    } else {
      console.error("Score invalide pour gagner");
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
  }

  removeVictoryText() {
    if (this.victoryText) {
      this.scene.remove(this.victoryText);
      this.victoryText.geometry.dispose();
      this.victoryText = null;
    }
    this.removeVictoryLight();
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

    if (this.paddle1 && this.paddle2) {
      if (this.score.player1 === 4 && this.score.player2 === 2) {
        this.textMaterialLeft.color.setHex(0x1d995b);
        this.textMaterialRight.color.setHex(0x1d995b);

        if (this.gamePlane && this.specialTexture) {
          this.gamePlane.traverse((child) => {
            if (child.isMesh) {
              if (!this.originalPlaneMaterial) {
                this.originalPlaneMaterial = child.material.clone();
              }
              child.material.map = this.specialTexture;
              child.material.needsUpdate = true;
            }
          });
        }

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

    this.updatePosition();

    if (this.checkWinCondition()) {
      const scoreUser = this.score.player1;
      const scoreOpponent = this.score.player2;
      const result = scoreUser > scoreOpponent;
    }
  }

  getScore() {
    return this.score;
  }

  getScorePlayer1() {
    return this.score.player1;
  }

  getScorePlayer2() {
    return this.score.player2;
  }

  getWinner() {
    if (!this.isGameOver()) {
      return null;
    }

    if (this.score.player1 > this.score.player2) {
      return "Orange";
    } else if (this.score.player2 > this.score.player1) {
      return "Blue";
    } else {
      return "Draw";
    }
  }

  setLongestRally(value) {
    if (typeof value === "number" && value >= 0) {
      this.longestRally = value;
      console.log("longestRally mis à jour :", this.longestRally);
    } else {
      console.error("Invalid value for longestRally");
    }
  }

  getLongestRally() {
    return this.longestRally;
  }

  setMaxLongestRally(value) {
    if (typeof value === "number" && value >= 0) {
      if (value > this.maxLongestrally) {
        this.maxLongestrally = value;
        console.log("Max longest rally mis à jour :", this.maxLongestrally);
      }
    } else {
      console.error("Valeur invalide pour maxLongestRally :", value);
    }
  }

  getMaxLongestRally() {
    return this.maxLongestrally;
  }

  recordGame(scoreUser, scoreOpponent, result, longestRally, maxBallSpeed) {
    console.log("recordGame appelée avec :", {
      scoreUser,
      scoreOpponent,
      result,
      longestRally,
      maxBallSpeed,
    });
    const data = {
      score_user: scoreUser,
      score_opponent: scoreOpponent,
      result: result,
      longest_rally: longestRally,
      max_ball_speed: maxBallSpeed,
    };

    console.log("Données envoyées :", data);
    const csrftoken = getCookie("csrftoken");

    fetch("/api/record-game/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      credentials: "include",
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          console.log(data.message);
        } else if (data.error) {
          console.error(data.error);
        }
      })
      .catch((error) => console.error("Erreur :", error));
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

    if (this.font) {
      const options = { ...this.textOptions, font: this.font };

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

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
