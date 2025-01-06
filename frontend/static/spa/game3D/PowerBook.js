export class PaddlePower {
  constructor() {
    this.power1 = false;
    this.power2 = false;
    this.power3 = false;
  }

  hasPower(powerName) {
    return this[powerName];
  }

  usePower(powerName) {
    if (this.hasPower(powerName)) {
      this[powerName] = false;
    } else {
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
    }
  }

  deactivateAllPowers() {
    this.power1 = false;
    this.power2 = false;
    this.power3 = false;
  }
}
