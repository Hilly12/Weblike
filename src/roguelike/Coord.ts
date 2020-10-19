import Utils from "./Utils";

class Coord {
  public x: number;
  public y: number;

  public constructor(hPos: number, vPos: number) {
    this.x = hPos;
    this.y = vPos;
  }

  public equals(other: Coord): boolean {
    return this.x === other.x && this.y === other.y;
  }

  public getRelativePos(playerPos: Coord) {
    const relX = this.x - playerPos.x + Math.floor(Utils.get().visibleMapWidth / 2);
    const relY = this.y - playerPos.y + Math.floor(Utils.get().visibleMapHeight / 2);
    return new Coord(relX, relY);
  }

  public isVisible(playerPos: Coord) {
    const vw = Utils.get().visibleMapWidth;
    const vh = Utils.get().visibleMapHeight;
    const rel = this.getRelativePos(playerPos);
    return (-1 <= rel.x && rel.x < vw + 1 && -1 <= rel.y && rel.y < vh + 1);
  }

  public isIn(coords: Coord[]) {
    for (let i = 0; i < coords.length; i++) {
      if (coords[i].equals(this))
        return true;
    }
    return false;
  }

  public left(): Coord {
    return new Coord(this.x - 1, this.y)
  }

  public right(): Coord {
    return new Coord(this.x + 1, this.y)
  }

  public up(): Coord {
    return new Coord(this.x, this.y - 1)
  }

  public down(): Coord {
    return new Coord(this.x, this.y + 1)
  }

  public static areAdjacent(a: Coord, b: Coord): boolean {
    return !((Math.abs(a.x - b.x) !== 1 || a.y !== b.y) && (a.x !== b.x || Math.abs(a.y - b.y) !== 1));
  }

  public static distanceSquared(a: Coord, b: Coord): number {
    return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
  }
}

export default Coord;