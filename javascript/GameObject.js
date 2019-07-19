
import Vector from "./Vector";
import { fireBulletAtCursor } from './particle_factory';

const CLAMP_SPAWN = 100; // Offset from edges
const ACCEL = 3;
const MAX_SPEED = 6;
const DASH_MULTIPLIER = 2;
const MAX_DASH_SPEED = 10;
const DECEL = 0.9;
const MIN_SPEED = 0.1;
const PLAYER_RADIUS = 10;
const COLOR = 'black';
const DAMPENING_COEFFICIENT = 0.7;
const CLAMP_SPEED = 200;

const SHOOT_COOLDOWN = 0;
const MAX_HEALTH = 100;

const STATE_WALKING = "STATE_WALKING";
const STATE_DASHING = "STATE_DASHING";

const KEY = {
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  UP: 38,
  LEFT: 37,
  DOWN: 40,
  RIGHT: 39,
  SHIFT: 16,
  MOUSE: 10000,
};

class GameObject {
  constructor(game) {
    this.game = game;
    this.cvs = game.cvs;
    this.ctx = game.ctx;
    this.pos = new Vector();
    this.vel = new Vector();
    this.aim = new Vector();

    this.maxHealth = MAX_HEALTH;
    this.health = MAX_HEALTH;

    this.r
    this.color = COLOR;
    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  validatePosition(rectX, rectY) {
    // if (this.pos.x + this.r > rectX) this.pos.x = rectX - this.r;
    // if (this.pos.x - this.r < 0) this.pos.x = this.r;
    // if (this.pos.y + this.r > rectY) this.pos.y = rectY - this.r;
    // if (this.pos.y - this.r < 0) this.pos.y = this.r;
  }

  scaleByTimeDelta(velocity) {
    return velocity.dup().multiply(this.game.timeDelta / this.game.normalTimeDelta);
  }

  update() {

  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    // this.ctx.beginPath();
    // this.ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
    // this.ctx.fillStyle = this.color;
    // this.ctx.strokeStyle = this.color;
    // this.ctx.fill();
    // this.ctx.stroke();

  }
}

export default GameObject;