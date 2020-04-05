import Vector from "../lib/Vector";
import EnemyCircle from "./EnemyCircle";
import GameObject from "./GameObject";
import DamageNumber from "./DamageNumber";
import Slam from "./Slam";
import Beam from "./Beam";

const RADIUS = 4;
const COLOR = "white";
const DECAY = 0.9;
const DURATION = 20;

class Star extends Beam {
  constructor(
    game,
    {
      pos = { x: 0, y: 0 },
      vel = new Vector(0, 0),
      cb = () => { },
      color = Beam.COLOR().TEAL,
      length = 60,
      width = 10,
      spread = 0,
      aliveTime = 60,
      expandRate = 1.06,
      thinningRate = 0.75,
      angle = 0,
    }
  ) {
    super(game, {pos: pos});
    this.pos = new Vector(pos.x - spread / 2+ Math.random() * spread, pos.y - spread / 2 + Math.random() * spread);
    this.angle = angle;
    this.vel = vel;
    this.color = color;
    this.cb = cb;
    this.initialTime = aliveTime;
    this.aliveTime = aliveTime;
    this.length = length;
    this.width = width;
    this.spread = spread;
    this.aliveTime = aliveTime;
    this.expandRate = expandRate;
    this.thinningRate = thinningRate;
    this.active = true;
    this.silenced = true;
    this.unpausable = true;
    this.paused = false;

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }
  validatePosition(rectX, rectY) {
    if (this.pos.x > rectX + this.length / 2
      || this.pos.x < 0 - this.length / 2
      || this.pos.y > rectY + this.length / 2
      || this.pos.y < 0 - this.length / 2) {
      this.alive = false;
    };
  }

  checkCollision(obj) {
    return;
  }

  update() {
    if (!this.alive) return; //Don't check collision if object is not alive
    if (!this.active) return;
    this.cb();
    
    this.width *= this.thinningRate;
    this.length *= this.expandRate;
    
    this.addVelocityTimeDelta();
    this.validatePosition(this.cvs.width, this.cvs.height);
    this.aliveTime--;
    if (this.aliveTime <= 0) this.alive = false;
  }

  drawRect() {
    // Offset the rect based on its width but maintain origin
    this.ctx.translate(this.pos.x, this.pos.y);
    this.ctx.rotate(this.angle);
    this.ctx.fillRect(0, this.width / -2, this.length, this.width);
    this.ctx.rotate(Math.PI / 2);
    this.ctx.fillRect(0, this.width / -2, this.length, this.width);
    this.ctx.rotate(Math.PI / 2);
    this.ctx.fillRect(0, this.width / -2, this.length, this.width);
    this.ctx.rotate(Math.PI / 2);
    this.ctx.fillRect(0, this.width / -2, this.length, this.width);
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    if (!this.alive) return;

    if (this.aliveTime > this.initialTime - 6) {
      let color = this.color;

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},0.9)`;
      this.ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.9)`;
      this.ctx.shadowColor = `rgba(${color[0]},${color[1]},${color[2]},0.9)`;
      this.ctx.shadowBlur = 30;
      this.ctx.closePath();
      this.ctx.stroke();
      this.drawRect();
      this.ctx.restore();
    } else {
      let color = Beam.COLOR().FADE;

      this.ctx.save();
      this.ctx.beginPath();

      this.ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]}, ${Math.pow((this.aliveTime + 3) / (this.initialTime - 6), 3)})`;
      this.ctx.shadowColor = `rgba(${color[0]},${color[1]},${color[2]}, ${Math.pow((this.aliveTime + 3) / (this.initialTime - 6), 3)})`;
      this.ctx.shadowBlur = 50;
      this.ctx.closePath();
      this.ctx.stroke();
      this.drawRect();
      this.ctx.restore();
    }
  }
}

export default Star;