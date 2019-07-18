
import Particle from "./Particle";
import Vector from "./Vector";

const BULLET_SPEED = 10;
const BULLET_SPREAD = 0.05;

export const fireBulletAtCursor = (player) => {
  let p = new Particle(player.game);
  p.x = player.x;
  p.y = player.y;

  let aim = new Vector(1, 1);
  aim.multiply(player.aim);
  aim.normalize();
  aim.x += Math.random() * (BULLET_SPREAD + BULLET_SPREAD) - BULLET_SPREAD;
  aim.y += Math.random() * (BULLET_SPREAD + BULLET_SPREAD) - BULLET_SPREAD;
  aim.normalize();
  p.vel = aim.multiply(BULLET_SPEED);
  return p;
}

