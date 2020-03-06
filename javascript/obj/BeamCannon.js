import Vector from "../lib/Vector";

import Beam from "./Beam";
import Particle from "./Particle";
import Explosion from "./Explosion";


const WIDTH = 400;
const LENGTH = 4000;
const KNOCKBACK = 80;
const DAMAGE = 7000;
const DURATION = 120;
// const COLOR = "white";

let particleCb = function () {
  this.r *= 0.7;
  this.pos = this.pos.add(this.vel);
  this.aliveTime--;
  if (this.aliveTime <= 0) this.alive = false;
}

class BeamCannon extends Beam {
  constructor(game, startX, startY, aim, length = LENGTH, width = WIDTH, dmg = DAMAGE, kb = KNOCKBACK) {
    super(game, startX, startY, aim);
    this.width = width;
    this.length = length;
    this.damage = dmg;
    this.knockback = kb;
    this.color = Beam.COLOR().CANNON;
    this.combo = "BEAM";
    this.aliveTime = DURATION;
    this.initialTime = this.aliveTime;
    this.bomb = true;

    this.cb = function () {
      if (this.width < 4) {
        this.width *= 0.97;
      } else {
        this.width *= 0.75;
      }

      if (this.aliveTime < this.initialTime - 40) {
        let offset = Math.random();
        let particle = new Particle(
          this.game,
          this.pos.x + this.aim.x * offset * 2000,
          this.pos.y + this.aim.y * offset * 2000,
          this.aim.dup().multiply(2),
        );
        particle.r = Math.random() * 1.5;
        particle.aliveTime = 20;
        particle.active = false;
        particle.cb = particleCb;
        particle.color = "white";
        this.game.vanity.push(particle);
      }
    }
    let explosion = new Explosion(game, this.pos.x, this.pos.y);
    explosion.aliveTime -= 16;
    explosion.color = "white"; 
    explosion.r = this.width / 2;
    game.particles.push(explosion);
  }
}

export default BeamCannon;