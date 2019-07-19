import Vector from "./Vector";
import EnemyCircle from "./EnemyCircle";
import GameObject from "./GameObject";

const RADIUS = 2;
const KNOCKBACK = 20;
const DAMAGE = 50;

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

  checkCollision (obj) {
    if (!obj.alive) return; //Don't check collision if object is not alive
    let diff = Vector.difference(this.pos, obj.pos);
    let distSqr = diff.dot(diff);
    if (obj instanceof EnemyCircle) {
      if (this.r * this.r + obj.r * obj.r > distSqr) {
        this.alive = false;
        this.vel.normalize();
        this.vel.multiply(KNOCKBACK);
        obj.vel.add(this.vel);
        obj.health -= DAMAGE;
        if (obj.health <= 0) obj.alive = false;
      }
    }
  }

  update() {
    this.cb();
    this.addVelocityTimeDelta();
    this.game.entities.forEach(entity => { this.checkCollision(entity) });
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