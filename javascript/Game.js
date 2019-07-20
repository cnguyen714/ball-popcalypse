
import Player from './Player';
import Particle from './Particle';
import Vector from './Vector';
import * as ParticleFactory from './particle_factory';
import * as EnemyFactory from './enemy_factory';

// My laptop has a performance limit of around 700 particles
// Delta time is implemented by accelerating movement to perceive less
// lag, however the game still runs slower

const FPS = 60;
const NORMAL_TIME_DELTA = 1000 / FPS;
// const MAX_FRAME_SKIP = 3;
const STATE_INIT = "STATE_INIT";
const STATE_BEGIN = "STATE_BEGIN";
const STATE_RUNNING = "STATE_RUNNING";
const STATE_OVER = "STATE_OVER";
// const SPAWN_RATE = 180;
const SPAWN_RATE = 4; // 5
const DIFFICULTY_INTERVAL = 300;
const DIFFICULTY_MULTIPLIER = 1.05;

class Game {
  constructor(cvs, ctx) {
    this.STATE_INIT = STATE_INIT;
    this.STATE_BEGIN = STATE_BEGIN;
    this.STATE_RUNNING = STATE_RUNNING;
    this.STATE_OVER = STATE_OVER;
    this.cvs = cvs;
    this.ctx = ctx;
    this.highscore = 0;
    this.score = 0;
    this.pauseTime = 0;

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
    this.loopCount = 0;
    this.timeSeconds = 0;
    this.difficulty = 1;
    this.spawnRate = SPAWN_RATE;
    this.fpsCount = 0;
    this.fps = 0;
    this.timeDelta = NORMAL_TIME_DELTA;
    this.normalTimeDelta = NORMAL_TIME_DELTA;
    this.player = new Player(this);
    this.cameraPos = new Vector(this.player.pos.x, this.player.pos.y);
    this.players = [];
    this.players.push(this.player);
    this.entities = [];
    this.particles = [];

    this.player.mountController();
    this.state = STATE_BEGIN;
  }

  startGame() {
    this.score = 0;
    this.state = STATE_RUNNING;
  }

  endGame() {
    this.state = STATE_OVER;
  }

  restartGame() {
    if (this.highscore < this.score) this.highscore = this.score;
    this.init();
  }

  freeze(n) {
    this.pauseTime = n;
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
        
        this.player.update();

        // if(this.loopCount % (Math.floor(SPAWN_RATE / this.difficulty)) === 0) {
        if(this.loopCount % (Math.floor(SPAWN_RATE)) === 0 && this.fps >= 50) {
          // for (let i = 0; i < Math.floor(Math.random() * 5 + 3); i++) {
            this.entities.push(EnemyFactory.spawnCircleRandom(this.player));            
          // }
        }
        
        this.entities = this.entities.filter(entity => entity.alive);
        this.entities.forEach(entity => entity.update());

        this.particles = this.particles.filter(entity => entity.alive);
        this.particles.forEach(entity => entity.update());
        if(this.player.health <= 0) this.endGame();
        break;
      case STATE_OVER:

        this.restartGame();
        break;
      default:
        break;
    }
  }

  drawCursor() {
    this.ctx.beginPath();
    this.ctx.arc(this.player.pos.x + this.player.aim.x, this.player.pos.y + this.player.aim.y, 4, 0, 2 * Math.PI);
    this.ctx.fillStyle = "rgba(0,0,0,0)";
    this.ctx.strokeStyle = "yellow";
    this.ctx.fill();
    this.ctx.stroke();
  }

  drawEtc() {
    // Draw aim
    this.ctx.strokeStyle = "white";

    this.ctx.moveTo(this.player.pos.x, this.player.pos.y);
    this.ctx.lineTo(this.player.pos.x + this.player.aim.x, this.player.pos.y + this.player.aim.y);
    this.ctx.stroke();

    this.drawCursor();
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
        this.ctx.fillText(`Mouse: left click to shoot, right click to dash`, 10, 40);
        this.ctx.fillText(`Press any of these keys to start`, 10, 60);
        this.ctx.fillText(`Score: ${this.score}`, 10, 100);
        this.ctx.fillText(`Highscore: ${this.highscore}`, 10, 120);
        this.drawCursor();
        this.player.draw();

        break;
      case STATE_RUNNING:

        this.player.draw();
        this.entities.forEach(entity => entity.draw());
        this.particles.forEach(entity => entity.draw());

        this.ctx.font = '20px sans-serif';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(`Health: ${this.player.health}`, 10, 20);
        this.ctx.fillText(`Score: ${this.score}`, 10, 40);
        this.ctx.fillText(`Time: ${this.timeSeconds}`, 10, 60);
        this.ctx.fillText(`Difficulty: ${this.difficulty}`, 10, 80);
        this.ctx.fillText(`FPS: ${this.fps}`, this.cvs.width - 100, 20);
        this.ctx.fillText(`obj: ${this.particles.length + this.entities.length}`, this.cvs.width - 100, 40);

        this.drawEtc();
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
    
    if (this.pauseTime === 0) {
      this.update();
      this.draw();
    } else {
      this.pauseTime--;
    }

    this.fpsCount++;
    if (time > this.timeTracker) {
      this.fps = this.fpsCount;
      this.fpsCount = 0;
      this.timeTracker += 1000;
      this.timeSeconds++;
    }
    window.requestAnimationFrame(this.loop);
  }
}

export default Game;