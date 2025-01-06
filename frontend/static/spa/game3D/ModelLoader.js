import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { scene } from "./main.js";

export class ModelLoader {
  constructor(scoreSystem) {
    this.loader = new GLTFLoader();
    this.scoreSystem = scoreSystem;
    this.gamePlane = null;
    this.paddle1 = null;
    this.paddle2 = null;
  }

  centerObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());

    object.traverse((child) => {
      if (child.isMesh) {
        child.geometry.translate(-center.x, -center.y, -center.z);
      }
    });

    object.position.add(center);
  }

  loadGamePlane() {
    return new Promise((resolve) => {
      this.loader.load("/static/spa/game3D/models/GamePlan.glb", (gltf) => {
        this.gamePlane = gltf.scene;
        this.gamePlane.rotation.y = Math.PI / 2;
        scene.add(this.gamePlane);
        this.gamePlane.scale.set(30, 30, 30);
        this.gamePlane.position.set(0, 6, 0);

        this.gamePlane.traverse((child) => {
          if (child.isMesh) {
            child.receiveShadow = true;
            child.castShadow = false;
            child.material.color.setHex(0x000000);
            child.material.roughness = 0.330709;
            child.material.metalness = 0;
          }
        });

        this.scoreSystem.gamePlane = this.gamePlane;
        resolve(this.gamePlane);
      });
    });
  }

  loadPaddle1() {
    return new Promise((resolve) => {
      this.loader.load("/static/spa/game3D/models/Paddle.glb", (gltf) => {
        this.paddle1 = gltf.scene;
        this.centerObject(this.paddle1);
        this.paddle1.rotation.y = Math.PI;
        this.paddle1.scale.set(20, 20, 20);

        this.paddle1.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = false;
            child.material.color.setHex(0xff5500);
            child.material.roughness = 0.3;
            child.material.metalness = 0.5;
          }
        });

        scene.add(this.paddle1);
        this.scoreSystem.paddle1 = this.paddle1;
        resolve(this.paddle1);
      });
    });
  }

  loadPaddle2() {
    return new Promise((resolve) => {
      this.loader.load("/static/spa/game3D/models/Paddle.glb", (gltf) => {
        this.paddle2 = gltf.scene;
        this.centerObject(this.paddle2);
        this.paddle2.rotation.y = Math.PI;
        this.paddle2.scale.set(20, 20, 20);

        this.paddle2.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = false;
            child.material.color.setHex(0x0d9bff);
            child.material.roughness = 0.3;
            child.material.metalness = 0.5;
          }
        });

        this.paddle2.rotation.y += Math.PI;
        scene.add(this.paddle2);
        this.scoreSystem.paddle2 = this.paddle2;
        resolve(this.paddle2);
      });
    });
  }

  async loadAllModels() {
    try {
      await Promise.all([
        this.loadGamePlane(),
        this.loadPaddle1(),
        this.loadPaddle2(),
      ]);
      return {
        gamePlane: this.gamePlane,
        paddle1: this.paddle1,
        paddle2: this.paddle2,
      };
    } catch (error) {
      throw error;
    }
  }
}

export class ModelCache {
  constructor() {
    this.cache = {};
  }

  loadModel(path) {
    return new Promise((resolve, reject) => {
      if (this.cache[path]) {
        resolve(this.cache[path].clone());
      } else {
        const loader = new GLTFLoader();
        loader.load(
          path,
          (gltf) => {
            this.cache[path] = gltf.scene;
            resolve(gltf.scene.clone());
          },
          undefined,
          (error) => reject(error)
        );
      }
    });
  }
}
