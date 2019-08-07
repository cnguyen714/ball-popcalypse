
import Particle from "./Particle";
import Beam from "./Beam";
import Vector from "./Vector";

const BULLET_SPEED = 15;
const BULLET_SPREAD = 0.10;

export const fireBulletAtCursor = (player) => {
  let p = new Particle(player.game);
  p.pos.x = player.pos.x;
  p.pos.y = player.pos.y;
  p.color = "#14ffec";

  let aim = new Vector(1, 1);
  aim.multiply(player.aim);
  aim.normalize();
  aim.x += Math.random() * (BULLET_SPREAD + BULLET_SPREAD) - BULLET_SPREAD;
  aim.y += Math.random() * (BULLET_SPREAD + BULLET_SPREAD) - BULLET_SPREAD;
  aim.normalize();
  p.vel = aim.multiply(BULLET_SPEED * (1 - BULLET_SPREAD ) + BULLET_SPREAD / 2 + Math.random() * BULLET_SPREAD);
  return p;
}

export const fireBulletAtCursorB = (player) => {
  let p = new Particle(player.game);
  p.pos.x = player.pos.x;
  p.pos.y = player.pos.y;
  p.color = 'orange';

  let aim = new Vector(1, 1);
  aim.multiply(player.aim);
  aim.normalize();
  aim.x += Math.random() * (BULLET_SPREAD + BULLET_SPREAD) - BULLET_SPREAD;
  aim.y += Math.random() * (BULLET_SPREAD + BULLET_SPREAD) - BULLET_SPREAD;
  aim.normalize();
  p.vel = aim.multiply(BULLET_SPEED);
  return p;
}

export const fireBeamAtCursor = (player) => {
  let p = new Beam(player.game);
  p.pos.x = player.pos.x;
  p.pos.y = player.pos.y;
  p.color = player.color;

  let aim = new Vector(1, 1);
  aim.multiply(player.aim);
  aim.normalize();
  p.aim = aim;
  
  return p;
}