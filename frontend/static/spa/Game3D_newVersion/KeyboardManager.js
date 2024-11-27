export class KeyboardManager {
    constructor() {
        this.keys = {
            w: false,
            s: false,
            arrowleft: false,
            arrowright: false,
            arrowup: false,
            arrowdown: false,
            space: false,
            l: false, 
        };

        this.callbacks = new Map();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        window.addEventListener("keydown", (event) => this.handleKeyDown(event));
        window.addEventListener("keyup", (event) => this.handleKeyUp(event));
    }

    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = true;
        }
        
        if (key === ' ') {
            this.keys.space = true;
            this.onSpacePress?.();
        }

        // Exécute le callback associé à la touche si il existe
        const callback = this.callbacks.get(key);
        if (callback) {
            callback();
        }
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = false;
        }
        
        if (key === ' ') {
            this.keys.space = false;
        }
    }

    isPressed(key) {
        return this.keys[key.toLowerCase()];
    }

    onSpace(callback) {
        this.onSpacePress = callback;
    }

    // Nouvelle méthode pour ajouter des callbacks pour n'importe quelle touche
    onKey(key, callback) {
        this.callbacks.set(key.toLowerCase(), callback);
    }

    destroy() {
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("keyup", this.handleKeyUp);
        this.callbacks.clear();
    }
}