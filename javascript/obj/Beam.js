import Vector from "../lib/Vector";
import Trig from "../lib/Trig";
import EnemyCircle from "./EnemyCircle";
import Explosion from "./Explosion";

import Particle from "./Particle";
import DamageNumber from "./DamageNumber";
import SlashSpark from "./SlashSpark";
import EnemyParticle from "./EnemyFireball";
import Emitter from "./Emitter";

const WIDTH = 60;
const LENGTH = 150;
const HITBOX_RATIO = 0.95;
const KNOCKBACK = 10;
const DAMAGE = 80;
const DURATION = 13;
// const COLOR = "white";

class Beam extends Particle {
  static COLOR() {
    return {
      NORMAL: [255, 255, 255],
      CRIT: [255, 165, 0],
      CANNON: [255, 0, 0],
      PLAYER: [13, 115, 119],
      FADE: [230, 230, 230],
      TEAL: [0, 205, 205],
      AQUA: [0, 160, 170],
    }
  }

  constructor(game, 
    {
      pos = { x: 100, y: 100 },
      aim = new Vector(1, 0),
      combo = 0,
      active = true,
      length = LENGTH,
      width = WIDTH,
      aliveTime = DURATION,
      initialTime = aliveTime,
      knockback = KNOCKBACK,
      damage = DAMAGE,
      hitRatio = HITBOX_RATIO,
      direction = 0,
      color = Beam.COLOR().NORMAL,
      alpha = 0.9,
      activeTime = 0,
      hitFrequency = 4,
    }
    ) {
    super(game, pos.x, pos.y);

    this.pos = new Vector(pos.x, pos.y);
    this.aim = aim;
    this.combo = combo;
    this.active = active;
    this.length = length;
    this.width = width;
    this.aliveTime = aliveTime;
    this.initialTime = initialTime;
    this.knockback = knockback;
    this.damage = damage;
    this.hitRatio = hitRatio;
    this.direction = direction;
    this.color = color;
    this.alpha = alpha;
    this.activeTime = activeTime;
    this.hitFrequency = hitFrequency;


    // Formula to get the radian angle between the Y axis and a point
    this.angle = Math.atan2(this.aim.y, this.aim.x);
    this.origin = new Vector(this.pos.x);
    this.bomb = false;

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }


  checkCollision(obj) {
    if (!obj.alive) return; //Don't check collision if object is not alive
    if (!this.active) return;

    if(!this.hitWidth) this.hitWidth = this.width * this.hitRatio;
    if(!this.hitLength) this.hitLength = this.length * this.hitRatio;

    if (obj instanceof EnemyCircle || (this.bomb ? obj instanceof EnemyParticle : false)) {

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
      // if ( 
      //   x2 + obj.r >= 0 &&
      //   x2 - obj.r <= 0 + this.hitLength &&
      //   y2 + obj.r >= 0 - this.hitWidth / 2 &&
      //   y2 - obj.r <= 0 + this.hitWidth / 2
      // ) {
      // debugger
      if ( Vector.difference(new Vector(x2, y2), 
                             new Vector(Math.max(Math.min(this.hitLength, x2), 0), 
                                        Math.max(Math.min(this.hitWidth / 2,  y2), -this.hitWidth / 2))).length() <= obj.r 
      ) {
        diff = new Vector(1,0);
        let x = diff.x * Math.cos(this.angle) - diff.y * Math.sin(this.angle);
        let y = diff.y * Math.cos(this.angle) + diff.x * Math.sin(this.angle);
        let knockStraight = new Vector(x, y);
        
        obj.health -= this.activeTime === 0 ? this.damage : this.damage / this.activeTime * this.hitFrequency;
        if (obj.health <= 0) {
          obj.alive = false;
        } else if (!this.silenced) {
          if (this.combo === this.game.player.maxSlashCombo) {
            this.game.playSoundMany(`${this.game.filePath}/assets/SE_00017.wav`, 0.02);
          } else {
            this.game.playSoundMany(`${this.game.filePath}/assets/SE_00017.wav`, 0.06);
          }
        }

        switch (this.combo) {
          case this.game.player.maxSlashCombo:
            this.game.vanity.push(new SlashSpark(this.game, obj.pos.x - 50 + Math.random() * 100, obj.pos.y - 50 + Math.random() * 100, this.combo, Math.random() * 4, 30 + Math.random() * 70));
            this.game.vanity.push(new SlashSpark(this.game, obj.pos.x - 50 + Math.random() * 100, obj.pos.y - 50 + Math.random() * 100, this.combo, Math.random() * 4, 30 + Math.random() * 70));
            obj.vel.add(knockStraight.multiply(-this.knockback));

            break;
          case "BEAM":
            this.game.vanity.push(new SlashSpark(this.game, obj.pos.x, obj.pos.y, 0, 2, 40));
            this.game.vanity.push(new SlashSpark(this.game, obj.pos.x, obj.pos.y, 0, 3, 60));

            let explosionB = new Explosion(this.game, obj.pos.x, obj.pos.y, 30);
            explosionB.aliveTime = 1;
            this.game.vanity.push(explosionB);
            obj.vel.add(knockStraight.multiply(this.aliveTime >= this.initialTime ? this.knockback : this.knockback / 10));

            let hitImpactBeam = new Emitter(this.game, {
              pos: { x: obj.pos.x, y: obj.pos.y },
              r: 8,
              aim: Trig.rotateByDegree(this.aim.dup(), -90 * this.direction),
              emitCount: 3,
              emitSpeed: 1,
              ejectSpeed: 9,
              impulseVariance: 0.25,
              fanDegree: 10,
              aliveTime: 30,
            });

            this.game.vanity.push(hitImpactBeam);
            break;
          case "FINISHER":
            this.game.vanity.push(new SlashSpark(this.game, obj.pos.x, obj.pos.y, this.combo, 15, 150, 50));
            this.game.vanity.push(new SlashSpark(this.game, obj.pos.x, obj.pos.y, 0, 4, 40));
            this.game.vanity.push(new SlashSpark(this.game, obj.pos.x, obj.pos.y, 0, 4, 60));
            let explosionF = new Explosion(this.game, obj.pos.x, obj.pos.y, 50);
            explosionF.aliveTime = 3;
            this.game.vanity.push(explosionF);
            obj.vel.add(knockStraight.multiply(this.knockback));
            obj.pos.add(knockStraight);

            let hitImpactFin = new Emitter(this.game, {
              pos: { x: obj.pos.x, y: obj.pos.y },
              r: 10,
              aim: Trig.rotateByDegree(this.aim.dup(), -90 * this.direction),
              emitCount: 4,
              emitSpeed: 2,
              ejectSpeed: 12,
              impulseVariance: 0.4,
              fanDegree: 20,
              aliveTime: 30,
            });

            this.game.vanity.push(hitImpactFin);
            break;
          // case "CHARGE":
          //   // this.game.vanity.push(new SlashSpark(this.game, obj.pos.x, obj.pos.y, this.combo, 12, 150, 50, Trig.getAngle(Trig.rotateByDegree(Vector.difference(obj.pos, this.game.player.pos), 90))));
          //   let loc = Trig.rotateByDegree(Vector.difference(this.game.player.pos, obj.pos), 0);
          //   let angle = Math.atan2(-loc.x, loc.y);
          //   // console.log(loc);
          //   console.log(angle / Math.PI * 180);
          //   this.game.vanity.push(new SlashSpark(this.game, obj.pos.x, obj.pos.y, this.combo, 12, 150, 50, angle ));
          //   this.game.vanity.push(new SlashSpark(this.game, obj.pos.x, obj.pos.y, 0, 4, 40));
          //   this.game.vanity.push(new SlashSpark(this.game, obj.pos.x, obj.pos.y, 0, 4, 60));
          //   let explosionC = new Explosion(this.game, obj.pos.x, obj.pos.y, 50);
          //   explosionC.aliveTime = 3;
          //   this.game.vanity.push(explosionC);
            
          //   obj.vel.add(knockStraight.multiply(this.knockback));
          //   obj.pos.add(knockStraight);

          //   let hitQuickdraw = new Emitter(this.game, {
          //     pos: { x: obj.pos.x, y: obj.pos.y },
          //     r: 11,
          //     aim: Trig.rotateByDegree(this.aim.dup(), -90 * this.direction),
          //     emitCount: 4,
          //     emitSpeed: 2,
          //     ejectSpeed: 14,
          //     impulseVariance: 0.4,
          //     fanDegree: 20,
          //     aliveTime: 30,
          //   });

          //   this.game.vanity.push(hitQuickdraw);
          //   break;
          default:
            this.game.vanity.push(new SlashSpark(this.game, obj.pos.x, obj.pos.y, this.combo, 3, 40));
            this.game.vanity.push(new SlashSpark(this.game, obj.pos.x, obj.pos.y, this.combo, 3, 40));
            this.game.vanity.push(new SlashSpark(this.game, obj.pos.x, obj.pos.y, this.combo, 3, 60));
            this.game.vanity.push(new SlashSpark(this.game, obj.pos.x, obj.pos.y, this.combo, 7, 90, 40));
            let explosion = new Explosion(this.game, obj.pos.x, obj.pos.y, 40);
            explosion.aliveTime = 4;
            this.game.vanity.push(explosion);
            obj.vel.add(knockStraight.multiply(this.knockback));

            let hitImpact = new Emitter(this.game, {
              pos: { x: obj.pos.x, y: obj.pos.y },
              r: 8,
              aim: Trig.rotateByDegree(this.aim.dup(), -90 * this.direction),
              emitCount: 3,
              emitSpeed: 1,
              ejectSpeed: 6,
              impulseVariance: 0.3,
              decayRate: 0.85,
              fanDegree: 10,
              aliveTime: 20,
            });

            this.game.vanity.push(hitImpact);
            break;
        }
      }
    }    
  }

  drawRect() {
    // Offset the rect based on its width but maintain origin
    this.ctx.save();
    this.ctx.translate(this.pos.x + Math.sin(this.angle) * this.width / 2,
                       this.pos.y - Math.cos(this.angle) * this.width / 2);
    this.ctx.rotate(this.angle);
    this.ctx.fillRect(0, 0, this.length, this.width * 1.1);
    this.ctx.restore();
  }

  update() {
    if (!this.alive) return; //Don't check collision if object is not alive

    
    if (this.aliveTime + this.activeTime >= this.initialTime && this.active === true) {
      if (this.activeTime === 0 || this.aliveTime >= this.initialTime || this.game.loopCount % this.hitFrequency === 0) {
        this.game.entities.forEach(entity => { this.checkCollision(entity) });
        if(this.combo === "BEAM") {
          this.game.enemyParticles.forEach(entity => { this.checkCollision(entity) });
        }
      }
    }

    if (this.aliveTime <= 0) {
      this.alive = false;
    }
    this.aliveTime--;
    this.cb();
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    if (this.aliveTime > this.initialTime - 6) {
      this.ctx.save();
      this.ctx.beginPath();
      let color = this.color;
      // let gradient = this.ctx.createLinearGradient(0, 0, this.length, this.width * 1.1);
      // gradient.addColorStop(0.0, `rgba(${color[0]},${color[1]},${color[2]},.9)`);
      // gradient.addColorStop(0.9, `rgba(${color[0]},${color[1]},${color[2]},.9)`);
      // gradient.addColorStop(0.95, `rgba(${color[0]},${color[1]},${color[2]},.1)`);
      // gradient.addColorStop(1.0, `rgba(${color[0]},${color[1]},${color[2]},0)`);
      // this.ctx.fillStyle = gradient;
      // this.ctx.shadowColor = gradient;
      this.ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${this.alpha})`;
      this.ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${this.alpha})`;
      // this.ctx.shadowColor = `rgba(${color[0]},${color[1]},${color[2]},${this.alpha})`;
      // this.ctx.shadowBlur = 30;
      this.ctx.closePath();
      this.ctx.stroke();

      // this.ctx.shadowColor = color;
      // this.ctx.strokeStyle = "black";

      this.drawRect();

      this.ctx.restore();
    } else {
      this.ctx.save();

      let color = Beam.COLOR().FADE;
      this.ctx.beginPath();

      // let gradient = this.ctx.createLinearGradient(0, 0, this.length, this.width * 1.1);
      // gradient.addColorStop(0.0, `rgba(${color[0]},${color[1]},${color[2]},${(this.aliveTime + 3) / (this.initialTime - 6)})`);
      // gradient.addColorStop(0.9, `rgba(${color[0]},${color[1]},${color[2]},${(this.aliveTime + 3) / (this.initialTime - 6)})`);
      // gradient.addColorStop(1.0, `rgba(${color[0]},${color[1]},${color[2]},0)`);
      // this.ctx.fillStyle = gradient;
      // this.ctx.shadowColor = gradient;
      this.ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]}, ${Math.pow((this.aliveTime + 3) / (this.initialTime - 6), 3) * this.alpha})`;
      // this.ctx.shadowColor = `rgba(${color[0]},${color[1]},${color[2]}, ${Math.pow((this.aliveTime + 3) / (this.initialTime - 6), 3) * this.alpha})`;
      // this.ctx.shadowBlur = 50;
      this.ctx.closePath();
      this.ctx.stroke();

      this.drawRect();

      this.ctx.restore();

    }
  }
}

export default Beam;