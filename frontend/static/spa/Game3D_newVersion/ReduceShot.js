import * as THREE from "three";

export class ReduceShot {
  constructor(scene, player, modelCache, modelName, modelLoader) {
    this.isAnimating = false;
    this.isLaunched = false;
    this.animationStartTime = 0;
    this.initialX = 0;
    this.initialZ = 0;
    this.initialY = 15;
    this.ANIMATION_DURATION = 1500;
    this.modelCache = modelCache;
    this.velocity = {
      x: 1.8,
      y: 1.2,
      z: 0,
    };
    this.gravity = 1;
    this.dampening = 0.7;
    this.groundY = 15;
    this.player = player;
    this.moveRight = player == 1 ? true : false;
    this.cube = null;
    this.addedToScene = false;
    this.scene = scene;
    this.createCube(modelName);
    this.launchDistance = 750;
    this.reverseControls1 = false;
    this.reverseControls2 = false;
    this.modelLoader = modelLoader;
  }

  adjustPivotToCenterY(object) {
    const boundingBox = new THREE.Box3().setFromObject(object);
    const height = boundingBox.max.y - boundingBox.min.y;
    const centerY = boundingBox.min.y + height / 2;

    const pivot = new THREE.Group();
    pivot.add(object);

    object.position.y -= centerY;

    return pivot;
  }

  createCube(modelName) {
    return new Promise((resolve, reject) => {
      this.modelCache
        .loadModel(modelName)
        .then((model) => {
          this.cube = model;

          this.cube.scale.set(17, 17, 17);
          this.cube.position.y = this.initialY;
          this.cube.rotation.x = Math.PI / 4;
          this.cube.rotation.y = Math.PI / 4;
          this.cube.rotation.z = Math.PI / 4;
          this.adjustPivotToCenterY(this.cube);
          resolve(this.cube);
        })
        .catch((error) => {
          console.error(
            "Erreur de chargement du modèle depuis le cache",
            error
          );
          reject(error);
        });
    });
  }

  getReverse1() {
    return this.reverseControls1;
  }

  getReverse2() {
    return this.reverseControls2;
  }

  invertPaddle1() {
    this.reverseControls1 = true;
  }

  invertPaddle2() {
    this.reverseControls2 = true;
  }

  changePaddleColor(paddle, newColorHex = 0x667a51, duration = 3000) {
    if (!paddle) {
      console.error("Le paddle spécifié est null ou non chargé.");
      return;
    }

    const originalColors = [];
    paddle.traverse((child) => {
      if (child.isMesh && child.material && child.material.color) {
        originalColors.push({
          mesh: child,
          color: child.material.color.getHex(),
        });

        child.material.color.setHex(newColorHex);
      }
    });

    setTimeout(() => {
      originalColors.forEach(({ mesh, color }) => {
        mesh.material.color.setHex(color);
      });
    }, duration);
  }

  stickToPaddle(paddle) {
    if (!this.addedToScene) {
      this.scene.add(this.cube);
      this.addedToScene = true;
    }

    this.cube.position.x = paddle.position.x;
    this.cube.position.z = paddle.position.z;
    this.cube.position.y = this.initialY + 20;

    this.cube.rotation.x += 0.02;
    this.cube.rotation.y += 0.02;
    this.cube.rotation.z += 0.02;
  }

  startAnimation(paddlePosition) {
    if (!this.isAnimating && !this.isLaunched) {
      this.isAnimating = true;
      this.isLaunched = true;
      this.animationStartTime = Date.now();

      this.initialX = paddlePosition.x;
      this.initialZ = paddlePosition.z;
      this.cube.position.x = this.initialX;
      this.cube.position.z = this.initialZ;
      this.cube.position.y = this.initialY + 20;

      this.velocity = {
        x: 12.5,
        y: 20,
        z: 50,
      };
    }
  }

  reset() {
    this.isLaunched = false;
    this.isAnimating = false;
    this.cube.position.y = this.initialY;
  }

  checkCollision(targetPaddle) {
    if (this.moveRight) {
      if (
        this.cube.position.x >= targetPaddle.position.x - 30 &&
        this.cube.position.x <= targetPaddle.position.x + 30 &&
        Math.abs(this.cube.position.z - targetPaddle.position.z) < 130 / 1.8
      ) {
        return true;
      }
    } else {
      if (
        this.cube.position.x >= targetPaddle.position.x - 30 &&
        this.cube.position.x <= targetPaddle.position.x + 30 &&
        Math.abs(this.cube.position.z - targetPaddle.position.z) < 130 / 1.8
      ) {
        return true;
      }
    }
  }

  power1Animation(paddle, paddlePower, targetPaddle) {
    let speed = 50;
    // paddlePower.usePower("power3");
    if (this.moveRight) {
      this.cube.position.x += speed;
    } else {
      this.cube.position.x -= speed;
    }

    if (this.moveRight) {
      if (this.checkCollision(targetPaddle)) {
        this.invertPaddle2();
        this.changePaddleColor(targetPaddle);
        this.stickToPaddle(paddle);
        this.isAnimating = false;
        this.isLaunched = false;
        this.scene.remove(this.cube);
        this.addedToScene = false;
        paddlePower.usePower("power3");
      }
      if (this.cube.position.x > this.launchDistance) {
        this.stickToPaddle(paddle);
        this.isAnimating = false;
        this.isLaunched = false;
        this.scene.remove(this.cube);
        this.addedToScene = false;
        paddlePower.usePower("power3");
      }
    } else {
      if (this.checkCollision(targetPaddle)) {
        this.invertPaddle1();
        this.changePaddleColor(targetPaddle);
        this.stickToPaddle(paddle);
        this.isAnimating = false;
        this.isLaunched = false;
        this.scene.remove(this.cube);
        this.addedToScene = false;
        console.log("Collision avec le paddle 1");
        paddlePower.usePower("power3");
      }
      if (this.cube.position.x < -this.launchDistance) {
        this.stickToPaddle(paddle);
        this.isAnimating = false;
        this.isLaunched = false;
        this.scene.remove(this.cube);
        this.addedToScene = false;
        paddlePower.usePower("power3");
      }
    }

    this.cube.rotation.x += 0.05;
    this.cube.rotation.z += 0.05;
  }

  update(paddle, paddlePower, targetPaddle) {
    if (!this.isLaunched) {
      this.stickToPaddle(paddle);
    } else if (this.isAnimating) {
      this.power1Animation(paddle, paddlePower, targetPaddle);
      if (!this.isAnimating) {
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
        this.cube.rotation.z += 0.01;
      }
    }
    if (this.reverseControls1) {
      setTimeout(() => {
        this.reverseControls1 = false;
      }, 3000);
    }
    if (this.reverseControls2) {
      setTimeout(() => {
        this.reverseControls2 = false;
      }, 3000);
    }
  }

  cleanCube() {
    this.scene.remove(this.cube);
    this.addedToScene = false;
    this.reset();
  }

  setLaunchParameters(
    horizontalSpeed = 0.8,
    verticalSpeed = 1.2,
    gravityForce = 0.03
  ) {
    this.velocity.x = horizontalSpeed;
    this.velocity.y = verticalSpeed;
    this.gravity = gravityForce;
  }

  setBounciness(dampening = 0.7) {
    this.dampening = dampening;
  }

  setColor(color) {
    this.cube.material.color.setHex(color);
  }

  setEmissiveColor(color) {
    this.cube.material.emissive.setHex(color);
  }

  setAnimationDuration(duration) {
    this.ANIMATION_DURATION = duration;
  }

  setMovementDirection(isRight) {
    this.moveRight = isRight;
  }
}
