import * as THREE from "three";
import {Grenade} from "./PowerGrenadeFlash.js";
import {InverseShot} from "./PowerInverseShot.js";
import {ReductShot} from "./PowerReductShot.js";

export class TemporaryCube {
	constructor(
		scene,
		boundaries,
		paddlePower1,
		paddlePower2,
		powerManager,
		activePowers = [],
		speed = 3,
		direction = "right"
	) {
		this.scene = scene;
		this.boundaries = boundaries;
		this.speed = speed;
		this.direction = direction;
		this.paddlePower1 = paddlePower1;
		this.paddlePower2 = paddlePower2;
		this.powerManager = powerManager;
		this.power = null;

		
		this.waveAmplitude = 10; 
		this.waveFrequency = 0.07; 
		this.wavePhase = Math.random() * Math.PI * 2; 

		this.time = 0; 
		this.groundY = 20; 
		this.oldPosition = {x: 0, z: 0};
		this.isNearTop = false;
		this.isNearBottom = false;
		this.initialPosition = null;
		this.activePowers = activePowers;
		this.setActivePowers()
	}

	setActivePowers() {
		this.flashIsActive = this.activePowers.includes("flash");
		this.tornadoIsActive = this.activePowers.includes("tornado");
		this.inverseIsActive = this.activePowers.includes("inverse");
	}

	howMuchPowerIsActivated() {
		let numberOfPowers = 0;
		if (this.flashIsActive) {
			numberOfPowers++;
		}
		if (this.tornadoIsActive) {
			numberOfPowers++;
		}
		if (this.inverseIsActive) {
			numberOfPowers++;
		}
		return numberOfPowers;
	}

	createCube(modelCache) {
		const {maxX, maxZ} = this.boundaries;

		const positionIndex = Math.floor(Math.random() * 2);
		const x = 0;
		const z = positionIndex === 0 ? maxZ : -maxZ;

		this.speed = Math.random() > 0.5 ? 4 : -4;

		let numberOfPowers = this.howMuchPowerIsActivated()

		const powerIndex = Math.floor(Math.random() * numberOfPowers);
		if (numberOfPowers === 1)
		{
			if (this.flashIsActive) {
				this.power = "power1";
			}
			else if (this.tornadoIsActive) {
				this.power = "power3";
			}
			else if (this.inverseIsActive) {
				this.power = "power2";
			}
		}
		else if (numberOfPowers === 2)
		{
			switch (powerIndex) {
				case 0:
					this.power = this.flashIsActive ? "power1" : "power2";
					break;
				case 1:
					this.power = this.tornadoIsActive ? "power3" : "power2";
					break;
				default:
					break;
			}
		}
		else if (numberOfPowers === 3)
		{
			switch (powerIndex) {
				case 0:
					this.power = "power1";
					break;
				case 1:
					this.power = "power2";
					break;
				case 2:
					this.power = "power3";
					break;
				default:
		}
		}

		let modelPath = null;
		switch (this.power) {
			case "power1":
				modelPath = "/static/spa/game3D/models/Dynamite.glb";
				break;
			case "power2":
				modelPath = "/static/spa/game3D/models/Beer.glb";
				break;
			case "power3":
				modelPath = "/static/spa/game3D/models/Tornado.glb";
				break;
			default:
				break;
		}

		let scale = null;
		switch (this.power) {
			case "power1":
				scale = 17;
				break;
			case "power2":
				scale = 17;
				break;
			case "power3":
				scale = 0.6;
				break;
			default:
				break;
		}

		modelCache
			.loadModel(modelPath)
			.then((model) => {
				this.cube = model;
				this.cube = this.adjustPivotToCenterY(this.cube);
				this.cube.scale.set(scale, scale, scale);
				this.cube.position.set(x, 0, z);
				this.initialPosition = this.cube.position.clone();
				this.scene.add(this.cube);
			})
			.catch((error) => {
			});
	}

	adjustPivotToCenterY(object) {
		const boundingBox = new THREE.Box3().setFromObject(object);
		const height = boundingBox.max.y - boundingBox.min.y;
		const centerY = boundingBox.min.y + height / 2;
		const pivot = new THREE.Group();

		pivot.add(object);

		object.position.y -= centerY;

		return pivot;
	}

	checkCollisionWithPaddle(paddle) {
		if (this.cube.position.z === -360 || this.cube.position.z === 360) {
			if (
				Math.abs(this.cube.position.x - paddle.position.x) < 30 &&
				Math.abs(this.cube.position.z - paddle.position.z) < 75
			) {
				return true;
			}
		}
		return false;
	}

	isApproaching(fixedPoint1, fixedPoint2) {
		if (!this.cube) return false;

		const currentDistance1 = Math.sqrt(
			Math.pow(this.cube.position.x - fixedPoint1.x, 2) +
			Math.pow(this.cube.position.z - fixedPoint1.z, 2)
		);
		const previousDistance1 = Math.sqrt(
			Math.pow(this.oldPosition.x - fixedPoint1.x, 2) +
			Math.pow(this.oldPosition.z - fixedPoint1.z, 2)
		);

		const currentDistance2 = Math.sqrt(
			Math.pow(this.cube.position.x - fixedPoint2.x, 2) +
			Math.pow(this.cube.position.z - fixedPoint2.z, 2)
		);
		const previousDistance2 = Math.sqrt(
			Math.pow(this.oldPosition.x - fixedPoint2.x, 2) +
			Math.pow(this.oldPosition.z - fixedPoint2.z, 2)
		);

		this.oldPosition.x = this.cube.position.x;
		this.oldPosition.z = this.cube.position.z;

		if (currentDistance1 < 300) {
			if (currentDistance1 < previousDistance1) {
				this.isNearTop = true;
			} else {
				this.isNearTop = false;
			}
		}

		if (currentDistance2 < 300) {
			if (currentDistance2 < previousDistance2) {
				this.isNearBottom = true;
			} else {
				this.isNearBottom = false;
			}
		}
	}

	getIsNear() {
		return {isNearTop: this.isNearTop, isNearBottom: this.isNearBottom};
	}

	update(paddle1, paddle2) {
		if (!this.cube) {
			return;
		}
		const {maxX, maxZ} = this.boundaries;

		const Top = {x: 760, z: -360};
		const Bottom = {x: 760, z: 360};
		this.isApproaching(Top, Bottom);

		this.time += this.waveFrequency;
		if (this.cube) {
			this.cube.position.y =
				30 + this.waveAmplitude * Math.sin(this.time + this.wavePhase);

			if (this.cube.position.y < this.groundY) {
				this.cube.position.y = this.groundY;
			}

			if (this.power === "power3") {
				this.cube.rotation.y += 0.2;
				this.cube.rotation.x += 0;
				this.cube.rotation.z += 0;
			} else {
				this.cube.rotation.y += 0.01;
				this.cube.rotation.x += 0.01;
				this.cube.rotation.z += 0.01;
			}
		}

		if (this.initialPosition.z === -maxZ) {
			if (this.speed < 0) {
				switch (this.direction) {
					case "right":
						this.cube.position.x += this.speed;
						if (this.cube.position.x <= -maxX) {
							this.direction = "up";
						}
						break;

					case "left":
						this.cube.position.x -= this.speed;
						if (this.cube.position.x >= maxX) {
							this.direction = "down";
						}
						break;

					case "up":
						this.cube.position.z -= this.speed;
						if (this.cube.position.z >= maxZ) {
							this.direction = "left";
						}
						break;
						u;

					case "down":
						this.cube.position.z += this.speed;
						if (this.cube.position.z <= -maxZ) {
							this.direction = "right";
						}
						break;

					default:
						break;
				}
			} else {
				switch (this.direction) {
					case "right":
						this.cube.position.x += this.speed;
						if (this.cube.position.x >= maxX) {
							this.direction = "down";
						}
						break;

					case "left":
						this.cube.position.x -= this.speed;
						if (this.cube.position.x <= -maxX) {
							this.direction = "up";
						}
						break;

					case "up":
						this.cube.position.z -= this.speed;
						if (this.cube.position.z <= -maxZ) {
							this.direction = "right";
						}
						break;

					case "down":
						this.cube.position.z += this.speed;
						if (this.cube.position.z >= maxZ) {
							this.direction = "left";
						}
						break;

					default:
						break;
				}
			}
		} else {
			if (this.speed < 0) {
				switch (this.direction) {
					case "right":
						this.cube.position.x += this.speed;
						if (this.cube.position.x <= -maxX) {
							this.direction = "down";
						}
						break;

					case "left":
						this.cube.position.x -= this.speed;
						if (this.cube.position.x >= maxX) {
							this.direction = "up";
						}
						break;

					case "up":
						this.cube.position.z -= this.speed;
						if (this.cube.position.z >= maxZ) {
							this.direction = "right";
						}
						break;

					case "down":
						this.cube.position.z += this.speed;
						if (this.cube.position.z <= -maxZ) {
							this.direction = "left";
						}
						break;

					default:
						break;
				}
			} else {
				switch (this.direction) {
					case "right":
						this.cube.position.x += this.speed;
						if (this.cube.position.x >= maxX) {
							this.direction = "up";
						}
						break;

					case "left":
						this.cube.position.x -= this.speed;
						if (this.cube.position.x <= -maxX) {
							this.direction = "down";
						}
						break;

					case "up":
						this.cube.position.z -= this.speed;
						if (this.cube.position.z <= -maxZ) {
							this.direction = "left";
						}
						break;

					case "down":
						this.cube.position.z += this.speed;
						if (this.cube.position.z >= maxZ) {
							this.direction = "right";
						}
						break;

					default:
						break;
				}
			}
		}

		if (this.cube.position.z === -360 || this.cube.position.z === 360) {
			if (
				this.checkCollisionWithPaddle(paddle1) &&
				this.paddlePower1.hasNoPower()
			) {
				this.scene.remove(this.cube);
				this.paddlePower1.setPower(this.power);
				this.powerManager.createPower(1, this.power);
				const index = this.powerManager.cubes.indexOf(this);
				if (index !== -1) {
					this.powerManager.cubes.splice(index, 1);
				}
				return;
			}
			if (
				this.checkCollisionWithPaddle(paddle2) &&
				this.paddlePower2.hasNoPower()
			) {
				this.scene.remove(this.cube);
				this.paddlePower2.setPower(this.power);
				this.powerManager.createPower(2, this.power);
				const index = this.powerManager.cubes.indexOf(this);
				if (index !== -1) {
					this.powerManager.cubes.splice(index, 1);
				}
				return;
			}
		}
	}

	cleanCube() {
		if (this.cube) {
			this.scene.remove(this.cube);
			this.cube = null;
		}
	}
}

export class PowerManager {
	constructor(
		scene,
		boundaries,
		paddlePower1,
		paddlePower2,
		modelCache,
		flashEffect,
		animationManager,
		modelLoader,
	) {
		this.scene = scene;
		this.boundaries = boundaries;
		this.cubes = [];
		this.player1grenades = [];
		this.player2grenades = [];
		this.player1InverseShots = [];
		this.player2InverseShots = [];
		this.player1ReductShots = [];
		this.player2ReductShots = [];
		this.getStarted = false;
		this.paddlePower1 = paddlePower1;
		this.paddlePower2 = paddlePower2;
		this.modelCache = modelCache;
		this.flashEffect = flashEffect;
		this.animationManager = animationManager;
		this.modelLoader = modelLoader;
		this.isPowerActivated = null;
		this.activePowers = null;
	}

	setActivePowers(activePowers) {
		this.activePowers = activePowers;
	}

	createGrenadeFlash(player) {
		const grenade = new Grenade(
			this.scene,
			this.flashEffect,
			player,
			this.modelCache,
			"/static/spa/game3D/models/Dynamite.glb"
		);
		if (player === 1) {
			this.player1grenades.push(grenade);
		} else {
			this.player2grenades.push(grenade);
		}
	}

	createInverseShot(player) {
		const inverseShot = new InverseShot(
			this.scene,
			player,
			this.modelCache,
			"/static/spa/game3D/models/Beer.glb",
			this.modelLoader
		);
		if (player === 1) {
			this.player1InverseShots.push(inverseShot);
		} else {
			this.player2InverseShots.push(inverseShot);
		}
	}

	createReductShot(player) {
		const reductShot = new ReductShot(
			this.scene,
			player,
			this.modelCache,
			"/static/spa/game3D/models/Tornado.glb",
			this.modelLoader
		);
		if (player === 1) {
			this.player1ReductShots.push(reductShot);
		} else {
			this.player2ReductShots.push(reductShot);
		}
	}

	createPower(player, power) {
		switch (power) {
			case "power1":
				this.createGrenadeFlash(player);
				break;
			case "power2":
				this.createInverseShot(player);
				break;
			case "power3":
				this.createReductShot(player);
				break;
			default:
				break;
		}
	}

	launchGrenade(player) {
		const grenades = player === 1 ? this.player1grenades : this.player2grenades;
		const grenade = grenades[0];
		if (grenade.getLocked()) {
			return;
		}
		grenades.splice(0, 1);
		const paddle = player === 1 ? this.paddle1 : this.paddle2;
		const paddlePower = player === 1 ? this.paddlePower1 : this.paddlePower2;
		if (grenade && grenade.triggerAnimation) {
			grenade.triggerAnimation(paddle, this.animationManager);
		}
		paddlePower.usePower("power1");
	}

	launchInverseShot(player, controller) {
		const inverseShots =
			player === 1 ? this.player1InverseShots : this.player2InverseShots;
		const inverseShot = inverseShots[0];
		if (inverseShot.getLocked()) {
			return;
		}
		inverseShots.splice(0, 1);
		const paddle = player === 1 ? this.paddle1 : this.paddle2;
		const paddlePower = player === 1 ? this.paddlePower1 : this.paddlePower2;
		const target = player === 1 ? this.paddle2 : this.paddle1;
		if (inverseShot && inverseShot.triggerAnimation) {
			inverseShot.triggerAnimation(
				paddle,
				this.animationManager,
				target,
				controller
			);
		}
		paddlePower.usePower("power2");
	}

	launchReductShot(player, paddleHeightTarget) {
		const reductShots =
			player === 1 ? this.player1ReductShots : this.player2ReductShots;
		const reductShot = reductShots[0];
		if (reductShot.getLocked()) {
			return;
		}
		reductShots.splice(0, 1);
		const paddle = player === 1 ? this.paddle1 : this.paddle2;
		const paddlePower = player === 1 ? this.paddlePower1 : this.paddlePower2;
		const target = player === 1 ? this.paddle2 : this.paddle1;
		if (reductShot && reductShot.triggerAnimation) {
			reductShot.triggerAnimation(
				paddle,
				this.animationManager,
				target,
				paddleHeightTarget
			);
		}
		paddlePower.usePower("power3");
	}

	reset() {
		this.cubes.forEach((cube) => {
			this.scene.remove(cube.cube);
		});
		this.cubes = [];
		this.player1grenades.forEach((grenade) => {
			grenade.cleanCube();
		});
		this.player1grenades = [];
		this.player2grenades.forEach((grenade) => {
			grenade.cleanCube();
		});
		this.player2grenades = [];
		this.player1InverseShots.forEach((inverseShot) => {
			inverseShot.cleanCube();
		});
		this.player1InverseShots = [];
		this.player2InverseShots.forEach((inverseShot) => {
			inverseShot.cleanCube();
		});
	}

	startGame() {
		this.getStarted = true;
		setInterval(() => {
			this.createCubes();
		}, Math.random() * 200 + 100);
	}

	stopGame() {
		this.getStarted = false;
		this.reset();
	}

	deactivatePowers() {
		this.isPowerActivated = false;
	}

	activatePowers() {
		this.isPowerActivated = true;
	}

	createCubes() {
		if (!this.getStarted) return;

		if (this.isPowerActivated) {
			this.maxPower = 2;
		}

		if (this.cubes.length >= this.maxPower) return;

		if (this.cubes.length < this.maxPower) {
			const cube = new TemporaryCube(
				this.scene,
				this.boundaries,
				this.paddlePower1,
				this.paddlePower2,
				this,
				this.activePowers,
			);
			cube.createCube(this.modelCache);
			this.cubes.push(cube);
		}
	}

	getCubeList() {
		return this.cubes;
	}

	update(paddle1, paddle2) {
		if (!this.getStarted) return;

		this.paddle1 = paddle1;
		this.paddle2 = paddle2;

		this.player1ReductShots.forEach((reductShot) => {
			reductShot.update(paddle1, paddle2);
		});

		this.player2ReductShots.forEach((reductShot) => {
			reductShot.update(paddle1, paddle2);
		});

		this.player1InverseShots.forEach((inverseShot) => {
			inverseShot.update(paddle1, paddle2);
		});

		this.player2InverseShots.forEach((inverseShot) => {
			inverseShot.update(paddle1, paddle2);
		});

		this.player1grenades.forEach((grenade) => {
			grenade.update(paddle1, paddle2);
		});

		this.player2grenades.forEach((grenade) => {
			grenade.update(paddle1, paddle2);
		});

		this.cubes.forEach((cube) => {
			cube.update(paddle1, paddle2);
		});
	}
}
