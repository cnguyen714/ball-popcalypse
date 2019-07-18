
import Vector from "./Vector";
import EnemyCircle from './EnemyCircle';

const MAP = {
  TOP: "TOP",
  LEFT: "LEFT",
  BOTTOM: "BOTTOM",
  RIGHT: "RIGHT",
}

export const randomSide = () => {
  return Math.floor(Math.random() * 4);
}

export const spawnCircleRandom = (player) => {
  let enemy = new EnemyCircle();

  
  return enemy;
}

