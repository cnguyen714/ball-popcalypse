
import Vector from "../lib/Vector";

const COLOR = 'black';
const RADIUS = 3;
const MAX_HEALTH = 100;


// May be inefficient to create new position vectors all the time
class GameObject {
  constructor(game) {
    this.game = game;
    this.cvs = game.cvs;
    this.ctx = game.ctx;
    this.pos = new Vector();
    this.vel = new Vector();
    this.aim = new Vector();
    this.alive = true;
    this.pauseTime = 0;
    this.paused = true;
    this.unpausable = false;
    this.silenced = false;

    this.maxHealth = MAX_HEALTH;
    this.health = MAX_HEALTH;

    this.radius = RADIUS;
    this.color = COLOR;
    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
  }

  validatePosition(rectX, rectY) {
  }

  update() {
  }

  // ctx.arc(x, y, r, sAngle, eAngle, [counterclockwise])
  draw() {
  }
  // Multiply velocity by the fractional difference in timeDelta
  // Does not skip frames, but gives the illusion of same speed
  addVelocityTimeDelta() {
    this.pos.add(this.vel.dup().multiply(this.game.timeDelta / this.game.normalTimeDelta));
  }
}

export default GameObject;