
class Vector {
  constructor(x = 0, y = 0) {
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

  static difference(v1, v2) {
    let newV = new Vector(1, 1).multiply(v1);
    return newV.subtract(v2);
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

  // WARNING - operation calls divide which will modify this vector
  normalize() {
    // let that = new Vector(this.x, this.y);
    // return that.divide(this.length());
    return this.divide(this.length());
  }
}

export default Vector;