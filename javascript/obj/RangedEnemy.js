
import Vector from "../lib/Vector";
import Player from './Player';
import GameObject from "./GameObject";
import Explosion from "./Explosion";
import EnemyCircle from "./EnemyCircle";
import EnemyParticle from "./EnemyParticle";

const RADIUS = 8;
const COLOR = "orange";
const KNOCKBACK = 10;
const ENEMY_KNOCKBACK_MULTIPLIER = 2.5;
const DAMPENING_COEFFICIENT = 0.7;
const SPREAD_FACTOR = 2.0;
const HEALTH = 700;
const HEALTH_CAP = 1200;
const DAMAGE = 1;
const SCORE = 20;
const BASE_TURN_RATE = 0.25;
const ACCEL = 0.2;
const MAX_SPEED = 0.5;
const FIRE_COOLDOWN = 180;
const FIRE_VEL = 6;

class RangedEnemy extends EnemyCircle {
  constructor(game) {
    super(game);
    this.aiCallback = () => {
      this.aim = Vector.difference(game.player.pos, this.pos);
      let distance = this.aim.length();
      this.aim.normalize();
      let turnRate = BASE_TURN_RATE + Math.pow(game.difficulty, 1 / 2);
      this.aim.multiply(turnRate).add(this.vel).normalize();

      if (distance >= 500 || !game.player.alive) {
        this.vel.add(this.aim.multiply(this.accel));
      } else {
        this.vel.add(this.aim.multiply(-this.accel));
      }
    };

    this.health = HEALTH + game.difficulty * 3;

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
    if (this.pos.x > this.cvs.width + this.r ||
        this.pos.x < 0 - this.r ||
        this.pos.y > this.cvs.height + this.r ||
        this.pos.y < 0 - this.r ) {
      return;
    };
    this.attackCooldown = FIRE_COOLDOWN;

    let vel = this.pos.dup().subtract(this.game.player.pos).normalize().multiply(-FIRE_VEL);
    let p = new EnemyParticle(this.game, this.pos.x, this.pos.y, vel);
    this.game.enemyParticles.push(p);
    let explosion = new Explosion(this.game, this.pos.x, this.pos.y);
    explosion.aliveTime = 7;
    explosion.r = this.r + 20;

    this.game.vanity.push(explosion);
  }

  update() {
    if (!this.alive) return;
    this.aiCallback();
    this.dampSpeed();
    this.addVelocityTimeDelta();
    this.validateBound(this.cvs.width, this.cvs.height);    

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