import Vector from "./Vector";
import EnemyCircle from "./EnemyCircle";
import Explosion from "./Explosion";

import Particle from "./Particle";

const WIDTH = 50;
const HIT_WIDTH = 45;
const LENGTH = 200;
const HIT_LENGTH = 190;
const KNOCKBACK = 10;
const DAMAGE = 80;
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
    this.aliveTime = 7;
    // this.activeTime = 5;
    this.active = true;
    this.initialTime = this.aliveTime;

    // this.update = this.update.bind(this);
    // this.draw = this.draw.bind(this);
  }


  checkCollision(obj) {
    if (!obj.alive) return; //Don't check collision if object is not alive

    if (obj instanceof EnemyCircle) {      
      let x = this.pos.x;
      let y = this.pos.y;

      // === Infinite linear collision detection ===
      // let dist = Math.abs(this.aim.x * diff.y - this.aim.y * diff.x) / this.aim.length();
      // if (this.width / 2 + obj.r > dist) {
      // =============

      // === Translate positions to unrotated box, then box collision
      // Invert Y axis because canvas uses Y axis pointing down, and most cartesian
      // calculations are using Y axis up
      // --------------
      // calculate obj's relative position to beam origin
      // x′=xcosθ−ysinθ      
      // y′=ycosθ + xsinθ
      let diff = Vector.difference(new Vector(obj.pos.x, -obj.pos.y), new Vector(x, -y));

      let x2 = diff.x * Math.cos(this.angle) - diff.y * Math.sin(this.angle);
      let y2 = diff.y * Math.cos(this.angle) + diff.x * Math.sin(this.angle);

      // Collision using obj as a box,
      // Use LENGTH > HIT_LENGTH to hide inaccuracy of hitbox
      if ( 
        x2 + obj.r >= 0 &&
        x2 - obj.r <= 0 + HIT_LENGTH &&
        y2 + obj.r >= 0 - HIT_WIDTH / 2 &&
        y2 - obj.r <= 0 + HIT_WIDTH / 2
      ) {
        diff.normalize();

        // Invert Y axis again to use diff vector for knockback
        diff.multiply(new Vector(1, -1));
        obj.vel.add(diff.multiply(this.knockback));
        obj.health -= this.damage;
        if (obj.health <= 0) obj.alive = false;
      }
    }    
  }

  update() {
    if (!this.alive) return; //Don't check collision if object is not alive

    if (this.aliveTime === this.initialTime && this.active === true) {
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
    if (this.aliveTime > this.initialTime - 5) {
      this.ctx.save();

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