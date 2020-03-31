import Vector from "../lib/Vector";
import EnemyCircle from "./EnemyCircle";
import Explosion from "./Explosion";

import Particle from "./Particle";
import Beam from "./Beam";

const WIDTH = 52;
const LENGTH = 150;
const KNOCKBACK = 10;
const DAMAGE = 300;
const DURATION = 7;
const ARC_DEGREE_RATE = 20;
const DERVISH_KB_RATE = 0.1;
const OFFSET = 15;
const DIRECTION = {
  CCW: -1,
  CW: 1,
}
// const COLOR = "white";

//
// Beam factory that creates a new Beams in an arc over a duration
//
class BeamSlash extends Particle {
  constructor(game, 
      combo, 
      addOffset = 0,
      width = WIDTH,
      length = LENGTH) {
    super(game);
    this.owner = this.game.player;
    this.pos = new Vector(this.owner.pos.x, this.owner.pos.y);
    this.color = Beam.COLOR().AQUA;
    this.width = width;
    this.length = length;
    this.damage = DAMAGE;
    this.aliveTime = DURATION;
    this.directions = DIRECTION;
    this.direction = DIRECTION.CW;
    this.active = false;
    this.arcRate = ARC_DEGREE_RATE * Math.PI / 180;
    this.combo = combo;
    this.knockback = KNOCKBACK;


    switch(this.combo) {
      case this.game.player.maxSlashCombo:
        this.direction = DIRECTION.CCW;
        this.arcRate = (ARC_DEGREE_RATE) * Math.PI / 180 * 0.75;
        this.aliveTime *= 11;
        this.length *= 0.60;
        this.width *= 0.60;
        this.knockback *= DERVISH_KB_RATE;
        this.damage /= 14;
        break;
      case 0:
        this.knockback *= 1.2;
        break;
      case "FINISHER":
        this.arcRate = (ARC_DEGREE_RATE * 1.1) * Math.PI / 180; 
        this.damage = this.damage * 2.5;
        this.color = Beam.COLOR().CRIT;;
        this.knockback = this.knockback * 1.4;
        this.aliveTime += 2;
        this.length += 60;
        this.width += 30;
        this.game.player.invul = 7;
        break;
      case 1:
        this.direction = DIRECTION.CCW;
        this.aliveTime += 1;
        this.damage *= 1.2;
        this.length *= 1.2;
        this.width *= 1.25;
        break;
      case 2:
        this.aliveTime += 1;
        this.damage *= 1.2;
        this.length *= 1.2;
        this.width *= 1.25;
        break;
      default:
          break;
    }

    this.startOffsetDegree = -addOffset + ARC_DEGREE_RATE * (this.aliveTime / 4);


    this.aim = this.owner.aim;
    let angle = this.startOffsetDegree * Math.PI / 180 * this.direction;
    angle += this.direction * 40 * Math.PI / 180;
    let newAim = this.aim.dup();
    newAim.multiply(1, -1);

    let x2 = newAim.x * Math.cos(angle) - newAim.y * Math.sin(angle);
    let y2 = newAim.y * Math.cos(angle) + newAim.x * Math.sin(angle);
    this.aim = new Vector(-x2, -y2);
  }

  iterBeamArc() {
    let arcRate = this.arcRate * this.direction;
    let newAim = this.aim.dup();
    newAim.multiply(1, -1);

    let x2 = newAim.x * Math.cos(arcRate) - newAim.y * Math.sin(arcRate);
    let y2 = newAim.y * Math.cos(arcRate) + newAim.x * Math.sin(arcRate);
    this.aim = new Vector(x2, y2).normalize();

    if (this.combo === -1) {
      this.length += 5;
      this.width += 5;
    } else if (this.combo === 3) {
      this.pos.x = this.owner.pos.x;
      this.pos.y = this.owner.pos.y;
      this.length *= 0.997;
    } else {
      // this.length -= 2;
      this.length *= 0.997;

    }
    let p = new Beam(this.game, this.pos.x + this.aim.x * OFFSET, this.pos.y + this.aim.y * OFFSET, this.aim, this.combo);
    p.color = this.color;
    p.length = this.length;
    p.width = this.width;
    p.damage = this.damage;
    p.knockback = this.knockback;
    p.direction = this.direction;
    this.game.particles.push(p);
  }

  checkCollision(obj) {
    // BeamSlash does not check collision
  }

  update() {
    if (!this.alive) return; 

    // this.pos.x = this.owner.pos.x;
    // this.pos.y = this.owner.pos.y;

    
    this.iterBeamArc();
    if (this.combo === "FINISHER" || this.combo === 0) {
      this.iterBeamArc();
      this.aliveTime--;
    }
    if (this.combo === this.game.player.maxSlashCombo) {
      this.iterBeamArc();
      this.iterBeamArc();
      this.aliveTime--;
    }

    if (this.aliveTime <= 0) {
      this.alive = false;

      // combo finisher
      if (this.combo === this.game.player.maxSlashCombo) {
        this.game.playSoundMany(`${this.game.filePath}/assets/SE_00064.wav`, 0.22);
        this.game.particles.push(new BeamSlash(this.game, "FINISHER", 40));
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