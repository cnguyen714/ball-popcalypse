import Vector from "../lib/Vector";
import EnemyCircle from "./EnemyCircle";
import Explosion from "./Explosion";

import Particle from "./Particle";
import DamageNumber from "./DamageNumber";
import SlashSpark from "./SlashSpark";
import EnemyParticle from "./EnemyFireball";
import Trig from "../lib/Trig";
import Emitter from "./Emitter";
import Beam from "./Beam";

const WIDTH = 60;
const LENGTH = 150;
const HITBOX_RATIO = 0.95;
const KNOCKBACK = 90;
const DAMAGE = 20;
const DURATION = 13;

class EnemyBeam extends Beam {
  constructor(game, 
    {
      pos = {x: 200, y: 200 },
      length = LENGTH,
      width = WIDTH,
      aim = new Vector(1, 0),
      combo = 0,
      active = true,
      parent = null,
      color = [70, 30, 30],
      alpha = 0.3,
    }
    ) {
    super(game, {pos});
    this.pos = new Vector(pos.x, pos.y);
    this.length = length;
    this.width = width;
    this.aim = aim;
    this.combo = combo;
    this.active = active;
    this.parent = parent;
    this.color = color;
    this.alpha = alpha;


    // Formula to get the radian angle between the Y axis and a point
    this.angle = Math.atan2(this.aim.y, this.aim.x);
    this.hitRatio = HITBOX_RATIO;
    this.origin = new Vector(this.pos.x);
    this.damage = DAMAGE;
    this.knockback = KNOCKBACK;
    this.aliveTime = DURATION;
    this.initialTime = this.aliveTime;
    this.bomb = false;
    this.direction = 0;
    this.activeTime = 0;
    this.hitFrequency = 4;

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  checkCollision(obj) {
    if (!obj.alive) return; //Don't check collision if object is not alive
    if (!this.active) return;
    if (this.parent && this.parent.hitTarget) return;
    if (obj.noclip >= 0 || obj.invul >= 0) return;
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
      obj.charge += this.damage;
      // obj.invul += 10;
      if(this.parent) this.parent.hitTarget = true;
      let hitSpark = new Emitter(this.game, {
        pos: obj.pos,
        r: 6,
        aim: knockStraight.normalize(),
        aliveTime: 50,
        emitCount: 24,
        emitSpeed: 8,
        fanDegree: 20,
        ejectSpeed: 7,
        decayRate: 0.94,
        impulseVariance: 0.8,
        color: "rgba(255, 0, 0,1)",
        cb: function () { this.vel.y -= 0.10; },
      });
      this.game.vanity.push(hitSpark);

      obj.vel.add(knockStraight.multiply(this.knockback));
      this.game.vanity.push(new DamageNumber(obj, this.damage, {
        size: 30,
        duration: 30,
        velX: this.aim.x * 8,
        type: "ENEMY",
      }));
      this.game.playSoundMany(`${this.game.filePath}/assets/SE_00017.wav`, 0.10);
      if (obj.health <= 0) {
        obj.alive = false;
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