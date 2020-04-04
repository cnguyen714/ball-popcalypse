import Vector from "../lib/Vector";

import GameObject from "./GameObject";

const SIZE = 35;
const DURATION = 50;
const FREEZE_DURATION = 3;
const DEFAULT_TYPE = "BASE";
const VARIANCE = 70;
const GRAVITY = 0.3;
const MAX_SIDE_VEL = 8;

const COLOR = {
  NORMAL: [255, 255, 255],
  CRIT: [255, 255, 0],
  CANNON: [0, 0, 0],
  ENEMY: [255, 0, 0],
}
//
// Damage Number
//
class DamageNumber extends GameObject {
  constructor(damagedObj, damage, {
    size = SIZE,
    aliveTime = DURATION,
    initialTime = aliveTime,
    freezeTime = FREEZE_DURATION,
    velX = 0.5,
    alpha = 1,
    type = "NORMAL",
  }) {
    super(damagedObj.game);
    let x = damagedObj.pos.x;
    let y = damagedObj.pos.y;

    this.pos = new Vector(x - VARIANCE / 2 + Math.random() * VARIANCE, y - VARIANCE / 2 + Math.random() * VARIANCE);
    this.damage = damage;
    this.alive = alpha;
    this.size = size;
    this.aliveTime = aliveTime;
    this.initialTime = initialTime;
    this.freezeTime = freezeTime;
    this.alpha = alpha;
    this.type = type;
    this.paused = false;
    if (velX > MAX_SIDE_VEL) velX = MAX_SIDE_VEL;
    if (velX < -MAX_SIDE_VEL) velX = -MAX_SIDE_VEL;


    this.vel = new Vector(-2 + Math.random() * 4 + velX, -7);
    this.cb = () => {};

    switch (this.type) {
      case "NORMAL":
        this.color = COLOR.NORMAL;
        break;
      case "ENEMY":
        this.color = COLOR.ENEMY;
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
    color = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${percent * this.alpha})`;

    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.shadowBlur = 1;
    this.ctx.shadowColor = "black";
    this.ctx.fillText(`${Math.floor(this.damage)}`, this.pos.x, this.pos.y);
    this.ctx.restore();
  }

  update() {
    if (this.freezeTime >= 0) {
      this.freezeTime--;
    } else {
      this.addVelocityTimeDelta();
      this.vel.y += GRAVITY;
    }

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