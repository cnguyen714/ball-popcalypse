import Vector from "./Vector";
import EnemyCircle from "./EnemyCircle";
import Particle from "./Particle";

const WIDTH = 50;
const KNOCKBACK = 4;
const DAMAGE = 300;
// const COLOR = "white";

class Beam extends Particle {
  constructor(game, startX, startY) {
    super(game);
    this.pos = new Vector(startX, startY);
    this.aim = new Vector();
    this.width = WIDTH;
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

    let diff = Vector.difference(this.pos, obj.pos);
    let dist = Math.abs(this.aim.x * diff.y - this.aim.y * diff.x) / this.aim.length();

    
    // let diff = Vector.difference(this.pos, obj.pos);
    // let distSqr = diff.dot(diff);
    if (obj instanceof EnemyCircle) {
      if (this.width / 2 + obj.r > dist) {
      // if (true) {
        diff.normalize();
        diff.multiply(-1);
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
      this.aim = this.game.player.aim;
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
    let angle = Math.atan2(this.aim.y, this.aim.x);
    if (this.aliveTime > this.initialTime - 2) {
      this.ctx.save();

      // this.ctx.beginPath();
      this.ctx.fillStyle = this.color;
      this.ctx.strokeStyle = this.color;
      this.ctx.translate(this.pos.x + Math.sin(angle) * this.width / 2,
                         this.pos.y - Math.cos(angle) * this.width / 2);
      this.ctx.rotate(angle);
      this.ctx.fillRect(0, 0, 200, this.width);
      this.ctx.restore();
    } else {
      // this.ctx.fillStyle = "rgba(0,0,0,0)";
      this.ctx.save();

      this.width += 5;
      
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = "white";
      this.ctx.fillStyle = this.color;

      // this.ctx.fillStyle = "rgba(0,0,0,0)";
      this.ctx.strokeStyle = "white";
      this.ctx.translate(this.pos.x + Math.sin(angle) * this.width / 2, 
                         this.pos.y - Math.cos(angle) * this.width / 2);
      this.ctx.rotate(angle);
      this.ctx.fillRect(0, 0, 200, this.width);
      this.ctx.restore();


    }
  }
}

export default Beam;