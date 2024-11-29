import * as THREE from "three";

class Shot {
  constructor(scene) {
    // Géométrie du cercle
    const circleGeometry = new THREE.CircleGeometry(60, 32);
    const circleGeometry2 = new THREE.CircleGeometry(20, 32);

    // Matériau blanc simple
    const circleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });

    // Matériau blanc simple
    const circleMaterial2 = new THREE.MeshBasicMaterial({
      color: 0xe28743,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });

    this.circle = new THREE.Mesh(circleGeometry, circleMaterial);
    this.circle2 = new THREE.Mesh(circleGeometry2, circleMaterial2);
    this.circle.rotation.x = -Math.PI / 2;
    this.circle2.rotation.x = -Math.PI / 2;
    this.circle.position.y = 20;
    this.circle2.position.y = 25;

    scene.add(this.circle);
    scene.add(this.circle2);

    this.circle.visible = false;
    this.circle2.visible = false;

    // Propriétés pour gérer le timing
    this.startDelay = 0; // Délai avant apparition
    this.displayDuration = 0; // Durée d'affichage
    this.startTime = 0; // Pour suivre le temps
  }

  update(paddlePosition) {
    const currentTime = performance.now();

    // Gestion du délai d'apparition
    if (this.startTime > 0 && currentTime - this.startTime >= this.startDelay) {
      this.circle.visible = true;
      this.circle2.visible = true;
    }

    // Gestion de la durée d'affichage
    if (
      this.displayDuration > 0 &&
      this.startTime > 0 &&
      currentTime - this.startTime >= this.startDelay + this.displayDuration
    ) {
      this.circle.visible = false;
      this.circle2.visible = false;
      this.startTime = 0;
    }

    // Mise à jour de la position si visible
    if (this.circle.visible) {
      this.circle.position.x = paddlePosition.x + 25;
      this.circle.position.z = paddlePosition.z;
    }

    if (this.circle2.visible) {
      this.circle2.position.x = paddlePosition.x + 25;
      this.circle2.position.z = paddlePosition.z;
    }
  }

  show(delay = 720, duration = 30) {
    this.startDelay = delay; // Délai en millisecondes
    this.displayDuration = duration; // Durée en millisecondes
    this.startTime = performance.now();

    // Si pas de délai, afficher immédiatement
    if (delay === 0) {
      this.circle.visible = true;
      this.circle2.visible = true;
    }
  }

  hide() {
    this.circle.visible = false;
    this.circle2.visible = false;
    this.startTime = 0;
  }
}

export { Shot };
