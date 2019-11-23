
import Vector from "../lib/Vector";
import Player from './Player';
import GameObject from "./GameObject";
import Explosion from "./Explosion";
import EnemyCircle from "./EnemyCircle";
import EnemyParticle from "./EnemyParticle";

const RADIUS = 8;
const COLOR = "#a64942";
const KNOCKBACK = 10;
const ENEMY_KNOCKBACK_MULTIPLIER = 2.5;
const DAMPENING_COEFFICIENT = 0.7;
const SPREAD_FACTOR = 2.0;
const HEALTH = 100;
const HEALTH_CAP = 200;
const DAMAGE = 1;
const SCORE = 1;
const BASE_TURN_RATE = 0.25;
const ACCEL = 0.2;
const MAX_SPEED = 0.5;
const FIRE_COOLDOWN = 180;

class RangedEnemy extends EnemyCircle {
  constructor(game) {
    super(game);
    this.aiCallback = () => {
      this.aim = Vector.difference(game.player.pos, this.pos).normalize();
      let turnRate = BASE_TURN_RATE + Math.pow(game.difficulty, 1 / 2);
      this.aim.multiply(turnRate).add(this.vel).normalize();

      this.vel.add(this.aim.multiply(this.accel));
    };

    this.health = HEALTH + game.difficulty * 2;

    this.accel = ACCEL + Math.random() * Math.pow(game.difficulty, 1 / 2) / 2;
    this.maxSpeed = MAX_SPEED + Math.random() * Math.pow(game.difficulty, 1 / 2) / 2;

    if (this.health > HEALTH_CAP) this.health = HEALTH_CAP;

    this.attackCooldown = FIRE_COOLDOWN;
    this.r = RADIUS;
    this.color = COLOR;
    this.damage = DAMAGE;
    this.score = SCORE;

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  fire() {
    this.attackCooldown = FIRE_COOLDOWN;

    let projectile = new EnemyParticle(this.game);
    

  }

  update() {
    if (!this.alive) return;
    this.aiCallback();
    this.dampSpeed();
    this.addVelocityTimeDelta();
    this.validatePosition(this.cvs.width, this.cvs.height);    

    this.attackCooldown > 0 ? this.attackCooldown-- : this.fire();

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

export default RangedEnemy;