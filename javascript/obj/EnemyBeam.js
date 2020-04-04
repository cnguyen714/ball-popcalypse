import Vector from "../lib/Vector";
import EnemyCircle from "./EnemyCircle";
import Explosion from "./Explosion";

import Particle from "./Particle";
import DamageNumber from "./DamageNumber";
import SlashSpark from "./SlashSpark";
import EnemyParticle from "./EnemyParticle";
import Trig from "../lib/Trig";
import Emitter from "./Emitter";
import Beam from "./Beam";

const WIDTH = 60;
const LENGTH = 150;
const HITBOX_RATIO = 0.95;
const KNOCKBACK = 10;
const DAMAGE = 80;
const DURATION = 13;

class EnemyBeam extends Beam {
  constructor(game, 
    {
      coords = {x = 100, y = 100},
      length = LENGTH, 
      width = WIDTH,
      aim, 
      combo = 0, 
      active = true,
      parent = null,
    }
    ) {
    super(game, coords.x, coords.y);
    this.aim = aim || this.game.player.aim.dup();
    this.combo = combo || 0;

    // Formula to get the radian angle between the Y axis and a point
    this.angle = Math.atan2(this.aim.y, this.aim.x);

    this.width = width;
    this.length = length;
    this.hitRatio = HITBOX_RATIO;
    this.origin = new Vector(this.pos.x);
    this.damage = DAMAGE;
    this.knockback = KNOCKBACK;
    this.aliveTime = DURATION;
    this.active = active;
    this.initialTime = this.aliveTime;
    this.bomb = false;
    this.direction = 0;
    this.activeTime = 0;
    this.hitFrequency = 4;
    this.color = [200, 30, 30];
    this.alpha = 0.9;
    this.parent = parent;

    this.color = Beam.COLOR().NORMAL;

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }


  checkCollision(obj) {
    if (!obj.alive) return; //Don't check collision if object is not alive
    if (!this.active) return;
    if (this.parent && this.parent.hitTarget) return;

    if (!this.hitWidth) this.hitWidth = this.width * this.hitRatio;
    if (!this.hitLength) this.hitLength = this.length * this.hitRatio;

    let x = this.pos.x;
    let y = this.pos.y;

    // === Infinite linear collision detection ===
    // let dist = Math.abs(this.aim.x * diff.y - this.aim.y * diff.x) / this.aim.length();
    // if (this.width / 2 + obj.r > dist) {
    // =============

    // === Translate positions to unrotated box, then box collision
    // Invert Y axis because canvas uses Y axis pointing down, and most cartesian
    // calculations are using Y axis up
    // --------------
    // calculate obj's relative position to beam origin
    // x′ = xcosθ − ysinθ      
    // y′ = ycosθ + xsinθ

    // Get the obj relative position to beam origin pos
    let diff = Vector.difference(new Vector(obj.pos.x, -obj.pos.y), new Vector(x, -y));

    let x2 = diff.x * Math.cos(this.angle) - diff.y * Math.sin(this.angle);
    let y2 = diff.y * Math.cos(this.angle) + diff.x * Math.sin(this.angle);

    // Collision using obj as a box,
    // Use LENGTH > HIT_LENGTH to hide inaccuracy of hitbox
    if (
      x2 + obj.r >= 0 &&
      x2 - obj.r <= 0 + this.hitLength &&
      y2 + obj.r >= 0 - this.hitWidth / 2 &&
      y2 - obj.r <= 0 + this.hitWidth / 2
    ) {
      diff = new Vector(1, 0);
      let x = diff.x * Math.cos(this.angle) - diff.y * Math.sin(this.angle);
      let y = diff.y * Math.cos(this.angle) + diff.x * Math.sin(this.angle);
      let knockStraight = new Vector(x, y);

      obj.health -= this.damage;
      if(this.parent) this.parent.hitTarget = true;
      if (obj.health <= 0) {
        obj.alive = false;

        this.game.playSoundMany(`${this.game.filePath}/assets/SE_00017.wav`, 0.10);
      }
    }
  }

  update() {
    if (!this.alive) return; //Don't check collision if object is not alive

    if (this.aliveTime >= this.initialTime - 2) {
      this.checkCollision(this.game.player);
    }

    if (this.aliveTime <= 0) {
      this.alive = false;
    }
    this.aliveTime--;
    this.cb();
  }
}

export default EnemyBeam;