import Vector from "./Vector";
import EnemyCircle from "./EnemyCircle";
import Explosion from "./Explosion";

import Particle from "./Particle";
import Beam from "./Beam";

const WIDTH = 40;
const LENGTH = 50;
const RADIUS = 25;
const KNOCKBACK = 10;
const DURATION = 90;
const ARC_DEGREE_RATE = 0.8;
const NUM_RAYS = 12;
const GROWTH_RATE = 0.75;
const DIRECTION = {
  CCW: -1,
  CW: 1,
}
// const COLOR = "white";

//
// Beam factory that creates a new Beams in an arc over a duration
//
class DeathExplosion extends Particle {
  constructor(game,
    width = WIDTH,
    length = LENGTH,
    radius = RADIUS,
    pattern = "BASE",) {
    super(game);
    this.owner = this.game.player;
    this.pos = new Vector(this.owner.pos.x, this.owner.pos.y);
    this.color = this.owner.color;
    this.width = width;
    this.length = length;
    this.radius = radius;
    this.aliveTime = DURATION;
    this.active = false;
    this.arcRate = ARC_DEGREE_RATE * Math.PI / 180;
    this.knockback = KNOCKBACK;
    this.rays = {
      angle: [],
      length: [],
      width: [],
      dir: [],
      offsetRate: [],
    };
    this.pattern = pattern;

    for (let i = 0; i < NUM_RAYS; i++) {
      let direction = Math.floor(Math.random() * 2);
      if (direction === 0) direction = DIRECTION.CCW;
      switch (this.pattern) {
        case "BLACKHOLE":
          this.rays.angle.push(Math.random() * 360 * Math.PI / 180);
          this.rays.length.push(Math.random() * this.length * 22 + this.length );
          this.rays.width.push(Math.random() * this.width * 18 / 16 + this.width / 16);

          this.rays.dir.push(direction);
          this.rays.offsetRate.push((Math.random() * this.arcRate) * this.rays.dir[i]);
          break;
        default:
          this.rays.angle.push(Math.random() * 360 * Math.PI / 180);
          this.rays.length.push(Math.random() * this.length * 15 / 16 + this.length / 16);
          this.rays.width.push(Math.random() * this.width * 15 / 16 + this.width / 16);
          this.rays.dir.push(direction);
          this.rays.offsetRate.push((Math.random() * this.arcRate) * this.rays.dir[i]);
          break;
      }
    }

    switch (this.pattern) {
      case "BLACKHOLE":
        this.aliveTime = 50;
        break;
      default:
        break;
    }
  }

  checkCollision(obj) {
    // DeathExplosion does not check collision
  }

  update() {
    if (!this.alive) return;
    if (this.aliveTime <= 0) {
      this.alive = false;
    }

    switch(this.pattern) {
      case "BLACKHOLE":
        for (let i = 0; i < NUM_RAYS; i++) {
          this.rays.length[i] *= 0.96;
        }
        break;
      default:
        this.radius += GROWTH_RATE;

        if (this.aliveTime % 3 === 0) {
          let explosion = new Explosion(
            game,
            this.pos.x - 200 + Math.random() * 400,
            this.pos.y - 200 + Math.random() * 400,
            15 + Math.random() * 35,
            new Vector(0, -4));
          explosion.unpausable = true;
          explosion.paused = false;
          explosion.aliveTime = 9;
          explosion.color = "orange";
          this.game.vanity.push(explosion);
        }

        for (let i = 0; i < NUM_RAYS; i++) {
          this.rays.angle[i] += this.rays.offsetRate[i];
          this.rays.length[i] += this.rays.length[i] / 16;
        }
        break;
    }

    this.aliveTime--;
    this.cb();
  }

  drawRects() {
    for (let i = 0; i < NUM_RAYS; i++) {
      this.ctx.save();
      let color = (this.pattern === "BLACKHOLE" ? [0, 0, 0] : [255, 255, 255]);
      let gradient = this.ctx.createLinearGradient(0, 0, this.rays.length[i], this.rays.width[i]);
      gradient.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},.9)`);
      gradient.addColorStop(0.8, `rgba(${color[0]},${color[1]},${color[2]},.7)`);
      gradient.addColorStop(0.9, `rgba(${color[0]},${color[1]},${color[2]},.1)`);
      gradient.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0)`);
      this.ctx.fillStyle = gradient;


      this.ctx.translate(this.pos.x + Math.sin(this.rays.angle[i]) * this.rays.width[i] / 2,
        this.pos.y - Math.cos(this.rays.angle[i]) * this.rays.width[i] / 2);
      this.ctx.rotate(this.rays.angle[i]);
      this.ctx.fillRect(0, 0, this.rays.length[i], this.rays.width[i]);
      this.ctx.restore();
    }
  }

  draw() {
    this.drawRects();
    if(this.pattern === "BASE") {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
      this.ctx.fillStyle = "white";
      this.ctx.strokeStyle = "white";

      this.ctx.shadowBlur = 6;
      this.ctx.shadowColor = "white";

      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.closePath();

      this.ctx.restore();
    }
  }
}

export default DeathExplosion;