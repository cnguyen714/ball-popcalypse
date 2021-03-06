import Vector from "../lib/Vector";
import GameObject from "./GameObject";
import Sparkle from "./Sparkle";
import Trig from "../lib/Trig";

class Emitter extends GameObject {
  constructor(game,
    {
      pos = {x: 0, y: 0},
      r = 1,
      width = 0,
      lengthForward = 0,
      forwardOffset = 0,
      cb = () => { },
      vel = new Vector(0, 0),
      aim = new Vector(1, 0),
      emittee = Sparkle,
      emitCount = 5,
      emitSpeed = emitCount,
      aliveTime = 20,
      fanDegree = 180,
      ejectSpeed = 4,
      decayRate = 0.8,
      impulseVariance = 0.9,
      color = "white",
      emitAngle = 0,
    }
  ) {
    super(game);
    this.pos = new Vector(pos.x, pos.y);
    this.vel = vel;
    this.aim = aim;
    this.r = r;
    this.width = width;
    this.lengthForward = lengthForward;
    this.forwardOffset = forwardOffset;
    this.cb = cb;
    this.aliveTime = aliveTime,
    this.emittee = emittee;
    this.emitCount = emitCount;
    this.emitSpeed = emitSpeed;
    this.fanDegree = fanDegree;
    this.ejectSpeed = ejectSpeed;
    this.decayRate = decayRate;
    this.impulseVariance = impulseVariance;
    this.active = true;
    this.color = color;
    this.emitAngle = emitAngle;

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  // Remove obj if out of view
  validatePosition(rectX, rectY) {
    if (this.pos.x > rectX + this.r
      || this.pos.x < 0 - this.r
      || this.pos.y > rectY + this.r
      || this.pos.y < 0 - this.r) {
      this.alive = false;
    };
  }

  // Emitter doesn't collide
  checkCollision(obj) {
    return;
  }

  update() {
    if (!this.alive) return; 
    if (!this.active) return;

    for (let i = 0; i < this.emitSpeed; i++) {
      let dir = this.aim.dup().normalize();
      dir = Trig.rotateByDegree(dir, -1 * this.fanDegree + Math.random() * this.fanDegree * 2);
      dir = dir.multiply(this.ejectSpeed);
      dir = dir.multiply(1 - this.impulseVariance + Math.random() * this.impulseVariance * 2);

      let angle = new Vector();
      let adjust = new Vector();
      let offset = 0;
      if (this.width > 0) {
        offset = Math.random() * this.width;
        angle = dir.dup().normalize();
        angle = Trig.rotateByDegree(angle, 90);
        adjust = angle.dup().multiply(-this.width / 2);
        angle = angle.multiply(offset);
      }

      let forwardVariance = new Vector();
      if(this.lengthForward > 0) {
        forwardVariance = dir.dup().normalize().multiply(Math.random() * this.lengthForward + this.forwardOffset);
      }

      let posX = this.pos.x + adjust.x + angle.x - forwardVariance.x * 0.25 + forwardVariance.x;
      let posY = this.pos.y + adjust.y + angle.y - forwardVariance.y * 0.25 + forwardVariance.y
      let p = new this.emittee(this.game, {
        pos: { 
          x: posX, 
          y: posY,
        }, 
        aim: Vector.difference(new Vector(posX, posY), this.pos).normalize(),
        vel: Trig.rotateByDegree(dir, this.emitAngle),
        r: this.r * Math.random() * 1.3,
        aliveTime: this.aliveTime,
        color: this.color,
        decayRate: this.decayRate,
        cb: this.cb,
      });

      this.game.vanity.push(p);
    }
    
    this.emitCount -= this.emitSpeed;
    if(this.emitCount <= 0) this.alive = false;

    this.addVelocityTimeDelta();
    this.validatePosition(this.cvs.width, this.cvs.height);
  }

  // Emitter doesn't draw anything
  draw() {
    return;
  }
}

export default Emitter;