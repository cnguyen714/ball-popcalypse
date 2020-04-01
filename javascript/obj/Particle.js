import Vector from "../lib/Vector";
import EnemyCircle from "./EnemyCircle";
import GameObject from "./GameObject";
import DamageNumber from "./DamageNumber";
import Slam from "./Slam";
import Emitter from "./Emitter";

const RADIUS = 4;
const KNOCKBACK = 10;
const DAMAGE = 37;
const COLOR = "#14ffec";
const VELOCITY = 10;

class Particle extends GameObject {
  constructor(
    game, 
    startX = 0, 
    startY = 0, 
    vel = new Vector(0,0), 
    cb = () => {} 
  ) {
    super(game);
    this.pos = new Vector(startX, startY);
    this.vel = vel || VELOCITY;
    this.r = RADIUS;
    this.color = COLOR;
    this.damage = DAMAGE;
    this.knockback = KNOCKBACK;
    this.cb = cb;
    this.aliveTime = 600;
    this.active = true;

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

  checkCollision (obj) {
    if (!obj.alive) return; //Don't check collision if object is not alive

    let diff = Vector.difference(this.pos, obj.pos);
    let distSqr = diff.dot(diff);
    if (obj instanceof EnemyCircle) {
      if (this.r * this.r + obj.r * obj.r > distSqr) {
        this.alive = false;
        let kb = this.vel.dup();
        kb.normalize();
        kb.multiply(this.knockback / Math.pow(obj.r / 6, 2));
        obj.vel.add(kb);
        obj.health -= this.damage;
        
        if (obj.health <= 0) {
          obj.alive = false;
          kb.normalize();
          kb.multiply(this.knockback / 2);
          obj.vel.add(kb);
        }

        this.game.vanity.push(new DamageNumber(this, this.damage, 11, 30, this.vel.x));
        // let hitspark = new Slam(this.game, this.pos.x, this.pos.y);
        // hitspark.aliveTime = 4;
        // hitspark.growthRate = 1;
        // hitspark.r = 1;
        // hitspark.damage = 0;
        // this.game.vanity.push(hitspark);

        let hitEmit = new Emitter(game, {
          coords: { x: this.pos.x, y: this.pos.y },
          r: 4,
          aim: this.vel.dup(),
          aliveTime: 20,
          emitCount: 2,
          ejectSpeed: 4,
          impulseVariance: 0.15,
          fanDegree: 10,
        });

        this.game.vanity.push(hitEmit);
      }
    }
  }

  update() {
    if (!this.alive) return; //Don't check collision if object is not alive
    this.cb();
    if(!this.active) return;
    this.addVelocityTimeDelta();
    this.game.entities.forEach(entity => { this.checkCollision(entity) });
    this.validatePosition(this.cvs.width, this.cvs.height);
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    if (!this.alive) return;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    // this.ctx.strokeStyle = this.color;
    // this.ctx.stroke();

    this.ctx.closePath();
    this.ctx.restore();
  }
}

export default Particle;