
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

  // Ensure objects do not leave the boundaries defined here.
  validateBound(rectX, rectY) {
    if (this.pos.x + this.r > rectX) this.pos.x = rectX - this.r;
    if (this.pos.y + this.r > rectY) this.pos.y = rectY - this.r;
    if (this.pos.x - this.r < 0) this.pos.x = this.r;
    if (this.pos.y - this.r < 0) this.pos.y = this.r;
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