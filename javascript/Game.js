
import Player from './Player';
import Particle from './Particle';
import Vector from './Vector';
import * as ParticleFactory from './particle_factory';
import * as EnemyFactory from './enemy_factory';
import Slam from './Slam'; 
import Explosion from "./Explosion";
import GameObject from './GameObject';

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

const BASE_SPAWN_RATE = 4; // 5
const DIFFICULTY_START = 1;
const DIFFICULTY_INTERVAL = 400;
const DIFFICULTY_MULTIPLIER = 0.05;
const DIFFICULTY_RATE = 4;

const STARTING_HEALTH = 250;

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

    this.score = 0;
    this.loops = 0;
    this.loopCount = 0;
    this.timeSeconds = 0;
    this.difficulty = DIFFICULTY_START;
    this.difficultyRate = DIFFICULTY_RATE;
    // this.spawnRate = SPAWN_RATE;
    this.fpsCount = 0;
    this.fps = 0;
    this.timeDelta = NORMAL_TIME_DELTA;
    this.normalTimeDelta = NORMAL_TIME_DELTA;
    
    this.players = [];
    this.player = new Player(this);
    this.player.alive = false;
    this.players.push(this.player);
    this.cameraPos = new Vector(this.player.pos.x, this.player.pos.y);
    
    this.entities = [];
    this.particles = [];
    this.menus = [];

    this.player.mountController();
    this.state = STATE_BEGIN;

    let startGameMenu = new GameObject(game);
    startGameMenu.pos.x = 0,
    startGameMenu.pos.y = this.cvs.height / 2;
    startGameMenu.height = 0;
    startGameMenu.width = this.cvs.width;
    startGameMenu.color = "rgba(0,0,0,0.4)";
    startGameMenu.aliveTime = 60;
    startGameMenu.time = this.timeSeconds;
    startGameMenu.difficulty = this.difficulty;
    startGameMenu.draw = function () {
      this.aliveTime--;
      this.ctx.save();
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(0, this.cvs.height / 2 - this.cvs.height / 8 * (60 - this.aliveTime) / 60, this.cvs.width, this.cvs.height / 4 * (60 - this.aliveTime) / 60);
      if (this.aliveTime <= 0) {
        this.aliveTime = 0;
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px sans-serif';
        this.ctx.fillText(`Use the [WASD] keys to move around`, this.cvs.width / 2 - 150, this.cvs.height - 160);
        this.ctx.fillText(`Hold [SHIFT] to move faster`, this.cvs.width / 2 - 150, this.cvs.height - 140);
        this.ctx.fillText(`Use your mouse to aim, hold [LeftClick] to fire bullets`, this.cvs.width / 2 - 150, this.cvs.height - 120);
        this.ctx.fillText(`Tap [RightClick] to dash and push enemies away!`, this.cvs.width / 2 - 150, this.cvs.height - 100);
        this.ctx.fillText(`Press any of these keys to start!`, this.cvs.width / 2 - 150, this.cvs.height - 80);
        this.ctx.fillText(`Highscore: ${this.game.highscore}`, this.cvs.width / 2 - 60, this.cvs.height - 40);

        this.ctx.fillStyle = 'teal';
        this.ctx.font = `${this.cvs.height / 8}px sans-serif`;
        this.ctx.fillText(`Ball-ocolypse.`, this.cvs.width * 0.4 / 16, this.cvs.height * 17/32 );
        this.ctx.fillStyle = 'gray';
        this.ctx.font = `${this.cvs.height / 32}px sans-serif`;
        this.ctx.fillText(`Can you survive the ball menace?`, this.cvs.width * 0.5 / 16, this.cvs.height * 18/32 );
      }
      this.ctx.restore();

    }
    
    this.menus.push(startGameMenu);
    this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
    this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
    this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
    this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
    this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
  }

  startGame() {
    this.loopCount = 0;
    this.state = STATE_RUNNING;
    this.menus = [];
    this.entities = [];
    this.player.alive = true;
    this.player.maxHealth = STARTING_HEALTH;
    this.player.health = STARTING_HEALTH;
    this.particles.push(new Slam(game, this.player.pos.x, this.player.pos.y));

  }

  endGame() {
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

    let drawEnd = function() {
      let endGameMenu = new GameObject(game);
      endGameMenu.pos.x = 0,
      endGameMenu.pos.y = this.cvs.height / 2;
      endGameMenu.height = 0;
      endGameMenu.width = this.cvs.width;
      endGameMenu.color = "rgba(0,0,0,0.5)";
      endGameMenu.aliveTime = 60;
      endGameMenu.time = this.timeSeconds;
      endGameMenu.difficulty = this.difficulty;
      endGameMenu.draw = function() {
        this.aliveTime--;
        this.ctx.save();
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(0, this.cvs.height / 2 - this.cvs.height / 8 * (60 - this.aliveTime) / 60, this.cvs.width, this.cvs.height / 4 * (60 - this.aliveTime) / 60);
        if (this.aliveTime <=0) {
          this.aliveTime = 0;
          this.ctx.fillStyle = 'white';
          this.ctx.font = '20px sans-serif';
          
          this.ctx.fillText(`Score: ${this.game.score}`, this.cvs.width / 2 - 30, this.cvs.height / 2 - 40);
          this.ctx.fillText(`Highscore: ${this.game.highscore}`, this.cvs.width / 2 - 30, this.cvs.height / 2 - 20 );
          this.ctx.fillText(`Time: ${this.time}`, this.cvs.width / 2 - 30, this.cvs.height / 2 );
          this.ctx.fillText(`Difficulty: ${this.difficulty.toFixed(2)}`, this.cvs.width / 2 - 30, this.cvs.height / 2 + 20);
          this.ctx.fillText(`Press [Enter] to restart`, this.cvs.width / 2 - 60, this.cvs.height / 2 + 80);

        }
        this.ctx.restore();        

      }
      this.menus.push(endGameMenu);
    }

    drawEnd = drawEnd.bind(this);
    setTimeout(drawEnd, 2000);

  }

  restartGame() {
    this.init();
  }

  freeze(n) {
    this.pauseTime = n;
  }

  update() {
    this.loopCount++;
    if (this.highscore < this.score) this.highscore = this.score;


    switch(this.state) {
      case STATE_INIT: 
        this.init();
        break;
      case STATE_BEGIN:
        if (this.loopCount % 120 === 0 && this.fps >= MIN_FRAME_RATE && this.loopCount > 60) {
          this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
          if (this.loopCount % 240 === 0) {
            this.player.pos.x = 200 + Math.random() * (this.cvs.width - 200 * 2);
            this.player.pos.y = 200 + Math.random() * (this.cvs.height - 200 * 2);
          }
        }
        this.entities.forEach(entity => entity.update());

        break;
      case STATE_RUNNING:
        if(this.loopCount % DIFFICULTY_INTERVAL === 0) {
          this.difficulty *= 1 + DIFFICULTY_MULTIPLIER * DIFFICULTY_RATE;
        }
        
        this.player.update();
        
        // Stop making enemies if you miss too many frame deadlines
        let spawnRate = 20 - Math.floor(this.difficulty);
        spawnRate = spawnRate <= 1 ? 1 : spawnRate;
        if (this.loopCount % (BASE_SPAWN_RATE + spawnRate)  === 0 && this.fps >= MIN_FRAME_RATE && this.loopCount > 60) {
            this.entities.push(EnemyFactory.spawnCircleRandom(this.player));            
        }
        
        this.entities.filter(entity => !entity.alive).forEach(entity => {
          let sound = new Audio("../assets/boom2.wav");
          sound.play();

          this.particles.push(new Explosion(game, entity.pos.x, entity.pos.y, entity.r))
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
          // if (this.loopCount % 5 === 0) {
          //   let sound = new Audio("../assets/boom2.wav");
          //   sound.play();
          // }
          this.particles.push(new Explosion(game, entity.pos.x, entity.pos.y, entity.r))
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
    let cursorSize = 8;
    this.ctx.save();
    this.ctx.beginPath();
    // this.ctx.arc(this.player.mousePos.x, this.player.mousePos.y, 4, 0, 2 * Math.PI);
    // this.ctx.fillStyle = "rgba(0,0,0,0)";
    this.ctx.strokeStyle = "yellow";
    this.ctx.lineWidth = 2;
    this.ctx.moveTo(this.player.mousePos.x - cursorSize, this.player.mousePos.y);
    this.ctx.lineTo(this.player.mousePos.x + cursorSize, this.player.mousePos.y);
    this.ctx.moveTo(this.player.mousePos.x, this.player.mousePos.y - cursorSize);
    this.ctx.lineTo(this.player.mousePos.x, this.player.mousePos.y + cursorSize);
    this.ctx.stroke();
    this.ctx.restore();
  }


  showFPS() {
    this.ctx.font = '20px sans-serif';
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(`FPS: ${this.fps}`, this.cvs.width - 90, 22);
    this.ctx.fillText(`obj: ${this.particles.length + this.entities.length}`, this.cvs.width - 90, 42);
  }

  draw(timeDelta) {
    this.ctx.canvas.width = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;
    this.showFPS();

    switch (this.state) {
      case STATE_INIT:
        break;
      case STATE_BEGIN:
        this.entities.forEach(entity => entity.draw());
        this.menus.forEach(entity => entity.draw());

        break;
      case STATE_RUNNING:

        this.particles.forEach(entity => entity.draw());
        this.player.draw();
        this.entities.forEach(entity => entity.draw());

        this.ctx.save();
        this.ctx.font = '20px sans-serif';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(`Health: ${this.player.health}`, this.cvs.width / 2, 22);
        this.ctx.fillText(`Score: ${this.score}`, 10, 22);
        this.ctx.fillText(`Highscore: ${this.highscore}`, 10, 42);
        this.ctx.fillText(`Time: ${this.timeSeconds}`, 10, 62);
        this.ctx.fillText(`Difficulty: ${this.difficulty.toFixed(2)}`, 10, 82);
        this.ctx.fillStyle = `rgba(${200 - ( this.player.health / this.player.maxHealth * 200)},${this.player.health / this.player.maxHealth * 120},0)`;
        this.ctx.fillRect(0,0,this.cvs.width * this.player.health / this.player.maxHealth, 4);
        this.ctx.restore();
        break;
      case STATE_OVER:

        this.particles.forEach(entity => entity.draw());
        this.player.draw();
        this.entities.forEach(entity => entity.draw());
        this.menus.forEach(entity => entity.draw());
        
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