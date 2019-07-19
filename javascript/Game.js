
import Player from './Player';
import Particle from './Particle';
import Vector from './Vector';
import * as ParticleFactory from './particle_factory';
import * as EnemyFactory from './enemy_factory';

// My laptop has a performance limit of around 700 particles

const FPS = 60;
const NORMAL_TIME_DELTA = 1000 / FPS;
// const MAX_FRAME_SKIP = 3;
const STATE_INIT = "STATE_INIT";
const STATE_BEGIN = "STATE_BEGIN";
const STATE_RUNNING = "STATE_RUNNING";
const STATE_OVER = "STATE_OVER";
// const SPAWN_RATE = 180;
const SPAWN_RATE = 30;
const DIFFICULTY_INTERVAL = 300;
const DIFFICULTY_MULTIPLIER = 1.01;

class Game {
  constructor(cvs, ctx) {
    this.STATE_INIT = STATE_INIT;
    this.STATE_BEGIN = STATE_BEGIN;
    this.STATE_RUNNING = STATE_RUNNING;
    this.STATE_OVER = STATE_OVER;
    this.cvs = cvs;
    this.ctx = ctx;

    this.timeTracker = (new Date).getTime() + NORMAL_TIME_DELTA;
    this.prevTime = (new Date).getTime();

    this.state = STATE_INIT;

    this.init = this.init.bind(this);
    this.loop = this.loop.bind(this);
  }

  init() {
    this.ctx.canvas.width = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;

    this.loops = 0;
    this.difficulty = 1;
    this.loopCount = 0;
    this.spawnRate = SPAWN_RATE;
    this.fpsCount = 0;
    this.fps = 0;
    this.timeDelta = NORMAL_TIME_DELTA;
    this.normalTimeDelta = NORMAL_TIME_DELTA;
    this.entities = [];
    this.particles = [];
    this.players = [];

    let player = new Player(this);
    this.players.push(player);
    
    this.players[0].mountController();
    this.state = STATE_BEGIN;
  }

  startGame() {
    this.state = STATE_RUNNING;
  }

  endGame() {
    this.state = STATE_OVER;
  }

  update() {
    switch(this.state) {
      case STATE_INIT: 
        this.init();
        break;
      case STATE_BEGIN:
        break;
      case STATE_RUNNING:
        this.loopCount++;
        if(this.loopCount % DIFFICULTY_INTERVAL === 0) {
          this.difficulty *= DIFFICULTY_MULTIPLIER;
        }
        
        this.players.forEach(entity => entity.update());

        // if(this.loopCount % (Math.floor(SPAWN_RATE / this.difficulty)) === 0) {
          this.entities.push(EnemyFactory.spawnCircleRandom(this.players[0]));
        // }
        
        this.entities = this.entities.filter(entity => entity.alive);
        this.entities.forEach(entity => entity.update());

        this.particles = this.particles.filter(entity => entity.alive);
        this.particles.forEach(entity => entity.update());
        if(this.players[0].health <= 0) this.endGame();
        break;
      case STATE_OVER:
        this.init();
        break;
      default:
        break;
    }
  }

  draw(timeDelta) {
    this.ctx.canvas.width = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;

    switch (this.state) {
      case STATE_INIT:
        break;
      case STATE_BEGIN:
        this.ctx.font = '20px sans-serif';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(`Press WASD / Arrow Keys to move`, 10, 20);
        this.ctx.fillText(`Aim mouse and left click to shoot`, 10, 40);
        this.ctx.fillText(`Press any of these keys to start`, 10, 60);
        break;
      case STATE_RUNNING:

        this.entities.forEach(entity => entity.draw());
        this.particles.forEach(entity => entity.draw());
        this.players.forEach(entity => entity.draw());

        this.ctx.font = '20px sans-serif';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(`Health: ${this.players[0].health}`, 10, 20);
        this.ctx.fillText(`FPS: ${this.fps}`, this.cvs.width - 100, 20);
        this.ctx.fillText(`obj: ${this.particles.length + this.entities.length}`, this.cvs.width - 100, 40);

        break;
      case STATE_OVER:
        break;
      default:
        break;
    }
  }

  loop() {
    let time = (new Date).getTime();
    this.timeDelta = time - this.prevTime;
    this.prevTime = time;
    this.update();
    this.draw();
    // this.loops++;
    this.fpsCount++;
    if (time > this.timeTracker) {
      // console.log(`fps = ${this.fps} || entities: ${this.particles.length + this.entities.length}`);
      this.fps = this.fpsCount;
      this.fpsCount = 0;
      this.timeTracker += 1000;
      // this.difficulty += DIFFICULTY_MULTIPLIER;
    }
    window.requestAnimationFrame(this.loop);
  }
}

export default Game;