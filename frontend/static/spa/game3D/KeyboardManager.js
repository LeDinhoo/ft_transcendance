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

    /**
     * Vérifie si une touche est pressée
     * @param {string} key - La touche à vérifier
     * @returns {boolean} - `true` si la touche est pressée, `false` sinon
     */
    isPressed(key) {
        key = key.toLowerCase();
        return !!this.keys[key]; 
    }

    /**
     * Associe un callback à une touche
     * @param {string} key - La touche à écouter
     * @param {function} callback - La fonction à exécuter lorsque la touche est pressée
     */
    onKey(key, callback) {
        key = key.toLowerCase();

        if (!this.keys.hasOwnProperty(key)) {
            this.keys[key] = false;
        }

        
        this.callbacks.set(key, callback);
    }

    /**
     * Associe un callback spécifique pour la touche espace
     * @param {function} callback - La fonction à exécuter lorsque la touche espace est pressée
     */
    onSpace(callback) {
        this.onSpacePress = callback;
    }

    destroy() {
        window.removeEventListener("keydown", (event) => this.handleKeyDown(event));
        window.removeEventListener("keyup", (event) => this.handleKeyUp(event));
        this.callbacks.clear();
    }
}
