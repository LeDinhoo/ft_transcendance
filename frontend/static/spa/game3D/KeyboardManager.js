export class KeyboardManager {
    constructor() {
        this.keys = {}; // Gestion dynamique des touches
        this.callbacks = new Map(); // Associe des touches spécifiques à des callbacks
        this.onSpacePress = null; // Callback spécifique pour la touche espace
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        window.addEventListener("keydown", (event) => this.handleKeyDown(event));
        window.addEventListener("keyup", (event) => this.handleKeyUp(event));
    }

    handleKeyDown(event) {
        const key = event.key.toLowerCase();

        // Ajouter dynamiquement la touche si elle n'existe pas
        if (!this.keys.hasOwnProperty(key)) {
            this.keys[key] = false;
        }

        // Marquer la touche comme pressée
        this.keys[key] = true;

        // Gestion spécifique pour la touche espace
        if (key === ' ' && this.onSpacePress) {
            this.onSpacePress();
        }

        // Exécuter le callback associé à la touche, si défini
        const callback = this.callbacks.get(key);
        if (callback) {
            callback();
        }
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();

        // Ajouter dynamiquement la touche si elle n'existe pas
        if (!this.keys.hasOwnProperty(key)) {
            this.keys[key] = false;
        }

        // Marquer la touche comme relâchée
        this.keys[key] = false;
    }

    /**
     * Vérifie si une touche est pressée
     * @param {string} key - La touche à vérifier
     * @returns {boolean} - `true` si la touche est pressée, `false` sinon
     */
    isPressed(key) {
        key = key.toLowerCase();
        return !!this.keys[key]; // Retourne `false` par défaut si la touche n'existe pas
    }

    /**
     * Associe un callback à une touche
     * @param {string} key - La touche à écouter
     * @param {function} callback - La fonction à exécuter lorsque la touche est pressée
     */
    onKey(key, callback) {
        key = key.toLowerCase();

        // Ajouter dynamiquement la touche si elle n'existe pas
        if (!this.keys.hasOwnProperty(key)) {
            this.keys[key] = false;
        }

        // Associer le callback à la touche
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
