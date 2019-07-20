
import Vector from "./Vector";
import EnemyCircle from './EnemyCircle';

const MAP = {
  TOP: 0,
  LEFT: 1,
  BOTTOM: 2,
  RIGHT: 3,
}

const SPAWN_OFFSET = 20;

export const randomEdgePos = (canvas) => {
  let side = Math.floor(Math.random() * 4);

  let pos = { x: Math.random() * canvas.width,
              y: Math.random() * canvas.height };

  switch(side) {
    case MAP.TOP:
      pos.y = -SPAWN_OFFSET;
      break;
    case MAP.LEFT:
      pos.x = -SPAWN_OFFSET;
      break;
    case MAP.BOTTOM:
      pos.y = canvas.height + SPAWN_OFFSET;
      break;
    case MAP.RIGHT:
      pos.x = canvas.width + SPAWN_OFFSET;
      break;
  }

  return pos;
}

export const spawnCircleRandom = (player) => {
  let enemy = new EnemyCircle(player.game);
  let spawnPos = randomEdgePos(player.cvs);
  enemy.pos.x = spawnPos.x;
  enemy.pos.y = spawnPos.y;
  enemy.accel = 0.5 + Math.random() * player.game.difficulty / 2;
  enemy.maxSpeed = 1.5 + Math.random() * player.game.difficulty / 2;

  enemy.aiCallback = function() {
    this.aim = Vector.difference(player.pos, this.pos).normalize();

    this.vel.add(this.aim.multiply(this.accel));
  };

  return enemy;
}

