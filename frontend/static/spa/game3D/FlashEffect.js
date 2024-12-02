import * as THREE from "three";

export class FlashEffect {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.flashPlane = null;
    this.isFlashing = false;
    this.flashDuration = 500;
    this.flashStartTime = 0;
    this.flashPhase = "idle";
    this.flashIntensity = 0;

    this.createFlashOverlay();
    this.handleResize();
  }

  createFlashOverlay() {
    const flashGeometry = new THREE.PlaneGeometry(1, 1);
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthTest: false,
    });

    this.flashPlane = new THREE.Mesh(flashGeometry, flashMaterial);
    this.flashPlane.position.z = -2;
    this.camera.add(this.flashPlane);
    this.scene.add(this.camera);
  }

  handleResize() {
    if (this.flashPlane) {
      const distance = Math.abs(this.flashPlane.position.z);
      const height = 2 * Math.tan((this.camera.fov * Math.PI) / 360) * distance;
      const width = height * this.camera.aspect;
      this.flashPlane.scale.set(width, height, 1);
    }
  }

  triggerFlash() {
    this.isFlashing = true;
    this.flashStartTime = Date.now();
    this.flashPhase = "full";
    this.flashIntensity = 1;
    this.flashPlane.material.opacity = 1;
  }

  update() {
    if (this.isFlashing) {
      if (this.flashPhase === "full") {
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.flashStartTime;

        if (elapsedTime >= this.flashDuration) {
          this.flashPhase = "fadeOut";
        }
      } else if (this.flashPhase === "fadeOut") {
        this.flashIntensity *= 0.93;
        this.flashPlane.material.opacity = this.flashIntensity;

        if (this.flashIntensity < 0.01) {
          this.flashPlane.material.opacity = 0;
          this.flashPhase = "idle";
          this.isFlashing = false;
          this.flashIntensity = 0;
        }
      }
    }
  }
}
