import Vector from "../lib/Vector";
import GameObject from "./GameObject";
import Sparkle from "./Sparkle";

const RADIUS = 50;

class Emitter extends GameObject {
  constructor(
    game,
    startX = 0,
    startY = 0,
    cb = () => { },
    vel = new Vector(0, 0),
  ) {
    super(game);
    this.pos = new Vector(startX, startY);
    this.vel = vel;
    this.r = RADIUS;
    this.cb = cb;
    this.aliveTime = 600;
    this.active = true;
    this.emittee = Sparkle;

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  validatePosition(rectX, rectY) {
    if (this.pos.x > rectX + this.r
      || this.pos.x < 0 - this.r
      || this.pos.y > rectY + this.r
      || this.pos.y < 0 - this.r) {
      this.alive = false;
    };
  }

  checkCollision(obj) {
    return;
  }

  update() {
    if (!this.alive) return; //Don't check collision if object is not alive

    this.cb();
    if (!this.active) return;
    this.addVelocityTimeDelta();
    this.validatePosition(this.cvs.width, this.cvs.height);
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    return;
  }
}

export default Emitter;