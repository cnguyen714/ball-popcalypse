import Vector from "../lib/Vector";

class Trig {
  
  // where 0 is the positive x-axis, going clockwise;
  static getVectorfromDegrees(degrees) {
    let angle = degrees / 180 * Math.PI;
    
   return new Vector(Math.sin(angle), Math.cos(angle));
  }

  static rotateByDegree(vector, degrees) {
    let angle = Math.atan2(vector.y, vector.x);
    let length = vector.length();

    angle += degrees / 180 * Math.PI;

    return (new Vector(Math.sin(angle), Math.cos(angle)).multiply(length));
  }
}

export default Trig;