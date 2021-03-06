
import Vector from "../lib/Vector";
import Trig from "../lib/Trig";
import GameObject from "./GameObject";
import * as EnemyFactory from './factory/enemy_factory';

import { fireBulletAtCursor, fireBulletAtCursorB }from './factory/particle_factory';
import Slam from "./Slam";
import BeamSlash from "./BeamSlash";
import Beam from "./Beam";
import Explosion from "./Explosion";
import Particle from "./Particle";
import SlashSpark from "./SlashSpark";
import DeathExplosion from "./DeathExplosion";
import BeamCannon from "./BeamCannon";
import Emitter from "./Emitter";
import Sparkle from "./Sparkle";
import Star from "./Star";
// import shotSfx from '../assets/laser7.wav';

const PLAYER_RADIUS = 11;
const COLOR = '#0d7377';
const MAX_HEALTH = 250;

const MAX_SPEED = 8;
const MIN_SPEED = 0.1;
const ACCEL = 3;
const DECEL = 0.9;
const SPRINT_SPEED = 8;
const MAX_SPRINT_SPEED = 10;
const DAMPENING_COEFFICIENT = 0.7;
const CLAMP_SPEED = 200;

const DASH_DURATION = 8;
const DASH_COUNT = 2;
const DASH_PATH_DURATION = 13;
const DASH_SPEED = 32;
const DASH_COOLDOWN = 70;
const POST_DASH_INVUL = 2;

const SLASH_COOLDOWN = 9;
const CHARGE_SLASH_TIME = 30;
const MAX_COMBOS = 3;

const CHARGE_COST = 100;
const CHARGING_TIME = 0; // in seconds 
const CHARGE_STACKS = 2;
const CHARGE_COOLDOWN = 40;
const CHARGE_FREEZE = 20;
const SHOOT_COOLDOWN = 10;
const SHOOT_SHOTGUN_PELLETS = 60;

const STATE_WALKING = "STATE_WALKING";
const STATE_DASHING = "STATE_DASHING";

const KEY = {
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  R: 82,
  ENTER: 13,
  UP: 38,
  LEFT: 37,
  DOWN: 40,
  RIGHT: 39,
  SHIFT: 16,
  SPACE: 32,
  MOUSE_LEFT: 10000,
  MOUSE_RIGHT: 10002,
};

const MOUSE = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2,
}

class Player extends GameObject {
  constructor(game) {
    super(game);
    
    this.pos = new Vector(this.cvs.width / 4 + Math.random() * (this.cvs.width / 2),
                          this.cvs.height / 4 + Math.random() * (this.cvs.height / 2));
    this.vel = new Vector();
    this.movement = new Vector();
    this.aim = new Vector();
    this.mousePos = new Vector(this.cvs.width / 2, this.cvs.height / 2);
    this.moveState = STATE_WALKING;
    this.r = PLAYER_RADIUS;
    this.color = COLOR;
    this.invul = 0;
    this.noclip = 0;
    
    this.maxHealth = MAX_HEALTH;
    this.health = this.maxHealth;
    
    this.shootCooldown = 0;
    this.shooting = false;
    this.beamCooldown = 0;
    this.beamCooldownMax = CHARGE_COOLDOWN;
    this.charging = false;
    this.discharged = false;
    this.charge = CHARGE_COST;
    this.chargeCost = CHARGE_COST;
        
    this.slashReset = 0;
    this.slashCharge = 0;
    this.slashChargeNeeded = CHARGE_SLASH_TIME;
    this.slashCombo = 0;
    this.slashCooldown = 0;
    this.maxSlashCombo = MAX_COMBOS;
    
    this.dashing = false;
    this.dashDuration = 0;
    this.dashPathDuration = 0;
    this.dashDirection = new Vector();
    this.dashCooldown = 0;
    this.maxDashCooldown = DASH_COOLDOWN;
    this.velRestoreDash = new Vector(); 
    
    this.keyDown = {
      [KEY.W]: false,
      [KEY.A]: false,
      [KEY.S]: false,
      [KEY.D]: false,
      [KEY.R]: false,
      [KEY.SHIFT]: false,
      [KEY.SPACE]: false,
      [KEY.MOUSE_LEFT]: false,
      [KEY.MOUSE_RIGHT]: false,
    }

    this.setMousePosition = this.setMousePosition.bind(this);
    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  // Store mouse position relative to canvas origin
  setMousePosition(e) {
    var canvasRect = this.cvs.getBoundingClientRect();
    this.mousePos.x = e.clientX - canvasRect.left;
    this.mousePos.y = e.clientY - canvasRect.top;
    // this.setAim();
  }

  heal(num = this.maxHealth) {
    this.health += num;
    this.health = Math.min(this.health, this.maxHealth);
  }

  // Set player's unnormalized aim relative to stored mouse position
  setAim() {
    this.aim = new Vector(this.mousePos.x - this.pos.x, this.mousePos.y - this.pos.y);
  }

  // Dash in a direction for a few frames
  dash() {
    if (this.game.cheat || (!this.dashing && this.dashCooldown <= this.maxDashCooldown / 2)) {
      this.dashing = true;
      if (this.movement.length() === 0) return;
      if (this.moveState !== STATE_DASHING) {
        this.moveState = STATE_DASHING;
        this.invul = Math.max(DASH_DURATION, this.invul);
        this.noclip = Math.max(DASH_DURATION - 1, this.noclip);
        this.dashDuration = DASH_DURATION;
        this.dashPathDuration = DASH_PATH_DURATION;
        this.dashCooldown += this.maxDashCooldown;
        this.dashDirection = this.movement.dup().multiply(DASH_SPEED);

        this.game.vanity.push(new Explosion(this.game, this.pos.x, this.pos.y, this.r * 2, this.movement.dup().multiply(-7), 10, "cyan"));
        let spark = new SlashSpark(this.game, this.pos.x, this.pos.y, "BEAM", 150, 60, 17, Math.PI + Math.atan2(this.movement.y, this.movement.x), 0, true, function () { this.width *= 0.80; this.length *= 1.15 });
        spark.color = [0, 255, 255];
        this.game.vanity.push(spark);
        let cb = function () {
          this.length *= 1.12;
          this.width *= 0.85;
        }
        let angle = Math.random() * Math.PI;
        this.game.vanity.push(new SlashSpark(this.game, this.pos.x, this.pos.y, 0, 20, 40, 8, angle, 0, true, cb));
        this.game.vanity.push(new SlashSpark(this.game, this.pos.x, this.pos.y, 0, 20, 40, 8, angle + Math.PI / 2, 0, true, cb));
        this.game.vanity.push(new SlashSpark(this.game, this.pos.x, this.pos.y, 0, 8, 110, 14, angle + Math.PI / 4, 0, true, cb));
        this.game.vanity.push(new SlashSpark(this.game, this.pos.x, this.pos.y, 0, 8, 110, 14, angle + Math.PI / 4 * 3, 0, true, cb));
        this.game.vanity.push(new Explosion(this.game, this.pos.x, this.pos.y, this.r * 2, new Vector(), 3));

        let p = new Particle(game, this.pos.x, this.pos.y);
        p.color = "green";
        p.aliveTime = 30;
        p.initialTime = 30;
        p.r = this.r;
        p.active = false;
        p.cb = function () {
          this.color = `rgba(0,188,188,${this.aliveTime / this.initialTime})`;
          this.aliveTime--;
          if (this.aliveTime <= 0) this.alive = false;
        }
        this.game.vanity.push(p);
      }
    }
  }

  slash() {
    this.game.playSoundMany(`${this.game.filePath}/assets/SE_00064.wav`, 0.1);
    this.game.particles.push(new BeamSlash(this.game, this, {pos: this.pos, combo: this.slashCombo}));
    if (this.slashCombo === this.maxSlashCombo) {
      this.slashCooldown = SLASH_COOLDOWN + 60;
      this.slashCombo = 0;
      this.shootCooldown = this.slashCooldown - 30;
      this.invul += 40;
      this.noclip += 50;
      // this.pauseTime = 5;
    } else {
      this.slashCooldown = SLASH_COOLDOWN;
      this.shootCooldown = this.slashCooldown + 5;
      this.slashCombo++;
      this.slashReset = SLASH_COOLDOWN * 2;
    }
  }

  chargeSlash() {
    this.slashCombo = 0;
    this.slashCooldown = 30;
    this.shootCooldown = 30;
    this.invul += 10;
    this.dashPathDuration = DASH_PATH_DURATION - 2;
    this.moveState = STATE_DASHING;
    this.dashing = true;
    this.dashDirection = this.aim.dup().normalize().multiply(DASH_SPEED);
    this.dashDuration = 4;
    this.game.playSoundMany(`${this.game.filePath}/assets/SE_00064.wav`, 0.2);
    let beam = new BeamSlash(this.game, this,
      {
        pos: this.pos.dup().add(this.dashDirection.dup().multiply(5)),
        combo: "CHARGE",
        alpha: 0.04,
        centerOffset: Math.max(Math.min(450, Vector.difference(this.pos.dup().add(this.dashDirection.dup().multiply(5)), this.mousePos).length()), 150)
      })
      beam.paused = false;
      beam.unpausable = true;
    this.game.particles.push(beam);
  
    let slashFlash = new Emitter(this.game, {
      pos: { x: this.pos.x, y: this.pos.y },
      r: 7,
      aim: Trig.rotateByDegree(this.aim, 10),
      aliveTime: 40,
      emitCount: 90,
      emitSpeed: 45,
      ejectSpeed: 14,
      impulseVariance: 0.2,
      fanDegree: 60,
      color: "rgba(0, 188, 188, 1)",
      decayRate: 0.8,
      width: 100,
      lengthForward: 30,
      forwardOffset: Math.max(Math.min(600, Vector.difference(this.pos.dup().add(this.dashDirection.dup().multiply(5)), this.mousePos).length() * 1.2), 150) + 150,
      emitAngle: -50,
      cb: function() {
        // this.vel.subtract(this.aim.dup().multiply(0.4));
        // this.vel.y += 0.05;
      }
    });
    this.game.delayedParticles.push(slashFlash);

    let dust = new Emitter(game, {
      pos: { x: this.pos.x, y: this.pos.y },
      r: 8,
      aim: this.aim.dup().multiply(-1),
      aliveTime: 30,
      emitCount: 16,
      emitSpeed: 8,
      ejectSpeed: 16,
      impulseVariance: 0.7,
      fanDegree: 30,
      decayRate: 0.75,
      width: 30,
      color: "white",
      forwardOffset: -200,
      lengthForward: -200,
    });
    this.game.vanity.push(dust);
    let p = new Particle(game, this.pos.x, this.pos.y);
    p.color = "green";
    p.aliveTime = 30;
    p.initialTime = 30;
    p.r = this.r;
    p.active = false;
    p.cb = function () {
      this.color = `rgba(0,188,188,${this.aliveTime / this.initialTime})`;
      this.aliveTime--;
      if (this.aliveTime <= 0) this.alive = false;
    }
    this.game.vanity.push(p);

    let spark = new SlashSpark(this.game, this.pos.x, this.pos.y, "BEAM", 150, 60, 17, Math.PI + Math.atan2(this.aim.y, this.aim.x), 0, true, function () { this.width *= 0.80; this.length *= 1.15 });
    spark.color = [0, 255, 255];
    this.game.vanity.push(spark);
    let cb = function () {
      this.length *= 1.12;
      this.width *= 0.85;
    }
    let angle = Math.random() * Math.PI;
    this.game.vanity.push(new SlashSpark(this.game, this.pos.x, this.pos.y, 0, 20, 40, 8, angle, 0, true, cb));
    this.game.vanity.push(new SlashSpark(this.game, this.pos.x, this.pos.y, 0, 20, 40, 8, angle + Math.PI / 2, 0, true, cb));
    this.game.vanity.push(new SlashSpark(this.game, this.pos.x, this.pos.y, 0, 8, 110, 14, angle + Math.PI / 4, 0, true, cb));
    this.game.vanity.push(new SlashSpark(this.game, this.pos.x, this.pos.y, 0, 8, 110, 14, angle + Math.PI / 4 * 3, 0, true, cb));

    // let beamDrawPos = this.pos.dup().add( Trig.rotateByDegree(new Vector(-200, 50), Trig.getAngle( Vector.difference(this.pos.dup().add(-200, 50), this.mousePos))) );
    // let beamAim = Vector.difference(beamDrawPos, this.mousePos);
    // let beamDraw = new BeamCannon(this.game, beamDrawPos.x, beamDrawPos.y, beamAim);
    // beamDraw.initialTime = 10;
    // beamDraw.aliveTime = 10;
    // beamDraw.initialTime = 10;
    // beamDraw.width = 20;
    // beamDraw.length = 400;
    // beamDraw.color = [0, 188, 188];
    // beamDraw.alpha = 1;
    // beamDraw.paused = false;
    // beamDraw.unpausable = true;
    // beamDraw.silenced = true;
    // beamDraw.active = false;
    // this.game.vanity.push(beamDraw);

    this.game.freeze(4);
  } 

  fireBeam() {
    if (this.charge >= this.chargeCost) {
      let freezeTime = CHARGE_FREEZE;
      this.charge -= this.chargeCost;
      this.beamCooldown = !this.game.cheat ? CHARGE_COOLDOWN : 2;
      this.charging = true;

      this.discharged = true;
      this.invul = 5;

      this.setAim();
      let kb = this.aim.dup().normalize().multiply(-75);
      this.vel.add(kb.dup().multiply(1/2));

      let aim = kb.dup().normalize().multiply(-1);

      this.game.playSoundMany(`${this.game.filePath}/assets/SE_00016.wav`, 0.2);
      let beam = new BeamCannon(this.game, this.pos.x, this.pos.y, aim);
      beam.activeTime = 40;
      beam.damage = 10000;
      beam.knockback = 20;
      beam.width = 120;
      beam.color = Beam.COLOR().TEAL;
      this.game.delayedParticles.push(beam);

      let shootFlash2 = new Emitter(this.game, {
        pos: { x: this.pos.x, y: this.pos.y },
        r: 10,
        aim: this.aim.dup(),
        emittee: Sparkle,
        aliveTime: 60,
        emitCount: 60,
        emitSpeed: 20,
        ejectSpeed: 8,
        impulseVariance: 1,
        fanDegree: 1,
        color: "rgba(0, 188, 188, 1)",
        decayRate: 0.9,
        width: 10,
        lengthForward: 1100,
        cb: function() {
          if (this.aliveTime === this.initialTime - freezeTime + 1) {
            this.vel.add(this.vel.dup().normalize().multiply(20));
          }
        }
      });
      this.game.delayedParticles.push(shootFlash2);

      if (this.game.cheat) {
        beam.width = 60;
        beam.damage = 1500;
        // this.vel.subtract(kb.multiply(0.9));
        freezeTime = 0;
        beam.knockback = 5;
        beam.pos.x += Math.random() * 120 - 60;
        beam.pos.y += Math.random() * 120 - 60;
        // beam = new BeamCannon(this.game, beam.pos.x, beam.pos.y, aim);        
        beam.activeTime = 20  
        return;
      };

      this.game.freeze(freezeTime);

      let sparkCB = function () {
        this.length *= 0.70;
        this.width *= 0.70;
      }

      let baseAngle = Math.floor(Math.random() * 360) * Math.PI / 180;
      let spark1 = new SlashSpark(this.game, this.pos.x, this.pos.y, 0, 70, 2000, 30, baseAngle, Math.PI / 20, false);
      let spark2 = new SlashSpark(this.game, this.pos.x, this.pos.y, 0, 70, 2000, 30, baseAngle + Math.PI / 2, Math.PI / 20, false);
      spark1.cb = sparkCB;
      spark2.cb = sparkCB;
      this.game.vanity.push(spark1);
      this.game.vanity.push(spark2);

      let explosion1 = new Explosion(this.game, this.pos.x, this.pos.y, 100);
      explosion1.aliveTime = 7;
      explosion1.color = "rgba(255,255,255,.1)";
      this.game.vanity.push(explosion1);

      let explosion2 = new Explosion(this.game, this.pos.x, this.pos.y, 150);
      explosion2.aliveTime = 5;
      this.game.vanity.push(explosion2);

      let explosion3 = new Explosion(this.game, this.pos.x, this.pos.y, 100);
      explosion3.color = "rgba(255,50,50,.3)";
      explosion3.aliveTime = 7;
        this.game.vanity.push(explosion3);

      // let beamInvis = new BeamCannon(this.game, this.pos.x, this.pos.y, aim);
      // beamInvis.activeTime = 240;
      // beamInvis.initialTime = 240;
      // beamInvis.aliveTime = 240;
      // beamInvis.damage = 20;
      // beamInvis.knockback = 0;
      // beamInvis.width = 120;
      // beamInvis.length = 100;
      // beamInvis.color = [0, 255, 0];
      // beamInvis.alpha = 0;
      // beamInvis.paused = false;
      // beamInvis.unpausable = true;
      // beamInvis.silenced = true;
      // beamInvis.hitFrequency = 1;
      // beamInvis.hitLength = beamInvis.length;
      // beamInvis.hitWidth = beamInvis.width;
      // beamInvis.cb = function () {
      //   this.pos.add(this.aim.dup().multiply(this.length + 5));
      // }
      // this.game.vanity.push(beamInvis);

      let storeX = this.pos.x;
      let storeY = this.pos.y;
      let storeMouse = this.mousePos.dup();
      setTimeout(function () {
        let aim = Vector.difference(storeMouse, this.pos);
        let beam = new BeamCannon(this.game, this.pos.x, this.pos.y, aim);
        beam.color = Beam.COLOR().CANNON;
        beam.width = 400;
        beam.damage = 1500;
        beam.knockback = 40;
        beam.activeTime = 15;
        this.game.particles.push(beam);

        let shootFlash = new Emitter(this.game, {
          pos: { x: this.pos.x, y: this.pos.y },
          r: 4,
          aim: aim.dup(),
          emittee: Sparkle,
          aliveTime: 80,
          emitCount: 60,
          emitSpeed: 20,
          ejectSpeed: 8,
          impulseVariance: 1.0,
          fanDegree: 15,
          color: "rgba(255, 0, 0, 0.9)",
          decayRate: 1.012,
          width: 350,
          lengthForward: 300,
        });
        this.game.delayedParticles.push(shootFlash);
        this.game.playSoundMany(`${this.game.filePath}/assets/SE_00049.wav`, 0.3);
        let kb = aim.dup().normalize().multiply(-75);
        this.vel.add(kb);
      }.bind(this), this.game.normalTimeDelta * freezeTime + 250);


      setTimeout(function() {
        this.game.playSoundMany(`${this.game.filePath}/assets/SE_00049.wav`, 0.2);
      }, this.game.normalTimeDelta * freezeTime);
    }
  }

  shoot() {
    this.slashCharge = 0;
    if (this.shooting === false) {
      this.game.playSoundMany(`${this.game.filePath}/assets/laser7.wav`, 0.25);
      this.shooting = true;
      this.slashCooldown = 6;
      this.shootCooldown = SHOOT_COOLDOWN;
      
      let beam = new BeamCannon(this.game, this.pos.x, this.pos.y, this.aim, 4000, 50, 210, 10);
      beam.hitRatio = 1.3;
      beam.bomb = false;
      beam.aliveTime = 30;
      beam.initialTime = beam.aliveTime;
      beam.color = Beam.COLOR().TEAL;
      beam.knockback = 5;
      this.game.particles.push(beam);

      let shootFlash = new Emitter(this.game, {
        pos: {x: this.pos.x, y: this.pos.y},
        r: 6,
        aim: this.aim.dup(),
        aliveTime: 20,
        emitCount: 8,
        emitSpeed: 8,
        ejectSpeed: 4,
        impulseVariance: 0.9,
        fanDegree: 80,
        lengthForward: 50,
        color: "rgba(0, 188, 188, 1)",
      });

      this.game.vanity.push(shootFlash);

      let shootFlashThin = new Emitter(this.game, {
        pos: { x: this.pos.x, y: this.pos.y },
        r: 5,
        aim: this.aim.dup(),
        emittee: Sparkle,
        aliveTime: 50,
        emitCount: 20,
        emitSpeed: 10,
        ejectSpeed: 5,
        impulseVariance: 0.9,
        fanDegree: 1,
        color: "rgba(0, 205, 205,1)",
        decayRate: 0.9,
        width: 5,
        lengthForward: 1000,
      });

      this.game.vanity.push(shootFlashThin);
    } else {
      if (this.game.loopCount % 5 === 0) {
        this.game.playSoundMany(`${this.game.filePath}/assets/laser7.wav`, 0.12);
      }
      fireBulletAtCursor(this);
      fireBulletAtCursor(this);
      fireBulletAtCursor(this);
      fireBulletAtCursor(this);
    }
  }

  mountController() {
    document.addEventListener('keydown', (e) => {
      let key = e.keyCode;
      if(key === 8) this.health = 0; // BACKSPACE
      if(key === 187) this.game.difficulty++; //EQUAL
      if(key === 189) this.health += 100; //MINUS
      if(key === 48) { //0
        this.game.cheat = true;
      }
    
      // Ignore keys that have not been bound
      if (!Object.values(KEY).includes(key)) return;
      switch (this.game.state) {
        case this.game.STATE_INIT:
          break;
        case this.game.STATE_BEGIN:
          if (key !== KEY.ENTER && key !== KEY.SPACE) { 
            this.keyDown[key] = true;
            this.game.transitionToStartGame();
          }
          break;
        case this.game.STATE_STARTING:
          this.keyDown[key] = true;
          break;
        case this.game.STATE_RUNNING:
          this.keyDown[key] = true;
          if (key == KEY.DOWN) for (var i = 1; i < 5; i++) this.game.entities.push(EnemyFactory.spawnCircleRandom(this));
          if (key == KEY.UP) this.chargeCost = 0;
          if (key == KEY.RIGHT) this.maxDashCooldown = 20;
          break;
        case this.game.STATE_OVER:
          if (key === KEY.ENTER) this.game.restartGame();
          break;
        default:
          break;
      }
    });

    document.addEventListener('keyup', (e) => {
      let key = e.keyCode;
      if (!Object.values(KEY).includes(key)) return;
      switch (this.game.state) {
        case this.game.STATE_INIT:
          break;
        case this.game.STATE_BEGIN:
          this.keyDown[key] = false;
          break;
        case this.game.STATE_STARTING:
          this.keyDown[key] = false;
          break;
        case this.game.STATE_RUNNING:
          this.keyDown[key] = false;
          break;
        case this.game.STATE_OVER:
          break;
        default:
          break;
      }
    });

    document.onmousemove = (e) => {
      this.setMousePosition(e);
    };

    // Disable right click context menu
    document.addEventListener("contextmenu", (e) => { 
      e.preventDefault();
      return false;
    });

    document.addEventListener("mousedown", (e) => {
      e.preventDefault();
      let clickType = e.button;

      // If the player's mouse is over the audio icon, toggle audio
      if (
        this.mousePos.x >= this.cvs.width - 100 &&
        this.mousePos.x <= this.cvs.width &&
        this.mousePos.y >= 0 &&
        this.mousePos.y <= 100) {
        this.game.mute = !this.game.mute;
        this.game.mute ? this.game.bgm.pause() : this.game.bgm.play();
        return;
      }

      switch (this.game.state) {
        case this.game.STATE_INIT:
          break;
        case this.game.STATE_BEGIN:
          if (
            this.mousePos.x >= 0 &&
            this.mousePos.x <= 100 &&
            this.mousePos.y >= 0 &&
            this.mousePos.y <= 100) {
              window.location.href = "https://www.linkedin.com/in/cdnguyen714/";
              return;
          }
          this.game.transitionToStartGame();
          if (clickType === MOUSE.LEFT) this.keyDown[KEY.MOUSE_LEFT] = true;
          if (clickType === MOUSE.RIGHT) this.keyDown[KEY.MOUSE_RIGHT] = true;
          break;
        case this.game.STATE_STARTING:
          if (clickType === MOUSE.LEFT) this.keyDown[KEY.MOUSE_LEFT] = true;
          if (clickType === MOUSE.RIGHT) this.keyDown[KEY.MOUSE_RIGHT] = true;
          break;
        case this.game.STATE_RUNNING:
          if (clickType === MOUSE.LEFT) this.keyDown[KEY.MOUSE_LEFT] = true;
          if (clickType === MOUSE.RIGHT) this.keyDown[KEY.MOUSE_RIGHT] = true;
          break;
        case this.game.STATE_OVER:
          break;
        default:
          break;
      }
    });

    document.addEventListener("mouseup", (e) => {
      e.preventDefault();
      let clickType = e.button;

      switch (this.game.state) {
        case this.game.STATE_INIT:
          break;
        case this.game.STATE_BEGIN:
          if (clickType === MOUSE.LEFT) this.keyDown[KEY.MOUSE_LEFT] = false;
          if (clickType === MOUSE.RIGHT) this.keyDown[KEY.MOUSE_RIGHT] = false;
          break;
        case this.game.STATE_STARTING:
          if (clickType === MOUSE.LEFT) this.keyDown[KEY.MOUSE_LEFT] = false;
          if (clickType === MOUSE.RIGHT) this.keyDown[KEY.MOUSE_RIGHT] = false;
          break;
        case this.game.STATE_RUNNING:
          if (clickType === MOUSE.LEFT) this.keyDown[KEY.MOUSE_LEFT] = false;
          if (clickType === MOUSE.RIGHT) this.keyDown[KEY.MOUSE_RIGHT] = false;
          break;
        case this.game.STATE_OVER:
          break;
        default:
          break;
      }
    });
  }

  dampSpeed() {
    if(this.dashing) return;
    let vel = this.vel.length();
    if(vel > CLAMP_SPEED) {
      this.vel.normalize().multiply(CLAMP_SPEED);
    }
    if (vel > MAX_SPEED) {
      this.vel.multiply(DAMPENING_COEFFICIENT);
    }
  }

  applyDecel() {
    if(this.keyDown[KEY.W]) return;
    if(this.keyDown[KEY.A]) return;
    if(this.keyDown[KEY.S]) return;
    if(this.keyDown[KEY.D]) return;
    let result = this.vel.multiply(DECEL);
    if (result.x < MIN_SPEED || result.x > -1 * MIN_SPEED) result.x = 0; 
    if (result.y < MIN_SPEED || result.y > -1 * MIN_SPEED) result.y = 0; 
    this.vel = result;
  }

  update() {
    // if player is dead, simplify update loop
    if (!this.alive) {
      this.dampSpeed();
      this.addVelocityTimeDelta();
      this.applyDecel();
      this.validateBound(this.cvs.width, this.cvs.height);
      return;
    }

    if (this.game.cheat) {
      if (this.dashCooldown > DASH_DURATION) this.dashCooldown = DASH_DURATION;
      this.maxDashCooldown = DASH_DURATION;
      this.chargeCost = 0;
    }

    if (this.shootCooldown > 0) this.shootCooldown--;
    if (this.dashCooldown > 0) this.dashCooldown--;
    if (this.slashCooldown > 0) this.slashCooldown--;
    if (this.beamCooldown > 0) this.beamCooldown--;
    if (this.invul >= 0) this.invul--;
    if (this.noclip >= 0) this.noclip--;
    if (this.game.loopCount % 60 === 0) this.charge++;
    if (this.charge > this.chargeCost * CHARGE_STACKS) this.charge = Math.floor(this.chargeCost * CHARGE_STACKS);
    if (this.discharged) {
      this.charging = false;
      this.discharged = false;
    }
    if (this.dashPathDuration > 0) {
      this.dashPathDuration--;

      let p = new Particle(game, this.pos.x, this.pos.y);
      p.color = "cyan";
      p.aliveTime = DASH_DURATION + 5;
      p.r = this.r;
      p.active = false;
      p.cb = function () {
        this.aliveTime--;
        if (this.aliveTime <= 5) this.color = `rgba(128,128,128,${this.aliveTime / 5})`;

        if (this.aliveTime <= 0) this.alive = false;

      }
      this.game.vanity.push(p);
    }

    // handle combo reset logic
    this.slashReset > 0 ? this.slashReset-- : this.slashCombo = 0;
    
    // if player is paused, do not apply movement or actions
    if (this.pauseTime > 0) {
      this.pauseTime--;
      if(this.pauseTime === 0) {
        // this.vel = this.velRestoreDash;
      } else {
        return;
      }
    }

    // Calculate facing direction and apply controls
    this.setAim();

    this.movement = new Vector();
    if (this.keyDown[KEY.W]) this.movement.y -= 1;
    if (this.keyDown[KEY.A]) this.movement.x -= 1;
    if (this.keyDown[KEY.S]) this.movement.y += 1;
    if (this.keyDown[KEY.D]) this.movement.x += 1;
    this.movement.normalize();

    if(this.vel.length() > 0) {
      let thruster = new Emitter(this.game, {
        pos: { x: this.pos.x, y: this.pos.y },
        r: 8,
        aim: this.vel.dup().multiply(-1),
        aliveTime: 10,
        emitCount: 2,
        emitSpeed: 1,
        ejectSpeed: 0.5,
        impulseVariance: .5,
        fanDegree: 30,
        color: "rgba(0, 188, 188, 0.7)",
        decayRate: 0.8,
      });

      this.game.vanity.push(thruster);
    }

    if (this.keyDown[KEY.MOUSE_LEFT] && this.slashCharge === 0 && this.slashCooldown <= 0) this.slash();
    if (this.keyDown[KEY.MOUSE_LEFT]) {
      this.slashCharge++; 
      this.slashCharge = Math.min(this.slashCharge, this.slashChargeNeeded + 1);
    } 
    if (!this.keyDown[KEY.MOUSE_LEFT] && this.slashCharge >= this.slashChargeNeeded) {
      this.slashCharge = 0;
      this.chargeSlash();
    } else if (!this.keyDown[KEY.MOUSE_LEFT]) {
      this.slashCharge = 0;
    }
    if (this.slashCharge === this.slashChargeNeeded) {
      let star = new Star(this, {
        pos: this.pos.dup(),
        length: 250,
        width: 24,
        aliveTime: 35,
        expandRate: 1.05,
        thinningRate: 0.7,
        color: [0, 188, 188],
      });
      this.game.vanity.push(star);
      let star2 = new Star(this, {
        pos: this.pos.dup(),
        length: 100,
        width: 24,
        aliveTime: 35,
        expandRate: 1.05,
        thinningRate: 0.7,
        color: [200, 0, 0],
        angle: Math.PI / 4,
      });
      this.game.vanity.push(star2);
      let explosion = new Explosion(game, this.pos.x, this.pos.y, this.r + 50);
      explosion.color = "teal";
      explosion.aliveTime = 4;
      this.game.vanity.push(explosion);
    }

    if (this.keyDown[KEY.MOUSE_LEFT] && this.slashCharge === 0 && this.slashCooldown <= 0) this.slash();
    if (this.keyDown[KEY.MOUSE_RIGHT] && this.shootCooldown <= 0) this.shoot();
    if (!this.keyDown[KEY.MOUSE_RIGHT]) this.shooting = false;
    if (this.keyDown[KEY.SHIFT] && this.dashCooldown <= (DASH_COUNT - 1) * this.maxDashCooldown) this.dash();
    if (this.dashDuration <= 0) this.dashing = false;
    if (this.keyDown[KEY.SPACE] && this.beamCooldown <= 0) this.fireBeam();

    // Apply movement
    switch (this.moveState) {
      case STATE_WALKING:
        this.vel.add(this.movement.dup().multiply(ACCEL));

        this.dampSpeed();
        this.addVelocityTimeDelta();
        this.applyDecel();
        break;
      case STATE_DASHING:
        if (this.dashDuration <= 0) {
          this.invul = Math.max(POST_DASH_INVUL, this.invul);
          this.moveState = STATE_WALKING;
        } else {
          this.dashDuration--;
          while (this.vel.length() < DASH_SPEED) {
            this.vel.add(this.dashDirection.dup().multiply(1/5));
          }
        }

        this.vel.add(this.movement.dup().multiply(ACCEL));
        if (this.vel.length() > DASH_SPEED) this.vel.normalize().multiply(DASH_SPEED);
        this.addVelocityTimeDelta();
        break;
      default:
        break;
    }

    // add sparks for charge level
    // if (this.game.loopCount % 2) {
    //   if (this.charge >= this.chargeCost * 2) {
    //     this.game.vanity.push(new SlashSpark(this.game, this.pos.x, this.pos.y, "FINISHER", 3, this.r * 2));
    //   } else if (this.charge >= this.chargeCost) {
    //     this.game.vanity.push(new SlashSpark(this.game, this.pos.x, this.pos.y, "CRIT", 2, this.r * 1.5));
    //   }
    // }

    this.validateBound(this.cvs.width, this.cvs.height);
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.color;
    this.ctx.strokeStyle = "white";

    // this.ctx.shadowBlur = 6;
    this.ctx.shadowColor = "white";
    
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.restore();

    // draw cooldowns
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = "white";
    // this.ctx.shadowBlur = 6;
    this.ctx.shadowColor = "white";
    this.ctx.lineWidth = 6;
    this.ctx.arc(this.pos.x, this.pos.y, 20, 0, 2 * Math.PI * (this.dashCooldown / this.maxDashCooldown));
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.restore();

  }
}

export default Player;