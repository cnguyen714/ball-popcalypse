
import Player from './Player';
import Particle from './Particle';
import Vector from './Vector';
import * as ParticleFactory from './particle_factory';
import * as EnemyFactory from './enemy_factory';
import Slam from './Slam'; 
import Beam from './Beam'; 
import Explosion from "./Explosion";
import GameObject from './GameObject';
import SlashSpark from './SlashSpark';


// My laptop has a performance limit of around 700 particles
// Delta time is implemented by accelerating movement to perceive less
// lag, however the game still runs slower



/*
Access this on localhost:8000 by running both:
npm start
python -m SimpleHTTPServer

===

To-do:

- Impact frame? Flash white ==> black on beam shadow / etcs
- Style Score box
- Sword sound/ Beam sound

*/

const PATH = document.URL.substr(0, document.URL.lastIndexOf('/'));
const STATE_INIT = "STATE_INIT";
const STATE_BEGIN = "STATE_BEGIN";
const STATE_RUNNING = "STATE_RUNNING";
const STATE_OVER = "STATE_OVER";

const FPS = 60;
const NORMAL_TIME_DELTA = 1000 / FPS;
const MIN_FRAME_RATE = 50; // Limits enemy production to save frames

const BASE_SPAWN_RATE = 4; // 5
const DIFFICULTY_START = 1;
const DIFFICULTY_INTERVAL = 400;
const DIFFICULTY_MULTIPLIER = 0.05;
const DIFFICULTY_RATE = 4;

const STARTING_HEALTH = 250;

const MUTE = new Image(50,50);
MUTE.src = `${PATH}/assets/mute.png`;
const VOL = new Image(50, 50);
VOL.src = `${PATH}/assets/volume.png`;
const WASD = new Image();
WASD.src = `${PATH}/assets/WASD.png`;
const LEFT_MOUSE_ICON = new Image();
LEFT_MOUSE_ICON.src = `${PATH}/assets/left.png`;
const RIGHT_MOUSE_ICON = new Image();
RIGHT_MOUSE_ICON.src = `${PATH}/assets/right.png`;
const SPACEBAR_ICON = new Image();
SPACEBAR_ICON.src = `${PATH}/assets/spacebar.png`;

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
    this.mute = false;
    this.filePath = PATH;

    this.timeTracker = (new Date).getTime() + NORMAL_TIME_DELTA;
    this.prevTime = (new Date).getTime();

    this.state = STATE_INIT;

    this.defeatSfx = new Audio(`${PATH}/assets/DEFEATED.wav`);
    this.enemyDeathSfx = new Audio(`${PATH}/assets/boom2.wav`);
    this.playerShootSfx = new Audio(`${PATH}/assets/laser7.wav`);
    this.playerSlashSfx = new Audio(`${PATH}/assets/SE_00064.wav`);
    this.playerBeamSfx = new Audio(`${PATH}/assets/SE_00049.wav`);
    this.playerChargeSfx = new Audio(`${PATH}/assets/SE_00016.wav`);
    this.bgm = new Audio(`${PATH}/assets/305_Battlefield_-_Swords_Bursting.mp3`);
    this.bgm.loop = true;

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
    this.delayedParticles = [];
    this.vanity = [];
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
    startGameMenu.alpha = 0;
    startGameMenu.draw = function () {
      this.aliveTime--;
      this.ctx.save();
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(0, this.cvs.height / 2 - this.cvs.height / 8 * (60 - this.aliveTime) / 60, this.cvs.width, this.cvs.height / 4 * (60 - this.aliveTime) / 60);
      if (this.aliveTime <= 0) {
        if (this.alpha < 1) this.alpha += 0.3;
        this.aliveTime = 0;
        let xOffset = this.cvs.width / 2;
        let yOffset = this.cvs.height - 250;
        this.ctx.textAlign = 'center';

        this.ctx.fillStyle = `rgba(0,128,128,${this.alpha})`;
        this.ctx.font = `${this.cvs.height / 8}px sans-serif`;
        // this.ctx.fillText(`Ball-popcalypse`, this.cvs.width * 0.4 / 16, this.cvs.height * 17/32 );
        this.ctx.fillText(`Ball-popcalypse`, this.cvs.width / 2, this.cvs.height * 17/32 );
        this.ctx.fillStyle = `rgba(128,128,128,${this.alpha})`;
        this.ctx.font = `${this.cvs.height / 32}px sans-serif`;
        this.ctx.fillText(`How long can you survive the ball menace?`, this.cvs.width / 2, this.cvs.height * 19/32 );

        this.ctx.fillStyle = "white";
        this.ctx.font = '20px sans-serif';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = 'black';

        this.ctx.drawImage(WASD, xOffset -= 350, yOffset + 40, 180, 150);
        this.ctx.fillText(`Movement`, xOffset + 85, yOffset + 30);
        this.ctx.drawImage(LEFT_MOUSE_ICON, xOffset += 200, yOffset + 3, 200, 180);
        this.ctx.fillText(`Slash`, xOffset + 100, yOffset + 30);
        this.ctx.drawImage(RIGHT_MOUSE_ICON, xOffset += 200, yOffset + 33, 120, 150);
        this.ctx.fillText(`Blaster`, xOffset + 50, yOffset + 30);
        this.ctx.drawImage(SPACEBAR_ICON, xOffset += 200, yOffset + 73, 200, 80);
        this.ctx.fillText(`Cannon`, xOffset + 90, yOffset + 30);
        this.ctx.fillText(`Spacebar`, xOffset + 65, yOffset + 110);
      }
      this.ctx.restore();
    }
    
    this.menus.push(startGameMenu);
    this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
    this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
    this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
    this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
    this.entities.push(EnemyFactory.spawnCircleRandom(this.player));

    this.bgm.pause();
  }

  startGame() {
    this.loopCount = 0;
    this.state = STATE_RUNNING;
    this.menus = [];
    this.entities = [];
    this.vanity = [];
    this.player.alive = true;
    this.player.maxHealth = STARTING_HEALTH;
    this.player.health = STARTING_HEALTH;
    this.particles.push(new Slam(game, this.player.pos.x, this.player.pos.y));
    this.playSound(this.bgm, 0.4);
    this.bgm.currentTime = 0;
  }

  endGame() {
    this.state = STATE_OVER;
    this.freeze(10);
    this.player.alive = false;
    this.player.color = 'black'; 
    this.playSound(this.defeatSfx, 0.2);

    let explode1 = new Slam(game, this.player.pos.x, this.player.pos.y);
    explode1.color = 'white';
    explode1.knockback = 200;
    explode1.damage = 0;
    explode1.r = 310;
    this.particles.push(explode1);
    let explode2 = new Slam(game, this.player.pos.x, this.player.pos.y);
    explode2.color = 'gray';
    explode2.knockback = 0;
    explode2.damage = 50;
    explode2.r = 300;
    this.particles.push(explode2);
    let explode3 = new Slam(game, this.player.pos.x, this.player.pos.y);
    explode3.color = 'black';
    explode3.knockback = 0; 
    explode3.damage = 1000;
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
      if (this.state === STATE_OVER) this.menus.push(endGameMenu);
    }
    drawEnd = drawEnd.bind(this);
    setTimeout(drawEnd, 2000);
  }

  restartGame() {
    this.init();
  }

  playSound(sound, vol = 1) {
    if (this.mute) return;
    sound.volume = vol;
    sound.play();
  }

  playSoundMany(path, vol = 1) {
    if (this.mute) return;
    let sound = new Audio(path);
    sound.volume = vol;
    sound.play();
  }

  // Freezes the entire game state for n frames
  // Typically use this for hitstop
  freeze(n) {
    this.pauseTime = n;
    this.vanity.forEach(entity => entity.paused = true);
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
        this.players.forEach(entity => entity.update());
        this.entities.forEach(entity => entity.update());
        this.particles.forEach(entity => entity.update());
        break;

      case STATE_RUNNING:

        if (this.pauseTime === 0) {
          this.vanity.forEach(entity => entity.paused = false);
          this.particles = this.particles.concat(this.delayedParticles);
          this.delayedParticles = [];
        }

        if (this.pauseTime > 0) {
          this.vanity = this.vanity.filter(entity => entity.alive);
          this.vanity.filter(entity => !entity.paused).forEach(entity => entity.update());
        } else {
          if (this.loopCount % DIFFICULTY_INTERVAL === 0) {
            this.difficulty *= 1 + DIFFICULTY_MULTIPLIER * DIFFICULTY_RATE;
          }

          // Generate enemies -
          // Stop making enemies if you miss too many frame deadlines, also keep generating enemies if the FPS drop was to player using beam
          let spawnRate = 20 - Math.floor(this.difficulty);
          spawnRate = spawnRate <= 1 ? 1 : spawnRate;
          if (this.loopCount % (BASE_SPAWN_RATE + spawnRate) === 0 && (this.fps >= MIN_FRAME_RATE || this.player.beamCooldown > 0) && this.loopCount > 60) {
            this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
          }

          // Handle enemy death
          let soundLimit = 3;
          let soundCount = 0;
          this.entities.filter(entity => !entity.alive).forEach(entity => {
            if (soundCount <= soundLimit) {
              this.playSoundMany(`${PATH}/assets/boom2.wav`, 0.3);
              soundCount++;
            }
            this.vanity.push(new Explosion(game, entity.pos.x, entity.pos.y, entity.r, entity.vel))

            this.difficulty += 0.002 * this.difficultyRate;
            this.score += entity.score;
            this.player.charge++;
          });

          // Handle updates
          this.player.update();
          this.vanity = this.vanity.filter(entity => entity.alive);
          this.vanity.forEach(entity => entity.update());
          this.entities = this.entities.filter(entity => entity.alive);
          this.entities.forEach(entity => entity.update());
          this.particles.filter(entity => !entity.alive).forEach(entity => {
            if (entity instanceof Particle && !(entity instanceof Beam)) {
              let hitspark = new Slam(this, entity.pos.x, entity.pos.y);
              hitspark.aliveTime = 4;
              hitspark.growthRate = 1;
              hitspark.r = 1;
              hitspark.damage = 0;
              this.vanity.push(hitspark);
            }
          });
          this.particles = this.particles.filter(entity => entity.alive);
          this.particles.forEach(entity => entity.update());

          if (this.player.health <= 0) this.endGame();
        }
        break;

      case STATE_OVER:
        if (this.pauseTime > 0) return;

        // this.player.update();

        // if (this.loopCount % (Math.floor(SPAWN_RATE * 1.5)) === 0) {
        if (this.loopCount % 2 === 0) {
          this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
          // if (this.fps <= MIN_FRAME_RATE - 5) this.entities[0].alive = false;          
        }
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

        this.vanity = this.vanity.filter(entity => entity.alive);
        this.vanity.forEach(entity => entity.update());

        // this.restartGame();
        break;
      default:
        break;
    }
  }

  // Draw player reticle at mouse position
  drawCursor() {
    let cursorSize = 15;
    this.ctx.save();
    this.ctx.beginPath();
    // this.ctx.arc(this.player.mousePos.x, this.player.mousePos.y, 4, 0, 2 * Math.PI);
    // this.ctx.fillStyle = "rgba(0,0,0,0)";
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 4;
    this.ctx.shadowBlur = 2;
    this.ctx.shadowColor = 'white';
    this.ctx.moveTo(this.player.mousePos.x - cursorSize - this.player.dashCooldown / 2, this.player.mousePos.y);
    this.ctx.lineTo(this.player.mousePos.x + cursorSize + this.player.dashCooldown / 2, this.player.mousePos.y);
    this.ctx.moveTo(this.player.mousePos.x, this.player.mousePos.y - cursorSize - this.player.dashCooldown / 2);
    this.ctx.lineTo(this.player.mousePos.x, this.player.mousePos.y + cursorSize + this.player.dashCooldown / 2);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.beginPath();
    cursorSize = 14;
    this.ctx.shadowBlur = 0;
    this.ctx.lineWidth = 2;
    if (this.player.charge >= this.player.chargeMax * 2) {
      this.ctx.strokeStyle = "lightblue";
    } else if (this.player.charge >= this.player.chargeMax) {
      this.ctx.strokeStyle = "red";
    } else {
      this.ctx.strokeStyle = "yellow";
    }
    this.ctx.moveTo(this.player.mousePos.x - cursorSize - this.player.dashCooldown / 2, this.player.mousePos.y);
    this.ctx.lineTo(this.player.mousePos.x + cursorSize + this.player.dashCooldown / 2, this.player.mousePos.y);
    this.ctx.moveTo(this.player.mousePos.x, this.player.mousePos.y - cursorSize - this.player.dashCooldown / 2);
    this.ctx.lineTo(this.player.mousePos.x, this.player.mousePos.y + cursorSize + this.player.dashCooldown / 2);
    this.ctx.stroke();
    
    this.ctx.font = '20px sans-serif';
    this.ctx.fillStyle = 'white';

    // === DEBUG SHOW ANGLE
    // let angle = Math.atan2(this.player.aim.y, this.player.aim.x);
    // this.ctx.fillText(`Angle: ${angle / Math.PI * 180}`, this.player.mousePos.x, this.player.mousePos.y);

    // this.ctx.fillRect(this.player.mousePos.x + 3, this.player.mousePos.y + 3, this.player.dashCooldown, 3);

    this.ctx.restore();
  }

  drawFPS() {
    this.ctx.save();
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px sans-serif';
    this.ctx.shadowBlur = 2;
    this.ctx.shadowColor = 'black';
    let xOffset = this.cvs.width - 55;
    let yOffset = 70;
    this.ctx.fillText(`FPS: ${this.fps}`, xOffset, yOffset += 20);
    this.ctx.fillText(`obj: ${this.particles.length + this.entities.length + this.vanity.length}`, xOffset, yOffset += 20);

    this.ctx.restore();
  }

  drawUI() {
    this.ctx.save();
    this.ctx.font = '20px sans-serif';
    this.ctx.fillStyle = 'white';
    this.ctx.shadowBlur = 2;
    this.ctx.shadowColor = 'black';
    let xOffset = 10;
    let yOffset = 2;

    this.ctx.fillText(`Score: ${this.score}`, xOffset, yOffset += 20);
    this.ctx.fillText(`Highscore: ${this.highscore}`, xOffset, yOffset += 20);
    this.ctx.fillText(`Time: ${this.timeSeconds}`, xOffset, yOffset += 20);
    this.ctx.fillText(`Difficulty: ${this.difficulty.toFixed(2)}`, xOffset, yOffset += 20);
    this.ctx.restore();
    this.drawFPS();
  }

  drawVolControls() {
    this.ctx.save();
    if (this.mute) {
      this.ctx.drawImage(MUTE, this.cvs.width - 83, 15, 54, 54);
    } else {
      this.ctx.drawImage(VOL, this.cvs.width - 80, 10);
    }
    this.ctx.restore();
  }

  drawHealth() {
    this.ctx.save();
    this.ctx.font = '20px sans-serif';
    let xOffset = this.cvs.width / 2
    let yOffset = this.cvs.height - 82;
    // this.ctx.fillStyle = `rgba(${21 + ((this.player.maxHealth - this.player.health) / this.player.maxHealth) * 70},21,21)`;
    // this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
    this.ctx.fillStyle = `rgba(${50 - (this.player.health / this.player.maxHealth * 200)},${100 + this.player.health / this.player.maxHealth * 100},0)`;
    this.ctx.fillRect(xOffset - this.player.health / 2, yOffset, this.player.health, 20);
    this.ctx.fillStyle = 'white';
    this.ctx.shadowBlur = 3;
    this.ctx.shadowColor = 'black';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${this.player.health}`, xOffset, yOffset + 17);
    this.ctx.restore();
  }

  drawChargeBar() {
    let xOffset = this.cvs.width / 2;

    this.ctx.save();
    this.ctx.textAlign = 'center';
    if (this.player.charge >= this.player.chargeMax) {

      this.ctx.fillStyle = this.loopCount % 7 === 0 ? 'white' : "red";
      this.ctx.fillRect(xOffset - this.player.chargeMax * 2, this.cvs.height - 57, this.player.chargeMax * 4, 4);
      if (this.player.beamCooldown === 0) {
        this.ctx.font = '12px sans-serif';
        if (this.player.chargeMax * 2 <= this.player.charge) {
          this.ctx.fillStyle = this.loopCount % 7 === 0 ? 'white' : "darkblue";
          this.ctx.font = '14px sans-serif';
          this.vanity.push(new SlashSpark(this, xOffset - this.player.chargeMax * 2 + (Math.random() * 2 * this.player.chargeMax) * 2, this.cvs.height - 57, -3, 1, 10));
          this.ctx.shadowBlur = 2;
          this.ctx.shadowColor = 'black';
          this.ctx.fillStyle = this.loopCount % 7 === 0 ? 'darkblue' : 'yellow';
          this.ctx.fillText(`OVERCHARGE!!`, xOffset, this.cvs.height - 40);
        } else {
          this.ctx.shadowBlur = 2;
          this.ctx.shadowColor = 'black';
          this.ctx.fillText(`READY!!`, xOffset, this.cvs.height - 40);
        }
      }
      this.ctx.fillStyle = this.loopCount % 7 === 0 ? 'white' : "darkblue";
      let charge = this.player.charge < this.player.chargeMax * 2 ? this.player.charge % this.player.chargeMax : this.player.chargeMax;
      this.ctx.fillRect(xOffset - charge * 2, this.cvs.height - 59, charge * 4, 6);
    } else {
      this.ctx.fillStyle = "olive";
      this.ctx.fillRect(xOffset - this.player.chargeMax * 2, this.cvs.height - 57, this.player.charge * 4, 4);
      this.ctx.fillRect(xOffset - this.player.chargeMax * 2, this.cvs.height - 58, 2, 6);
      this.ctx.fillRect(xOffset + this.player.chargeMax * 2, this.cvs.height - 58, 2, 6);
      if (this.player.beamCooldown === 0) {
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = 'black';

        this.ctx.fillStyle = "yellow";
        this.ctx.font = '17px sans-serif';
        this.ctx.clearRect(xOffset - 12, this.cvs.height - 57, 24, 6);
        this.ctx.fillText(`${this.player.charge}`, xOffset, this.cvs.height - 47);
        this.ctx.fillStyle = "olive";
        this.ctx.font = '12px sans-serif';
        this.ctx.fillText(`/${this.player.chargeMax}`, xOffset + 20, this.cvs.height - 41);
      }
    }
    if (this.player.beamCooldown > 0) {
      this.ctx.fillStyle = this.loopCount % 5 === 0 ? 'white' : "lightblue";
      this.ctx.fillRect(xOffset - this.player.beamCooldown * 2, this.cvs.height - 60, this.player.beamCooldown * 4, 8);
      this.ctx.font = '13px sans-serif';
      this.ctx.shadowBlur = 2;
      this.ctx.shadowColor = 'black';
      this.ctx.fillText(`!!! COOLDOWN !!!`, xOffset, this.cvs.height - 40);
    }
    this.ctx.restore();
  }

  drawFreeze() {
    this.ctx.save();
    this.ctx.fillStyle = `rgba(0,0,0,${this.pauseTime / 10})`;
    this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
    this.ctx.restore();
  }

  draw() {
    // Resize canvas to window every frame
    this.ctx.canvas.width = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;

    switch (this.state) {
      case STATE_INIT:
        break;

      case STATE_BEGIN:
        this.particles.forEach(entity => entity.draw());
        // this.player.draw();
        this.entities.forEach(entity => entity.draw());
        this.menus.forEach(entity => entity.draw());
        break;

      case STATE_RUNNING:
        // Handle drawing of all game objects
        this.drawFreeze();;
        this.particles.forEach(entity => entity.draw());
        this.menus.forEach(entity => entity.draw());
        this.entities.forEach(entity => entity.draw());

        this.drawChargeBar();
        this.vanity.forEach(entity => entity.draw());
        this.player.draw();

        this.drawUI();
        this.drawHealth();
        break;

      case STATE_OVER:
        this.drawFreeze(); 

        this.entities.forEach(entity => entity.draw());
        this.particles.forEach(entity => entity.draw());
        this.vanity.forEach(entity => entity.draw());
        this.player.draw();
        this.menus.forEach(entity => entity.draw());
        this.drawFPS();
      break;
      default:
        break;
    }
    this.drawCursor();
    this.drawVolControls();
  }

  loop() {
    let time = (new Date).getTime();
    this.timeDelta = time - this.prevTime;
    
    if (this.timeDelta < NORMAL_TIME_DELTA * 0.90) {

    } else {
      if (this.pauseTime > 0) this.pauseTime--;
      this.prevTime = time;
      this.update();
      this.draw();
      this.fpsCount++;
    }

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