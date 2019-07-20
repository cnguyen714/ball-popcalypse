import Vector from "./Vector";
import EnemyCircle from "./EnemyCircle";
import Particle from "./Particle";

const RADIUS = 100;
const KNOCKBACK = 150;
const DAMAGE = 50;
const COLOR = "white";

class Slam extends Particle {
  constructor(game, startX, startY) {
    super(game);
    this.pos = new Vector(startX, startY);
    this.vel = new Vector();
    this.r = RADIUS;
    this.color = COLOR;
    this.damage = DAMAGE;
    this.knockback = KNOCKBACK;
    this.aliveTime = 10;

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  update() {
    if (!this.alive) return; //Don't check collision if object is not alive

    if (this.aliveTime === 10) {
      this.game.entities.forEach(entity => { this.checkCollision(entity) });
    }
    if (this.aliveTime <= 0) {
      this.alive = false;
    }
    this.aliveTime--;
    this.cb();
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    if (this.aliveTime > 5) {
      this.ctx.save();

      this.ctx.beginPath();
      this.ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
      this.ctx.fillStyle = this.game.player.color;
      this.ctx.strokeStyle = this.game.player.color;
      this.ctx.fill();
      this.ctx.stroke();
    } else {
      this.ctx.save();

      this.ctx.beginPath();
      this.ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
      this.ctx.fillStyle = "rgba(0,0,0,0)";
      this.ctx.strokeStyle = "rgba(0,0,0,0)";

      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = this.game.player.color;
      this.r += 10;
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.restore();

    }
  }
}

export default Slam;