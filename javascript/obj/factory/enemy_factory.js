
import Vector from "../../lib/Vector";
import EnemyCircle from '../EnemyCircle';
import LargeEnemyCircle from "../LargeEnemyCircle";
import RangedEnemy from "../RangedEnemy";
import DashingEnemy from "../DashingEnemy";

const MAP = {
  TOP: 0,
  LEFT: 1,
  BOTTOM: 2,
  RIGHT: 3,
}

// const SPAWN_OFFSET = 20;
const BASE_TURN_RATE = 0.25;
const BOSS_SPAWN_RATE = 20;
const RANGED_SPAWN_RATE = 70;
const DASH_SPAWN_RATE = 120;

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

export const spawnCircleRandom = (player) => {
  let num = Math.floor(Math.random() * 1000);
  let enemyRate = 0
  let enemy;
  let spawnPos = randomEdgePos(player.cvs, 100);

  if (num <= (enemyRate += BOSS_SPAWN_RATE)) {
    enemy = new LargeEnemyCircle(player.game);
  } else if (num <= (enemyRate += RANGED_SPAWN_RATE)) {
    enemy = new RangedEnemy(player.game);
  } else if (num <= (enemyRate += DASH_SPAWN_RATE)) {
    enemy = new DashingEnemy(player.game, {pos: {x: spawnPos.x, y: spawnPos.y}});
    // enemy = new DashingEnemy(player.game);
  } else {
    enemy = new EnemyCircle(player.game);
  }

  enemy.pos.x = spawnPos.x;
  enemy.pos.y = spawnPos.y;

  return enemy;
}

