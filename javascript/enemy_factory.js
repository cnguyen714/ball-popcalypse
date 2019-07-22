
import Vector from "./Vector";
import EnemyCircle from './EnemyCircle';

const MAP = {
  TOP: 0,
  LEFT: 1,
  BOTTOM: 2,
  RIGHT: 3,
}

// const SPAWN_OFFSET = 20;
const BASE_TURN_RATE = 0.25;

export const randomEdgePos = (canvas, radius) => {
  let side = Math.floor(Math.random() * 4);

  let pos = { x: Math.random() * canvas.width,
              y: Math.random() * canvas.height };

  switch(side) {
    case MAP.TOP:
      pos.y = -radius;
      break;
    case MAP.LEFT:
      pos.x = -radius;
      break;
    case MAP.BOTTOM:
      pos.y = canvas.height + radius;
      break;
    case MAP.RIGHT:
      pos.x = canvas.width + radius;
      break;
  }

  return pos;
}

const makeBoss = function() {
  return Math.floor(Math.random() * 1000) % 100 === 0;
}

export const spawnCircleRandom = (player) => {
  let enemy = new EnemyCircle(player.game);  

  if (makeBoss()) {
    enemy.r = 50 + Math.random() * 50;
    if (player.game.state === "STATE_OVER") enemy.r *= 1 + Math.random() * 4;
    enemy.accel = 0.2;
    enemy.maxSpeed = 0.5;
    enemy.health = 10000;
    enemy.damage = 50;
    enemy.score = 100;
  }

  enemy.accel = 0.5 + Math.random() * Math.pow(player.game.difficulty, 1 / 2);
  enemy.maxSpeed = 1.5 + Math.random() * Math.pow(player.game.difficulty, 1 / 2);

  let spawnPos = randomEdgePos(player.cvs, enemy.r);
  enemy.pos.x = spawnPos.x;
  enemy.pos.y = spawnPos.y;
  
  enemy.aiCallback = function() {
    this.aim = Vector.difference(player.pos, this.pos).normalize();
    let turnRate = BASE_TURN_RATE + Math.pow(player.game.difficulty, 1/2);
    this.aim.multiply(turnRate).add(this.vel).normalize();

    this.vel.add(this.aim.multiply(this.accel));
  };

  return enemy;
}

