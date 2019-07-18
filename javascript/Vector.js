
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    if (v instanceof Vector) {
      this.x += v.x;
      this.y += v.y;
    } else {
      this.x += v; 
      this.y += v; 
    }
    return this;
  }

  subtract(v) {
    if (v instanceof Vector) {
      this.x -= v.x;
      this.y -= v.y;
    } else {
      this.x -= v; 
      this.y -= v; 
    }
    return this;
  }
  multiply(v) {
    if (v instanceof Vector) {
      this.x *= v.x;
      this.y *= v.y;
    } else {
      this.x *= v; 
      this.y *= v; 
    }
    return this;
  }
  divide(v) {
    if (v instanceof Vector) {
      if(v.x !== 0) this.x /= v.x;
      if(v.y !== 0) this.y /= v.y;
    } else {
      if(v !== 0) {
        this.x /= v; 
        this.y /= v; 
      }
    }
    return this;
  }

  equals(v) {
    return this.x === v.x && this.y === v.y;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  length() {
    return Math.sqrt(this.dot(this));
  }

  normalize() {
    return this.divide(this.length());
  }
}

export default Vector;