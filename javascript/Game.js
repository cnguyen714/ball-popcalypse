
import Player from './Player';

const FPS = 60;
const NEXT_TICK_TIME = 1000 / FPS;
// const MAX_FRAME_SKIP = 3;
const STATE_INIT = "STATE_INIT";
const STATE_BEGIN = "STATE_BEGIN";
const STATE_RUNNING = "STATE_RUNNING";
const STATE_OVER = "STATE_OVER";

class Game {
  constructor(cvs, ctx) {
    this.STATE_INIT = STATE_INIT;
    this.STATE_BEGIN = STATE_BEGIN;
    this.STATE_RUNNING = STATE_RUNNING;
    this.STATE_OVER = STATE_OVER;

    this.cvs = cvs;
    this.ctx = ctx;

    this.nextGameTick = (new Date).getTime() + NEXT_TICK_TIME;

    this.loops = 0;
    this.state = STATE_INIT;
    this.entities = [];
    this.particles =[];
    this.players = [];

    this.init = this.init.bind(this);
    this.loop = this.loop.bind(this);
  }

  init() {
    this.ctx.canvas.width = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;

    this.players.push(new Player(this));
    this.players[0].mountController();
    this.state = STATE_BEGIN;
  }

  startGame() {
    this.state = STATE_RUNNING;
  }

  endGame() {

  }

  update() {
    switch(this.state) {
      case STATE_INIT: 
        this.init();
        break;
      case STATE_BEGIN:
        break;
      case STATE_RUNNING:
        this.entities.forEach(entity => entity.update());
        this.particles.forEach(entity => entity.update());
        this.players.forEach(entity => entity.update());
        break;
      case STATE_OVER:
        break;
      default:
        break;
    }
  }

  draw() {
    this.ctx.canvas.width = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;

    switch (this.state) {
      case STATE_INIT:
        break;
      case STATE_BEGIN:
        break;
      case STATE_RUNNING:
        this.entities.forEach(entity => entity.draw());
        this.particles.forEach(entity => entity.draw());
        this.players.forEach(entity => entity.draw());
        break;
      case STATE_OVER:
        break;
      default:
        break;
    }
  }

  loop() {
    this.update();
    this.draw();
    window.requestAnimationFrame(this.loop);
  }
}

export default Game;