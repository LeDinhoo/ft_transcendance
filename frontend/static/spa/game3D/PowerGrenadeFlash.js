import * as THREE from "three";

export class Grenade {
  constructor(scene, flashEffect, player, modelCache, modelName) {
    this.isAnimating = false;
    this.isLaunched = false;
    this.animationStartTime = 0;
    this.initialX = 0;
    this.initialZ = 0;
    this.initialY = 15;
    this.ANIMATION_DURATION = 1500;
    this.flashEffect = flashEffect;
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
    this.isActive = false;
    this.locked = true;
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
          this.cube = this.adjustPivotToCenterY(this.cube);
          this.cube.scale.set(17, 17, 17);
          this.cube.position.y = this.initialY;
          this.cube.rotation.x = Math.PI / 4;
          this.cube.rotation.y = Math.PI / 4;
          this.cube.rotation.z = Math.PI / 4;
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
    this.scene.add(this.cube);
    this.addedToScene = true;
    this.unlock();

    if (!this.isLaunched) {
      this.cube.position.x = paddle.position.x;
      this.cube.position.z = paddle.position.z;
      this.cube.position.y = this.initialY + 20;

      this.cube.rotation.x += 0.02;
      this.cube.rotation.y += 0.02;
      this.cube.rotation.z += 0.02;
    }
  }

  reset() {
    this.isLaunched = false;
    this.isAnimating = false;
    this.cube.position.y = this.initialY;
  }

  triggerAnimation(paddle, animationManager) {
    this.animationStartTime = Date.now();

    this.cube.position.x = paddle.position.x;
    this.cube.position.z = paddle.position.z;
    this.cube.position.y = this.initialY + 20;

    this.velocity = {
      x: 12.5,
      y: 20,
      z: 50,
    };

    animationManager.addAnimation(this.cube, (cube, now) => {
      const elapsedTime = now - this.animationStartTime;

      if (elapsedTime >= this.ANIMATION_DURATION) {
        this.flashEffect.triggerFlash();
        this.cleanCube();
        return false;
      }

      if (this.moveRight) {
        cube.position.x += this.velocity.x;
      } else {
        cube.position.x -= this.velocity.x;
      }

      cube.position.y += this.velocity.y;
      this.velocity.y -= this.gravity;

      if (cube.position.y < this.groundY) {
        cube.position.y = this.groundY;
        this.velocity.y = Math.abs(this.velocity.y) * this.dampening;
        this.velocity.x *= 0.55;
      }

      cube.rotation.x += 0.02 * this.velocity.x;
      cube.rotation.z += 0.02 * this.velocity.y;

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
