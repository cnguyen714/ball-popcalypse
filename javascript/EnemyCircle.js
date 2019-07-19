
import Vector from "./Vector";
import Player from './Player';

const MAX_SPEED = 3;
const RADIUS = 6;
const COLOR = 'red';
const ACCEL = 1;

class EnemyCircle {
  constructor(game) {
    this.game = game;
    this.cvs = game.cvs;
    this.ctx = game.ctx;
    this.pos = new Vector(0, 0);
    this.maxSpeed = MAX_SPEED;
    this.vel = new Vector(0, 0);
    this.aim = new Vector(0, 0);
    this.accel = ACCEL;
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

  checkCollision(obj) {
    let diff = Vector.difference(this.pos, obj.pos);
    let distSqr = diff.dot(diff);
    if(obj instanceof Player) {
      if (this.r * this.r + obj.r * obj.r > distSqr) {
        
      } 
    }
    return false;
  }

  update() {
    this.aiCallback();

    this.clampSpeed();
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    // this.validatePosition(this.cvs.width, this.cvs.height);

    this.checkCollision(this.game.players[0]);
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.color;
    this.ctx.strokeStyle = 'black';
    this.ctx.fill();
    this.ctx.stroke();
  }
}

export default EnemyCircle;