export class KeyboardManager {
    constructor() {
        this.keys = {}; 
        this.callbacks = new Map(); 
        this.onSpacePress = null; 
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        window.addEventListener("keydown", (event) => this.handleKeyDown(event));
        window.addEventListener("keyup", (event) => this.handleKeyUp(event));
    }

    handleKeyDown(event) {
        const key = event.key.toLowerCase();

        
        if (!this.keys.hasOwnProperty(key)) {
            this.keys[key] = false;
        }

       
        this.keys[key] = true;

        
        if (key === ' ' && this.onSpacePress) {
            this.onSpacePress();
        }

       
        const callback = this.callbacks.get(key);
        if (callback) {
            callback();
        }
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();

        
        if (!this.keys.hasOwnProperty(key)) {
            this.keys[key] = false;
        }

        
        this.keys[key] = false;
    }

    isPressed(key) {
        key = key.toLowerCase();
        return !!this.keys[key]; 
    }

    onKey(key, callback) {
        key = key.toLowerCase();

        if (!this.keys.hasOwnProperty(key)) {
            this.keys[key] = false;
        }

        
        this.callbacks.set(key, callback);
    }

    onSpace(callback) {
        this.onSpacePress = callback;
    }

    destroy() {
        window.removeEventListener("keydown", (event) => this.handleKeyDown(event));
        window.removeEventListener("keyup", (event) => this.handleKeyUp(event));
        this.callbacks.clear();
    }
}
