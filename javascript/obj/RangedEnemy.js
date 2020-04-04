
import Vector from "../lib/Vector";
import Player from './Player';
import GameObject from "./GameObject";
import Explosion from "./Explosion";
import EnemyCircle from "./EnemyCircle";
import EnemyFireball from "./EnemyFireball";
import Emitter from "./Emitter";
import Star from "./Star";

const RADIUS = 10;
const COLOR = "orange";
const KNOCKBACK = 10;
const ENEMY_KNOCKBACK_MULTIPLIER = 2.5;
const DAMPENING_COEFFICIENT = 0.7;
const SPREAD_FACTOR = 2.0;
const HEALTH = 600;
const HEALTH_CAP = 1200;
const DAMAGE = 1;
const SCORE = 20;
const BASE_TURN_RATE = 2;
const ACCEL = 3;
const MAX_SPEED = 5;
const FIRE_COOLDOWN = 180;
const FIRE_VEL = 6;

class RangedEnemy extends EnemyCircle {
  constructor(game) {
    super(game);
    this.aggroRange = this.cvs.height / 4 + 50;
    this.aiCallback = () => {
      this.aim = Vector.difference(game.player.pos, this.pos);
      let distance = this.aim.length();
      this.aim.normalize();
      let turnRate = BASE_TURN_RATE + Math.pow(game.difficulty, 1 / 3);
      this.aim.multiply(turnRate).add(this.vel).normalize();

      if (distance >= this.aggroRange || !game.player.alive) {
        this.vel.add(this.aim.dup().multiply(this.accel));
      } else {
        this.vel.add(this.aim.dup().multiply(-this.accel));
      }
    };

    this.health = HEALTH + game.difficulty * 3;

    this.accel = ACCEL + Math.random() * Math.pow(game.difficulty, 1 / 3) / 4;
    this.maxSpeed = MAX_SPEED;

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
    let attackRadius = this.r * 2 + this.game.difficulty / 2;

    let vel = this.pos.dup().subtract(this.game.player.pos).normalize().multiply(-FIRE_VEL - (this.game.difficulty / 50));
    let p = new EnemyFireball(this.game, {pos: this.pos, vel, r: attackRadius});
    this.game.enemyParticles.push(p);
    let explosion = new Explosion(this.game, this.pos.x, this.pos.y);
    explosion.aliveTime = 5;
    explosion.r = attackRadius;
    explosion.color = "orange"
    this.game.vanity.push(explosion);
    let star = new Star(this, {
      pos: this.pos.dup(),
      length: attackRadius + 30,
      width: 12,
      aliveTime: 35,
      expandRate: 1.05,
      thinningRate: 0.65,
      color: [255, 165, 0],
    });
    this.game.vanity.push(star);

    let shootFlash = new Emitter(this.game, {
      pos: { x: this.pos.x, y: this.pos.y },
      r: 6,
      aim: Vector.difference(game.player.pos, this.pos).normalize(),
      aliveTime: 25,
      emitCount: 8,
      ejectSpeed: 5,
      impulseVariance: 0.8,
      fanDegree: 50,
      color: "#ff6229",
      lengthForward: 20,
    });
    this.game.vanity.push(shootFlash);

  }

  validateBound(rectX, rectY) {
    let r = this.r / 2;
    if (this.pos.x + r > rectX) this.pos.x = rectX - r;
    if (this.pos.y + r > rectY) this.pos.y = rectY - r;
    if (this.pos.x - r < 0) this.pos.x = r;
    if (this.pos.y - r < 0) this.pos.y = r;
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