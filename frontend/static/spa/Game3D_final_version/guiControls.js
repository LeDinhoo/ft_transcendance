import * as THREE from "three";
import { scene, gui } from "./game.js";
import {
  directionalLight,
  directionalLight2,
  directionalLight3,
  directionalLight4,
  targetObject1,
  targetObject2,
} from "./light.js";
import { camera, controls } from "./game.js";

// Création des contrôles pour les lumières
const lightControls = {
  // Lumière 1 (existante)
  light1: {
    intensity: directionalLight.intensity,
    positionX: directionalLight.position.x,
    positionY: directionalLight.position.y,
    positionZ: directionalLight.position.z,
    shadowMapSize: directionalLight.shadow.mapSize.width,
    shadowBias: directionalLight.shadow.bias,
    shadowRadius: directionalLight.shadow.radius,
    shadowCameraFar: directionalLight.shadow.camera.far,
    shadowCameraNear: directionalLight.shadow.camera.near,
    color: "#ffffff",
  },
  // Lumière 2 (existante)
  light2: {
    intensity: directionalLight2.intensity,
    positionX: directionalLight2.position.x,
    positionY: directionalLight2.position.y,
    positionZ: directionalLight2.position.z,
    shadowMapSize: directionalLight2.shadow.mapSize.width,
    shadowBias: directionalLight2.shadow.bias,
    shadowRadius: directionalLight2.shadow.radius,
    shadowCameraFar: directionalLight2.shadow.camera.far,
    shadowCameraNear: directionalLight2.shadow.camera.near,
    color: "#ffffff",
  },
  // Lumière 3 (nouvelle)
  light3: {
    intensity: directionalLight3.intensity,
    positionX: directionalLight3.position.x,
    positionY: directionalLight3.position.y,
    positionZ: directionalLight3.position.z,
    targetX: targetObject1.position.x,
    targetY: targetObject1.position.y,
    targetZ: targetObject1.position.z,
    shadowMapSize: directionalLight3.shadow.mapSize.width,
    shadowBias: directionalLight3.shadow.bias,
    shadowRadius: directionalLight3.shadow.radius,
    shadowCameraFar: directionalLight3.shadow.camera.far,
    shadowCameraNear: directionalLight3.shadow.camera.near,
    color: "#ffffff",
  },
  // Lumière 4 (nouvelle)
  light4: {
    intensity: directionalLight4.intensity,
    positionX: directionalLight4.position.x,
    positionY: directionalLight4.position.y,
    positionZ: directionalLight4.position.z,
    targetX: targetObject2.position.x,
    targetY: targetObject2.position.y,
    targetZ: targetObject2.position.z,
    shadowMapSize: directionalLight4.shadow.mapSize.width,
    shadowBias: directionalLight4.shadow.bias,
    shadowRadius: directionalLight4.shadow.radius,
    shadowCameraFar: directionalLight4.shadow.camera.far,
    shadowCameraNear: directionalLight4.shadow.camera.near,
    color: "#ffffff",
  },
};

// Créer un dossier pour chaque lumière
const light1Folder = gui.addFolder("Directional Light 1");
const light2Folder = gui.addFolder("Directional Light 2");

// Créer des dossiers pour les nouvelles lumières
const light3Folder = gui.addFolder("Directional Light 3 (avec cible)");
const light4Folder = gui.addFolder("Directional Light 4 (avec cible)");

// Fonction helper pour ajouter les contrôles de cible
function addTargetControls(folder, light, controls, target, visualTarget) {
  const targetFolder = folder.addFolder("Target Position");

  targetFolder.add(controls, "targetX", -1000, 1000, 10).onChange((value) => {
    target.position.x = value;
    visualTarget.position.x = value;
  });

  targetFolder.add(controls, "targetY", -1000, 1000, 10).onChange((value) => {
    target.position.y = value;
    visualTarget.position.y = value;
  });

  targetFolder.add(controls, "targetZ", -1000, 1000, 10).onChange((value) => {
    target.position.z = value;
    visualTarget.position.z = value;
  });
}

// Ajouter les contrôles pour les lumières 3 et 4
addLightControls(light3Folder, directionalLight3, lightControls.light3, 3);
addTargetControls(
  light3Folder,
  directionalLight3,
  lightControls.light3,
  targetObject1
);

addLightControls(light4Folder, directionalLight4, lightControls.light4, 4);
addTargetControls(
  light4Folder,
  directionalLight4,
  lightControls.light4,
  targetObject2
);

// Fonction helper pour ajouter les contrôles à un dossier
function addLightControls(folder, light, controls, lightNumber) {
  // Contrôles de base
  folder.add(controls, "intensity", 0, 10, 0.1).onChange((value) => {
    light.intensity = value;
  });

  // Position
  const positionFolder = folder.addFolder("Position");
  positionFolder
    .add(controls, "positionX", -1000, 1000, 10)
    .onChange((value) => {
      light.position.x = value;
    });
  positionFolder.add(controls, "positionY", 0, 1000, 10).onChange((value) => {
    light.position.y = value;
  });
  positionFolder
    .add(controls, "positionZ", -1000, 1000, 10)
    .onChange((value) => {
      light.position.z = value;
    });

  // Couleur
  folder.addColor(controls, "color").onChange((value) => {
    light.color.set(value);
  });

  // Ombres
  const shadowFolder = folder.addFolder("Shadow Settings");

  // Shadow Map Size (doit être puissance de 2)
  shadowFolder
    .add(controls, "shadowMapSize", {
      1024: 1024,
      2048: 2048,
      4096: 4096,
      8192: 8192,
    })
    .onChange((value) => {
      light.shadow.mapSize.width = parseInt(value);
      light.shadow.mapSize.height = parseInt(value);
      light.shadow.map = null; // Force la mise à jour de la shadow map
    });

  // Shadow Bias
  shadowFolder
    .add(controls, "shadowBias", -0.001, 0.001, 0.0001)
    .onChange((value) => {
      light.shadow.bias = value;
    });

  // Shadow Radius
  shadowFolder.add(controls, "shadowRadius", 0, 10, 0.1).onChange((value) => {
    light.shadow.radius = value;
  });

  // Shadow Camera
  const shadowCameraFolder = shadowFolder.addFolder("Shadow Camera");
  shadowCameraFolder
    .add(controls, "shadowCameraNear", 0.1, 100)
    .onChange((value) => {
      light.shadow.camera.near = value;
      light.shadow.camera.updateProjectionMatrix();
    });
  shadowCameraFolder
    .add(controls, "shadowCameraFar", 100, 5000)
    .onChange((value) => {
      light.shadow.camera.far = value;
      light.shadow.camera.updateProjectionMatrix();
    });

  // Helpers visuels
  const helpers = {
    showHelper: false,
  };

  let lightHelper;
  let shadowCameraHelper;

  folder
    .add(helpers, "showHelper")
    .name("Show Helpers")
    .onChange((value) => {
      if (value) {
        // Créer et ajouter les helpers
        lightHelper = new THREE.DirectionalLightHelper(light, 50);
        shadowCameraHelper = new THREE.CameraHelper(light.shadow.camera);
        scene.add(lightHelper);
        scene.add(shadowCameraHelper);
      } else {
        // Supprimer les helpers
        if (lightHelper) {
          scene.remove(lightHelper);
          lightHelper.dispose();
        }
        if (shadowCameraHelper) {
          scene.remove(shadowCameraHelper);
          shadowCameraHelper.dispose();
        }
      }
    });
}

// Ajouter les contrôles pour les deux lumières
addLightControls(light1Folder, directionalLight, lightControls.light1, 1);
addLightControls(light2Folder, directionalLight2, lightControls.light2, 2);

// Ajout d'un bouton pour réinitialiser les lumières
const resetLights = {
  reset: () => {
    // Lumière 1
    directionalLight.position.set(-200, 400, 400);
    directionalLight.intensity = 4;
    directionalLight.shadow.bias = -0.0001;
    directionalLight.shadow.radius = 2;
    directionalLight.shadow.mapSize.set(4096, 4096);
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 3000;
    directionalLight.color.set(0xffffff);

    // Mettre à jour les valeurs dans l'objet de contrôle
    lightControls.light1.intensity = directionalLight.intensity;
    lightControls.light1.positionX = directionalLight.position.x;
    lightControls.light1.positionY = directionalLight.position.y;
    lightControls.light1.positionZ = directionalLight.position.z;
    lightControls.light1.shadowBias = directionalLight.shadow.bias;
    lightControls.light1.shadowRadius = directionalLight.shadow.radius;
    lightControls.light1.shadowMapSize = directionalLight.shadow.mapSize.width;
    lightControls.light1.shadowCameraFar = directionalLight.shadow.camera.far;
    lightControls.light1.shadowCameraNear = directionalLight.shadow.camera.near;
    lightControls.light1.color = "#ffffff";

    // Lumière 2
    directionalLight2.position.set(200, 400, -400);
    directionalLight2.intensity = 4;
    directionalLight2.shadow.bias = -0.0001;
    directionalLight2.shadow.radius = 2;
    directionalLight2.shadow.mapSize.set(4096, 4096);
    directionalLight2.shadow.camera.near = 1;
    directionalLight2.shadow.camera.far = 3000;
    directionalLight2.color.set(0xffffff);

    // Mettre à jour les valeurs dans l'objet de contrôle
    lightControls.light2.intensity = directionalLight2.intensity;
    lightControls.light2.positionX = directionalLight2.position.x;
    lightControls.light2.positionY = directionalLight2.position.y;
    lightControls.light2.positionZ = directionalLight2.position.z;
    lightControls.light2.shadowBias = directionalLight2.shadow.bias;
    lightControls.light2.shadowRadius = directionalLight2.shadow.radius;
    lightControls.light2.shadowMapSize = directionalLight2.shadow.mapSize.width;
    lightControls.light2.shadowCameraFar = directionalLight2.shadow.camera.far;
    lightControls.light2.shadowCameraNear =
      directionalLight2.shadow.camera.near;
    lightControls.light2.color = "#ffffff";

    // Reset Light 3
    directionalLight3.position.set(-500, 500, -500);
    directionalLight3.intensity = 0.3;
    directionalLight3.shadow.bias = -0.0001;
    directionalLight3.shadow.radius = 2;
    directionalLight3.shadow.mapSize.set(8192, 8192);
    directionalLight3.shadow.camera.near = 0.1;
    directionalLight3.shadow.camera.far = 5000;
    directionalLight3.color.set(0xffffff);
    targetObject1.position.set(-200, 0, 0);

    // Mettre à jour les valeurs dans l'objet de contrôle pour light3
    lightControls.light3.intensity = directionalLight3.intensity;
    lightControls.light3.positionX = directionalLight3.position.x;
    lightControls.light3.positionY = directionalLight3.position.y;
    lightControls.light3.positionZ = directionalLight3.position.z;
    lightControls.light3.targetX = targetObject1.position.x;
    lightControls.light3.targetY = targetObject1.position.y;
    lightControls.light3.targetZ = targetObject1.position.z;
    lightControls.light3.shadowBias = directionalLight3.shadow.bias;
    lightControls.light3.shadowRadius = directionalLight3.shadow.radius;
    lightControls.light3.shadowMapSize = directionalLight3.shadow.mapSize.width;
    lightControls.light3.shadowCameraFar = directionalLight3.shadow.camera.far;
    lightControls.light3.shadowCameraNear =
      directionalLight3.shadow.camera.near;
    lightControls.light3.color = "#ffffff";

    // Reset Light 4
    directionalLight4.position.set(500, 500, -500);
    directionalLight4.intensity = 0.3;
    directionalLight4.shadow.bias = -0.0001;
    directionalLight4.shadow.radius = 2;
    directionalLight4.shadow.mapSize.set(8192, 8192);
    directionalLight4.shadow.camera.near = 0.1;
    directionalLight4.shadow.camera.far = 5000;
    directionalLight4.color.set(0xffffff);
    targetObject2.position.set(200, 0, 0);

    // Mettre à jour les valeurs dans l'objet de contrôle pour light4
    lightControls.light4.intensity = directionalLight4.intensity;
    lightControls.light4.positionX = directionalLight4.position.x;
    lightControls.light4.positionY = directionalLight4.position.y;
    lightControls.light4.positionZ = directionalLight4.position.z;
    lightControls.light4.targetX = targetObject2.position.x;
    lightControls.light4.targetY = targetObject2.position.y;
    lightControls.light4.targetZ = targetObject2.position.z;
    lightControls.light4.shadowBias = directionalLight4.shadow.bias;
    lightControls.light4.shadowRadius = directionalLight4.shadow.radius;
    lightControls.light4.shadowMapSize = directionalLight4.shadow.mapSize.width;
    lightControls.light4.shadowCameraFar = directionalLight4.shadow.camera.far;
    lightControls.light4.shadowCameraNear =
      directionalLight4.shadow.camera.near;
    lightControls.light4.color = "#ffffff";

    // Mettre à jour l'affichage de tous les contrôleurs
    [light1Folder, light2Folder, light3Folder, light4Folder].forEach(
      (folder) => {
        folder.controllers.forEach((controller) => {
          controller.updateDisplay();
        });
        folder.folders.forEach((subfolder) => {
          subfolder.controllers.forEach((controller) => {
            controller.updateDisplay();
          });
        });
      }
    );
  },
};

gui.add(resetLights, "reset").name("Reset Lights");

// Ajouter un dossier pour les contrôles de caméra
const cameraFolder = gui.addFolder("Camera Controls");

// Position initiale de la caméra à sauvegarder
const initialCameraPosition = {
  x: 0,
  y: 1000,
  z: 0,
};

// Fonction de reset de la caméra
const cameraControls = {
  reset: () => {
    // Reset de la position
    camera.position.set(
      initialCameraPosition.x,
      initialCameraPosition.y,
      initialCameraPosition.z
    );

    // Reset de la rotation/target
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);

    // Mise à jour des contrôles
    controls.update();
  },
};

// Ajouter le bouton de reset
cameraFolder.add(cameraControls, "reset").name("Reset Camera Position");

// Ajouter des informations sur la position actuelle de la caméra (optionnel)
const cameraPosition = {
  x: camera.position.x,
  y: camera.position.y,
  z: camera.position.z,
};

cameraFolder.add(cameraPosition, "x").listen();
cameraFolder.add(cameraPosition, "y").listen();
cameraFolder.add(cameraPosition, "z").listen();

// Mettre à jour les valeurs affichées dans le GUI
function updateCameraPosition() {
  cameraPosition.x = Math.round(camera.position.x);
  cameraPosition.y = Math.round(camera.position.y);
  cameraPosition.z = Math.round(camera.position.z);
}

// Ajouter l'update à votre boucle d'animation
controls.addEventListener("change", updateCameraPosition);
