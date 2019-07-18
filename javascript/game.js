
import Player from './Player';

const FPS = 60;
const NEXT_TICK_TIME = 1000 / FPS;
const MAX_FRAME_SKIP = 3;
const STATE_INIT = "STATE_INIT";
const STATE_BEGIN = "STATE_BEGIN";
const STATE_RUNNING = "STATE_RUNNING";
const STATE_OVER = "STATE_OVER";

class Game {
  constructor(cvs, ctx) {
    this.cvs = cvs;    
    this.ctx = ctx;

    this.nextGameTick = (new Date).getTime() + NEXT_TICK_TIME;

    this.loops = 0;
    this.state = STATE_INIT;
    this.entities = [];
    this.particles =[];

    this.loop = this.loop.bind(this);
  }

  init() {
    this.state = STATE_BEGIN;
    this.loop();
  }

  startGame() {

  }

  endGame() {

  }

  update() {
    switch(this.state) {
      case STATE_BEGIN:
        break;      
      case STATE_RUNNING:
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
  }

  loop() {
    // while ((new Date).getTime() > this.nextGameTick && this.loops < MAX_FRAME_SKIP) {
    //   this.update();
    //   this.nextGameTick += NEXT_TICK_TIME;
    //   this.loops++;
    // }

    window.requestAnimationFrame(this.loop);
    this.update();
    this.draw();
    // let now = (new Date).getTime();
    // console.log(now - this.nextGameTick);
    // this.nextGameTick = now + NEXT_TICK_TIME;
  }
}

// let onEachFrame = function (cb) {
//   setInterval(cb, NEXT_TICK_TIME);
// };

// window.onEachFrame = onEachFrame;

export default Game;