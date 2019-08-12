import Vector from "./Vector";
import EnemyCircle from "./EnemyCircle";
import Explosion from "./Explosion";

import Particle from "./Particle";
import Beam from "./Beam";

const WIDTH = 45;
const LENGTH = 150;
const KNOCKBACK = 10;
const DAMAGE = 200;
const DURATION = 7;
const ARC_DEGREE_RATE = 20;
const DIRECTION = {
  CCW: -1,
  CW: 1,
}
// const COLOR = "white";

//
// Beam factory that creates a new Beams in an arc over a duration
//
class BeamSlash extends Particle {
  constructor(game, combo, addOffset = 0) {
    super(game);
    this.owner = this.game.player;
    this.pos = new Vector(this.owner.pos.x, this.owner.pos.y);
    this.color = this.owner.color;
    this.width = WIDTH;
    this.length = LENGTH;
    this.damage = DAMAGE;
    this.aliveTime = DURATION;
    this.directions = DIRECTION;
    this.direction = DIRECTION.CW;
    this.active = false;
    this.arcRate = ARC_DEGREE_RATE * Math.PI / 180;
    this.combo = combo;
    this.knockback = KNOCKBACK;


    switch(this.combo) {
      case 0:
        break;
      case 1:
        this.direction = DIRECTION.CCW;
        break;
      case 2:
        break;
      case 3:
        this.direction = DIRECTION.CCW;
        this.arcRate = (ARC_DEGREE_RATE + 10) * Math.PI / 180; 
        this.aliveTime *= 2;
        this.length *= 0.6;
        this.knockback /= 2;
        this.damage /= 4
        break;
      default:
          break;
    }

    this.startOffsetDegree = -addOffset + ARC_DEGREE_RATE * (this.aliveTime / 2);


    this.aim = this.owner.aim;
    let angle = this.startOffsetDegree * Math.PI / 180 * this.direction;
    angle += this.direction * 40 * Math.PI / 180;
    let newAim = this.aim.dup();
    newAim.multiply(1, -1);

    let x2 = newAim.x * Math.cos(angle) - newAim.y * Math.sin(angle);
    let y2 = newAim.y * Math.cos(angle) + newAim.x * Math.sin(angle);
    // debugger
    this.aim = new Vector(-x2, -y2);
  }

  checkCollision(obj) {
    // BeamSlash does not check collision
  }

  update() {
    if (!this.alive) return; 

    // this.pos.x = this.owner.pos.x;
    // this.pos.y = this.owner.pos.y;

    
    let arcRate = this.arcRate * this.direction ;
    let newAim = this.aim.dup();
    newAim.multiply(1, -1);
    
    let x2 = newAim.x * Math.cos(arcRate) - newAim.y * Math.sin(arcRate);
    let y2 = newAim.y * Math.cos(arcRate) + newAim.x * Math.sin(arcRate);
    
    // debugger
    this.aim = new Vector(x2, y2);
    
    let p = new Beam(this.game, this.pos.x, this.pos.y, this.aim, this.combo);
    p.color = this.color;
    p.length = this.length;
    p.width = this.width;
    p.damage = this.damage;
    p.knockback = this.knockback;
    if( this.combo === -1) {
      this.length += 5;
      this.width += 5;
    } else if (this.combo === 3) {
      this.pos.x = this.owner.pos.x;
      this.pos.y = this.owner.pos.y;
      this.length -= 2;
    } else {
      this.length -= 2;
    }
    this.game.particles.push(p);

    if (this.aliveTime <= 0) {
      this.alive = false;

      if (this.combo === 3) {
        let slash = new BeamSlash(this.game, -1, 40);
        slash.damage = this.damage * 20;
        slash.color = "orange";
        slash.knockback = this.knockback * 2.5;
        slash.aliveTime += 2;
        slash.length += 30;
        this.game.particles.push(slash);
      }
    }
    this.aliveTime--;
    this.cb();
  }

  draw() {
    // BeamSlash does not have any drawn elements
  }
}

export default BeamSlash;