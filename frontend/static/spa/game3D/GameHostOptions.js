export class GameHostOptions {
	constructor(options) {
		this.isPowerActivated = options.isPowerActivated || false;
		this.isAiActivated = options.isAiActivated || false;
	}

	logConfig() {
	}

	getAIStatus() {
		return this.isAiActivated;
	}

	applyConfig(powerManager) {
		if (this.isPowerActivated) {
			powerManager.activatePowers();
		} else {
			powerManager.deactivatePowers();
		}
	}
}