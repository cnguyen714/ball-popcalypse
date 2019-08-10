import Vector from "./Vector";

import Particle from "./Particle";

const WIDTH = 1;
const LENGTH = 60;

const DURATION = 20;

const COLOR = "white";

//
// hitspark for beams
//
class SlashSpark extends Particle {
  constructor(game, x, y, color, width, length) {
    super(game);
    this.pos = new Vector(x, y);
    this.color = color || COLOR;
    this.width = width || WIDTH;
    this.length = length || LENGTH;
    this.aliveTime = DURATION;
    this.initialTime = this.aliveTime;


    // this.angle = Math.atan2(this.aim.y, this.aim.x);


    this.angle = Math.floor(Math.random() * 360) * Math.PI / 180;
    // let newAim = new Vector(1, 0);
    // newAim.multiply(1, -1);

    // let x2 = newAim.x * Math.cos(angle) - newAim.y * Math.sin(angle);
    // let y2 = newAim.y * Math.cos(angle) + newAim.x * Math.sin(angle);
    // // debugger
    // this.aim = new Vector(-x2, -y2);
  }

  checkCollision(obj) {
    // SlashSpark does not check collision
  }

  drawRect(offset) {
    this.ctx.save();

    let percent = this.aliveTime / this.initialTime;
    let color;
    this.aliveTime === this.initialTime ? color = `rgba(255,255,255,${percent})` : color = `rgba(255,255,255,${percent - 0.3})`
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    // Offset the rect based on its width but maintain origin
    this.ctx.translate(this.pos.x + Math.sin(this.angle + offset) * this.width / 2,
                       this.pos.y - Math.cos(this.angle + offset) * this.width / 2);
    this.ctx.rotate(this.angle + offset);
    this.ctx.fillRect(0, 0, this.length, this.width);
    this.ctx.restore();
  }

  update() {
    if (this.aliveTime <= 0) {
      this.alive = false;
    }
    this.aliveTime--;
  }

  draw() {
    this.drawRect(0);
    this.drawRect(Math.PI);
  }
}

export default SlashSpark;