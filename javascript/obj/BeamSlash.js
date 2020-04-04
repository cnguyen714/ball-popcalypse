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

//
// Beam factory that creates a new Beams in an arc over a duration
//
class BeamSlash extends Particle {
  constructor(game, owner = game.player,
  {
    pos = { x: owner.pos.x, y: owner.pos.y},
    combo = 0,
    beamClass = Beam,
    addOffset = OFFSET,
    width = WIDTH,
    length = LENGTH,
    damage = DAMAGE,
    aliveTime = DURATION,
    direction = DIRECTION.CW,
    active = false,
    arcRate = ARC_DEGREE_RATE * Math.PI / 180,
    iterSpeed = 1,
    kb = KNOCKBACK,
    color = Beam.COLOR().AQUA,
  }
  ) {
    super(game);
    this.owner = owner;
    this.pos = new Vector(pos.x, pos.y);
    this.color = color;
    this.beamClass = beamClass;
    this.width = width;
    this.length = length;
    this.damage = damage;
    this.aliveTime = aliveTime;
    this.directions = DIRECTION;
    this.direction = direction;
    this.active = active;
    this.arcRate = arcRate;
    this.combo = combo;
    this.knockback = kb;
    this.iterSpeed = iterSpeed;

    switch(this.combo) {
      case this.game.player.maxSlashCombo:
        this.direction = DIRECTION.CCW;
        this.arcRate = (ARC_DEGREE_RATE) * Math.PI / 180 * 0.75;
        this.aliveTime *= 11;
        this.length *= 0.60;
        this.width *= 0.60;
        this.knockback *= DERVISH_KB_RATE;
        this.damage /= 14;
        this.iterSpeed = 3;
        break;
      case 0:
        this.knockback *= 1.2;
        this.iterSpeed = 2;
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
        this.iterSpeed = 2;
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
    let p = new this.beamClass(this.game, {
      pos: {x: this.pos.x + this.aim.x * OFFSET, y: this.pos.y + this.aim.y * OFFSET},
      aim: this.aim, 
      combo: this.combo,
      color: this.color,
      length: this.length,
      width: this.width,
      damage: this.damage,
      knockback: this.knockback,
      direction: this.direction,
      parent: this,
    });
    this.game.particles.push(p);
  }

  checkCollision(obj) {
    // BeamSlash does not check collision
  }

  update() {
    if (!this.alive) return; 
    this.cb();

    // this.pos.x = this.owner.pos.x;
    // this.pos.y = this.owner.pos.y;

    for (let i = 0; i < this.iterSpeed; i++) {
      this.iterBeamArc();
      this.aliveTime--;
    }

    if (this.aliveTime <= 0) {
      this.alive = false;

      // combo finisher
      if (this.combo === this.game.player.maxSlashCombo) {
        this.game.playSoundMany(`${this.game.filePath}/assets/SE_00064.wav`, 0.22);
        this.game.particles.push(new BeamSlash(this.game, this.owner, {combo: "FINISHER", addOffset: 40}));
      }
    }
  }

  draw() {
    // BeamSlash does not have any drawn elements
  }
}

export default BeamSlash;