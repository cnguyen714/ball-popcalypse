import Vector from "../lib/Vector";
import EnemyCircle from "./EnemyCircle";
import GameObject from "./GameObject";
import DamageNumber from "./DamageNumber";
import Particle from "./Particle";
import Explosion from "./Explosion";

const RADIUS = 10;
const KNOCKBACK = 20;
const DAMAGE = 10;
const COLOR = "red";
const VELOCITY = 6;

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

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  checkAndHitPlayer(player) {
    let diff = Vector.difference(this.pos, player.pos);
    let distSqr = diff.dot(diff);

    // if (player.moveState === "STATE_DASHING") return;
    if (this.r * this.r + player.r * player.r > distSqr) {
      if(player.alive) this.game.playSoundMany(`${this.game.filePath}/assets/impact.wav`, 0.3);
      let explosion = new Explosion(game, player.pos.x + diff.x / 2, player.pos.y + diff.y / 2, this.r * 2);
      explosion.color = 'red';
      explosion.aliveTime = 5;

      diff.normalize();
      diff.multiply(KNOCKBACK);
      player.vel.subtract(diff.dup().multiply(this.r / RADIUS));

      if (player.invul > 0) {
        explosion.color = 'lightblue';
      } else {
        player.health -= this.damage;
        player.charge += this.damage;
        if (this.r > RADIUS) player.invul = 45;
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
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
    this.ctx.shadowBlur = 6;
    this.ctx.shadowColor = this.color;
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.strokeStyle = this.color;
    this.ctx.stroke();

    this.ctx.closePath();
    this.ctx.restore();
  }
}

export default EnemyParticle;