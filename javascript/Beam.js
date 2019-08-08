import Vector from "./Vector";
import EnemyCircle from "./EnemyCircle";
import Explosion from "./Explosion";

import Particle from "./Particle";

const WIDTH = 50;
const LENGTH = 200;
const KNOCKBACK = 20;
const DAMAGE = 300;
// const COLOR = "white";

class Beam extends Particle {
  constructor(game, startX, startY) {
    super(game);
    this.pos = new Vector(startX, startY);
    this.aim = this.game.player.aim;
    this.angle = Math.atan2(this.aim.y, this.aim.x);
    this.width = WIDTH;
    this.length = LENGTH;
    this.origin = new Vector(this.pos.x )
    this.damage = DAMAGE;
    this.knockback = KNOCKBACK;
    this.aliveTime = 5;
    // this.activeTime = 5;
    this.initialTime = this.aliveTime;

    // this.update = this.update.bind(this);
    // this.draw = this.draw.bind(this);
  }


  checkCollision(obj) {
    if (!obj.alive) return; //Don't check collision if object is not alive

    if (obj instanceof EnemyCircle) {

      // === Infinite linear collision detection ===
      // let dist = Math.abs(this.aim.x * diff.y - this.aim.y * diff.x) / this.aim.length();
      // if (this.width / 2 + obj.r > dist) {
        // === ===

        // calculate obj's relative position to beam origin
      // x′=xcosθ−ysinθ
      
      // y′=ycosθ + xsinθ
      // let relativePos = new Vector(x2, y2);
      let x = this.pos.x;
      let y = this.pos.y;
      
      // Invert Y axis because canvas uses Y axis pointing down, and most cartesian
      // calculations are using Y axis up
      let diff = Vector.difference(new Vector(obj.pos.x, -obj.pos.y), new Vector(x, -y));

      let x2 = diff.x * Math.cos(this.angle) - diff.y * Math.sin(this.angle);
      let y2 = diff.y * Math.cos(this.angle) + diff.x * Math.sin(this.angle);
      // debugger
      if (
        x2 + obj.r >= 0 &&
        x2 - obj.r <= 0 + this.length &&
        y2 + obj.r >= 0 - this.width / 2&&
        y2 - obj.r <= 0 + this.width / 2
      ) {
        diff.normalize();
        diff.multiply();
        obj.vel.add(diff.multiply(this.knockback));
        obj.health -= this.damage;
        if (obj.health <= 0) {
          obj.alive = false;
          this.game.difficulty += 0.002 * this.game.difficultyRate;

          this.game.score++;
        }
      }
    }    
  }

  update() {
    if (!this.alive) return; //Don't check collision if object is not alive

    if (this.aliveTime === this.initialTime) {
      this.game.entities.forEach(entity => { this.checkCollision(entity) });
      // this.game.freeze(5);
    }
    if (this.aliveTime <= 0) {
      this.alive = false;
    }
    this.aliveTime--;
    this.cb();
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    let forward = new Vector(1, 0);
    if (this.aliveTime > this.initialTime - 2) {
      this.ctx.save();

      // this.ctx.beginPath();
      this.ctx.fillStyle = this.color;
      this.ctx.strokeStyle = this.color;
      this.ctx.translate(this.pos.x + Math.sin(this.angle) * this.width / 2,
                         this.pos.y - Math.cos(this.angle) * this.width / 2);
      this.ctx.rotate(this.angle);
      this.ctx.fillRect(0, 0, this.length, this.width);
      this.ctx.restore();
    } else {
      // this.ctx.fillStyle = "rgba(0,0,0,0)";
      this.ctx.save();

      this.width += 2;
      
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = "white";
      this.ctx.fillStyle = "gray";

      // this.ctx.fillStyle = "rgba(0,0,0,0)";
      this.ctx.strokeStyle = "white";
      this.ctx.translate(this.pos.x + Math.sin(this.angle) * this.width / 2, 
                         this.pos.y - Math.cos(this.angle) * this.width / 2);
      this.ctx.rotate(this.angle);
      this.ctx.fillRect(0, 0, this.length, this.width);
      this.ctx.restore();

    }
  }
}

export default Beam;