
import Vector from "../lib/Vector";
import Player from './Player';
import GameObject from "./GameObject";
import Explosion from "./Explosion";
import Emitter from "./Emitter";
import DamageNumber from "./DamageNumber";

const RADIUS = 7;
const COLOR = "#a64942";
const KNOCKBACK = 10;
const ENEMY_KNOCKBACK_MULTIPLIER = 2.5;
const DAMPENING_COEFFICIENT = 0.55;
const SPREAD_FACTOR = 2.0;
const HEALTH = 100;
const HEALTH_CAP = 200;
const DAMAGE = 1;
const SCORE = 1;
const CHARGE_REWARD = 1;
const BASE_TURN_RATE = 2;
const ACCEL = 0.4;
const MAX_SPEED = 4;

class EnemyCircle extends GameObject {
  constructor(game, {
    pos = {x: 100, y: 100},
    r = RADIUS,
    color = COLOR,
    damage = DAMAGE,
    score = SCORE,
    chargeReward = CHARGE_REWARD,
  }) {
    super(game);
    this.aiCallback = () => {
      this.aim = Vector.difference(game.player.pos, this.pos).normalize();
      let turnRate = BASE_TURN_RATE + Math.pow(game.difficulty, 1 / 4);
      this.aim.multiply(turnRate).add(this.vel).normalize();

      this.vel.add(this.aim.multiply(this.accel));
    };

    this.health = HEALTH + game.difficulty * 2;
    this.accel = ACCEL + Math.random() * Math.pow(game.difficulty, 1 / 3);
    this.maxSpeed = MAX_SPEED + Math.random() * Math.pow(game.difficulty, 1 / 3);

    if (this.health > HEALTH_CAP) this.health = HEALTH_CAP;

    this.pos = new Vector(pos.x, pos.y);
    this.r = r;
    this.color = color;
    this.damage = damage;
    this.score = score;
    this.chargeReward = chargeReward;
    this.active = true;

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  dampSpeed() {
    if (this.vel.length() > this.maxSpeed) {
      this.vel.multiply(DAMPENING_COEFFICIENT);
      if (this.vel.length() < this.maxSpeed) {
        this.vel = this.vel.normalize().multiply(this.maxSpeed);
      }
    }
  }

  // Check if enemies collide with the player
  checkAndHitPlayer(player) {
    if (player.noclip > 0) return;
    let diff = Vector.difference(this.pos, player.pos);
    let distSqr = diff.dot(diff);

    // if (player.moveState === "STATE_DASHING") return;
    if (this.r * this.r + player.r * player.r > distSqr) {
      this.game.playSoundMany(`${this.game.filePath}/assets/impact.wav`, 0.3);
      if(this.damage > 1) this.game.vanity.push(new DamageNumber(player, this.damage, {
        size: 20 + this.r / 4, 
        duration: 30, 
        velX: this.vel.x * 2,
        type: "ENEMY",
      }));
      let explosion = new Explosion(game, player.pos.x + diff.x / 2, player.pos.y + diff.y / 2, this.r);
      explosion.color = 'red';
      explosion.aliveTime = 5;

      diff.normalize();
      diff.multiply(KNOCKBACK);
      player.vel.subtract(diff.dup().multiply(this.r / RADIUS));
      this.vel.add(diff.multiply(ENEMY_KNOCKBACK_MULTIPLIER));
      
      player.game.vanity.push(explosion);
      if (player.invul > 0) {
        explosion.color = 'lightblue';
        return false;
      } else {
        let hitEmit = new Emitter(game, {
          pos: { x: player.pos.x, y: player.pos.y },
          r: 5 + this.r / RADIUS,
          aim: this.aim.dup(),
          aliveTime: 20 + this.r / RADIUS,
          emitCount: 3 + this.r / RADIUS,
          ejectSpeed: 3 + this.r / RADIUS,
          impulseVariance: 0.15,
          fanDegree: 10 + this.r / RADIUS,
          color: "red",
        });

        this.game.vanity.push(hitEmit);

        player.health -= this.damage;
        player.charge += this.damage;
        if (this.r >= 50) player.invul = 45;
        return true;
      }
    }
    return false;
  }

  // Check if enemies are colliding and push them away
  checkAndSpreadEnemy(obj) {
    if (!obj.active) return;
    // Don't collide objects that are standing directly on each other
    if (obj.pos.equals(this.pos)) return;

    let diff = Vector.difference(this.pos, obj.pos);
    let distSqr = diff.dot(diff);

    if (this.r * this.r + obj.r * obj.r > distSqr) {
      diff.normalize();
      diff.multiply(SPREAD_FACTOR);
      obj.vel.subtract(diff.dup().multiply(this.r / RADIUS));
      this.vel.add(diff.dup().multiply(RADIUS / this.r));
    }
  }

  checkCollision(obj) {
    if (!obj.alive) return;

    if(obj instanceof Player) {
      this.checkAndHitPlayer(obj);
    } else if (obj instanceof EnemyCircle) {
      this.checkAndSpreadEnemy(obj);
    }
  }

  update() {
    if (!this.alive) return;
    this.aiCallback();

    this.dampSpeed();
    this.addVelocityTimeDelta();

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