
import Particle from "../Particle";
import Beam from "../Beam";
import Vector from "../../lib/Vector";
import Trig from "../../lib/Trig";

const BULLET_SPEED = 20;
const BULLET_SPREAD = 0.12;

export const fireBulletAtCursor = (player) => {
  let p = new Particle(player.game);
  p.pos.x = player.pos.x;
  p.pos.y = player.pos.y;
  p.color = "#14ffec";

  let aim = new Vector(1, 1);
  aim.multiply(player.aim);
  aim.normalize();
  aim.x += Math.random() * (BULLET_SPREAD * 2) - BULLET_SPREAD;
  aim.y += Math.random() * (BULLET_SPREAD * 2) - BULLET_SPREAD;
  aim.normalize();
  p.vel = aim.multiply(BULLET_SPEED * (1 - BULLET_SPREAD ) + BULLET_SPREAD / 2 + Math.random() * BULLET_SPREAD);
  p.pos.add(aim.dup().normalize().multiply(-1 * Math.random() * 10));
  player.game.particles.push(p);
}

export const fireBulletAtCursorB = (player) => {
  let p = new Particle(player.game);
  p.pos.x = player.pos.x;
  p.pos.y = player.pos.y;
  p.color = 'orange';
  p.damage = 25;
  p.r = 3;

  let aim = new Vector(1, 1);
  let spread = BULLET_SPREAD / 2;
  aim.multiply(player.aim);
  aim.normalize();
  aim.x += Math.random() * (spread * 2) - spread;
  aim.y += Math.random() * (spread * 2) - spread;
  aim.normalize();
  p.vel = aim.multiply(BULLET_SPEED * 1.3 * (1 - spread) + spread / 2 + Math.random() * spread);
  p.pos.add(aim.dup().normalize().multiply(-1 * Math.random() * 50));
  player.game.particles.push(p);
}

export const fireBeamAtCursor = (player) => {
  let p = new Beam(player.game, {pos: player.pos});
  p.color = player.color;

  let aim = new Vector(1, 1);
  let offset = Trig.rotateByDegree(player.aim.dup(), 90);
  aim.multiply(player.aim);
  aim.normalize();
  p.aim = aim;
  
  return p;
}

