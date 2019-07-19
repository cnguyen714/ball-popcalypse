
import Vector from "./Vector";
import GameObject from "./GameObject";
import { fireBulletAtCursor, fireBulletAtCursorB }from './particle_factory';

const CLAMP_SPAWN = 100; // Offset from edges
const ACCEL = 3;
const MAX_SPEED = 6;
const DASH_MULTIPLIER = 2;
const MAX_DASH_SPEED = 10;
const DECEL = 0.9;
const MIN_SPEED = 0.1;
const PLAYER_RADIUS = 10;
const COLOR = 'black';
const DAMPENING_COEFFICIENT = 0.7;
const CLAMP_SPEED = 200;

const SHOOT_COOLDOWN = 0;
const MAX_HEALTH = 100;

const STATE_WALKING = "STATE_WALKING";
const STATE_DASHING = "STATE_DASHING";

const KEY = {
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  UP: 38,
  LEFT: 37,
  DOWN: 40,
  RIGHT: 39,
  SHIFT: 16,
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

    this.maxHealth = MAX_HEALTH;
    this.health = MAX_HEALTH;

    this.r = PLAYER_RADIUS;
    this.color = COLOR;
    this.keyDown = {
      [KEY.W]: false,
      [KEY.A]: false,
      [KEY.S]: false,
      [KEY.D]: false,
      [KEY.SHIFT]: false,
      [KEY.MOUSE_LEFT]: false,
      [KEY.MOUSE_RIGHT]: false,
    }

    this.setMousePosition = this.setMousePosition.bind(this);
    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  setMousePosition(e) {
    var canvasRect = this.cvs.getBoundingClientRect();
    this.mousePos.x = e.clientX - canvasRect.left;
    this.mousePos.y = e.clientY - canvasRect.top;
    this.setAim();
  }

  setAim() {
    this.aim = new Vector(this.mousePos.x - this.pos.x, this.mousePos.y - this.pos.y);
  }

  mountController() {
    document.addEventListener('keydown', (e) => {
      let key = e.keyCode;

      // Ignore keys that have not been bound
      if (!Object.values(KEY).includes(key)) return;
      switch (this.game.state) {
        case this.game.STATE_INIT:
          break;
        case this.game.STATE_BEGIN:
          this.game.startGame();
          break;
        case this.game.STATE_RUNNING:
          if (key === KEY.W) this.keyDown[KEY.W] = true;
          if (key === KEY.A) this.keyDown[KEY.A] = true;
          if (key === KEY.S) this.keyDown[KEY.S] = true;
          if (key === KEY.D) this.keyDown[KEY.D] = true;
          if (key === KEY.UP) this.keyDown[KEY.W] = true;
          if (key === KEY.LEFT) this.keyDown[KEY.A] = true;
          if (key === KEY.DOWN) this.keyDown[KEY.S] = true;
          if (key === KEY.RIGHT) this.keyDown[KEY.D] = true;

          if (key === KEY.SHIFT) this.keyDown[KEY.SHIFT] = true;
          break;
        case this.game.STATE_OVER:
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
          this.game.startGame();
          break;
        case this.game.STATE_RUNNING:
          if (key === KEY.W) this.keyDown[KEY.W] = false;
          if (key === KEY.A) this.keyDown[KEY.A] = false;
          if (key === KEY.S) this.keyDown[KEY.S] = false;
          if (key === KEY.D) this.keyDown[KEY.D] = false;
          if (key === KEY.UP) this.keyDown[KEY.W] = false;
          if (key === KEY.LEFT) this.keyDown[KEY.A] = false;
          if (key === KEY.DOWN) this.keyDown[KEY.S] = false;
          if (key === KEY.RIGHT) this.keyDown[KEY.D] = false;
          if (key === KEY.SHIFT) this.keyDown[KEY.SHIFT] = false;
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

  validatePosition(rectX, rectY) {
    if(this.pos.x + this.r > rectX) this.pos.x = rectX - this.r;
    if(this.pos.x - this.r < 0) this.pos.x = this.r;
    if(this.pos.y + this.r > rectY) this.pos.y = rectY - this.r;
    if(this.pos.y - this.r < 0) this.pos.y = this.r;
  }

  dampSpeed() {
    let vel = this.vel.length();
    let maxSpeed = (this.keyDown[KEY.SHIFT] 
      ? MAX_DASH_SPEED 
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
    let offset = ACCEL * (this.keyDown[KEY.SHIFT] ? DASH_MULTIPLIER : 1);
    if(this.vel.length() < MAX_DASH_SPEED) {
      if(this.keyDown[KEY.W]) this.vel.y -= offset;
      if(this.keyDown[KEY.A]) this.vel.x -= offset;
      if(this.keyDown[KEY.S]) this.vel.y += offset;
      if(this.keyDown[KEY.D]) this.vel.x += offset;
    }
    this.dampSpeed();
    this.addVelocityTimeDelta();
    this.applyDecel();

    if(this.shootCooldown > 0) this.shootCooldown--;
    this.setAim();
    if(this.keyDown[KEY.MOUSE_LEFT] && this.shootCooldown <= 0) {
      this.shootCooldown = SHOOT_COOLDOWN;
      this.game.particles.push(fireBulletAtCursor(this));
      this.game.particles.push(fireBulletAtCursor(this));
      this.game.particles.push(fireBulletAtCursor(this));
      this.game.particles.push(fireBulletAtCursor(this));
    };
    if (this.keyDown[KEY.MOUSE_RIGHT] && this.shootCooldown <= 0) {
      this.game.particles.push(fireBulletAtCursorB(this));
    };

    this.validatePosition(this.cvs.width, this.cvs.height);
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.color;
    this.ctx.strokeStyle = this.color;
    this.ctx.fill();
    this.ctx.stroke();

    //draw aim
    this.ctx.beginPath();
    this.ctx.moveTo(this.pos.x, this.pos.y);
    this.ctx.lineTo(this.pos.x + this.aim.x, this.pos.y + this.aim.y);
    this.ctx.stroke();
  }
}

export default Player;