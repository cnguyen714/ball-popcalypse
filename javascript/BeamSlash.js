import Vector from "./Vector";
import EnemyCircle from "./EnemyCircle";
import Explosion from "./Explosion";

import Particle from "./Particle";
import Beam from "./Beam";

const WIDTH = 50;
const LENGTH = 200;
const KNOCKBACK = 10;
const DAMAGE = 80;
const DURATION = 60;
const ARC_DEGREE_RATE = 2;
const START_OFFSET_DEGREE = ARC_DEGREE_RATE * (DURATION / 2);
const DIRECTION = {
  CCW: -1,
  CW: 1,
}
// const COLOR = "white";

//
// Beam factory that creates a new Beams in an arc over a duration
//
class BeamSlash extends Particle {
  constructor(game, startX = 0, startY = 0) {
    super(game);
    this.pos = new Vector(startX, startY);
    this.owner = this.game.player;
    this.width = WIDTH;
    this.length = LENGTH;
    this.aliveTime = DURATION;
    this.arcRate = ARC_RATE;
    this.directions = DIRECTION;
    this.direction = DIRECTION.CW;
    this.active = false;

    this.aim = this.game.player.aim;
  }

  checkCollision(obj) {
    // BeamSlash does not check collision
  }

  update() {
    if (!this.alive) return; 

    this.pos.x = this.owner.pos.x;
    this.pos.y = this.owner.pos.y;

    let p = new Beam(this.game, this.pos.x, this.pos.y);
    p.color = player.color;
    p.aim = this.aim;

    this.game.particles.push(p);

    if (this.aliveTime <= 0) {
      this.alive = false;
    }
    this.aliveTime--;
    this.cb();
  }

  draw() {
    // BeamSlash does not have any drawn elements
  }
}

export default Beam;