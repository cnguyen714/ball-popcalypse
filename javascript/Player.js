
import Vector from "./Vector";
import { fireBulletAtCursor }from './particle_factory';

const CLAMP_SPAWN = 100; // Offset from edges
const ACCEL = 3;
const MAX_SPEED = 6;
const DASH_MULTIPLIER = 2;
const MAX_DASH_SPEED = 10;
const DECEL = 0.9;
const MIN_SPEED = 0.1;
const PLAYER_SIZE = 10;

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
  MOUSE: 10000,
};

class Player {
  constructor(game) {
    this.game = game;
    this.cvs = game.cvs;
    this.ctx = game.ctx;
    this.x = CLAMP_SPAWN + Math.random() * (this.cvs.width - CLAMP_SPAWN * 2);
    this.y = CLAMP_SPAWN + Math.random() * (this.cvs.height - CLAMP_SPAWN * 2);
    this.vel = new Vector(0, 0); 
    this.mouseX = this.cvs.width / 2;
    this.mouseY = this.cvs.height / 2;
    this.aim = new Vector(0, 0);

    this.r = PLAYER_SIZE;
    this.fillColor = 'black';
    this.keyDown = {
      [KEY.W]: false,
      [KEY.A]: false,
      [KEY.S]: false,
      [KEY.D]: false,
      [KEY.SHIFT]: false,
      [KEY.MOUSE]: false,
    }

    this.setMousePosition = this.setMousePosition.bind(this);
  }

  setMousePosition(e) {
    var canvasRect = this.cvs.getBoundingClientRect();
    this.mouseX = e.clientX - canvasRect.left;
    this.mouseY = e.clientY - canvasRect.top;
    this.setAim();
  }

  setAim() {
    this.aim = new Vector(this.mouseX - this.x, this.mouseY - this.y);
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

    document.addEventListener("mousedown", (e) => {
      switch (this.game.state) {
        case this.game.STATE_INIT:
          break;
        case this.game.STATE_BEGIN:
          this.game.startGame();
          break;
        case this.game.STATE_RUNNING:
          this.keyDown[KEY.MOUSE] = true;
          break;
        case this.game.STATE_OVER:
          break;
        default:
          break;
      }
    });
    document.addEventListener("mouseup", (e) => {
      switch (this.game.state) {
        case this.game.STATE_INIT:
          break;
        case this.game.STATE_BEGIN:
          this.game.startGame();
          break;
        case this.game.STATE_RUNNING:
          this.keyDown[KEY.MOUSE] = true;
          break;
        case this.game.STATE_OVER:
          break;
        default:
          break;
      }
    });
  }

  validatePosition(rectX, rectY) {
    if(this.x + this.r > rectX) this.x = rectX - this.r;
    if(this.x - this.r < 0) this.x = this.r;
    if(this.y + this.r > rectY) this.y = rectY - this.r;
    if(this.y - this.r < 0) this.y = this.r;
  }

  clampSpeed() {
    let vel = this.vel.length();
    let maxSpeed = (this.keyDown[KEY.SHIFT] 
      ? MAX_DASH_SPEED 
      : MAX_SPEED)
    if(vel > maxSpeed) {
      this.vel = this.vel.divide(vel).multiply(maxSpeed)
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
    if(this.keyDown[KEY.W]) this.vel.y -= offset;
    if(this.keyDown[KEY.A]) this.vel.x -= offset;
    if(this.keyDown[KEY.S]) this.vel.y += offset;
    if(this.keyDown[KEY.D]) this.vel.x += offset;
    this.clampSpeed();

    this.x += this.vel.x;
    this.y += this.vel.y;
    this.applyDecel();

    this.setAim();
    if(this.keyDown[KEY.MOUSE]) this.game.particles.push(fireBulletAtCursor(this));

    this.validatePosition(this.cvs.width, this.cvs.height);
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.fillColor;
    this.ctx.strokeStyle = this.fillColor;
    this.ctx.fill();
    this.ctx.stroke();

    //test aim
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);
    this.ctx.lineTo(this.x + this.aim.x, this.y + this.aim.y);
    this.ctx.stroke();
  }
}

export default Player;