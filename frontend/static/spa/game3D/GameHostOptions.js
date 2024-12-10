export class GameHostOptions {
	constructor(options) {
		this.isPowerActivated = options.isPowerActivated || false;
		this.isAiActivated = options.isAiActivated || false;
	}

	logConfig() {
		console.log("Configuration du jeu :", this);
	}

	getAIStatus() {
		return this.isAiActivated;
	}

	applyConfig(powerManager) {
		console.log("Application des options...");
		if (this.isPowerActivated) {
			powerManager.activatePowers();
		} else {
			powerManager.deactivatePowers();
		}
	}
}