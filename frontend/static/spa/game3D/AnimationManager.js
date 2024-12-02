export class AnimationManager {
  constructor(scene) {
    this.scene = scene;
    this.activeAnimations = [];
  }

  addAnimation(object, animationCallback) {
    this.activeAnimations.push({ object, animationCallback });
  }

  update() {
    const now = Date.now();
    this.activeAnimations = this.activeAnimations.filter(({ object, animationCallback }) => {
      return animationCallback(object, now);
    });
  }

  removeAnimation(object) {
    this.activeAnimations = this.activeAnimations.filter(anim => anim.object !== object);
  }
}
