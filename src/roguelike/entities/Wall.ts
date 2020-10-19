import Entity from "./Entity";
import Coord from "../Coord";

class Wall extends Entity {
  public readonly orientation : number;

  public constructor(pos : Coord, orientation : number) {
    super(pos);
    this.orientation = orientation;
  }
}

export default Wall;
