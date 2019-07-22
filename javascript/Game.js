
import Player from './Player';
import Particle from './Particle';
import Vector from './Vector';
import * as ParticleFactory from './particle_factory';
import * as EnemyFactory from './enemy_factory';
import Slam from './Slam'; 
import Explosion from "./Explosion";

// My laptop has a performance limit of around 700 particles
// Delta time is implemented by accelerating movement to perceive less
// lag, however the game still runs slower

const STATE_INIT = "STATE_INIT";
const STATE_BEGIN = "STATE_BEGIN";
const STATE_RUNNING = "STATE_RUNNING";
const STATE_OVER = "STATE_OVER";

const FPS = 60;
const NORMAL_TIME_DELTA = 1000 / FPS;
const MIN_FRAME_RATE = 54; // Limits enemy production to save frames

const SPAWN_RATE = 4; // 5
const DIFFICULTY_START = 10;
const DIFFICULTY_INTERVAL = 300;
const DIFFICULTY_MULTIPLIER = 0.05;
const DIFFICULTY_RATE = 5;

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
    this.difficulty = DIFFICULTY_START;
    this.difficultyRate = DIFFICULTY_RATE;
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
    this.particles.push(new Slam(game, this.player.pos.x, this.player.pos.y));

    this.player.mountController();
    this.state = STATE_BEGIN;
  }

  startGame() {
    this.score = 0;
    this.loopCount = 0;
    this.state = STATE_RUNNING;
  }

  endGame() {
    if (this.highscore < this.score) this.highscore = this.score;
    this.state = STATE_OVER;
    this.freeze(15);
    this.player.alive = false;
    this.player.color = 'black'; 
    let sound = new Audio("../assets/DEFEATED.wav");
    sound.play();

    let explode1 = new Slam(game, this.player.pos.x, this.player.pos.y);
    explode1.color = 'white';
    explode1.knockback = 1;
    explode1.damage = 0;
    explode1.r = 310;
    this.particles.push(explode1);
    let explode2 = new Slam(game, this.player.pos.x, this.player.pos.y);
    explode2.color = 'gray';
    explode2.knockback = 100;
    explode2.damage = 20;
    explode2.r = 300;
    this.particles.push(explode2);
    let explode3 = new Slam(game, this.player.pos.x, this.player.pos.y);
    explode3.color = 'black';
    explode3.knockback = 100; 
    explode3.damage = 100;
    explode3.r = 100;
    this.particles.push(explode3);

  }

  restartGame() {
    this.init();
  }

  freeze(n) {
    this.pauseTime = n;
  }

  update() {
    this.loopCount++;

    switch(this.state) {
      case STATE_INIT: 
        this.init();
        break;
      case STATE_BEGIN:
        break;
      case STATE_RUNNING:
        if(this.loopCount % DIFFICULTY_INTERVAL === 0) {
          this.difficulty *= 1 + DIFFICULTY_MULTIPLIER * DIFFICULTY_RATE;
        }
        
        this.player.update();
        
        // Stop making enemies if you miss too many frame deadlines
        if(this.loopCount % (Math.floor(SPAWN_RATE)) === 0 && this.fps >= MIN_FRAME_RATE && this.loopCount > 60) {
            this.entities.push(EnemyFactory.spawnCircleRandom(this.player));            
        }
        
        this.entities.filter(entity => !entity.alive).forEach(entity => {
          let sound = new Audio("../assets/boom2.wav");
          sound.play();

          this.particles.push(new Explosion(game, entity.pos.x, entity.pos.y))
        });
        this.entities = this.entities.filter(entity => entity.alive);
        this.entities.forEach(entity => entity.update());
        this.particles = this.particles.filter(entity => entity.alive);
        this.particles.forEach(entity => entity.update());
        if(this.player.health <= 0) {
          this.endGame();
        }
        break;
      case STATE_OVER:

        // this.player.update();

        // if (this.loopCount % (Math.floor(SPAWN_RATE * 1.5)) === 0) {
          this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
          // if (this.fps <= MIN_FRAME_RATE - 5) this.entities[0].alive = false;          
        // }
        this.entities.forEach(entity => {
          let diff = Vector.difference(entity.pos, this.player.pos);
          let distSqr = diff.dot(diff);

          if (entity.r * entity.r + this.player.r * this.player.r  + 100 > distSqr) {
                entity.alive = false;
              }
        })
        this.entities.filter(entity => !entity.alive).forEach(entity => {
          if (this.loopCount % 5 === 0) {
            let sound = new Audio("../assets/boom2.wav");
            sound.play();
          }
          this.particles.push(new Explosion(game, entity.pos.x, entity.pos.y))
        });
        this.entities = this.entities.filter(entity => entity.alive);
        this.entities.forEach(entity => entity.update());

        this.particles = this.particles.filter(entity => entity.alive);
        this.particles.forEach(entity => entity.update());


        // this.restartGame();
        break;
      default:
        break;
    }
  }

  drawCursor() {
    this.ctx.beginPath();
    // this.ctx.arc(this.player.mousePos.x, this.player.mousePos.y, 4, 0, 2 * Math.PI);
    // this.ctx.fillStyle = "rgba(0,0,0,0)";
    this.ctx.strokeStyle = "yellow";
    this.ctx.moveTo(this.player.mousePos.x - 5, this.player.mousePos.y);
    this.ctx.lineTo(this.player.mousePos.x + 5, this.player.mousePos.y);
    this.ctx.moveTo(this.player.mousePos.x, this.player.mousePos.y - 5);
    this.ctx.lineTo(this.player.mousePos.x, this.player.mousePos.y + 5);
    this.ctx.stroke();
  }

  drawAim() {
    // Draw aim
    this.ctx.strokeStyle = "white";


    // this.ctx.beginPath();
    // this.ctx.moveTo(this.player.pos.x, this.player.pos.y);
    // this.ctx.lineTo(this.player.mousePos.x, this.player.mousePos.y);
    // this.ctx.stroke();
    // this.ctx.closePath();   
    
  }

  showFPS() {
    this.ctx.font = '20px sans-serif';
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(`FPS: ${this.fps}`, this.cvs.width - 100, 20);
    this.ctx.fillText(`obj: ${this.particles.length + this.entities.length}`, this.cvs.width - 100, 40);
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

        break;
      case STATE_RUNNING:

        this.particles.forEach(entity => entity.draw());
        this.player.draw();
        this.entities.forEach(entity => entity.draw());

        this.ctx.font = '20px sans-serif';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(`Health: ${this.player.health}`, 10, 20);
        this.ctx.fillText(`Score: ${this.score}`, 10, 40);
        this.ctx.fillText(`Time: ${this.timeSeconds}`, 10, 60);
        this.ctx.fillText(`Difficulty: ${this.difficulty}`, 10, 80);
        
        this.showFPS();
        // this.drawAim();
        break;
      case STATE_OVER:

        this.particles.forEach(entity => entity.draw());
        this.player.draw();
        this.entities.forEach(entity => entity.draw());
        
        this.showFPS();
      break;
      default:
        break;
    }
    this.drawCursor();

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