
import Vector from "./Vector";
import { fireBulletAtCursor } from './particle_factory';

const MAX_SPEED = 6;
const RADIUS = 6;
const COLOR = 'orange';

class EnemyCircle {
  constructor(game) {
    this.game = game;
    this.cvs = game.cvs;
    this.ctx = game.ctx;
    this.pos = new Vector(0, 0);
    this.maxSpeed = MAX_SPEED;
    this.vel = new Vector(0, 0);
    this.aim = new Vector(0, 0);
    this.alive = true;
    this.aiCallback = () => {};

    this.r = RADIUS;
    this.color = COLOR;

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  validatePosition(rectX, rectY) {

  }

  clampSpeed() {
    let vel = this.vel.length();
    if (vel > MAX_SPEED) {
      this.vel = this.vel.divide(vel).multiply(MAX_SPEED);
    }
  }

  update() {
    this.aiCallback();

    this.clampSpeed();
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.validatePosition(this.cvs.width, this.cvs.height);
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.color;
    this.ctx.strokeStyle = this.color;
    this.ctx.fill();
    this.ctx.stroke();
  }
}

export default EnemyCircle;