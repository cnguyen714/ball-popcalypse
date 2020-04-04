
import Vector from './lib/Vector';
import Player from './obj/Player';
import Particle from './obj/Particle';
import * as ParticleFactory from './obj/factory/particle_factory';
import * as EnemyFactory from './obj/factory/enemy_factory';
import Slam from './obj/Slam'; 
import Beam from './obj/Beam'; 
import Explosion from "./obj/Explosion";
import GameObject from './obj/GameObject';
import SlashSpark from './obj/SlashSpark';
import BufferLoader from './lib/BufferLoader';
import DeathExplosion from './obj/DeathExplosion';
import Emitter from "./obj/Emitter";
import Star from "./obj/Star";

// My laptop has a performance limit of around 700 particles
// Delta time is implemented by accelerating movement to perceive less
// lag, however the game still runs slower

/*
Access this on localhost:8000 by running both:
npm start
python -m SimpleHTTPServer
OR
py -m http.server

===

To-do:

Use obj destructuring to clean up obj constructor
Use Web Audio Context to vary pitch/playback speed on sounds like Melee

*/

const PATH = document.URL.substr(0, document.URL.lastIndexOf('/'));
const STATE_INIT = "STATE_INIT";
const STATE_BEGIN = "STATE_BEGIN";
const STATE_STARTING = "STATE_STARTING";
const STATE_RUNNING = "STATE_RUNNING";
const STATE_OVER = "STATE_OVER";

const FPS = 60;
const NORMAL_TIME_DELTA = 1000 / FPS;
const MIN_FRAME_RATE = 40; // Limits enemy production to save frames

const BASE_SPAWN_RATE = 4; // 5
const SPAWN_LOCKOUT_TIME = 60; // 5
const DIFFICULTY_START = 5;
const DIFFICULTY_INTERVAL = 70;
const DIFFICULTY_MULTIPLIER = 0.010;
const DIFFICULTY_GROWTH = 0.1;
const DIFFICULTY_RATE = 1;
const MAX_DIFFICULTY = 100;

const LINKED_IN_ICON = new Image();
LINKED_IN_ICON.src = `${PATH}/assets/iconfinder_square-linkedin_317725.png`;
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
    this.STATE_STARTING = STATE_STARTING;
    this.STATE_RUNNING = STATE_RUNNING;
    this.STATE_OVER = STATE_OVER;
    this.cvs = cvs;
    this.ctx = ctx;
    this.highscore = 0;
    this.score = 0;
    this.pauseTime = 0;
    this.mute = false;
    this.filePath = PATH;
    this.assetsLoaded = false;
    this.cheat = false;

    this.timeTracker = (new Date).getTime() + NORMAL_TIME_DELTA;
    this.prevTime = (new Date).getTime();

    this.state = STATE_INIT;

    // preload audio
    this.defeatSfx = new Audio(`${PATH}/assets/DEFEATED.wav`);
    this.enemyDeathSfx = new Audio(`${PATH}/assets/boom2.wav`);
    this.playerShootSfx = new Audio(`${PATH}/assets/laser7.wav`);
    this.playerSlashSfx = new Audio(`${PATH}/assets/SE_00064.wav`);
    this.playerBeamSfx = new Audio(`${PATH}/assets/SE_00049.wav`);
    this.playerChargeSfx = new Audio(`${PATH}/assets/SE_00016.wav`);
    this.playerChargeFollowSfx = new Audio(`${PATH}/assets/SE_00049.wav`);
    this.enemyResistSlashSfx = new Audio(`${PATH}/assets/SE_00017.wav`);
    this.enemyHitSfx = new Audio(`${PATH}/assets/impact.wav`);
    this.spawnSfx = new Audio(`${PATH}/assets/spawn.mp3`);

    // this.bgm = new Audio(`${PATH}/assets/305_Battlefield_-_Swords_Bursting.mp3`);
    // this.bgm.loop = true;

    this.init = this.init.bind(this);
    this.loop = this.loop.bind(this);
  }

  initAudio() {
    var bufferLoader;
    let game = this;

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();

    bufferLoader = new BufferLoader(
      this.audioContext,
      [
        `${PATH}/assets/DEFEATED.wav`,
        `${PATH}/assets/boom2.wav`,
        `${PATH}/assets/laser7.wav`,
        `${PATH}/assets/SE_00064.wav`,
        `${PATH}/assets/SE_00049.wav`,
        `${PATH}/assets/SE_00016.wav`,
        `${PATH}/assets/SE_00049.wav`,
        `${PATH}/assets/SE_00017.wav`,
        `${PATH}/assets/impact.wav`,
        `${PATH}/assets/305_Battlefield_-_Swords_Bursting.mp3`,
        `${PATH}/assets/Retro Vehicle Motor 02.wav`,
        `${PATH}/assets/spawn.mp3`
      ],
      finishedLoading
    );

    bufferLoader.load();
    this.audioBuffer = bufferLoader;

    function finishedLoading(bufferList) {

      game.AUDIO_BUFFERS = {
        defeatSfx: bufferList[0],
        enemyDeathSfx: bufferList[1],
        playerShootSfx: bufferList[2],
        playerSlashSfx: bufferList[3],
        playerBeamSfx: bufferList[4],
        playerChargeSfx: bufferList[5],
        playerChargeFollowSfx: bufferList[6],
        enemyResistSlashSfx: bufferList[7],
        enemyHitSfx: bufferList[8],
        bgm: bufferList[9],
        preDefeatSfx: bufferList[10],
        spawnSfx: bufferList[11],
      }
      game.bgm = createAudio(game, game.AUDIO_BUFFERS.bgm, 0.7);
      game.bgm.loop = true;
      game.preDefeatSfx = createAudio(game, game.AUDIO_BUFFERS.preDefeatSfx, 1.5);
      // game.bgm.sourceNode.loop = true;
      // game.bgm.gainNode.gain.value = 0.4;
      // let source0 = context.createBufferSource();
      // let source1 = context.createBufferSource();
      // let source2 = context.createBufferSource();
      // let source3 = context.createBufferSource();
      // let source4 = context.createBufferSource();
      // let source5 = context.createBufferSource();
      // let source6 = context.createBufferSource();
      // let source7 = context.createBufferSource();
      // let source8 = context.createBufferSource();
      // let source9 = context.createBufferSource();
      // source0.buffer = bufferList[0];
      // source1.buffer = bufferList[1];
      // source2.buffer = bufferList[2];
      // source3.buffer = bufferList[3];
      // source4.buffer = bufferList[4];
      // source5.buffer = bufferList[5];
      // source6.buffer = bufferList[6];
      // source7.buffer = bufferList[7];
      // source8.buffer = bufferList[8];
      // source9.buffer = bufferList[9];

      // source0.connect(context.destination);
      // source1.connect(context.destination);
      // source2.connect(context.destination);
      // source3.connect(context.destination);
      // source4.connect(context.destination);
      // source5.connect(context.destination);
      // source6.connect(context.destination);
      // source7.connect(context.destination);
      // source8.connect(context.destination);
      // source9.connect(context.destination);
      // source0.start(0);

      // let source0 = context.createBufferSource();
      // source0.buffer = bufferList[0];
      // source0.connect(context.destination);
      // source0.start(0);
      game.assetsLoaded = true;
    }

    function createAudio(game, buffer, vol = 1.0) {
      let context = game.audioContext;
      let obj = {};
      var sourceNode = null,
          gainNode = null,
          startedAt = 0,
          pausedAt = 0,
          playing = false,
          volume = vol,
          loop = false;

      let play = function() {
        if(game.mute) return;
        
        var offset = pausedAt;

        sourceNode = context.createBufferSource();
        if (!context.createGain)
        context.createGain = context.createGainNode;
        gainNode = context.createGain();
        sourceNode.connect(gainNode);
        gainNode.connect(context.destination);
        gainNode.gain.value = volume;
        sourceNode.buffer = buffer;
        sourceNode.start(0, offset);
        sourceNode.loop = loop;

        startedAt = context.currentTime - offset;
        pausedAt = 0;
        playing = true;
      }

      let stop = function() {
        if (sourceNode) {
          sourceNode.disconnect();
          sourceNode.stop(0);
          sourceNode = null;
        }
        pausedAt = 0;
        startedAt = 0;
        playing = false;
      }

      let pause = function () {
        let elapsed = context.currentTime - startedAt;
        stop();
        pausedAt = elapsed;
      };

      return {
        sourceNode: sourceNode,
        gainNode: gainNode,
        play: play,
        pause: pause,
        stop: stop,
        loop: loop,
        playing: playing,
      };
    }
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
    this.enemyParticles = [];
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
    startGameMenu.aliveTime = 40;
    startGameMenu.intialTime = startGameMenu.aliveTime;
    startGameMenu.time = this.timeSeconds;
    startGameMenu.difficulty = this.difficulty;
    startGameMenu.alpha = 0.01;
    startGameMenu.draw = function () {
      this.aliveTime--;
      this.ctx.save();
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(0, this.cvs.height / 2 - this.cvs.height / 8 * (startGameMenu.intialTime - this.aliveTime) / startGameMenu.intialTime, this.cvs.width, this.cvs.height / 4 * (startGameMenu.intialTime - this.aliveTime) / startGameMenu.intialTime);
      if (this.aliveTime <= 0) {
        if (this.alpha < 1) this.alpha *= 1.10;
        this.aliveTime = 0;
        let xOffset = this.cvs.width / 2;
        let yOffset = this.cvs.height - 250;
        this.ctx.textAlign = 'center';

        this.ctx.fillStyle = `rgba(0,128,128,${this.alpha})`;
        this.ctx.font = `${this.cvs.height / 8}px sans-serif`;
        this.ctx.fillText(`Ball-popcalypse`, this.cvs.width / 2, this.cvs.height * 17/32 );
        this.ctx.fillStyle = `rgba(128,128,128,${this.alpha})`;
        this.ctx.font = `${this.cvs.height / 32}px sans-serif`;
        this.ctx.fillText(`How long can you survive the ball menace?`, this.cvs.width / 2, this.cvs.height * 19/32 );

        this.ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;;
        this.ctx.font = '20px sans-serif';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = 'black';
        
        this.ctx.fillText(`Press a key or mousebutton to start`, xOffset , yOffset);
        this.ctx.drawImage(SPACEBAR_ICON, xOffset -= 465  , yOffset + 145, 90, 60);
        this.ctx.fillText(`Shift`, xOffset + 30, yOffset + 175);
        this.ctx.drawImage(WASD, xOffset += 90, yOffset + 60, 180, 130);
        this.ctx.fillText(`Movement`, xOffset + 85, yOffset + 210);
        this.ctx.drawImage(LEFT_MOUSE_ICON, xOffset += 190, yOffset + 13, 200, 180);
        this.ctx.fillText(`Slash`, xOffset + 100, yOffset + 210);
        this.ctx.drawImage(RIGHT_MOUSE_ICON, xOffset += 190, yOffset + 43, 120, 150);
        this.ctx.fillText(`Burst / [Gatling]`, xOffset + 55, yOffset + 210);
        this.ctx.drawImage(SPACEBAR_ICON, xOffset += 170, yOffset + 113, 200, 75);
        this.ctx.fillText(`Cannon`, xOffset + 90, yOffset + 210);
        this.ctx.fillText(`Spacebar`, xOffset + 65, yOffset + 150);

        this.ctx.drawImage(LINKED_IN_ICON, 10, 10, 80, 80);
      }
      this.ctx.restore();
    }
    
    this.menus.push(startGameMenu);
    this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
    this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
    this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
    this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
    this.entities.push(EnemyFactory.spawnCircleRandom(this.player));

    if (this.bgm) {
      this.bgm.stop();
    }
  }

  transitionToStartGame() {
    this.state = STATE_STARTING;
    let overlay = new GameObject(game);

    overlay.pos.x = 0,
    overlay.pos.y = 0;
    overlay.height = this.cvs.height;
    overlay.width = this.cvs.width;
    overlay.alpha = 1;
    overlay.aliveTime = 12;
    overlay.intialTime = overlay.aliveTime;

    overlay.draw = function () {
      this.aliveTime--;
      this.pos.x = -this.width * 2 + this.width * 2 * Math.pow((this.intialTime - this.aliveTime) / this.intialTime, 2);
      this.ctx.save();
      this.ctx.fillStyle = `rgba(188,188,188,${this.alpha})`;
      this.ctx.rotate(Math.PI / 12);
      this.ctx.fillRect(this.pos.x, this.pos.y - this.height * 0.5, this.width * 2, this.height * 2);
      this.ctx.restore();

      // if(this.aliveTime <= 1) this.aliveTime = 1;
      if(this.aliveTime === this.intialTime - 10) {
        let overlay2 = new GameObject(game);
        overlay2.pos.x = 0,
        overlay2.pos.y = 0;
        overlay2.height = this.cvs.height;
        overlay2.width = this.cvs.width;
        overlay2.alpha = 1;
        overlay2.aliveTime = 5;
        overlay2.intialTime = overlay2.aliveTime;
        overlay2.draw = function () {
          this.aliveTime--;
          this.pos.x = -this.width * 2 + this.width * 2 * Math.pow((this.intialTime - this.aliveTime) / this.intialTime, 2);
          this.ctx.save();
          this.ctx.fillStyle = `rgba(88,88,88,${this.alpha})`;
          this.ctx.rotate(Math.PI / 12);
          this.ctx.fillRect(this.pos.x, this.pos.y - this.height * 0.5, this.width * 2, this.height * 2);
          this.ctx.restore();

          if (this.aliveTime <= 0) this.game.startGame();
        }
        this.game.menus.push(overlay2);
        this.game.playSound(this.game.spawnSfx, 0.6);
      }
    }
    this.menus.push(overlay);
  }

  startGame() {
    if (!this.assetsLoaded) return;
    this.loopCount = 0;
    this.state = STATE_RUNNING;
    this.menus = [];
    this.entities = [];
    this.enemyParticles = [];
    this.vanity = [];
    this.player.alive = true;
    this.player.heal();
    // this.playSound(this.bgm, 0.4);
    this.cheat = false;
    this.bgm.play();

    let overlay = new GameObject(game);
    overlay.pos.x = 0,
    overlay.pos.y = 0;
    overlay.height = this.cvs.height;
    overlay.width = this.cvs.width;
    overlay.alpha = 1;
    overlay.aliveTime = 8;
    overlay.intialTime = overlay.aliveTime;
    overlay.draw = function () {
      this.aliveTime--;
      this.pos.x = this.width * 2 * Math.pow((this.intialTime - this.aliveTime) / this.intialTime, 2);
      this.ctx.save();
      this.ctx.fillStyle = `rgba(88,88,88,${this.alpha})`;
      this.ctx.rotate(Math.PI / 12);
      this.ctx.fillRect(this.pos.x, this.pos.y - this.height * 0.5, this.width * 2, this.height * 2);
      this.ctx.restore();

      if (this.aliveTime <= 0) this.alive = false;
    }

    this.menus.push(overlay);

    let startEmit = new Emitter(this, {
      pos: { x: this.player.pos.x, y: this.player.pos.y },
      r: 6,
      aliveTime: 120,
      emitCount: 96,
      emitSpeed: 16,
      ejectSpeed: 8,
      decayRate: 0.94,
      impulseVariance: 0.9,
      color: "rgba(0, 205, 205,1)",
      cb: function() { this.vel.y -= 0.15; this.vel.x += 0.05 },
    });

    this.vanity.push(startEmit);
    this.particles.push(new Slam(game, this.player.pos.x, this.player.pos.y));
  }

  endGame() {
    this.state = STATE_OVER;
    this.freeze(90);
    this.player.alive = false;
    this.player.dashCooldown = 0;

    let deathExplosion = new DeathExplosion(game);
    deathExplosion.unpausable = true;
    deathExplosion.paused = false;
    this.vanity.push(deathExplosion);
    this.preDefeatSfx.play();
    let slam = new Slam(game, this.player.pos.x, this.player.pos.y);
    slam.aliveTime -= 11;
    this.particles.push(slam);

    this.entities.forEach(entity => {
      let diff = Vector.difference(this.player.pos, entity.pos).normalize();

      entity.vel.add(diff.multiply(4));
      let hitEmit = new Emitter(this, {
        pos: { x: entity.pos.x, y: entity.pos.y },
        r: entity.r + 1,
        aim: diff.normalize().multiply(-1),
        emitCount: 4,
        emitSpeed: 4,
        ejectSpeed: 10,
        impulseVariance: 0.5,
        fanDegree: 15,
        aliveTime: 20,
        decayRate: 0.8,
        lengthForward: 20,
      });
      this.vanity.push(hitEmit);
    });

    let postDeath = function() {
      let explode1 = new Slam(game, this.player.pos.x, this.player.pos.y);
      explode1.color = 'white';
      explode1.knockback = 100;
      explode1.damage = 10;
      explode1.r = 310;
      this.particles.push(explode1);
      let explode2 = new Slam(game, this.player.pos.x, this.player.pos.y);
      explode2.color = 'gray';
      explode2.knockback = 0;
      explode2.damage = 40;
      explode2.r = 300;
      this.particles.push(explode2);
      let explode3 = new Slam(game, this.player.pos.x, this.player.pos.y);
      explode3.color = 'black';
      explode3.knockback = 0; 
      explode3.damage = 999999;
      explode3.r = 100;
      this.particles.push(explode3);
      this.preDefeatSfx.stop();
      this.player.color = 'black'; 

      let endEmit = new Emitter(this, {
        pos: { x: this.player.pos.x, y: this.player.pos.y },
        r: 5,
        aim: new Vector(1,0),
        aliveTime: 90,
        emitCount: 150,
        emitSpeed: 15,
        ejectSpeed: 20,
        impulseVariance: 0.95,
        fanDegree: 180,
        decayRate: 0.9,
        color: "rgba(0, 205, 205,1)",
      });

      this.vanity.push(endEmit);

      this.playSound(this.defeatSfx, 0.2);
    }

    postDeath = postDeath.bind(this);
    setTimeout(postDeath, 1500);

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
          
          this.ctx.fillText(`Score: ${this.game.score}`, this.cvs.width / 2 - 70, this.cvs.height / 2 - 40);
          this.ctx.fillText(`Highscore: ${this.game.highscore}`, this.cvs.width / 2 - 70, this.cvs.height / 2 - 20 );
          this.ctx.fillText(`Time: ${this.time}`, this.cvs.width / 2 - 70, this.cvs.height / 2 );
          this.ctx.fillText(`Difficulty: ${this.difficulty.toFixed(2)}`, this.cvs.width / 2 - 70, this.cvs.height / 2 + 20);
          this.ctx.textAlign = 'center';

          this.ctx.fillText(`Press [Enter] to restart`, this.cvs.width / 2,  this.cvs.height / 2 + 80);

          this.ctx.textAlign = 'right';

          this.ctx.fillText("♪♪  Yuzo Koshiro - 7th Dragon OST || Battlefield - Swords Bursting (Retro Ver.)", this.cvs.width - 20, this.cvs.height - 20);
        }
        this.ctx.restore();
      }
      if (this.state === STATE_OVER) this.menus.push(endGameMenu);
    }
    drawEnd = drawEnd.bind(this);
    setTimeout(drawEnd, 3500);
  }

  restartGame() {
    this.init();
  }

  playSound(sound, vol = 1) {
    if (this.mute) return;

    sound.volume = vol;
    sound.play();
  }

  playAudio(audio, vol = 1.0, loop = false) {
    if (this.mute) return;

    let source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer.bufferList[audio];
    let gainNode = this.audioContext.createGain();
    source.connect(gainNode);
    
    gainNode.connect(this.audioContext.destination);
    gainNode.gain.value = vol;
    source.loop = loop;
    source.start(0);
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
    this.vanity.forEach(entity => {
      if (entity.unpausable) {
        entity.paused = false;
      } else {
        entity.paused = true;
      }
    });
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

      case STATE_STARTING:
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
          // charging effects before firing a beam
          
          for (let i = 0; i < 1; i++) {
            let length = 400;
            let thickness = 40;
            let spread = 100;
            let aliveTime = 60;
            let expandRate = 1.3;
            let thinningRate = 0.5;
            if (this.player.charging && this.loopCount % 10 === 0) {
              let star1 = new Star(this, {
                pos: { x: this.player.pos.x, y: this.player.pos.y},
                length: length,
                width: thickness,
                spread: spread,
                aliveTime: aliveTime,
                expandRate: expandRate,
                thinningRate: thinningRate,
                color: Beam.COLOR().CANNON,
              });
              this.vanity.push(star1);
              this.playSoundMany(`${this.filePath}/assets/SE_00016.wav`, 0.2);
            }

            if (this.player.charging && (this.loopCount + 5) % 10 === 0) {
              let star2 = new Star(this, {
                pos: { x: this.player.pos.x, y: this.player.pos.y},
                length: length,
                width: thickness,
                spread: spread,
                aliveTime: aliveTime,
                expandRate: expandRate,
                thinningRate: thinningRate,
                color: Beam.COLOR().TEAL,
              });
              this.vanity.push(star2);
              this.playSoundMany(`${this.filePath}/assets/SE_00016.wav`, 0.2);
            }

            for (let i = 0; i < 1; i++) {
              let aim = this.player.aim.dup().normalize().multiply((20 - this.pauseTime) * 120 + 200 * Math.random());
              let length = 70;
              let thickness = 25;
              let spread = 300;
              let aliveTime = 35;
              let expandRate = 1.05;
              let thinningRate = 0.65;
              if (this.player.charging) {
                let star3 = new Star(this, {
                  pos: { x: this.player.pos.x + aim.x, y: this.player.pos.y + aim.y },
                  length: length,
                  width: thickness,
                  spread: spread,
                  aliveTime: aliveTime,
                  expandRate: expandRate,
                  thinningRate: thinningRate,
                  color: Beam.COLOR().CANNON,
                });
                this.vanity.push(star3);

                let star4 = new Star(this, {
                  pos: { x: this.player.pos.x + aim.x, y: this.player.pos.y + aim.y },
                  length: length,
                  width: thickness,
                  spread: spread,
                  aliveTime: aliveTime,
                  expandRate: expandRate,
                  thinningRate: thinningRate,
                  color: Beam.COLOR().TEAL,
                });
                this.vanity.push(star4);
              }
            }

          }

          this.vanity = this.vanity.filter(entity => entity.alive);
          this.vanity.filter(entity => !entity.paused).forEach(entity => entity.update());
        } else {
          if (this.loopCount % DIFFICULTY_INTERVAL === 0) {
            this.difficulty += DIFFICULTY_GROWTH;
            this.difficulty *= 1 + DIFFICULTY_MULTIPLIER * this.difficultyRate;
          }
          if (this.difficulty > MAX_DIFFICULTY) this.difficulty = MAX_DIFFICULTY;

          // Generate enemies -
          // Throttle making enemies if you miss too many frame deadlines, also keep generating enemies if the FPS drop was to player using beam
          let spawnRate = 20 - Math.floor(this.difficulty);
          spawnRate = spawnRate <= 1 ? 1 : spawnRate;
          if (this.loopCount % Math.floor((BASE_SPAWN_RATE + spawnRate) * (this.fps >= MIN_FRAME_RATE ? 1 : 2) || this.loopCount % 30 === 0) === 0 && this.pauseTime === 0 && this.loopCount > SPAWN_LOCKOUT_TIME) {
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
            this.vanity.push(new Explosion(game, entity.pos.x, entity.pos.y, entity.r * 1.5, entity.vel))

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
          this.particles = this.particles.filter(entity => entity.alive);
          this.particles.forEach(entity => entity.update());
          this.enemyParticles = this.enemyParticles.filter(entity => entity.alive);
          this.enemyParticles.forEach(entity => entity.update());
          this.menus = this.menus.filter(entity => entity.alive);
          this.menus.forEach(entity => entity.update());

          if (this.player.health <= 0) this.endGame();
        }
        break;

      case STATE_OVER:
        if (this.pauseTime > 0) {
          this.vanity = this.vanity.filter(entity => entity.alive);
          this.vanity.filter(entity => !entity.paused).forEach(entity => entity.update());
          return;
        }

        // Add cosmetic "suction effect"        
        let randDir = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
        let randPos = randDir.dup().multiply(400);
        let line = new Beam(this, {
          pos: { x: this.player.pos.x + randPos.x, y: this.player.pos.y + randPos.y }, 
          aim: randDir,
          active: false,
        });
        line.width = 20;
        line.length = 4000;
        line.knockback = 0;
        line.silenced = true;
        line.unpausable = true;
        line.aliveTime = 60;
        line.color = Beam.COLOR().TEAL;
        line.cb = function () {
          this.length *= 0.85;
          this.width *= 0.7;
          this.pos.subtract(randDir.multiply(1.5));
        }
        this.vanity.push(line);
        
        // if (this.loopCount % (Math.floor(SPAWN_RATE * 1.5)) === 0) {
        if (this.loopCount % (2) === 0 && (this.fps >= MIN_FRAME_RATE - 10)) {
          this.entities.push(EnemyFactory.spawnCircleRandom(this.player));
        }
        if (this.loopCount % 2 === 0) {
          this.particles.push(new DeathExplosion(game, 40, 50, 0, "BLACKHOLE"));
          // if (this.fps <= MIN_FRAME_RATE - 5) this.entities[0].alive = false;
        }
        this.entities.forEach(entity => {
          let diff = Vector.difference(entity.pos, this.player.pos);
          let distSqr = diff.dot(diff);

          if (entity.r * entity.r + this.player.r * this.player.r  + 100 > distSqr) {
            entity.alive = false;
          } else {
            entity.r *= 0.996;
            // let dist = Vector.difference(this.player.pos, entity.pos);
            // let length = Math.pow(dist.length, 2);
            // dist = dist.normalize().multiply(length);
            // // entity.vel.x += 1 / dist.x;
            // // entity.vel.y += 1 / dist.y;
          }
        })
        this.entities.filter(entity => !entity.alive).forEach(entity => {
          this.vanity.push(new Explosion(game, entity.pos.x, entity.pos.y, entity.r));
        });
        this.entities = this.entities.filter(entity => entity.alive);
        this.entities.forEach(entity => entity.update());

        this.particles = this.particles.filter(entity => entity.alive);
        this.particles.forEach(entity => entity.update());

        this.enemyParticles = this.enemyParticles.filter(entity => entity.alive);
        this.enemyParticles.forEach(entity => entity.update());

        this.vanity = this.vanity.filter(entity => entity.alive);
        this.vanity.forEach(entity => entity.update());

        this.menus = this.menus.filter(entity => entity.alive);
        this.menus.forEach(entity => entity.update());
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
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 4;
    this.ctx.shadowBlur = 2;
    this.ctx.shadowColor = 'white';
    this.ctx.moveTo(this.player.mousePos.x - cursorSize - this.player.slashCooldown / 2, this.player.mousePos.y);
    this.ctx.lineTo(this.player.mousePos.x + cursorSize + this.player.slashCooldown / 2, this.player.mousePos.y);
    this.ctx.moveTo(this.player.mousePos.x, this.player.mousePos.y - cursorSize - this.player.slashCooldown / 2);
    this.ctx.lineTo(this.player.mousePos.x, this.player.mousePos.y + cursorSize + this.player.slashCooldown / 2);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.beginPath();
    cursorSize = 14;
    this.ctx.shadowBlur = 0;
    this.ctx.lineWidth = 2;
    if (this.player.charge >= this.player.chargeCost * 2) {
      this.ctx.strokeStyle = "lightblue";
    } else if (this.player.charge >= this.player.chargeCost) {
      this.ctx.strokeStyle = "red";
    } else {
      this.ctx.strokeStyle = "yellow";
    }
    this.ctx.moveTo(this.player.mousePos.x - cursorSize - this.player.slashCooldown / 2, this.player.mousePos.y);
    this.ctx.lineTo(this.player.mousePos.x + cursorSize + this.player.slashCooldown / 2, this.player.mousePos.y);
    this.ctx.moveTo(this.player.mousePos.x, this.player.mousePos.y - cursorSize - this.player.slashCooldown / 2);
    this.ctx.lineTo(this.player.mousePos.x, this.player.mousePos.y + cursorSize + this.player.slashCooldown / 2);
    this.ctx.stroke();
    this.ctx.closePath();
    
    this.ctx.font = '20px sans-serif';
    this.ctx.fillStyle = 'white';
    
    // === DEBUG SHOW ANGLE
    // let angle = Math.atan2(this.player.aim.y, this.player.aim.x);
    // this.ctx.fillText(`Angle: ${angle / Math.PI * 180}`, this.player.mousePos.x, this.player.mousePos.y);

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
    this.drawHealth();
    this.drawChargeBar();

    this.ctx.beginPath();
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 0.5;
    this.ctx.moveTo(this.player.pos.x, this.player.pos.y);
    this.ctx.lineTo(this.player.mousePos.x, this.player.mousePos.y);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.restore();
  }

  drawStats() {
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
    let yOffset = this.cvs.height - 86;
    // this.ctx.fillStyle = `rgba(${21 + ((this.player.maxHealth - this.player.health) / this.player.maxHealth) * 70},21,21)`;
    // this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
    this.ctx.fillStyle = `rgba(${50 - (this.player.health / this.player.maxHealth * 200)},${100 + this.player.health / this.player.maxHealth * 100},0)`;
    this.ctx.fillRect(xOffset - this.player.health, yOffset, this.player.health * 2, 24);
    this.ctx.fillStyle = 'white';
    this.ctx.shadowBlur = 3;
    this.ctx.shadowColor = 'black';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${this.player.health}`, xOffset, yOffset + 20);
    this.ctx.restore();
  }

  drawChargeBar() {
    let xOffset = this.cvs.width / 2;

    this.ctx.save();
    this.ctx.textAlign = 'center';
    if (this.player.charge >= this.player.chargeCost) {

      this.ctx.fillStyle = this.loopCount % 7 === 0 ? 'white' : "red";
      this.ctx.fillRect(xOffset - this.player.chargeCost * 2, this.cvs.height - 57, this.player.chargeCost * 4, 4);
      if (this.player.beamCooldown === 0) {
        this.ctx.font = '12px sans-serif';
        if (this.player.chargeCost * 2 <= this.player.charge) {
          this.ctx.fillStyle = this.loopCount % 7 === 0 ? 'white' : "darkblue";
          this.ctx.font = '14px sans-serif';
          // this.vanity.push(new SlashSpark(this, xOffset - this.player.chargeCost * 2 + (Math.random() * 2 * this.player.chargeCost) * 2, this.cvs.height - 57, -3, 1, 10));
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
      let charge = this.player.charge < this.player.chargeCost * 2 ? this.player.charge % this.player.chargeCost : this.player.chargeCost;
      this.ctx.fillRect(xOffset - charge * 2, this.cvs.height - 59, charge * 4, 6);
    } else {
      this.ctx.fillStyle = "olive";
      this.ctx.fillRect(xOffset - this.player.chargeCost * 2, this.cvs.height - 57, this.player.charge * 4, 4);
      this.ctx.fillRect(xOffset - this.player.chargeCost * 2, this.cvs.height - 58, 2, 6);
      this.ctx.fillRect(xOffset + this.player.chargeCost * 2, this.cvs.height - 58, 2, 6);
      if (this.player.beamCooldown === 0) {
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = 'black';

        this.ctx.fillStyle = "yellow";
        this.ctx.font = '17px sans-serif';
        this.ctx.clearRect(xOffset - 12, this.cvs.height - 57, 24, 6);
        this.ctx.fillText(`${this.player.charge}`, xOffset, this.cvs.height - 47);
        this.ctx.fillStyle = "olive";
        this.ctx.font = '12px sans-serif';
        this.ctx.fillText(`/${this.player.chargeCost}`, xOffset + 20, this.cvs.height - 41);
      }
    }
    if (this.player.beamCooldown > 0) {
      this.ctx.fillStyle = this.loopCount % 5 === 0 ? 'white' : "lightblue";
      this.ctx.fillRect(xOffset - this.player.beamCooldown / this.player.beamCooldownMax * this.player.chargeCost * 2, this.cvs.height - 60, this.player.beamCooldown / this.player.beamCooldownMax * this.player.chargeCost * 4, 8);
      this.ctx.font = '13px sans-serif';
      this.ctx.shadowBlur = 2;
      this.ctx.shadowColor = 'black';
      this.ctx.fillText(`!!! COOLDOWN !!!`, xOffset, this.cvs.height - 40);
    }
    this.ctx.restore();
  }

  drawFreeze() {
    this.ctx.save();
    this.ctx.fillStyle = `rgba(15,15,15,${this.pauseTime / 10})`;
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

      case STATE_STARTING:
        this.particles.forEach(entity => entity.draw());
        // this.player.draw();
        this.entities.forEach(entity => entity.draw());
        this.menus.forEach(entity => entity.draw());
        break;
      case STATE_RUNNING:
        // Handle drawing of all game objects
        this.drawFreeze();
        this.entities.forEach(entity => entity.draw());
        this.particles.forEach(entity => entity.draw());
        this.vanity.forEach(entity => entity.draw());
        this.enemyParticles.forEach(entity => entity.draw());
        this.player.draw();
        this.menus.forEach(entity => entity.draw());
        this.drawChargeBar();
        this.drawUI();
        this.drawHealth();
        break;

      case STATE_OVER:
        this.drawFreeze(); 

        this.particles.forEach(entity => entity.draw());
        this.entities.forEach(entity => entity.draw());
        this.vanity.forEach(entity => entity.draw());
        this.enemyParticles.forEach(entity => entity.draw());
        this.player.draw();
        this.menus.forEach(entity => entity.draw());
      break;
      default:
        break;
    }
    this.drawStats();
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