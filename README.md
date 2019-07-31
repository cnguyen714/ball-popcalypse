# Ball-popcalypse

[Link to Live](http://ball-ocolypse.herokuapp.com/)

## Background and Overview

Ball-ocolypse (or Ball-Apocolypse, if you will) is a "zombie"-horde survival game using a top-down perspective with twin-stick controls, where the player attempts to get a high-score and avoid being swarmed. 

The goal is to have the game be a physics sandbox that has satisfying interactions. All non-decorative game entities have some collision or other physical interaction, which relies heavily on vector math to handle these emergent interactions. 

![](https://github.com/cnguyen714/ball-ocolypse/blob/master/docs/gameplay.png?raw=true)

## Architectures and Technologies
The project uses the following technologies:
* Vanilla Javascript for game running the game loop and logic
* HTML5 Canvas for rendering
* Webpack for bundling the Javascript 

## Features

### Game loop
This game is built around the HTML5 Canvas `requestAnimationFrame` loop, where we specify our loop function as a callback. We can construct our game loop by first updating our game state, then drawing it as the canvas requests a new animation frame. Due to this game loop, all interactable objects in the game have a method `update()` and `draw()`, and we must call these methods. This being the case, we store similar objects into arrays to easily call these methods. If objects are not being used, we can simply filter them out of our array by keeping an `alive` property on each of our objects.

```javascript
// javascript/Game.js
update() {
  // ...
  switch(this.state) {
    // ...
    case STATE_RUNNING:
      // ...
      this.player.update();
      this.entities = this.entities.filter(entity => entity.alive);
      this.entities.forEach(entity => entity.update());
      this.particles = this.particles.filter(entity => entity.alive);
      this.particles.forEach(entity => entity.update());
      if(this.player.health <= 0) {
        this.endGame();
      }
      break;
// ...
  }
}

draw() {
  // ...
  switch(this.state) {
    // ...
    case STATE_RUNNING:
      this.particles.forEach(entity => entity.draw());
      this.player.draw();
      this.entities.forEach(entity => entity.draw());
      this.menus.forEach(entity => entity.draw());
//...
  }
}
```

## Movement and Physics
Physics in the game are handled by storing all things that have `x` and `y` components as a `Vector`. At its core, we use three `Vector` methods to perform most of our calculations for collisions: `difference()`, `length()`, and `normalize()`.
```javascript 
// javascript/Vector.js
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  static difference(v1, v2) {
    let newV = new Vector(1, 1).multiply(v1);
    return newV.subtract(v2);
  }
  length() {
    return Math.sqrt(this.dot(this));
  }
  normalize() {
    // let that = new Vector(this.x, this.y);
    // return that.divide(this.length());
    return this.divide(this.length());
  }
  // ...
}
```
The underpinning of the Vectors is that we can normalize the difference in position between two points (eg, the player and the enemy) to calculate a unit vector. This unit vector essentially represents a direction, which is very versatile; you can multiply it by a magnitude to represent force! You can apply this force to an objects velocity to get a combination of an objects current direction and the force vector. To prevent things from moving too fast, we can normalize this new vector then multiply it by a number of our choosing. 

## Collision

Collision in this game is done by checking if the distance between objects is less than the sum of their radii. For example, an enemy object will check its collision against the player in its update function:
```javascript
// javascript/EnemyCircle.js
  update() {
    if (!this.alive) return;
    this.aiCallback();

    this.dampSpeed();
    this.addVelocityTimeDelta();

    this.checkCollision(this.game.player);
    this.game.entities.forEach(entity => this.checkCollision(entity));
  }

  checkCollision(obj) {
    if (!obj.alive) return;
    let diff = Vector.difference(this.pos, obj.pos);
    let distSqr = diff.dot(diff);
    if(obj instanceof Player) {
      if (obj.moveState === "STATE_DASHING" || obj.invul > 0) return;
      if (this.r * this.r + obj.r * obj.r > distSqr) {
        let sound = new Audio("../assets/impact.wav");
        sound.play();
        let explosion = new Explosion(game, obj.pos.x + diff.x / 2, obj.pos.y + diff.y / 2, this.r * 2);
        explosion.color = 'red';
        explosion.aliveTime = 5;
        obj.game.particles.push(explosion);

        diff.normalize();
        diff.multiply(KNOCKBACK);
        obj.vel.subtract(diff.dup().multiply(this.r / RADIUS));
        this.vel.add(diff.multiply(ENEMY_KNOCKBACK_MULTIPLIER));
        obj.health -= this.damage;
      }
    } // ... 
```
Distance is calculated using the pythagorean theorem `c = sqrt(a^2 + b^2)`. In this implementation, we instead square the distance and compare it to the sum of the square of the radii. This is to avoid using a costly square root operation. This collision check will execute all of our interactions, such as: applying knockback, playing sound, generating new objects, and damaging the player.


## Enemy Movement

To keep things reusable, we separate the enemy movement logic into a method called `aiCallback()` that can be assigned. It is called at the start of the `update()` method. 

```javascript
// javascript/enemy_factory.js
  enemy.aiCallback = function() {
    this.aim = Vector.difference(player.pos, this.pos).normalize();
    let turnRate = BASE_TURN_RATE + Math.pow(player.game.difficulty, 1/2);
    this.aim.multiply(turnRate).add(this.vel).normalize();

    this.vel.add(this.aim.multiply(this.accel));
  };
```

This method calculates a direction vector towards the player and changes the direction of the enemy object by a fraction according to a set turn rate. We give this method to all enemies, allowing them to track the player. We set up their turn rate to be fairly poor as to give the player some leeway to escape their clutches.

## Future Features

* Efficient collision detection (perhaps Quadtree implementation), instead of brute-force many-to-many collision checks
* Additional player abilities
* Additional enemy types
* Mute sound, link to github/linkedIn

#### Secret Keybinds
While game is in play you may press:
* Minus Sign - Add health
* Equal Sign - Add difficulty
* Backspace - End the game
