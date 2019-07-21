import Vector from "./Vector";
import EnemyCircle from "./EnemyCircle";
import Particle from "./Particle";

const RADIUS = 100;
const KNOCKBACK = 150;
const DAMAGE = 70;
// const COLOR = "white";

class Slam extends Particle {
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
      this.ctx.strokeStyle = this.color;
      this.ctx.fill();
      this.ctx.stroke(); 
      this.ctx.closePath();   
      this.ctx.restore();
    } else {
      this.ctx.save();

      this.ctx.beginPath();
      this.ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
      this.ctx.fillStyle = "rgba(0,0,0,0)";
      this.ctx.strokeStyle = this.color;
     
      this.ctx.shadowBlur = 30;
      this.ctx.shadowColor = this.color;
      this.r += 10;
      this.ctx.fill();
      this.ctx.stroke();  
      this.ctx.closePath();   

      this.ctx.restore();
  
    }
  }
}

export default Slam;