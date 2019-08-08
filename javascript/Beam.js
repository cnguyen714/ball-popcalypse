import Vector from "./Vector";
import EnemyCircle from "./EnemyCircle";
import Explosion from "./Explosion";

import Particle from "./Particle";

const WIDTH = 60;
const LENGTH = 200;
const HITBOX_RATIO = 0.95;
const KNOCKBACK = 10;
const DAMAGE = 80;
const DURATION = 7;
// const COLOR = "white";

class Beam extends Particle {
  constructor(game, startX, startY, aim) {
    super(game);
    this.pos = new Vector(startX, startY);
    this.aim = aim || this.game.player.aim;

    // Formula to get the radian angle between the Y axis and a point
    this.angle = Math.atan2(this.aim.y, this.aim.x);

    this.width = WIDTH;
    this.length = LENGTH;
    this.origin = new Vector(this.pos.x);
    this.damage = DAMAGE;
    this.knockback = KNOCKBACK;
    this.aliveTime = DURATION;
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
      
      // Get the obj relative position to beam origin pos
      let diff = Vector.difference(new Vector(obj.pos.x, -obj.pos.y), new Vector(x, -y));

      let x2 = diff.x * Math.cos(this.angle) - diff.y * Math.sin(this.angle);
      let y2 = diff.y * Math.cos(this.angle) + diff.x * Math.sin(this.angle);

      // Collision using obj as a box,
      // Use LENGTH > HIT_LENGTH to hide inaccuracy of hitbox
      if ( 
        x2 + obj.r >= 0 &&
        x2 - obj.r <= 0 + HITBOX_RATIO * this.length &&
        y2 + obj.r >= 0 - HITBOX_RATIO * this.width / 2 &&
        y2 - obj.r <= 0 + HITBOX_RATIO * this.width / 2
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

  drawRect() {
    // Offset the rect based on its width but maintain origin
    this.ctx.translate(this.pos.x + Math.sin(this.angle) * this.width / 2,
                       this.pos.y - Math.cos(this.angle) * this.width / 2);
    this.ctx.rotate(this.angle);
    this.ctx.fillRect(0, 0, this.length, this.width);
  }

  update() {
    if (!this.alive) return; //Don't check collision if object is not alive

    if (this.aliveTime >= this.initialTime - 1 && this.active === true) {
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
      this.ctx.shadowColor = this.color;
      
      this.drawRect();

      this.ctx.restore();
    } else {
      this.ctx.save();

      this.width += 2;
      
      this.ctx.shadowBlur = 20;
      // this.ctx.shadowColor = "white";
      this.ctx.shadowColor = "white";
      // this.ctx.fillStyle = "gray";

      this.ctx.fillStyle = "rgba(150,150,150,150)";
      this.ctx.strokeStyle = "white";

      this.drawRect();

      this.ctx.restore();

    }
  }
}

export default Beam;