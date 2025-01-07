import * as THREE from "three";
import { scene } from "./main.js";


const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);


directionalLight.position.set(-700, 500, 0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 2;
directionalLight.shadow.camera.far = 1000;
directionalLight.shadow.camera.left = -1000;
directionalLight.shadow.camera.right = 1000;
directionalLight.shadow.camera.top = 1000;
directionalLight.shadow.camera.bottom = -1000;
directionalLight.shadow.mapSize.width = 512;
directionalLight.shadow.mapSize.height = 512;
directionalLight.shadow.bias = -0.1;
directionalLight.shadow.radius = 2;


scene.add(directionalLight);


const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);


directionalLight2.position.set(700, 500, 0);
directionalLight2.castShadow = true;
directionalLight2.shadow.camera.near = 1;
directionalLight2.shadow.camera.far = 1000;
directionalLight2.shadow.camera.left = -1000;
directionalLight2.shadow.camera.right = 1000;
directionalLight2.shadow.camera.top = 1000;
directionalLight2.shadow.camera.bottom = -1000;
directionalLight2.shadow.mapSize.width = 512;
directionalLight2.shadow.mapSize.height = 512;
directionalLight2.shadow.bias = -0.1;
directionalLight2.shadow.radius = 2;


scene.add(directionalLight2);


const ambiantLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambiantLight);


const targetObject1 = new THREE.Object3D();
targetObject1.position.set(-200, 0, 0);
scene.add(targetObject1);

const targetObject2 = new THREE.Object3D();
targetObject2.position.set(200, 0, 0);
scene.add(targetObject2);

const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight3.position.set(-200, 500, -500);
directionalLight3.target = targetObject1;
directionalLight3.castShadow = true;
configureShadowSettings(directionalLight3);
scene.add(directionalLight3);

const directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight4.position.set(200, 500, 500);
directionalLight4.target = targetObject2;
directionalLight4.castShadow = true;
configureShadowSettings(directionalLight4);
scene.add(directionalLight4);

const directionalLight5 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight5.position.set(500, 500, -500);
directionalLight5.target = targetObject2;
directionalLight5.castShadow = true;
configureShadowSettings(directionalLight5);

const directionalLight6 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight6.position.set(-500, 500, 500);
directionalLight6.target = targetObject1;
directionalLight6.castShadow = true;
configureShadowSettings(directionalLight6);

function configureShadowSettings(light) {
  light.shadow.camera.near = 2;
  light.shadow.camera.far = 1000;
  light.shadow.camera.left = -1000;
  light.shadow.camera.right = 1000;
  light.shadow.camera.top = 1000;
  light.shadow.camera.bottom = -2000;
  light.shadow.mapSize.width = 512;
  light.shadow.mapSize.height = 512;
  light.shadow.bias = -0.1;
  light.shadow.radius = 2;
}

export {
  directionalLight,
  directionalLight2,
  directionalLight3,
  directionalLight4,
  ambiantLight,
  targetObject1,
  targetObject2,
};
