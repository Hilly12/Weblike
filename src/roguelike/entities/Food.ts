import Entity from "./Entity";
import Coord from "../Coord";

class Food extends Entity {
  public static seed : number = 0;
  public readonly ref : number;

  public constructor(pos : Coord) {
    super(pos);
    this.ref = Food.seed;
    Food.seed++;
  }
}

export default Food;
