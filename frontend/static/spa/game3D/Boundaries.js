import * as THREE from "three";

const RECTANGLE_WIDTH = 1600;
const RECTANGLE_HEIGHT = 800;

export function createCornerSpheres(
  scene,
  percentages = [
    { x: 100, z: 100 },
    { x: 100, z: 100 },
    { x: 100, z: 100 },
    { x: 100, z: 100 },
  ]
) {
  const corners = [
    new THREE.Vector3(
      (-RECTANGLE_WIDTH / 2) * (percentages[0].x / 100),
      10,
      (-RECTANGLE_HEIGHT / 2) * (percentages[0].z / 100)
    ),
    new THREE.Vector3(
      (RECTANGLE_WIDTH / 2) * (percentages[1].x / 100),
      10,
      (-RECTANGLE_HEIGHT / 2) * (percentages[1].z / 100)
    ),
    new THREE.Vector3(
      (-RECTANGLE_WIDTH / 2) * (percentages[2].x / 100),
      10,
      (RECTANGLE_HEIGHT / 2) * (percentages[2].z / 100)
    ),
    new THREE.Vector3(
      (RECTANGLE_WIDTH / 2) * (percentages[3].x / 100),
      10,
      (RECTANGLE_HEIGHT / 2) * (percentages[3].z / 100)
    ),
  ];

  const sphereGeometry = new THREE.SphereGeometry(10, 32, 32);
  // Modifier le matériau pour avoir de la transparence
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    transparent: true, // Active la transparence
    opacity: 0, // Définit l'opacité à 0 (complètement transparent)
  });

  const spheres = corners.map((corner) => {
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.copy(corner);
    scene.add(sphere);
    return sphere;
  });

  return spheres;
}

// Fonction d'ajustement automatique de la caméra pour cadrer le rectangle
export function adjustCameraToRectangle(camera) {
  const aspectRatio = window.innerWidth / window.innerHeight;

  // Champ de vision vertical en radians
  const fovVertical = (camera.fov * Math.PI) / 180;

  // Calcul de la distance en fonction du champ de vision pour couvrir la largeur du rectangle
  const halfWidth = RECTANGLE_WIDTH / 2;
  const halfHeight = RECTANGLE_HEIGHT / 2;

  // Distance nécessaire pour cadrer le rectangle en fonction de la dimension dominante
  const distanceHeight = halfHeight / Math.tan(fovVertical / 2);
  const distanceWidth = halfWidth / (Math.tan(fovVertical / 2) * aspectRatio);

  // Prend la distance la plus grande pour que le rectangle soit entièrement visible
  const distance = Math.max(distanceHeight, distanceWidth);

  // Positionner la caméra à cette distance et centrer la vue
  camera.position.set(0, distance, 0);
  camera.lookAt(0, 0, 0);
}

// Fonction appelée lors du redimensionnement de la fenêtre pour ajuster les éléments
export function updateOnResize(camera, spheres, percentages) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  adjustCameraToRectangle(camera);
}
