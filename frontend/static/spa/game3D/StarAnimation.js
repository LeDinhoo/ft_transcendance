import * as THREE from "three";

export class Star {
    constructor(scene, color = 0xffffff) {
        this.outerRadius = 165;
        this.innerRadius = 3;
        this.targetOuterRadius = 135;
        this.targetInnerRadius = 2.5;
        this.radiusAnimationSpeed = 0.05;
        this.scene = scene;
        this.color = color;

        // Material creation
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(color) },
                globalOpacity: { value: 0 },
                startFade: { value: 0.2 },
                endFade: { value: 0.66 },
                minOpacity: { value: 0.1 }
            },
            vertexShader: `
                varying float vDistance;
                attribute float distance;
                
                void main() {
                    vDistance = distance;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float globalOpacity;
                uniform float startFade;
                uniform float endFade;
                uniform float minOpacity;
                varying float vDistance;
                
                void main() {
                    float fadeRange = endFade - startFade;
                    float opacity = globalOpacity;
                    
                    if (vDistance > startFade) {
                        float t = (vDistance - startFade) / fadeRange;
                        t = clamp(t, 0.0, 1.0);
                        opacity *= mix(1.0, minOpacity, t);
                    }
                    
                    gl_FragColor = vec4(color, opacity);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        // Initial geometry creation
        this.createStarGeometry();
        
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.x = Math.PI / 2;
        this.mesh.position.y = 25;
        
        this.isVisible = false;
        this.hideTimeout = null;
        this.isAnimating = false;
        
        scene.add(this.mesh);
    }
    
    createStarGeometry() {
        const starShape = new THREE.Shape();
        
        for (let i = 0; i < 8; i++) {
            const radius = i % 2 === 0 ? this.outerRadius : this.innerRadius;
            const angle = (i * Math.PI) / 4;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                starShape.moveTo(x, y);
            } else {
                starShape.lineTo(x, y);
            }
        }
        starShape.closePath();
        
        this.geometry = new THREE.ShapeGeometry(starShape);
        
        // Calculate distances for gradient
        const positions = this.geometry.attributes.position.array;
        const distances = new Float32Array(positions.length / 3);
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const distance = Math.sqrt(x * x + y * y) / this.outerRadius;
            distances[i/3] = distance;
        }
        
        this.geometry.setAttribute('distance', new THREE.Float32BufferAttribute(distances, 1));
        return this.geometry;
    }
    
    updateGeometry() {
        const newGeometry = this.createStarGeometry();
        this.mesh.geometry.dispose(); // Clean up old geometry
        this.mesh.geometry = newGeometry;
    }
    
    animateRadius(newOuterRadius, newInnerRadius) {
        this.targetOuterRadius = newOuterRadius;
        this.targetInnerRadius = newInnerRadius;
        this.isAnimating = true;
    }
    
    show(duration = 1000) {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        
        this.isVisible = true;
        this.material.uniforms.globalOpacity.value = 0.6;
        
        // Animate radius on show
        this.animateRadius(5, 2.5);
        
        this.hideTimeout = setTimeout(() => {
            this.hide();
        }, duration);
    }
    
    hide() {
        this.isVisible = false;
        this.material.uniforms.globalOpacity.value = 0.0;
        this.animateRadius(165, 3); // Return to initial values
    }
    
    update(paddlePosition) {
        this.mesh.position.x = paddlePosition.x + 28;
        this.mesh.position.z = paddlePosition.z;
        
        if (this.isAnimating) {
            // Animate radius
            const deltaOuter = this.targetOuterRadius - this.outerRadius;
            const deltaInner = this.targetInnerRadius - this.innerRadius;
            
            if (Math.abs(deltaOuter) > 0.1 || Math.abs(deltaInner) > 0.1) {
                this.outerRadius += deltaOuter * this.radiusAnimationSpeed;
                this.innerRadius += deltaInner * this.radiusAnimationSpeed;
                this.updateGeometry();
            } else {
                this.isAnimating = false;
            }
        }
        
        if (this.isVisible) {
            this.mesh.rotation.z += 0.001;
        }
    }
    
    setGradient(startFade, endFade, minOpacity) {
        this.material.uniforms.startFade.value = startFade;
        this.material.uniforms.endFade.value = endFade;
        this.material.uniforms.minOpacity.value = minOpacity;
    }
}