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
  
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    transparent: true, 
    opacity: 0, 
  });

  const spheres = corners.map((corner) => {
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.copy(corner);
    scene.add(sphere);
    return sphere;
  });

  return spheres;
}

export function adjustCameraToRectangle(camera) {
  const aspectRatio = window.innerWidth / window.innerHeight;

  const fovVertical = (camera.fov * Math.PI) / 180;

  const halfWidth = RECTANGLE_WIDTH / 2;
  const halfHeight = RECTANGLE_HEIGHT / 2;

  const distanceHeight = halfHeight / Math.tan(fovVertical / 2);
  const distanceWidth = halfWidth / (Math.tan(fovVertical / 2) * aspectRatio);

  const distance = Math.max(distanceHeight, distanceWidth);

  camera.position.set(0, distance, 0);
  camera.lookAt(0, 0, 0);
}

export function updateOnResize(camera, spheres, percentages) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  adjustCameraToRectangle(camera);
}
