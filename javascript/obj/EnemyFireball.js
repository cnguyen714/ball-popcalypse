import Vector from "../lib/Vector";
import EnemyCircle from "./EnemyCircle";
import GameObject from "./GameObject";
import DamageNumber from "./DamageNumber";
import Particle from "./Particle";
import Explosion from "./Explosion";
import Emitter from "./Emitter";

const RADIUS = 20;
const KNOCKBACK = 40;
const DAMAGE = 10;
const COLOR = "#ff6229";
const VELOCITY = 7;
const SCORE = 1;
const HITBOX_RATIO = 0.3;


class EnemyFireball extends Particle {
  constructor(game, {
    pos = {x: 100, y: 100},
    vel = new Vector(1, 0),
    cb = () => { },
    r = RADIUS,
    damage = DAMAGE,
    knockback = KNOCKBACK,
    color = COLOR,
  }
  ) {
    super(game);
    this.pos = new Vector(pos.x, pos.y);
    this.vel = vel;
    this.cb = cb;
    this.r = r;
    this.damage = damage;
    this.knockback = knockback;
    this.color = color;
    this.aliveTime = 1;
    this.active = true;
    this.target = this.game.player;
    this.score = SCORE;
    this.health = 1;

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  checkAndHitPlayer(player) {
    let diff = Vector.difference(this.pos, player.pos);
    let distSqr = diff.dot(diff);

    // if (player.moveState === "STATE_DASHING") return;
    if ((this.r * this.r + player.r * player.r) * HITBOX_RATIO > distSqr) {
      if(player.alive) this.game.playSoundMany(`${this.game.filePath}/assets/impact.wav`, 0.3);
      let explosion = new Explosion(game, player.pos.x + diff.x / 2, player.pos.y + diff.y / 2, this.r * 2);
      
      explosion.color = 'red';
      explosion.aliveTime = 5;

      let kb = this.vel.dup().normalize();
      kb.multiply(this.knockback);
      player.vel.add(kb);

      if (player.invul > 0) {
        explosion.color = 'lightblue';
      } else {
        player.health -= this.damage;
        player.charge += this.damage;
        if (this.r > RADIUS) player.invul = 45;

        let bloodSplat = new Emitter(game, {
          pos: { x: player.pos.x, y: player.pos.y },
          r: 6,
          aim: this.vel.dup(),
          aliveTime: 20,
          emitCount: 1,
          ejectSpeed: 7,
          impulseVariance: 0.15,
          fanDegree: 10,
          color: "red",
        });
        this.game.vanity.push(bloodSplat);

        let fireSpark = new Emitter(this.game, {
          pos: this.pos,
          r: 6,
          aim: this.vel.dup().multiply(-1),
          aliveTime: 45,
          emitCount: 24,
          emitSpeed: 8,
          fanDegree: 40,
          ejectSpeed: 4,
          decayRate: 0.94,
          impulseVariance: 0.8,
          color: "rgba(255, 98, 41, 1)",
          cb: function () { this.vel.y -= 0.1; },
        });
        this.game.vanity.push(fireSpark);

        this.game.vanity.push(new DamageNumber(player, this.damage, {
          size: 30,
          duration: 30,
          velX: this.vel.x * 4,
          type: "ENEMY",
        }));
      }
      this.alive = false;
      player.game.vanity.push(explosion);
    }
  }

  update() {
    if (!this.alive) return; //Don't check collision if object is not alive
    this.cb();
    if (!this.active) return;
    this.addVelocityTimeDelta();
    this.checkAndHitPlayer(this.target);
    this.validatePosition(this.cvs.width, this.cvs.height);

    let thruster = new Emitter(this.game, {
      pos: { x: this.pos.x, y: this.pos.y },
      r: this.r - 1,
      aim: this.vel.dup().multiply(-1),
      aliveTime: 10,
      emitCount: 1,
      emitSpeed: 1,
      ejectSpeed: this.r * 0.1,
      impulseVariance: .5,
      fanDegree: 20,
      color: this.color,
      decayRate: 0.8,
    });

    this.game.vanity.push(thruster);
    
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
    this.ctx.shadowBlur = 7;
    this.ctx.shadowColor = "red";
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.strokeStyle = "red";
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(this.pos.x, this.pos.y, this.r * (HITBOX_RATIO + 0.1), 0, 2 * Math.PI);
    this.ctx.shadowBlur = 0;
    this.ctx.lineWidth = 0.5;
    this.ctx.fillStyle = "rgba(0,0,0,0)";
    this.ctx.fill();
    this.ctx.strokeStyle = "black";
    this.ctx.stroke();

    this.ctx.closePath();
    this.ctx.restore();
  }
}

export default EnemyFireball;