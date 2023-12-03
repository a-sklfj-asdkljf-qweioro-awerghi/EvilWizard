import {Vector} from '../utils.js';

export class Camera {
  constructor(traceTarget, canvas) {
    this.target = traceTarget;  // {x: number, y: number}
    this.canvas = canvas;
    this.pos = new Vector(0, 0);
    // this.center = new Vector(0, 0);
    this.center = this.target.pos;
  }
  update() {
    // this.center.x = (this.target.x + this.center.x * 19) / 20;
    // this.center.y = (this.target.y + this.center.y * 19) / 20;
    this.center =
        (this.target.pos.add(this.center.multiply(19))).multiply(1 / 20);
    this.pos = {
      x: this.center.x - this.canvas.width / 2,
      y: this.center.y - this.canvas.height / 2
    };
  }
}