import * as THREE from "three";

export class NeonBorder {
  constructor(scene, cornerSpheres, camera) {
    this.scene = scene;
    this.cornerSpheres = cornerSpheres; // Sphères d'angle pour définir les coins dans le bon ordre
    this.camera = camera; // Ajouter la caméra en tant qu'attribut
    this.borderLines = [];
    this.isFlashing = false;

    // Propriétés de couleur et d'intensité du flash
    this.originalNeonColor = 0xffffff;
    this.scoringFlashColor = 0xffffff;
    this.flashDuration = 300;
    this.originalBloomStrength = 0.4;
    this.flashBloomStrength = 1.5;

    // Matériau pour les lignes néon
    this.neonMaterial = new THREE.LineBasicMaterial({
      color: this.originalNeonColor,
      linewidth: 7, // L'épaisseur initiale des lignes
      toneMapped: false,
    });

    this.createNeonBorder();
  }

  // createNeonBorder() {
  //   // Supprimer les lignes existantes (si réinitialisation nécessaire)
  //   this.borderLines.forEach((line) => this.scene.remove(line));
  //   this.borderLines = [];

  //   // Utiliser l'ordre correct pour relier les coins
  //   const orderedPositions = [
  //     this.cornerSpheres[0].position, // Coin 1
  //     this.cornerSpheres[1].position, // Coin 2
  //     this.cornerSpheres[3].position, // Coin 4
  //     this.cornerSpheres[2].position, // Coin 3
  //     this.cornerSpheres[0].position, // Retour au Coin 1 pour fermer le rectangle
  //   ];

  //   // Joindre chaque coin dans l'ordre spécifié
  //   for (let i = 0; i < orderedPositions.length - 1; i++) {
  //     const start = orderedPositions[i];
  //     const end = orderedPositions[i + 1];

  //     const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  //     const line = new THREE.Line(geometry, this.neonMaterial);
  //     this.borderLines.push(line);
  //     this.scene.add(line);
  //   }
  // }

  createNeonBorder() {
    // Supprimer les bordures existantes
    if (this.border) {
      this.scene.remove(this.border);
    }

    const borderGroup = new THREE.Group();
    this.neonMaterial = new THREE.MeshBasicMaterial({
      color: this.originalNeonColor,
      toneMapped: false,
    });

    const borderWidth = 4; // Épaisseur de la bordure
    const height = 4; // Hauteur constante pour les bordures

    const orderedPositions = [
      this.cornerSpheres[0].position, // Coin 1
      this.cornerSpheres[1].position, // Coin 2
      this.cornerSpheres[3].position, // Coin 4
      this.cornerSpheres[2].position, // Coin 3
      this.cornerSpheres[0].position, // Retour au Coin 1
    ];

    for (let i = 0; i < orderedPositions.length - 1; i++) {
      const start = orderedPositions[i];
      const end = orderedPositions[i + 1];

      // Calcul de la position du centre du segment
      const midPoint = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5);

      // Calcul de la longueur du segment
      const segmentLength = start.distanceTo(end);

      // Calcul de l'orientation du segment
      const direction = new THREE.Vector3().subVectors(end, start).normalize();

      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(
        new THREE.Vector3(1, 0, 0), // Orientation par défaut
        direction
      );

      // Création de la géométrie et du mesh
      const geometry = new THREE.BoxGeometry(
        segmentLength,
        height,
        borderWidth
      );
      const segment = new THREE.Mesh(geometry, this.neonMaterial);

      segment.position.copy(midPoint); // Position au centre
      segment.quaternion.copy(quaternion); // Orientation alignée

      borderGroup.add(segment);
    }

    this.border = borderGroup;
    this.scene.add(this.border);
  }

  updateLineWidth() {
    // Calculer la distance de la caméra par rapport au centre du rectangle
    const distance = this.camera.position.distanceTo(
      new THREE.Vector3(0, 0, 0)
    );

    // Ajuster l'épaisseur de la ligne en fonction de la distance
    const newLineWidth = Math.max(1, 4 / (distance / 1000)); // Empêche une épaisseur trop petite ou trop grande
    this.neonMaterial.linewidth = newLineWidth;
  }

  updateBorderSize() {
    // Mise à jour pour repositionner les lignes en fonction des nouvelles positions des sphères de coin
    const orderedPositions = [
      this.cornerSpheres[0].position, // Coin 1
      this.cornerSpheres[1].position, // Coin 2
      this.cornerSpheres[3].position, // Coin 4
      this.cornerSpheres[2].position, // Coin 3
      this.cornerSpheres[0].position, // Retour au Coin 1 pour fermer le rectangle
    ];

    this.borderLines.forEach((line, index) => {
      const start = orderedPositions[index];
      const end = orderedPositions[index + 1];
      line.geometry.setFromPoints([start, end]);
    });

    // Mettre à jour la largeur de la ligne après la mise à jour de la position
    this.updateLineWidth();
  }

  flashNeonBorder(bloomPass) {
    if (!this.isFlashing) {
      // console.log("Bloom strength:", bloomPass.strength);
      // console.log("Material color:", this.neonMaterial.color.getHex());
      // console.log("Linewidth:", this.neonMaterial.linewidth);

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
