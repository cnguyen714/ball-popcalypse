
import Vector from "../lib/Vector";
import Player from './Player';
import GameObject from "./GameObject";
import Explosion from "./Explosion";
import EnemyCircle from "./EnemyCircle";
import Particle from "./Particle";
import EnemyParticle from "./EnemyParticle";
import Emitter from "./Emitter";
import Star from "./Star";
// import Beam from "./Beam";

const RADIUS = 8;
const COLOR = "darkgreen";
const KNOCKBACK = 10;
const ENEMY_KNOCKBACK_MULTIPLIER = 2.5;
const DAMPENING_COEFFICIENT = 0.7;
const SPREAD_FACTOR = 2.0;
const HEALTH = 1500;
const HEALTH_CAP = 2500;
const DAMAGE = 1;
const SCORE = 30;
const BASE_TURN_RATE = 2;
const ACCEL = 0.6;
const MAX_SPEED = 4;
const ATTACK_COOLDOWN = 900;
const ATTACK_DAMAGE = 20;
const DASH_COOLDOWN = 160;
const ATTACK_RANGE = 500;
const DASH_DURATION = 15;
const PREP_DASH_TIME = 40;
const POST_DASH_PAUSE = 60;

class DashingEnemy extends EnemyCircle {
  constructor(
    game, 
    {
      coords = {x: 100, y: 100},
      color = COLOR,
    }
  ) {
    super(game);
    this.pos.x = coords.x;
    this.pos.y = coords.y;
    this.health = HEALTH + game.difficulty * 3;
    if (this.health > HEALTH_CAP) this.health = HEALTH_CAP;
    this.accel = ACCEL + Math.random() * Math.pow(game.difficulty, 1 / 3) / 4;
    this.maxSpeed = MAX_SPEED;

    this.attackCooldown = ATTACK_COOLDOWN;
    this.dashCooldown = 0;
    this.attackDamage = ATTACK_DAMAGE;
    this.r = RADIUS;
    this.color = color;
    this.damage = DAMAGE;
    this.score = SCORE;
    this.dashDuration = 0;
    this.storedVel = this.aim;

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  fire() {
    if(this.attackCooldown > 0) return;
    if (this.pos.x > this.cvs.width + this.r ||
      this.pos.x < 0 - this.r ||
      this.pos.y > this.cvs.height + this.r ||
      this.pos.y < 0 - this.r) {
      return;
    };
    if (Math.abs(Vector.difference(this.pos, this.game.player.pos)) < 100) {
      this.attackCooldown = ATTACK_COOLDOWN;

    }
  }

  dash() {
    if (this.dashCooldown > 0) return;
    if (this.pos.x > this.cvs.width + this.r ||
      this.pos.x < 0 - this.r ||
      this.pos.y > this.cvs.height + this.r ||
      this.pos.y < 0 - this.r) {
      return;
    };
    
    if (Math.abs(Vector.difference(this.pos, this.game.player.pos).length()) <= ATTACK_RANGE) {
      this.storedVel = Vector.difference(this.game.player.pos, this.pos).normalize().multiply(25);
      this.dashDuration = POST_DASH_PAUSE + DASH_DURATION + PREP_DASH_TIME;
      this.dashCooldown = DASH_COOLDOWN;

      let star = new Star(this, {
        coords: this.pos.dup(),
        length: 40,
        width: 15,
        aliveTime: 35,
        expandRate: 1.05,
        thinningRate: 0.65,
        color: [255, 0, 0],
      });
      this.game.vanity.push(star);
      let explosion = new Explosion(game, this.pos.x, this.pos.y, this.r + 20);
      explosion.color = "red";
      explosion.aliveTime = 3;
      this.game.vanity.push(explosion);

    }
  }

  update() {
    if (!this.alive) return;
    this.aiCallback();
    this.addVelocityTimeDelta();
    this.checkCollision(this.game.players[0]);

    if (this.dashDuration > DASH_DURATION + POST_DASH_PAUSE) {
      this.vel = this.vel.multiply(0);
    } else if (this.dashDuration >= POST_DASH_PAUSE) {
      if (this.dashDuration === DASH_DURATION + POST_DASH_PAUSE) {
        let hitEmit = new Emitter(game, {
          coords: { x: this.pos.x, y: this.pos.y },
          r: 6,
          aim: this.storedVel.dup().multiply(-1),
          aliveTime: 20,
          emitCount: 8,
          emitSpeed: 4,
          ejectSpeed: 6,
          impulseVariance: 0.15,
          fanDegree: 10,
          color: "white",
        });
        this.game.vanity.push(hitEmit);
      }
      let p = new Particle(game, this.pos.x, this.pos.y);
      p.color = "green";
      p.aliveTime = 8;
      p.r = 5;
      p.active = false;
      p.cb = function () {
        this.aliveTime--;
        if (this.aliveTime <= 4) this.color = `rgba(128,128,128,${this.aliveTime / 4})`;
        if (this.aliveTime <= 0) this.alive = false;
      }
      this.game.vanity.push(p);

      this.vel = this.storedVel.multiply(0.98);
    } else {
      this.aim = Vector.difference(this.game.player.pos, this.pos);
      this.aim.normalize();
      let turnRate = BASE_TURN_RATE + Math.pow(this.game.difficulty, 1 / 3);
      this.aim.multiply(turnRate).add(this.vel).normalize();
      this.dampSpeed();
      // this.vel.add(this.aim.dup().normalize().multiply(this.dashDuration > 0 ? 0 : this.accel));

      this.dashCooldown > 0 ? this.dashCooldown-- : this.dash();
    }
    this.dashDuration > 0 ? this.dashDuration-- : null;
    this.attackCooldown > 0 ? this.attackCooldown-- : this.fire();
    
    // this.validateBound(this.cvs.width, this.cvs.height);

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

export default DashingEnemy;