import Vector from "../lib/Vector";
import EnemyCircle from "./EnemyCircle";
import Particle from "./Particle";
import DamageNumber from "./DamageNumber";
import GameObject from "./GameObject";

const RADIUS = 100;
const KNOCKBACK = 150;
const DAMAGE = 70;
const GROWTH_RATE = 10;
// const COLOR = "white";

class Slam extends GameObject {
  constructor(game, startX, startY) {
    super(game);
    this.pos = new Vector(startX, startY);
    this.vel = new Vector();
    this.r = RADIUS;
    this.color = this.game.player.color;
    this.damage = DAMAGE;
    this.knockback = KNOCKBACK;
    this.aliveTime = 10;
    this.initialTime= this.aliveTime;
    this.growthRate = GROWTH_RATE;
    this.cb = () => {};

    // this.update = this.update.bind(this);
    // this.draw = this.draw.bind(this);
  }


  checkCollision(obj) {
    if (!obj.alive) return; //Don't check collision if object is not alive

    let diff = Vector.difference(this.pos, obj.pos);
    let distSqr = diff.dot(diff);
    if (obj instanceof EnemyCircle) {
      if (this.r * this.r + obj.r * obj.r > distSqr) {
        diff.normalize();
        obj.vel.add(diff.multiply(-this.knockback));
        obj.health -= this.damage;
        if (obj.health <= 0) obj.alive = false;
        this.game.vanity.push(new DamageNumber(this.game, obj.pos.x, obj.pos.y, this.damage));

      }
    }
  }

  update() {
    if (!this.alive) return; //Don't check collision if object is not alive
    
    if(this.aliveTime === this.initialTime) {
      this.game.entities.forEach(entity => { this.checkCollision(entity) });
      this.game.freeze(5);
    }
    if (this.aliveTime <= 0) {
      this.alive = false;
    }
    this.aliveTime--;
    this.cb();
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    if (this.aliveTime > this.initialTime - 5) {
      this.ctx.save();

      this.ctx.beginPath();
      this.ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
      this.ctx.fillStyle = this.color;
      this.ctx.fill(); 
      this.ctx.strokeStyle = "white";
      this.ctx.stroke(); 
      this.ctx.restore();
    } else {
      this.ctx.save();

      this.r += this.growthRate;
      this.ctx.beginPath();
      this.ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
      this.ctx.fillStyle = "rgba(0,0,0,0)";
      this.ctx.fill();
      this.ctx.strokeStyle = "white";
     
      this.ctx.shadowBlur = 30;
      this.ctx.shadowColor = this.color;
      this.ctx.stroke();  

      this.ctx.restore();
  
    }
  }
}

export default Slam;