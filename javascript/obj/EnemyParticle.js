import Vector from "../lib/Vector";
import EnemyCircle from "./EnemyCircle";
import GameObject from "./GameObject";
import DamageNumber from "./DamageNumber";
import Particle from "./Particle";
import Explosion from "./Explosion";
import Emitter from "./Emitter";

const RADIUS = 10;
const KNOCKBACK = 30;
const DAMAGE = 10;
const COLOR = "#ff6229";
const VELOCITY = 6;
const SCORE = 1;
const HITBOX_RATIO = 0.8;

class EnemyParticle extends Particle {
  constructor(
    game,
    startX = 0,
    startY = 0,
    vel = new Vector(0, 0),
    cb = () => { }
  ) {
    super(game);
    this.pos = new Vector(startX, startY);
    this.vel = vel || VELOCITY;
    this.r = RADIUS;
    this.color = COLOR;
    this.damage = DAMAGE;
    this.knockback = KNOCKBACK;
    this.cb = cb;
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
    if (this.r * this.r + player.r * player.r > distSqr * HITBOX_RATIO) {
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

        let hitEmit = new Emitter(game, {
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

        this.game.vanity.push(hitEmit);
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
      emitCount: 2,
      emitSpeed: 1,
      ejectSpeed: 0.5,
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

    this.ctx.closePath();
    this.ctx.restore();
  }
}

export default EnemyParticle;