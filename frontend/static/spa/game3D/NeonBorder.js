import * as THREE from "three";

export class NeonBorder {
  constructor(scene, cornerSpheres, camera) {
    this.scene = scene;
    this.cornerSpheres = cornerSpheres;
    this.camera = camera;
    this.borderLines = [];
    this.isFlashing = false;
    this.originalNeonColor = 0xffffff;
    this.scoringFlashColor = 0xffffff;
    this.flashDuration = 350;
    this.originalBloomStrength = 0.4;
    this.flashBloomStrength = 4.5;
    this.neonMaterial = new THREE.LineBasicMaterial({
      color: this.originalNeonColor,
      linewidth: 7,
      toneMapped: false,
    });
    this.createNeonBorder();
  }

  createNeonBorder() {
    if (this.border) {
      this.scene.remove(this.border);
    }

    const borderGroup = new THREE.Group();
    this.neonMaterial = new THREE.MeshBasicMaterial({
      color: this.originalNeonColor,
      toneMapped: false,
    });

    const borderWidth = 4;
    const height = 4;

    const orderedPositions = [
      this.cornerSpheres[0].position, 
      this.cornerSpheres[1].position, 
      this.cornerSpheres[3].position, 
      this.cornerSpheres[2].position, 
      this.cornerSpheres[0].position, 
    ];

    for (let i = 0; i < orderedPositions.length - 1; i++) {
      const start = orderedPositions[i];
      const end = orderedPositions[i + 1];

      const midPoint = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5);

      const segmentLength = start.distanceTo(end);

      const direction = new THREE.Vector3().subVectors(end, start).normalize();

      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(
        new THREE.Vector3(1, 0, 0),
        direction
      );

      const geometry = new THREE.BoxGeometry(
        segmentLength,
        height,
        borderWidth
      );
      const segment = new THREE.Mesh(geometry, this.neonMaterial);

      segment.position.copy(midPoint);
      segment.quaternion.copy(quaternion);

      borderGroup.add(segment);
    }

    this.border = borderGroup;
    this.scene.add(this.border);
  }

  updateLineWidth() {
    const distance = this.camera.position.distanceTo(
      new THREE.Vector3(0, 0, 0)
    );

    const newLineWidth = Math.max(1, 4 / (distance / 1000));
    this.neonMaterial.linewidth = newLineWidth;
  }

  updateBorderSize() {
    const orderedPositions = [
      this.cornerSpheres[0].position, 
      this.cornerSpheres[1].position, 
      this.cornerSpheres[3].position, 
      this.cornerSpheres[2].position, 
      this.cornerSpheres[0].position, 
    ];

    this.borderLines.forEach((line, index) => {
      const start = orderedPositions[index];
      const end = orderedPositions[index + 1];
      line.geometry.setFromPoints([start, end]);
    });

    this.updateLineWidth();
  }

  resetNeonColorToWhite() {
    setTimeout(() => {
      this.neonMaterial.color.setHex(0xffffff);
      this.originalNeonColor = 0xffffff;
      this.scoringFlashColor = 0xffffff;
    }, 760);
  }

  flashNeonBorder(bloomPass, player, color = null) {
    if (player === 1) {
      this.originalNeonColor = 0xff8c3d;
      this.scoringFlashColor = 0xff8c3d;
    } else {
      this.originalNeonColor = 0x3db8ff;
      this.scoringFlashColor = 0x3db8ff;
    }

    if (color) {
      this.originalNeonColor = color;
      this.scoringFlashColor = color;
    }
    
    if (!this.isFlashing) {

      this.isFlashing = true;
      const startTime = performance.now();

      const animateFlash = () => {
        const elapsed = performance.now() - startTime;
        const progress = elapsed / this.flashDuration;

        if (progress < 1) {
          const pulseIntensity =
            this.flashBloomStrength * Math.sin(progress * Math.PI);
          bloomPass.strength = this.originalBloomStrength + pulseIntensity;

          const colorMix = Math.sin(progress * Math.PI);
          this.neonMaterial.color
            .setHex(this.scoringFlashColor)
            .lerp(new THREE.Color(this.originalNeonColor), 1 - colorMix);

          requestAnimationFrame(animateFlash);
        } else {
          bloomPass.strength = this.originalBloomStrength;
          this.neonMaterial.color.setHex(this.originalNeonColor);
          this.isFlashing = false;
        }
      };

      animateFlash();
    }
  }
}
