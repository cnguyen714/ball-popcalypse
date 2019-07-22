import Vector from "/javascript/Vector";
import Particle from "/javascript/Particle";

const RADIUS = 5;
const COLOR = "white";

class Explosion extends Particle {
  constructor(game, startX, startY) {
    super(game);
    this.pos = new Vector(startX, startY);
    this.vel = new Vector();
    this.r = RADIUS;
    this.color = COLOR;
    this.aliveTime = 20;
    this.initialAliveTime = this.aliveTime;

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  update() {
    if (!this.alive) return; //Don't check collision if object is not alive

    if (this.aliveTime <= 0) {
      this.alive = false;
    }
    this.aliveTime--;
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {

    if (this.aliveTime > 5) {
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

      this.r += 2;
      this.ctx.beginPath();
      this.ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
      this.ctx.fillStyle = "rgba(0,0,0,0)";
      this.ctx.fill();
      this.ctx.strokeStyle = this.color;
     
      this.ctx.shadowBlur = 30;
      this.ctx.shadowColor =  this.color;
      this.ctx.stroke();  

      this.ctx.restore();    
    }
  }
}

export default Explosion;