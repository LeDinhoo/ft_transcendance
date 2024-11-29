import * as THREE from "three";

export class PaddleBlast {
  constructor(scene) {
    const circleGeometry1 = new THREE.CircleGeometry(15, 32);
    const circleGeometry2 = new THREE.CircleGeometry(25, 32);

    // Définir le shader personnalisé avec des couleurs personnalisables
    const createGradientShader = (baseColor, emitColor, useGradient = true) => ({
      uniforms: {
        color: { value: new THREE.Color(baseColor) },
        emissiveColor: { value: new THREE.Color(emitColor) },
        emissiveIntensity: { value: useGradient ? 1.0 : 15.0 }, // Plus émissif pour le premier cercle
        opacity: { value: 1.0 },
        useGradient: { value: useGradient ? 1.0 : 0.0 }, // Nouveau uniform pour contrôler le gradient
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform vec3 emissiveColor;
        uniform float emissiveIntensity;
        uniform float opacity;
        uniform float useGradient;
        varying vec2 vUv;
        
        void main() {
            // Calcul de l'opacité différent selon useGradient
            float finalOpacity = useGradient > 0.5 ? vUv.x * opacity : opacity;
            
            // Mélange des couleurs avec plus d'intensité pour le premier cercle
            vec3 finalColor = mix(color, emissiveColor, emissiveIntensity * 0.5);
            gl_FragColor = vec4(finalColor, finalOpacity);
        }
      `,
    });

    // Création des matériaux avec des paramètres différents
    const shader1 = createGradientShader(0xffffff, 0xffffff, false); // Pas de gradient pour le premier
    const shader2 = createGradientShader(0xff9a8e, 0xd3939d, true); // Garde le gradient pour le second

    this.circleMaterial1 = new THREE.ShaderMaterial({
      uniforms: shader1.uniforms,
      vertexShader: shader1.vertexShader,
      fragmentShader: shader1.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    this.circleMaterial2 = new THREE.ShaderMaterial({
      uniforms: shader2.uniforms,
      vertexShader: shader2.vertexShader,
      fragmentShader: shader2.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    // Le reste du code constructeur reste identique
    this.circle1 = new THREE.Mesh(circleGeometry1, this.circleMaterial1);
    this.circle2 = new THREE.Mesh(circleGeometry2, this.circleMaterial2);

    this.circle1.rotation.x = Math.PI / 2;
    this.circle2.rotation.x = Math.PI / 2;

    this.circle1.visible = false;
    this.circle2.visible = false;

    this.circle1.scale.set(1.2, 0.15, 1);
    this.circle2.scale.set(6.5, 0.25, 1);

    scene.add(this.circle1);
    scene.add(this.circle2);

    this.isShowing = false;
    this.fadeStartTime = 0;
    this.fadeDuration = 0;
    this.delayStartTime = 0;
    this.delayDuration = 0;
    this.isPendingShow = false;

    this.initialPosition = new THREE.Vector3();
    this.isMoving = false;
    this.moveStartTime = 0;
    this.moveDuration = 400;
    this.moveDistance = 1400;
  }

  update(paddlePosition) {
    if (this.circle1 && this.circle2) {
      if (!this.isMoving) {
        this.circle1.position.x = paddlePosition.x + 120;
        this.circle1.position.y = 30;
        this.circle1.position.z = paddlePosition.z;

        this.circle2.position.x = paddlePosition.x - 0;
        this.circle2.position.y = 25;
        this.circle2.position.z = paddlePosition.z;
      }

      if (this.isPendingShow) {
        const currentTime = Date.now();
        const elapsedDelay = currentTime - this.delayStartTime;

        if (elapsedDelay >= this.delayDuration) {
          this.isPendingShow = false;
          this._showImmediate();
          this.startMovement();
        }
      }

      if (this.isMoving) {
        const currentTime = Date.now();
        const elapsedMove = currentTime - this.moveStartTime;

        if (elapsedMove < this.moveDuration) {
          const progress = elapsedMove / this.moveDuration;
          this.circle1.position.x =
            this.initialPosition.x + this.moveDistance * progress;
          this.circle2.position.x =
            this.initialPosition.x - 80 + this.moveDistance * progress;
        }
      }

      if (this.isShowing && this.fadeDuration > 0) {
        const currentTime = Date.now();
        const elapsed = currentTime - this.fadeStartTime;

        if (elapsed < this.fadeDuration) {
          // On ne modifie plus l'opacité du premier cercle
          const opacity2 = 0.4 * (1 - elapsed / this.fadeDuration);
          this.circleMaterial2.uniforms.opacity.value = opacity2;
        } else {
          this.hide();
        }
      }
    }
  }

  startMovement() {
    this.isMoving = true;
    this.moveStartTime = Date.now();
    this.initialPosition.copy(this.circle1.position);
  }

  _showImmediate() {
    this.circle1.visible = true;
    this.circle2.visible = true;
    this.isShowing = true;
    this.fadeStartTime = Date.now();
    // L'opacité du premier cercle reste à 1
    this.circleMaterial1.uniforms.opacity.value = 1.0;
    this.circleMaterial2.uniforms.opacity.value = 0.4;
  }

  show(duration = 500, delay = 750) {
    this.fadeDuration = duration;
    this.delayDuration = delay;
    this.delayStartTime = Date.now();
    this.isPendingShow = true;
    this.circle1.visible = false;
    this.circle2.visible = false;
    this.isShowing = false;
    this.isMoving = false;
  }

  hide() {
    this.circle1.visible = false;
    this.circle2.visible = false;
    this.isShowing = false;
    this.isPendingShow = false;
    this.isMoving = false;
  }
}