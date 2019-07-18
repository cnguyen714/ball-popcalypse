import Vector from "./Vector";

class Particle {
  constructor(game, startX, startY, vel) {
    this.cvs = game.cvs;
    this.ctx = game.ctx;
    this.x = startX;
    this.y = startY;
    this.vel = vel;

    this.r = 15;
    this.fillColor = 'black';
  }

  update(state) {
    this.x += this.dx;
    this.y += this.dy;
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.fillColor;
    this.ctx.fill();
    this.ctx.stroke();
  }
}

export default Particle;