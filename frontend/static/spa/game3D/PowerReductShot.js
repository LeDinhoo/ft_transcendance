import * as THREE from "three";

export class ReductShot {
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
    this.locked = true;
    this.frequency = 0.013;
    this.phaseOffset = 0;
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

          this.cube.scale.set(0.6, 0.6, 0.6);
          this.cube.position.y = this.initialY;
          this.adjustPivotToCenterY(this.cube);
          resolve(this.cube);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  unlock() {
    this.locked = false;
  }

  getLocked() {
    return this.locked;
  }

  stickToPaddle(paddle) {
    if (!this.addedToScene) {
      this.scene.add(this.cube);
      this.addedToScene = true;
      this.unlock();
    }

    this.cube.position.x = paddle.position.x;
    this.cube.position.z = paddle.position.z;
    this.cube.position.y = this.initialY + 20;

    this.cube.rotation.x += 0;
    this.cube.rotation.y += 0.2;
    this.cube.rotation.z += 0;

    this.phaseOffset = Math.asin(0) - this.cube.position.x * this.frequency;
  }

  reset() {
    this.isLaunched = false;
    this.isAnimating = false;
    this.cube.position.y = this.initialY;
  }

  checkCollision(targetPaddle) {
    if (this.moveRight) {
      if (
        this.cube.position.x >= targetPaddle.position.x - 60 &&
        this.cube.position.x <= targetPaddle.position.x + 60 &&
        Math.abs(this.cube.position.z - targetPaddle.position.z) < 130 / 1.8
      ) {
        return true;
      }
    } else {
      if (
        this.cube.position.x >= targetPaddle.position.x - 60 &&
        this.cube.position.x <= targetPaddle.position.x + 60 &&
        Math.abs(this.cube.position.z - targetPaddle.position.z) < 130 / 1.8
      ) {
        return true;
      }
    }
  }

  triggerAnimation(paddle, animationManager, targetPaddle, heightTarget) {
    this.animationStartTime = Date.now();

    this.cube.position.x = paddle.position.x;
    this.cube.position.z = paddle.position.z;
    this.cube.position.y = this.initialY + 20;

    let startTornadoPosition = this.cube.position.z;
    let speed = 5;
    const amplitude = 240;

    animationManager.addAnimation(this.cube, (cube, now) => {
      if (this.moveRight) {
        if (this.checkCollision(targetPaddle)) {
          heightTarget.reduceHeight();
          this.cleanCube();
          return false;
        }
        if (cube.position.x > this.launchDistance) {
          this.cleanCube();
          return false;
        }
      } else {
        if (this.checkCollision(targetPaddle)) {
          heightTarget.reduceHeight();
          this.cleanCube();
          return false;
        }
        if (cube.position.x < -this.launchDistance) {
          this.cleanCube();
          return false;
        }
      }

      if (this.moveRight) {
        cube.position.x += speed;
      } else {
        cube.position.x -= speed;
      }

      cube.position.z =
        startTornadoPosition +
        Math.sin(cube.position.x * this.frequency + this.phaseOffset) *
          amplitude;

      cube.rotation.y += 0.25;
      return true;
    });
  }

  update(paddle1, paddle2) {
    switch (this.player) {
      case 1:
        this.stickToPaddle(paddle1);
        break;
      case 2:
        this.stickToPaddle(paddle2);
        break;
    }
  }

  cleanCube() {
    this.scene.remove(this.cube);
    this.addedToScene = false;
    this.reset();
  }
}
