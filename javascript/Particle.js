import Vector from "./Vector";

const RADIUS = 2;

class Particle {
  constructor(
    game, 
    startX = 0, 
    startY = 0, 
    vel = new Vector(0,0), 
    cb = () => {} 
  ) {
    this.game = game;
    this.cvs = game.cvs;
    this.ctx = game.ctx;
    this.pos = new Vector(startX, startY);
    this.vel = vel;
    this.cb = cb;
    this.alive = true;

    this.r = RADIUS;
    this.color = 'red';

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  validatePosition(rectX, rectY) {
    if ( this.pos.x > rectX + this.r 
      || this.pos.x < 0 - this.r 
      || this.pos.y > rectY + this.r 
      || this.pos.y < 0 - this.r ) { 
        this.alive = false;
      };
  }

  update(game) {
    this.cb();
    this.pos.add(this.vel);

    this.validatePosition(this.cvs.width, this.cvs.height);
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.color;
    this.ctx.strokeStyle = this.color;
    this.ctx.fill();
    this.ctx.stroke();
  }
}

export default Particle;