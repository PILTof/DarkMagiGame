export class Clock {
  private lastTime = performance.now();

  getDelta(): number {
    const now = performance.now();
    const delta = (now - this.lastTime) / 1000;
    this.lastTime = now;
    return Math.min(delta, 0.1);
  }
}
