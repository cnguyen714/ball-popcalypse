import Vector from "../lib/Vector";
import Trig from "../lib/Trig";
import Player from './Player';
import GameObject from "./GameObject";
import Explosion from "./Explosion";
import EnemyCircle from "./EnemyCircle";
import followPlayerAI from "./behavior/FollowPlayerAI";
import Star from "./Star";
import Emitter from "./Emitter";

const COLOR = "#b62942";
const HEALTH = 6000;
const HEALTH_CAP = 10000;

const BASE_TURN_RATE = 0.1;
const ACCEL = 1.2;
const MAX_SPEED = 3;
const DAMAGE = 20;
const SCORE = 20;
const CHARGE_REWARD = 1;
// const KEEPAWAY_RANGE = 650;
const SPAWN_RATE = 12;
const LAUNCH_SPEED = 100;

class EnemyCarrier extends EnemyCircle {
  constructor(game, props) {
    super(game, props);
    this.direction = 1;
    this.aggroRange = this.cvs.height / 4 + Math.random() * 300;
    this.aiCallback = () => {
      this.aim = Vector.difference(game.player.pos, this.pos);
      let distance = this.aim.length();
      this.aim.normalize();
      let turnRate = BASE_TURN_RATE + Math.pow(game.difficulty, 1 / 3);
      let adjustedAim = this.aim.dup().multiply(turnRate).add(this.vel).normalize();

      if (distance >= this.aggroRange || !game.player.alive) {
        this.vel.add(adjustedAim.multiply(this.accel));
      } else {
        this.vel.add(adjustedAim.multiply(-this.accel * 1.2));
        this.vel.add(this.aim.dup().multiply(-this.accel * 1.2));
      }
      this.vel.add(Trig.rotateByDegree(this.aim.multiply(-this.accel), this.direction * 90));

      if(this.game.loopCount % SPAWN_RATE === 0) {
        let angle = Trig.rotateByDegree(Vector.difference(game.player.pos, this.pos), 90 - Math.random() * 180).normalize();
        let spawnX = this.pos.x + angle.x * (this.r + 10);
        let spawnY = this.pos.y + angle.y * (this.r + 10);
        let drone = new EnemyCircle(this.game, { pos: { x: spawnX, y: spawnY}});
        drone.vel = angle.dup().multiply(LAUNCH_SPEED);
        this.game.entities.push(drone);

        let star = new Star(this, {
          pos: new Vector(spawnX, spawnY),
          length: 20,
          width: 8,
          aliveTime: 25,
          expandRate: 1.05,
          thinningRate: 0.65,
          color: [200, 41, 66],
        });
        this.game.vanity.push(star);

        let dust = new Emitter(game, {
          pos: { x: spawnX, y: spawnY },
          r: 6,
          aim: angle.dup(),
          aliveTime: 20,
          emitCount: 4,
          emitSpeed: 2,
          ejectSpeed: 6,
          impulseVariance: 0.15,
          fanDegree: 10,
          color: "rgba(200, 41, 66, 1)",
        });
        this.game.vanity.push(dust);
        let explosion = new Explosion(game, spawnX, spawnY, drone.r );
        explosion.color = "rgba(200, 41, 66, 1)";
        explosion.aliveTime = 3;
        this.game.vanity.push(explosion);

      }
    };

    this.r = 75;
    if (this.game.state === "STATE_OVER") this.r *= 1 + Math.random() * 4;

    if (Math.floor(Math.random() * 5) % 3 === 0) {
      this.accel = ACCEL + Math.random() * Math.pow(this.game.difficulty, 1 / 2);
      this.maxSpeed = MAX_SPEED + Math.random() * Math.pow(this.game.difficulty, 1 / 2);
    } else {
      this.accel = ACCEL / 2;
      this.maxSpeed = MAX_SPEED;
    }

    this.health = HEALTH + this.r * 150;

    if (this.health > HEALTH_CAP) this.health = HEALTH_CAP;

    this.color = COLOR;
    this.damage = DAMAGE;
    this.chargeReward = CHARGE_REWARD;
    this.score = SCORE + this.r * 2;

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  validateBound(rectX, rectY) {
    if (this.game.state !== "STATE_RUNNING") return;
    let r = 0;
    if (this.pos.x + r > rectX) {
      this.pos.x = rectX - r;
      this.direction *= -1;
    }
    if (this.pos.y + r > rectY) {
      this.pos.y = rectY - r;
      this.direction *= -1;
    }
    if (this.pos.x - r < 0) {
      this.pos.x = r;
      this.direction *= -1;
    }
    if (this.pos.y - r < 0) {
      this.pos.y = r;
      this.direction *= -1;
    }
  }

  checkCollision(obj) {
    if (!obj.alive) return;

    if (obj instanceof Player) {
      if (this.checkAndHitPlayer(obj)) {
        this.game.freeze(5);

      }
    } else if (obj instanceof EnemyCircle) {
      this.checkAndSpreadEnemy(obj);
    }
  }

  update() {
    if (!this.alive) return;
    this.aiCallback();
    this.dampSpeed();
    this.addVelocityTimeDelta();
    this.validateBound(this.cvs.width, this.cvs.height);

    // Check collision with player
    this.checkCollision(this.game.players[0]);

    // Many-many collision is very heavy - please refactor at some point or implement quadtree
    this.game.entities.forEach(entity => this.checkCollision(entity));
  }

}

export default EnemyCarrier;