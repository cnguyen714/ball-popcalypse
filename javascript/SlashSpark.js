import Vector from "./Vector";

import Particle from "./Particle";

const WIDTH = 1;
const LENGTH = 60;

const DURATION = 20;

const COLOR = {
  NORMAL: [255, 255, 255],
  CRIT: [255, 255, 0],
  CANNON: [0, 0, 0],
}
//
// hitspark for beams
//
class SlashSpark extends Particle {
  constructor(game, x, y, 
      combo = 0, 
      width = WIDTH, 
      length = LENGTH, 
      duration = DURATION, 
      angle = Math.floor(Math.random() * 360) * Math.PI / 180, 
      rotation = 0, 
      pauseState = true) {
    super(game);
    this.pos = new Vector(x, y);
    this.combo = combo;
    this.width = width;
    this.length = length;
    this.aliveTime = duration;
    this.initialTime = this.aliveTime;
    this.rotation = rotation;
    this.paused = pauseState;
    this.cb = () => {};

    this.offsets = [];
    this.offsets.push(-Math.PI / 32 + Math.random() * Math.PI / 16);
    this.offsets.push(-Math.PI / 32 + Math.random() * Math.PI / 16);
    this.offsets.push(-Math.PI / 32 + Math.random() * Math.PI / 16);
    this.offsets.push(-Math.PI / 32 + Math.random() * Math.PI / 16);
    this.offsets.push(-Math.PI / 32 + Math.random() * Math.PI / 16);

    // this.angle = Math.atan2(this.aim.y, this.aim.x);

    this.angle = angle;
    // let newAim = new Vector(1, 0);
    // newAim.multiply(1, -1);

    // let x2 = newAim.x * Math.cos(angle) - newAim.y * Math.sin(angle);
    // let y2 = newAim.y * Math.cos(angle) + newAim.x * Math.sin(angle);
    // // debugger
    // this.aim = new Vector(-x2, -y2);

    switch(this.combo) {
      case -1:
        this.color = COLOR.CRIT;
        break;
      case -2:
        // this.angle = (Math.atan2(this.aim.y, this.aim.x));
        this.color = COLOR.CANNON;
        break;
      case -3:
        this.color = COLOR.CRIT;
        break;
      default:
        this.color = COLOR.NORMAL;
        break;
    }
  }

  checkCollision(obj) {
    // SlashSpark does not check collision
  }

  drawRect(offset, colorIn, widthMod = 1, lengthMod = 1) {
    
    this.ctx.save();

    let percent = this.aliveTime / this.initialTime;
    let color;
    if (this.combo === -1) {
      this.aliveTime >= this.initialTime - 2 
        ? color = `rgba(${colorIn[0]},${colorIn[1]},${colorIn[2]},${1})` 
        : color = `rgba(${colorIn[0]},${colorIn[1]},${colorIn[2]},${percent})`
    } else if (this.combo === -2) {
      this.aliveTime >= this.initialTime - 2 
        ? color = `rgba(255,255,255,${1})`
        : color = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${percent})`
    } else {
      this.aliveTime >= this.initialTime - 1
        ? color = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${percent})`
        : color = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${percent - 0.3})`
    }
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    // Offset the rect based on its width but maintain origin
    this.ctx.translate(this.pos.x + Math.sin(this.angle + offset) * widthMod * this.width / 2,
                       this.pos.y - Math.cos(this.angle + offset) * widthMod * this.width / 2);
    this.ctx.rotate(this.angle + offset);
    this.ctx.fillRect(0, 0, this.length * lengthMod, widthMod * this.width);
    this.ctx.restore();
  }

  update() {
    this.angle += this.rotation;
    // transient effect
    this.width *= 0.85;
    switch(this.combo) {
      case -1:
        this.length *= 1.005;
        break;
      case -2:
        this.length *= 0.95;
        break;
      default:
      // this will alias the edges
        this.length *= 1.001;
        break;
    }

    if (this.aliveTime <= 0) {
      this.alive = false;
    }
    this.aliveTime--;
    this.cb();

  }

  draw() {
    let color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
    if (this.combo === -2) {
      if (this.aliveTime >= this.initialTime - 10) {
        color = [255, 255, 255]
      } else {
        color = [0, 0, 0]
      }
      this.drawRect(0, color, 1    , 1.5);
      this.drawRect(0, color, 3 / 4, 1.55);
      this.drawRect(0, color, 1 / 3, 1.58);
      // this.drawRect(this.offsets[1]);
    } else {

      this.drawRect(0, color);
      this.drawRect(Math.PI, color);
    }
  }
}

export default SlashSpark;