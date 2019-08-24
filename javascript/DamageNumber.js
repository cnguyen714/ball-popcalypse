import Vector from "./Vector";

import GameObject from "./GameObject";

const SIZE = 20;
const DURATION = 60;
const FREEZE_DURATION = 20;
const DEFAULT_TYPE = "BASE";

const COLOR = {
  NORMAL: [255, 255, 255],
  CRIT: [255, 255, 0],
  CANNON: [0, 0, 0],
}
//
// hitspark for beams
//
class DamageNumber extends GameObject {
  constructor(game, x, y,
    damage,
    size = SIZE,
    duration = DURATION,
    type = DEFAULT_TYPE,
    pauseState = true) {
    super(game);
    this.pos = new Vector(x, y);
    this.damage = damage;
    this.size = size;
    this.aliveTime = duration;
    this.initialTime = this.aliveTime;
    this.type = type;
    this.paused = pauseState;
    this.cb = () => {};


    switch (this.type) {
      case "BASE":
        this.color = COLOR.NORMAL;
        break;
      default:
        this.color = COLOR.NORMAL;
        break;
    }
  }

  checkCollision(obj) {
    // DamageNumber does not check collision
  }

  drawNum() {
    this.ctx.save();
    this.ctx.font = `${this.size}px sans-serif`;
    let color;
    // let percent = (this.aliveTime - FREEZE_DURATION) / (this.initialTime - FREEZE_DURATION);
    // if (this.aliveTime > (DURATION - FREEZE_DURATION)) {
    //   color = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},1)`;
    // } else {
    //   color = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${percent})`;
    // }
    let percent = (this.aliveTime) / (this.initialTime);
    color = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${percent})`;

    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.shadowBlur = 1;
    this.ctx.shadowColor = "black";
    this.ctx.fillText(`${this.damage}`, this.pos.x, this.pos.y);
    this.ctx.restore();
  }

  update() {
    this.pos.y--;

    if (this.aliveTime <= 0) {
      this.alive = false;
    }
    this.aliveTime--;
    this.cb();
  }

  draw() {
    this.drawNum();
  }
}

export default DamageNumber;