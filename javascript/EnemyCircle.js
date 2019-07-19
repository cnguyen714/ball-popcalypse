
import Vector from "./Vector";
import Player from './Player';
import GameObject from "./GameObject";

const MAX_SPEED = 3;
const RADIUS = 6;
const COLOR = 'red';
const ACCEL = 1;
const KNOCKBACK = 5;
const ENEMY_KNOCKBACK_MULTIPLIER = 5;
const DAMPENING_COEFFICIENT = 0.7;
const HEALTH = 100;

class EnemyCircle extends GameObject {
  constructor(game) {
    this.game = game;
    this.cvs = game.cvs;
    this.ctx = game.ctx;
    this.maxSpeed = MAX_SPEED;
    this.pos = new Vector(0, 0);
    this.vel = new Vector(0, 0);
    this.aim = new Vector(0, 0);
    this.accel = ACCEL;
    this.alive = true;
    this.aiCallback = () => {};

    this.health = 100;

    this.r = RADIUS;
    this.color = COLOR;

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  validatePosition(rectX, rectY) {

  }

  dampSpeed() {
    let vel = this.vel.length();
    if (vel > MAX_SPEED) {
      this.vel.multiply(DAMPENING_COEFFICIENT);
    }
  }

  checkCollision(obj) {
    let diff = Vector.difference(this.pos, obj.pos);
    let distSqr = diff.dot(diff);
    if(obj instanceof Player) {
      if (this.r * this.r + obj.r * obj.r > distSqr) {
        diff.normalize();
        diff.multiply(KNOCKBACK);
        obj.vel.subtract(diff);
        this.vel.add(diff.multiply(ENEMY_KNOCKBACK_MULTIPLIER));
        obj.health--;
      } 
    }
  }

  update() {
    this.aiCallback();

    this.dampSpeed();
    this.addVelocityTimeDelta();
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