// PaddlePower.js
export class PaddlePower {
  constructor() {
    this.power1 = false; // Exemple : pouvoir 1 (ex: agrandir le paddle)
    this.power2 = false; // Exemple : pouvoir 2 (ex: accélérer la balle)
    this.power3 = false; // Exemple : pouvoir 3 (ex: invincibilité)
  }

  hasPower(powerName) {
    return this[powerName];
  }

  usePower(powerName) {
    if (this.hasPower(powerName)) {
      // console.log(`Utilisation du pouvoir ${powerName}`);
      this[powerName] = false;
    } else {
      // console.warn(`Le pouvoir ${powerName} n'est pas activé.`);
    }
  }

  getPowers() {
    if (this.power1) {
      return "power1";
    }
    else if (this.power2) {
      return "power2";
    }
    else if (this.power3) {
      return "power3";
    }
    else {
      return "noPower";
    }
  }

  hasNoPower() {
    return !this.power1 && !this.power2 && !this.power3;
  }

  setPower(powerName) {
    this.deactivateAllPowers();

    if (this.hasOwnProperty(powerName)) {
      this[powerName] = true;
    } else {
      console.warn(`Le pouvoir ${powerName} n'existe pas.`);
    }
  }

  deactivateAllPowers() {
    this.power1 = false;
    this.power2 = false;
    this.power3 = false;
  }
}
