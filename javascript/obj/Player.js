
import Vector from "../lib/Vector";
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
// import shotSfx from '../assets/laser7.wav';

const CLAMP_SPAWN = 100; // Offset from edges
const MAX_SPEED = 7;
const MIN_SPEED = 0.1;
const ACCEL = 3;
const DECEL = 0.9;
const SPRINT_SPEED = 8;
const MAX_SPRINT_SPEED = 10;
const DASH_TIME = 0;
const DASH_SPEED = 7;
const DASH_COOLDOWN = 12;
const POST_DASH_INVUL = 2;
const CHARGE_MAX = 60;
const CHARGE_STACKS = 2.2;
const CHARGE_COOLDOWN = 90;
const MAX_COMBOS = 3;
const SHOOT_COOLDOWN = 12;
const SHOOT_SHOTGUN_PELLETS = 60;

const PLAYER_RADIUS = 11;
const COLOR = '#0d7377';
const DAMPENING_COEFFICIENT = 0.7;
const CLAMP_SPEED = 200;


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
  // LEFT: 37,
  DOWN: 40,
  // RIGHT: 39,
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
    
    this.pos = new Vector(CLAMP_SPAWN + Math.random() * (this.cvs.width - CLAMP_SPAWN * 2),
                          CLAMP_SPAWN + Math.random() * (this.cvs.height - CLAMP_SPAWN * 2));
    this.vel = new Vector(); 
    this.aim = new Vector();
    this.mousePos = new Vector(this.cvs.width / 2, this.cvs.height / 2);
    this.shootCooldown = 0;
    this.shooting = false;
    this.slashReset = 0;
    this.slashCombo = 0;
    this.maxSlashCombo = MAX_COMBOS;
    this.moveState = STATE_WALKING;
    this.dashDuration = 0;
    this.dashDirection = new Vector();
    this.dashCooldown = 0;
    this.beamCooldown = 0;
    this.charging = false;
    this.invul = 0;
    this.noclip = 0;
    this.velRestoreDash = new Vector(); 
    this.charge = CHARGE_MAX;
    this.chargeMax = CHARGE_MAX;

    this.maxHealth = 100;
    this.health = this.maxHealth;

    this.r = PLAYER_RADIUS;
    this.color = COLOR;
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
    this.setAim();
  }

  // Set player's unnormalized aim relative to stored mouse position
  setAim() {
    this.aim = new Vector(this.mousePos.x - this.pos.x, this.mousePos.y - this.pos.y);
  }

  // Dash in a direction for a few frames
  // End dash logic is handled in update
  dash() {
    if (this.moveState !== STATE_DASHING) {
      this.moveState = STATE_DASHING;
      // this.pauseTime = 3;
      this.invul = 5;

      this.setAim();
      // this.vel = this.aim.dup().normalize().multiply(DASH_SPEED * 2);
      // this.velRestoreDash = this.vel.dup();
      this.dashDirection = this.aim.dup();
      this.dashDuration = DASH_TIME;
      this.game.playSoundMany(`${this.game.filePath}/assets/SE_00064.wav`, 0.13);
    }
  }

  fireBeam() {
    if (this.charge >= CHARGE_MAX) {
      let freezeTime = 18;
      this.charge -= CHARGE_MAX;
      this.beamCooldown = !this.game.cheat ? CHARGE_COOLDOWN : 2;
      this.charging = true;

      setTimeout(function () {
        this.charging = false;

        let kb = this.aim.dup().normalize().multiply(-75);
        this.vel.add(kb);
        let aim = kb.dup().normalize().multiply(-1);

        this.game.playSoundMany(`${this.game.filePath}/assets/SE_00016.wav`, 0.2);
        let beam = new BeamCannon(this.game, this.pos.x, this.pos.y, aim);

        this.game.delayedParticles.push(beam);
        this.invul = 5;


        if (this.game.cheat) {
          beam.width = 60;
          beam.damage = 600;
          this.vel.subtract(kb.multiply(0.9));
          freezeTime = 0;
          beam.knockback = 5;
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
        explosion3.color = "rgba(255,0,0,.3)";
        explosion3.aliveTime = 7;
        this.game.vanity.push(explosion3);

      }.bind(this), 200);

      setTimeout(function() {
        this.game.playSoundMany(`${this.game.filePath}/assets/SE_00049.wav`, 0.2);
      }, 300 + this.game.normalTimeDelta * freezeTime);
    }
  }

  // Fire
  shoot() {
    if (this.shooting === false) {
      this.game.playSoundMany(`${this.game.filePath}/assets/laser7.wav`, 0.4);
      this.shooting = true;
      this.shootCooldown = SHOOT_COOLDOWN;
      // for (let i = 0; i < SHOOT_SHOTGUN_PELLETS; i++) {
      //   fireBulletAtCursorB(this); 
      // }
      let beam = new BeamCannon(this.game, this.pos.x, this.pos.y, this.aim, 4000, 50, 200, 10);
      beam.hitRatio = 0.5;
      beam.bomb = false;
      beam.aliveTime = 50;
      beam.initialTime = beam.aliveTime;
      beam.color = Beam.COLOR().TEAL;
      this.game.particles.push(beam);
    } else {
      if (this.game.loopCount % 5 === 0) {
        this.game.playSoundMany(`${this.game.filePath}/assets/laser7.wav`, 0.2);
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
            this.game.startGame();
          }
          break;
        case this.game.STATE_RUNNING:
          this.keyDown[key] = true;
          if (key == KEY.DOWN) this.game.entities.push(EnemyFactory.spawnCircleRandom(this));
          if (key == KEY.UP) this.charge += CHARGE_MAX;
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
          this.game.startGame();
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
    let vel = this.vel.length();
    let maxSpeed = (this.keyDown[KEY.SHIFT] 
      ? MAX_SPRINT_SPEED 
      : MAX_SPEED)
    if(vel > CLAMP_SPEED) {
      this.vel.normalize().multiply(CLAMP_SPEED);
    }
    if(vel > maxSpeed) {
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

    if(this.game.cheat) {
      this.charge = CHARGE_MAX * 2;
      if(this.beamCooldown >= 10) this.beamCooldown = 9;
    }

    if (this.shootCooldown > 0) this.shootCooldown--;
    if (this.dashCooldown > 0) this.dashCooldown--;
    if (this.beamCooldown > 0) this.beamCooldown--;
    if (this.invul >= 0) this.invul--;
    if (this.noclip >= 0) this.noclip--;
    if (this.charge > CHARGE_MAX * CHARGE_STACKS) this.charge = Math.floor(CHARGE_MAX * CHARGE_STACKS);

    // handle combo reset logic
    if (this.slashReset > 0) {
      this.slashReset--;
    } else {
      this.slashCombo = 0;
    }

    // add sparks for charge level
    if (this.game.loopCount % 2) {
      if (this.charge >= this.chargeMax * 2) {
        this.game.vanity.push(new SlashSpark(this.game, this.pos.x, this.pos.y, "FINISHER", 3, this.r * 2));
      } else if (this.charge >= this.chargeMax) {
        this.game.vanity.push(new SlashSpark(this.game, this.pos.x, this.pos.y, "CRIT", 2, this.r * 1.5));
      }
    }
    
    // if player is paused, do not apply movement or actions
    if (this.pauseTime > 0) {
      this.pauseTime--;
      if(this.pauseTime === 0) {
        // this.vel = this.velRestoreDash;
      } else {
        return;
      }
    }

    // Calculate facing direction and apply shooting controls
    this.setAim();

    if (this.keyDown[KEY.MOUSE_LEFT] && this.dashCooldown <= 0) this.dash();
    if (this.keyDown[KEY.MOUSE_RIGHT] && this.shootCooldown <= 0) this.shoot();
    if (!this.keyDown[KEY.MOUSE_RIGHT]) this.shooting = false;
    if (this.keyDown[KEY.SPACE] && this.beamCooldown <= 0) this.fireBeam();

    // Apply movement
    if (this.moveState === STATE_WALKING) {
      let offset = ACCEL * (this.keyDown[KEY.SHIFT] ? SPRINT_SPEED : 1);
      if (this.vel.length() < MAX_SPRINT_SPEED) {
        if (this.keyDown[KEY.W]) this.vel.y -= offset;
        if (this.keyDown[KEY.A]) this.vel.x -= offset;
        if (this.keyDown[KEY.S]) this.vel.y += offset;
        if (this.keyDown[KEY.D]) this.vel.x += offset;
      }

      this.dampSpeed();
      this.addVelocityTimeDelta();
      this.applyDecel();
    } else if (this.moveState === STATE_DASHING) {
      // dash has ended
      if (this.dashDuration <= 0) {
        this.invul = POST_DASH_INVUL;
        this.moveState = STATE_WALKING;
        // this.game.particles.push(new Slam(this.game, this.pos.x, this.pos.y));
        
        this.game.particles.push(new BeamSlash(this.game, this.slashCombo));
        if (this.slashCombo === this.maxSlashCombo) {
          this.dashCooldown = DASH_COOLDOWN + 60;
          this.slashCombo = 0;
          this.shootCooldown = this.dashCooldown - 30;
          this.invul += 40;
          this.noclip += 50;
          // this.pauseTime = 5;
        } else {
          this.dashCooldown = DASH_COOLDOWN;
          this.shootCooldown = this.dashCooldown + 5;
          this.slashCombo++;
          this.slashReset = DASH_COOLDOWN * 1.6;
        }
      } else {
        this.dashDuration--;
        this.vel.add(this.aim.normalize().multiply(DASH_SPEED));
        this.addVelocityTimeDelta();
      }
    } 

    if (this.charging) {
      let line  = new Beam(this.game, this.pos.x, this.pos.y, new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1), 0, false);
      line.width = 10;
      line.length = 400;
      line.knockback = 0;
      line.silenced = true;
      line.unpausable = true;
      line.aliveTime = 90;
      line.color = Beam.COLOR().TEAL;
      line.cb = function () {
        this.length *= 0.9;
        this.width *= 0.8;
        // this.pos.x = this.game.player.pos.x;
        // this.pos.y = this.game.player.pos.y;
      }
      this.game.vanity.push(line);
    }

    this.validateBound(this.cvs.width, this.cvs.height);
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.color;
    this.ctx.strokeStyle = "white";

    this.ctx.shadowBlur = 6;
    this.ctx.shadowColor = "white";
    
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.restore();
  }
}

export default Player;