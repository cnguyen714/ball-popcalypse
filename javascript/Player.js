
import Vector from "./Vector";
import GameObject from "./GameObject";
import * as EnemyFactory from './enemy_factory';

import { fireBulletAtCursor, fireBeamAtCursor }from './particle_factory';
import Slam from "./Slam";
import BeamSlash from "./BeamSlash";
import Beam from "./Beam";
import { timingSafeEqual } from "crypto";
// import shotSfx from '../assets/laser7.wav';

const CLAMP_SPAWN = 100; // Offset from edges
const MAX_SPEED = 6;
const MIN_SPEED = 0.1;
const ACCEL = 3;
const DECEL = 0.9;
const SPRINT_SPEED = 8;
const MAX_SPRINT_SPEED = 10;
const DASH_TIME = 2;
const DASH_SPEED = 7;
const DASH_COOLDOWN = 12;
const POST_DASH_INVUL = 4;
const CHARGE_MAX = 60;
const CHARGE_STACKS = 2;

const PLAYER_RADIUS = 12;
const COLOR = '#0d7377';
const DAMPENING_COEFFICIENT = 0.7;
const CLAMP_SPEED = 200;

const SHOOT_COOLDOWN = 0;
const BEAM_COOLDOWN = 120;

const STATE_WALKING = "STATE_WALKING";
const STATE_DASHING = "STATE_DASHING";

const KEY = {
  W: 87,
  A: 65,
  S: 83,
  D: 68,
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
    this.slashReset = 0;
    this.slashCombo = 0;
    this.moveState = STATE_WALKING;
    this.dashDuration = 0;
    this.dashDirection = new Vector();
    this.dashCooldown = 0;
    this.beamCooldown = 0;
    this.invul = 0;
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
      // this.pauseTime = 2;
      this.invul = 5;

      this.setAim();
      this.vel = this.aim.dup().normalize().multiply(DASH_SPEED * 2);
      this.velRestoreDash = this.vel.dup();
      this.dashDirection = this.aim.dup();
      this.dashDuration = DASH_TIME;      
    }
  }

  fireBeam() {
    if (this.charge >= CHARGE_MAX) {
      let beam = new Beam(this.game, this.pos.x, this.pos.y);
      beam.width = 300;
      beam.length = 3000;
      beam.damage = 3000;
      beam.knockback = 40;
      beam.color = "red";
      beam.combo = -2;
      this.game.particles.push(beam);
      this.charge -= CHARGE_MAX;
      this.beamCooldown = BEAM_COOLDOWN;
      this.game.particles.push(beam);
      this.game.freeze(14);
      
      let kb = this.aim.dup().normalize();
      kb.multiply(100);
      kb.multiply(-1);
      this.vel.add(kb);
    }
  }

  // Fire
  shoot() {
    if (this.game.loopCount % 5 === 0) {
      this.game.playSoundMany(`${this.game.filePath}/assets/laser7.wav`, 0.7);
    }

    this.shootCooldown = SHOOT_COOLDOWN;
    fireBulletAtCursor(this);
    fireBulletAtCursor(this);
    fireBulletAtCursor(this);
    fireBulletAtCursor(this);
  }


  mountController() {
    document.addEventListener('keydown', (e) => {
      let key = e.keyCode;
      if(key === 8) this.health = 0; // BACKSPACE
      if(key === 187) this.game.difficulty++; //EQUAL
      if(key === 189) this.health += 100; //MINUS

      // Ignore keys that have not been bound
      if (!Object.values(KEY).includes(key)) return;
      switch (this.game.state) {
        case this.game.STATE_INIT:
          break;
        case this.game.STATE_BEGIN:
          if (key !== KEY.ENTER) { 
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

      switch (this.game.state) {
        case this.game.STATE_INIT:
          break;
        case this.game.STATE_BEGIN:
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

      if (
        this.mousePos.x >= this.cvs.width - 100 &&
        this.mousePos.x <= this.cvs.width  &&
        this.mousePos.y >= 0  &&
        this.mousePos.y <= 100 ) {
          this.game.mute = !this.game.mute;
        }
    });

    document.addEventListener("mouseup", (e) => {
      e.preventDefault();
      let clickType = e.button;

      switch (this.game.state) {
        case this.game.STATE_INIT:
          break;
        case this.game.STATE_BEGIN:
          this.game.startGame();
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

  // Ensure players do not leave the boundaries defined here.
  validatePosition(rectX, rectY) {
    if(this.pos.x + this.r > rectX) this.pos.x = rectX - this.r;
    if(this.pos.x - this.r < 0) this.pos.x = this.r;
    if(this.pos.y + this.r > rectY) this.pos.y = rectY - this.r;
    if(this.pos.y - this.r < 0) this.pos.y = this.r;
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
    if (this.shootCooldown > 0) this.shootCooldown--;
    if (this.dashCooldown > 0) this.dashCooldown--;
    if (this.beamCooldown > 0) this.beamCooldown--;
    if (this.slashReset > 0) {
      this.slashReset--;
    } else {
      this.slashCombo = 0;
    }
    if (this.charge > CHARGE_MAX * CHARGE_STACKS) this.charge = CHARGE_MAX * CHARGE_STACKS;
    if (this.pauseTime > 0) {;
      this.pauseTime--;
      if(this.pauseTime === 0) {
        this.vel = this.velRestoreDash;
      }
      return;
    }
    if (!this.alive) {
      this.dampSpeed();
      this.addVelocityTimeDelta();
      this.applyDecel();
      this.validatePosition(this.cvs.width, this.cvs.height);
      return;
    }
    
    // Calculate facing direction and apply shooting
    this.setAim();
    
    if (this.keyDown[KEY.MOUSE_LEFT] && this.dashCooldown <= 0) this.dash();
    if (this.keyDown[KEY.MOUSE_RIGHT] && this.shootCooldown <= 0) this.shoot();
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
      if (this.invul >= 0) this.invul--;
    } else if (this.moveState === STATE_DASHING) {
      // dash has ended
      if (this.dashDuration <= 0) {
        this.invul = POST_DASH_INVUL;
        this.moveState = STATE_WALKING;
        // this.game.particles.push(new Slam(this.game, this.pos.x, this.pos.y));
        
        this.game.particles.push(new BeamSlash(this.game, this.slashCombo));
        if (this.slashCombo === 3) {
          this.dashCooldown = DASH_COOLDOWN + 50;
          this.slashCombo = 0;
          this.shootCooldown = this.dashCooldown - 30;

          this.pauseTime = 5;
        } else {
          this.dashCooldown = DASH_COOLDOWN;
          this.shootCooldown = this.dashCooldown + 5;
          this.slashCombo++;
          this.slashReset = DASH_COOLDOWN * 3;
        }
      } else {
        this.dashDuration--;
        this.vel.add(this.aim.normalize().multiply(DASH_SPEED));

        this.addVelocityTimeDelta();
      }
    }

    this.validatePosition(this.cvs.width, this.cvs.height);
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