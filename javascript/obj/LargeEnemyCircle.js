
import Vector from "../lib/Vector";
import Player from './Player';
import GameObject from "./GameObject";
import Explosion from "./Explosion";
import EnemyCircle from "./EnemyCircle";
import followPlayerAI from "./behavior/FollowPlayerAI";

const COLOR = "#a64942";
const HEALTH = 6000;
const HEALTH_CAP = 18000;

const BASE_TURN_RATE = 0.25;
const ACCEL = 2;
const MAX_SPEED = 4;
const DAMAGE = 40;

class LargeEnemyCircle extends EnemyCircle {
  constructor(game) {
    super(game);
    this.aiCallback = () => {
      this.aim = Vector.difference(game.player.pos, this.pos).normalize();
      let turnRate = BASE_TURN_RATE + Math.pow(game.difficulty, 1 / 2);
      this.aim.multiply(turnRate).add(this.vel).normalize();

      this.vel.add(this.aim.multiply(this.accel));
    };

    this.r = Math.floor(50 + Math.random() * 50);
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
    this.score = this.r * 2;

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
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
}

export default LargeEnemyCircle;