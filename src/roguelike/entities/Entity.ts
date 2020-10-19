import Coord from "../Coord";

abstract class Entity {
  protected pos: Coord;

  protected constructor(pos: Coord) {
    this.pos = pos;
  }

  public getPos(): Coord {
    return this.pos;
  }

  public setPos(newPos: Coord) {
    this.pos = newPos;
  }
}

export default Entity;