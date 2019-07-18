
const CLAMP_SPAWN = 100;
const MOVE_SPEED = 4;
const DASH_MULTIPLIER = 2;

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
};

class Player {
  constructor(game) {
    this.game = game;
    this.cvs = game.cvs;
    this.ctx = game.ctx;
    this.x = CLAMP_SPAWN + Math.random() * (this.cvs.width - CLAMP_SPAWN * 2);
    this.y = CLAMP_SPAWN + Math.random() * (this.cvs.height - CLAMP_SPAWN * 2);
    this.r = 15;
    this.fillColor = 'black';
    this.keyDown = {
      [KEY.W]: false,
      [KEY.A]: false,
      [KEY.S]: false,
      [KEY.D]: false,
      [KEY.SHIFT]: false,
    }
  }

  bindController() {
    document.addEventListener('keydown', (e) => {
      let key = e.keyCode;
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
    })
    document.addEventListener('keyup', (e) => {
      let key = e.keyCode;
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
    })
  }


  update(state) {
    let offset = MOVE_SPEED * (this.keyDown[KEY.SHIFT] ? DASH_MULTIPLIER : 1);
    if(this.keyDown[KEY.W]) this.y -= offset;
    if(this.keyDown[KEY.A]) this.x -= offset;
    if(this.keyDown[KEY.S]) this.y += offset;
    if(this.keyDown[KEY.D]) this.x += offset;
    this.validatePosition(this.cvs.width, this.cvs.height);
  }

  validatePosition(rectX, rectY) {
    if(this.x + this.r > rectX) this.x = rectX - this.r;
    if(this.x - this.r < 0) this.x = this.r;
    if(this.y + this.r > rectY) this.y = rectY - this.r;
    if(this.y - this.r < 0) this.y = this.r;
  }

  //   ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.fillColor;
    this.ctx.fill();
    this.ctx.stroke();
  }
}

export default Player;