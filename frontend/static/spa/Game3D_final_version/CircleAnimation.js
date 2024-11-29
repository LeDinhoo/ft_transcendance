import * as THREE from "three";

export class WhiteCircle {
  constructor(scene) {
    const createCircle = (radius, maxOpacity) => {
      const geometry = new THREE.CircleGeometry(radius, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          maxOpacity: { value: maxOpacity },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform float maxOpacity;
          
          void main() {
            vec2 center = vec2(0.5, 0.5);
            float dist = distance(vUv, center) * 2.0;
            
            float alpha = 0.0;
            if (dist > 0.7) {
              alpha = ((dist - 0.7) / 0.3) * maxOpacity;
            }
            
            gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = Math.PI / 2;
      mesh.visible = false;
      scene.add(mesh);
      return mesh;
    };

    // Créer deux cercles avec des opacités différentes
    this.circle = createCircle(55, 0.03); // Cercle intérieur avec opacité originale
    this.outerCircle = createCircle(65, 0.008); // Cercle extérieur avec opacité plus faible

    // Variables communes
    this.isVisible = false;
    this.timeout = null;
    this.startTime = null;
    this.animationDuration = 570;
    this.animationDelay = null;
    this.delayTimeout = null;
  }

  update(paddlePosition) {
    const updateCircle = (circle) => {
      circle.position.set(paddlePosition.x + 28, 25, paddlePosition.z);

      if (circle.visible && this.startTime) {
        const currentTime = Date.now();
        const elapsed = currentTime - this.startTime;

        if (elapsed > this.animationDelay) {
          const animationProgress =
            (elapsed - this.animationDelay) / this.animationDuration;

          if (animationProgress <= 1) {
            const scale = 1 - animationProgress * 0.7;
            circle.scale.set(scale, scale, scale);
          }
        }
      }
    };

    // Mettre à jour les deux cercles
    updateCircle(this.circle);
    updateCircle(this.outerCircle);
  }

  show(delay = 0) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (this.delayTimeout) {
      clearTimeout(this.delayTimeout);
    }

    // Réinitialiser l'échelle des deux cercles
    this.circle.scale.set(1, 1, 1);
    this.outerCircle.scale.set(1, 1, 1);

    // Rendre les deux cercles visibles
    this.circle.visible = true;
    this.outerCircle.visible = true;

    this.animationDelay = delay;
    this.startTime = Date.now();

    this.timeout = setTimeout(() => {
      this.hide();
    }, this.animationDuration + delay);
  }

  hide() {
    this.circle.visible = false;
    this.outerCircle.visible = false;
    this.timeout = null;
    this.delayTimeout = null;
    this.startTime = null;
  }
}
