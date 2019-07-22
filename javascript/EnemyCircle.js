
import Vector from "./Vector";
import Player from './Player';
import GameObject from "./GameObject";
import Explosion from "./Explosion";

const MAX_SPEED = 3;
const RADIUS = 6;
const COLOR = "#a64942";
const ACCEL = 1;
const KNOCKBACK = 10;
const ENEMY_KNOCKBACK_MULTIPLIER = 2.5;
const DAMPENING_COEFFICIENT = 0.7;
const SPREAD_FACTOR = 2.0;
const HEALTH = 100;
const DAMAGE = 1;
const SCORE = 1;

class EnemyCircle extends GameObject {
  constructor(game) {
    super(game);
    this.maxSpeed = MAX_SPEED;
    this.accel = ACCEL;
    this.aiCallback = () => {};

    this.health = HEALTH + game.difficulty * 2;

    this.r = RADIUS;
    this.color = COLOR;
    this.damage = DAMAGE;
    this.score = SCORE;

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
    if (!obj.alive) return;
    let diff = Vector.difference(this.pos, obj.pos);
    let distSqr = diff.dot(diff);
    if(obj instanceof Player) {
      if (obj.moveState === "STATE_DASHING" || obj.invul > 0) return;
      if (this.r * this.r + obj.r * obj.r > distSqr) {
        let sound = new Audio("../assets/impact.wav");
        sound.play();
        let explosion = new Explosion(game, obj.pos.x + diff.x / 2, obj.pos.y + diff.y / 2, this.r * 2);
        explosion.color = 'red';
        explosion.aliveTime = 5;
        obj.game.particles.push(explosion);

        diff.normalize();
        diff.multiply(KNOCKBACK);
        obj.vel.subtract(diff.dup().multiply(this.r / RADIUS));
        this.vel.add(diff.multiply(ENEMY_KNOCKBACK_MULTIPLIER));
        obj.health -= this.damage;
      } 
    } else if (obj instanceof EnemyCircle) {
      if (obj.pos.equals(this.pos)) return;
      if (this.r * this.r + obj.r * obj.r > distSqr) {
        diff.normalize();
        diff.multiply(SPREAD_FACTOR);
        obj.vel.subtract(diff.dup().multiply(this.r / RADIUS));
        this.vel.add(diff.dup().multiply(RADIUS / this.r));
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
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.color;
    this.ctx.strokeStyle = 'black';
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.restore();

  }
}

export default EnemyCircle;