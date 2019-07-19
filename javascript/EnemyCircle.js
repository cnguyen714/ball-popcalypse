
import Vector from "./Vector";
import Player from './Player';
import GameObject from "./GameObject";

const MAX_SPEED = 3;
const RADIUS = 6;
const COLOR = "#a64942";
const ACCEL = 1;
const KNOCKBACK = 5;
const ENEMY_KNOCKBACK_MULTIPLIER = 5;
const DAMPENING_COEFFICIENT = 0.7;
const SPREAD_FACTOR = 2.0;
const HEALTH = 100;

class EnemyCircle extends GameObject {
  constructor(game) {
    super(game);
    this.maxSpeed = MAX_SPEED;
    this.accel = ACCEL;
    this.aiCallback = () => {};

    this.health = HEALTH;

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
    } else if (obj instanceof EnemyCircle) {
      if (obj.pos.equals(this.pos)) return;
      if (this.r * this.r + obj.r * obj.r > distSqr) {
        diff.normalize();
        diff.multiply(SPREAD_FACTOR);
        obj.vel.subtract(diff);
        this.vel.add(diff);
      }
    }

  }

  update() {
    if (!this.alive) return;
    this.aiCallback();

    this.dampSpeed();
    this.addVelocityTimeDelta();
// this.validatePosition(this.cvs.width, this.cvs.height);

    // Check collision with player
    this.checkCollision(this.game.players[0]);

    // Many-many collision is very heavy - please refactor at some point or implement quadtree
    this.game.entities.forEach(entity => this.checkCollision(entity));
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