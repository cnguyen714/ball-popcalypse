import Vector from "../lib/Vector";
import GameObject from "./GameObject";
import Sparkle from "./Sparkle";
import Trig from "../lib/Trig";

const RADIUS = 1;

class Emitter extends GameObject {
  constructor(
    game,
    {
      coords = {x: 0, y: 0},
      r = RADIUS,
      cb = () => { },
      vel = new Vector(0, 0),
      aim = new Vector(0, 0),
      emittee = Sparkle,
      emitCount = 5,
      emitSpeed = emitCount,
      aliveTime = 20,
      fanDegree = 35,
      ejectMultiplier = 6,
      impulseVariance = 0.2,
      color = "white",
    }
  ) {
    super(game);
    this.pos = new Vector(coords.x, coords.y);
    this.vel = vel;
    this.aim = aim;
    this.r = r;
    this.cb = cb;
    this.aliveTime = aliveTime,
    this.emittee = emittee;
    this.emitCount = emitCount;
    this.emitSpeed = emitSpeed;
    this.fanDegree = fanDegree;
    this.ejectMultiplier = ejectMultiplier;
    this.impulseVariance = impulseVariance;
    this.active = true;
    this.color = color;

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  validatePosition(rectX, rectY) {
    if (this.pos.x > rectX + this.r
      || this.pos.x < 0 - this.r
      || this.pos.y > rectY + this.r
      || this.pos.y < 0 - this.r) {
      this.alive = false;
    };
  }

  checkCollision(obj) {
    return;
  }

  update() {
    if (!this.alive) return; //Don't check collision if object is not alive
    if (!this.active) return;

    for (let i = 0; i < this.emitSpeed; i++) {
      let dir = this.aim.dup().normalize();
      dir = Trig.rotateByDegree(dir, -1 * this.fanDegree + Math.random() * this.fanDegree * 2);
      dir = dir.multiply(this.ejectMultiplier);
      dir = dir.multiply(1 - this.impulseVariance + Math.random() * this.impulseVariance * 2);
      let p = new this.emittee(this.game, {
        coords: {x: this.pos.x, y: this.pos.y}, 
        vel: dir,
        r: this.r * Math.random() * 1.3,
        aliveTime: this.aliveTime,
        color: this.color,
      })

      this.game.vanity.push(p);
    }
    
    this.emitCount -= this.emitSpeed;
    if(this.emitCount <= 0) this.alive = false;

    this.addVelocityTimeDelta();
    this.validatePosition(this.cvs.width, this.cvs.height);
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    return;
  }
}

export default Emitter;