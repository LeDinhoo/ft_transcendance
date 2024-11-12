import * as THREE from "three";
import { scene } from "./game.js";

// Light 1
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);

// Settings for Light and Shadow
directionalLight.position.set(-700, 500, 0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 2000;
directionalLight.shadow.camera.left = -2000;
directionalLight.shadow.camera.right = 2000;
directionalLight.shadow.camera.top = 2000;
directionalLight.shadow.camera.bottom = -2000;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.bias = -0.0001;
directionalLight.shadow.radius = 2;

// Add Light to Scene
scene.add(directionalLight);

// Light 2
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);

// Settings for Light and Shadow
directionalLight2.position.set(700, 500, 0);
directionalLight2.castShadow = true;
directionalLight2.shadow.camera.near = 1;
directionalLight2.shadow.camera.far = 2000;
directionalLight2.shadow.camera.left = -2000;
directionalLight2.shadow.camera.right = 2000;
directionalLight2.shadow.camera.top = 2000;
directionalLight2.shadow.camera.bottom = -2000;
directionalLight2.shadow.mapSize.width = 2048;
directionalLight2.shadow.mapSize.height = 2048;
directionalLight2.shadow.bias = -0.0001;
directionalLight2.shadow.radius = 2;

// Add Light to Scene
scene.add(directionalLight2);

// Ambient Light
const ambiantLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambiantLight);

// Create Target Objects for new directional lights
// Target 1
const targetObject1 = new THREE.Object3D();
targetObject1.position.set(-200, 0, 0);
scene.add(targetObject1);

// Target 2
const targetObject2 = new THREE.Object3D();
targetObject2.position.set(200, 0, 0);
scene.add(targetObject2);


// Create new Directional Lights with targets
const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight3.position.set(-500, 500, -500);
directionalLight3.target = targetObject1;
directionalLight3.castShadow = true;
configureShadowSettings(directionalLight3);
// scene.add(directionalLight3);

const directionalLight4 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight4.position.set(500, 500, 500);
directionalLight4.target = targetObject2;
directionalLight4.castShadow = true;
configureShadowSettings(directionalLight4);
// scene.add(directionalLight4);

const directionalLight5 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight5.position.set(500, 500, -500);
directionalLight5.target = targetObject2;
directionalLight5.castShadow = true;
configureShadowSettings(directionalLight5);
// scene.add(directionalLight5);

const directionalLight6 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight6.position.set(-500, 500, 500);
directionalLight6.target = targetObject1;
directionalLight6.castShadow = true;
configureShadowSettings(directionalLight6);
// scene.add(directionalLight6);


// Helper function to configure shadow settings
function configureShadowSettings(light) {
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 2000;
  light.shadow.camera.left = -2000;
  light.shadow.camera.right = 2000;
  light.shadow.camera.top = 2000;
  light.shadow.camera.bottom = -2000;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.bias = -0.0001;
  light.shadow.radius = 2;
}

// Exports
export {
  directionalLight,
  directionalLight2,
  // directionalLight3,
  // directionalLight4,
  ambiantLight,
  targetObject1,
  targetObject2,
};
